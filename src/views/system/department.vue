<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      title="表格列表"
      titleTooltip="这是一个提示"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1360"
      @update:checked-row-keys="onCheckedRow"
    >
      <template #toolbar>
        <n-button type="primary" @click="addDepartment">新增部门</n-button>
      </template>
    </BasicTable>
  </n-card>
</template>

<script lang="ts" setup>
import { reactive, ref, h } from 'vue';
import { BasicTable, TableAction } from '@/components/Table';
import { columns } from './basicColumns';
import { useDialog, useMessage } from 'naive-ui';
import { DeleteOutlined, EditOutlined } from '@vicons/antd';
import { DepartmentAPI } from '@/api/system/http';
import { useRouter } from 'vue-router';
const router = useRouter();


const departmentAPI = new DepartmentAPI()

const message = useMessage();
const dialog = useDialog();
const actionRef = ref();

const params = reactive({
  pageSize: 5,
  name: 'NaiveAdmin',
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
      label: '删除',
      // 配置 color 会覆盖 type
      icon: DeleteOutlined,
      onClick: handleDelete.bind(null, record),
    },
    {
      label: '编辑',
      icon: EditOutlined,
      onClick: handleEdit.bind(null, record),
    },
  ];
}

const loadDataTable = async (res) => {
  return await departmentAPI.getDataList({ ...params, ...res });
};

function onCheckedRow(rowKeys) {
  console.log(rowKeys);
}

function addDepartment(record) {
  message.success('您点击了部门新增按钮');
  router.push({name: 'system-department_edit', params: {id:record.id}});
}

function handleDelete(record) {
  console.log(record);
  dialog.info({
    title: '提示',
    content: `您想删除${record.name}`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await departmentAPI.deleteDataByID(record.id)
        message.success('删除成功');
        actionRef.value.reload();
      } catch (e) {
        message.error('删除失败');
      }
    },
    onNegativeClick: () => { },
  });
}

function handleEdit(record) {
  console.log(record);
  message.success('您点击了编辑按钮');
  router.push({name: 'system-department_edit', params: {id:record.id}});
}
</script>

<style lang="less" scoped></style>
