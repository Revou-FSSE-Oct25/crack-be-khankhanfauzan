import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository, UserWithProfile } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, Role } from 'src/types/user.type';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import type { ApiResponse } from 'src/types/api-response.interface';
import { RoleType, MaritalStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async findAll(): Promise<ApiResponse<User[]>> {
    const list = await this.repository.findAll();
    const data = list.map((u) => this.mapToUser(u));
    return { status: 200, message: 'Users fetched', data };
  }

  async findOne(id: string): Promise<ApiResponse<User>> {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return { status: 200, message: 'User detail', data: this.mapToUser(user) };
  }

  async create(dto: CreateUserAdminDto): Promise<ApiResponse<User>> {
    const user = await this.repository.create({
      email: dto.email,
      role: (dto.role as RoleType) ?? 'tenant',
      profile: {
        create: {
          fullName: dto.fullName,
          whatsappNumber: dto.whatsappNumber,
        },
      },
    });
    return { status: 201, message: 'User created', data: this.mapToUser(user) };
  }

  async updateAdmin(
    id: string,
    dto: UpdateUserAdminDto,
  ): Promise<ApiResponse<User>> {
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundException('User not found');

    const updated = await this.repository.update(id, {
      ...(dto.role && { role: dto.role as RoleType }),
      profile: {
        upsert: {
          create: {
            fullName: dto.fullName,
            whatsappNumber: dto.whatsappNumber,
            maritalStatus: dto.maritalStatus as MaritalStatus,
            fotoProfileUrl: dto.avatarUrl,
            fotoKtpUrl: dto.ktpUrl,
            fotoBukuNikahUrl: dto.marriageUrl,
          },
          update: {
            ...(dto.fullName && { fullName: dto.fullName }),
            ...(dto.whatsappNumber && { whatsappNumber: dto.whatsappNumber }),
            ...(dto.maritalStatus && {
              maritalStatus: dto.maritalStatus as MaritalStatus,
            }),
            ...(dto.avatarUrl && { fotoProfileUrl: dto.avatarUrl }),
            ...(dto.ktpUrl && { fotoKtpUrl: dto.ktpUrl }),
            ...(dto.marriageUrl !== undefined && {
              fotoBukuNikahUrl: dto.marriageUrl,
            }),
          },
        },
      },
    });

    const isKtpVerified = !!updated.profile?.fotoKtpUrl;
    const isMarriageRequired = updated.profile?.maritalStatus === 'married';
    const isMarriageVerified = isMarriageRequired
      ? !!updated.profile?.fotoBukuNikahUrl
      : false;
    const isProfileVerified =
      !!updated.profile?.fullName &&
      !!updated.profile?.whatsappNumber &&
      !!updated.profile?.fotoProfileUrl &&
      isKtpVerified &&
      (!isMarriageRequired || isMarriageVerified);

    if (
      updated.profile &&
      updated.profile.isProfileComplete !== isProfileVerified
    ) {
      await this.repository.updateProfileCompletion(id, isProfileVerified);
      updated.profile.isProfileComplete = isProfileVerified;
    }

    return {
      status: 200,
      message: 'User updated',
      data: this.mapToUser(updated),
    };
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<ApiResponse<User>> {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.repository.update(id, {
      profile: {
        upsert: {
          create: {
            fullName: dto.fullName,
            whatsappNumber: dto.whatsappNumber,
            maritalStatus: dto.maritalStatus as MaritalStatus,
            fotoProfileUrl: dto.avatarUrl,
            fotoKtpUrl: dto.ktpUrl,
            fotoBukuNikahUrl: dto.marriageUrl,
          },
          update: {
            ...(dto.fullName && { fullName: dto.fullName }),
            ...(dto.whatsappNumber && { whatsappNumber: dto.whatsappNumber }),
            ...(dto.maritalStatus && {
              maritalStatus: dto.maritalStatus as MaritalStatus,
            }),
            ...(dto.avatarUrl && { fotoProfileUrl: dto.avatarUrl }),
            ...(dto.ktpUrl && { fotoKtpUrl: dto.ktpUrl }),
            ...(dto.marriageUrl !== undefined && {
              fotoBukuNikahUrl: dto.marriageUrl,
            }),
          },
        },
      },
    });

    const isKtpVerified = !!updated.profile?.fotoKtpUrl;
    const isMarriageRequired = updated.profile?.maritalStatus === 'married';
    const isMarriageVerified = isMarriageRequired
      ? !!updated.profile?.fotoBukuNikahUrl
      : false;
    const isProfileVerified =
      !!updated.profile?.fullName &&
      !!updated.profile?.whatsappNumber &&
      !!updated.profile?.fotoProfileUrl &&
      isKtpVerified &&
      (!isMarriageRequired || isMarriageVerified);

    if (
      updated.profile &&
      updated.profile.isProfileComplete !== isProfileVerified
    ) {
      await this.repository.updateProfileCompletion(id, isProfileVerified);
      updated.profile.isProfileComplete = isProfileVerified;
    }

    return {
      status: 200,
      message: 'Profile updated',
      data: this.mapToUser(updated),
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundException('User not found');
    await this.repository.remove(id);
    return { status: 200, message: 'User deleted', data: null };
  }

  private mapToUser(u: UserWithProfile): User {
    const isKtpVerified = !!u.profile?.fotoKtpUrl;
    const isMarriageRequired = u.profile?.maritalStatus === 'married';
    const isMarriageVerified = isMarriageRequired
      ? !!u.profile?.fotoBukuNikahUrl
      : false;

    return {
      id: u.id,
      fullName: u.profile?.fullName ?? '',
      email: u.email,
      whatsappNumber: u.profile?.whatsappNumber ?? '',
      role: u.role as Role,
      maritalStatus: u.profile?.maritalStatus ?? undefined,
      profile: {
        joinedAt:
          u.profile?.createdAt?.toISOString() ?? new Date().toISOString(),
        avatarUrl: u.profile?.fotoProfileUrl ?? null,
      },
      document: {
        ktpUrl: u.profile?.fotoKtpUrl ?? null,
        marriageUrl: u.profile?.fotoBukuNikahUrl ?? null,
      },
      verified: {
        isProfileVerified: u.profile?.isProfileComplete ?? false,
        isKtpVerified,
        isMarriageVerified,
      },
    };
  }
}
