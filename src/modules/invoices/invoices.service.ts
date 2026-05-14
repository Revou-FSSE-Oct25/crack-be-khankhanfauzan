import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { InvoicesRepository } from './invoices.repository';

@Injectable()
export class InvoicesService {
  constructor(private readonly repository: InvoicesRepository) { }

  async findAll(currentUserId: string, currentUserRole: string) {
    const where: Prisma.InvoiceWhereInput = {};

    if (currentUserRole === 'tenant') {
      where.booking = { tenantId: currentUserId };
    }

    const data = await this.repository.findAll({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: 200,
      message: 'Invoices fetched successfully',
      data,
    };
  }

  async findOne(id: string) {
    const invoice = await this.repository.findById(id);

    if (!invoice) throw new NotFoundException('Invoice not found');

    // Hitung total amount yang sudah dibayar dan diverifikasi
    const totalPaid = invoice.transactions
      .filter((t) => t.status === 'verified')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalAmount = Number(invoice.totalAmount);
    const penaltyAmount = Number(invoice.penaltyAmount || 0);
    const totalBilled = totalAmount + penaltyAmount;
    
    // Hitung sisa tagihan (remainingAmount)
    const remainingAmount = Math.max(0, totalBilled - totalPaid);

    const dataWithPaymentDetails = {
      ...invoice,
      paymentDetails: {
        totalBilled,
        totalPaid,
        remainingAmount,
      }
    };

    return {
      status: 200,
      message: 'Invoice details fetched successfully',
      data: dataWithPaymentDetails,
    };
  }
}
