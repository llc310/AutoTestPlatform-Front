<template>
  <div class="welcome-page">
    <div class="welcome-content">
      <div class="welcome-logo">
        <n-icon size="72" color="#2d8cf0">
          <RocketOutline />
        </n-icon>
      </div>
      <h1 class="welcome-title">欢迎使用自动化测试平台</h1>
      <p class="welcome-subtitle">Welcome to AutoTest Platform</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { RocketOutline } from '@vicons/ionicons5';
</script>

<style lang="less" scoped>
  .welcome-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 120px);
    background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 50%, #d6e4ff 100%);
    border-radius: 8px;
  }

  .welcome-content {
    text-align: center;
  }

  .welcome-logo {
    margin-bottom: 24px;
    animation: float 3s ease-in-out infinite;
  }

  .welcome-title {
    font-size: 32px;
    font-weight: 600;
    color: #1d2129;
    margin: 0 0 12px;
  }

  .welcome-subtitle {
    font-size: 16px;
    color: #86909c;
    margin: 0;
    letter-spacing: 1px;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
</style>
