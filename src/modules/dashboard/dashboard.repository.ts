import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingStatus, ComplaintStatus, InvoiceStatus, Prisma } from '@prisma/client';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveBookingByTenantId(tenantId: string) {
    return this.prisma.booking.findFirst({
      where: {
        tenantId,
        status: { in: [BookingStatus.pending_payment, BookingStatus.confirmed] }
      },
      include: {
        room: {
          include: { roomFacilities: { include: { facility: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findNextUnpaidInvoice(bookingId: string) {
    return this.prisma.invoice.findFirst({
      where: {
        bookingId,
        status: InvoiceStatus.unpaid
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  async findActiveComplaintsByTenantId(tenantId: string) {
    return this.prisma.maintenance.findMany({
      where: {
        tenantId,
        status: { in: [ComplaintStatus.open, ComplaintStatus.in_progress] }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findRecentTransactionsByTenantId(tenantId: string, limit: number = 5) {
    return this.prisma.transaction.findMany({
      where: {
        invoice: {
          booking: {
            tenantId
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { invoice: true }
    });
  }
}
