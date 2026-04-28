import { IsOptional, IsString } from 'class-validator';

export class CreateFacilityDto {
  @IsString()
  name: string;

  @IsOptional()
  description?: string | null;
}
