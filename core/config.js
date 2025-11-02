// ========== 全局配置文件 ==========

const AppConfig = {
  // 应用版本号
  version: 'v1.0.0',
  
  // 应用名称
  appName: '鸿蒙激励计划小助手',
  
  // GitHub仓库地址
  githubUrl: 'https://github.com/zwpro/harmonyos-incentive',
  
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

