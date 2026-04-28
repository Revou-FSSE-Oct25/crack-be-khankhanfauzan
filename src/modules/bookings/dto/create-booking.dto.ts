import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { RentType } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({
    example: 'uuid-room-123',
    description: 'ID of the room to book',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    enum: RentType,
    example: RentType.monthly,
    description: 'Type of rent (daily, weekly, monthly, yearly)',
  })
  @IsEnum(RentType)
  @IsNotEmpty()
  rentType: RentType;

  @ApiProperty({
    example: 1,
    description: 'Duration of the rent based on rentType',
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  @ApiProperty({
    example: '2026-05-01T00:00:00Z',
    description: 'Start date of the booking',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;
}
