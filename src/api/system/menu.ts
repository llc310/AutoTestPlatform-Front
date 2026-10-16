import { http } from '@/utils/http/axios';

export interface ListDate {
  label: string;
  key: string;
  type: number;
  subtitle: string;
  openType: number;
  auth: string;
  path: string;
  children?: ListDate[];
}

/**
 * @description: 根据用户id获取用户菜单
 */
export function adminMenus() {
  return http.request({
    url: '/menus',
    method: 'get',
  });
}

/**
 * 获取tree菜单列表
 * @param params
 */
export function getMenuList(params?) {
  return http.request<{ list: ListDate[] }>({
    url: '/menu/list',
    method: 'get',
    params,
  });
}
