import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MaintenancesService } from './maintenances.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance.dto';
import { GetMaintenancesQueryDto } from './dto/get-maintenances.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';

@ApiTags('Maintenances')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('maintenances')
export class MaintenancesController {
  constructor(private readonly maintenancesService: MaintenancesService) { }

  @Post()
  @Roles('tenant')
  @ApiOperation({ summary: 'Create a maintenance request (Tenant)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @GetCurrentUser('sub') tenantId: string,
    @Body() createMaintenanceDto: CreateMaintenanceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.maintenancesService.create(tenantId, createMaintenanceDto, files);
  }

  @Get()
  @Roles('admin', 'tenant')
  @ApiOperation({ summary: 'Get all maintenance requests with pagination & filtering' })
  findAll(
    @Query() query: GetMaintenancesQueryDto,
    @GetCurrentUser() user: any
  ) {
    // If tenant, only show their own maintenance requests
    if (user.role === 'tenant') {
      query.search = query.search || ''; // We'll handle this in the service or just pass tenantId directly
    }
    return this.maintenancesService.findAll(query, user.role === 'tenant' ? user.sub : undefined);
  }

  @Get(':id')
  @Roles('admin', 'tenant')
  @ApiOperation({ summary: 'Get maintenance request details' })
  findOne(@Param('id') id: string) {
    return this.maintenancesService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Update maintenance request status (Admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceStatusDto
  ) {
    return this.maintenancesService.updateStatus(id, updateMaintenanceDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a maintenance request (Admin)' })
  remove(@Param('id') id: string) {
    return this.maintenancesService.remove(id);
  }
}

