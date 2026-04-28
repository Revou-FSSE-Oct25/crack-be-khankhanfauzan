import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Facility } from 'src/types/facility.type';
import { RoomDimensionsDto } from './room-dimensions.dto';
import { Type } from 'class-transformer';
import { FacilityDto } from './facility.dto';

export class UpdateRoomDto {
  @ApiPropertyOptional({ example: 'standard' })
  @IsOptional()
  @IsString()
  roomType?: string;
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  floor?: number;
  @ApiPropertyOptional({ example: 1500000 })
  @IsOptional()
  @IsNumber()
  price?: number;
  @ApiPropertyOptional({
    example: 'available',
    enum: ['available', 'occupied', 'unavailable'],
  })
  @IsOptional()
  @IsString()
  status?: string;
  @ApiPropertyOptional({ type: [FacilityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilityDto)
  facilities?: Facility[];
  @ApiPropertyOptional({ type: RoomDimensionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RoomDimensionsDto)
  dimensions?: RoomDimensionsDto;
}
