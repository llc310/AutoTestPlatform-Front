<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      :title="tableTitle"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1000"
    >
      <template #toolbar>
        <n-button type="primary" @click="addElement">新增元素</n-button>
        <n-button @click="goBack">返回</n-button>
      </template>
    </BasicTable>
  </n-card>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, onMounted, h } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './elementListColumns';
  import { useMessage, useDialog } from 'naive-ui';
  import { DeleteOutlined, EditOutlined } from '@vicons/antd';
  import { http } from '@/utils/http/axios';
  import { ElementAPI } from '@/api/case_ui/http';
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const elementAPI = new ElementAPI();

  // 当前项目 id
  const projectId = Number(route.params.id);
  // 项目名称（加载成功后把标题中的"项目"替换为实际名称）
  const projectName = ref('');
  const tableTitle = computed(() =>
    projectName.value
      ? `${projectName.value}元素列表（项目ID：${projectId}）`
      : `项目元素列表（项目ID：${projectId}）`
  );

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

  // 列表数据：按项目 id 获取元素列表
  // 返回结构 { itemCount, pageCount, list }，与 BasicTable 分页字段约定一致
  const loadDataTable = async (res) => {
    return await http.request({
      url: '/case_ui/element/get_element/',
      method: 'get',
      params: { project_id: projectId, ...params, ...res },
    });
  };

  // 加载当前用户的项目，匹配当前项目 id 获取项目名称
  async function loadProjectName() {
    try {
      const res: any = await http.request({
        url: '/project/project/get_single_user_project/',
        method: 'get',
      });
      const list = res?.list || [];
      const project = list.find((item: any) => item.id === projectId);
      if (project) {
        projectName.value = project.name;
      }
    } catch (e) {
      console.error('加载项目名称失败:', e);
    }
  }

  // 新增：跳转元素表单页（新增模式），携带所属项目 id
  function addElement() {
    router.push({
      name: 'case_ui-element_edit',
      query: { project_id: String(projectId) },
    });
  }

  // 删除：调用后端接口删除元素，成功后刷新列表
  function handleDelete(record) {
    console.log(record);
    dialog.info({
      title: '提示',
      content: `您想删除${record.name}`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await elementAPI.deleteDataByID(record.id);
          message.success('删除成功');
          actionRef.value.reload();
        } catch (e) {
          console.error('删除失败:', e);
          message.error('删除失败');
        }
      },
      onNegativeClick: () => {},
    });
  }

  // 编辑：跳转元素表单页（编辑模式），携带元素 id 与所属项目 id
  function handleEdit(record) {
    console.log(record);
    router.push({
      name: 'case_ui-element_edit',
      params: { id: record.id },
      query: { project_id: String(projectId) },
    });
  }

  function goBack() {
    router.push({ name: 'case_ui-element' });
  }

  onMounted(loadProjectName);
</script>

<style lang="less" scoped></style>
