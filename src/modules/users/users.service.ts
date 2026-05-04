import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository, UserWithProfile } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, Role } from 'src/types/user.type';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { GetUsersQueryDto } from './dto/get-users.dto';
import type {
  ApiResponse,
  ApiListResponse,
} from 'src/types/api-response.interface';
import { RoleType, MaritalStatus, Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly cloudinary: CloudinaryService
  ) { }

  async findAll(query?: GetUsersQueryDto): Promise<
    ApiListResponse<
      User,
      {
        totalItems: number;
        page: number;
        perPage: number;
        totalPages: number;
      }
    >
  > {
    const { page = 1, perPage = 10, role, search } = query || {};

    const where: Prisma.UserWhereInput = {};
    if (role) {
      where.role = role as RoleType;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        {
          profile: {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { whatsappNumber: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [list, totalItems] = await Promise.all([
      this.repository.findAll({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.repository.count(where),
    ]);

    const data = list.map((u) => this.mapToUser(u));
    const totalPages = Math.ceil(totalItems / perPage);

    const meta = {
      totalItems,
      page,
      perPage,
      totalPages,
    };

    return { status: 200, message: 'Users fetched', data, meta };
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
    files?: {
      avatar?: Express.Multer.File[];
      ktp?: Express.Multer.File[];
      marriage?: Express.Multer.File[];
    },
  ): Promise<ApiResponse<User>> {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException('User not found');
    }

    // Check whether the new status is married, or the old status was married and has not been changed
    const isNowMarried = dto.maritalStatus === 'married' || (!dto.maritalStatus && current.profile?.maritalStatus === 'married');

    if (isNowMarried) {
      const hastExistingMarriageCertificate = !!current.profile?.fotoBukuNikahUrl;
      const isUploadingNewMarriageCertificate = !!files?.marriage?.[0];

      // if user doesn't jave a marriage certificate photo in DB yet, and is NOT Uploading one now, reject!
      if (!hastExistingMarriageCertificate && !isUploadingNewMarriageCertificate) {
        throw new BadRequestException('Marriage Certificate photo must be uploaded if the status is married')
      }
    }

    // Upload files to Cloudinary if they exist
    let avatarUrl: string | undefined;
    let ktpUrl: string | undefined;
    let marriageUrl: string | undefined;

    try {
      if (files?.avatar?.[0]) {
        const result = await this.cloudinary.uploadImage(files.avatar[0]);
        avatarUrl = result.secure_url;
      }
      if (files?.ktp?.[0]) {
        const result = await this.cloudinary.uploadImage(files.ktp[0]);
        ktpUrl = result.secure_url;
      }
      if (files?.marriage?.[0]) {
        const result = await this.cloudinary.uploadImage(files.marriage[0]);
        marriageUrl = result.secure_url;
      }
    } catch (error) {
      throw new BadRequestException('Failed to upload one or more profile images');
    }

    const updated = await this.repository.update(id, {
      profile: {
        upsert: {
          create: {
            fullName: dto.fullName,
            whatsappNumber: dto.whatsappNumber,
            maritalStatus: dto.maritalStatus as MaritalStatus,
            fotoProfileUrl: avatarUrl,
            fotoKtpUrl: ktpUrl,
            fotoBukuNikahUrl: marriageUrl,
          },
          update: {
            ...(dto.fullName && { fullName: dto.fullName }),
            ...(dto.whatsappNumber && { whatsappNumber: dto.whatsappNumber }),
            ...(dto.maritalStatus && {
              maritalStatus: dto.maritalStatus as MaritalStatus,
            }),
            ...(avatarUrl && { fotoProfileUrl: avatarUrl }),
            ...(ktpUrl && { fotoKtpUrl: ktpUrl }),
            ...(marriageUrl !== undefined && {
              fotoBukuNikahUrl: marriageUrl,
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
