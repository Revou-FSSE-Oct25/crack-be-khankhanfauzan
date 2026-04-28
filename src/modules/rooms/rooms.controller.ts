import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { GetRoomsQueryDto } from './dto/get-rooms.dto';
import { RoomDto } from './dto/room.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Rooms')
@ApiExtraModels(RoomDto)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Roles('admin')
  @Post()
  @ApiBody({ type: CreateRoomDto })
  @ApiCreatedResponse({
    description: 'Kamar berhasil dibuat',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Room created' },
        data: { $ref: getSchemaPath(RoomDto) },
      },
    },
  })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Public()
  @Get()
  @ApiQuery({
    name: 'floor',
    required: false,
    type: Number,
    description: 'Filter lantai',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter status',
  })
  @ApiQuery({
    name: 'roomType',
    required: false,
    type: String,
    description: 'Filter jenis kamar',
  })
  @ApiQuery({
    name: 'price',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Urutkan harga',
  })
  @ApiOkResponse({
    description: 'Daftar kamar',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Rooms fetched' },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(RoomDto) },
        },
        meta: {
          type: 'object',
          properties: {
            totalRooms: { type: 'number', example: 22 },
            totalAvailable: { type: 'number', example: 14 },
            totalUnavailable: { type: 'number', example: 2 },
            totalOccupied: { type: 'number', example: 6 },
          },
        },
      },
    },
  })
  findAll(@Query() query: GetRoomsQueryDto) {
    return this.roomsService.findAll(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'ID kamar' })
  @ApiOkResponse({
    description: 'Detail kamar',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Room detail' },
        data: { $ref: getSchemaPath(RoomDto) },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Public()
  @Get(':id/availability')
  @ApiParam({ name: 'id', type: String, description: 'ID kamar' })
  @ApiOkResponse({
    description: 'Ketersediaan kamar',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Room is available for the selected dates',
        },
        data: {
          type: 'object',
          properties: {
            isAvailable: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  checkAvailability(
    @Param('id') id: string,
    @Query() query: CheckAvailabilityDto,
  ) {
    return this.roomsService.checkAvailability(
      id,
      query.startDate,
      query.endDate,
    );
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String, description: 'ID kamar' })
  @ApiOkResponse({
    description: 'Kamar berhasil diperbarui',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Room updated' },
        data: { $ref: getSchemaPath(RoomDto) },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiParam({ name: 'id', type: String, description: 'ID kamar' })
  @ApiOkResponse({
    description: 'Kamar berhasil dihapus',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Room deleted' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Kamar tidak ditemukan' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
