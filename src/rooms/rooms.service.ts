import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsRepository } from './rooms.repository';
import { GetRoomsQueryDto } from './dto/get-rooms.dto';

@Injectable()
export class RoomsService {
  constructor(private roomsRepository: RoomsRepository) {}

  create(createRoomDto: CreateRoomDto) {
    return this.roomsRepository.create(createRoomDto);
  }

  findAll(query?: GetRoomsQueryDto) {
    if (!query || Object.keys(query).length === 0) {
      return this.roomsRepository.findAll();
    }
    return this.roomsRepository.query(query);
  }

  findOne(id: number) {
    const room = this.roomsRepository.findOne(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    const updated = this.roomsRepository.update(id, updateRoomDto);
    if (!updated) {
      throw new NotFoundException('Room not found');
    }
    return updated;
  }

  remove(id: number) {
    const removed = this.roomsRepository.remove(id);
    if (!removed) {
      throw new NotFoundException('Room not found');
    }
  }
}
