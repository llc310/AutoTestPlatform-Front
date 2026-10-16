import MockAdapter from 'axios-mock-adapter';
import service from './index';
import { mocks } from './mocks';
import { useLocalSetting } from '@/hooks/setting';

const { useMock } = useLocalSetting();

// 仅当开启 mock 时注册（VITE_USE_MOCK=true），保持与原 alova mock 一致的开关行为
if (useMock) {
  const mock = new MockAdapter(service, { delayResponse: 1000 });

  Object.entries(mocks).forEach(([key, handler]) => {
    // 解析 defineMock 的键格式：[POST]/api/login 或 /api/menus
    let method = 'GET';
    let url = key;
    if (key.startsWith('[')) {
      const endIdx = key.indexOf(']');
      method = key.slice(1, endIdx);
      url = key.slice(endIdx + 1);
    }

    const methodKey = `on${method.charAt(0).toUpperCase()}${method.slice(1).toLowerCase()}`;
    const reply = (config): [number, any] => {
      // 兼容 alova defineMock 的 handler 签名（接收 { query, headers, method, url }）
      const body =
        typeof handler === 'function'
          ? handler({
              query: config.params,
              headers: config.headers,
              method: config.method,
              url: config.url,
            })
          : handler;
      return [200, body];
    };

    if (typeof (mock as any)[methodKey] === 'function') {
      (mock as any)[methodKey](url).reply(reply);
    } else {
      mock.onAny(url).reply(reply);
    }
  });
}
