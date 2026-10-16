<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" :title="isEdit ? '修改项目' : '新增项目'">
      </n-card>
    </div>
    <n-card :bordered="false" class="mt-4 proCard" style="margin-top: -40px;">
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
            <n-form-item label="项目名称" path="name">
              <n-input
                v-model:value="formValue.name"
                placeholder="请输入项目名称"
              />
            </n-form-item>
            <n-form-item label="项目描述" path="description">
              <n-input
                v-model:value="formValue.description"
                type="textarea"
                placeholder="请输入项目描述"
                :autosize="{ minRows: 3, maxRows: 5 }"
              />
            </n-form-item>
            <n-form-item label="Base URL" path="base_url">
              <n-input
                v-model:value="formValue.base_url"
                placeholder="请输入项目基础URL"
              />
            </n-form-item>
            <n-form-item label="项目负责人" path="project_leader">
              <n-select
                v-model:value="formValue.project_leader"
                placeholder="请选择项目负责人"
                :options="userOptions"
                clearable
                placement="bottom"
              />
            </n-form-item>
            <n-form-item label="项目成员" path="user_list">
              <n-select
                v-model:value="formValue.user_list"
                placeholder="请选择项目成员"
                :options="userOptions"
                multiple
                clearable
                placement="bottom"
              />
            </n-form-item>
            <div style="margin-left: 120px">
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
import { ProjectAPI } from '@/api/project/http';
import { http } from '@/utils/http/axios';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const formRef = ref();

const projectAPI = new ProjectAPI();

// 是否编辑模式
const isEdit = computed(() => !!route.params.id);

const formValue = reactive({
  name: '',
  description: '',
  base_url: '',
  project_leader: null as number | null,
  user_list: [] as number[],
});

const userOptions = ref<{ label: string; value: number }[]>([]);

const rules: FormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
  ],
  base_url: [
    { required: true, message: '请输入项目Base URL', trigger: 'blur' },
  ],
};

// 加载用户列表
async function loadUserOptions() {
  try {
    const res: any = await http.request({
      url: '/account/profile/get_all_profile/',
      method: 'get',
    });
    userOptions.value = res.map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (e) {
    console.error('加载用户列表失败:', e);
  }
}

// 加载项目详情（编辑模式）
async function loadProjectDetail(id: number) {
  const res: any = await projectAPI.getDataByID(id);
  formValue.name = res.name;
  formValue.description = res.description || '';
  formValue.base_url = res.base_url || '';
  formValue.project_leader = res.project_leader?.id ?? res.project_leader ?? null;
  // user_list 可能是数字id数组，也可能是对象数组，自动判断
  if (Array.isArray(res.user_list) && res.user_list.length > 0) {
    formValue.user_list = typeof res.user_list[0] === 'number'
      ? res.user_list
      : res.user_list.map((u: any) => u.id);
  } else {
    formValue.user_list = [];
  }
}

// 提交表单
async function formSubmit() {
  try {
    await formRef.value.validate();
    if (isEdit.value) {
      // 编辑模式：更新项目
      await projectAPI.updateDataByID(Number(route.params.id), formValue as any);
      message.success('修改成功');
    } else {
      // 新增模式：创建项目
      await projectAPI.createData(formValue as any);
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
    // 编辑模式：重新加载项目详情，恢复成原始数据
    loadProjectDetail(Number(route.params.id));
  } else {
    // 新增模式：清空表单
    formValue.name = '';
    formValue.description = '';
    formValue.base_url = '';
    formValue.project_leader = null;
    formValue.user_list = [];
  }
  message.success('已重置');
}

// 返回列表页
function goBack() {
  router.push({ name: 'project-project' });
}

onMounted(() => {
  loadUserOptions();
  if (isEdit.value) {
    loadProjectDetail(Number(route.params.id));
  }
});
</script>
