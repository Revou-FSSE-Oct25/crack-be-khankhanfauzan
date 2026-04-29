import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { GetFacilitiesQueryDto } from './dto/get-facilities.dto';
import { FacilitiesRepository } from './facilities.repository';
import type { ApiListResponse } from 'src/types/api-response.interface';
import { Prisma, Facility } from '@prisma/client';

@Injectable()
export class FacilitiesService {
  constructor(private readonly repository: FacilitiesRepository) {}

  async create(createFacilityDto: CreateFacilityDto) {
    const existing = await this.repository.findByName(createFacilityDto.name);
    if (existing) {
      throw new ConflictException(
        `Facility with name '${createFacilityDto.name}' already exists`,
      );
    }

    const newFacility = await this.repository.create({
      name: createFacilityDto.name,
    });
    return {
      status: 201,
      message: 'Facility created',
      data: newFacility,
    };
  }

  async findAll(query?: GetFacilitiesQueryDto): Promise<
    ApiListResponse<
      Facility,
      {
        totalItems: number;
        page: number;
        perPage: number;
        totalPages: number;
      }
    >
  > {
    const { page = 1, perPage = 10, name } = query || {};

    const where: Prisma.FacilityWhereInput = {};
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    const [data, totalItems] = await Promise.all([
      this.repository.findAll({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        orderBy: { name: 'asc' },
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

    return { status: 200, message: 'Facilities fetched', data, meta };
  }

  async findOne(id: string) {
    const facility = await this.repository.findById(id);
    if (!facility) {
      throw new NotFoundException('Facility not found');
    }
    return {
      status: 200,
      message: 'Facility fetched successfully',
      data: facility,
    };
  }

  async update(id: string, updateFacilityDto: UpdateFacilityDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Facility not found');
    }

    const updated = await this.repository.update(id, {
      name: updateFacilityDto.name,
    });
    return {
      status: 200,
      message: 'Facility updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Facility not found');
    }

    await this.repository.remove(id);

    return {
      status: 200,
      message: 'Facility deleted',
    };
  }
}
