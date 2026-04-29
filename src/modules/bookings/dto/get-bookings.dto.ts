import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class GetBookingsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter status booking',
    example: 'pending_payment',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID Tenant',
    example: 'uuid-123',
  })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID Kamar',
    example: 'uuid-456',
  })
  @IsOptional()
  @IsString()
  roomId?: string;
}
