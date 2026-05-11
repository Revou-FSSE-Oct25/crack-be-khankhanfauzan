import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('tenant')
  @Roles('tenant')
  @ApiOperation({ summary: 'Get Tenant Home Dashboard Data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard fetched successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Dashboard fetched successfully' },
        data: {
          type: 'object',
          properties: {
            activeBooking: { type: 'object', nullable: true },
            stayInfo: { type: 'object', nullable: true },
            paymentReminder: { type: 'object', nullable: true },
            activeComplaints: { type: 'array', items: { type: 'object' } },
            recentTransactions: { type: 'array', items: { type: 'object' } },
            calendarEvents: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  })
  getTenantDashboard(@GetCurrentUser('sub') tenantId: string) {
    return this.dashboardService.getTenantDashboard(tenantId);
  }

  @Get('admin/summary')
  @Roles('admin')
  @ApiOperation({ summary: 'Get Admin Dashboard Summary Data' })
  @ApiQuery({ name: 'range', required: false, description: 'Range for sales report: "weekday" or "monthly"', example: 'weekday' })
  @ApiResponse({
    status: 200,
    description: 'Admin dashboard summary fetched successfully',
  })
  getAdminDashboardSummary(@Query('range') range: string) {
    return this.dashboardService.getAdminDashboardSummary(range);
  }
}
