import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { GetBookingsQueryDto } from './dto/get-bookings.dto';
import { BookingsRepository } from './bookings.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { RentType, BookingStatus, Prisma, Booking, InvoiceStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { ApiListResponse, ApiResponse } from 'src/types/api-response.interface';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly repository: BookingsRepository,
    private readonly prisma: PrismaService,
  ) { }

  async create(tenantId: string, dto: CreateBookingDto) {
    try {
      const { roomId, rentType, duration, startDate } = dto;

      // 1. Validate Room
      const room = await this.prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      if (room.status !== 'available') {
        throw new BadRequestException(
          `Cannot book this room because its status is ${room.status}`,
        );
      }

      // 2. Calculate End Date
      const start = new Date(startDate);
      const end = new Date(start);
      if (rentType === RentType.daily) end.setDate(end.getDate() + duration);
      if (rentType === RentType.weekly)
        end.setDate(end.getDate() + duration * 7);
      if (rentType === RentType.monthly)
        end.setMonth(end.getMonth() + duration);
      if (rentType === RentType.yearly)
        end.setFullYear(end.getFullYear() + duration);

      // 3. Check Availability (Prevent Double Booking)
      const overlappingBookings = await this.prisma.booking.findFirst({
        where: {
          roomId,
          status: { not: BookingStatus.cancelled },
          AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
        },
      });

      if (overlappingBookings) {
        throw new BadRequestException(
          'Room is already booked for the selected dates',
        );
      }

      // 4. Calculate Price
      let pricePerUnit: Prisma.Decimal = new Prisma.Decimal(0);
      if (rentType === RentType.daily) {
        if (!room.priceDaily)
          throw new BadRequestException(
            'Daily rent is not available for this room',
          );
        pricePerUnit = room.priceDaily;
      } else if (rentType === RentType.weekly) {
        if (!room.priceWeekly)
          throw new BadRequestException(
            'Weekly rent is not available for this room',
          );
        pricePerUnit = room.priceWeekly;
      } else if (rentType === RentType.monthly) {
        if (!room.priceMonthly)
          throw new BadRequestException(
            'Monthly rent is not available for this room',
          );
        pricePerUnit = room.priceMonthly;
      } else if (rentType === RentType.yearly) {
        if (!room.priceMonthly)
          throw new BadRequestException(
            'Yearly rent is not available for this room',
          );
        pricePerUnit = new Prisma.Decimal(Number(room.priceMonthly) * 12);
      } else {
        throw new BadRequestException('Invalid rent type');
      }

      const totalPrice = new Prisma.Decimal(Number(pricePerUnit) * duration);

      // 5. Calculate Due Date (24 hours from now)
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + 24);

      // 6. Create Booking & Automated Invoice
      const booking = await this.repository.create({
        tenant: { connect: { id: tenantId } },
        room: { connect: { id: roomId } },
        rentType,
        duration,
        startDate: start,
        endDate: end,
        pricePerUnit,
        totalPrice,
        status: BookingStatus.pending_payment,
        invoices: {
          create: {
            totalAmount: totalPrice,
            dueDate: dueDate,
            status: InvoiceStatus.unpaid,
          },
        },
      });

      return {
        status: 201,
        message: 'Booking and Invoice created successfully',
        data: booking,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Log the actual error for debugging internal server errors
      console.error('[BookingsService.create] Error:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to create booking',
      );
    }
  }

  async findAll(
    currentUserId: string,
    currentUserRole: string,
    query?: GetBookingsQueryDto,
  ): Promise<
    ApiListResponse<
      Booking,
      {
        totalItems: number;
        page: number;
        perPage: number;
        totalPages: number;
      }
    >
  > {
    const { page = 1, perPage = 10, status, tenantId, roomId } = query || {};

    const where: Prisma.BookingWhereInput = {};

    // Role-based access control for fetching bookings
    if (currentUserRole === 'tenant') {
      // Tenants can ONLY see their own bookings
      where.tenantId = currentUserId;
    } else {
      // Admins can see all, or filter by specific tenantId
      if (tenantId) where.tenantId = tenantId;
    }

    if (status) where.status = status as BookingStatus;
    if (roomId) where.roomId = roomId;

    const [data, totalItems] = await Promise.all([
      this.repository.findAll({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.repository.count(where),
    ]);

    const totalPages = Math.ceil(totalItems / perPage);

    const meta = {
      totalItems,
      page,
      perPage,
      totalPages,
    };

    return { status: 200, message: 'Bookings fetched', data, meta };
  }

  findOne(id: string) {
    return this.repository.findById(id);
  }

  async approveBooking(id: string) {
    const booking = await this.repository.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.pending_payment) {
      throw new BadRequestException(
        `Cannot approve booking with status ${booking.status}`,
      );
    }

    const updated = await this.repository.update(id, {
      status: BookingStatus.confirmed,
    });

    return {
      status: 200,
      message: 'Booking approved successfully',
      data: updated,
    };
  }

  async rejectBooking(id: string) {
    const booking = await this.repository.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    if (
      booking.status === BookingStatus.cancelled ||
      booking.status === BookingStatus.completed
    ) {
      throw new BadRequestException(
        `Cannot reject booking with status ${booking.status}`,
      );
    }

    const updated = await this.repository.update(id, {
      status: BookingStatus.cancelled,
    });

    return {
      status: 200,
      message: 'Booking rejected and cancelled successfully',
      data: updated,
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handlePendingBookings() {
    this.logger.log('Running cron job to cancel expired pending bookings...');

    // Calculate timestamp for 24 hours ago
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    try {
      const result = await this.prisma.booking.updateMany({
        where: {
          status: BookingStatus.pending_payment,
          createdAt: {
            lt: yesterday,
          },
        },
        data: {
          status: BookingStatus.cancelled,
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `Successfully cancelled ${result.count} expired pending bookings.`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to cancel expired bookings', error);
    }
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Booking not found');
    }

    const roomId = updateBookingDto.roomId || existing.roomId;
    const rentType = updateBookingDto.rentType || existing.rentType;
    const duration = updateBookingDto.duration || existing.duration;
    const startDate = updateBookingDto.startDate || existing.startDate;

    // 1. Validate Room
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if room status is available ONLY IF we are changing the room
    if (roomId !== existing.roomId && room.status !== 'available') {
      throw new BadRequestException(
        `Cannot change to this room because its status is ${room.status}`,
      );
    }

    // 2. Calculate New End Date
    const start = new Date(startDate);
    const end = new Date(start);
    if (rentType === RentType.daily) end.setDate(end.getDate() + duration);
    if (rentType === RentType.weekly) end.setDate(end.getDate() + duration * 7);
    if (rentType === RentType.monthly) end.setMonth(end.getMonth() + duration);
    if (rentType === RentType.yearly) end.setFullYear(end.getFullYear() + duration);

    // 3. Check Availability (Prevent Double Booking)
    // We must exclude the CURRENT booking ID from the check
    const overlappingBookings = await this.prisma.booking.findFirst({
      where: {
        roomId,
        id: { not: id }, // Exclude self
        status: { not: BookingStatus.cancelled },
        AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
      },
    });

    if (overlappingBookings) {
      throw new BadRequestException(
        'Room is already booked for the new selected dates/room',
      );
    }

    // 4. Calculate New Price
    let pricePerUnit: Prisma.Decimal = new Prisma.Decimal(0);
    if (rentType === RentType.daily) {
      if (!room.priceDaily)
        throw new BadRequestException('Daily rent is not available for this room');
      pricePerUnit = room.priceDaily;
    } else if (rentType === RentType.weekly) {
      if (!room.priceWeekly)
        throw new BadRequestException('Weekly rent is not available for this room');
      pricePerUnit = room.priceWeekly;
    } else if (rentType === RentType.monthly) {
      if (!room.priceMonthly)
        throw new BadRequestException('Monthly rent is not available for this room');
      pricePerUnit = room.priceMonthly;
    } else if (rentType === RentType.yearly) {
      if (!room.priceMonthly)
        throw new BadRequestException('Yearly rent is not available for this room');
      pricePerUnit = new Prisma.Decimal(Number(room.priceMonthly) * 12);
    }

    const totalPrice = new Prisma.Decimal(Number(pricePerUnit) * duration);

    // 5. Build Update Data
    const dataToUpdate: Prisma.BookingUpdateInput = {
      ...(updateBookingDto.roomId && { room: { connect: { id: updateBookingDto.roomId } } }),
      ...(updateBookingDto.rentType && { rentType: updateBookingDto.rentType }),
      ...(updateBookingDto.duration && { duration: updateBookingDto.duration }),
      ...(updateBookingDto.startDate && { startDate: start }),
      endDate: end,
      pricePerUnit,
      totalPrice,
    };

    const updated = await this.repository.update(id, dataToUpdate);
    return {
      status: 200,
      message: 'Booking updated successfully',
      data: updated,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Booking not found`);
    }

    await this.repository.remove(id);

    return {
      status: 200, message: 'Booking deleted', data: null,
    };
  }
}
