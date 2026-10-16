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
        <n-button type="primary" @click="addCase">新增用例</n-button>
        <n-button @click="goBack">返回</n-button>
      </template>
    </BasicTable>
  </n-card>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, onMounted, h } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './caseListColumns';
  import { useMessage, useDialog } from 'naive-ui';
  import { DeleteOutlined, EditOutlined } from '@vicons/antd';
  import { http } from '@/utils/http/axios';
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();

  // 当前项目 id
  const projectId = Number(route.params.id);
  // 项目名称（加载成功后把标题中的"项目"替换为实际名称）
  const projectName = ref('');
  const tableTitle = computed(() =>
    projectName.value
      ? `${projectName.value}用例列表（项目ID：${projectId}）`
      : `项目用例列表（项目ID：${projectId}）`
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

  // 列表数据：按项目 id 获取用例列表（get_single_case 接口）
  // 返回结构 { itemCount, pageCount, list }，与 BasicTable 分页字段约定一致
  const loadDataTable = async (res) => {
    return await http.request({
      url: '/case_ui/case/get_single_case/',
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

  function goBack() {
    router.push({ name: 'case_ui-case' });
  }

  // 增删改仅做界面展示，未对接后端接口
  function addCase() {
    message.info('您点击了新增按钮，增删改仅做界面展示，未对接后端接口');
  }

  function handleDelete(record) {
    console.log(record);
    dialog.info({
      title: '提示',
      content: `您想删除${record.name}`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        message.info(`已点击删除（用例：${record.name}），功能仅做界面展示，未对接后端接口`);
      },
      onNegativeClick: () => {},
    });
  }

  function handleEdit(record) {
    console.log(record);
    message.info(`您点击了编辑按钮（用例：${record.name}），功能仅做界面展示`);
  }

  onMounted(loadProjectName);
</script>

<style lang="less" scoped></style>
