import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class GetFacilitiesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Cari berdasarkan nama fasilitas',
    example: 'AC',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
