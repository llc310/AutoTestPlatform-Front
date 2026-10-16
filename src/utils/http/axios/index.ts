import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { useUser } from '@/store/modules/user';
import { storage } from '@/utils/Storage';
import { useGlobSetting } from '@/hooks/setting';
import { PageEnum } from '@/enums/pageEnum';
import { ResultEnum } from '@/enums/httpEnum';
import { isUrl } from '@/utils';

// 请求配置扩展（对齐原 alova 的 method.meta 语义）
export interface RequestOptions {
  /** 是否返回原始响应体（不按 code 解包） */
  isReturnNativeResponse?: boolean;
  /** 是否关闭响应转换 */
  isTransformResponse?: boolean;
  /** 是否忽略 token */
  ignoreToken?: boolean;
}

export interface RequestConfig extends AxiosRequestConfig {
  meta?: RequestOptions;
}

const { apiUrl, urlPrefix } = useGlobSetting();

const service: AxiosInstance = axios.create({
  baseURL: apiUrl || '',
});

// 请求拦截器：注入 token 与接口前缀
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const userStore = useUser();
  const token = userStore.getToken;
  const meta = (config as RequestConfig).meta || {};

  if (!meta.ignoreToken && token) {
    config.headers['Authorization'] = `Token ${token}`;
  }

  // 处理 api 请求前缀
  const url = config.url || '';
  if (!isUrl(url) && urlPrefix) {
    config.url = `${urlPrefix}${url}`;
  }
  return config;
});

// 响应拦截器：按 { code, message, result } 结构解包
service.interceptors.response.use(
  (response: AxiosResponse): any => {
    const config = response.config as RequestConfig;
    const res = response.data;

    // 204 No Content：删除等操作成功但无响应体，直接放行，避免空响应解构误报失败
    if (response.status === 204) {
      return null;
    }

    // 需要原生响应体时直接返回
    if (config.meta?.isReturnNativeResponse) {
      return res;
    }

    const { message, code, result } = res;

    // 不进行任何处理，直接返回
    if (config.meta?.isTransformResponse === false) {
      return res.data;
    }

    // @ts-ignore
    const Message = window.$message;
    // @ts-ignore
    const Modal = window.$dialog;

    const LoginPath = PageEnum.BASE_LOGIN;
    if (ResultEnum.SUCCESS === code || code === 201) {
      return result;
    }
    // 需要登录
    if (code === 912) {
      Modal?.warning({
        title: '提示',
        content: '登录身份已失效，请重新登录!',
        okText: '确定',
        closable: false,
        maskClosable: false,
        onOk: async () => {
          storage.clear();
          window.location.href = LoginPath;
        },
      });
    } else {
      Message?.error(message);
    }
    return Promise.reject(new Error(message));
  },
  (error) => {
    // 从后端统一响应中提取错误信息并提示（HTTP 非 2xx 时 body 为 { code, message, result }）
    const data = error?.response?.data;
    if (data && typeof data === 'object') {
      // @ts-ignore
      window.$message?.error(data.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

// 与 axios 封装保持一致的请求方式：http.request({ url, method, params / data })
export const http = {
  request<T = any>(config: RequestConfig): Promise<T> {
    return service.request(config) as Promise<T>;
  },
};

export default service;
