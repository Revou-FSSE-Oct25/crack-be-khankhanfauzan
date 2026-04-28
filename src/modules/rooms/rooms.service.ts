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
import { RoomStatus, RoomType, BookingStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly repository: RoomsRepository,
    private readonly prisma: PrismaService,
  ) {}

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findAll(query?: GetRoomsQueryDto): Promise<
    ApiListResponse<
      Room,
      {
        totalRooms: number;
        totalAvailable: number;
        totalUnavailable: number;
        totalOccupied: number;
      }
    >
  > {
    const list = await this.repository.findAll();

    const data = list.map((r) => this.mapToRoom(r));

    const totalRooms = data.length;
    const totalAvailable = data.filter((r) => r.status === 'available').length;
    const totalUnavailable = data.filter(
      (r) => r.status === 'unavailable',
    ).length;
    const totalOccupied = data.filter((r) => r.status === 'occupied').length;
    const meta = {
      totalRooms,
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
