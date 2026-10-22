<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" :title="isEdit ? '修改关键字' : '新增关键字'" />
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
            <n-form-item label="关键字名" path="keyword_name">
              <n-input
                v-model:value="formValue.keyword_name"
                maxlength="64"
                show-count
                placeholder="请输入关键字名，如 click / send_keys（最长 64 字）"
              />
            </n-form-item>
            <n-form-item label="操作描述" path="description">
              <n-input
                v-model:value="formValue.description"
                maxlength="64"
                show-count
                placeholder="请输入操作描述，如：点击元素（最长 64 字）"
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
  import { KeyWordAPI } from '@/api/case_ui/http';

  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const formRef: any = ref(null);
  const keywordAPI = new KeyWordAPI();

  // 是否为编辑模式
  const isEdit = ref(!!route.params.id);

  const formValue = reactive({
    keyword_name: '',
    description: '',
  });

  const rules: FormRules = {
    keyword_name: [{ required: true, message: '请输入关键字名', trigger: 'blur' }],
  };

  // 加载关键字详情（编辑模式）
  async function loadKeyWordDetail(id: number) {
    const res: any = await keywordAPI.getDataByID(id);
    formValue.keyword_name = res.keyword_name || '';
    formValue.description = res.description || '';
  }

  // 提交表单：新增走 createData，编辑走 updateDataByID
  async function formSubmit() {
    try {
      await formRef.value.validate();
      if (isEdit.value) {
        await keywordAPI.updateDataByID(Number(route.params.id), formValue as any);
        message.success('修改成功');
      } else {
        await keywordAPI.createData(formValue as any);
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
      loadKeyWordDetail(Number(route.params.id));
    } else {
      formValue.keyword_name = '';
      formValue.description = '';
    }
    message.success('已重置');
  }

  // 返回关键字列表页
  function goBack() {
    router.push({ name: 'case_ui-keyword' });
  }

  onMounted(() => {
    if (isEdit.value) {
      loadKeyWordDetail(Number(route.params.id));
    }
  });
</script>

<style lang="less" scoped></style>
