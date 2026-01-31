// ========== 全局配置文件 ==========

const AppConfig = {
  // 应用版本号 - 从manifest.json中动态获取
  get version() {
    try {
      const manifest = chrome.runtime.getManifest();
      return 'v' + manifest.version;
    } catch (error) {
      console.error('获取版本号失败:', error);
      return 'v1.0.0'; // 降级方案
    }
  },
  
  // 应用名称
  appName: '鸿蒙激励计划小助手',
  
  // GitHub仓库地址
  githubUrl: 'https://github.com/zwpro/harmonyos-incentive',
  
  // Chrome Web Store 详情页地址
  chromeWebStoreUrl: 'https://chromewebstore.google.com/detail/dpakdoaefaobpjcldcjbdohgkgojknki?utm_source=item-share-cb',
  
  // 社群配置
  community: {
    qrCodeUrl: 'https://cdn.letwind.com/huawei/harmonyos-incentive/qun.png' // 群二维码图片地址
  },
  
  // 其他配置可以在这里添加
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.AppConfig = AppConfig;
}

