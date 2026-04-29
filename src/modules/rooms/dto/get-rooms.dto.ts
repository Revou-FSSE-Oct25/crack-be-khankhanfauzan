import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class GetRoomsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter lantai', example: 2 })
  @IsOptional()
  @IsNumber()
  floor?: number;
  @ApiPropertyOptional({ description: 'Filter status', example: 'available' })
  @IsOptional()
  @IsString()
  status?: string;
  @ApiPropertyOptional({
    description: 'Filter jenis kamar',
    example: 'standard',
  })
  @IsOptional()
  @IsString()
  roomType?: string;
  @ApiPropertyOptional({ description: 'Urutkan harga', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  price?: 'asc' | 'desc';
}
