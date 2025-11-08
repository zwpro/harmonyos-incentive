// ========== 本地存储模块 ==========
// 负责将应用的每日数据保存到本地，最多保留90天（3个月）

const AppStorage = {
  // 数据保留天数（3个月）
  RETENTION_DAYS: 90,
  
  // 存储键前缀
  STORAGE_KEY_PREFIX: 'app_history_',
  
  /**
   * 保存应用的每日数据
   * @param {Object} app - 应用数据对象
   */
  async saveAppDailyData(app) {
    if (!app || !app.appId) return;
    
    const today = this.getToday();
    const storageKey = this.getStorageKey(app.appId);
    
    try {
      // 获取该应用的历史数据
      const result = await chrome.storage.local.get(storageKey);
      const historyData = result[storageKey] || { appId: app.appId, appName: app.appName, records: [] };
      
      // 检查今天是否已有记录
      const existingIndex = historyData.records.findIndex(r => r.date === today);
      
      // 构建今日数据记录
      const todayRecord = {
        date: today,
        timestamp: Date.now(),
        phase1Users: parseInt(app.phases?.phase1?.users) || 0,
        phase2Users: parseInt(app.phases?.phase2?.users) || 0,
        phase3Users: parseInt(app.phases?.phase3?.users) || 0,
        totalUsers: (parseInt(app.phases?.phase1?.users) || 0) +
                    (parseInt(app.phases?.phase2?.users) || 0) +
                    (parseInt(app.phases?.phase3?.users) || 0),
        currentPhase: app.currentPhase,
        phaseStatus: app.phaseStatus,
        estimatedReward: app.estimatedReward || 0
      };
      
      // 如果今天已有记录，更新它；否则添加新记录
      if (existingIndex >= 0) {
        historyData.records[existingIndex] = todayRecord;
      } else {
        historyData.records.push(todayRecord);
      }
      
      // 按日期排序
      historyData.records.sort((a, b) => a.date.localeCompare(b.date));
      
      // 只保留最近90天的数据
      historyData.records = this.trimOldRecords(historyData.records);
      
      // 保存到本地存储
      await chrome.storage.local.set({ [storageKey]: historyData });
      
    } catch (error) {
      console.error('保存应用数据失败:', error);
    }
  },
  
  /**
   * 批量保存多个应用的数据
   * @param {Array} apps - 应用数组
   */
  async saveAllAppsData(apps) {
    if (!Array.isArray(apps)) return;
    
    const promises = apps.map(app => this.saveAppDailyData(app));
    await Promise.all(promises);
  },
  
  /**
   * 获取应用的历史数据
   * @param {string} appId - 应用ID
   * @returns {Object} 历史数据对象
   */
  async getAppHistory(appId) {
    if (!appId) return null;
    
    const storageKey = this.getStorageKey(appId);
    
    try {
      const result = await chrome.storage.local.get(storageKey);
      return result[storageKey] || { appId, records: [] };
    } catch (error) {
      console.error('获取应用历史数据失败:', error);
      return { appId, records: [] };
    }
  },
  
  /**
   * 计算每日新增用户数
   * @param {Array} records - 历史记录数组
   * @returns {Array} 包含每日新增数据的数组
   */
  calculateDailyIncrement(records) {
    if (!records || records.length === 0) return [];
    
    const result = [];
    
    for (let i = 0; i < records.length; i++) {
      const current = records[i];
      const previous = i > 0 ? records[i - 1] : null;
      
      // 今天记录的数据 是截至昨天的累计
      // 所以当天的新增 = 今天的累计 - 昨天的累计
      const increment = {
        date: current.date,
        // 第一天没有前一天对比，显示0
        phase1: previous ? Math.max(0, Math.round(current.phase1Users - previous.phase1Users)) : 0,
        phase2: previous ? Math.max(0, Math.round(current.phase2Users - previous.phase2Users)) : 0,
        phase3: previous ? Math.max(0, Math.round(current.phase3Users - previous.phase3Users)) : 0,
        total: previous ? Math.max(0, Math.round(current.totalUsers - previous.totalUsers)) : 0
      };
      
      result.push(increment);
    }
    
    return result;
  },
  
  /**
   * 获取图表所需的数据格式
   * @param {string} appId - 应用ID
   * @returns {Object} 图表数据对象
   * 
   * 注意：接口返回的数据是截至昨天的累计
   * 例如：11-09获取的数据，实际是截至11-08的累计
   * 图表显示时，日期标签对应实际数据日期（前一天）
   */
  async getChartData(appId) {
    const history = await this.getAppHistory(appId);
    
    if (!history || history.records.length === 0) {
      return {
        dates: [],
        dailyActive: {
          phase1: [],
          phase2: [],
          phase3: [],
          total: []
        },
        dailyIncrement: {
          phase1: [],
          phase2: [],
          phase3: [],
          total: []
        }
      };
    }
    
    const increments = this.calculateDailyIncrement(history.records);
    
    // 生成日期标签和数据
    // 第一天没有前一天对比，所以从第二天开始显示
    const dates = [];
    const dailyIncrementData = {
      phase1: [],
      phase2: [],
      phase3: [],
      total: []
    };
    
    for (let i = 1; i < history.records.length; i++) {
      // 使用前一天的日期作为标签（因为数据是截至前一天）
      const dataDate = this.getPreviousDate(history.records[i].date);
      dates.push(this.formatDateForDisplay(dataDate));
      
      // 对应的新增数据
      dailyIncrementData.phase1.push(increments[i].phase1);
      dailyIncrementData.phase2.push(increments[i].phase2);
      dailyIncrementData.phase3.push(increments[i].phase3);
      dailyIncrementData.total.push(increments[i].total);
    }
    
    return {
      dates,
      dailyActive: {
        phase1: history.records.map(r => r.phase1Users),
        phase2: history.records.map(r => r.phase2Users),
        phase3: history.records.map(r => r.phase3Users),
        total: history.records.map(r => r.totalUsers)
      },
      dailyIncrement: dailyIncrementData
    };
  },
  
  /**
   * 获取前一天的日期
   * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
   * @returns {string} 前一天的日期字符串
   */
  getPreviousDate(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return this.formatDate(date);
  },
  
  /**
   * 清理旧数据，只保留最近N天
   * @param {Array} records - 记录数组
   * @returns {Array} 清理后的记录数组
   */
  trimOldRecords(records) {
    if (!records || records.length === 0) return [];
    
    const cutoffDate = this.getCutoffDate();
    return records.filter(r => r.date >= cutoffDate);
  },
  
  /**
   * 获取截止日期（保留天数之前）
   * @returns {string} 截止日期字符串 (YYYY-MM-DD)
   */
  getCutoffDate() {
    const date = new Date();
    date.setDate(date.getDate() - this.RETENTION_DAYS);
    return this.formatDate(date);
  },
  
  /**
   * 获取今天的日期字符串
   * @returns {string} 日期字符串 (YYYY-MM-DD)
   */
  getToday() {
    return this.formatDate(new Date());
  },
  
  /**
   * 格式化日期为 YYYY-MM-DD
   * @param {Date} date - 日期对象
   * @returns {string} 格式化的日期字符串
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  /**
   * 格式化日期用于显示（MM-DD）
   * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
   * @returns {string} 格式化的日期字符串 (MM-DD)
   */
  formatDateForDisplay(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[1]}-${parts[2]}`;
    }
    return dateStr;
  },
  
  /**
   * 获取存储键
   * @param {string} appId - 应用ID
   * @returns {string} 存储键
   */
  getStorageKey(appId) {
    return `${this.STORAGE_KEY_PREFIX}${appId}`;
  },
  
  /**
   * 清空所有历史数据（用于测试或重置）
   */
  async clearAllHistory() {
    try {
      const allKeys = await chrome.storage.local.get(null);
      const historyKeys = Object.keys(allKeys).filter(key => 
        key.startsWith(this.STORAGE_KEY_PREFIX)
      );
      
      if (historyKeys.length > 0) {
        await chrome.storage.local.remove(historyKeys);
      }
    } catch (error) {
      console.error('清空历史数据失败:', error);
    }
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.AppStorage = AppStorage;
}

