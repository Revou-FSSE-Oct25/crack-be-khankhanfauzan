import { Injectable } from "@nestjs/common";
import { Maintenance, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class MaintenancesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.MaintenanceCreateInput): Promise<Maintenance> {
        return this.prisma.maintenance.create({ data });
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        where?: Prisma.MaintenanceWhereInput;
        orderBy?: Prisma.MaintenanceOrderByWithRelationInput;
        include?: Prisma.MaintenanceInclude;
    }): Promise<any[]> {
        return this.prisma.maintenance.findMany({
            skip: params?.skip,
            take: params?.take,
            where: params?.where,
            orderBy: params?.orderBy,
            include: params?.include || {
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
        });
    }

    async count(where?: Prisma.MaintenanceWhereInput): Promise<number> {
        return this.prisma.maintenance.count({ where });
    }

    async update(id: string, data: Prisma.MaintenanceUpdateInput): Promise<Maintenance> {
        return this.prisma.maintenance.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Maintenance> {
        return this.prisma.maintenance.delete({
            where: { id },
        });
    }
}