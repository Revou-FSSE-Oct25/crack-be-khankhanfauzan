import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUserId: string, currentUserRole: string) {
    const where: Prisma.InvoiceWhereInput = {};

    if (currentUserRole === 'tenant') {
      where.booking = { tenantId: currentUserId };
    }

    const data = await this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: { room: true },
        },
        transactions: true,
      },
    });

    return {
      status: 200,
      message: 'Invoices fetched successfully',
      data,
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: { room: true, tenant: true },
        },
        transactions: true,
      },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    return {
      status: 200,
      message: 'Invoice details fetched successfully',
      data: invoice,
    };
  }
}
