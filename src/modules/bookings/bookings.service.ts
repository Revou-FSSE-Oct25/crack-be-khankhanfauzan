import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingsRepository } from './bookings.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { RentType, BookingStatus, Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly repository: BookingsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(tenantId: string, dto: CreateBookingDto) {
    const { roomId, rentType, duration, startDate } = dto;

    // 1. Validate Room
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // 2. Calculate End Date
    const start = new Date(startDate);
    const end = new Date(start);
    if (rentType === RentType.daily) end.setDate(end.getDate() + duration);
    if (rentType === RentType.weekly) end.setDate(end.getDate() + duration * 7);
    if (rentType === RentType.monthly) end.setMonth(end.getMonth() + duration);
    if (rentType === RentType.yearly)
      end.setFullYear(end.getFullYear() + duration);

    // 3. Check Availability (Prevent Double Booking)
    // Check if there are any overlapping bookings that are NOT cancelled
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
      pricePerUnit = room.priceMonthly;
    } else if (rentType === RentType.yearly) {
      // Assuming yearly price is 12 * monthly price since there's no priceYearly field
      pricePerUnit = new Prisma.Decimal(Number(room.priceMonthly) * 12);
    } else {
      throw new BadRequestException('Invalid rent type');
    }

    const totalPrice = new Prisma.Decimal(Number(pricePerUnit) * duration);

    // 5. Create Booking
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
    });

    return {
      status: 201,
      message: 'Booking created successfully',
      data: booking,
    };
  }

  findAll() {
    return this.repository.findAll();
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

  update(id: string, updateBookingDto: UpdateBookingDto) {
    return this.repository.update(
      id,
      updateBookingDto as Prisma.BookingUpdateInput,
    );
  }

  remove(id: string) {
    return this.repository.remove(id);
  }
}
