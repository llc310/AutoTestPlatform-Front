import { components } from '../schema';

/**
 * UI 测试模型定义
 * 对应后端接口：/api/case_ui/element/、/api/case_ui/case/、/api/case_ui/caseuiinfo/
 */

// 元素模型（接口返回，字段与后端 /api/case_ui/element/ 保持一致）
export interface Element {
  readonly id: number;
  /** 元素名称 */
  name: string;
  /** 定位方式，如 xpath / css / id */
  by: string;
  /** 定位值 */
  locator: string;
  /** 项目id */
  project: number;
}

// 创建 / 更新元素的请求体
export interface ElementRequest {
  /** 元素名称 */
  name: string;
  /** 定位方式 */
  by: string;
  /** 定位值 */
  locator: string;
  /** 项目id */
  project: number;
}

// 用例步骤（页面操作）
export interface Step {
  readonly id: number;
  /** 步骤关联的元素 */
  element: Element[];
  /** 页面操作执行顺序 */
  order: number;
  /** 页面操作名称 */
  action: string;
  /** 页面操作关键字（click / send_keys 等） */
  keyword: string;
  /** 函数参数 */
  args?: unknown;
}

export interface StepRequest {
  /** 步骤关联的元素 */
  element: ElementRequest[];
  /** 页面操作执行顺序 */
  order: number;
  /** 页面操作名称 */
  action: string;
  /** 页面操作关键字（click / send_keys 等） */
  keyword: string;
  /** 函数参数 */
  args?: unknown;
}

// UI 用例信息（含步骤），对应后端 CaseUIInfo
export interface CaseUIInfo {
  readonly id: number;
  /** 用例步骤 */
  step: Step[];
  /** 测试步骤执行顺序 */
  order: number;
  /** Ui测试用例名称 */
  name: string;
  /** Allure参数 */
  allure?: unknown;
  /** 参数化参数 */
  parametrize?: unknown;
  /** 断言参数 */
  validate?: unknown;
  /** 项目id */
  project?: number;
}

export interface CaseUIInfoRequest {
  /** 用例步骤 */
  step: StepRequest[];
  /** 测试步骤执行顺序 */
  order: number;
  /** Ui测试用例名称 */
  name: string;
  /** Allure参数 */
  allure?: unknown;
  /** 参数化参数 */
  parametrize?: unknown;
  /** 断言参数 */
  validate?: unknown;
  /** 项目id */
  project?: number;
}

// UI 用例（列表行），对应后端 CaseUI
export interface CaseUI {
  readonly id: number;
  readonly step_count: string;
  /** UI测试用例名称 */
  name: string;
  /** 项目id */
  project: number;
  /** Ui测试用例id */
  caseuiinfo: number[];
}

// 创建 / 更新 UI 用例的请求体
export interface CaseUIRequest {
  /** UI测试用例名称 */
  name: string;
  /** 项目id */
  project: number;
  /** Ui测试用例id */
  caseuiinfo: number[];
}

// 兼容 openapi 生成的类型
export type ElementSchema = components['schemas']['Element'];
export type CaseUISchema = components['schemas']['CaseUI'];
export type CaseUIInfoSchema = components['schemas']['CaseUIInfo'];
export type StepSchema = components['schemas']['Step'];
