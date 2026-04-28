import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class RoomDimensionsDto {
  @ApiProperty({ example: 3 })
  @IsNumber()
  length: number;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  width: number;

  @ApiPropertyOptional({ example: 13.5 })
  @IsOptional()
  @IsNumber()
  area?: number;

  @ApiPropertyOptional({ example: 'm', enum: ['m'] })
  @IsOptional()
  @IsIn(['m'])
  unit?: 'm';
}
