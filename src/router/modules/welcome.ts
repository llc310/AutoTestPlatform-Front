import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { HomeOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/welcome',
    name: 'Welcome',
    redirect: '/welcome/index',
    component: Layout,
    meta: {
      title: '欢迎页',
      icon: renderIcon(HomeOutlined),
      sort: 0,
    },
    children: [
      {
        path: 'index',
        name: 'welcome-index',
        meta: {
          title: '欢迎页',
        },
        component: () => import('@/views/welcome/welcome.vue'),
      },
    ],
  },
];

export default routes;
