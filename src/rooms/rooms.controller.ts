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
  ParseIntPipe,
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

@ApiTags('Rooms')
@ApiExtraModels(RoomDto)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

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
    const data = this.roomsService.create(createRoomDto);
    return { status: 201, message: 'Room created', data };
  }

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
    const data = this.roomsService.findAll(query);
    const totalRooms = data.length;
    const totalAvailable = data.filter((r) => r.status === 'available').length;
    const totalUnavailable = data.filter(
      (r) => r.status === 'unavailable',
    ).length;
    const totalOccupied = data.filter((r) => r.status === 'occupied').length;
    const meta = {
      totalRooms,
      totalAvailable,
      totalUnavailable,
      totalOccupied,
    };
    return { status: 200, message: 'Rooms fetched', data, meta };
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number, description: 'ID kamar' })
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    const data = this.roomsService.findOne(id);
    return { status: 200, message: 'Room detail', data };
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: Number, description: 'ID kamar' })
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    const data = this.roomsService.update(id, updateRoomDto);
    return { status: 200, message: 'Room updated', data };
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number, description: 'ID kamar' })
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
  remove(@Param('id', ParseIntPipe) id: number) {
    this.roomsService.remove(id);
    return { status: 200, message: 'Room deleted' };
  }
}
