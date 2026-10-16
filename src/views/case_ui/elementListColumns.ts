import { BasicColumn } from '@/components/Table';

export interface ElementData {
  id: number;
  name: string;
  locator: {
    by: string;
    value: string;
  };
  project: number;
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
    key: 'locator.by',
  },
  {
    title: '定位值',
    key: 'locator.value',
  },
];
