import { Injectable } from '@nestjs/common';
import { Prisma, Review } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.prisma.review.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ReviewWhereInput;
    orderBy?: Prisma.ReviewOrderByWithRelationInput;
    include?: Prisma.ReviewInclude;
  }): Promise<any[]> {
    return this.prisma.review.findMany({
      ...params,
    });
  }

  async count(where?: Prisma.ReviewWhereInput): Promise<number> {
    return this.prisma.review.count({ where });
  }

  async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Review> {
    return this.prisma.review.delete({
      where: { id },
    });
  }
}
