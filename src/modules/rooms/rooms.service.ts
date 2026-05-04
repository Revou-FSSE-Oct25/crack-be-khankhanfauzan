import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsRepository, RoomWithFacilities } from './rooms.repository';
import { GetRoomsQueryDto } from './dto/get-rooms.dto';
import type {
  ApiListResponse,
  ApiResponse,
} from 'src/types/api-response.interface';
import type { Room } from 'src/types/room.type';
import { RoomStatus, RoomType, BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly repository: RoomsRepository,
    private readonly prisma: PrismaService,
  ) { }

  async create(createRoomDto: CreateRoomDto): Promise<ApiResponse<Room>> {
    const data = await this.repository.create({
      roomNumber: createRoomDto.roomNumber,
      roomType: createRoomDto.roomType as RoomType,
      floor: createRoomDto.floor,
      priceMonthly: createRoomDto.price,
      status: createRoomDto.status as RoomStatus,
      length: createRoomDto.dimensions?.length || 0,
      width: createRoomDto.dimensions?.width || 0,
      area: createRoomDto.dimensions?.area,
      unit: createRoomDto.dimensions?.unit || 'm',
      roomFacilities: {
        create:
          createRoomDto.facilities?.map((f) => ({
            facility: {
              connect: { id: f.id },
            },
          })) || [],
      },
    });

    const roomData = this.mapToRoom(data);
    return { status: 201, message: 'Room created', data: roomData };
  }

  async findAll(query?: GetRoomsQueryDto): Promise<
    ApiListResponse<
      Room,
      {
        totalItems: number;
        page: number;
        perPage: number;
        totalPages: number;
        totalRooms: number;
        totalAvailable: number;
        totalUnavailable: number;
        totalOccupied: number;
      }
    >
  > {
    const {
      page = 1,
      perPage = 10,
      floor,
      status,
      roomType,
      price,
    } = query || {};

    const where: Prisma.RoomWhereInput = {};
    if (floor) where.floor = floor;
    if (status) where.status = status as RoomStatus;
    if (roomType) where.roomType = roomType as RoomType;

    const orderBy: Prisma.RoomOrderByWithRelationInput = price
      ? { priceMonthly: price }
      : { createdAt: 'desc' };

    const [list, totalItems, totalAvailable, totalUnavailable, totalOccupied] =
      await Promise.all([
        this.repository.findAll({
          skip: (page - 1) * perPage,
          take: perPage,
          where,
          orderBy,
        }),
        this.repository.count(where),
        this.repository.count({ status: 'available' }),
        this.repository.count({ status: 'unavailable' }),
        this.repository.count({ status: 'occupied' }),
      ]);

    const data = list.map((r) => this.mapToRoom(r));
    const totalPages = Math.ceil(totalItems / perPage);

    const meta = {
      totalItems,
      page,
      perPage,
      totalPages,
      totalRooms: totalAvailable + totalUnavailable + totalOccupied,
      totalAvailable,
      totalUnavailable,
      totalOccupied,
    };
    return { status: 200, message: 'Rooms fetched', data, meta };
  }

  async findOne(id: string): Promise<ApiResponse<Room>> {
    const room = await this.repository.findById(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return { status: 200, message: 'Room detail', data: this.mapToRoom(room) };
  }

  async checkAvailability(
    roomId: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<{ isAvailable: boolean }>> {
    const room = await this.repository.findById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status === 'unavailable') {
      return {
        status: 200,
        message: `Room is currently ${room.status} and cannot be booked`,
        data: { isAvailable: false },
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const overlappingBookings = await this.prisma.booking.findFirst({
      where: {
        roomId,
        status: { not: BookingStatus.cancelled },
        AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
      },
    });

    const isAvailable = !overlappingBookings;

    return {
      status: 200,
      message: isAvailable
        ? 'Room is available for the selected dates'
        : 'Room is already booked for the selected dates',
      data: { isAvailable },
    };
  }

  async update(
    id: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<ApiResponse<Room>> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Room not found');
    }

    const updated = await this.repository.update(id, {
      ...(updateRoomDto.roomType && {
        roomType: updateRoomDto.roomType as RoomType,
      }),
      ...(updateRoomDto.floor !== undefined && {
        floor: updateRoomDto.floor,
      }),
      ...(updateRoomDto.price !== undefined && {
        priceMonthly: updateRoomDto.price,
      }),
      ...(updateRoomDto.status && {
        status: updateRoomDto.status as RoomStatus,
      }),
      ...(updateRoomDto.facilities && {
        roomFacilities: {
          deleteMany: {},
          create: updateRoomDto.facilities.map((f) => ({
            facility: { connect: { id: f.id } },
          })),
        },
      }),
    });

    return {
      status: 200,
      message: 'Room updated',
      data: this.mapToRoom(updated),
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Room not found');
    }
    await this.repository.remove(id);
    return { status: 200, message: 'Room deleted', data: null };
  }

  private mapToRoom(r: RoomWithFacilities): Room {
    return {
      id: r.id,
      roomNumber: r.roomNumber,
      roomType: r.roomType,
      floor: r.floor || 0,
      price: Number(r.priceMonthly || 0),
      status: r.status,
      facilities: r.roomFacilities?.map((rf) => rf.facility) || [],
      dimensions: {
        length: 3,
        width: 4.5,
        area: 3 * 4.5,
        unit: 'm',
      },
    };
  }
}
