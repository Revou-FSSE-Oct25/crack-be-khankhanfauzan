import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class GetUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan role (admin/tenant)',
    example: 'tenant',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Cari berdasarkan nama, email, atau phone',
    example: 'Fauzan',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
