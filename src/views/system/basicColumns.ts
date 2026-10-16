import { h } from 'vue';
import { NImage } from 'naive-ui';
import { BasicColumn } from '@/components/Table';

export interface Leader {
  leader_name: string;
  head_img: string;
}

export interface ListData {
  id: number;
  name: string;
  description?: string;
  leader: Leader | null;
}

export const columns: BasicColumn<ListData>[] = [
  {
    title: 'id',
    key: 'id',
  },
  {
    title: '部门名称',
    key: 'name',
  },
  {
    title: '部门简介',
    key: 'description',
  },
  {
    title: '领导名称',
    key: 'leader.leader_name',
  },
  {
    title: '领导头像',
    key: 'leader.head_img',
    render(record) {
      if (!record.leader || !record.leader.head_img) return null;
      return h(NImage, {
        width: 50,
        height: 50,
        src: record.leader.head_img,
        objectFit: 'cover',
      });
    },
  },
];
