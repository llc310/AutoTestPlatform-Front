<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" :title="isEdit ? '修改套件' : '新增套件'" />
    </div>
    <n-card :bordered="false" class="mt-4 proCard" style="margin-top: -40px">
      <n-grid cols="1 s:1 m:3 l:3 xl:3 2xl:3" responsive="screen">
        <n-grid-item offset="0 s:0 m:1 l:1 xl:1 2xl:1">
          <n-form
            :label-width="120"
            :model="formValue"
            :rules="rules"
            label-placement="left"
            ref="formRef"
            class="py-8"
          >
            <n-form-item label="套件名称" path="name">
              <n-input
                v-model:value="formValue.name"
                maxlength="32"
                show-count
                placeholder="请输入套件名称（最长 32 字）"
              />
            </n-form-item>
            <n-form-item label="套件描述" path="description">
              <n-input
                v-model:value="formValue.description"
                type="textarea"
                placeholder="请输入套件描述"
                :autosize="{ minRows: 2, maxRows: 5 }"
              />
            </n-form-item>
            <n-form-item label="运行模式" path="run_type">
              <n-select
                v-model:value="formValue.run_type"
                :options="runTypeOptions"
                placeholder="请选择运行模式"
                placement="bottom"
              />
            </n-form-item>
            <n-form-item v-if="formValue.run_type === 'C'" label="运行表达式" path="cron">
              <n-input
                v-model:value="formValue.cron"
                placeholder="请输入 cron 表达式，如 */2 * * * *"
              />
            </n-form-item>
            <n-form-item v-if="formValue.run_type === 'WEBHOOK'" label="hook密钥" path="hook">
              <n-input v-model:value="formValue.hook" placeholder="请输入 hook 密钥" />
            </n-form-item>
            <n-form-item label="关联UI用例" path="case_ui_list">
              <n-select
                v-model:value="formValue.case_ui_list"
                placeholder="请选择本套件包含的 UI 测试用例"
                :options="uiCaseOptions"
                multiple
                filterable
                clearable
                placement="bottom"
              />
            </n-form-item>
            <n-form-item label="关联接口用例" path="case_api_list">
              <n-select
                v-model:value="formValue.case_api_list"
                placeholder="请选择本套件包含的接口测试用例"
                :options="apiCaseOptions"
                multiple
                filterable
                clearable
                placement="bottom"
              />
            </n-form-item>
            <div style="margin-left: 120px">
              <n-space>
                <n-button type="primary" :loading="saving" @click="formSubmit">提交</n-button>
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

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const formRef: any = ref(null);
  const saving = ref(false);

  // 是否编辑模式（有套件 id）
  const isEdit = computed(() => !!route.params.id);

  // 当前套件 id 与所属项目 id
  const suiteId = Number(route.params.id);
  const projectId = ref<number | null>(null);

  const allRunTypeOptions = [
    { label: '执行一次', value: 'O' },
    { label: '定时执行', value: 'C' },
    { label: 'Webhook', value: 'WEBHOOK' },
  ];

  // 定时执行仅新增套件时可选；编辑模式隐藏该选项
  const runTypeOptions = computed(() =>
    isEdit.value ? allRunTypeOptions.filter((o) => o.value !== 'C') : allRunTypeOptions
  );

  const formValue = reactive({
    name: '',
    description: '',
    run_type: 'O',
    cron: '',
    hook: '',
    case_ui_list: [] as number[],
    case_api_list: [] as number[],
  });

  const uiCaseOptions = ref<{ label: string; value: number }[]>([]);
  const apiCaseOptions = ref<{ label: string; value: number }[]>([]);

  const rules: FormRules = {
    name: [{ required: true, message: '请输入套件名称', trigger: 'blur' }],
  };

  // 加载当前项目的 UI 用例选项
  async function loadUiCases() {
    if (!projectId.value) return;
    try {
      const res: any = await http.request({
        url: '/case_ui/case/get_single_case/',
        method: 'get',
        params: { project_id: projectId.value, page: 1, pageSize: 100 },
      });
      const list = res?.list || (Array.isArray(res) ? res : []);
      uiCaseOptions.value = list.map((item: any) => ({
        label: item.name || `用例 ${item.id}`,
        value: item.id,
      }));
    } catch (e) {
      console.error('加载 UI 用例列表失败:', e);
    }
  }

  // 加载接口用例选项（后端该列表未按项目过滤，前端按 project_id 筛选）
  async function loadApiCases() {
    if (!projectId.value) return;
    try {
      const res: any = await http.request({
        url: '/case_api/case/',
        method: 'get',
        params: { page: 1, pageSize: 100 },
      });
      const list = res?.list || (Array.isArray(res) ? res : []);
      apiCaseOptions.value = list
        .filter((item: any) => item.project === projectId.value)
        .map((item: any) => ({
          label: item.name || `接口用例 ${item.id}`,
          value: item.id,
        }));
    } catch (e) {
      console.error('加载接口用例列表失败:', e);
    }
  }

  // 加载套件详情
  async function loadSuiteDetail(id: number) {
    const res: any = await http.request({
      url: `/suite/suite/${id}/`,
      method: 'get',
    });
    projectId.value = res.project_id ?? null;
    formValue.name = res.name || '';
    formValue.description = res.description || '';
    formValue.run_type = res.run_type || 'O';
    formValue.cron = res.cron || '';
    formValue.hook = res.hook || '';
    formValue.case_ui_list = Array.isArray(res.case_ui_list) ? res.case_ui_list : [];
    formValue.case_api_list = Array.isArray(res.case_api_list) ? res.case_api_list : [];
    await Promise.all([loadUiCases(), loadApiCases()]);
  }

  // 提交：PATCH 更新套件
  async function formSubmit() {
    try {
      await formRef.value.validate();
      if (formValue.run_type === 'C' && !formValue.cron) {
        message.error('定时执行模式下请输入运行表达式');
        return;
      }
      if (formValue.run_type === 'WEBHOOK' && !formValue.hook) {
        message.error('Webhook 模式下请输入 hook 密钥');
        return;
      }
      saving.value = true;
      const payload = {
        name: formValue.name,
        description: formValue.description,
        run_type: formValue.run_type,
        cron: formValue.run_type === 'C' ? formValue.cron : '',
        hook: formValue.run_type === 'WEBHOOK' ? formValue.hook : '',
        case_ui_list: formValue.case_ui_list,
        case_api_list: formValue.case_api_list,
      };
      await http.request({
        url: `/suite/suite/${suiteId}/`,
        method: 'patch',
        data: payload,
      });
      message.success('修改成功');
      goBack();
    } catch (errors) {
      console.error('提交失败:', errors);
    } finally {
      saving.value = false;
    }
  }

  // 重置：重新拉取详情恢复
  function resetForm() {
    if (suiteId) {
      loadSuiteDetail(suiteId);
    }
    message.success('已重置');
  }

  // 返回套件列表页
  function goBack() {
    router.push({ name: 'suite-suite_list', params: { id: projectId.value ?? undefined } });
  }

  onMounted(() => {
    if (suiteId) {
      loadSuiteDetail(suiteId);
    }
  });
</script>

<style lang="less" scoped></style>
