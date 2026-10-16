import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { FormOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/project',
    name: 'Project',
    redirect: '/project/project',
    component: Layout,
    meta: {
      title: '项目管理',
      icon: renderIcon(FormOutlined),
      sort: 1,
    },
    children: [
      {
        path: 'project',
        name: 'project-project',
        meta: {
          title: '项目信息',
        },
        component: () => import('@/views/project/project.vue'),
      },
      {
        path: 'config',
        name: 'project-config',
        meta: {
          title: '项目配置',
        },
        component: () => import('@/views/project/config.vue'),
      },
      {
        path: 'project_edit/:id?',
        name: 'project-project_edit',
        meta: {
          title: '修改项目信息',
          singleTab: true,
          hidden: true,
        },
        component: () => import('@/views/project/project_edit.vue'),
      }
    ],
  },
];

export default routes;
