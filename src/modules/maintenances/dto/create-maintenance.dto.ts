import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ComplaintCategory } from '@prisma/client';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'c0877c51-f8c6-4e0e-816a-ced0c57934af', required: false })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiProperty({ enum: ComplaintCategory, example: 'plumbing' })
  @IsNotEmpty()
  @IsEnum(ComplaintCategory)
  category: ComplaintCategory;

  @ApiProperty({ example: 'The sink is leaking heavily.' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
