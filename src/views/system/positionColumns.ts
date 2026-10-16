import { BasicColumn } from '@/components/Table';

export interface PositionData {
  id: number;
  name: string;
  is_leader: boolean;
}

export const columns: BasicColumn<PositionData>[] = [
  {
    title: 'id',
    key: 'id',
  },
  {
    title: '职位名称',
    key: 'name',
  },
  {
    title: '是否领导职位',
    key: 'is_leader',
    render(record) {
      return record.is_leader ? '是' : '否';
    },
  },
];
