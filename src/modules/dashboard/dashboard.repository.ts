import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingStatus, ComplaintStatus, InvoiceStatus, Prisma, RoomStatus, TransactionStatus } from '@prisma/client';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // TENANT DASHBOARD METHODS
  // ==========================================

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

  // ==========================================
  // ADMIN DASHBOARD METHODS
  // ==========================================

  async countActiveTenants() {
    return this.prisma.user.count({
      where: {
        role: 'tenant',
        bookings: { some: { status: BookingStatus.confirmed } }
      }
    });
  }

  async getRoomStats() {
    const total = await this.prisma.room.count();
    const occupied = await this.prisma.room.count({ where: { status: RoomStatus.occupied } });
    const empty = await this.prisma.room.count({ where: { status: RoomStatus.available } });
    const maintenance = await this.prisma.room.count({ where: { status: RoomStatus.unavailable } });
    
    return { total, occupied, empty, maintenance };
  }

  async getMaintenanceStats() {
    const active = await this.prisma.maintenance.count({
      where: { status: { in: [ComplaintStatus.open, ComplaintStatus.in_progress] } }
    });
    return { active };
  }

  async getOutstandingInvoices() {
    const result = await this.prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { in: [InvoiceStatus.unpaid, InvoiceStatus.partially_paid] },
        dueDate: { lt: new Date() }
      }
    });
    return result._sum.totalAmount ? Number(result._sum.totalAmount) : 0;
  }

  async getVerifiedTransactions(startDate: Date) {
    return this.prisma.transaction.findMany({
      where: {
        status: TransactionStatus.verified,
        createdAt: { gte: startDate } // Or paidAt if you prefer
      },
      select: { amount: true, createdAt: true }
    });
  }

  async getRecentActivitiesTransactions() {
    return this.prisma.transaction.findMany({
      where: { status: TransactionStatus.verified },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { 
        invoice: { include: { booking: { include: { tenant: { select: { profile: true } } } } } }
      }
    });
  }

  async getRecentActivitiesBookings() {
    return this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        tenant: { select: { profile: true } },
        room: true
      }
    });
  }

  async getRecentMaintenances() {
    return this.prisma.maintenance.findMany({
      where: { status: { notIn: [ComplaintStatus.resolved, ComplaintStatus.closed] } },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { room: true }
    });
  }

  async getAgendaStats(todayStart: Date, todayEnd: Date) {
    const checkIn = await this.prisma.booking.count({
      where: { startDate: { gte: todayStart, lte: todayEnd } }
    });
    
    const checkOut = await this.prisma.booking.count({
      where: { endDate: { gte: todayStart, lte: todayEnd } }
    });

    const paymentDue = await this.prisma.invoice.count({
      where: {
        status: { in: [InvoiceStatus.unpaid, InvoiceStatus.partially_paid] },
        dueDate: { gte: todayStart, lte: todayEnd }
      }
    });

    return { checkIn, checkOut, paymentDue };
  }
}
