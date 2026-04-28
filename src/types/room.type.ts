import { Facility } from './facility.type';

export type Room = {
  id: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  price: number;
  status: string;
  facilities: Facility[];
  dimensions?: RoomDimensions;
};

export type RoomDimensions = {
  length: number;
  width: number;
  area?: number;
  unit?: 'm';
};
