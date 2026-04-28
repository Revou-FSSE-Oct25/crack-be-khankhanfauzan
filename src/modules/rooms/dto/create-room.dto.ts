import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Facility } from 'src/types/facility.type';
import { RoomDimensionsDto } from './room-dimensions.dto';
import { Type } from 'class-transformer';
import { FacilityDto } from './facility.dto';

export class CreateRoomDto {
  @ApiProperty({ example: '101' })
  @IsString()
  roomNumber: string;
  @ApiProperty({ example: 'standard' })
  @IsString()
  roomType: string;
  @ApiProperty({ example: 1 })
  @IsNumber()
  floor: number;
  @ApiProperty({ example: 1500000 })
  @IsNumber()
  price: number;
  @ApiProperty({
    example: 'available',
    enum: ['available', 'occupied', 'unavailable'],
  })
  @IsString()
  status: string;
  @ApiProperty({ type: [FacilityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilityDto)
  facilities: Facility[];
  @ApiPropertyOptional({ type: RoomDimensionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RoomDimensionsDto)
  dimensions?: RoomDimensionsDto;
}
