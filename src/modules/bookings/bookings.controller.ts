import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { GetBookingsQueryDto } from './dto/get-bookings.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles('tenant')
  @ApiOperation({ summary: 'Create a new booking (Tenant only)' })
  create(
    @GetCurrentUser('sub') tenantId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(tenantId, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings with pagination and filtering' })
  @ApiOkResponse({
    description: 'Daftar transaksi booking',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Bookings fetched' },
        data: {
          type: 'array',
          items: { type: 'object' }, // Idealnya kita referensikan ke BookingDto
        },
        meta: {
          type: 'object',
          properties: {
            totalItems: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            perPage: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  findAll(@Query() query: GetBookingsQueryDto) {
    return this.bookingsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific booking' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles('admin')
  @ApiOperation({ summary: 'Approve a booking (Admin only)' })
  approve(@Param('id') id: string) {
    return this.bookingsService.approveBooking(id);
  }

  @Patch(':id/reject')
  @Roles('admin')
  @ApiOperation({ summary: 'Reject a booking (Admin only)' })
  reject(@Param('id') id: string) {
    return this.bookingsService.rejectBooking(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
