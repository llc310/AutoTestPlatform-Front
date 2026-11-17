<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="修改用例" />
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

            <!-- 添加步骤：从当前项目拥有的 action 中选一条加入本用例 -->
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
            <div
              v-for="(action, index) in steps"
              :key="action._linkId ?? action.id"
              class="step-card"
            >
              <n-card size="small" :bordered="true">
                <n-space vertical :size="8">
                  <n-space align="center" :size="8">
                    <span class="step-index">测试步骤 {{ index + 1 }}</span>
                    <span>执行顺序：</span>
                    <n-input-number
                      v-model:value="orderValue[String(action._linkId ?? action.id)]"
                      :min="1"
                      :max="steps.length"
                      size="small"
                      style="width: 90px"
                      @update:value="onOrderChange"
                    />
                    <n-button size="small" @click="toggleExpand(action)">
                      <template #icon>
                        <n-icon :component="isExpanded(action) ? UpOutlined : DownOutlined" />
                      </template>
                    </n-button>
                  </n-space>

                  <!-- 测试步骤名 -->
                  <div class="ro-row">
                    <div class="ro-label">测试步骤名</div>
                    <div class="ro-value">{{ action.name || '-' }}</div>
                  </div>

                  <!-- Allure 参数 -->
                  <div v-show="isExpanded(action)">
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
                    <div class="ro-row" style="align-items: flex-start">
                      <div class="ro-label">步骤列表</div>
                      <div class="ro-value" style="width: 100%">
                        <div
                          style="
                            display: flex;
                            gap: 8px;
                            margin-bottom: 6px;
                            font-size: 13px;
                            color: #666;
                          "
                        >
                          <div style="width: 70px">序号</div>
                          <div style="width: 150px">操作描述</div>
                          <div style="width: 130px">操作</div>
                          <div style="width: 130px">元素</div>
                          <div style="flex: 1">参数</div>
                        </div>
                        <div
                          v-for="(s, i) in action.step || []"
                          :key="i"
                          style="
                            display: flex;
                            gap: 8px;
                            align-items: flex-start;
                            margin-bottom: 8px;
                          "
                        >
                          <div class="ro-cell" style="width: 70px">{{ s.sort ?? i + 1 }}</div>
                          <div class="ro-cell" style="width: 150px">{{ s.action || '-' }}</div>
                          <div class="ro-cell" style="width: 130px">
                            {{ s.keyword_id == null ? '-' : keywordName(s.keyword_id) }}
                          </div>
                          <div class="ro-cell" style="width: 130px">{{ s.element_id ?? '-' }}</div>
                          <div style="flex: 1; display: flex; flex-direction: column; gap: 4px">
                            <n-tag
                              v-for="(p, pi) in s.args || []"
                              :key="pi"
                              size="large"
                              style="align-self: flex-start"
                            >
                              {{ p }}
                            </n-tag>
                            <span v-if="!s.args || s.args.length === 0" style="color: #999"
                              >无参数</span
                            >
                          </div>
                        </div>
                        <span v-if="!action.step || action.step.length === 0" style="color: #999"
                          >-</span
                        >
                      </div>
                    </div>

                    <!-- Parametrize 参数 -->
                    <n-divider title-placement="center" style="margin: 8px 0">
                      <span style="font-size: 14px; font-weight: 600">Parametrize 参数</span>
                    </n-divider>
                    <div
                      v-for="(values, key) in action.parametrize || {}"
                      :key="key"
                      style="display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start"
                    >
                      <div style="flex: 1">
                        <div class="ro-col-title">param_key</div>
                        <div class="ro-cell">{{ key }}</div>
                      </div>
                      <div style="flex: 1">
                        <div class="ro-col-title">param_value</div>
                        <div style="display: flex; flex-direction: column; gap: 4px">
                          <n-tag
                            v-for="(v, vi) in values || []"
                            :key="vi"
                            size="large"
                            style="align-self: flex-start"
                          >
                            {{ v }}
                          </n-tag>
                          <span v-if="!values || values.length === 0" style="color: #999">-</span>
                        </div>
                      </div>
                    </div>
                    <span
                      v-if="!action.parametrize || Object.keys(action.parametrize).length === 0"
                      style="color: #999"
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
                      style="display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start"
                    >
                      <div style="flex: 1">
                        <div class="ro-col-title">validate_type</div>
                        <div class="ro-cell">{{ vtype }}</div>
                      </div>
                      <div style="flex: 1">
                        <div class="ro-col-title">validate_params</div>
                        <div
                          v-for="(vp, vpi) in vps || []"
                          :key="vpi"
                          style="
                            border: 1px solid #e0e0e0;
                            border-radius: 4px;
                            padding: 8px;
                            margin-bottom: 8px;
                          "
                        >
                          <div style="font-size: 12px; color: #666; margin-bottom: 4px"
                            >expect_result</div
                          >
                          <div class="ro-cell" style="margin-bottom: 8px">{{
                            vp.expect_result ?? '-'
                          }}</div>
                          <div style="font-size: 12px; color: #666; margin-bottom: 4px"
                            >actual_result</div
                          >
                          <div style="display: flex; gap: 16px; margin-bottom: 6px">
                            <div class="ro-cell">
                              keyword：{{
                                vp.actual_result?.keyword_id == null
                                  ? '-'
                                  : keywordName(vp.actual_result.keyword_id)
                              }}
                            </div>
                            <div class="ro-cell"
                              >element：{{ vp.actual_result?.element_id ?? '-' }}</div
                            >
                          </div>
                          <div style="display: flex; flex-direction: column; gap: 4px">
                            <n-tag
                              v-for="(p, pi) in vp.actual_result?.args || []"
                              :key="pi"
                              size="small"
                              style="align-self: flex-start"
                            >
                              {{ p }}
                            </n-tag>
                            <span
                              v-if="!vp.actual_result?.args || vp.actual_result.args.length === 0"
                              style="color: #999"
                            >
                              无参数
                            </span>
                          </div>
                        </div>
                        <span v-if="!vps || vps.length === 0" style="color: #999">-</span>
                      </div>
                    </div>
                    <span
                      v-if="!action.validate || Object.keys(action.validate).length === 0"
                      style="color: #999"
                    >
                      -
                    </span>
                  </div>
                </n-space>
              </n-card>
            </div>

            <div style="margin-left: 100px; margin-top: 16px">
              <n-space>
                <n-button type="primary" @click="formSubmit">提交</n-button>
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
  import { ref, reactive, onMounted, nextTick } from 'vue';
  import { useMessage } from 'naive-ui';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormRules } from 'naive-ui';
  import { DownOutlined, UpOutlined } from '@vicons/antd';
  import { http } from '@/utils/http/axios';
  import { KeyWordAPI } from '@/api/case_ui/http';
  import type { ActionSchema } from '@/api/case_ui/models';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const formRef: any = ref(null);

  // 用例 id（编辑模式必须传入）
  const caseId = Number(route.params.id);
  // 所属项目 id（由列表页通过 query 传入）
  const projectId = Number(route.query.project_id);
  const projectName = ref('');

  const formValue = reactive({
    name: '',
  });

  // 测试步骤列表（action 实例，只读展示）
  const steps = ref<ActionSchema[]>([]);
  // 用例与步骤的关联（caseaction）：执行顺序按 link_id 索引
  const orderValue = ref<Record<string, number>>({});
  const originalOrder = ref<Record<string, number>>({});

  // 步骤卡片详情展开状态（默认收起），key 为 _linkId（回退 id）
  const expanded = ref<Record<string, boolean>>({});
  function rowKey(row: any) {
    return String(row._linkId ?? row.id);
  }
  function isExpanded(row: any) {
    return !!expanded.value[rowKey(row)];
  }
  function toggleExpand(row: any) {
    const key = rowKey(row);
    expanded.value[key] = !expanded.value[key];
  }

  // 修改执行顺序后，卡片按 sort 自动重排位置
  function onOrderChange() {
    nextTick(() => {
      const sortOf = (row: any) => Number(orderValue.value[rowKey(row)] ?? 0);
      steps.value = steps.value.slice().sort((a, b) => sortOf(a) - sortOf(b));
    });
  }

  // 关键字 id → 关键字名 映射（步骤展示用）
  const keywordMap = ref<Record<number, string>>({});

  // 可添加的 action 列表（当前项目拥有的测试步骤）及选中项
  const actionOptions = ref<{ label: string; value: number }[]>([]);
  // 项目 action 完整数据缓存（后端 CaseUI 已不再返回 action_id，需自行按 id 映射）
  const actionsCache = ref<any[]>([]);
  const selectedActionId = ref<number | null>(null);
  const adding = ref(false);

  // 加载当前项目拥有的 action（GET /case_ui/action/get_single_action/?project_id=，分页拉全）
  async function loadActionOptions() {
    try {
      const list: any[] = [];
      let page = 1;
      let hasNext = true;
      while (hasNext) {
        const res: any = await http.request({
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
      actionsCache.value = list;
      actionOptions.value = list.map((a: any) => ({
        label: a.name || `测试步骤 ${a.id}`,
        value: Number(a.id),
      }));
    } catch (e) {
      console.error('加载项目测试步骤失败:', e);
    }
  }

  // 添加步骤：POST /case_ui/caseaction/ { caseui_id, action_id, sort }
  async function addActionToCase() {
    if (selectedActionId.value == null) {
      message.warning('请先选择要添加的测试步骤');
      return;
    }
    adding.value = true;
    try {
      // 同一 action 允许重复添加，只需保证同一用例内 sort 不重复
      const maxSort = steps.value.reduce(
        (max, row) =>
          Math.max(max, Number(row._sort ?? orderValue.value[String(row._linkId ?? row.id)] ?? 0)),
        0
      );
      await http.request({
        url: '/case_ui/caseaction/',
        method: 'post',
        data: {
          caseui_id: caseId,
          action_id: selectedActionId.value,
          sort: maxSort + 1,
        },
      });
      message.success('添加成功');
      selectedActionId.value = null;
      // 重新加载用例详情（其内部会同时刷新步骤列表与执行顺序）
      await loadCaseDetail();
    } catch (e: any) {
      console.error('添加步骤失败:', e);
      if (!e?.response?.data) {
        message.error('添加步骤失败');
      }
    } finally {
      adding.value = false;
    }
  }

  // 由关键字 id 反查关键字名，查不到时回退显示 id
  function keywordName(id: number | null | undefined): string {
    if (id == null) return '-';
    return keywordMap.value[id] ?? String(id);
  }

  // 加载关键字列表，用于步骤的关键字名展示
  async function loadKeywords() {
    try {
      const res: any = await new KeyWordAPI().getDataList();
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
      if (project) {
        projectName.value = project.name;
      }
    } catch (e) {
      console.error('加载项目名称失败:', e);
    }
  }

  // 加载用例详情：GET /case_ui/case/{id}/
  async function loadCaseDetail() {
    if (!caseId) {
      message.error('缺少用例 id');
      return;
    }
    try {
      const res: any = await http.request({
        url: `/case_ui/case/${caseId}/`,
        method: 'get',
      });
      formValue.name = res.name ?? '';
      // 后端 CaseUI 已删除 action_id 字段，测试步骤数据改从项目 action 列表取
      await loadActionOptions();
      await loadSteps(actionsCache.value);
    } catch (e: any) {
      console.error('加载用例详情失败:', e);
      if (!e?.response?.data) {
        message.error('加载用例详情失败');
      }
    }
  }

  // 构建步骤列表：以 caseaction 关联记录为主（同一条 action 可重复出现，每行有独立 link_id 与 sort）
  async function loadSteps(actions: any[]) {
    try {
      const links: any[] = [];
      let page = 1;
      let pageCount = 1;
      do {
        const res: any = await http.request({
          url: '/case_ui/caseaction/',
          method: 'get',
          params: { caseui_id: caseId, page },
        });
        const list = res?.list || res?.results || (Array.isArray(res) ? res : []);
        links.push(...list);
        pageCount = res?.pageCount ?? 1;
        if (!list.length) break;
        page += 1;
      } while (page <= pageCount);

      const actionMap: Record<string, any> = {};
      for (const a of actions) {
        actionMap[String(a.id)] = a;
      }

      let rows: any[];
      if (links.length > 0) {
        rows = links
          .slice()
          .sort((a, b) => Number(a.sort) - Number(b.sort))
          .map((link) => ({
            ...(actionMap[String(link.action_id)] || { id: link.action_id }),
            _linkId: link.id,
            _sort: link.sort,
          }));
      } else {
        // 没有 caseaction 关联记录时，该用例暂无步骤
        rows = [];
      }

      steps.value = rows;
      const orders: Record<string, number> = {};
      for (const row of rows) {
        orders[String(row._linkId ?? row.id)] = Number(row._sort) ?? 0;
      }
      orderValue.value = orders;
      originalOrder.value = { ...orders };
    } catch (e) {
      console.error('加载用例步骤顺序失败:', e);
    }
  }

  // 保存执行顺序：先统一挪到临时 sort 再写入目标 sort，避开 (caseui_id, sort) 唯一约束
  async function reorderActions(): Promise<boolean> {
    const rows = steps.value;
    const keyOf = (row: any) => String(row._linkId ?? row.id);
    const target = rows.map((row) => Number(orderValue.value[keyOf(row)]));
    const duplicated = target.some((v, i) => target.indexOf(v) !== i);
    if (duplicated) {
      message.warning('执行顺序不能重复');
      return false;
    }

    const changed = rows
      .map((row, index) => ({ row, index, key: keyOf(row) }))
      .filter(({ index, key }) => target[index] !== originalOrder.value[key]);
    if (!changed.length) return true;

    const missing = changed.find(({ row }) => row._linkId == null);
    if (missing) {
      message.error('缺少步骤关联 id，无法保存执行顺序');
      return false;
    }

    const tempBase = Math.max(...target, rows.length) + 1;
    try {
      for (const [i, item] of changed.entries()) {
        await http.request({
          url: `/case_ui/caseaction/${item.row._linkId}/`,
          method: 'patch',
          data: { sort: tempBase + i },
        });
      }
      for (const item of changed) {
        await http.request({
          url: `/case_ui/caseaction/${item.row._linkId}/`,
          method: 'patch',
          data: { sort: target[item.index] },
        });
      }
      for (const item of changed) {
        originalOrder.value[item.key] = target[item.index];
      }
      return true;
    } catch (e: any) {
      console.error('保存执行顺序失败:', e);
      if (!e?.response?.data) {
        message.error('保存执行顺序失败');
      }
      return false;
    }
  }

  // 提交：先保存步骤执行顺序（caseaction），再更新用例名称（PATCH /case_ui/case/{id}/）
  async function formSubmit() {
    try {
      await formRef.value.validate();

      if (!(await reorderActions())) return;

      await http.request({
        url: `/case_ui/case/${caseId}/`,
        method: 'patch',
        data: { name: formValue.name },
      });
      message.success('修改成功');
      goBack();
    } catch (errors: any) {
      console.error('提交失败:', errors);
      if (!errors?.response?.data) {
        message.error('提交失败');
      }
    }
  }

  // 重置表单
  function resetForm() {
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
    loadCaseDetail();
    loadActionOptions();
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
    font-size: 14px;
    color: #333;
    word-break: break-all;
    line-height: 1.6;
  }
  .empty-tip {
    color: #999;
    padding: 12px 0;
  }
</style>
