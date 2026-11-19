<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      :title="tableTitle"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1360"
    >
      <template #toolbar>
        <n-button type="primary" @click="addSuite">新增套件</n-button>
        <n-button @click="goBack">返回</n-button>
      </template>
    </BasicTable>
  </n-card>

  <!-- 套件详情弹窗（只读） -->
  <n-modal
    v-model:show="detailModal.show"
    preset="card"
    title="套件详情"
    style="width: 720px"
    :mask-closable="false"
  >
    <div v-if="detailModal.loading" class="detail-center">加载中...</div>
    <div v-else-if="detailModal.error" class="detail-center">{{ detailModal.error }}</div>
    <template v-else-if="detailModal.data">
      <div class="ro-row">
        <div class="ro-label">套件名称</div>
        <div class="ro-value">{{ detailModal.data.name || '-' }}</div>
      </div>
      <div class="ro-row">
        <div class="ro-label">套件描述</div>
        <div class="ro-value">{{ detailModal.data.description || '-' }}</div>
      </div>
      <div class="ro-row">
        <div class="ro-label">运行模式</div>
        <div class="ro-value">{{
          runTypeMap[detailModal.data.run_type] || detailModal.data.run_type || '-'
        }}</div>
      </div>
      <div class="ro-row" v-if="detailModal.data.run_type === 'C'">
        <div class="ro-label">运行表达式</div>
        <div class="ro-value">{{ detailModal.data.cron || '-' }}</div>
      </div>
      <div class="ro-row" v-if="detailModal.data.run_type === 'WEBHOOK'">
        <div class="ro-label">hook密钥</div>
        <div class="ro-value">{{ detailModal.data.hook || '-' }}</div>
      </div>
      <div class="ro-row">
        <div class="ro-label">关联UI用例</div>
        <div class="ro-value">{{ uiCaseNames(detailModal.data.case_ui_list) }}</div>
      </div>
      <div class="ro-row">
        <div class="ro-label">关联接口用例</div>
        <div class="ro-value">{{ apiCaseNames(detailModal.data.case_api_list) }}</div>
      </div>
    </template>
  </n-modal>

  <!-- 运行结果弹窗（只读） -->
  <n-modal
    v-model:show="resultModal.show"
    preset="card"
    :title="`运行结果 - ${resultModal.suiteName || ''}`"
    style="width: 860px"
    :mask-closable="false"
  >
    <div v-if="resultModal.loading" class="detail-center">加载中...</div>
    <div v-else-if="resultModal.error" class="detail-center">{{ resultModal.error }}</div>
    <div v-else-if="resultModal.rows.length === 0" class="detail-center">该套件暂无执行结果</div>
    <div v-else class="result-list">
      <div v-for="row in resultModal.rows" :key="row.id" class="result-row">
        <n-card size="small" :bordered="true">
          <n-space align="center" :size="16" wrap>
            <span class="result-id">结果 #{{ row.id }}</span>
            <n-tag :type="statusTagType(row.status)">
              {{ runStatusMap[row.status] || row.status }}
            </n-tag>
            <n-tag :type="row.is_pass ? 'success' : 'error'">
              {{ row.is_pass ? '通过' : '未通过' }}
            </n-tag>
          </n-space>
          <div class="ro-row">
            <div class="ro-label">套件ID</div>
            <div class="ro-value">{{ row.suite ?? '-' }}</div>
          </div>
          <div class="ro-row">
            <div class="ro-label">用例路径</div>
            <div class="ro-value">{{ row.path || '-' }}</div>
          </div>
          <div class="ro-row">
            <div class="ro-label">创建时间</div>
            <div class="ro-value">{{ formatDateTime(row.create_datetime) }}</div>
          </div>
          <div class="ro-row">
            <div class="ro-label">更新时间</div>
            <div class="ro-value">{{ formatDateTime(row.update_datetime) }}</div>
          </div>
          <div class="ro-row">
            <div class="ro-label">测试报告</div>
            <div class="ro-value file-line">
              <template v-if="row.report_url">
                <a class="result-link" @click.prevent="previewUrl(row.report_url)">预览</a>
                <n-button size="small" @click="downloadFile(row.report_url)">下载</n-button>
              </template>
              <span v-else>-</span>
            </div>
          </div>
          <div class="ro-row">
            <div class="ro-label">执行日志</div>
            <div class="ro-value file-line">
              <template v-if="row.log_url">
                <a class="result-link" @click.prevent="previewUrl(row.log_url)">预览</a>
                <n-button size="small" @click="downloadFile(row.log_url)">下载</n-button>
              </template>
              <span v-else>-</span>
            </div>
          </div>
          <div class="ro-row" style="align-items: flex-start">
            <div class="ro-label">YAML 文件</div>
            <div class="ro-value">
              <div v-if="row.yaml_url && row.yaml_url.length" class="yaml-list">
                <div v-for="(u, i) in row.yaml_url" :key="i" class="yaml-item">
                  <a v-if="isPreviewable(u)" class="result-link" @click.prevent="previewUrl(u)">{{
                    fileNameFromUrl(u)
                  }}</a>
                  <span v-else class="yaml-name">{{ fileNameFromUrl(u) }}</span>
                  <n-button size="small" @click="downloadFile(u)">下载</n-button>
                </div>
              </div>
              <span v-else>-</span>
            </div>
          </div>
          <div class="ro-row">
            <div class="ro-label">产物压缩包</div>
            <div class="ro-value file-line">
              <n-button
                v-if="row.artifacts_url"
                size="small"
                @click="downloadFile(row.artifacts_url)"
                >下载产物</n-button
              >
              <span v-else>-</span>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </n-modal>

  <!-- 新增套件弹窗 -->
  <n-modal
    v-model:show="addModal.show"
    preset="card"
    title="新增套件"
    style="width: 720px"
    :mask-closable="false"
  >
    <n-form :label-width="110" :model="addModal" label-placement="left">
      <n-form-item label="套件名称" required>
        <n-input
          v-model:value="addModal.name"
          maxlength="32"
          show-count
          placeholder="请输入套件名称（最长 32 字）"
        />
      </n-form-item>
      <n-form-item label="套件描述">
        <n-input
          v-model:value="addModal.description"
          type="textarea"
          placeholder="请输入套件描述"
          :autosize="{ minRows: 2, maxRows: 5 }"
        />
      </n-form-item>
      <n-form-item label="运行模式">
        <n-select
          v-model:value="addModal.run_type"
          :options="runTypeOptions"
          placeholder="请选择运行模式"
          placement="bottom"
        />
      </n-form-item>
      <n-form-item v-if="addModal.run_type === 'C'" label="运行表达式" required>
        <n-input v-model:value="addModal.cron" placeholder="请输入 cron 表达式，如 */2 * * * *" />
      </n-form-item>
      <n-form-item v-if="addModal.run_type === 'WEBHOOK'" label="hook密钥" required>
        <n-input v-model:value="addModal.hook" placeholder="请输入 hook 密钥" />
      </n-form-item>
      <n-form-item label="关联UI用例">
        <n-select
          v-model:value="addModal.case_ui_list"
          placeholder="请选择本套件包含的 UI 测试用例"
          :options="uiCaseOptions"
          multiple
          filterable
          clearable
          placement="bottom"
        />
      </n-form-item>
      <n-form-item label="关联接口用例">
        <n-select
          v-model:value="addModal.case_api_list"
          placeholder="请选择本套件包含的接口测试用例"
          :options="apiCaseOptions"
          multiple
          filterable
          clearable
          placement="bottom"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="addModal.show = false">取消</n-button>
        <n-button type="primary" :loading="addModal.loading" @click="submitAdd">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, h } from 'vue';
  import { parseISO, format as formatDateFns } from 'date-fns';
  import { BasicTable, TableAction } from '@/components/Table';
  import { useMessage, useDialog } from 'naive-ui';
  import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileTextOutlined,
    PlayCircleOutlined,
  } from '@vicons/antd';
  import { http } from '@/utils/http/axios';
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();

  // 当前项目 id
  const projectId = Number(route.params.id);
  const projectName = ref('');
  const tableTitle = computed(() =>
    projectName.value
      ? `${projectName.value}套件列表（项目ID：${projectId}）`
      : `项目套件列表（项目ID：${projectId}）`
  );

  const params = reactive({
    pageSize: 10,
  });

  const runTypeMap: Record<string, string> = {
    O: '执行一次',
    C: '定时执行',
    WEBHOOK: 'Webhook',
  };

  // 执行结果状态（对应后端 RunResult.RunStatus）
  const runStatusMap: Record<number, string> = {
    [-1]: '执行出错',
    0: '初始化',
    1: '正在执行',
    2: '正在输出报告',
    3: '执行完毕',
    4: '报告输出完毕',
  };

  const runTypeOptions = [
    { label: '执行一次', value: 'O' },
    { label: '定时执行', value: 'C' },
    { label: 'Webhook', value: 'WEBHOOK' },
  ];

  const columns = [
    { title: '套件名称', key: 'name', width: 200 },
    { title: '套件描述', key: 'description', width: 260 },
    {
      title: '运行模式',
      key: 'run_type',
      width: 120,
      render: (row: any) => runTypeMap[row.run_type] || row.run_type || '-',
    },
    { title: '运行表达式', key: 'cron', width: 160 },
    { title: 'hook密钥', key: 'hook', width: 160 },
  ];

  const actionColumn = reactive({
    width: 440,
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

  // 正在执行的套件 id（运行期间禁用其它运行按钮）
  const runningId = ref<number | null>(null);

  function createActions(record) {
    const actions: any[] = [];
    if (record.run_type === 'O') {
      actions.push({
        label: '运行',
        icon: PlayCircleOutlined,
        type: 'primary',
        loading: runningId.value === record.id,
        disabled: runningId.value != null,
        onClick: handleRun.bind(null, record),
      });
    } else {
      // 占位：非执行一次模式没有运行按钮，保留等宽槽位，保证详情/编辑/删除与其它行对齐
      actions.push({
        label: '运行',
        icon: PlayCircleOutlined,
        disabled: true,
        style: 'visibility: hidden',
      });
    }
    actions.push(
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
      {
        label: '查看结果',
        icon: FileTextOutlined,
        onClick: handleResult.bind(null, record),
      }
    );
    return actions;
  }

  // 列表数据：按项目 id 获取套件列表（get_single_suite 接口）
  const loadDataTable = async (res) => {
    return await http.request({
      url: '/suite/suite/get_single_suite/',
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

  // 关联用例选项与 id → 名称映射（新增弹窗选择 + 详情回显共用）
  const uiCaseOptions = ref<{ label: string; value: number }[]>([]);
  const apiCaseOptions = ref<{ label: string; value: number }[]>([]);
  const uiNameMap = ref<Record<number, string>>({});
  const apiNameMap = ref<Record<number, string>>({});

  async function loadCaseOptions() {
    try {
      const uiRes: any = await http.request({
        url: '/case_ui/case/get_single_case/',
        method: 'get',
        params: { project_id: projectId, page: 1, pageSize: 100 },
      });
      const uiList = uiRes?.list || (Array.isArray(uiRes) ? uiRes : []);
      uiCaseOptions.value = uiList.map((item: any) => ({
        label: item.name || `用例 ${item.id}`,
        value: item.id,
      }));
      uiNameMap.value = Object.fromEntries(uiList.map((item: any) => [item.id, item.name]));
    } catch (e) {
      console.error('加载 UI 用例列表失败:', e);
    }
    try {
      const apiRes: any = await http.request({
        url: '/case_api/case/',
        method: 'get',
        params: { page: 1, pageSize: 100 },
      });
      const apiList = apiRes?.list || (Array.isArray(apiRes) ? apiRes : []);
      const filtered = apiList.filter((item: any) => item.project === projectId);
      apiCaseOptions.value = filtered.map((item: any) => ({
        label: item.name || `接口用例 ${item.id}`,
        value: item.id,
      }));
      apiNameMap.value = Object.fromEntries(filtered.map((item: any) => [item.id, item.name]));
    } catch (e) {
      console.error('加载接口用例列表失败:', e);
    }
  }

  function caseNames(idList: any[], nameMap: Record<number, string>): string {
    if (!Array.isArray(idList) || idList.length === 0) return '-';
    return idList.map((id) => nameMap[id] || `ID: ${id}`).join('、');
  }
  const uiCaseNames = (ids: any[]) => caseNames(ids, uiNameMap.value);
  const apiCaseNames = (ids: any[]) => caseNames(ids, apiNameMap.value);

  // 运行套件：POST /suite/suite/{id}/run/（仅执行一次模式）
  async function handleRun(record) {
    runningId.value = record.id;
    try {
      const res: any = await http.request({
        url: `/suite/suite/${record.id}/run/`,
        method: 'post',
      });
      message.success(res?.result || '套件已触发执行');
    } catch (e) {
      console.error('执行套件失败:', e);
    } finally {
      runningId.value = null;
    }
  }

  // 详情弹窗状态
  const detailModal = reactive({
    show: false,
    loading: false,
    error: '',
    data: null as any,
  });

  // 运行结果弹窗状态
  const resultModal = reactive({
    show: false,
    loading: false,
    error: '',
    suiteName: '',
    rows: [] as any[],
  });

  // 展示套件详情（只读）：GET /suite/suite/{id}/
  async function handleDetail(record) {
    detailModal.show = true;
    detailModal.loading = true;
    detailModal.error = '';
    detailModal.data = null;
    try {
      const res: any = await http.request({
        url: `/suite/suite/${record.id}/`,
        method: 'get',
      });
      detailModal.data = res;
    } catch (e) {
      console.error('加载套件详情失败:', e);
      detailModal.error = '加载套件详情失败';
    } finally {
      detailModal.loading = false;
    }
  }

  function handleEdit(record) {
    router.push({ name: 'suite-suite_edit', params: { id: record.id } });
  }

  // 删除套件：二次确认后 DELETE /suite/suite/{id}/
  function handleDelete(record) {
    dialog.warning({
      title: '删除确认',
      content: `确定删除套件「${record.name}」吗？`,
      positiveText: '确定删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await http.request({
            url: `/suite/suite/${record.id}/`,
            method: 'delete',
          });
          message.success('删除套件成功');
          actionRef.value?.reload?.();
        } catch (e: any) {
          console.error('删除套件失败:', e);
          message.error(e?.message || '删除套件失败');
          throw e;
        }
      },
      onNegativeClick: () => {},
    });
  }

  // 查看套件执行结果：GET /suite/runresult/get_single_runresult/?suite_id=
  async function handleResult(record) {
    resultModal.show = true;
    resultModal.loading = true;
    resultModal.error = '';
    resultModal.rows = [];
    resultModal.suiteName = record.name || '';
    try {
      const res: any = await http.request({
        url: '/suite/runresult/get_single_runresult/',
        method: 'get',
        params: { suite_id: record.id },
      });
      resultModal.rows = res?.list || (Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('加载运行结果失败:', e);
      resultModal.error = '加载运行结果失败';
    } finally {
      resultModal.loading = false;
    }
  }

  function statusTagType(status: number) {
    if (status === -1) return 'error';
    if (status === 3 || status === 4) return 'success';
    if (status === 1 || status === 2) return 'warning';
    return 'default';
  }

  // 可在浏览器直接预览的文件类型
  const PREVIEW_EXT = ['html', 'htm', 'log', 'txt', 'yaml', 'yml'];

  function fileExt(url: string) {
    const file = (url.split('/').pop() || '').split('?')[0];
    const idx = file.lastIndexOf('.');
    return idx >= 0 ? file.slice(idx + 1).toLowerCase() : '';
  }

  function isPreviewable(url: string) {
    return PREVIEW_EXT.includes(fileExt(url));
  }

  // 从文件 URL 取文件名作为链接文案
  function fileNameFromUrl(url: string) {
    if (!url) return '-';
    const last = url.split('/').pop() || url;
    try {
      return decodeURIComponent(last);
    } catch {
      return last;
    }
  }

  // 预览：显式新开窗口，避免锚点 target 被忽略导致覆盖当前页
  function previewUrl(url?: string) {
    if (url) window.open(url, '_blank', 'noopener');
  }

  // UTC ISO 时间转本地可读时间（YYYY-MM-DD HH:mm:ss）
  function formatDateTime(iso?: string) {
    if (!iso) return '-';
    const d = parseISO(iso);
    return Number.isNaN(d.getTime()) ? iso : formatDateFns(d, 'yyyy-MM-dd HH:mm:ss');
  }

  // 下载文件：原生 a 标签触发，跨域时浏览器按响应类型决定下载或打开
  function downloadFile(url?: string) {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileNameFromUrl(url);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 新增弹窗状态
  const addModal = reactive({
    show: false,
    loading: false,
    name: '',
    description: '',
    run_type: 'O',
    cron: '',
    hook: '',
    case_ui_list: [] as number[],
    case_api_list: [] as number[],
  });

  function addSuite() {
    addModal.name = '';
    addModal.description = '';
    addModal.run_type = 'O';
    addModal.cron = '';
    addModal.hook = '';
    addModal.case_ui_list = [];
    addModal.case_api_list = [];
    addModal.show = true;
    loadCaseOptions();
  }

  // 新增套件：POST /suite/suite/
  async function submitAdd() {
    const name = addModal.name.trim();
    if (!name) {
      message.warning('请输入套件名称');
      return;
    }
    if (addModal.run_type === 'C' && !addModal.cron) {
      message.error('定时执行模式下请输入运行表达式');
      return;
    }
    if (addModal.run_type === 'WEBHOOK' && !addModal.hook) {
      message.error('Webhook 模式下请输入 hook 密钥');
      return;
    }
    addModal.loading = true;
    try {
      await http.request({
        url: '/suite/suite/',
        method: 'post',
        data: {
          name,
          description: addModal.description,
          project_id: projectId,
          run_type: addModal.run_type,
          cron: addModal.run_type === 'C' ? addModal.cron : '',
          hook: addModal.run_type === 'WEBHOOK' ? addModal.hook : '',
          case_ui_list: addModal.case_ui_list,
          case_api_list: addModal.case_api_list,
        },
      });
      message.success('新增套件成功');
      addModal.show = false;
      actionRef.value?.reload?.();
    } catch (e) {
      console.error('新增套件失败:', e);
    } finally {
      addModal.loading = false;
    }
  }

  function goBack() {
    router.push({ name: 'suite-suite' });
  }

  loadProjectName();
  loadCaseOptions();
</script>

<style lang="less" scoped>
  .detail-center {
    text-align: center;
    color: #999;
    padding: 24px 0;
  }
  .ro-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    align-items: flex-start;
  }
  .ro-label {
    width: 100px;
    flex-shrink: 0;
    color: #666;
  }
  .ro-value {
    flex: 1;
    word-break: break-all;
  }
  .result-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 60vh;
    overflow-y: auto;
  }
  .result-id {
    font-weight: 600;
  }
  .result-link {
    color: #1890ff;
    text-decoration: none;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  .yaml-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .yaml-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .yaml-name {
    color: #333;
  }
  .file-line {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
