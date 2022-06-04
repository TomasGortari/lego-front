import { PartialItem } from '@directus/sdk';
import { IAnnoucement } from './announcement';

export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  location: any;
  title: any;
  description: any;
  tags: any;
  avatar: any;
  language: any;
  theme: string;
  tfa_secret: any;
  status: string;
  role: string;
  token: any;
  last_access: string;
  last_page: string;
  provider: string;
  external_identifier: any;
  auth_data: any;
  email_notifications: boolean;
  announcement: number[] | PartialItem<IAnnoucement>[];
}
