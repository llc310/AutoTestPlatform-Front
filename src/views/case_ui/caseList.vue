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

  <n-modal
    v-model:show="detailModal.show"
    preset="card"
    title="用例详情"
    style="width: 760px"
    :mask-closable="false"
  >
    <div v-if="detailModal.loading" class="detail-center">加载中...</div>
    <div v-else-if="detailModal.error" class="detail-center">{{ detailModal.error }}</div>
    <template v-else-if="detailModal.list && detailModal.list.length > 0">
      <div v-for="(item, index) in detailModal.list" :key="item.id" class="detail-case">
        <n-card size="small" :bordered="true">
          <n-space vertical :size="8">
            <n-space align="center" :size="8">
              <span class="detail-step-index">测试步骤 {{ index + 1 }}</span>
              <span>测试步骤名称：{{ item.name }}</span>
              <span>执行顺序：{{ item.order }}</span>
            </n-space>
            <div>
              Allure 参数：
              <div v-for="(v, k) in allureFields(item.allure)" :key="k" class="detail-el">
                {{ k }}：{{ v }}
              </div>
              <pre v-if="!allureFields(item.allure)" class="detail-pre">
                {{ formatJson(item.allure) }}
              </pre>
            </div>
            <div>
              参数化参数：
              <pre class="detail-pre">{{ formatJson(item.parametrize) }}</pre>
            </div>
            <div>
              断言参数：
              <pre v-if="item.validate && typeof item.validate === 'object'" class="detail-pre">
                {{ formatValidate(item.validate) }}
              </pre>
              <pre v-else class="detail-pre">{{ formatJson(item.validate) }}</pre>
            </div>
            <n-divider title-placement="left" style="margin: 4px 0">页面元素操作顺序</n-divider>
            <div>
              <div v-for="(step, stepIndex) in item.step" :key="step.id" class="detail-step-row">
                <n-space align="center" :size="8">
                  <span class="detail-step-index">步骤 {{ stepIndex + 1 }}</span>
                  <span>步骤名称：{{ step.action }}</span>
                  <span>顺序：{{ step.order }}</span>
                </n-space>
                <div class="detail-step-sub">关键字：{{ step.keyword }}</div>
                <div class="detail-step-sub">
                  参数：
                  <pre class="detail-pre">{{ formatArgs(step.args) || '-' }}</pre>
                </div>
                <div class="detail-step-sub">
                  关联元素：
                  <div v-for="el in step.element" :key="el.id" class="detail-el">
                    元素 id：{{ el.id }} ｜ 定位方式：{{ el.by }} ｜ 定位值：{{ el.locator }}
                  </div>
                  <span v-if="!step.element || step.element.length === 0">-</span>
                </div>
              </div>
              <span v-if="!item.step || item.step.length === 0">-</span>
            </div>
          </n-space>
        </n-card>
      </div>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, onMounted, h } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './caseListColumns';
  import { useMessage, useDialog } from 'naive-ui';
  import { DeleteOutlined, EditOutlined, EyeOutlined } from '@vicons/antd';
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
    width: 240,
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
        label: '详情',
        icon: EyeOutlined,
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '编辑',
        icon: EditOutlined,
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        icon: DeleteOutlined,
        onClick: handleDelete.bind(null, record),
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
    router.push({
      name: 'case_ui-case_edit',
      params: { id: record.id },
      query: { project_id: String(projectId) },
    });
  }

  // 详情弹窗状态
  const detailModal = reactive({
    show: false,
    loading: false,
    list: null as any[] | null,
    error: '',
  });

  // 展示用例详情（只读，不可修改）：逐个展示全部 caseuiinfo，不展示 step
  async function handleDetail(record) {
    detailModal.show = true;
    detailModal.loading = true;
    detailModal.list = null;
    detailModal.error = '';
    try {
      const res: any = await http.request({
        url: '/case_ui/case_ui_info/get_single_caseuiinfo/',
        method: 'get',
        params: { caseui_id: record.id },
      });
      // 兼容多种返回结构：直接数组 / 分页 list / DRF results / 单对象
      let list: any[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res?.list && Array.isArray(res.list)) {
        list = res.list;
      } else if (res?.results && Array.isArray(res.results)) {
        list = res.results;
      } else if (res && typeof res === 'object' && res.id) {
        list = [res];
      }
      if (!list.length) {
        detailModal.error = '未获取到用例信息';
      } else {
        detailModal.list = list;
      }
    } catch (e) {
      console.error('加载用例详情失败:', e);
      detailModal.error = '加载用例详情失败';
    } finally {
      detailModal.loading = false;
    }
  }

  function formatArgs(args: unknown): string {
    if (args === null || args === undefined) return '';
    if (Array.isArray(args)) return args.join('\n');
    if (typeof args === 'object') {
      try {
        return JSON.stringify(args, null, 2);
      } catch {
        return String(args);
      }
    }
    return String(args);
  }

  function formatJson(value: unknown): string {
    if (value === undefined) return '';
    try {
      return JSON.stringify(value, null, 2) ?? '';
    } catch {
      return String(value);
    }
  }

  // 按对象/数组结构递归拆解为字段级文本（如断言参数的 equals 数组）
  function formatObject(value: any, depth = 0): string {
    const pad = '  '.repeat(depth);
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return value
        .map((item: any, i: number) => {
          if (item && typeof item === 'object') {
            return `${pad}${i + 1}.\n${formatObject(item, depth + 1)}`;
          }
          return `${pad}${i + 1}. ${String(item)}`;
        })
        .join('\n');
    }
    if (value && typeof value === 'object') {
      return Object.entries(value)
        .map(([k, v]) => {
          if (v && typeof v === 'object') {
            return `${pad}${k}：\n${formatObject(v, depth + 1)}`;
          }
          return `${pad}${k}：${String(v)}`;
        })
        .join('\n');
    }
    return `${pad}${String(value)}`;
  }

  // 断言值展示：压平为一整条（字段用 ｜ 分隔，数组用、分隔）
  function formatInline(v: any): string {
    if (v === null || v === undefined) return 'null';
    if (Array.isArray(v)) {
      return v.map((item: any) => formatInline(item)).join('、');
    }
    if (typeof v === 'object') {
      return Object.entries(v)
        .map(([k, val]) => `${k}：${formatInline(val)}`)
        .join(' ｜ ');
    }
    return String(v);
  }

  function formatValueLine(v: any): string {
    return formatInline(v);
  }

  // validate 展示：第一层键 = 断言类型，值为断言列表（每次断言 = [预期, 实际] 或 {expected_result, actual_result}）
  function formatValidate(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value !== 'object' || Array.isArray(value)) return formatObject(value);
    const lines: string[] = [];
    for (const [type, assertions] of Object.entries(value)) {
      if (Array.isArray(assertions) && assertions.length > 0) {
        lines.push(`${type}（共 ${assertions.length} 次断言）`);
        assertions.forEach((a: any, i: number) => {
          lines.push(`  第 ${i + 1} 次断言：`);
          let expected: any;
          let actual: any;
          if (Array.isArray(a)) {
            expected = a[0];
            actual = a[1];
          } else if (a && typeof a === 'object') {
            expected = a.expected_result ?? a.expected;
            actual = a.actual_result ?? a.actual;
          } else {
            expected = a;
            actual = undefined;
          }
          lines.push(`    预期结果：${formatValueLine(expected)}`);
          lines.push(`    实际结果：${formatValueLine(actual)}`);
        });
      } else {
        lines.push(`${type}：`);
        lines.push(formatObject(assertions, 1));
      }
    }
    return lines.join('\n');
  }

  // allure 字段级展开（feature/story/title/description），非标准结构时返回 null 走 JSON 兜底
  function allureFields(value: any): Record<string, unknown> | null {
    if (value && typeof value === 'object') {
      const obj: Record<string, unknown> = {};
      for (const key of ['feature', 'story', 'title', 'description']) {
        if (value[key] !== undefined && value[key] !== null) {
          obj[key] = value[key];
        }
      }
      return Object.keys(obj).length > 0 ? obj : null;
    }
    return null;
  }

  onMounted(loadProjectName);
</script>

<style lang="less" scoped>
  .detail-center {
    text-align: center;
    padding: 24px 0;
    color: #999;
  }
  .detail-case {
    margin-bottom: 10px;
  }
  .detail-step-row {
    margin-bottom: 10px;
    padding: 6px 0;
    border-bottom: 1px dashed #eee;
  }
  .detail-step-sub {
    margin-left: 24px;
    font-size: 13px;
    color: #666;
    line-height: 1.6;
  }
  .detail-step-index {
    font-weight: 500;
    color: #18a058;
  }
  .detail-pre {
    margin: 0 0 0 24px;
    white-space: pre-wrap;
    word-break: break-all;
    font-size: 12px;
    font-family: inherit;
    line-height: 1.6;
  }
  .detail-el {
    margin-left: 24px;
    font-size: 13px;
    color: #666;
    line-height: 1.6;
  }
  .mr-1 {
    margin-right: 6px;
  }
</style>
