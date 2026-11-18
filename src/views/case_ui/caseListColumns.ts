import { BasicColumn } from '@/components/Table';

// 用例模型（列表行，与后端 /api/case_ui/case/ 返回保持一致）
export interface CaseData {
  id: number;
  /** 用例名称 */
  name: string;
  /** 项目id */
  project_id: number;
  /** 测试步骤（Action 展开后的步骤对象数组） */
  action_list?: any[];
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
    key: 'action_list',
    width: 100,
    render: (row) => (Array.isArray(row.action_list) ? row.action_list.length : 0),
  },
];
