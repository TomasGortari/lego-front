import { PartialItem } from '@directus/sdk';
import { IAnnouncement } from './announcement';
import { IFile } from './file';

export interface IGallery {
  id: number;
  announcement_id: number | PartialItem<IAnnouncement>;
  directus_files_id: string | PartialItem<IFile>;
}
