import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomDto {
    @ApiPropertyOptional({ example: 'standard' })
    @IsOptional()
    @IsString()
    roomType?: string;
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    floor?: number;
    @ApiPropertyOptional({ example: 1500000 })
    @IsOptional()
    @IsNumber()
    price?: number;
    @ApiPropertyOptional({
        example: 'available',
        enum: ['available', 'occupied', 'unavailable'],
    })
    @IsOptional()
    @IsString()
    status?: string;
    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    facilities?: string[];
}
