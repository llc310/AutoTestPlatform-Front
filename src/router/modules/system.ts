import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { OptionsSharp } from '@vicons/ionicons5';
import { renderIcon } from '@/utils/index';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/system',
    name: 'System',
    redirect: '/system/department',
    component: Layout,
    meta: {
      title: '系统设置',
      icon: renderIcon(OptionsSharp),
      sort: 5,
    },
    children: [
      {
        path: 'department',
        name: 'system-department',
        meta: {
          title: '部门设置',
        },
        component: () => import('@/views/system/department.vue'),
      },
      {
        path: 'position',
        name: 'system-position',
        meta: {
          title: '职位设置',
        },
        component: () => import('@/views/system/position.vue'),
      },
      {
        path: 'role',
        name: 'system-role',
        meta: {
          title: '角色设置',
        },
        component: () => import('@/views/system/role.vue'),
      },
      {
        path: 'department_edit/:id?',
        name: 'system-department_edit',
        meta: {
          title: '修改部门信息',
          singleTab: true,
          hidden: true,
        },
        component: () => import('@/views/system/department_edit.vue'),
      },
      {
        path: 'position_edit/:id?',
        name: 'system-position_edit',
        meta: {
          title: '修改职位信息',
          singleTab: true,
          hidden: true,
        },
        component: () => import('@/views/system/position_edit.vue'),
      },
      {
        path: 'role_edit/:id?',
        name: 'system-role_edit',
        meta: {
          title: '修改角色信息',
          singleTab: true,
          hidden: true,
        },
        component: () => import('@/views/system/role_edit.vue'),
      },
    ],
  },
];

export default routes;
