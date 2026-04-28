import { ApiProperty } from '@nestjs/swagger';
import { FacilityDto } from './facility.dto';
import { RoomDimensionsDto } from './room-dimensions.dto';

export class RoomDto {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: '101' })
  roomNumber: string;
  @ApiProperty({ example: 'standard' })
  roomType: string;
  @ApiProperty({ example: 1 })
  floor: number;
  @ApiProperty({ example: 1500000 })
  price: number;
  @ApiProperty({
    example: 'available',
    enum: ['available', 'occupied', 'unavailable'],
  })
  status: string;
  @ApiProperty({ type: [FacilityDto] })
  facilities: FacilityDto[];
  @ApiProperty({ type: RoomDimensionsDto })
  dimensions: RoomDimensionsDto;
}
