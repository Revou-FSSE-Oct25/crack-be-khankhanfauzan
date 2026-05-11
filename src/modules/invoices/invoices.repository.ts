import { Injectable } from "@nestjs/common";
import { Invoice, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class InvoicesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params?: {
        skip?: number;
        take?: number;
        where?: Prisma.InvoiceWhereInput;
        orderBy?: Prisma.InvoiceOrderByWithRelationInput;
    }): Promise<Invoice[]> {
        return await this.prisma.invoice.findMany({
            skip: params?.skip,
            take: params?.take,
            where: params?.where,
            orderBy: params?.orderBy,
            include: {
                booking: {
                    include: { room: true },
                },
                transactions: true,
            },
        });
    }

    async findById(id: string): Promise<Invoice | null> {
        return await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                booking: {
                    include: {
                        room: true,
                        tenant: {
                            select: {
                                id: true,
                                email: true,
                                role: true,
                                isVerified: true,
                                createdAt: true,
                                updatedAt: true,
                                profile: true,
                            },
                        },
                    },
                },
                transactions: true,
            },
        });
    }
}