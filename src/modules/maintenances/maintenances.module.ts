import { Module } from '@nestjs/common';
import { MaintenancesService } from './maintenances.service';
import { MaintenancesController } from './maintenances.controller';
import { MaintenancesRepository } from './maintenances.repository';

@Module({
  controllers: [MaintenancesController],
  providers: [MaintenancesService, MaintenancesRepository],
  exports: [MaintenancesService, MaintenancesRepository],
})
export class MaintenancesModule {}
