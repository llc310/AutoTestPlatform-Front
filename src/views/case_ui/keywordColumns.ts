import { BasicColumn } from '@/components/Table';

export interface KeyWordData {
  id: number;
  /** 关键字名 */
  keyword_name: string;
  /** 操作描述 */
  description: string;
}

export const columns: BasicColumn<KeyWordData>[] = [
  {
    title: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '关键字名',
    key: 'keyword_name',
    render: (row) => row.keyword_name,
  },
  {
    title: '操作描述',
    key: 'description',
    render: (row) => row.description || '-',
  },
];
