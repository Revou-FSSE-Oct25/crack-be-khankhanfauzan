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

  @ApiPropertyOptional({ enum: ['single', 'married'] })
  @IsOptional()
  @IsEnum(['single', 'married'] as unknown as MaritalStatus[])
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'File Foto Profile' })
  @IsOptional()
  fotoProfileUrl?: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'File Foto KTP' })
  @IsOptional()
  fotoKtpUrl?: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'File Foto Buku Nikah' })
  @IsOptional()
  fotoBukuNikahUrl?: any;
}
