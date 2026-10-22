import { http } from '@/utils/http/axios';
import { BaseModelAPI } from '../base_api';
import { Action, Element, KeyWord, CaseUI, Step, Allure, Parametrize, Validate } from './models';

export class ElementAPI extends BaseModelAPI<Element> {
  base_url = '/case_ui/element/';
}

export class KeyWordAPI extends BaseModelAPI<KeyWord> {
  base_url = '/case_ui/keyword/';
}

export class CaseUIAPI extends BaseModelAPI<CaseUI> {
  base_url = '/case_ui/case/';
}

export class StepAPI extends BaseModelAPI<Step> {
  base_url = '/case_ui/step/';
}

export class AllureAPI extends BaseModelAPI<Allure> {
  base_url = '/case_ui/allure/';
}

export class ParametrizeAPI extends BaseModelAPI<Parametrize> {
  base_url = '/case_ui/parametrize/';
}

export class ValidateAPI extends BaseModelAPI<Validate> {
  base_url = '/case_ui/validate/';
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
