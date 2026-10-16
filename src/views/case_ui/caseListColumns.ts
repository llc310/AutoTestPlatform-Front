import { BasicColumn } from '@/components/Table';

// 用例模型（列表行）
export interface CaseData {
  id: number;
  /** 用例名称 */
  name: string;
  /** 步骤数 */
  step_count: number;
  /** 项目id */
  project: number;
  /** UI 用例信息 id 列表 */
  caseuiinfo: number[];
}

export const columns: BasicColumn<CaseData>[] = [
  {
    title: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '用例名称',
    key: 'name',
  },
  {
    title: '步骤数',
    key: 'step_count',
  },
];
