import { PartialItem } from '@directus/sdk';
import { IFile } from './file';
import { IGallery } from './gallery';
import { ITag } from './tag';
import { ITagAnnounce } from './tag_announce';
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
  tags: number[] | PartialItem<ITagAnnounce>[] | string[];
  gallery: string[] | IGallery[] | string[];
  slug: string;
}
