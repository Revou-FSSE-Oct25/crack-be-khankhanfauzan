import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadPaymentProofDto } from './dto/upload-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { TransactionStatus, InvoiceStatus, BookingStatus } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) { }

  async uploadPaymentProof(dto: UploadPaymentProofDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Payment proof file is required');
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.paid) {
      throw new BadRequestException('Invoice is already paid');
    }

    // Upload to Cloudinary
    const uploadResult = await this.cloudinary.uploadImage(file).catch(() => {
      throw new BadRequestException('Failed to upload image');
    });

    const proofUrl = uploadResult.secure_url;

    const transaction = await this.prisma.transaction.create({
      data: {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        proofUrl,
        status: TransactionStatus.pending,
      },
    });

    return {
      status: 201,
      message: 'Payment proof uploaded successfully. Waiting for admin verification.',
      data: transaction,
    };
  }

  async verifyPayment(transactionId: string, adminId: string, dto: VerifyPaymentDto) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { invoice: { include: { booking: true } } },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status !== TransactionStatus.pending) {
      throw new BadRequestException(`Transaction is already ${transaction.status}`);
    }

    if (dto.status === TransactionStatus.rejected && !dto.rejectReason) {
      throw new BadRequestException('Reject reason is required when rejecting a payment');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: dto.status,
          rejectReason: dto.rejectReason,
          verifiedById: adminId,
          paidAt: dto.status === TransactionStatus.verified ? new Date() : null,
        },
      });

      // 2. If verified, update Invoice and Booking
      if (dto.status === TransactionStatus.verified) {
        await tx.invoice.update({
          where: { id: transaction.invoiceId },
          data: { status: InvoiceStatus.paid },
        });

        await tx.booking.update({
          where: { id: transaction.invoice.bookingId },
          data: { status: BookingStatus.confirmed },
        });
      }

      return {
        status: 200,
        message: `Payment ${dto.status} successfully`,
        data: updatedTransaction,
      };
    });
  }
}
