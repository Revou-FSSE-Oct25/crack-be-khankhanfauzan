import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { FacilitiesRepository } from './facilities.repository';

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

  async findAll() {
    const facilities = await this.repository.findAll();
    return {
      status: 200,
      message: 'List of all facilities',
      data: facilities,
    };
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
