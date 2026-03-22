import { IsArray, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({ type: [String] })
  @IsArray()
  facilities: string[];
}
