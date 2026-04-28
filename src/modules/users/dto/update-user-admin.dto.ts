import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import type { MaritalStatus, Role } from 'src/types/user.type';

export class UpdateUserAdminDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @ApiPropertyOptional({ enum: ['single', 'married'] })
  @IsOptional()
  @IsEnum(['single', 'married'] as unknown as MaritalStatus[])
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ktpUrl?: string | null;

  @ApiPropertyOptional()
  @ValidateIf((o: UpdateUserAdminDto) => o.maritalStatus === 'married')
  @IsString()
  marriageUrl?: string | null;

  @ApiPropertyOptional({ enum: ['tenant', 'admin'] })
  @IsOptional()
  @IsEnum(['tenant', 'admin'] as unknown as Role[])
  role?: Role;
}
