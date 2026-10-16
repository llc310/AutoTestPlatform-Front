import { BaseModelAPI } from '../base_api';
import { Element } from './models';

export class ElementAPI extends BaseModelAPI<Element> {
  base_url = '/case_ui/element/';
}
