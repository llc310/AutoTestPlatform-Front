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
      alwaysShow: true,
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
        path: 'suite_list/:id?',
        name: 'suite-suite_list',
        meta: {
          title: '项目套件列表',
          singleTab: true,
          hidden: true,
        },
        component: () => import('@/views/suite/suiteList.vue'),
      },
      {
        path: 'suite_edit/:id?',
        name: 'suite-suite_edit',
        meta: {
          title: '修改套件信息',
          singleTab: true,
          hidden: true,
        },
        component: () => import('@/views/suite/suite_edit.vue'),
      },
    ],
  },
];

export default routes;
