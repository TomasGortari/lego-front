import { PartialItem } from '@directus/sdk';
import { IAnnoucement } from './announcement';

export interface ITag {
  id: number;
  name: string;
  announces: number[] | PartialItem<IAnnoucement>[];
}
