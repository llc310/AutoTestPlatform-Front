import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { DashboardOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/case_api',
    name: 'Case_api',
    redirect: '/case_api/endpoint',
    component: Layout,
    meta: {
      title: '接口测试',
      icon: renderIcon(DashboardOutlined),
      sort: 3,
    },
    children: [
      {
        path: 'endpoint',
        name: 'case_api-endpoint',
        meta: {
          title: '接口管理',
        },
        component: () => import('@/views/case_api/endpoint.vue'),
      },
      {
        path: 'case',
        name: 'case_api-case',
        meta: {
          title: '用例管理',
        },
        component: () => import('@/views/case_api/case.vue'),
      },
    ],
  },
];

export default routes;
