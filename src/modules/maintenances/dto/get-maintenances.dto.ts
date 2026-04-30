import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ComplaintCategory, ComplaintStatus } from '@prisma/client';

export class GetMaintenancesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by room number, maintenance id, tenant name, tenant id, description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ComplaintStatus })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiPropertyOptional({ enum: ComplaintCategory })
  @IsOptional()
  @IsEnum(ComplaintCategory)
  category?: ComplaintCategory;

  @ApiPropertyOptional({ description: 'Start date filter (ISO format)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO format)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
