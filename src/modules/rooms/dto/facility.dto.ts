import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FacilityDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'AC' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'AC Inverter 1 PK' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
