import { BasicColumn } from '@/components/Table';
import type { ActionSchema } from '@/api/case_ui/models';

// 用例模型（列表行，与后端 /api/case_ui/case/ 返回保持一致）
export interface CaseData {
  id: number;
  /** 用例名称 */
  name: string;
  /** 项目id */
  project_id: number;
  /** 关联的测试步骤（action）列表 */
  action_id: ActionSchema[];
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
    key: 'action_id',
    render: (row) => (row.action_id && row.action_id.length > 0 ? row.action_id.length : '-'),
  },
];
