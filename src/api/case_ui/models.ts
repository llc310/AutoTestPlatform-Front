import { components } from '../schema';

/**
 * UI 测试模型定义
 * 对应后端接口：/api/case_ui/element/、/api/case_ui/keyword/、/api/case_ui/case/、/api/case_ui/action/
 */

// 元素模型（接口返回，字段与后端 /api/case_ui/element/ 保持一致）
export interface Element {
  readonly id: number;
  /** 元素名称 */
  name: string;
  /** 定位方式，如 xpath / css / id */
  by: string;
  /** 定位路径 */
  path: string;
  /** 项目id */
  project_id: number;
}

// 创建 / 更新元素的请求体
export interface ElementRequest {
  /** 元素名称 */
  name: string;
  /** 定位方式 */
  by: string;
  /** 定位路径 */
  path: string;
  /** 项目id */
  project_id: number;
}

// 关键字模型（接口返回，字段与后端 /api/case_ui/keyword/ 保持一致）
export interface KeyWord {
  readonly id: number;
  /** 关键字名 */
  keyword_name: string;
  /** 操作描述 */
  description: string;
}

// 创建 / 更新关键字的请求体
export interface KeyWordRequest {
  /** 关键字名 */
  keyword_name: string;
  /** 操作描述 */
  description: string;
}

// UI 测试用例（接口返回，字段与后端 /api/case_ui/case/ 保持一致）
export interface CaseUI {
  readonly id: number;
  /** UI测试用例名称 */
  name: string;
  /** 项目id */
  project_id: number;
  /** 关联的测试步骤（action）列表（只读） */
  action_id: ActionSchema[];
}

// 创建 / 更新 UI 测试用例的请求体
export interface CaseUIRequest {
  /** UI测试用例名称 */
  name: string;
  /** 项目id */
  project_id: number;
}

// Allure 模型（测试步骤关联的 allure 报告信息，只读）
export interface Allure {
  readonly id: number;
  /** 所属模块 */
  feature?: string;
  /** 功能名 */
  story?: string;
  /** 用例标题 */
  title?: string;
  /** 用例描述 */
  description?: string;
}

// 参数化模型（测试步骤关联的参数化数据，只读）
export interface Parametrize {
  readonly id: number;
  /** 参数化键名 */
  param_key: string;
  /** 参数化键值 */
  param_value: unknown;
}

// 断言模型（测试步骤关联的断言，只读）
export interface Validate {
  readonly id: number;
  /** 断言类型 */
  validate_type: components['schemas']['ValidateTypeEnum'];
  /** 断言参数 */
  validate_params: unknown;
}

// 测试步骤（Action）下的单条操作
export interface Step {
  readonly id: number;
  /** 操作 */
  action: string;
  /** 参数值 */
  params?: unknown;
  /** 步骤内执行顺序 */
  order: number;
  /** 关键字id */
  keyword_id?: number | null;
  /** 页面元素id */
  element_id?: number | null;
  /** 测试步骤id */
  action_id: number;
}

// 测试步骤模型（接口返回，字段与后端 /api/case_ui/action/ 保持一致）
export interface Action {
  readonly id: number;
  /** 测试步骤名 */
  name: string;
  /** 执行顺序 */
  sort: number;
  /** 项目id */
  project_id: number;
  /** allure参数（只读） */
  readonly allure_id: Allure;
  /** 参数化（只读，可空） */
  readonly parametrize_id: Parametrize | null;
  /** 断言（只读，可空） */
  readonly validate_id: Validate | null;
  /** 操作步骤列表（只读） */
  readonly step_id: Step[];
}

// 创建 / 更新测试步骤的请求体
export interface ActionRequest {
  /** 测试步骤名 */
  name: string;
  /** 执行顺序 */
  sort: number;
  /** 项目id */
  project_id: number;
}

// 兼容 openapi 生成的类型
export type ElementSchema = components['schemas']['Element'];
export type KeyWordSchema = components['schemas']['KeyWord'];
export type ActionSchema = components['schemas']['Action'];
export type CaseUISchema = components['schemas']['CaseUI'];
export type AllureSchema = components['schemas']['Allure'];
export type ParametrizeSchema = components['schemas']['Parametrize'];
export type ValidateSchema = components['schemas']['Validate'];
export type StepSchema = components['schemas']['Step'];
