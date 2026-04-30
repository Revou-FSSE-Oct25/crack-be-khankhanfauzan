import { Test, TestingModule } from '@nestjs/testing';
import { MaintenancesService } from './maintenances.service';

describe('MaintenancesService', () => {
  let service: MaintenancesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaintenancesService],
    }).compile();

    service = module.get<MaintenancesService>(MaintenancesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
