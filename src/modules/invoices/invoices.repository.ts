import { Injectable } from "@nestjs/common";
import { Invoice, Transaction, Booking, Room, User, Profile, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export type InvoiceWithDetails = Invoice & {
    booking: Booking & {
        room: Room;
        tenant?: {
            id: string;
            email: string;
            role: string;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
            profile: Profile | null;
        } | null;
    };
    transactions: Transaction[];
};

@Injectable()
export class InvoicesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params?: {
        skip?: number;
        take?: number;
        where?: Prisma.InvoiceWhereInput;
        orderBy?: Prisma.InvoiceOrderByWithRelationInput;
    }): Promise<InvoiceWithDetails[]> {
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
        }) as unknown as InvoiceWithDetails[];
    }

    async findById(id: string): Promise<InvoiceWithDetails | null> {
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
        }) as unknown as InvoiceWithDetails | null;
    }
}