<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      title="关键字管理"
      titleTooltip="管理 UI 测试页面操作关键字（对应后端 /api/case_ui/keyword/）"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1000"
    >
      <template #toolbar>
        <n-input
          v-model:value="searchKeyword"
          clearable
          placeholder="搜索关键字名"
          style="width: 220px"
          @keydown.enter="handleSearch"
          @clear="handleSearch"
        />
        <n-button type="primary" @click="addKeyword">新增关键字</n-button>
      </template>
    </BasicTable>
  </n-card>
</template>

<script lang="ts" setup>
  import { reactive, ref, h } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './keywordColumns';
  import { useMessage, useDialog } from 'naive-ui';
  import { DeleteOutlined, EditOutlined } from '@vicons/antd';
  import { http } from '@/utils/http/axios';
  import { KeyWordAPI } from '@/api/case_ui/http';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const keywordAPI = new KeyWordAPI();

  const params = reactive({
    pageSize: 10,
  });

  // 搜索关键字名（客户端过滤）
  const searchKeyword = ref('');

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

  // 搜索：后端支持 page / pageSize 分页（响应 { itemCount, pageCount, next, previous, list }）
  // 尝试用大 pageSize 一次取全量，若后端未按 pageSize 截断则按 page 补齐
  async function fetchAllKeywords() {
    const first: any = await http.request({
      url: '/case_ui/keyword/',
      method: 'get',
      params: { page: 1, pageSize: 100 },
    });
    const total = first?.itemCount || 0;
    let list: any[] = [...(first?.list || [])];
    if (list.length < total) {
      const totalPages = Math.ceil(total / Math.max(list.length, 1));
      for (let p = 2; p <= totalPages; p++) {
        const pageData: any = await http.request({
          url: '/case_ui/keyword/',
          method: 'get',
          params: { page: p, pageSize: 100 },
        });
        list = list.concat(pageData?.list || []);
        if (list.length >= total) break;
      }
    }
    return list;
  }

  // 列表数据：获取关键字列表
  // 后端响应 { itemCount, pageCount, next, previous, list }，直接对齐 BasicTable 约定字段
  const loadDataTable = async (res) => {
    const kw = searchKeyword.value.trim();
    if (kw) {
      const all = await fetchAllKeywords();
      const list = all.filter(
        (item) =>
          (item.keyword_name || '').includes(kw) || (item.description || '').includes(kw)
      );
      return { page: 1, list, itemCount: list.length, pageCount: 1 };
    }
    const data: any = await http.request({
      url: '/case_ui/keyword/',
      method: 'get',
      params: { ...params, ...res },
    });
    return {
      page: res?.page || 1,
      list: data?.list || [],
      itemCount: data?.itemCount || 0,
      pageCount: data?.pageCount || 0,
    };
  };

  function handleSearch() {
    actionRef.value.reload();
  }

  // 新增：跳转关键字表单页（新增模式）
  function addKeyword() {
    router.push({ name: 'case_ui-keyword_edit' });
  }

  // 删除：调用后端接口删除关键字，成功后刷新列表
  function handleDelete(record) {
    console.log(record);
    dialog.info({
      title: '提示',
      content: `您想删除${record.keyword_name}`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await keywordAPI.deleteDataByID(record.id);
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

  // 编辑：跳转关键字表单页（编辑模式）
  function handleEdit(record) {
    console.log(record);
    router.push({ name: 'case_ui-keyword_edit', params: { id: record.id } });
  }
</script>

<style lang="less" scoped></style>
