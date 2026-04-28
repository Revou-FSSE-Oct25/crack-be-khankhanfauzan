import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class CheckAvailabilityDto {
  @ApiProperty({
    example: '2026-05-01T00:00:00Z',
    description: 'Start date to check',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2026-05-08T00:00:00Z',
    description: 'End date to check',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
