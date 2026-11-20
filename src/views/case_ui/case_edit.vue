<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" :title="isEdit ? '修改用例' : '新增用例'" />
    </div>
    <n-card :bordered="false" class="mt-4 proCard" style="margin-top: -40px">
      <n-grid cols="1 s:1 m:3 l:3 xl:3 2xl:3" responsive="screen">
        <n-grid-item offset="0 s:0" span="1 m:2 l:2 xl:2 2xl:2">
          <n-form
            :label-width="100"
            :model="formValue"
            :rules="rules"
            label-placement="left"
            require-mark-placement="right-hanging"
            ref="formRef"
            class="py-8"
          >
            <n-grid :cols="2" :x-gap="16">
              <n-form-item-gi label="用例名称" path="name">
                <n-input
                  v-model:value="formValue.name"
                  maxlength="64"
                  show-count
                  placeholder="请输入用例名称（最长 64 字）"
                />
              </n-form-item-gi>
              <n-form-item-gi label="所属项目">
                <n-input :value="`${projectName}（ID：${projectId}）`" disabled />
              </n-form-item-gi>
            </n-grid>

            <n-divider title-placement="left">测试步骤（{{ steps.length }}）</n-divider>

            <!-- 添加步骤：从当前项目拥有的 action 中选一条加入本用例（占位，关联接口后续适配） -->
            <div class="add-step-bar">
              <n-select
                v-model:value="selectedActionId"
                :options="actionOptions"
                placeholder="选择要添加的测试步骤"
                filterable
                clearable
                style="width: 320px"
              />
              <n-button type="primary" :loading="adding" @click="addActionToCase">
                添加步骤
              </n-button>
            </div>

            <div v-if="steps.length === 0" class="empty-tip">暂无测试步骤</div>
            <Draggable
              v-if="steps.length"
              v-model="steps"
              item-key="uid"
              handle=".drag-handle"
              animation="200"
            >
              <template #item="{ element: action, index }">
                <div class="step-card">
                  <n-card size="small" :bordered="true">
                    <n-space vertical :size="8">
                      <n-space align="center" :size="8">
                        <span class="drag-handle" style="cursor: move" title="拖拽排序">
                          <n-icon size="16">
                            <DragOutlined />
                          </n-icon>
                        </span>
                        <span class="step-index">测试步骤 {{ index + 1 }}</span>
                        <span v-if="!isExpanded(action.uid)" class="step-title">
                          {{ action.title || '（未填写 title）' }}
                        </span>
                        <n-button size="small" @click="toggleExpand(action.uid)">
                          <template #icon>
                            <n-icon
                              :component="isExpanded(action.uid) ? UpOutlined : DownOutlined"
                            />
                          </template>
                        </n-button>
                        <n-button size="small" type="error" ghost @click="removeGroup(action.uid)">
                          删除整组
                        </n-button>
                      </n-space>

                      <div v-show="isExpanded(action.uid)">
                        <!-- Allure 参数 -->
                        <n-divider title-placement="center" style="margin: 8px 0">
                          <span style="font-size: 14px; font-weight: 600">Allure 参数</span>
                        </n-divider>
                        <n-grid :cols="2" :x-gap="16">
                          <n-form-item-gi label="feature">
                            <n-input v-model:value="action.feature" placeholder="feature" />
                          </n-form-item-gi>
                          <n-form-item-gi label="story">
                            <n-input v-model:value="action.story" placeholder="story" />
                          </n-form-item-gi>
                          <n-form-item-gi label="title">
                            <n-input v-model:value="action.title" placeholder="title" />
                          </n-form-item-gi>
                          <n-form-item-gi label="description">
                            <n-input
                              v-model:value="action.description"
                              type="textarea"
                              :autosize="{ minRows: 2, maxRows: 4 }"
                              placeholder="description"
                            />
                          </n-form-item-gi>
                        </n-grid>

                        <!-- 操作步骤 -->
                        <n-divider title-placement="center" style="margin: 8px 0">
                          <span style="font-size: 14px; font-weight: 600">操作步骤</span>
                        </n-divider>
                        <div style="width: 100%">
                          <div
                            style="
                              display: flex;
                              gap: 8px;
                              margin-bottom: 6px;
                              font-size: 13px;
                              color: #666;
                            "
                          >
                            <div style="width: 24px"></div>
                            <div style="width: 150px">操作描述</div>
                            <div style="width: 130px">操作</div>
                            <div style="width: 150px">定位方式</div>
                            <div style="flex: 1">定位值</div>
                            <div style="flex: 1">参数</div>
                            <div style="width: 60px">操作</div>
                          </div>
                          <Draggable
                            v-model="action.step"
                            item-key="uid"
                            handle=".step-row-handle"
                            animation="200"
                          >
                            <template #item="{ element: s, index: i }">
                              <div
                                style="
                                  display: flex;
                                  gap: 8px;
                                  align-items: flex-start;
                                  margin-bottom: 8px;
                                "
                              >
                                <span class="step-row-handle" style="cursor: move" title="拖拽排序">
                                  <n-icon size="16">
                                    <DragOutlined />
                                  </n-icon>
                                </span>
                                <n-input
                                  v-model:value="s.action"
                                  placeholder="操作描述"
                                  style="width: 150px"
                                />
                                <n-select
                                  v-model:value="s.keyword"
                                  :options="keywordOptions"
                                  filterable
                                  clearable
                                  placeholder="操作"
                                  style="width: 130px"
                                />
                                <n-select
                                  v-model:value="s.locatorBy"
                                  :options="byOptions"
                                  filterable
                                  clearable
                                  placeholder="定位方式"
                                  style="width: 150px"
                                />
                                <n-select
                                  v-if="!s.locatorBy && !s.locatorPath"
                                  :options="elementOptions"
                                  :render-label="renderElementLabel"
                                  filterable
                                  clearable
                                  placeholder="选择元素"
                                  style="flex: 1 1 0; min-width: 0"
                                  @update:value="(val: number) => onPickElement(s, val)"
                                />
                                <n-input
                                  v-else
                                  v-model:value="s.locatorPath"
                                  placeholder="定位值"
                                  style="flex: 1 1 0; min-width: 0"
                                />
                                <div class="step-args">
                                  <n-tag
                                    v-for="(p, ai) in s.argsList"
                                    :key="ai"
                                    size="small"
                                    closable
                                    class="arg-tag"
                                    title="点击修改"
                                    @click="startEditArg(s, ai)"
                                    @close="s.argsList.splice(ai, 1)"
                                  >
                                    {{ p }}
                                  </n-tag>
                                  <n-input
                                    v-if="s.showArgInput"
                                    v-model:value="s.newArg"
                                    style="width: 150px"
                                    placeholder="输入后回车"
                                    @keydown.enter="confirmArg(s)"
                                    @blur="confirmArg(s)"
                                    autofocus
                                  />
                                  <n-button v-else dashed @click="s.showArgInput = true">
                                    + 添加参数
                                  </n-button>
                                </div>
                                <n-button
                                  size="small"
                                  type="error"
                                  ghost
                                  @click="removeStep(action, i)"
                                >
                                  删除
                                </n-button>
                              </div>
                            </template>
                          </Draggable>
                          <n-button size="small" dashed @click="addStep(action)"
                            >+ 添加步骤</n-button
                          >
                        </div>

                        <!-- Parametrize 参数 -->
                        <n-divider title-placement="center" style="margin: 8px 0">
                          <span style="font-size: 14px; font-weight: 600">Parametrize 参数</span>
                        </n-divider>
                        <Draggable
                          v-model="action.paramRows"
                          item-key="uid"
                          handle=".param-row-handle"
                          animation="200"
                          class="param-row-list"
                        >
                          <template #item="{ element: row, index: pi }">
                            <div
                              class="param-row"
                              style="
                                display: flex;
                                gap: 12px;
                                margin-bottom: 12px;
                                align-items: flex-start;
                              "
                            >
                              <span
                                class="param-row-handle"
                                style="cursor: move; margin-top: 22px"
                                title="拖拽排序"
                              >
                                <n-icon size="16">
                                  <DragOutlined />
                                </n-icon>
                              </span>
                              <div style="flex: 1">
                                <div class="ro-col-title">param_key</div>
                                <n-input v-model:value="row.key" placeholder="参数名" />
                              </div>
                              <div style="flex: 2">
                                <div class="ro-col-title"
                                  >param_value（纯数字按数字类型，加引号按字符串）</div
                                >
                                <div class="param-value-list">
                                  <n-tag
                                    v-for="(v, vi) in row.valueList"
                                    :key="vi"
                                    size="small"
                                    closable
                                    @close="row.valueList.splice(vi, 1)"
                                  >
                                    {{ v }}
                                  </n-tag>
                                  <n-input
                                    v-if="row.showValueInput"
                                    v-model:value="row.newValue"
                                    style="width: 180px"
                                    placeholder="输入后回车"
                                    @keydown.enter="confirmParam(row)"
                                    @blur="confirmParam(row)"
                                    autofocus
                                  />
                                  <n-button v-else dashed @click="row.showValueInput = true">
                                    + 添加参数值
                                  </n-button>
                                </div>
                              </div>
                              <n-button
                                size="small"
                                type="error"
                                ghost
                                style="margin-top: 22px"
                                @click="removeParam(action, pi)"
                              >
                                删除
                              </n-button>
                            </div>
                          </template>
                        </Draggable>
                        <n-button size="small" dashed @click="addParam(action)"
                          >+ 添加参数</n-button
                        >

                        <!-- Validate 参数 -->
                        <n-divider title-placement="center" style="margin: 8px 0">
                          <span style="font-size: 14px; font-weight: 600">Validate 参数</span>
                        </n-divider>
                        <div
                          v-for="(grp, gi) in action.validateRows"
                          :key="gi"
                          style="margin-bottom: 12px"
                        >
                          <div
                            style="
                              display: flex;
                              gap: 12px;
                              align-items: flex-start;
                              margin-bottom: 8px;
                            "
                          >
                            <div style="flex: 1">
                              <div class="ro-col-title">validate_type</div>
                              <n-select
                                v-model:value="grp.type"
                                :options="validateTypeOptions"
                                placeholder="选择断言类型"
                              />
                            </div>
                            <n-button
                              size="small"
                              type="error"
                              ghost
                              style="margin-top: 22px"
                              @click="removeValidateGroup(action, gi)"
                            >
                              删除分组
                            </n-button>
                          </div>
                          <div
                            v-for="(vp, vi) in grp.items"
                            :key="vi"
                            style="
                              border: 1px solid #e0e0e0;
                              border-radius: 4px;
                              padding: 8px;
                              margin-bottom: 8px;
                            "
                          >
                            <div style="display: flex; gap: 12px; align-items: flex-start">
                              <div style="flex: 1">
                                <div class="ro-col-title">expect_result</div>
                                <n-input v-model:value="vp.expect_result" placeholder="期望结果" />
                              </div>
                              <div style="flex: 1">
                                <div class="ro-col-title">keyword</div>
                                <n-select
                                  v-model:value="vp.keyword"
                                  :options="keywordOptions"
                                  filterable
                                  clearable
                                  placeholder="操作"
                                />
                              </div>
                            </div>
                            <div
                              style="
                                display: flex;
                                gap: 12px;
                                align-items: flex-start;
                                margin-top: 8px;
                              "
                            >
                              <div style="flex: 1">
                                <div class="ro-col-title">定位方式</div>
                                <n-select
                                  v-model:value="vp.locatorBy"
                                  :options="byOptions"
                                  filterable
                                  clearable
                                  placeholder="定位方式"
                                />
                              </div>
                              <div style="flex: 1">
                                <div class="ro-col-title">定位值</div>
                                <n-select
                                  v-if="!vp.locatorBy && !vp.locatorPath"
                                  :options="elementOptions"
                                  :render-label="renderElementLabel"
                                  filterable
                                  clearable
                                  placeholder="选择元素"
                                  @update:value="(val: number) => onPickElement(vp, val)"
                                />
                                <n-input
                                  v-else
                                  v-model:value="vp.locatorPath"
                                  placeholder="定位值"
                                />
                              </div>
                            </div>
                            <div style="margin-top: 8px">
                              <div class="ro-col-title"
                                >args（纯数字按数字类型，加引号按字符串）</div
                              >
                              <div class="step-args">
                                <n-tag
                                  v-for="(p, ai) in vp.argsList"
                                  :key="ai"
                                  size="small"
                                  closable
                                  class="arg-tag"
                                  title="点击修改"
                                  @click="startEditArg(vp, ai)"
                                  @close="vp.argsList.splice(ai, 1)"
                                >
                                  {{ p }}
                                </n-tag>
                                <n-input
                                  v-if="vp.showArgInput"
                                  v-model:value="vp.newArg"
                                  style="width: 150px"
                                  placeholder="输入后回车"
                                  @keydown.enter="confirmArg(vp)"
                                  @blur="confirmArg(vp)"
                                  autofocus
                                />
                                <n-button v-else dashed @click="vp.showArgInput = true">
                                  + 添加参数
                                </n-button>
                              </div>
                            </div>
                            <n-button
                              size="small"
                              type="error"
                              ghost
                              style="margin-top: 8px"
                              @click="removeValidateItem(action, gi, vi)"
                            >
                              删除断言
                            </n-button>
                          </div>
                          <n-button size="small" dashed @click="addValidateItem(action, gi)">
                            + 添加断言
                          </n-button>
                        </div>
                        <n-button size="small" dashed @click="addValidateGroup(action)">
                          + 添加断言分组
                        </n-button>
                      </div>
                    </n-space>
                  </n-card>
                </div>
              </template>
            </Draggable>

            <div style="margin-left: 100px; margin-top: 16px">
              <n-space>
                <n-button type="primary" :loading="saving" @click="formSubmit">{{
                  isEdit ? '提交' : '新增'
                }}</n-button>
                <n-button @click="resetForm">重置</n-button>
                <n-button @click="goBack">返回</n-button>
              </n-space>
            </div>
          </n-form>
        </n-grid-item>
      </n-grid>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted, h } from 'vue';
  import { useMessage, useDialog, NTooltip } from 'naive-ui';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormRules } from 'naive-ui';
  import { DownOutlined, UpOutlined, DragOutlined } from '@vicons/antd';
  import Draggable from 'vuedraggable';
  import { http } from '@/utils/http/axios';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const dialog = useDialog();
  const formRef: any = ref(null);

  // 用例 id（编辑模式必须传入）
  const caseId = Number(route.params.id);
  // 所属项目 id（由列表页通过 query 传入）
  const projectId = Number(route.query.project_id);
  const projectName = ref('');
  // 有 id 为编辑模式，无 id 为新增模式
  const isEdit = computed(() => !!caseId);

  const formValue = reactive({
    name: '',
  });

  // 定位方式枚举（与后端 Element.ByValue 保持一致）
  const byOptions = [
    { label: 'id', value: 'id' },
    { label: 'xpath', value: 'xpath' },
    { label: 'link text', value: 'link text' },
    { label: 'partial link text', value: 'partial link text' },
    { label: 'name', value: 'name' },
    { label: 'tag name', value: 'tag name' },
    { label: 'class name', value: 'class name' },
    { label: 'css selector', value: 'css selector' },
  ];

  // 断言类型（与后端 assert_util 支持的四种一致）
  const validateTypeOptions = [
    { label: 'equals（等于）', value: 'equals' },
    { label: 'contains（包含）', value: 'contains' },
    { label: 'db_equals（数据库等于）', value: 'db_equals' },
    { label: 'db_contains（数据库包含）', value: 'db_contains' },
  ];

  // 测试步骤列表（action_list 内联步骤对象，前端编辑态已把 locator 拆成 by/path、parametrize/validate 拆成行）
  const steps = ref<any[]>([]);
  const saving = ref(false);

  // 每组稳定 uid：拖拽/排序/展开状态都按 uid 绑定，不随数组位置变化
  let uidSeq = 0;
  function nextUid() {
    uidSeq += 1;
    return `g_${Date.now()}_${uidSeq}`;
  }

  // 步骤卡片详情展开状态（默认收起），key 为 uid
  const expanded = ref<Record<string, boolean>>({});
  function isExpanded(uid: string) {
    return !!expanded.value[uid];
  }
  function toggleExpand(uid: string) {
    expanded.value[uid] = !expanded.value[uid];
  }

  // 关键字下拉选项（存关键字名称，与 action_list.step.keyword 一致）；keywordMap 用于 id → 名称反查
  const keywordOptions = ref<{ label: string; value: string }[]>([]);
  const keywordMap = ref<Record<number, string>>({});
  async function loadKeywords() {
    try {
      const res: any = await http.request({ url: '/case_ui/keyword/', method: 'get' });
      const list = res?.list || res?.results || (Array.isArray(res) ? res : []);
      keywordOptions.value = list.map((k: any) => ({
        label: k.keyword_name,
        value: k.keyword_name,
      }));
      const map: Record<number, string> = {};
      for (const k of list) map[k.id] = k.keyword_name;
      keywordMap.value = map;
    } catch (e) {
      console.error('加载关键字列表失败:', e);
    }
  }

  // 元素 id → {name, by, path} 反查表（Action.step.element_id 解析定位方式/定位值用）
  const elementMap = ref<Record<number, { name: string; by: string; path: string }>>({});
  async function loadElements() {
    try {
      const res: any = await http.request({
        url: '/case_ui/element/get_element/',
        method: 'get',
        params: { project_id: projectId },
      });
      let data: any = res;
      if (data && typeof data === 'object' && 'result' in data) data = data.result;
      const list = data?.list || data?.results || (Array.isArray(data) ? data : []);
      const map: Record<number, { name: string; by: string; path: string }> = {};
      for (const el of list) map[el.id] = { name: el.name, by: el.by || '', path: el.path || '' };
      elementMap.value = map;
    } catch (e) {
      console.error('加载元素列表失败:', e);
    }
  }

  // 项目元素下拉选项（定位方式/定位值均为空时，在定位值处选择元素后自动补全 by/path）
  const elementOptions = computed(() =>
    Object.entries(elementMap.value).map(([id, el]) => ({
      label: el.name,
      value: Number(id),
      by: el.by,
      path: el.path,
    }))
  );

  // 元素选项悬停时展示定位方式、定位值详细信息
  function renderElementLabel(option: any) {
    const by = option.by || '-';
    const path = option.path || '-';
    return h(
      NTooltip,
      { trigger: 'hover', width: 320 },
      {
        trigger: () =>
          h(
            'span',
            {
              style:
                'display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom',
            },
            option.label
          ),
        default: () =>
          h('div', { style: 'line-height:1.7;word-break:break-all' }, [
            h('div', null, [h('span', { style: 'color:#888' }, '定位方式：'), by]),
            h('div', null, [h('span', { style: 'color:#888' }, '定位值：'), path]),
          ]),
      }
    );
  }

  // 选中元素后自动回填定位方式与定位值
  function onPickElement(step: any, val: number) {
    const opt = elementOptions.value.find((o) => o.value === val);
    if (opt) {
      step.locatorBy = opt.by;
      step.locatorPath = opt.path;
    }
  }

  // ---------- 编辑态 <-> action_list 原始结构 互转 ----------

  // 把后端 action_list 元素规范化为前端编辑态
  function normalizeGroup(g: any) {
    const locator = (loc: any) => ({
      locatorBy: Array.isArray(loc) && loc.length > 0 ? loc[0] ?? '' : '',
      locatorPath: Array.isArray(loc) && loc.length > 1 ? loc[1] ?? '' : '',
    });
    return {
      uid: nextUid(),
      feature: g.feature ?? '',
      story: g.story ?? '',
      title: g.title ?? '',
      description: g.description ?? '',
      step: (Array.isArray(g.step) ? g.step : []).map((s: any) => ({
        uid: nextUid(),
        action: s.action ?? '',
        keyword: s.keyword ?? '',
        ...locator(s.locator),
        argsList: (s.args ?? []).map((x: any) => String(x)),
        showArgInput: false,
        newArg: '',
        editArgIndex: null,
      })),
      paramRows: Object.entries(g.parametrize || {}).map(([key, values]) => ({
        uid: nextUid(),
        key,
        valueList: (Array.isArray(values) ? values : []).map((x: any) => String(x)),
        showValueInput: false,
        newValue: '',
      })),
      validateRows: Object.entries(g.validate || {}).map(([type, items]) => ({
        type,
        items: (Array.isArray(items) ? items : []).map((vp: any) => ({
          expect_result: vp.expect_result ?? '',
          keyword: vp.actual_result?.keyword ?? '',
          ...locator(vp.actual_result?.locator),
          argsList: (vp.actual_result?.args ?? []).map((x: any) => String(x)),
          showArgInput: false,
          newArg: '',
          editArgIndex: null,
        })),
      })),
    };
  }

  // 把前端编辑态还原为 action_list 元素原始结构
  function denormalizeGroup(g: any) {
    const out: any = {
      feature: g.feature,
      story: g.story,
      title: g.title,
      description: g.description,
      step: g.step.map((s: any) => {
        const item: any = {
          action: s.action ?? '',
          keyword: s.keyword ? String(s.keyword) : '',
        };
        if (s.locatorPath) {
          item.locator = [s.locatorBy ?? '', s.locatorPath];
        }
        const args = (s.argsList || [])
          .map((v: string) => v.trim())
          .filter((v: string) => v !== '')
          .map(toTypedValue);
        if (args.length) item.args = args;
        return item;
      }),
    };

    const parametrize: Record<string, any[]> = {};
    for (const row of g.paramRows) {
      const key = (row.key ?? '').trim();
      if (!key) continue;
      const values = (row.valueList || [])
        .map((v: string) => v.trim())
        .filter((v: string) => v !== '')
        .map(toTypedValue);
      if (values.length) parametrize[key] = values;
    }
    if (Object.keys(parametrize).length) out.parametrize = parametrize;

    const validate: Record<string, any[]> = {};
    for (const grp of g.validateRows) {
      const type = (grp.type ?? '').trim();
      if (!type) continue;
      const items = grp.items.map((vp: any) => {
        const actual: any = { keyword: vp.keyword ? String(vp.keyword) : '' };
        if (vp.locatorPath) {
          actual.locator = [vp.locatorBy ?? '', vp.locatorPath];
        }
        const args = (vp.argsList || []).map(toTypedValue);
        if (args.length) actual.args = args;
        return {
          expect_result: toTypedValue(vp.expect_result),
          actual_result: actual,
        };
      });
      if (items.length) validate[type] = items;
    }
    if (Object.keys(validate).length) out.validate = validate;

    return out;
  }

  // ---------- 行内增删 ----------

  function addStep(group: any) {
    group.step.push({
      uid: nextUid(),
      action: '',
      keyword: null,
      locatorBy: null,
      locatorPath: '',
      argsList: [],
      showArgInput: false,
      newArg: '',
      editArgIndex: null,
    });
  }
  function removeStep(group: any, i: number) {
    group.step.splice(i, 1);
  }

  // 删除整张步骤卡片（整组 action_list 元素），确认后从前端列表移除，保存时随整体覆盖提交
  function removeGroup(uid: string) {
    const index = steps.value.findIndex((g) => g.uid === uid);
    if (index < 0) return;
    dialog.info({
      title: '提示',
      content: `确定删除测试步骤 ${index + 1} 吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        steps.value.splice(index, 1);
        expanded.value = {};
        message.success('已删除步骤组，保存后生效');
      },
    });
  }

  function addParam(group: any) {
    group.paramRows.push({
      uid: nextUid(),
      key: '',
      valueList: [],
      showValueInput: false,
      newValue: '',
    });
  }

  // 回车/失焦确认添加一个参数值
  function confirmParam(row: any) {
    const val = (row.newValue || '').trim();
    if (val) row.valueList.push(val);
    row.newValue = '';
    row.showValueInput = false;
  }
  function removeParam(group: any, i: number) {
    group.paramRows.splice(i, 1);
  }

  function addValidateGroup(group: any) {
    group.validateRows.push({ type: '', items: [emptyValidateItem()] });
  }
  function removeValidateGroup(group: any, i: number) {
    group.validateRows.splice(i, 1);
  }
  function addValidateItem(group: any, gi: number) {
    group.validateRows[gi].items.push(emptyValidateItem());
  }
  function removeValidateItem(group: any, gi: number, vi: number) {
    group.validateRows[gi].items.splice(vi, 1);
  }
  function emptyValidateItem() {
    return {
      expect_result: '',
      keyword: null,
      locatorBy: null,
      locatorPath: '',
      argsList: [],
      showArgInput: false,
      newArg: '',
      editArgIndex: null,
    };
  }

  // 参数值类型解析：单/双引号包裹 → 字符串（去引号）；纯整数/浮点 → 数字；其余 → 字符串
  function toTypedValue(v: any): string | number {
    const s = String(v ?? '').trim();
    if (/^'.*'$/.test(s) || /^".*"$/.test(s)) return s.slice(1, -1);
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
    return s;
  }

  // 回车/失焦确认添加或修改一条 args
  function confirmArg(vp: any) {
    const val = (vp.newArg || '').trim();
    if (val) {
      if (vp.editArgIndex != null) {
        vp.argsList[vp.editArgIndex] = val;
      } else if (!vp.argsList.includes(val)) {
        vp.argsList.push(val);
      }
    }
    vp.newArg = '';
    vp.showArgInput = false;
    vp.editArgIndex = null;
  }

  // 点击已有参数标签：进入编辑态并回显原值
  function startEditArg(vp: any, index: number) {
    vp.editArgIndex = index;
    vp.newArg = vp.argsList[index] ?? '';
    vp.showArgInput = true;
  }

  // 可添加的 action 列表（整组从已有 Action 追加；actionsCache 缓存完整 Action 数据供本地展开）
  const actionOptions = ref<{ label: string; value: number }[]>([]);
  const actionsCache = ref<any[]>([]);
  const selectedActionId = ref<number | null>(null);
  const adding = ref(false);

  async function loadActionOptions() {
    try {
      const res: any = await http.request({
        url: '/case_ui/action/get_single_action/',
        method: 'get',
        params: { project_id: projectId, page: 1, page_size: 100 },
      });
      const list = res?.list || res?.results || (Array.isArray(res) ? res : []);
      actionsCache.value = list;
      actionOptions.value = list.map((a: any) => ({
        label: a.name || `测试步骤 ${a.id}`,
        value: Number(a.id),
      }));
    } catch (e) {
      console.error('加载项目测试步骤失败:', e);
    }
  }

  // 添加步骤：把选中的 Action 展开成一个 action_list 步骤组放入当前编辑列表
  // Action 只有 name/allure/step：allure 与 step 解析后带入；parametrize/validate Action 没有，留空由界面手工添加
  async function addActionToCase() {
    if (selectedActionId.value == null) {
      message.warning('请先选择要添加的测试步骤');
      return;
    }
    adding.value = true;
    try {
      let action = actionsCache.value.find((a) => Number(a.id) === Number(selectedActionId.value));
      if (!action) {
        const res: any = await http.request({
          url: `/case_ui/action/${selectedActionId.value}/`,
          method: 'get',
        });
        action = res;
      }
      const allure = action?.allure || {};
      const group: any = {
        uid: nextUid(),
        feature: allure.feature ?? '',
        story: allure.story ?? '',
        title: allure.title ?? '',
        description: allure.description ?? '',
        step: (Array.isArray(action?.step) ? action.step : []).map((s: any) => ({
          uid: nextUid(),
          action: s.action ?? '',
          // keyword_id → 关键字名；element_id → 定位方式/定位值
          keyword:
            s.keyword_id != null ? keywordMap.value[s.keyword_id] ?? String(s.keyword_id) : '',
          locatorBy: s.element_id != null ? elementMap.value[s.element_id]?.by ?? '' : '',
          locatorPath: s.element_id != null ? elementMap.value[s.element_id]?.path ?? '' : '',
          argsList: [],
          showArgInput: false,
          newArg: '',
          editArgIndex: null,
        })),
        paramRows: [],
        validateRows: [],
      };
      steps.value.push(group);
      selectedActionId.value = null;
      message.success('已添加步骤组，保存后随用例一起提交');
    } catch (e: any) {
      console.error('添加步骤失败:', e);
      if (!e?.response?.data) message.error('添加步骤失败');
    } finally {
      adding.value = false;
    }
  }

  const rules: FormRules = {
    name: [{ required: true, message: '请输入用例名称', trigger: 'blur' }],
  };

  // 加载项目名称（仅用于展示所属项目）
  async function loadProjectName() {
    try {
      const res: any = await http.request({
        url: '/project/project/get_single_user_project/',
        method: 'get',
      });
      const list = res?.list || [];
      const project = list.find((item: any) => item.id === projectId);
      if (project) projectName.value = project.name;
    } catch (e) {
      console.error('加载项目名称失败:', e);
    }
  }

  // 加载用例详情：GET /case_ui/case/{id}/，步骤取内联 action_list 并规范化为编辑态
  async function loadCaseDetail() {
    // 新增模式：没有用例 id，跳过详情加载，仅拉取可选测试步骤
    if (!caseId) {
      await loadActionOptions();
      return;
    }
    try {
      const res: any = await http.request({
        url: `/case_ui/case/${caseId}/`,
        method: 'get',
      });
      formValue.name = res.name ?? '';
      const list = Array.isArray(res.action_list) ? res.action_list : [];
      steps.value = list.map(normalizeGroup);
      await loadActionOptions();
    } catch (e: any) {
      console.error('加载用例详情失败:', e);
      if (!e?.response?.data) message.error('加载用例详情失败');
    }
  }

  // 提交：编辑走 PATCH /case_ui/case/{id}/；新增走 POST /case_ui/case/
  async function formSubmit() {
    try {
      await formRef.value.validate();
      saving.value = true;
      const action_list = steps.value.map(denormalizeGroup);
      if (isEdit.value) {
        await http.request({
          url: `/case_ui/case/${caseId}/`,
          method: 'patch',
          data: { name: formValue.name, action_list },
        });
        message.success('修改成功');
      } else {
        await http.request({
          url: '/case_ui/case/',
          method: 'post',
          data: { name: formValue.name, project_id: projectId, action_list },
        });
        message.success('新增成功');
      }
      goBack();
    } catch (errors: any) {
      console.error('提交失败:', errors);
      if (!errors?.response?.data) message.error('提交失败');
    } finally {
      saving.value = false;
    }
  }

  // 重置表单
  function resetForm() {
    if (!isEdit.value) {
      formValue.name = '';
      steps.value = [];
      selectedActionId.value = null;
      message.success('已重置');
      return;
    }
    loadCaseDetail();
    message.success('已重置');
  }

  // 返回用例列表页
  function goBack() {
    router.push({ name: 'case_ui-case_list', params: { id: projectId } });
  }

  onMounted(() => {
    loadProjectName();
    loadKeywords();
    loadElements();
    loadCaseDetail();
  });
</script>

<style lang="less" scoped>
  .add-step-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .step-card {
    margin-bottom: 12px;
  }
  .step-index {
    font-weight: 500;
    color: #18a058;
  }
  .step-title {
    max-width: 360px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #333;
  }
  .ro-col-title {
    margin-bottom: 6px;
    font-size: 13px;
    color: #666;
  }
  .empty-tip {
    color: #999;
    padding: 12px 0;
  }
  .step-args {
    flex: 1 1 0;
    min-width: 150px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    :deep(.n-tag) {
      height: 34px;
      padding: 0 8px;
      display: inline-flex;
      align-items: center;
    }
    :deep(.arg-tag) {
      cursor: pointer;
    }
  }
  .param-value-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    :deep(.n-tag) {
      height: 34px;
      padding: 0 8px;
      display: inline-flex;
      align-items: center;
    }
  }
</style>
