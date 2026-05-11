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
          recentTransactions: [],
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

    // 5. Recent Transactions
    const recentTransactions = await this.repository.findRecentTransactionsByTenantId(tenantId, 5);

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
        recentTransactions,
        calendarEvents
      }
    };
  }

  async getAdminDashboardSummary(range: string = 'weekday') {
    // 1. Statistics
    const [totalTenants, roomStats, maintenanceStats, outstandingInvoices] = await Promise.all([
      this.repository.countActiveTenants(),
      this.repository.getRoomStats(),
      this.repository.getMaintenanceStats(),
      this.repository.getOutstandingInvoices()
    ]);

    const occupancyRate = roomStats.total > 0 ? Math.round((roomStats.occupied / roomStats.total) * 100) : 0;

    // 2. Sales Report
    const now = new Date();
    let startDate = new Date();

    if (range === 'monthly') {
      startDate.setMonth(now.getMonth() - 6); // Last 6 months for example
      startDate.setDate(1);
    } else {
      startDate.setDate(now.getDate() - 6); // Last 7 days including today
    }

    startDate.setHours(0, 0, 0, 0);

    const transactions = await this.repository.getVerifiedTransactions(startDate);
    const salesReport: { label: string, value: number }[] = [];

    if (range === 'monthly') {
      // Group by month
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const grouped = new Map<string, number>();

      transactions.forEach(t => {
        const d = new Date(t.createdAt);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
        grouped.set(key, (grouped.get(key) || 0) + Number(t.amount));
      });

      grouped.forEach((value, label) => salesReport.push({ label, value }));
    } else {
      // Group by weekday
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // Initialize last 7 days to 0 to ensure continuous chart
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        salesReport.push({ label: dayNames[d.getDay()], value: 0 });
      }

      transactions.forEach(t => {
        const d = new Date(t.createdAt);
        const label = dayNames[d.getDay()];
        const entry = salesReport.find(s => s.label === label);
        if (entry) entry.value += Number(t.amount);
      });
    }

    // 3. Cost Breakdown (Skipped, requires new expense tracking table)
    const costBreakdown: any[] = [];

    // 4. Recent Activities
    const [recentTx, recentBk] = await Promise.all([
      this.repository.getRecentActivitiesTransactions(),
      this.repository.getRecentActivitiesBookings()
    ]);

    const mappedTx = recentTx.map(t => ({
      id: t.id,
      type: 'payment',
      title: `Pembayaran sewa • ${t.invoice.booking.tenant.profile?.fullName || 'Tenant'}`,
      subtitle: Number(t.amount).toString(),
      date: t.createdAt
    }));

    const mappedBk = recentBk.map(b => ({
      id: b.id,
      type: 'booking',
      title: `Booking kamar ${b.room.roomNumber} • ${b.tenant.profile?.fullName || 'Tenant'}`,
      subtitle: b.rentType,
      date: b.createdAt
    }));

    const recentActivities = [...mappedTx, ...mappedBk]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    // 5. Recent Maintenances
    const rawMaintenances = await this.repository.getRecentMaintenances();
    const recentMaintenances = rawMaintenances.map(m => ({
      id: m.id,
      category: m.category,
      room: m.room?.roomNumber || 'Unknown',
      description: m.description,
      priority: 'high' // Hardcoded since priority doesn't exist in schema
    }));

    // 6. Agenda
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const agendaStats = await this.repository.getAgendaStats(todayStart, todayEnd);

    return {
      status: 200,
      message: "Dashboard summary fetched successfully",
      data: {
        statistics: {
          totalTenants: { value: totalTenants, subtitle: "Aktif" },
          occupancy: { value: `${occupancyRate}%`, subtitle: `${roomStats.occupied}/${roomStats.total} Kamar` },
          activeMaintenances: { value: maintenanceStats.active, subtitle: "Perlu ditinjau" },
          outstandingInvoices: { value: outstandingInvoices, subtitle: "Periode berjalan" }
        },
        salesReport,
        costBreakdown,
        recentActivities,
        recentMaintenances,
        agenda: agendaStats,
        roomStatus: {
          occupied: roomStats.occupied,
          empty: roomStats.empty,
          maintenance: roomStats.maintenance
        }
      }
    };
  }
}
