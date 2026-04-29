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

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.RoomWhereInput;
    orderBy?: Prisma.RoomOrderByWithRelationInput;
  }): Promise<RoomWithFacilities[]> {
    return this.prisma.room.findMany({
      skip: params?.skip,
      take: params?.take,
      where: params?.where,
      orderBy: params?.orderBy,
      include: {
        roomFacilities: {
          include: { facility: true },
        },
      },
    });
  }

  async count(where?: Prisma.RoomWhereInput): Promise<number> {
    return this.prisma.room.count({ where });
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
