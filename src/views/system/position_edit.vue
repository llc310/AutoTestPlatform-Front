<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" :title="isEdit ? '修改职位' : '新增职位'">
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
            <n-form-item label="职位名称" path="name">
              <n-input
                v-model:value="formValue.name"
                placeholder="请输入职位名称"
              />
            </n-form-item>
            <n-form-item label="是否领导职位" path="is_leader">
              <n-switch v-model:value="formValue.is_leader" />
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
import { PositionAPI } from '@/api/system/http';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const formRef = ref();

const positionAPI = new PositionAPI();

// 是否编辑模式
const isEdit = computed(() => !!route.params.id);

const formValue = reactive({
  name: '',
  is_leader: false,
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入职位名称', trigger: 'blur' },
  ],
};

// 加载职位详情（编辑模式）
async function loadPositionDetail(id: number) {
  const res: any = await positionAPI.getDataByID(id);
  formValue.name = res.name;
  formValue.is_leader = res.is_leader || false;
}

// 提交表单
async function formSubmit() {
  try {
    await formRef.value.validate();
    if (isEdit.value) {
      // 编辑模式：更新职位
      await positionAPI.updateDataByID(Number(route.params.id), formValue as any);
      message.success('修改成功');
    } else {
      // 新增模式：创建职位
      await positionAPI.createData(formValue as any);
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
    // 编辑模式：重新加载职位详情，恢复成原始数据
    loadPositionDetail(Number(route.params.id));
  } else {
    // 新增模式：清空表单
    formValue.name = '';
    formValue.is_leader = false;
  }
  message.success('已重置');
}

// 返回列表页
function goBack() {
  router.push({ name: 'system-position' });
}

onMounted(() => {
  if (isEdit.value) {
    loadPositionDetail(Number(route.params.id));
  }
});
</script>
