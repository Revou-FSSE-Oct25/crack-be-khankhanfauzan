import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) { }

  @Get()
  @ApiOperation({ summary: 'Get all invoices for current user' })
  @ApiOkResponse({
    description: 'List of invoices',
  })
  findAll(
    @GetCurrentUser('sub') currentUserId: string,
    @GetCurrentUser('role') currentUserRole: string,
  ) {
    return this.invoicesService.findAll(currentUserId, currentUserRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }
}
