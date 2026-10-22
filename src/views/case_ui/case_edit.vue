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

            <div v-if="steps.length === 0" class="empty-tip">暂无测试步骤</div>
            <div v-for="(action, index) in steps" :key="action.id" class="step-card">
              <n-card size="small" :bordered="true">
                <n-space vertical :size="8">
                  <n-space align="center" :size="8">
                    <span class="step-index">测试步骤 {{ index + 1 }}</span>
                    <span>执行顺序：{{ action.sort }}</span>
                  </n-space>

                  <div>
                    <span class="step-label">Allure 参数：</span>
                    <span v-if="allureText(action.allure_id)" class="step-value">
                      {{ allureText(action.allure_id) }}
                    </span>
                    <span v-else>-</span>
                  </div>
                  <div>
                    <span class="step-label">参数化参数：</span>
                    <span v-if="action.parametrize_id" class="step-value">
                      {{ formatInline(action.parametrize_id) }}
                    </span>
                    <span v-else>-</span>
                  </div>
                  <div>
                    <span class="step-label">断言参数：</span>
                    <span v-if="action.validate_id" class="step-value">
                      {{ formatInline(action.validate_id) }}
                    </span>
                    <span v-else>-</span>
                  </div>

                  <div>
                    <span class="step-label">页面操作：</span>
                    <span v-if="!action.step_id || action.step_id.length === 0">-</span>
                  </div>
                  <div
                    v-for="(s, i) in action.step_id"
                    :key="s.id"
                    class="step-sub"
                  >
                    操作 {{ i + 1 }}：{{ s.action }}
                    ｜ 参数：{{ formatJson(s.params) }}
                    ｜ 关键字ID：{{ s.keyword_id ?? '-' }}
                    ｜ 元素ID：{{ s.element_id ?? '-' }}
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
  import { ref, reactive, onMounted } from 'vue';
  import { useMessage } from 'naive-ui';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormRules } from 'naive-ui';
  import { http } from '@/utils/http/axios';
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

  const rules: FormRules = {
    name: [{ required: true, message: '请输入用例名称', trigger: 'blur' }],
  };

  // JSON 字段展示：对象/数组转字符串
  function formatJson(v: unknown): string {
    if (v === null || v === undefined || v === '') return '-';
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }

  // 对象内联展示（参数化 / 断言）：字段用 ｜ 分隔
  function formatInline(v: any): string {
    if (v === null || v === undefined) return '-';
    if (Array.isArray(v)) return v.map((item: any) => formatInline(item)).join('、');
    if (typeof v === 'object') {
      return Object.entries(v)
        .map(([k, val]) => `${k}：${formatInline(val)}`)
        .join(' ｜ ');
    }
    return String(v);
  }

  // allure 字段级展示（feature/story/title/description）
  function allureText(value: any): string {
    if (!value || typeof value !== 'object') return '';
    const parts: string[] = [];
    for (const key of ['feature', 'story', 'title', 'description']) {
      if (value[key] !== undefined && value[key] !== null && value[key] !== '') {
        parts.push(`${key}：${value[key]}`);
      }
    }
    return parts.join(' ｜ ');
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
      steps.value = Array.isArray(res.action_id) ? res.action_id : [];
    } catch (e) {
      console.error('加载用例详情失败:', e);
      message.error('加载用例详情失败');
    }
  }

  // 提交：仅更新用例名称（PATCH /case_ui/case/{id}/，测试步骤由后端只读关联）
  async function formSubmit() {
    try {
      await formRef.value.validate();
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
  .step-index {
    font-weight: 500;
    color: #18a058;
  }
  .step-label {
    color: #666;
  }
  .step-value {
    color: #333;
  }
  .step-sub {
    margin-left: 24px;
    font-size: 13px;
    color: #666;
    line-height: 1.6;
  }
  .empty-tip {
    color: #999;
    padding: 12px 0;
  }
</style>
