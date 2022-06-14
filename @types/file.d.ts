export interface IFile {
  id: string;
  storage: string;
  filename_disk: string;
  filename_download: string;
  title: string;
  type: string;
  folder: any;
  uploaded_by: string;
  uploaded_on: string;
  modified_by: any;
  modified_on: string;
  filesize: number;
  width: number;
  height: number;
  duration: any;
  description: any;
  location: any;
  tags: string[];
  metadata: Metadata;
}

export interface Metadata {
  icc: Icc;
}

export interface Icc {
  version: string;
  intent: string;
  cmm: string;
  deviceClass: string;
  colorSpace: string;
  connectionSpace: string;
  platform: string;
  creator: string;
  description: string;
  copyright: string;
}
