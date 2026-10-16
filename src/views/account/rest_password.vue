<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="修改密码">
      </n-card>
    </div>
    <n-card :bordered="false" class="mt-4 proCard">
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
            <n-form-item label="新密码" path="new_password">
              <n-input
                v-model:value="formValue.new_password"
                type="password"
                show-password-on="click"
                placeholder="请输入新密码（至少6位）"
              />
            </n-form-item>
            <n-form-item label="确认新密码" path="confirm_password">
              <n-input
                v-model:value="formValue.confirm_password"
                type="password"
                show-password-on="click"
                placeholder="请再次输入新密码"
              />
            </n-form-item>
            <div style="margin-left: 100px">
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
  import { ref, reactive } from 'vue';
  import { useMessage } from 'naive-ui';
  import type { FormRules } from 'naive-ui';
  import { resetPassword } from '../../api/account/http';
  import type { ResetPassword } from '@/api/account/models';
  import { useUser } from '@/store/modules/user';
  import { PageEnum } from '@/enums/pageEnum';

  const userStore = useUser();
  const formRef: any = ref(null);
  const message = useMessage();

  const formValue = reactive<ResetPassword>({
    new_password: '',
    confirm_password: '',
  });

  const rules: FormRules = {
    new_password: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少6位', trigger: 'blur' },
    ],
    confirm_password: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      {
        validator: (_rule: any, value: string) => {
          if (value !== formValue.new_password) {
            return new Error('两次输入的密码不一致');
          }
          return true;
        },
        trigger: ['blur', 'input'],
      },
    ],
  };

  async function formSubmit() {
    try {
      await formRef.value.validate();
      await resetPassword({
        new_password: formValue.new_password,
        confirm_password: formValue.confirm_password,
      });
      message.success('密码修改成功，即将跳转到登录页');
      await userStore.logout();
      setTimeout(() => {
        window.location.href = PageEnum.BASE_LOGIN;
      }, 1500);
    } catch (errors) {
      console.error('提交失败:', errors);
    }
  }

  function resetForm() {
    formRef.value.restoreValidation();
    Object.assign(formValue, { new_password: '', confirm_password: '' });
  }
</script>
