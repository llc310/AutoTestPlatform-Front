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
    style="width: 900px"
    :mask-closable="false"
  >
    <div v-if="detailModal.loading" class="detail-center">加载中...</div>
    <div v-else-if="detailModal.error" class="detail-center">{{ detailModal.error }}</div>
    <template v-else>
      <div class="detail-case-name">用例名称：{{ detailModal.caseName || '-' }}</div>
      <div v-if="detailModal.rows.length === 0" class="detail-center">该用例暂无测试步骤</div>
      <div
        v-for="(action, index) in detailModal.rows"
        :key="action._linkId ?? action.id"
        class="detail-case"
      >
        <n-card size="small" :bordered="true">
          <n-space vertical :size="8">
            <n-space align="center" :size="16">
              <span class="detail-step-index">测试步骤 {{ index + 1 }}</span>
              <span>测试步骤名：{{ action.name || '-' }}</span>
              <span>执行顺序：{{ action._sort }}</span>
              <n-button size="small" @click="toggleExpand(action)">
                <template #icon>
                  <n-icon :component="isExpanded(action) ? UpOutlined : DownOutlined" />
                </template>
              </n-button>
            </n-space>

            <div v-show="isExpanded(action)">
            <!-- Allure 参数 -->
            <n-divider title-placement="center" style="margin: 8px 0">
              <span style="font-size: 14px; font-weight: 600">Allure 参数</span>
            </n-divider>
            <div class="ro-row">
              <div class="ro-label">feature</div>
              <div class="ro-value">{{ action.allure?.feature || '-' }}</div>
            </div>
            <div class="ro-row">
              <div class="ro-label">story</div>
              <div class="ro-value">{{ action.allure?.story || '-' }}</div>
            </div>
            <div class="ro-row">
              <div class="ro-label">title</div>
              <div class="ro-value">{{ action.allure?.title || '-' }}</div>
            </div>
            <div class="ro-row">
              <div class="ro-label">description</div>
              <div class="ro-value">{{ action.allure?.description || '-' }}</div>
            </div>

            <!-- 操作步骤 -->
            <n-divider title-placement="center" style="margin: 8px 0">
              <span style="font-size: 14px; font-weight: 600">操作步骤</span>
            </n-divider>
            <div class="ro-row" style="align-items: flex-start;">
              <div class="ro-label">步骤列表</div>
              <div class="ro-value" style="width: 100%;">
                <div style="display: flex; gap: 8px; margin-bottom: 6px; font-size: 13px; color: #666;">
                  <div style="width: 70px;">序号</div>
                  <div style="width: 150px;">操作描述</div>
                  <div style="width: 130px;">操作</div>
                  <div style="width: 130px;">元素</div>
                  <div style="flex: 1;">参数</div>
                </div>
                <div
                  v-for="(s, i) in action.step || []"
                  :key="i"
                  style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px;"
                >
                  <div class="ro-cell" style="width: 70px;">{{ s.sort ?? i + 1 }}</div>
                  <div class="ro-cell" style="width: 150px;">{{ s.action || '-' }}</div>
                  <div class="ro-cell" style="width: 130px;">
                    {{ s.keyword_id == null ? '-' : keywordName(s.keyword_id) }}
                  </div>
                  <div class="ro-cell" style="width: 130px;">{{ s.element_id ?? '-' }}</div>
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                    <n-tag
                      v-for="(p, pi) in s.params || []"
                      :key="pi"
                      size="large"
                      style="align-self: flex-start;"
                    >
                      {{ p }}
                    </n-tag>
                    <span v-if="!s.params || s.params.length === 0" style="color: #999;">无参数</span>
                  </div>
                </div>
                <span v-if="!action.step || action.step.length === 0" style="color: #999;">-</span>
              </div>
            </div>

            <!-- Parametrize 参数 -->
            <n-divider title-placement="center" style="margin: 8px 0">
              <span style="font-size: 14px; font-weight: 600">Parametrize 参数</span>
            </n-divider>
            <div
              v-for="(values, key) in action.parametrize || {}"
              :key="key"
              style="display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start;"
            >
              <div style="flex: 1;">
                <div class="ro-col-title">param_key</div>
                <div class="ro-cell">{{ key }}</div>
              </div>
              <div style="flex: 1;">
                <div class="ro-col-title">param_value</div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <n-tag
                    v-for="(v, vi) in values || []"
                    :key="vi"
                    size="large"
                    style="align-self: flex-start;"
                  >
                    {{ v }}
                  </n-tag>
                  <span v-if="!values || values.length === 0" style="color: #999;">-</span>
                </div>
              </div>
            </div>
            <span
              v-if="!action.parametrize || Object.keys(action.parametrize).length === 0"
              style="color: #999;"
            >
              -
            </span>

            <!-- Validate 参数 -->
            <n-divider title-placement="center" style="margin: 8px 0">
              <span style="font-size: 14px; font-weight: 600">Validate 参数</span>
            </n-divider>
            <div
              v-for="(vps, vtype) in action.validate || {}"
              :key="vtype"
              style="display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start;"
            >
              <div style="flex: 1;">
                <div class="ro-col-title">validate_type</div>
                <div class="ro-cell">{{ vtype }}</div>
              </div>
              <div style="flex: 1;">
                <div class="ro-col-title">validate_params</div>
                <div
                  v-for="(vp, vpi) in vps || []"
                  :key="vpi"
                  style="border: 1px solid #e0e0e0; border-radius: 4px; padding: 8px; margin-bottom: 8px;"
                >
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">expect_result</div>
                  <div class="ro-cell" style="margin-bottom: 8px;">{{ vp.expect_result ?? '-' }}</div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">actual_result</div>
                  <div style="display: flex; gap: 16px; margin-bottom: 6px;">
                    <div class="ro-cell">
                      keyword：{{
                        vp.actual_result?.keyword_id == null
                          ? '-'
                          : keywordName(vp.actual_result.keyword_id)
                      }}
                    </div>
                    <div class="ro-cell">element：{{ vp.actual_result?.element_id ?? '-' }}</div>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <n-tag
                      v-for="(p, pi) in vp.actual_result?.params || []"
                      :key="pi"
                      size="small"
                      style="align-self: flex-start;"
                    >
                      {{ p }}
                    </n-tag>
                    <span
                      v-if="!vp.actual_result?.params || vp.actual_result.params.length === 0"
                      style="color: #999;"
                    >
                      无参数
                    </span>
                  </div>
                </div>
                <span v-if="!vps || vps.length === 0" style="color: #999;">-</span>
              </div>
            </div>
            <span
              v-if="!action.validate || Object.keys(action.validate).length === 0"
              style="color: #999;"
            >
              -
            </span>
            </div>
          </n-space>
        </n-card>
      </div>
    </template>
  </n-modal>

  <n-modal
    v-model:show="addModal.show"
    preset="card"
    title="新增用例"
    style="width: 900px"
    :mask-closable="false"
  >
    <n-form label-placement="left" :label-width="100" label-align="left">
      <n-grid :cols="2" :x-gap="16">
        <n-form-item-gi label="用例名称" required>
          <n-input
            v-model:value="addModal.name"
            maxlength="64"
            show-count
            placeholder="请输入用例名称（最长 64 字）"
          />
        </n-form-item-gi>
        <n-form-item-gi label="所属项目">
          <n-input :value="`${projectName || ''}（ID：${projectId}）`" disabled />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-divider title-placement="left">测试步骤（{{ addModal.steps.length }}）</n-divider>

    <!-- 添加步骤：从当前项目拥有的 action 中选一条加入本用例 -->
    <div class="add-step-bar">
      <n-select
        v-model:value="addModal.selectedActionId"
        :options="addModal.actionOptions"
        placeholder="选择要添加的测试步骤"
        filterable
        clearable
        style="width: 320px"
      />
      <n-button type="primary" @click="addActionToNewCase">添加步骤</n-button>
    </div>

    <div v-if="addModal.steps.length === 0" class="empty-tip">暂无测试步骤</div>
    <div v-for="(action, index) in addModal.steps" :key="action._tmpId" class="step-card">
      <n-card size="small" :bordered="true">
        <n-space vertical :size="8">
          <n-space align="center" :size="8">
            <span class="detail-step-index">测试步骤 {{ index + 1 }}</span>
            <span>执行顺序：</span>
            <n-input-number
              v-model:value="action._sort"
              :min="1"
              :max="addModal.steps.length"
              size="small"
              style="width: 90px"
              @update:value="onNewOrderChange"
            />
            <n-button size="small" @click="toggleNewExpand(action)">
              <template #icon>
                <n-icon :component="isNewExpanded(action) ? UpOutlined : DownOutlined" />
              </template>
            </n-button>
            <n-button size="small" type="error" @click="removeNewStep(action)">删除</n-button>
          </n-space>

          <div class="ro-row">
            <div class="ro-label">测试步骤名</div>
            <div class="ro-value">{{ action.name || '-' }}</div>
          </div>

          <div v-show="isNewExpanded(action)">
            <!-- Allure 参数 -->
            <n-divider title-placement="center" style="margin: 8px 0">
              <span style="font-size: 14px; font-weight: 600">Allure 参数</span>
            </n-divider>
            <div class="ro-row">
              <div class="ro-label">feature</div>
              <div class="ro-value">{{ action.allure?.feature || '-' }}</div>
            </div>
            <div class="ro-row">
              <div class="ro-label">story</div>
              <div class="ro-value">{{ action.allure?.story || '-' }}</div>
            </div>
            <div class="ro-row">
              <div class="ro-label">title</div>
              <div class="ro-value">{{ action.allure?.title || '-' }}</div>
            </div>
            <div class="ro-row">
              <div class="ro-label">description</div>
              <div class="ro-value">{{ action.allure?.description || '-' }}</div>
            </div>

            <!-- 操作步骤 -->
            <n-divider title-placement="center" style="margin: 8px 0">
              <span style="font-size: 14px; font-weight: 600">操作步骤</span>
            </n-divider>
            <div class="ro-row" style="align-items: flex-start;">
              <div class="ro-label">步骤列表</div>
              <div class="ro-value" style="width: 100%;">
                <div style="display: flex; gap: 8px; margin-bottom: 6px; font-size: 13px; color: #666;">
                  <div style="width: 70px;">序号</div>
                  <div style="width: 150px;">操作描述</div>
                  <div style="width: 130px;">操作</div>
                  <div style="width: 130px;">元素</div>
                  <div style="flex: 1;">参数</div>
                </div>
                <div
                  v-for="(s, i) in action.step || []"
                  :key="i"
                  style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px;"
                >
                  <div class="ro-cell" style="width: 70px;">{{ s.sort ?? i + 1 }}</div>
                  <div class="ro-cell" style="width: 150px;">{{ s.action || '-' }}</div>
                  <div class="ro-cell" style="width: 130px;">
                    {{ s.keyword_id == null ? '-' : keywordName(s.keyword_id) }}
                  </div>
                  <div class="ro-cell" style="width: 130px;">{{ s.element_id ?? '-' }}</div>
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                    <n-tag
                      v-for="(p, pi) in s.params || []"
                      :key="pi"
                      size="large"
                      style="align-self: flex-start;"
                    >
                      {{ p }}
                    </n-tag>
                    <span v-if="!s.params || s.params.length === 0" style="color: #999;">无参数</span>
                  </div>
                </div>
                <span v-if="!action.step || action.step.length === 0" style="color: #999;">-</span>
              </div>
            </div>

            <!-- Parametrize 参数 -->
            <n-divider title-placement="center" style="margin: 8px 0">
              <span style="font-size: 14px; font-weight: 600">Parametrize 参数</span>
            </n-divider>
            <div
              v-for="(values, key) in action.parametrize || {}"
              :key="key"
              style="display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start;"
            >
              <div style="flex: 1;">
                <div class="ro-col-title">param_key</div>
                <div class="ro-cell">{{ key }}</div>
              </div>
              <div style="flex: 1;">
                <div class="ro-col-title">param_value</div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <n-tag
                    v-for="(v, vi) in values || []"
                    :key="vi"
                    size="large"
                    style="align-self: flex-start;"
                  >
                    {{ v }}
                  </n-tag>
                  <span v-if="!values || values.length === 0" style="color: #999;">-</span>
                </div>
              </div>
            </div>
            <span
              v-if="!action.parametrize || Object.keys(action.parametrize).length === 0"
              style="color: #999;"
            >
              -
            </span>

            <!-- Validate 参数 -->
            <n-divider title-placement="center" style="margin: 8px 0">
              <span style="font-size: 14px; font-weight: 600">Validate 参数</span>
            </n-divider>
            <div
              v-for="(vps, vtype) in action.validate || {}"
              :key="vtype"
              style="display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start;"
            >
              <div style="flex: 1;">
                <div class="ro-col-title">validate_type</div>
                <div class="ro-cell">{{ vtype }}</div>
              </div>
              <div style="flex: 1;">
                <div class="ro-col-title">validate_params</div>
                <div
                  v-for="(vp, vpi) in vps || []"
                  :key="vpi"
                  style="border: 1px solid #e0e0e0; border-radius: 4px; padding: 8px; margin-bottom: 8px;"
                >
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">expect_result</div>
                  <div class="ro-cell" style="margin-bottom: 8px;">{{ vp.expect_result ?? '-' }}</div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">actual_result</div>
                  <div style="display: flex; gap: 16px; margin-bottom: 6px;">
                    <div class="ro-cell">
                      keyword：{{
                        vp.actual_result?.keyword_id == null
                          ? '-'
                          : keywordName(vp.actual_result.keyword_id)
                      }}
                    </div>
                    <div class="ro-cell">element：{{ vp.actual_result?.element_id ?? '-' }}</div>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <n-tag
                      v-for="(p, pi) in vp.actual_result?.params || []"
                      :key="pi"
                      size="small"
                      style="align-self: flex-start;"
                    >
                      {{ p }}
                    </n-tag>
                    <span
                      v-if="!vp.actual_result?.params || vp.actual_result.params.length === 0"
                      style="color: #999;"
                    >
                      无参数
                    </span>
                  </div>
                </div>
                <span v-if="!vps || vps.length === 0" style="color: #999;">-</span>
              </div>
            </div>
            <span
              v-if="!action.validate || Object.keys(action.validate).length === 0"
              style="color: #999;"
            >
              -
            </span>
          </div>
        </n-space>
      </n-card>
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button @click="addModal.show = false">取消</n-button>
        <n-button type="primary" :loading="addModal.loading" @click="submitAdd">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, onMounted, nextTick, h } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './caseListColumns';
  import { useMessage, useDialog } from 'naive-ui';
  import { DeleteOutlined, EditOutlined, EyeOutlined, DownOutlined, UpOutlined } from '@vicons/antd';
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

  // 关键字 id → 关键字名 映射（详情里步骤的关键字展示）
  const keywordMap = ref<Record<number, string>>({});
  function keywordName(id: number | null | undefined): string {
    if (id == null) return '-';
    return keywordMap.value[id] ?? String(id);
  }
  async function loadKeywords() {
    try {
      const res: any = await http.request({
        url: '/case_ui/keyword/',
        method: 'get',
      });
      const list = res?.list || res?.results || (Array.isArray(res) ? res : []);
      const map: Record<number, string> = {};
      for (const k of list) {
        map[k.id] = k.keyword_name;
      }
      keywordMap.value = map;
    } catch (e) {
      console.error('加载关键字列表失败:', e);
    }
  }

  function goBack() {
    router.push({ name: 'case_ui-case' });
  }

  // 新增用例弹窗状态
  const addModal = reactive({
    show: false,
    loading: false,
    name: '',
    selectedActionId: null as number | null,
    actionOptions: [] as any[],
    steps: [] as any[],
  });
  // 新增弹窗内可选 action 的完整数据 + 各卡片展开状态
  const actionCache = ref<any[]>([]);
  const newExpanded = ref<Record<string, boolean>>({});
  let newTempSeq = 1;

  function newKey(row: any) {
    return String(row._tmpId ?? row.id);
  }
  function isNewExpanded(row: any) {
    return !!newExpanded.value[newKey(row)];
  }
  function toggleNewExpand(row: any) {
    const key = newKey(row);
    newExpanded.value[key] = !newExpanded.value[key];
  }

  // 后端接口返回结构不统一：部分为 { code, message, result }，部分是 DRF 裸结构
  // 统一取原生响应体后兼容解包，避免全局拦截器把裸结构当成失败
  async function requestRaw(config: any) {
    const res: any = await http.request({
      ...config,
      meta: { isReturnNativeResponse: true },
    });
    if (res && typeof res === 'object' && !Array.isArray(res) && 'code' in res) {
      const ok = res.code === 0 || res.code === 200 || res.code === 201;
      if (!ok) throw new Error(res.message || '请求失败');
      return res.result;
    }
    return res;
  }

  function addCase() {
    addModal.name = '';
    addModal.selectedActionId = null;
    addModal.steps = [];
    addModal.actionOptions = [];
    actionCache.value = [];
    newExpanded.value = {};
    addModal.show = true;
    loadActionOptions();
  }

  // 可选测试步骤：GET /case_ui/action/get_single_action/?project_id=（分页拉全）
  // 后端 CaseUI 已删除 action_id，详情里也复用这份列表按 id 映射测试步骤
  async function loadActionOptions() {
    try {
      const list: any[] = [];
      let page = 1;
      let hasNext = true;
      while (hasNext) {
        const res: any = await requestRaw({
          url: '/case_ui/action/get_single_action/',
          method: 'get',
          params: { project_id: projectId, page },
        });
        const pageList = res?.list || res?.results || (Array.isArray(res) ? res : []);
        list.push(...pageList);
        const more = !!(res?.next || (res?.pageCount && page < res.pageCount));
        if (!pageList.length || !more) {
          hasNext = false;
        } else {
          page += 1;
        }
      }
      actionCache.value = list;
      addModal.actionOptions = list.map((a: any) => ({ label: a.name, value: a.id }));
      return list;
    } catch (e) {
      console.error('加载测试步骤列表失败:', e);
      message.error('加载测试步骤列表失败');
      return [];
    }
  }

  // 相同 action 允许重复添加，顺序按添加后的执行顺序重排
  function addActionToNewCase() {
    if (addModal.selectedActionId == null) {
      message.warning('请选择要添加的测试步骤');
      return;
    }
    const action = actionCache.value.find((a: any) => a.id === addModal.selectedActionId);
    if (!action) {
      message.warning('未找到该测试步骤数据');
      return;
    }
    addModal.steps.push({
      ...action,
      _tmpId: newTempSeq++,
      _sort: addModal.steps.length + 1,
    });
    addModal.selectedActionId = null;
  }

  function removeNewStep(row: any) {
    addModal.steps = addModal.steps.filter((s: any) => s._tmpId !== row._tmpId);
    addModal.steps.forEach((s: any, i: number) => {
      s._sort = i + 1;
    });
    delete newExpanded.value[newKey(row)];
  }

  // 调整执行顺序后卡片按 _sort 重排
  function onNewOrderChange() {
    nextTick(() => {
      addModal.steps = addModal.steps
        .slice()
        .sort((a: any, b: any) => Number(a._sort) - Number(b._sort));
    });
  }

  // 新增用例：先 POST /case_ui/case/ 创建用例，再逐条 POST /case_ui/caseaction/ 绑定步骤
  async function submitAdd() {
    const name = addModal.name.trim();
    if (!name) {
      message.warning('请输入用例名称');
      return;
    }
    addModal.loading = true;
    let createdId: number | null = null;
    try {
      const created: any = await requestRaw({
        url: '/case_ui/case/',
        method: 'post',
        data: { name, project_id: projectId },
      });
      createdId = created?.id ?? null;

      if (addModal.steps.length > 0) {
        if (!createdId) {
          throw new Error('用例已创建但未返回 id，测试步骤未添加');
        }
        const sorted = addModal.steps
          .slice()
          .sort((a: any, b: any) => Number(a._sort) - Number(b._sort));
        for (let i = 0; i < sorted.length; i++) {
          await requestRaw({
            url: '/case_ui/caseaction/',
            method: 'post',
            data: { caseui_id: createdId, action_id: sorted[i].id, sort: i + 1 },
          });
        }
      }

      message.success('新增用例成功');
      addModal.show = false;
      actionRef.value?.reload?.();
    } catch (e: any) {
      console.error('新增用例失败:', e);
      const msg = e?.message || '新增用例失败';
      message.error(createdId ? `用例已创建，但测试步骤添加失败：${msg}` : msg);
      if (createdId) {
        actionRef.value?.reload?.();
      }
    } finally {
      addModal.loading = false;
    }
  }

  // 删除用例：DELETE /api/case_ui/case/{id}/
  // 后端 CaseUIAction.caseui_id 为 CASCADE，删除用例时会一并删除其步骤关联
  function handleDelete(record) {
    dialog.warning({
      title: '删除确认',
      content: `确定删除用例「${record.name}」吗？删除后该用例下的测试步骤关联也会一并删除。`,
      positiveText: '确定删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await requestRaw({
            url: `/case_ui/case/${record.id}/`,
            method: 'delete',
          });
          message.success('删除用例成功');
          actionRef.value?.reload?.();
        } catch (e: any) {
          console.error('删除用例失败:', e);
          message.error(e?.message || '删除用例失败');
          throw e;
        }
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
    caseName: '',
    rows: [] as any[],
    error: '',
  });

  // 各步骤卡片详情展开状态（默认收起）
  const detailExpanded = ref<Record<string, boolean>>({});
  function detailKey(row: any) {
    return String(row._linkId ?? row.id);
  }
  function isExpanded(row: any) {
    return !!detailExpanded.value[detailKey(row)];
  }
  function toggleExpand(row: any) {
    const key = detailKey(row);
    detailExpanded.value[key] = !detailExpanded.value[key];
  }

  // 展示用例详情（只读）：GET /case_ui/case/{id}/ + GET /case_ui/caseaction/?caseui_id=
  // 以 caseaction 关联记录驱动，每行对应一个步骤，按 sort 展示执行顺序
  async function handleDetail(record) {
    detailModal.show = true;
    detailModal.loading = true;
    detailModal.caseName = '';
    detailModal.rows = [];
    detailModal.error = '';
    detailExpanded.value = {};
    try {
      const caseRes: any = await requestRaw({
        url: `/case_ui/case/${record.id}/`,
        method: 'get',
      });
      detailModal.caseName = caseRes?.name ?? record?.name ?? '';
      // 后端 CaseUI 已删除 action_id，测试步骤数据改从项目 action 列表按 id 映射
      const actions: any[] = await loadActionOptions();

      const links: any[] = [];
      let page = 1;
      let hasNext = true;
      while (hasNext) {
        const res: any = await requestRaw({
          url: '/case_ui/caseaction/',
          method: 'get',
          params: { caseui_id: record.id, page },
        });
        const list = res?.list || res?.results || (Array.isArray(res) ? res : []);
        links.push(...list);
        const more = !!(res?.next || (res?.pageCount && page < res.pageCount));
        if (!list.length || !more) {
          hasNext = false;
        } else {
          page += 1;
        }
      }

      const actionMap: Record<string, any> = {};
      for (const a of actions) {
        actionMap[String(a.id)] = a;
      }

      if (links.length > 0) {
        detailModal.rows = links
          .slice()
          .sort((a, b) => Number(a.sort) - Number(b.sort))
          .map((link: any) => ({
            ...(actionMap[String(link.action_id)] || { id: link.action_id }),
            _linkId: link.id,
            _sort: link.sort,
          }));
      } else {
        // 没有 caseaction 关联记录时，该用例暂无步骤
        detailModal.rows = [];
      }

      if (detailModal.rows.length === 0) {
        detailModal.error = '';
      }
    } catch (e) {
      console.error('加载用例详情失败:', e);
      detailModal.error = '加载用例详情失败';
    } finally {
      detailModal.loading = false;
    }
  }

  onMounted(() => {
    loadProjectName();
    loadKeywords();
  });
</script>

<style lang="less" scoped>
  .detail-center {
    text-align: center;
    padding: 24px 0;
    color: #999;
  }
  .detail-case-name {
    font-weight: 600;
    margin-bottom: 10px;
  }
  .detail-case {
    margin-bottom: 10px;
  }
  .detail-step-index {
    font-weight: 500;
    color: #18a058;
  }
  .ro-row {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    line-height: 1.6;
  }
  .ro-label {
    width: 90px;
    flex-shrink: 0;
    color: #666;
  }
  .ro-value {
    color: #333;
    word-break: break-all;
  }
  .ro-col-title {
    margin-bottom: 6px;
    font-size: 14px;
  }
  .ro-cell {
    color: #333;
    word-break: break-all;
  }
  .mr-1 {
    margin-right: 6px;
  }
  .add-step-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
  }
  .empty-tip {
    color: #999;
    padding: 8px 0;
  }
  .step-card {
    margin-bottom: 12px;
  }
</style>
