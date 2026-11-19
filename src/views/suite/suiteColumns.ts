import { BasicColumn } from '@/components/Table';

export interface ProjectData {
  id: number;
  name: string;
  description?: string;
  base_url?: string;
}

export const columns: BasicColumn<ProjectData>[] = [
  {
    title: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '项目名称',
    key: 'name',
  },
  {
    title: '项目描述',
    key: 'description',
  },
  {
    title: 'BaseURL',
    key: 'base_url',
  },
];
