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
  
  // 数据推送配置
  push: {
    storageKey: 'push_config',
    
    // 获取推送配置
    async getConfig() {
      try {
        const result = await chrome.storage.local.get(this.storageKey);
        return result[this.storageKey] || { enabled: false, url: '' };
      } catch (error) {
        console.error('获取推送配置失败:', error);
        return { enabled: false, url: '' };
      }
    },
    
    // 保存推送配置
    async saveConfig(config) {
      try {
        await chrome.storage.local.set({ [this.storageKey]: config });
        return true;
      } catch (error) {
        console.error('保存推送配置失败:', error);
        return false;
      }
    },
    
    // 推送数据
    async pushData(apps, cutOffTime) {
      const config = await this.getConfig();
      if (!config.enabled || !config.url) {
        return { success: false, message: '推送未启用或地址为空' };
      }
      
      // 构建推送数据
      const pushData = {
        timestamp: Date.now(),
        cutOffTime: cutOffTime || '',
        apps: apps.map(app => ({
          appId: app.appId,
          appName: app.appName,
          appType: app.appType,
          cutOffTime: cutOffTime || '',
          phaseStatus: app.phaseStatus,
          daysUntilDeadline: app.daysUntilDeadline,
          totalUsers: app.totalUsers,
          estimatedReward: app.estimatedReward,
          phases: {
            phase1: app.phases?.phase1?.users || 0,
            phase2: app.phases?.phase2?.users || 0,
            phase3: app.phases?.phase3?.users || 0
          }
        }))
      };
      
      try {
        const response = await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pushData)
        });
        
        if (response.ok) {
          return { success: true, message: '推送成功' };
        } else {
          return { success: false, message: `推送失败: ${response.status}` };
        }
      } catch (error) {
        console.error('推送数据失败:', error);
        return { success: false, message: `推送失败: ${error.message}` };
      }
    }
  },
  
  // 其他配置可以在这里添加
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.AppConfig = AppConfig;
}

