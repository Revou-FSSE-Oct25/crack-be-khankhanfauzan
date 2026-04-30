import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('tenant')
  @Roles('tenant')
  @ApiOperation({ summary: 'Get Tenant Home Dashboard Data' })
  getTenantDashboard(@GetCurrentUser('sub') tenantId: string) {
    return this.dashboardService.getTenantDashboard(tenantId);
  }
}
