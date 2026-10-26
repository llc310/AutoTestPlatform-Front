<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      :title="tableTitle"
      titleTooltip="测试步骤（Action）列表，按项目过滤（GET /api/case_ui/action/get_single_action/?project_id=xxx）"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1000"
    >
      <template #toolbar>
        <n-button type="primary" @click="addAction">新增测试步骤</n-button>
        <n-button @click="goBack">返回</n-button>
      </template>
    </BasicTable>

    <!-- 编辑测试步骤弹窗 -->
    <n-modal
      v-model:show="showEdit"
      preset="card"
      title="编辑测试步骤"
      style="width: 680px"
      :bordered="false"
    >
      <n-form :label-width="90" :model="editForm" label-placement="left" label-align="left">
        <n-form-item label="测试步骤名" path="name">
          <n-input v-model:value="editForm.name" placeholder="请输入测试步骤名" />
        </n-form-item>

        <!-- Allure 参数 -->
        <n-divider title-placement="center" style="margin: 8px 0">
          <span style="font-size: 14px; font-weight: 600">Allure 参数</span>
        </n-divider>
        <n-form-item label="feature">
          <n-input v-model:value="editForm.allure.feature" placeholder="feature" />
        </n-form-item>
        <n-form-item label="story">
          <n-input v-model:value="editForm.allure.story" placeholder="story" />
        </n-form-item>
        <n-form-item label="title">
          <n-input v-model:value="editForm.allure.title" placeholder="title" />
        </n-form-item>
        <n-form-item label="description">
          <n-input
            v-model:value="editForm.allure.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="description"
          />
        </n-form-item>

        <!-- 操作步骤列表（step_id） -->
        <n-divider title-placement="center" style="margin: 8px 0">
          <span style="font-size: 14px; font-weight: 600">操作步骤</span>
        </n-divider>
        <n-form-item label="步骤列表">
          <div style="width: 100%">
            <div
              v-for="(step, idx) in editForm.steps"
              :key="step.id ?? `new-${idx}`"
              style="
                display: flex;
                gap: 8px;
                align-items: flex-start;
                margin-bottom: 8px;
              "
            >
              <n-input-number
                v-model:value="step.sort"
                :min="0"
                placeholder="序号"
                style="width: 70px"
                @update:value="sortSteps"
              />
              <n-select
                v-model:value="step.action"
                :options="actionOptions"
                :render-label="renderKeywordLabel"
                placeholder="操作"
                style="width: 130px"
                @update:value="(val: string) => onStepActionChange(step, val)"
              />
              <n-select
                v-model:value="step.element_id"
                :options="elementOptions"
                :render-label="renderElementLabel"
                placeholder="元素"
                clearable
                style="width: 130px"
              />
              <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                <n-tag
                  v-for="(p, i) in step.paramsList"
                  :key="i"
                  closable
                  size="large"
                  @close="step.paramsList.splice(i, 1)"
                >
                  {{ p }}
                </n-tag>
                <n-input
                  v-if="step.showParamInput"
                  v-model:value="step.newParam"
                  placeholder="输入参数后回车"
                  @keydown.enter="confirmStepParam(step)"
                  @blur="step.showParamInput = false"
                  autofocus
                />
                <n-button v-else dashed @click="step.showParamInput = true">
                  + 添加参数
                </n-button>
              </div>
              <n-button size="small" type="error" ghost @click="removeStep(idx)">
                删除
              </n-button>
            </div>
            <n-button size="small" dashed @click="addStep">+ 添加步骤</n-button>
          </div>
        </n-form-item>

        <!-- Parametrize 参数 -->
        <n-divider title-placement="center" style="margin: 8px 0">
          <span style="font-size: 14px; font-weight: 600">Parametrize 参数</span>
        </n-divider>
        <div
          v-for="(item, ki) in editForm.parametrize.items"
          :key="ki"
          style="display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start;"
        >
          <div style="flex: 1;">
            <div style="margin-bottom: 6px; font-size: 14px;">param_key</div>
            <n-input v-model:value="item.param_key" placeholder="参数化键名" />
          </div>
          <div style="flex: 1;">
            <div style="margin-bottom: 6px; font-size: 14px;">param_value</div>
            <div
              v-for="(v, vi) in item.param_values"
              :key="vi"
              style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;"
            >
              <n-input v-model:value="item.param_values[vi]" placeholder="参数化键值" style="flex: 1">
                <template v-if="item.param_values[vi]" #suffix>
                  <n-text style="cursor: pointer; color: #d03050;" @click="item.param_values.splice(vi, 1)">×</n-text>
                </template>
              </n-input>
            </div>
            <n-button size="small" dashed @click="item.param_values.push('')">+ 添加值</n-button>
          </div>
          <n-button size="small" type="error" ghost style="margin-top: 28px;" @click="editForm.parametrize.items.splice(ki, 1)">
            删除键
          </n-button>
        </div>
        <n-button size="small" dashed @click="addParamKey">+ 添加键</n-button>

        <!-- Validate 参数 -->
        <n-divider title-placement="center" style="margin: 8px 0">
          <span style="font-size: 14px; font-weight: 600">Validate 参数</span>
        </n-divider>
        <div
          v-for="(item, vi) in editForm.validate.items"
          :key="vi"
          style="display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start;"
        >
          <div style="flex: 1;">
            <div style="margin-bottom: 6px; font-size: 14px;">validate_type</div>
            <n-select
              v-model:value="item.validate_type"
              :options="validateTypeOptions"
              placeholder="断言类型"
            />
          </div>
          <div style="flex: 1;">
            <div style="margin-bottom: 6px; font-size: 14px;">validate_params</div>
            <div
              v-for="(vp, vpi) in item.params"
              :key="vpi"
              style="border: 1px solid #e0e0e0; border-radius: 4px; padding: 8px; margin-bottom: 8px;"
            >
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <n-input
                  v-model:value="vp.expect_result"
                  placeholder="expect_result 期望值"
                  size="small"
                  style="flex: 1"
                >
                  <template v-if="vp.expect_result" #suffix>
                    <n-text style="cursor: pointer; color: #d03050;" @click="item.params.splice(vpi, 1)">×</n-text>
                  </template>
                </n-input>
              </div>
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">actual_result</div>
              <div style="display: flex; gap: 8px; margin-bottom: 6px;">
                <n-select
                  v-model:value="vp.actual_result.keyword"
                  :options="actionOptions"
                  :render-label="renderKeywordLabel"
                  placeholder="keyword"
                  size="small"
                  style="flex: 1; min-width: 120px;"
                />
                <n-select
                  v-model:value="vp.actual_result.element"
                  :options="elementOptions"
                  :render-label="renderElementLabel"
                  placeholder="element"
                  size="small"
                  clearable
                  style="flex: 1; min-width: 120px;"
                />
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <n-tag
                  v-for="(p, pi) in vp.actual_result.params"
                  :key="pi"
                  closable
                  size="small"
                  @close="vp.actual_result.params.splice(pi, 1)"
                >
                  {{ p }}
                </n-tag>
                <n-input
                  v-if="vp.actual_result._showInput"
                  v-model:value="vp.actual_result._newParam"
                  size="small"
                  placeholder="输入参数后回车"
                  @keydown.enter="confirmValidateActualParam(vp)"
                  @blur="vp.actual_result._showInput = false"
                  autofocus
                />
                <n-button v-else size="tiny" dashed @click="vp.actual_result._showInput = true">+ 参数</n-button>
              </div>
            </div>
            <n-button size="small" dashed @click="addValidateParam(item)">+ 添加参数</n-button>
          </div>
          <n-button
            size="small"
            type="error"
            ghost
            style="margin-top: 28px;"
            @click="editForm.validate.items.splice(vi, 1)"
          >
            删除
          </n-button>
        </div>
        <n-button size="small" dashed @click="addValidateItem">+ 添加断言</n-button>

        <n-space justify="end">
          <n-button @click="showEdit = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="saveEdit">保存</n-button>
        </n-space>
      </n-form>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, onMounted, h } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './actionListColumns';
  import { useMessage, useDialog, NTooltip, NSelect, NDynamicTags } from 'naive-ui';
  import { DeleteOutlined, EditOutlined, EyeOutlined } from '@vicons/antd';
  import { http } from '@/utils/http/axios';
  import { ActionAPI, StepAPI, AllureAPI, KeyWordAPI, ParametrizeAPI, ValidateAPI, ElementAPI } from '@/api/case_ui/http';
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const actionAPI = new ActionAPI();
  const stepAPI = new StepAPI();
  const allureAPI = new AllureAPI();
  const keywordAPI = new KeyWordAPI();
  const elementAPI = new ElementAPI();
  const parametrizeAPI = new ParametrizeAPI();
  const validateAPI = new ValidateAPI();

  // 当前项目 id
  const projectId = Number(route.params.id);
  // 项目名称（加载成功后把标题中的"项目"替换为实际名称）
  const projectName = ref('');
  const tableTitle = computed(() =>
    projectName.value
      ? `${projectName.value}测试步骤列表（项目ID：${projectId}）`
      : `项目测试步骤列表（项目ID：${projectId}）`
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

  // 列表数据：按项目 id 获取测试步骤（对应后端 /api/case_ui/action/get_single_action/）
  // 返回结构 { itemCount, pageCount, list }，与 BasicTable 分页字段约定一致
  const loadDataTable = async (res) => {
    return await actionAPI.getSingleAction(projectId, { ...params, ...res });
  };

  // 加载当前用户的项目，匹配当前项目 id 获取项目名称
  async function loadProjectName() {
    try {
      const res: any = await http.request({
        url: '/project/project/get_single_user_project/',
        method: 'get',
        params: { page: 1, page_size: 100 },
      });
      // 兼容分页对象 {list:[...]} 和直接返回数组两种结构
      const list = Array.isArray(res) ? res : res?.list || res?.results || [];
      const project = list.find(
        (item: any) => String(item.id) === String(projectId)
      );
      if (project) {
        projectName.value = project.name;
      }
    } catch (e) {
      console.error('加载项目名称失败:', e);
    }
  }

  function goBack() {
    router.push({ name: 'case_ui-action' });
  }

  // 以下按钮暂为界面展示，对应后端接口后续完善
  function addAction() {
    message.info('您点击了新增按钮，增删改暂为界面展示，接口对接后续完善');
  }

  function handleDetail(record) {
    console.log(record);
    message.info(`您点击了详情（测试步骤：${record.id}），接口对接后续完善`);
  }

  // 编辑：先通过 get_single_action 获取当前项目下的测试步骤，再打开编辑弹窗
  async function handleEdit(record) {
    console.log(record);
    let target: any = record;
    try {
      const res: any = await actionAPI.getSingleAction(projectId);
      const list = res?.list || [];
      target = list.find((item: any) => item.id === record.id) || record;
    } catch (e) {
      console.error('get_single_action 获取失败，回退使用列表行数据:', e);
    }
    openEditDialog(target);
  }

  // 编辑弹窗状态
  const showEdit = ref(false);
  const saving = ref(false);
  const editingId = ref<number | null>(null);

  // step 操作下拉选项：从关键字管理接口拉取 keyword_name + description
  const actionOptions = ref<
    { label: string; value: string; id: number; description?: string }[]
  >([]);

  async function loadKeywords() {
    try {
      const res: any = await keywordAPI.getDataList();
      const list = res?.list || res?.results || (Array.isArray(res) ? res : []);
      actionOptions.value = list.map((k: any) => ({
        label: k.keyword_name,
        value: k.keyword_name,
        id: k.id,
        description: k.description || '',
      }));
    } catch (e) {
      console.error('加载关键字列表失败:', e);
    }
  }

  const elementOptions = ref<{ label: string; value: number; by?: string; path?: string }[]>([]);
  async function loadElements() {
    try {
      const res: any = await elementAPI.getElement({ project_id: projectId });
      const list = res?.list || res?.results || (Array.isArray(res) ? res : []);
      elementOptions.value = list.map((el: any) => ({
        label: el.name,
        value: el.id,
        by: el.by || '',
        path: el.path || '',
      }));
    } catch (e) {
      console.error('加载元素列表失败:', e);
    }
  }

  // 元素下拉选项：悬停显示 定位方式 + 定位值
  function renderElementLabel(option: any) {
    return h(
      NTooltip,
      { trigger: 'hover' },
      {
        trigger: () =>
          h(
            'div',
            {
              style:
                'display:block; width:100%; min-width:180px; margin:-8px -12px; padding:8px 12px; cursor:default;',
            },
            option.label
          ),
        default: () =>
          h('span', null, `定位方式: ${option.by || '-'}，定位值: ${option.path || '-'}`),
      }
    );
  }

  // 渲染下拉选项：鼠标悬停整行 tooltip 展示 "关键字名(描述)"
  function renderKeywordLabel(option: any) {
    return h(
      NTooltip,
      { trigger: 'hover' },
      {
        trigger: () =>
          h(
            'div',
            {
              style:
                'display:block; width:100%; min-width:180px; margin:-8px -12px; padding:8px 12px; cursor:default;',
            },
            option.label
          ),
        default: () => h('span', null, `${option.label}(${option.description || ''})`),
      }
    );
  }

  const editForm = reactive({
    name: '',
    project_id: projectId,
    steps: [] as any[],
    allure: { id: null as number | null, feature: '', story: '', title: '', description: '' },
    parametrize: {
      id: null as number | null,
      items: [] as { param_key: string; param_values: string[] }[],
    },
    validate: {
      id: null as number | null,
      items: [] as {
        validate_type: string | null;
        params: {
          expect_result: string;
          actual_result: { keyword: string | null; element: number | null; params: string[] };
        }[];
      }[],
    },
  });

  // 断言类型选项（对应后端 ValidateTypeEnum）
  const validateTypeOptions = [
    { label: 'equals', value: 'equals' },
    { label: 'contains', value: 'contains' },
    { label: 'db_equals', value: 'db_equals' },
    { label: 'db_contains', value: 'db_contains' },
  ];
  // 打开弹窗时的原始 step id 集合，用于保存时 diff 出删除项
  const originalStepIds = ref<number[]>([]);

  function openEditDialog(record) {
    editingId.value = record.id ?? null;
    editForm.name = record.name ?? '';
    editForm.project_id = record.project_id ?? projectId;
    // 兜底：项目名还没加载到就拉一次
    if (!projectName.value) {
      loadProjectName();
    }
    // allure 四个字段
    const al = record.allure_id || {};
    editForm.allure.id = al.id ?? null;
    editForm.allure.feature = al.feature ?? '';
    editForm.allure.story = al.story ?? '';
    editForm.allure.title = al.title ?? '';
    editForm.allure.description = al.description ?? '';
    // parametrize 参数：后端返回单个 parametrize 对象，包成 items 数组
    const pm = record.parametrize_id || {};
    editForm.parametrize.id = pm.id ?? null;
    if (pm.param_key) {
      let values: string[] = [];
      if (Array.isArray(pm.param_value)) {
        values = pm.param_value;
      } else if (pm.param_value != null && pm.param_value !== '') {
        values = [String(pm.param_value)];
      }
      editForm.parametrize.items = [{ param_key: pm.param_key, param_values: values }];
    } else {
      editForm.parametrize.items = [];
    }
    // validate 参数
    const vd = record.validate_id || {};
    editForm.validate.id = vd.id ?? null;
    if (vd.validate_type) {
      const types = Array.isArray(vd.validate_type) ? vd.validate_type : [vd.validate_type];
      const rawParams = Array.isArray(vd.validate_params) ? vd.validate_params : (vd.validate_params ? [vd.validate_params] : []);
      editForm.validate.items = types.map((t: string) => ({
        validate_type: t,
        params: rawParams.map((p: any) => ({
          expect_result: p?.expect_result ?? '',
          actual_result: {
            keyword: p?.actual_result?.keyword ?? null,
            element: p?.actual_result?.element ?? null,
            params: Array.isArray(p?.actual_result?.params) ? p.actual_result.params : [],
            _showInput: false,
            _newParam: '',
          },
        })),
      }));
    } else {
      editForm.validate.items = [];
    }
    // 深拷贝 step_id，保留 id/keyword_id/element_id/action_id 等外键字段原样回传
    editForm.steps = Array.isArray(record.step_id)
      ? record.step_id.map((s: any, i: number) => {
          // 兼容旧结构 {value:"xxx"} 和新结构数组 ["xxx","yyy"]
          let paramsList: string[] = [];
          if (Array.isArray(s.params)) {
            paramsList = s.params;
          } else if (s.params && s.params.value != null) {
            paramsList = [String(s.params.value)];
          }
          return {
            id: s.id ?? null,
            action: s.action ?? 'click',
            params: s.params ? { ...s.params } : {},
            paramsList,
            showParamInput: false,
            newParam: '',
            sort: s.sort ?? i + 1,
            keyword_id: s.keyword_id ?? null,
            element_id: s.element_id ?? null,
            action_id: s.action_id ?? record.id ?? null,
          };
        })
      : [];
    originalStepIds.value = editForm.steps
      .map((s) => s.id)
      .filter((id): id is number => id != null);
    showEdit.value = true;
  }

  function addStep() {
    editForm.steps.push({
      id: null,
      action: 'click',
      params: {},
      paramsList: [],
      showParamInput: false,
      newParam: '',
      sort: editForm.steps.length + 1,
      keyword_id: null,
      element_id: null,
      action_id: editingId.value,
    });
  }

  // 选中关键字后联动设置 keyword_id
  function onStepActionChange(step: any, val: string) {
    const matched = actionOptions.value.find((o) => o.value === val);
    step.keyword_id = matched ? matched.id : null;
  }

  // 参数 tag 输入：按空格生成块
  function handleParamKeydown(e: KeyboardEvent, step: any) {
    if (e.code === 'Space') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const val = (input.value || '').trim();
      if (val && !step.paramsList.includes(val)) {
        step.paramsList.push(val);
      }
      input.value = '';
    }
  }

  // parametrize param_value 多值输入：按空格生成块
  function handleParametrizeValueKeydown(e: KeyboardEvent) {
    if (e.code === 'Space') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const val = (input.value || '').trim();
      if (val && !editForm.parametrize.param_values.includes(val)) {
        editForm.parametrize.param_values.push(val);
      }
      input.value = '';
    }
  }

  function removeStep(idx: number) {
    editForm.steps.splice(idx, 1);
  }

  // parametrize：添加新的 key-value 组
  function addParamKey() {
    editForm.parametrize.items.push({ param_key: '', param_values: [''] });
  }

  // 操作步骤参数：回车确认添加
  function confirmStepParam(step: any) {
    const val = (step.newParam || '').trim();
    if (val) {
      step.paramsList.push(val);
    }
    step.newParam = '';
    step.showParamInput = false;
  }

  // validate：添加一组断言
  function addValidateItem() {
    editForm.validate.items.push({
      validate_type: null,
      params: [],
    });
  }

  // validate：在某组断言下添加一个 validate_param
  function addValidateParam(item: any) {
    item.params.push({
      expect_result: '',
      actual_result: { keyword: null, element: null, params: [], _showInput: false, _newParam: '' },
    });
  }

  // validate：actual_result.params 回车确认
  function confirmValidateActualParam(vp: any) {
    const val = (vp.actual_result._newParam || '').trim();
    if (val) {
      vp.actual_result.params.push(val);
    }
    vp.actual_result._newParam = '';
    vp.actual_result._showInput = false;
  }

  // 修改 order 后按执行顺序重排行，允许不连续但不允许重复
  function sortSteps() {
    const sorts = editForm.steps.map((s) => s.sort);
    const hasDuplicate = sorts.some((o, i) => sorts.indexOf(o) !== i);
    if (hasDuplicate) {
      message.warning('步骤序号重复，请调整为不重复的值');
    }
    editForm.steps.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }

  // 保存编辑：先 PUT action 的 name/project_id，再 diff step 列表调独立接口
  async function saveEdit() {
    if (editingId.value == null) return;
    saving.value = true;
    try {
      // 1. 更新 action 本身（后端 ActionRequest 接受 name/project_id）
      await actionAPI.updateDataByID(editingId.value, {
        name: editForm.name,
        project_id: editForm.project_id,
      } as any);

      // 1b. 更新 allure（有 id 才 PUT；无 id 说明 action 尚未关联 allure，跳过）
      if (editForm.allure.id != null) {
        await allureAPI.updateDataByID(editForm.allure.id, {
          feature: editForm.allure.feature,
          story: editForm.allure.story,
          title: editForm.allure.title,
          description: editForm.allure.description,
        } as any);
      }

      // 1c. 更新 parametrize（有 id 才 PUT，提交第一个 key-value 组）
      if (editForm.parametrize.id != null && editForm.parametrize.items.length > 0) {
        const first = editForm.parametrize.items[0];
        await parametrizeAPI.updateDataByID(editForm.parametrize.id, {
          param_key: first.param_key,
          param_value: first.param_values.length > 1 ? first.param_values : first.param_values[0] ?? '',
        } as any);
      }

      // 1d. 更新 validate（有 id 才 PUT，提交第一组，清理临时字段）
      if (editForm.validate.id != null && editForm.validate.items.length > 0) {
        const first = editForm.validate.items[0];
        const cleanParams = first.params.map((p: any) => ({
          expect_result: p.expect_result,
          actual_result: {
            keyword: p.actual_result.keyword,
            element: p.actual_result.element,
            params: p.actual_result.params,
          },
        }));
        await validateAPI.updateDataByID(editForm.validate.id, {
          validate_type: first.validate_type,
          validate_params: cleanParams,
        } as any);
      }

      // 2. diff step 列表
      const currentStepIds = editForm.steps
        .map((s) => s.id)
        .filter((id): id is number => id != null);

      // 2a. 被删除的 step：原始有、现在没有 → DELETE
      const deletedIds = originalStepIds.value.filter(
        (id) => !currentStepIds.includes(id)
      );
      for (const id of deletedIds) {
        await stepAPI.deleteDataByID(id);
      }

      // 2b. 遍历当前列表：有 id 的 PUT 更新，没 id 的 POST 新建
      for (const step of editForm.steps) {
        const payload = {
          action: step.action,
          params: step.paramsList && step.paramsList.length ? step.paramsList : {},
          sort: step.sort ?? 0,
          keyword_id: step.keyword_id,
          element_id: step.element_id,
          action_id: editingId.value,
        };
        if (step.id != null) {
          await stepAPI.updateDataByID(step.id, payload as any);
        } else {
          await stepAPI.createData(payload as any);
        }
      }

      message.success('保存成功');
      showEdit.value = false;
      actionRef.value.reload();
    } catch (e) {
      console.error('保存失败:', e);
      message.error('保存失败');
    } finally {
      saving.value = false;
    }
  }

  function handleDelete(record) {
    console.log(record);
    dialog.info({
      title: '提示',
      content: `您想删除测试步骤：${record.id}`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        message.info(`已点击删除（测试步骤：${record.id}），接口对接后续完善`);
      },
      onNegativeClick: () => {},
    });
  }

  onMounted(() => {
    loadProjectName();
    loadKeywords();
    loadElements();
  });
</script>

<style lang="less" scoped>
  // 参数 tag 垂直排列：新参数在下方新行
  .param-tags {
    flex-direction: column;
    align-items: stretch;
  }
</style>
