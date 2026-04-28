import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Facilities')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post()
  create(@Body() createFacilityDto: CreateFacilityDto) {
    return this.facilitiesService.create(createFacilityDto);
  }

  @Get()
  findAll() {
    return this.facilitiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get facility by ID' })
  @ApiResponse({ status: 200, description: 'Facility found.' })
  @ApiResponse({ status: 404, description: 'Facility not found.' })
  findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a facility (Admin only)' })
  @ApiResponse({ status: 200, description: 'Facility updated.' })
  @ApiResponse({ status: 404, description: 'Facility not found.' })
  update(
    @Param('id') id: string,
    @Body() updateFacilityDto: UpdateFacilityDto,
  ) {
    return this.facilitiesService.update(id, updateFacilityDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a facility (Admin only)' })
  @ApiResponse({ status: 200, description: 'Facility deleted.' })
  @ApiResponse({ status: 404, description: 'Facility not found.' })
  remove(@Param('id') id: string) {
    return this.facilitiesService.remove(id);
  }
}
