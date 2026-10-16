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
      :scroll-x="800"
      @update:checked-row-keys="onCheckedRow"
    >
      <template #toolbar>
        <n-button type="primary" @click="addRole">新增角色</n-button>
      </template>
    </BasicTable>
  </n-card>
</template>

<script lang="ts" setup>
import { reactive, ref, h } from 'vue';
import { BasicTable, TableAction } from '@/components/Table';
import { columns } from './roleColumns';
import { useDialog, useMessage } from 'naive-ui';
import { DeleteOutlined, EditOutlined } from '@vicons/antd';
import { RoleAPI } from '@/api/system/http';
import { useRouter } from 'vue-router';
const router = useRouter();


const roleAPI = new RoleAPI()

const message = useMessage();
const dialog = useDialog();
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
      label: '删除',
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
  const data = await roleAPI.getDataList({ ...params, ...res });
  // 按部门名称排序，让相同部门的排在一起
  data.list.sort((a, b) => {
    const nameA = a.department_detail?.name || '';
    const nameB = b.department_detail?.name || '';
    return nameA.localeCompare(nameB, 'zh-CN');
  });
  return data;
};

function onCheckedRow(rowKeys) {
  console.log(rowKeys);
}

function addRole() {
  router.push({ name: 'system-role_edit' });
}

function handleDelete(record) {
  dialog.info({
    title: '提示',
    content: `您想删除该角色`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await roleAPI.deleteDataByID(record.id)
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
  router.push({ name: 'system-role_edit', params: { id: record.id } });
}
</script>

<style lang="less" scoped></style>
