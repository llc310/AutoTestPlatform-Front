import { BasicColumn } from '@/components/Table';

// 用例模型（列表行，与后端 /api/case_ui/case/ 返回保持一致）
// 后端 CaseUI 已删除 action_id，列表不再返回关联的测试步骤
export interface CaseData {
  id: number;
  /** 用例名称 */
  name: string;
  /** 项目id */
  project_id: number;
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
];
