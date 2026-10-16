import { h } from 'vue';
import { NTag } from 'naive-ui';

export const columns = [
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
    title: 'Base URL',
    key: 'base_url',
  },
  {
    title: '项目负责人',
    key: 'project_leader.name',
    render(record: any) {
      return record.project_leader?.name || '-';
    },
  },
  {
    title: '项目成员',
    key: 'user_list',
    render(record: any) {
      const userList = record.user_list || [];
      return h(
        'div',
        {},
        userList.map((user: any) =>
          h(
            NTag,
            { size: 'small', style: { marginRight: '4px' } },
            { default: () => user.name }
          )
        )
      );
    },
  },
];
