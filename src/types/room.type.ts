import { Facility } from './facility.type';

export type Room = {
  id: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  price: number;
  priceDaily?: number;
  priceWeekly?: number;
  priceMonthly: number;
  priceYearly?: number;
  status: string;
  facilities: Facility[];
  dimensions?: RoomDimensions;
  images?: string[];
};

export type RoomDimensions = {
  length: number;
  width: number;
  area?: number;
  unit?: string;
};
