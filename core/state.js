// ========== 全局状态管理 ==========
const AppState = {
  // API请求列表
  apiRequests: [],
  
  // 应用数据（根据appId去重）
  appsMap: new Map(),
  
  // 打码状态
  isMasked: false,
  
  // 展开的应用ID集合
  expandedAppIds: new Set(),
  
  // 截止时间
  cutOffTime: null,
  
  // 获取应用数组
  getAppsArray() {
    return Array.from(this.appsMap.values());
  },
  
  // 添加应用
  addApp(app) {
    if (app.appId) {
      this.appsMap.set(app.appId, app);
    }
  },
  
  // 切换打码状态
  toggleMask() {
    this.isMasked = !this.isMasked;
  },
  
  // 切换展开状态
  toggleExpanded(appId) {
    if (this.expandedAppIds.has(appId)) {
      this.expandedAppIds.delete(appId);
      return false; // 收起
    } else {
      this.expandedAppIds.add(appId);
      return true; // 展开
    }
  },
  
  // 检查是否展开
  isExpanded(appId) {
    return this.expandedAppIds.has(appId);
  },
  
  // 清空数据
  clear() {
    this.apiRequests = [];
    this.appsMap.clear();
    this.expandedAppIds.clear();
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.AppState = AppState;
}

