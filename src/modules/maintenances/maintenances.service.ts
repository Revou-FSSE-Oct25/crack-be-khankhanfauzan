import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance.dto';
import { MaintenancesRepository } from './maintenances.repository';
import { GetMaintenancesQueryDto } from './dto/get-maintenances.dto';
import { ApiListResponse } from 'src/types/api-response.interface';
import { Maintenance, Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class MaintenancesService {
  constructor(
    private readonly repository: MaintenancesRepository,
    private readonly cloudinary: CloudinaryService
  ) { }

  async create(tenantId: string, dto: CreateMaintenanceDto, files: Express.Multer.File[]) {
    let images: string[] = [];
    
    if (files && files.length > 0) {
      try {
        const uploadPromises = files.map(file => this.cloudinary.uploadImage(file));
        const uploadResults = await Promise.all(uploadPromises);
        images = uploadResults.map(result => result.secure_url);
      } catch (error) {
        throw new BadRequestException('Failed to upload maintenance images');
      }
    }

    const data = await this.repository.create({
      category: dto.category,
      description: dto.description,
      images,
      tenant: { connect: { id: tenantId } },
      ...(dto.roomId && { room: { connect: { id: dto.roomId } } })
    });

    return { status: 201, message: 'Maintenance request created', data };
  }

  async findAll(query?: GetMaintenancesQueryDto, tenantId?: string): Promise<ApiListResponse<Maintenance, { totalItems: number; page: number; perPage: number; totalPages: number; }>> {
    const { page = 1, perPage = 10, status, category, search, startDate, endDate } = query || {};
    const where: Prisma.MaintenanceWhereInput = {};

    if (tenantId) where.tenantId = tenantId;


    if (status) where.status = status;
    if (category) where.category = category;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tenantId: { contains: search, mode: 'insensitive' } },
        {
          room: {
            roomNumber: { contains: search, mode: 'insensitive' }
          }
        },
        {
          tenant: {
            profile: {
              fullName: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    const [data, totalItems] = await Promise.all([
      this.repository.findAll({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          room: true,
          tenant: { include: { profile: true } }
        }
      }),
      this.repository.count(where),
    ]);

    const totalPages = Math.ceil(totalItems / perPage);

    const meta = {
      totalItems,
      page,
      perPage,
      totalPages,
    };

    return { status: 200, message: 'Maintenances fetched', data: data, meta };
  }

  async findOne(id: string) {
    const data = await this.repository.findAll({
      where: { id },
      include: {
        room: true,
        tenant: { include: { profile: true } }
      }
    });

    if (!data.length) throw new NotFoundException('Maintenance request not found');
    return { status: 200, message: 'Maintenance fetched', data: data[0] };
  }

  async updateStatus(id: string, dto: UpdateMaintenanceStatusDto) {
    const maintenance = await this.findOne(id);

    const data = await this.repository.update(id, {
      status: dto.status,
      ...(dto.adminNotes && { adminNotes: dto.adminNotes })
    });

    return { status: 200, message: 'Maintenance status updated', data };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete(id);
    return { status: 200, message: 'Maintenance request deleted', data: null };
  }
}
