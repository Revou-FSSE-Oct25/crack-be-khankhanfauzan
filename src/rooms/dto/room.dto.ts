import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({ type: [String] })
  facilities: string[];
}
