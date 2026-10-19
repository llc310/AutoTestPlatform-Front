<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" :title="isEdit ? '修改元素' : '新增元素'" />
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
            <n-form-item label="元素名称" path="name">
              <n-input v-model:value="formValue.name" placeholder="请输入元素名称" />
            </n-form-item>
            <n-form-item label="定位方式" path="by">
              <n-select
                v-model:value="formValue.by"
                :options="locatorByOptions"
                placeholder="请选择定位方式"
                clearable
              />
            </n-form-item>
            <n-form-item label="定位值" path="locator">
              <n-input v-model:value="formValue.locator" placeholder="请输入定位值" />
            </n-form-item>
            <n-form-item label="所属项目">
              <n-input :value="`${projectName}（ID：${projectId}）`" disabled />
            </n-form-item>
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
  import { ref, reactive, onMounted } from 'vue';
  import { useMessage } from 'naive-ui';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormRules } from 'naive-ui';
  import { ElementAPI } from '@/api/case_ui/http';
  import { http } from '@/utils/http/axios';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const formRef: any = ref(null);
  const elementAPI = new ElementAPI();

  // 是否为编辑模式
  const isEdit = ref(!!route.params.id);

  // 所属项目 id（新增/编辑都由列表页通过 query 传入）
  const projectId = Number(route.query.project_id);
  const projectName = ref('');

  const formValue = reactive({
    name: '',
    by: 'xpath',
    locator: '',
  });

  // Selenium By 支持的 8 种标准定位方式（value 与后端 selenium.webdriver.common.by.By 常量一致）
  const locatorByOptions = [
    { label: 'id（元素 ID）', value: 'id' },
    { label: 'name（name 属性）', value: 'name' },
    { label: 'class name（类名）', value: 'class name' },
    { label: 'tag name（标签名）', value: 'tag name' },
    { label: 'link text（链接文本）', value: 'link text' },
    { label: 'partial link text（部分链接文本）', value: 'partial link text' },
    { label: 'xpath', value: 'xpath' },
    { label: 'css selector（CSS 选择器）', value: 'css selector' },
  ];

  const rules: FormRules = {
    name: [{ required: true, message: '请输入元素名称', trigger: 'blur' }],
    by: [{ required: true, message: '请选择定位方式', trigger: 'change' }],
    locator: [{ required: true, message: '请输入定位值', trigger: 'blur' }],
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

  // 加载元素详情（编辑模式）
  async function loadElementDetail(id: number) {
    const res: any = await elementAPI.getDataByID(id);
    formValue.name = res.name;
    formValue.by = res.by || 'xpath';
    formValue.locator = res.locator || '';
  }

  // 提交表单：新增走 createData，编辑走 updateDataByID
  async function formSubmit() {
    try {
      await formRef.value.validate();
      const payload = { ...formValue, project: projectId };
      if (isEdit.value) {
        await elementAPI.updateDataByID(Number(route.params.id), payload as any);
        message.success('修改成功');
      } else {
        await elementAPI.createData(payload as any);
        message.success('新增成功');
      }
      goBack();
    } catch (errors) {
      console.error('提交失败:', errors);
      message.error('提交失败');
    }
  }

  // 重置表单
  function resetForm() {
    if (isEdit.value) {
      loadElementDetail(Number(route.params.id));
    } else {
      formValue.name = '';
      formValue.by = 'xpath';
      formValue.locator = '';
    }
    message.success('已重置');
  }

  // 返回元素列表页
  function goBack() {
    router.push({ name: 'case_ui-element_list', params: { id: projectId } });
  }

  onMounted(() => {
    loadProjectName();
    if (isEdit.value) {
      loadElementDetail(Number(route.params.id));
    }
  });
</script>

<style lang="less" scoped></style>
