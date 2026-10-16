<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="个人资料">
      </n-card>
    </div>
    <n-card :bordered="false" class="mt-4 proCard">
      <n-grid cols="1 s:1 m:3 l:3 xl:3 2xl:3" responsive="screen">
        <n-grid-item offset="0 s:0 m:1 l:1 xl:1 2xl:1">
          <n-form
            :label-width="90"
            :model="formValue"
            :rules="rules"
            label-placement="left"
            ref="formRef"
            class="py-8"
          >
            <n-form-item label="昵称" path="name">
              <n-input v-model:value="formValue.name" placeholder="输入昵称" />
            </n-form-item>
            <n-form-item label="头像" path="head_img">
              <BasicUpload
                :action="`/api/account/profile/upload_img/`"
                :headers="uploadHeaders"
                :data="{ type: 0 }"
                name="head_img"
                :width="100"
                :height="100"
                @upload-change="uploadChange"
                v-model:value="formValue.head_img"
                helpText="单个文件不超过20MB，最多只能上传10个文件"
              />
            </n-form-item>
            <div style="margin-left: 80px">
              <n-space>
                <n-button type="primary" @click="formSubmit">提交</n-button>
                <n-button @click="resetForm">重置</n-button>
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
  import type { FormRules } from 'naive-ui';
  import { BasicUpload } from '@/components/Upload';
  import { profile,changeProfile } from '../../api/account/http'
  import { Profile } from '@/api/account/models';
import { useUser } from '@/store/modules/user';

  const userStore = useUser() 
  const token = userStore.getToken;

  const rules: FormRules = {
    name: {
      required: true,
      message: '请输入昵称',
      trigger: 'blur',
    },
    head_img: {
      type: 'array',
      required: true,
      message: '请上传头像',
      trigger: 'change',
    }
  };

  const formRef: any = ref(null);
  const message = useMessage();

  const formValue = reactive({
    name: '',
    head_img: [''],
  });
  const uploadHeaders = reactive({
    "Authorization": `Token ${token}`,
  });

  async function formSubmit() {
    try {
      console.log('提交前 formValue =', JSON.parse(JSON.stringify(formValue)));
      await formRef.value.validate();
      const params = {
        name: formValue.name,
        head_img: formValue.head_img[0],
      };
      await changeProfile(params as Profile);
      message.success('保存成功');
    } catch (errors) {
      console.error('提交失败:', errors);
    }
  }

  function resetForm() {
    formRef.value.restoreValidation();
    Object.assign(formValue, { name: '', head_img: [''] });
  }

  function uploadChange(list: string[]) {
    formValue.head_img = list;
  }

  async function get_data_by_api() {
    const data = await profile();
    formValue.name = data.name;
    formValue.head_img = [data.head_img];
  }

  onMounted(async () => {
    await get_data_by_api()
  })
</script>
