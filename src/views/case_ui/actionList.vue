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
      :title="editingId ? '编辑测试步骤' : '新增测试步骤'"
      style="width: 820px"
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

        <!-- 操作步骤列表（step） -->
        <n-divider title-placement="center" style="margin: 8px 0">
          <span style="font-size: 14px; font-weight: 600">操作步骤</span>
        </n-divider>
        <n-form-item label="步骤列表">
          <div style="width: 100%">
            <Draggable
              v-model="editForm.steps"
              item-key="uid"
              handle=".step-drag-handle"
              animation="200"
            >
              <template #item="{ element: step, index: idx }">
                <div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px">
                  <span class="step-drag-handle" style="cursor: move" title="拖拽排序">
                    <n-icon size="16">
                      <DragOutlined />
                    </n-icon>
                  </span>
                  <n-input
                    v-model:value="step.action"
                    placeholder="操作描述"
                    :status="step.action && String(step.action).trim() ? undefined : 'error'"
                    style="width: 150px"
                  />
                  <n-select
                    v-model:value="step.keyword"
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
                    placeholder="请选择"
                    clearable
                    style="width: 130px"
                    @focus="loadElements"
                  />
                  <n-button size="small" type="error" ghost @click="removeStep(idx)">
                    删除
                  </n-button>
                </div>
              </template>
            </Draggable>
            <n-button size="small" dashed @click="addStep">+ 添加步骤</n-button>
          </div>
        </n-form-item>

        <n-space justify="end">
          <n-button @click="showEdit = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="saveEdit">保存</n-button>
        </n-space>
      </n-form>
    </n-modal>

    <!-- 测试步骤详情弹窗（只读，布局与编辑界面一致） -->
    <n-modal
      v-model:show="detailShow"
      preset="card"
      title="测试步骤详情"
      style="width: 820px"
      :bordered="false"
    >
      <n-form v-if="detailData" :label-width="90" label-placement="left" label-align="left">
        <n-form-item label="测试步骤名">
          <span>{{ detailData.name }}</span>
        </n-form-item>

        <!-- Allure 参数 -->
        <n-divider title-placement="center" style="margin: 8px 0">
          <span style="font-size: 14px; font-weight: 600">Allure 参数</span>
        </n-divider>
        <n-form-item label="feature">
          <span>{{ detailData.allure?.feature || '-' }}</span>
        </n-form-item>
        <n-form-item label="story">
          <span>{{ detailData.allure?.story || '-' }}</span>
        </n-form-item>
        <n-form-item label="title">
          <span>{{ detailData.allure?.title || '-' }}</span>
        </n-form-item>
        <n-form-item label="description">
          <span>{{ detailData.allure?.description || '-' }}</span>
        </n-form-item>

        <!-- 操作步骤列表（与编辑界面一致） -->
        <n-divider title-placement="center" style="margin: 8px 0">
          <span style="font-size: 14px; font-weight: 600">操作步骤</span>
        </n-divider>
        <n-form-item label="步骤列表">
          <div style="width: 100%">
            <div
              v-for="(s, idx) in detailData.step || []"
              :key="idx"
              style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px"
            >
              <n-input
                :value="s.action ?? ''"
                readonly
                placeholder="操作描述"
                style="width: 150px"
              />
              <n-input
                :value="keywordIdToName(s.keyword_id) ?? s.keyword_id ?? ''"
                readonly
                placeholder="关键字"
                style="width: 130px"
              />
              <n-tooltip v-if="elementIdToOption(s.element_id)" trigger="hover">
                <template #trigger>
                  <n-input
                    :value="elementIdToName(s.element_id) ?? ''"
                    readonly
                    placeholder="元素"
                    style="width: 130px"
                  />
                </template>
                定位方式: {{ elementIdToOption(s.element_id)?.by || '-' }}，定位值:
                {{ elementIdToOption(s.element_id)?.path || '-' }}
              </n-tooltip>
              <n-input
                v-else
                :value="String(s.element_id ?? '')"
                readonly
                placeholder="元素"
                style="width: 130px"
              />
            </div>
            <span v-if="!detailData.step || detailData.step.length === 0" style="color: #999"
              >-</span
            >
          </div>
        </n-form-item>
      </n-form>
      <div v-else style="display: flex; justify-content: center; padding: 24px 0">
        <n-spin />
      </div>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, onMounted, h } from 'vue';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './actionListColumns';
  import { useMessage, useDialog, NTooltip, NSelect } from 'naive-ui';
  import { DeleteOutlined, EditOutlined, EyeOutlined, DragOutlined } from '@vicons/antd';
  import Draggable from 'vuedraggable';
  import { http } from '@/utils/http/axios';
  import { ActionAPI, KeyWordAPI, ElementAPI } from '@/api/case_ui/http';
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const dialog = useDialog();
  const actionRef = ref();
  const actionAPI = new ActionAPI();
  const keywordAPI = new KeyWordAPI();
  const elementAPI = new ElementAPI();

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
      const project = list.find((item: any) => String(item.id) === String(projectId));
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

  // 新增测试步骤：打开空表单，保存时走 POST /api/case_ui/action/
  function addAction() {
    editingId.value = null;
    editForm.name = '';
    editForm.project_id = projectId;
    editForm.allure.id = null;
    editForm.allure.feature = '';
    editForm.allure.story = '';
    editForm.allure.title = '';
    editForm.allure.description = '';
    editForm.steps = [];
    showEdit.value = true;
  }

  // 详情：通过 GET /api/case_ui/action/{id}/ 获取完整数据并只读展示
  async function handleDetail(record) {
    detailShow.value = true;
    detailData.value = null;
    try {
      const res: any = await actionAPI.getDataByID(record.id);
      detailData.value = res ?? record;
    } catch (e: any) {
      console.error('获取详情失败，回退使用列表行数据:', e);
      detailData.value = record;
    }
  }

  // 编辑：通过 GET /api/case_ui/action/{id}/ 获取详情，再打开编辑弹窗
  async function handleEdit(record) {
    console.log(record);
    let target: any = record;
    try {
      const res: any = await actionAPI.getDataByID(record.id);
      target = res ?? record;
    } catch (e) {
      console.error('获取测试步骤详情失败，回退使用列表行数据:', e);
    }
    openEditDialog(target);
  }

  // 编辑弹窗状态
  const showEdit = ref(false);
  const saving = ref(false);
  const editingId = ref<number | null>(null);
  // 详情弹窗状态
  const detailShow = ref(false);
  const detailData = ref<any>(null);

  // step 操作下拉选项：从关键字管理接口拉取 keyword_name + description
  const actionOptions = ref<{ label: string; value: string; id: number; description?: string }[]>(
    []
  );

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

  const elementOptions = ref<{ label: string; value: number | null; by?: string; path?: string }[]>(
    [{ label: '请选择', value: null, by: '', path: '' }]
  );
  async function loadElements() {
    try {
      const res: any = await elementAPI.getElement({ project_id: projectId });
      // 兼容多种返回结构：{code,result:{...}} 包装 / DRF 裸分页 {count,results} / {list} / 数组
      let data: any = res;
      if (data && typeof data === 'object' && 'result' in data) {
        data = data.result;
      }
      const list = data?.list || data?.results || (Array.isArray(data) ? data : []);
      elementOptions.value = [
        { label: '请选择', value: null, by: '', path: '' },
        ...list.map((el: any) => ({
          label: el.name,
          value: el.id,
          by: el.by || '',
          path: el.path || '',
        })),
      ];
    } catch (e) {
      console.error('加载元素列表失败:', e);
      message.error('加载元素列表失败');
    }
  }

  // 元素下拉选项：悬停显示 定位方式 + 定位值
  function renderElementLabel(option: any) {
    // 占位项（请选择）不挂定位 tooltip
    if (option.value == null) return option.label;
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
  });

  // 步骤行稳定 uid（拖拽排序按 uid 绑定 key）
  let stepUidSeq = 0;
  function nextStepUid() {
    stepUidSeq += 1;
    return `s_${Date.now()}_${stepUidSeq}`;
  }

  function openEditDialog(record) {
    editingId.value = record.id ?? null;
    editForm.name = record.name ?? '';
    editForm.project_id = record.project_id ?? projectId;
    // 兜底：项目名还没加载到就拉一次
    if (!projectName.value) {
      loadProjectName();
    }
    // allure 四个字段（后端已聚合进 Action.allure）
    const al = record.allure || {};
    editForm.allure.id = al.id ?? null;
    editForm.allure.feature = al.feature ?? '';
    editForm.allure.story = al.story ?? '';
    editForm.allure.title = al.title ?? '';
    editForm.allure.description = al.description ?? '';
    // 深拷贝 step（后端已聚合进 Action.step），保留 id/keyword_id/element_id 等字段原样回传
    editForm.steps = Array.isArray(record.step)
      ? record.step.map((s: any) => {
          return {
            uid: nextStepUid(),
            id: s.id ?? null,
            // action：操作描述（如"输入用户名"），由用户填写，提交时原样回传
            action: s.action ?? '',
            // keyword：关键字下拉的选中值（关键字名），与 keyword_id 对应
            keyword: keywordIdToName(s.keyword_id),
            keyword_id: s.keyword_id ?? null,
            element_id: s.element_id ?? null,
            action_id: s.action_id ?? record.id ?? null,
          };
        })
      : [];
    showEdit.value = true;
  }

  function addStep() {
    editForm.steps.push({
      uid: nextStepUid(),
      id: null,
      action: '',
      keyword: null,
      keyword_id: null,
      element_id: null,
      action_id: editingId.value,
    });
  }

  // 选中关键字后联动：记录下拉值到 keyword，并设置 keyword_id
  function onStepActionChange(step: any, val: string) {
    step.keyword = val;
    const matched = actionOptions.value.find((o) => o.value === val);
    step.keyword_id = matched ? matched.id : null;
  }

  // keyword_id ↔ 关键字名互转（下拉 value 用名称，后端存 id）
  function keywordIdToName(id: any): string | null {
    const opt = actionOptions.value.find((o) => String(o.id) === String(id));
    return opt ? opt.label : null;
  }

  // element_id → 元素选项（name/by/path），供详情弹窗按 id 反查名称与定位信息
  function elementIdToOption(id: any) {
    if (id == null) return null;
    return (
      elementOptions.value.find((o) => o.value != null && String(o.value) === String(id)) || null
    );
  }
  function elementIdToName(id: any): string | null {
    const opt = elementIdToOption(id);
    return opt ? opt.label : null;
  }

  function removeStep(idx: number) {
    editForm.steps.splice(idx, 1);
  }

  // 保存：新增走 POST /api/case_ui/action/，编辑走 PUT /api/case_ui/action/{id}/（后端 ActionRequest = name/allure/step）
  async function saveEdit() {
    saving.value = true;
    try {
      // 步骤行的"操作（action）"为必填项，任一行留空不提交
      const emptyIdx = editForm.steps.findIndex(
        (step: any) => !step.action || !String(step.action).trim()
      );
      if (emptyIdx !== -1) {
        message.warning(`请填写第 ${emptyIdx + 1} 个步骤的操作`);
        return;
      }

      // 按当前数组位置组装 step 列表（顺序由拖拽后的数组位置体现，不传 sort；element_id 为空则不传）
      const steps = editForm.steps.map((step) => {
        const item: any = {
          action: String(step.action).trim(),
          keyword_id: step.keyword_id,
        };
        // element_id 可空：未选元素不传
        if (step.element_id != null) {
          item.element_id = step.element_id;
        }
        return item;
      });

      const payload: any = {
        name: editForm.name,
        project_id: editForm.project_id,
        allure: {
          feature: editForm.allure.feature,
          story: editForm.allure.story,
          title: editForm.allure.title,
          description: editForm.allure.description,
        },
        step: steps,
      };

      // 新增：POST /api/case_ui/action/；编辑：PUT /api/case_ui/action/{id}/
      if (editingId.value != null) {
        await actionAPI.updateDataByID(editingId.value, payload);
      } else {
        await actionAPI.createData(payload);
      }

      message.success('保存成功');
      showEdit.value = false;
      actionRef.value.reload();
    } catch (e: any) {
      console.error('保存失败:', e);
      // 拦截器已弹出后端错误信息，无响应体（如网络错误）时才补兜底提示，避免重复弹窗
      if (!e?.response?.data) {
        message.error('保存失败');
      }
    } finally {
      saving.value = false;
    }
  }

  // 删除：DELETE /api/case_ui/action/{id}/
  function handleDelete(record) {
    console.log(record);
    dialog.info({
      title: '提示',
      content: `确定删除测试步骤：${record.id} 吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await actionAPI.deleteDataByID(record.id);
          message.success('删除成功');
          actionRef.value.reload();
        } catch (e: any) {
          console.error('删除失败:', e);
          // 拦截器已弹出后端错误信息，无响应体时才补兜底提示，避免重复弹窗
          if (!e?.response?.data) {
            message.error('删除失败');
          }
        }
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
