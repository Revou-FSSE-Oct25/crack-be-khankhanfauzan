import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import type { Role } from 'src/types/user.type';

export class CreateUserAdminDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+6281234567890' })
  @IsString()
  whatsappNumber: string;

  @ApiProperty({ enum: ['tenant', 'admin'], required: false })
  @IsOptional()
  @IsEnum(['tenant', 'admin'] as unknown as Role[])
  role?: Role;
}
