import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { WalletOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/case_ui',
    name: 'Case_ui',
    redirect: '/case_ui/element',
    component: Layout,
    meta: {
      title: 'UI测试',
      icon: renderIcon(WalletOutlined),
      sort: 2,
    },
    children: [
      {
        path: 'element',
        name: 'case_ui-element',
        meta: {
          title: '元素管理',
        },
        component: () => import('@/views/case_ui/element.vue'),
      },
      {
        path: 'element_list/:id?',
        name: 'case_ui-element_list',
        meta: {
          title: '项目元素列表',
          singleTab: true,
          hidden: true,
        },
        component: () => import('@/views/case_ui/elementList.vue'),
      },
      {
        path: 'element_edit/:id?',
        name: 'case_ui-element_edit',
        meta: {
          title: '修改元素信息',
          singleTab: true,
          hidden: true,
        },
        component: () => import('@/views/case_ui/element_edit.vue'),
      },
      {
        path: 'case_list/:id?',
        name: 'case_ui-case_list',
        meta: {
          title: '项目用例列表',
          singleTab: true,
          hidden: true,
        },
        component: () => import('@/views/case_ui/caseList.vue'),
      },
      {
        path: 'case',
        name: 'case_ui-case',
        meta: {
          title: '用例管理',
        },
        component: () => import('@/views/case_ui/case.vue'),
      },
    ],
  },
];

export default routes;
