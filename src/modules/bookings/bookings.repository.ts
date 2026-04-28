import { Booking, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return this.prisma.booking.create({ data });
  }

  async findAll(): Promise<Booking[]> {
    return this.prisma.booking.findMany();
  }

  async findById(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return this.prisma.booking.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Booking> {
    return this.prisma.booking.delete({ where: { id } });
  }
}
