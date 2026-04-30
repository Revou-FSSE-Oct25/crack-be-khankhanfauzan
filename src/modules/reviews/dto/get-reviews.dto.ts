import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class GetReviewsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by room ID' })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional({ description: 'Filter by tenant ID' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
