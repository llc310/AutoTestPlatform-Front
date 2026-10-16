import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { ProjectOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/suite',
    name: 'Suite',
    redirect: '/suite/suite',
    component: Layout,
    meta: {
      title: '测试套件',
      icon: renderIcon(ProjectOutlined),
      sort: 4,
    },
    children: [
      {
        path: 'suite',
        name: 'suite-suite',
        meta: {
          title: '套件管理',
        },
        component: () => import('@/views/suite/suite.vue'),
      },
      {
        path: 'runresult',
        name: 'suite-runresult',
        meta: {
          title: '执行结果',
        },
        component: () => import('@/views/suite/runresult.vue'),
      }
    ],
  },
];

export default routes;
