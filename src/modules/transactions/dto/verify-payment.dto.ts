import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class VerifyPaymentDto {
  @ApiProperty({ enum: TransactionStatus, example: 'verified' })
  @IsNotEmpty()
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiProperty({ required: false, description: 'Required if rejected' })
  @IsOptional()
  @IsString()
  rejectReason?: string;
}
