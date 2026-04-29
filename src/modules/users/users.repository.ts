import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User as PrismaUser, Profile } from '@prisma/client';

export type UserWithProfile = PrismaUser & { profile: Profile | null };

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<UserWithProfile[]> {
    return this.prisma.user.findMany({
      skip: params?.skip,
      take: params?.take,
      where: params?.where,
      orderBy: params?.orderBy,
      include: { profile: true },
    });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where });
  }

  async findById(id: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<UserWithProfile> {
    return this.prisma.user.create({
      data,
      include: { profile: true },
    });
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserWithProfile> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { profile: true },
    });
  }

  async updateProfileCompletion(
    userId: string,
    isProfileComplete: boolean,
  ): Promise<Profile> {
    return this.prisma.profile.update({
      where: { userId },
      data: { isProfileComplete },
    });
  }

  async updateRtHash(userId: string, hashedRt: string | null): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        ...(hashedRt === null ? { hashedRt: { not: null } } : {}),
      },
      data: {
        hashedRt,
      },
    });
  }

  async remove(id: string): Promise<PrismaUser> {
    return this.prisma.user.delete({ where: { id } });
  }
}
