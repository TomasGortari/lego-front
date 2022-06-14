import { PartialItem } from '@directus/sdk';
import { IUser } from './user';

export interface IBooking {
  id: number;
  date_created: string;
  date_updated: string | null;
  name: string;
  quantity: number;
  buyer: string | PartialItem<IUser>;
  seller: string | PartialItem<IUser>;
  status: string;
  price_unity: number;
}
