import { Injectable } from '@nestjs/common';
import { Room } from './types/room.type';
import { roomsMock } from './data/rooms.mock';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsRepository {
  private rooms: Room[] = roomsMock;

  findAll(): Room[] {
    return this.rooms;
  }

  query(options: {
    floor?: number;
    status?: string;
    roomType?: string;
    price?: 'asc' | 'desc';
  }): Room[] {
    let result = [...this.rooms];
    if (options.floor !== undefined) {
      result = result.filter((r) => r.floor === options.floor);
    }
    if (options.status !== undefined) {
      result = result.filter((r) => r.status === options.status);
    }
    if (options.roomType !== undefined) {
      result = result.filter((r) => r.roomType === options.roomType);
    }
    if (options.price !== undefined) {
      result.sort((a, b) =>
        options.price === 'asc' ? a.price - b.price : b.price - a.price,
      );
    }
    return result;
  }

  findOne(id: number): Room | undefined {
    return this.rooms.find((room) => room.id === id);
  }

  create(room: CreateRoomDto): Room {
    const newRoom: Room = {
      ...room,
      id: this.rooms.length + 1,
    };
    this.rooms.push(newRoom);
    return newRoom;
  }
  update(id: number, updateRoomDto: UpdateRoomDto): Room | undefined {
    const index = this.rooms.findIndex((room) => room.id === id);
    if (index === -1) {
      return undefined;
    }
    const updated: Room = {
      ...this.rooms[index],
      ...updateRoomDto,
    };
    this.rooms[index] = updated;
    return updated;
  }

  remove(id: number): Room | undefined {
    const index = this.rooms.findIndex((room) => room.id === id);
    if (index === -1) {
      return undefined;
    }
    const [removed] = this.rooms.splice(index, 1);
    return removed;
  }
}
