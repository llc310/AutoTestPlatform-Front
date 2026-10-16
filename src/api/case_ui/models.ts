import { components } from '../schema';

/**
 * 元素（UI 测试）模型定义
 * 对应后端接口：/api/case_ui/element/
 */

// 元素定位信息
export interface ElementLocator {
  /** 定位方式，如 xpath / css / id */
  by: string;
  /** 定位值 */
  value: string;
}

// 元素模型（接口返回）
export interface Element {
  readonly id: number;
  /** 元素名称 */
  name: string;
  /** 定位 */
  locator: ElementLocator;
  /** 项目id */
  project: number;
}

// 创建 / 更新元素的请求体
export interface ElementRequest {
  /** 元素名称 */
  name: string;
  /** 定位 */
  locator: ElementLocator;
  /** 项目id */
  project: number;
}

// 兼容 openapi 生成的类型（schema 中 locator 为 unknown，此处以 Element 为准）
export type ElementSchema = components['schemas']['Element'];
