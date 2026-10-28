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
  validate_type: ValidateTypeEnum;
  /** 断言参数 */
  validate_params: unknown;
}

// 断言类型枚举（对应后端 ValidateTypeEnum）
export type ValidateTypeEnum = 'equals' | 'contains' | 'db_equals' | 'db_contains';

// 测试步骤（Action）下的单条操作
export interface Step {
  readonly id: number;
  /** 操作 */
  action: string;
  /** 参数值 */
  params?: unknown;
  /** 步骤内执行顺序 */
  sort: number;
  /** 关键字id */
  keyword_id?: number | null;
  /** 页面元素id */
  element_id?: number | null;
  /** 测试步骤id */
  action_id: number;
}

// 测试步骤模型（接口返回，字段与后端 /api/case_ui/action/ 保持一致）
// 后端已改为聚合结构：allure/step/parametrize/validate 直接嵌套在 Action 内
export interface Action {
  readonly id: number;
  /** 操作名 */
  name: string;
  /** 项目id */
  project_id: number;
  /** Allure参数 */
  allure?: Allure | null;
  /** 页面操作步骤 */
  step?: Step[];
  /** 参数化参数（可空） */
  parametrize?: Parametrize | null;
  /** 断言参数（可空） */
  validate?: Validate | null;
}

// 创建 / 更新测试步骤的请求体
export interface ActionRequest {
  /** 操作名 */
  name: string;
  /** 项目id */
  project_id: number;
  /** Allure参数 */
  allure?: Allure | null;
  /** 页面操作步骤 */
  step?: Step[];
  /** 参数化参数（可空） */
  parametrize?: Parametrize | null;
  /** 断言参数（可空） */
  validate?: Validate | null;
}

// 兼容 openapi 生成的类型（嵌套结构在后端 swagger 中未定义具体类型，保留自定义模型）
export type ElementSchema = components['schemas']['Element'];
export type KeyWordSchema = components['schemas']['KeyWord'];
export type ActionSchema = components['schemas']['Action'];
export type CaseUISchema = components['schemas']['CaseUI'];
