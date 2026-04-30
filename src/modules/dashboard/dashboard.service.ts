import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) { }

  async getTenantDashboard(tenantId: string) {
    // 1. Get Active Booking
    const activeBooking = await this.repository.findActiveBookingByTenantId(tenantId);

    if (!activeBooking) {
      return {
        status: 200,
        message: 'Dashboard fetched',
        data: {
          activeBooking: null,
          stayInfo: null,
          paymentReminder: null,
          activeComplaints: [],
          lastTransaction: null,
          calendarEvents: []
        }
      };
    }

    // 2. Stay Info Calculation
    const now = new Date();
    const startDate = new Date(activeBooking.startDate);
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const daysStayed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const stayInfo = {
      daysStayed: now >= startDate ? daysStayed : 0,
      contractDuration: activeBooking.duration,
      rentType: activeBooking.rentType,
    };

    // 3. Payment Reminder
    const nextInvoice = await this.repository.findNextUnpaidInvoice(activeBooking.id);

    let paymentReminder: {
      invoiceId: string;
      dueDate: Date;
      totalAmount: number;
      countdownDays: number;
    } | null = null;
    if (nextInvoice) {
      const dueDate = new Date(nextInvoice.dueDate);
      const diffDue = dueDate.getTime() - now.getTime();
      const countdownDays = Math.ceil(diffDue / (1000 * 60 * 60 * 24));

      paymentReminder = {
        invoiceId: nextInvoice.id,
        dueDate: nextInvoice.dueDate,
        totalAmount: Number(nextInvoice.totalAmount),
        countdownDays
      };
    }

    // 4. Active Complaints
    const activeComplaints = await this.repository.findActiveComplaintsByTenantId(tenantId);

    // 5. Last Transaction
    const lastTransaction = await this.repository.findLastTransactionByTenantId(tenantId);

    // 6. Calendar Events
    const calendarEvents: any[] = [];

    // Add Due Dates to Calendar
    if (nextInvoice) {
      calendarEvents.push({
        type: 'payment_due',
        title: 'Payment Due',
        date: nextInvoice.dueDate,
        amount: Number(nextInvoice.totalAmount)
      });

      // H-3 Reminder
      const h3Date = new Date(nextInvoice.dueDate);
      h3Date.setDate(h3Date.getDate() - 3);
      if (h3Date >= now) {
        calendarEvents.push({
          type: 'payment_reminder',
          title: 'Payment Reminder (H-3)',
          date: h3Date
        });
      }
    }

    // Add Reported Maintenances to Calendar
    activeComplaints.forEach(complaint => {
      calendarEvents.push({
        type: 'maintenance_reported',
        title: `Complaint: ${complaint.category}`,
        date: complaint.createdAt,
        status: complaint.status
      });
    });

    // Note: Routine global maintenance could be fetched here from a separate GlobalEvent table in the future.

    return {
      status: 200,
      message: 'Dashboard fetched successfully',
      data: {
        activeBooking,
        stayInfo,
        paymentReminder,
        activeComplaints,
        lastTransaction,
        calendarEvents
      }
    };
  }
}
