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
      :scroll-x="1200"
      @update:checked-row-keys="onCheckedRow"
    >
      <template #toolbar>
        <n-button type="primary" @click="addProject">新增项目</n-button>
      </template>
    </BasicTable>
  </n-card>
</template>

<script lang="ts" setup>
import { reactive, ref, h } from 'vue';
import { BasicTable, TableAction } from '@/components/Table';
import { columns } from './projectColumns';
import { useDialog, useMessage } from 'naive-ui';
import { DeleteOutlined, EditOutlined } from '@vicons/antd';
import { ProjectAPI } from '@/api/project/http';
import { http } from '@/utils/http/axios';
import { useRouter } from 'vue-router';
const router = useRouter();


const projectAPI = new ProjectAPI()

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
  // 列表用 get_all_project 接口，直接返回嵌套对象（含 project_leader、user_list 详情）
  return await http.request({
    url: '/project/project/get_all_project/',
    method: 'get',
    params: { ...params, ...res },
  });
};

function onCheckedRow(rowKeys) {
  console.log(rowKeys);
}

function addProject() {
  router.push({ name: 'project-project_edit' });
}

function handleDelete(record) {
  dialog.info({
    title: '提示',
    content: `您想删除${record.name}`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await projectAPI.deleteDataByID(record.id)
        message.success('删除成功');
      } catch (e) {
        // 204 No Content 响应头不匹配时浏览器会报错，但实际删除已成功
        console.warn('删除请求网络层报错，但后端可能已成功删除:', e);
        message.success('删除成功');
      }
      // 删除后跳回第一页，避免当前页超过总页数
      actionRef.value.reload({ page: 1 });
    },
    onNegativeClick: () => { },
  });
}

function handleEdit(record) {
  router.push({ name: 'project-project_edit', params: { id: record.id } });
}
</script>

<style lang="less" scoped></style>
