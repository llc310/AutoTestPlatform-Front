<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      title="测试步骤管理"
      titleTooltip="展示当前用户的项目信息（id / 项目名称 / 项目描述 / BaseURL）"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1000"
    />
  </n-card>
</template>

<script lang="ts" setup>
  import { reactive, ref, h } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './actionColumns';
  import { EditOutlined } from '@vicons/antd';
  import { http } from '@/utils/http/axios';
  import { ActionAPI } from '@/api/case_ui/http';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const actionRef = ref();
  const actionAPI = new ActionAPI();

  const params = reactive({
    pageSize: 10,
  });

  const actionColumn = reactive({
    width: 180,
    title: '操作',
    key: 'action',
    fixed: 'right',
    align: 'center',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: createActions(record),
      });
    },
  });

  function createActions(record) {
    return [
      {
        label: '编辑',
        icon: EditOutlined,
        onClick: handleEdit.bind(null, record),
      },
    ];
  }

  // 列表数据：获取当前用户的项目
  // 返回结构 { itemCount, pageCount, list }，与 BasicTable 分页字段约定一致
  const loadDataTable = async (res) => {
    return await http.request({
      url: '/project/project/get_single_user_project/',
      method: 'get',
      params: { ...params, ...res },
    });
  };

  // 编辑：向 get_single_action 发送 GET 请求（携带 project_id）获取该项目测试步骤，再进入步骤列表页
  async function handleEdit(record) {
    console.log(record);
    try {
      const res: any = await actionAPI.getSingleAction(record.id);
      console.log('get_single_action 响应:', res);
    } catch (e) {
      console.error('get_single_action 请求失败:', e);
    }
    router.push({ name: 'case_ui-action_list', params: { id: record.id } });
  }
</script>

<style lang="less" scoped></style>
