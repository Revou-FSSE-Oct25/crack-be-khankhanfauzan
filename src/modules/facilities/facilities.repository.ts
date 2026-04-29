import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Facility } from '@prisma/client';

@Injectable()
export class FacilitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.FacilityCreateInput): Promise<Facility> {
    return this.prisma.facility.create({ data });
  }

  async findByName(name: string): Promise<Facility | null> {
    return this.prisma.facility.findUnique({ where: { name } });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.FacilityWhereInput;
    orderBy?: Prisma.FacilityOrderByWithRelationInput;
  }): Promise<Facility[]> {
    return this.prisma.facility.findMany({
      skip: params?.skip,
      take: params?.take,
      where: params?.where,
      orderBy: params?.orderBy,
    });
  }

  async count(where?: Prisma.FacilityWhereInput): Promise<number> {
    return this.prisma.facility.count({ where });
  }

  async findById(id: string): Promise<Facility | null> {
    return this.prisma.facility.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Prisma.FacilityUpdateInput,
  ): Promise<Facility> {
    return this.prisma.facility.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Facility> {
    return this.prisma.facility.delete({ where: { id } });
  }
}
