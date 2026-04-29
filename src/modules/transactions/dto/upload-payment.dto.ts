import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadPaymentProofDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Invoice ID' })
  @IsNotEmpty()
  @IsString()
  invoiceId: string;

  @ApiProperty({ example: 1000000, description: 'Amount paid' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Bank Transfer', description: 'Payment Method', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
