<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      title="元素管理"
      titleTooltip="展示当前用户的项目信息（id / 项目名称 / 项目描述 / BaseURL）"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1000"
      @update:checked-row-keys="onCheckedRow"
    />
  </n-card>
</template>

<script lang="ts" setup>
  import { reactive, ref, h } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './elementColumns';
  import { EditOutlined } from '@vicons/antd';
  import { http } from '@/utils/http/axios';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const actionRef = ref();

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

  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  // 编辑：进入该项目的元素显示界面
  function handleEdit(record) {
    console.log(record);
    router.push({ name: 'case_ui-element_list', params: { id: record.id } });
  }
</script>

<style lang="less" scoped></style>
