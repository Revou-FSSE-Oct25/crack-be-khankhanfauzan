import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import type { MaritalStatus } from 'src/types/user.type';

const requireMarriage = (o: UpdateProfileDto) => o.maritalStatus === 'married';

export class UpdateProfileDto {
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
  @ValidateIf(requireMarriage)
  @IsString()
  marriageUrl?: string | null;
}
