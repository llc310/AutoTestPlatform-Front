import { BasicColumn } from '@/components/Table';

export interface ElementData {
  id: number;
  name: string;
  /** 定位方式，如 xpath / css / id */
  by: string;
  /** 定位值 */
  path: string;
  project_id: number;
}

export const columns: BasicColumn<ElementData>[] = [
  {
    title: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '元素名称',
    key: 'name',
  },
  {
    title: '定位方式',
    key: 'by',
    render: (row) => row.by || '-',
  },
  {
    title: '定位值',
    key: 'path',
    render: (row) => row.path || '-',
  },
];
