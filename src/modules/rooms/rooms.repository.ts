import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisma,
  Room as PrismaRoom,
  RoomFacility,
  Facility,
} from '@prisma/client';

export type RoomWithFacilities = PrismaRoom & {
  roomFacilities: (RoomFacility & {
    facility: Facility;
  })[];
};

@Injectable()
export class RoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.RoomCreateInput): Promise<RoomWithFacilities> {
    return this.prisma.room.create({
      data,
      include: {
        roomFacilities: {
          include: { facility: true },
        },
      },
    });
  }

  async findAll(): Promise<RoomWithFacilities[]> {
    return this.prisma.room.findMany({
      include: {
        roomFacilities: {
          include: { facility: true },
        },
      },
    });
  }

  async findById(id: string): Promise<RoomWithFacilities | null> {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        roomFacilities: {
          include: { facility: true },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.RoomUpdateInput,
  ): Promise<RoomWithFacilities> {
    return this.prisma.room.update({
      where: { id },
      data,
      include: {
        roomFacilities: {
          include: { facility: true },
        },
      },
    });
  }

  async remove(id: string): Promise<PrismaRoom> {
    return this.prisma.room.delete({ where: { id } });
  }
}
