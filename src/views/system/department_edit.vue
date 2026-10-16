<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" :title="isEdit ? '修改部门' : '新增部门'">
      </n-card>
    </div>
    <n-card :bordered="false" class="mt-4 proCard" style="margin-top: -40px;">
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
            <n-form-item label="部门名称" path="name">
              <n-input
                v-model:value="formValue.name"
                placeholder="请输入部门名称"
              />
            </n-form-item>
            <n-form-item label="部门简介" path="description">
              <n-input
                v-model:value="formValue.description"
                type="textarea"
                placeholder="请输入部门简介"
                :autosize="{ minRows: 3, maxRows: 5 }"
              />
            </n-form-item>
            <n-form-item label="部门领导" path="leader">
              <n-select
                v-model:value="formValue.leader"
                placeholder="请选择部门领导"
                :options="leaderOptions"
                clearable
                placement="bottom"
              />
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
import { DepartmentAPI } from '@/api/system/http';
import { http } from '@/utils/http/axios';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const formRef: any = ref(null);
const departmentAPI = new DepartmentAPI();

// 是否为编辑模式
const isEdit = ref(!!route.params.id);

// 领导下拉选项
const leaderOptions = ref<{ label: string; value: number }[]>([]);

const formValue = reactive({
  name: '',
  description: '',
  leader: null as number | null,
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
  ],
};

// 加载领导列表（用户列表）
async function loadLeaderOptions() {
  try {
    const res: any = await http.request({
      url: '/account/profile/get_all_profile/',
      method: 'get',
    });
    leaderOptions.value = res.map((item: any) => ({
      label: `${item.name}(${item.id})`,  // 展示格式：name(id)
      value: item.id,                     // 选中值为用户id
    }));
    // 新增模式下，默认选中第一个用户
    if (!isEdit.value && leaderOptions.value.length > 0) {
      formValue.leader = leaderOptions.value[0].value;
    }
  } catch (e) {
    console.error('加载用户列表失败:', e);
  }
}

// 加载部门详情（编辑模式）
async function loadDepartmentDetail(id: number) {
  const res: any = await departmentAPI.getDataByID(id);
  formValue.name = res.name;
  formValue.description = res.description || '';
  formValue.leader = res.leader?.id ?? null;
}

// 提交表单
async function formSubmit() {
  try {
    await formRef.value.validate();
    if (isEdit.value) {
      // 编辑模式：更新部门
      await departmentAPI.updateDataByID(Number(route.params.id), formValue as any);
      message.success('修改成功');
    } else {
      // 新增模式：创建部门
      await departmentAPI.createData(formValue as any);
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
    // 编辑模式：重新加载部门详情，恢复成原始数据
    loadDepartmentDetail(Number(route.params.id));
  } else {
    // 新增模式：清空表单，leader 恢复成第一个用户
    formValue.name = '';
    formValue.description = '';
    formValue.leader = leaderOptions.value.length > 0 ? leaderOptions.value[0].value : null;
  }
  message.success('已重置');
}

// 返回列表页
function goBack() {
  router.push({ name: 'system-department' });
}

onMounted(() => {
  loadLeaderOptions();
  if (isEdit.value) {
    loadDepartmentDetail(Number(route.params.id));
  }
});
</script>

<style lang="less" scoped></style>
