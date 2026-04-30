import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'b0877c51-f8c6-4e0e-816a-ced0c57934af' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ required: false, example: 'Great room, very clean!' })
  @IsOptional()
  @IsString()
  comment?: string;
}
