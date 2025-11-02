// ========== 统计计算模块 ==========

const Statistics = {
  // 计算总激励
  getTotalReward() {
    const appsArray = AppState.getAppsArray();
    return appsArray.reduce((sum, app) => sum + app.estimatedReward, 0);
  },
  
  // 计算应用和游戏数量
  getTypeCount() {
    const appsArray = AppState.getAppsArray();
    return {
      app: appsArray.filter(app => app.appType === '应用').length,
      game: appsArray.filter(app => app.appType === '游戏').length
    };
  },
  
  // 计算预估激励（应用 * 10000 + 游戏 * 2000）
  getEstimatedReward() {
    const typeCount = this.getTypeCount();
    return typeCount.app * 10000 + typeCount.game * 2000;
  },
  
  // 计算平均激励
  getAvgReward() {
    const size = AppState.appsMap.size;
    return size > 0 ? Math.round(this.getTotalReward() / size) : 0;
  },
  
  // 统计各阶段应用数量
  getPhaseCount() {
    const appsArray = AppState.getAppsArray();
    return {
      waiting: appsArray.filter(app => app.currentPhase === 0).length,
      phase1: appsArray.filter(app => app.currentPhase === 1).length,
      phase2: appsArray.filter(app => app.currentPhase === 2).length,
      phase3: appsArray.filter(app => app.currentPhase === 3).length,
      ended: appsArray.filter(app => app.currentPhase === 4).length
    };
  },
  
  // 统计达标情况
  getRewardCount() {
    const appsArray = AppState.getAppsArray();
    return {
      base: appsArray.filter(app => app.rewards.base > 0).length,
      phase1: appsArray.filter(app => app.rewards.phase1 > 0).length,
      phase2: appsArray.filter(app => app.rewards.phase2 > 0).length
    };
  },
  
  // 统计达标率
  getRewardRate() {
    const size = AppState.appsMap.size;
    const counts = this.getRewardCount();
    return {
      base: size > 0 ? Math.round((counts.base / size) * 100) : 0,
      phase1: size > 0 ? Math.round((counts.phase1 / size) * 100) : 0,
      phase2: size > 0 ? Math.round((counts.phase2 / size) * 100) : 0
    };
  },
  
  // 获取所有统计数据
  getAllStats() {
    const typeCount = this.getTypeCount();
    return {
      appCount: AppState.appsMap.size,
      totalReward: this.getTotalReward(),
      estimatedReward: this.getEstimatedReward(),
      avgReward: this.getAvgReward(),
      typeCount: typeCount,
      phaseCount: this.getPhaseCount(),
      rewardCount: this.getRewardCount(),
      rewardRate: this.getRewardRate()
    };
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.Statistics = Statistics;
}

