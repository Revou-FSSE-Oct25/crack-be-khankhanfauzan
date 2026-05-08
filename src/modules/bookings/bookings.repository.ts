import { Injectable } from '@nestjs/common';
import { Booking, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return this.prisma.booking.create({ data });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.BookingWhereInput;
    orderBy?: Prisma.BookingOrderByWithRelationInput;
  }): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      skip: params?.skip,
      take: params?.take,
      where: params?.where,
      orderBy: params?.orderBy,
      include: {
        room: true,
        tenant: true,
      },
    });
  }

  async count(where?: Prisma.BookingWhereInput): Promise<number> {
    return this.prisma.booking.count({ where });
  }

  async findById(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        tenant: true,
        invoices: true,
      },
    });
  }

  async update(id: string, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return this.prisma.booking.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Booking> {
    return this.prisma.booking.delete({ where: { id } });
  }
}
