<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="修改用例" />
    </div>
    <n-card :bordered="false" class="mt-4 proCard" style="margin-top: -40px">
      <n-grid cols="1 s:1 m:3 l:3 xl:3 2xl:3" responsive="screen">
        <n-grid-item offset="0 s:0 m:1 l:1 xl:1 2xl:1">
          <n-form
            :label-width="100"
            :model="formValue"
            :rules="rules"
            label-placement="left"
            ref="formRef"
            class="py-8"
          >
            <n-form-item label="用例名称" path="name">
              <n-input v-model:value="formValue.name" placeholder="请输入用例名称" />
            </n-form-item>
            <n-form-item label="执行顺序" path="order">
              <n-input-number v-model:value="formValue.order" :min="1" style="width: 100%" />
            </n-form-item>
            <n-form-item label="所属项目">
              <n-input :value="`${projectName}（ID：${projectId}）`" disabled />
            </n-form-item>

            <n-divider title-placement="left">测试步骤</n-divider>

            <div v-for="(step, index) in formValue.step" :key="step.id" class="step-card">
              <n-card size="small" :bordered="true">
                <n-space vertical :size="12">
                  <n-space align="center" :size="8">
                    <span style="font-weight: 500; color: #18a058">步骤 {{ index + 1 }}</span>
                    <span>顺序</span>
                    <n-input-number
                      v-model:value="step.order"
                      :min="1"
                      size="small"
                      style="width: 90px"
                    />
                  </n-space>
                  <n-space vertical :size="6">
                    <n-space align="center" :size="8">
                      <span class="step-label">Allure 参数</span>
                      <div style="flex: 1">
                        <div
                          v-for="(v, k) in allureFields(formValue.allure)"
                          :key="k"
                          class="step-el"
                        >
                          {{ k }}：{{ v }}
                        </div>
                        <pre v-if="!allureFields(formValue.allure)" class="step-pre">
                          {{ formatJson(formValue.allure) }}
                        </pre>
                      </div>
                    </n-space>
                    <n-space align="center" :size="8">
                      <span class="step-label">参数化参数</span>
                      <pre class="step-pre">{{ parametrizeText }}</pre>
                    </n-space>
                    <n-space align="center" :size="8">
                      <span class="step-label">断言参数</span>
                      <pre class="step-pre">{{ validateText }}</pre>
                    </n-space>
                    <n-space align="center" :size="8">
                      <span class="step-label">操作名称</span>
                      <n-input
                        v-model:value="step.action"
                        placeholder="如：输入用户名"
                        style="flex: 1"
                      />
                    </n-space>
                    <n-space align="center" :size="8">
                      <span class="step-label">关键字</span>
                      <n-input
                        v-model:value="step.keyword"
                        placeholder="如：click / send_keys"
                        style="flex: 1"
                      />
                    </n-space>
                    <n-space align="center" :size="8">
                      <span class="step-label">参数</span>
                      <n-input
                        v-model:value="step.argsText"
                        placeholder="多个参数用英文逗号分隔"
                        style="flex: 1"
                      />
                    </n-space>
                    <n-space align="center" :size="8">
                      <span class="step-label">关联元素</span>
                      <div style="flex: 1">
                        <div v-for="el in step.element" :key="el.id" class="step-el">
                          元素 id：{{ el.id }} ｜ 名称：{{ el.name }} ｜ 定位方式：{{ el.by }} ｜
                          定位值：{{ el.locator }} ｜ 所属项目：{{ el.project }}
                        </div>
                        <span v-if="!step.element || step.element.length === 0">-</span>
                      </div>
                    </n-space>
                  </n-space>
                </n-space>
              </n-card>
            </div>

            <div style="margin-left: 100px">
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
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useMessage } from 'naive-ui';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormRules } from 'naive-ui';
  import { http } from '@/utils/http/axios';
  import type { Element as UIElement } from '@/api/case_ui/models';

  interface StepEditItem {
    id: number;
    element: UIElement[];
    order: number;
    action: string;
    keyword: string;
    argsText: string;
  }

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
    order: 1,
    step: [] as StepEditItem[],
    allure: null as unknown,
    parametrize: null as unknown,
    validate: null as unknown,
  });

  const parametrizeText = computed(() => formatJson(formValue.parametrize));
  const validateText = computed(() => formatJson(formValue.validate));

  const rules: FormRules = {
    name: [{ required: true, message: '请输入用例名称', trigger: 'blur' }],
    order: [{ required: true, message: '请输入执行顺序', trigger: 'change' }],
  };

  function formatJson(value: unknown): string {
    if (value === undefined) return '';
    try {
      return JSON.stringify(value, null, 2) ?? '';
    } catch {
      return String(value);
    }
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

  function formatArgs(args: unknown): string {
    if (Array.isArray(args)) return args.join(', ');
    if (args === null || args === undefined) return '';
    return String(args);
  }

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

  // 加载用例详情（含步骤与元素）
  async function loadCaseDetail() {
    if (!caseId) {
      message.error('缺少用例 id');
      return;
    }
    try {
      const res: any = await http.request({
        url: '/case_ui/case_ui_info/get_single_caseuiinfo/',
        method: 'get',
        params: { caseui_id: caseId },
      });
      // 兼容多种返回结构：分页 list / DRF results / 直接返回单对象
      let target: any = null;
      if (Array.isArray(res)) {
        target = res.find((item: any) => item.id === caseId);
      } else if (res?.list && Array.isArray(res.list)) {
        target = res.list.find((item: any) => item.id === caseId);
      } else if (res?.results && Array.isArray(res.results)) {
        target = res.results.find((item: any) => item.id === caseId);
      } else if (res && typeof res === 'object' && res.id === caseId) {
        target = res;
      }
      if (!target) {
        message.error('未找到该用例');
        return;
      }
      formValue.name = target.name ?? '';
      formValue.order = target.order ?? 1;
      formValue.allure = target.allure ?? null;
      formValue.parametrize = target.parametrize ?? null;
      formValue.validate = target.validate ?? null;
      formValue.step = (target.step || []).map((s: any, index: number) => ({
        id: s.id,
        element: s.element || [],
        order: s.order ?? index + 1,
        action: s.action ?? '',
        keyword: s.keyword ?? '',
        argsText: formatArgs(s.args),
      }));
    } catch (e) {
      console.error('加载用例详情失败:', e);
      message.error('加载用例详情失败');
    }
  }

  // 提交：更新用例内容（步骤等）+ 同步更新用例主表名称
  async function formSubmit() {
    try {
      await formRef.value.validate();
      const stepPayload = formValue.step.map((s) => ({
        id: s.id,
        element: s.element.map((e) => ({
          id: e.id,
          name: e.name,
          by: e.by,
          locator: e.locator,
          project: e.project,
        })),
        order: s.order,
        action: s.action,
        keyword: s.keyword,
        args: s.argsText
          ? s.argsText
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
          : [],
      }));
      const payload = {
        name: formValue.name,
        order: formValue.order,
        step: stepPayload,
        allure: formValue.allure,
        parametrize: formValue.parametrize,
        validate: formValue.validate,
        project: projectId,
      };
      await http.request({
        url: `/case_ui/case_ui_info/${caseId}/`,
        method: 'put',
        data: payload,
      });
      // 同步更新用例主表名称（仅部分字段，避免覆盖 caseuiinfo 关联）
      await http.request({
        url: `/case_ui/case/${caseId}/`,
        method: 'patch',
        data: { name: formValue.name },
      });
      message.success('修改成功');
      goBack();
    } catch (errors) {
      console.error('提交失败:', errors);
      message.error('提交失败');
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
    loadCaseDetail();
  });
</script>

<style lang="less" scoped>
  .step-card {
    margin-bottom: 12px;
  }
  .step-label {
    width: 70px;
    color: #666;
    flex-shrink: 0;
  }
  .step-pre {
    margin: 0;
    flex: 1;
    white-space: pre-wrap;
    word-break: break-all;
    font-size: 12px;
    color: #666;
  }
  .step-el {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
  }
  .mr-1 {
    margin-right: 6px;
  }
</style>
