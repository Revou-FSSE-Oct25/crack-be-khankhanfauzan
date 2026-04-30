import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from '@prisma/client';

export class UpdateMaintenanceStatusDto {
  @ApiProperty({ enum: ComplaintStatus, example: 'in_progress' })
  @IsNotEmpty()
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;

  @ApiProperty({ required: false, example: 'Technician dispatched' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
