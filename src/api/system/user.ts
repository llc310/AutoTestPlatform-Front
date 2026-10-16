import { http } from '@/utils/http/axios';

/**
 * @description: 获取用户信息
 */
export function getUserInfo() {
  return http.request<InResult>({
    url: '/admin_info',
    method: 'get',
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 用户登录
 */
export function login(params) {
  return http.request<InResult>({
    url: '/login',
    method: 'post',
    data: params,
    meta: {
      isReturnNativeResponse: true,
    },
  });
}

/**
 * @description: 用户修改密码
 */
export function changePassword(params, uid) {
  return http.request({
    url: `/user/u${uid}/changepw`,
    method: 'post',
    data: {
      params,
    },
  });
}

/**
 * @description: 用户登出
 */
export function logout(params) {
  return http.request({
    url: '/login/logout',
    method: 'post',
    data: {
      params,
    },
  });
}
