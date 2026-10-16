import { http } from "@/utils/http/axios";
import { Profile, ResetPassword } from "./models";

export function login(params?) {
  return http.request<Profile>({
    url: 'account/profile/login/',
    method: 'post',
    data: params,
    meta: {
    },
  });
}

export function profile(params?) {
  return http.request<Profile>({
    url: 'account/profile/profile/',
    method: 'get',
    data: params,
    meta: {
    },
  });
}

export function changeProfile(params: Profile) {
  return http.request<Profile>({
    url: 'account/profile/change/',
    method: 'post',
    data: params,
    meta: {
    },
  });
}

export function resetPassword(params: ResetPassword) {
  return http.request({
    url: 'account/profile/reset_password/',
    method: 'post',
    data: params,
    meta: {
      isReturnNativeResponse: true,
    },
  });
}