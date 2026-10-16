import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { TableOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/account',
    name: 'Account',
    redirect: '/accont/profile',
    component: Layout,
    meta: {
      title: '个人中心',
      icon: renderIcon(TableOutlined),
      sort: 6,
    },
    children: [
      {
        path: 'profile',
        name: 'account-profile',
        meta: {
          title: '个人资料',
        },
        component: () => import('@/views/account/profile.vue'),
      },
      {
        path: 'rest_password',
        name: 'account-rest_password',
        meta: {
          title: '修改密码',
        },
        component: () => import('@/views/account/rest_password.vue'),
      }
    ],
  },
];

export default routes;
