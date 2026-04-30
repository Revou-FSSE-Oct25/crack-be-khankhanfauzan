import { Test, TestingModule } from '@nestjs/testing';
import { MaintenancesController } from './maintenances.controller';
import { MaintenancesService } from './maintenances.service';

describe('MaintenancesController', () => {
  let controller: MaintenancesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenancesController],
      providers: [MaintenancesService],
    }).compile();

    controller = module.get<MaintenancesController>(MaintenancesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
