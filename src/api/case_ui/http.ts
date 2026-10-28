import { http } from '@/utils/http/axios';
import { BaseModelAPI } from '../base_api';
import { Action, Element, KeyWord, CaseUI } from './models';

export class ElementAPI extends BaseModelAPI<Element> {
  base_url = '/case_ui/element/';

  /**
   * 获取可选元素列表（用于步骤编辑下拉）
   * 对应后端：GET /api/case_ui/element/get_element/
   */
  getElement(params?: Record<string, any>) {
    return http.request<any>({
      url: `${this.base_url}get_element/`,
      method: 'get',
      params,
    });
  }
}

export class KeyWordAPI extends BaseModelAPI<KeyWord> {
  base_url = '/case_ui/keyword/';
}

export class CaseUIAPI extends BaseModelAPI<CaseUI> {
  base_url = '/case_ui/case/';
}

export class ActionAPI extends BaseModelAPI<Action> {
  base_url = '/case_ui/action/';

  /**
   * 按项目获取测试步骤
   * 对应后端：GET /api/case_ui/action/get_single_action/（必需参数 project_id）
   */
  getSingleAction(project_id: number, params?: Record<string, any>) {
    return http.request<any>({
      url: `${this.base_url}get_single_action/`,
      method: 'get',
      params: { project_id, ...params },
    });
  }
}
