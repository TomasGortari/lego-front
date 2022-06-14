import { PartialItem } from '@directus/sdk';
import { IAnnouncement } from './announcement';
import { ITag } from './tag';

export interface ITagAnnounce {
  id: number;
  announcement_id: number | PartialItem<IAnnouncement>;
  tags_id: string | PartialItem<ITag>;
}
