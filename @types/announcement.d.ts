import { PartialItem } from '@directus/sdk';
import { ITag } from './tag';
import { IUser } from './user';

export interface IAnnouncement {
  id: number;
  date_created: string;
  date_updated: string | null;
  name: string;
  price: number;
  quantity: number;
  user: string | PartialItem<IUser>;
  description: string;
  tags: number[] | PartialItem<ITag>[];
}
