import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersRepository } from '../modules/users/users.repository';
import type { ApiResponse } from 'src/types/api-response.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwtPayload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<
    ApiResponse<{
      user: {
        id: string;
        fullname: string;
        email: string;
        whatsappNumber: string;
        role: string;
      };
      accessToken: string;
      refreshToken: string;
    }>
  > {
    const existing = await this.usersRepository.findByEmail(
      dto.email.toLowerCase(),
    );
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.usersRepository.create({
      email: dto.email.toLowerCase(),
      password: passwordHash,
      role: 'tenant',
      profile: {
        create: {
          fullName: dto.fullname,
          whatsappNumber: dto.whatsappNumber,
        },
      },
    });

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return {
      status: 201,
      message: 'User registered',
      data: {
        user: {
          id: user.id,
          fullname: user.profile?.fullName ?? '',
          email: user.email,
          whatsappNumber: user.profile?.whatsappNumber ?? '',
          role: user.role,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  async login(dto: LoginDto): Promise<
    ApiResponse<{
      user: {
        id: string;
        fullname: string;
        email: string;
        whatsappNumber: string;
        role: string;
      };
      accessToken: string;
      refreshToken: string;
    }>
  > {
    const user = await this.usersRepository.findByEmail(
      dto.email.toLowerCase(),
    );

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(user.password, dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return {
      status: 200,
      message: 'Login success',
      data: {
        user: {
          id: user.id,
          fullname: user.profile?.fullName ?? '',
          email: user.email,
          whatsappNumber: user.profile?.whatsappNumber ?? '',
          role: user.role,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  async logout(userId: string): Promise<ApiResponse<null>> {
    await this.usersRepository.updateRtHash(userId, null);

    return {
      status: 200,
      message: 'Logout success',
      data: null,
    };
  }

  async refreshTokens(
    userId: string,
    rt: string,
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.hashedRt) {
      throw new ForbiddenException('Access Denied');
    }

    const rtMatches = await argon2.verify(user.hashedRt, rt);
    if (!rtMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return {
      status: 200,
      message: 'Tokens refreshed',
      data: tokens,
    };
  }

  private async getTokens(userId: string, email: string, role: string) {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
      role: role,
    };

    const [at, rt] = await Promise.all([
      this.jwt.signAsync(jwtPayload, {
        secret: process.env.JWT_SECRET || 'dev-secret',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expiresIn: (process.env.JWT_EXPIRATION || '15m') as any,
      }),
      this.jwt.signAsync(jwtPayload, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  private async updateRtHash(userId: string, rt: string): Promise<void> {
    const hash = await argon2.hash(rt);
    await this.usersRepository.updateRtHash(userId, hash);
  }

  async me(userId: string): Promise<ApiResponse<any>> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      status: 200,
      message: 'Current user',
      data: {
        id: user.id,
        fullname: user.profile?.fullName ?? '',
        email: user.email,
        whatsappNumber: user.profile?.whatsappNumber ?? '',
        role: user.role,
      },
    };
  }
}
