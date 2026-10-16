<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" :title="isEdit ? '修改角色' : '新增角色'">
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
            <n-form-item label="选择用户" path="user">
              <n-select
                v-model:value="formValue.user"
                placeholder="请选择用户"
                :options="userOptions"
                clearable
                placement="bottom"
              />
            </n-form-item>
            <n-form-item label="所属部门" path="department">
              <n-select
                v-model:value="formValue.department"
                placeholder="请选择部门"
                :options="departmentOptions"
                clearable
                placement="bottom"
              />
            </n-form-item>
            <n-form-item label="职位" path="position">
              <n-select
                v-model:value="formValue.position"
                placeholder="请选择职位"
                :options="positionOptions"
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
import { RoleAPI, DepartmentAPI, PositionAPI } from '@/api/system/http';
import { http } from '@/utils/http/axios';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const formRef = ref();

const roleAPI = new RoleAPI();
const departmentAPI = new DepartmentAPI();
const positionAPI = new PositionAPI();

// 是否编辑模式
const isEdit = computed(() => !!route.params.id);

const formValue = reactive({
  user: null as number | null,
  department: null as number | null,
  position: null as number | null,
});

const userOptions = ref<{ label: string; value: number }[]>([]);
const departmentOptions = ref<{ label: string; value: number }[]>([]);
const positionOptions = ref<{ label: string; value: number }[]>([]);

const rules: FormRules = {
  user: [
    { required: true, message: '请选择用户', trigger: 'change' },
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' },
  ],
  position: [
    { required: true, message: '请选择职位', trigger: 'change' },
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

// 加载部门列表
async function loadDepartmentOptions() {
  const res: any = await departmentAPI.getDataList({ page: 1, pageSize: 100 });
  departmentOptions.value = res.list.map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
}

// 加载职位列表
async function loadPositionOptions() {
  const res: any = await positionAPI.getDataList({ page: 1, pageSize: 100 });
  positionOptions.value = res.list.map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
}

// 加载角色详情（编辑模式）
async function loadRoleDetail(id: number) {
  const res: any = await roleAPI.getDataByID(id);
  formValue.user = res.user_detail?.id ?? null;
  formValue.department = res.department_detail?.id ?? null;
  formValue.position = res.position_detail?.id ?? null;
}

// 提交表单
async function formSubmit() {
  try {
    await formRef.value.validate();
    if (isEdit.value) {
      // 编辑模式：更新角色
      await roleAPI.updateDataByID(Number(route.params.id), formValue as any);
      message.success('修改成功');
    } else {
      // 新增模式：创建角色
      await roleAPI.createData(formValue as any);
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
    // 编辑模式：重新加载角色详情，恢复成原始数据
    loadRoleDetail(Number(route.params.id));
  } else {
    // 新增模式：清空表单
    formValue.user = null;
    formValue.department = null;
    formValue.position = null;
  }
  message.success('已重置');
}

// 返回列表页
function goBack() {
  router.push({ name: 'system-role' });
}

onMounted(() => {
  loadUserOptions();
  loadDepartmentOptions();
  loadPositionOptions();
  if (isEdit.value) {
    loadRoleDetail(Number(route.params.id));
  }
});
</script>
