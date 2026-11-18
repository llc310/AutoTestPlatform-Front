import { BasicColumn } from '@/components/Table';

/** 测试步骤（Action）展示字段，对应后端 /api/case_ui/action/ */
export interface ActionData {
  id: number;
  /** 操作名 */
  name: string;
  /** Allure 参数（嵌套对象） */
  allure?: any;
  /** 页面操作（Step 列表） */
  step?: any[];
}

// Allure 参数分组列：组头下方分 feature / story / title / description 四列展示
function renderAllureField(field: string) {
  return (row: ActionData) => {
    const allure = row.allure;
    return (allure && allure[field]) || '-';
  };
}

export const columns: BasicColumn<ActionData>[] = [
  {
    title: '测试步骤名',
    key: 'name',
    width: 180,
  },
  {
    title: 'Allure 参数',
    key: 'allure',
    titleAlign: 'center',
    children: [
      {
        title: 'feature',
        key: 'allure_feature',
        render: renderAllureField('feature'),
      },
      {
        title: 'story',
        key: 'allure_story',
        render: renderAllureField('story'),
      },
      {
        title: 'title',
        key: 'allure_title',
        render: renderAllureField('title'),
      },
      {
        title: 'description',
        key: 'allure_description',
        render: renderAllureField('description'),
      },
    ],
  } as any,
];
