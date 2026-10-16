import { BasicColumn } from '@/components/Table';

export interface RoleData {
  id: number;
  user_detail: {
    id: number;
    name: string;
    head_img: string;
  };
  department_detail: {
    id: number;
    name: string;
  };
  position_detail: {
    id: number;
    name: string;
  };
}

export const columns: BasicColumn<RoleData>[] = [
  {
    title: 'id',
    key: 'id',
  },
  {
    title: '用户昵称',
    key: 'user_detail.name',
  },
  {
    title: '所属部门',
    key: 'department_detail.name',
  },
  {
    title: '职位名称',
    key: 'position_detail.name',
  },
];
