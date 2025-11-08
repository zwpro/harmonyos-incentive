// ========== UI渲染模块 ==========

const UIRenderer = {
  // 渲染统计面板
  renderStatisticsPanel() {
    const stats = Statistics.getAllStats();
    
    return `
      <div class="stats-panel">
        <!-- 标题栏 -->
        <div class="stats-header">
          <div class="stats-header-title">
            <div class="stats-header-left">
              数据总览
            </div>
            ${AppState.cutOffTime ? `<div class="stats-cutoff-time">截止: ${AppState.cutOffTime}</div>` : ''}
          </div>
        </div>
        
        <!-- 主要指标卡片 -->
        <div class="stats-metrics-grid">
          <div class="stats-metric-card with-border">
            <div class="stats-metric-label">应用总数</div>
            <div class="stats-metric-value primary">${stats.appCount}</div>
            <div class="stats-metric-subtext">${stats.typeCount.app}个应用 · ${stats.typeCount.game}个游戏</div>
          </div>
          <div class="stats-metric-card with-border">
            <div class="stats-metric-label">预估激励</div>
            <div class="stats-metric-value accent"><span class="currency-symbol">¥</span>${stats.estimatedReward.toLocaleString()}</div>
            <div class="stats-metric-subtext">应用¥1万 · 游戏¥2千</div>
          </div>
          <div class="stats-metric-card">
            <div class="stats-metric-label">已获激励</div>
            <div class="stats-metric-value success"><span class="currency-symbol">¥</span>${stats.totalReward.toLocaleString()}</div>
            <div class="stats-metric-subtext">平均 <span class="currency-symbol-small">¥</span>${stats.avgReward.toLocaleString()}/应用</div>
          </div>
        </div>
        
        <!-- 达标情况 -->
        <div class="stats-section">
          <div class="stats-section-title">${getIcon('chart', 16, '#333')} 达标情况</div>
          <div class="reward-stats-grid">
            ${this.renderRewardCard('基础激励', '¥5,000', stats.rewardCount.base, stats.appCount, stats.rewardRate.base, 'success')}
            ${this.renderRewardCard('一阶段激励', '¥3,000', stats.rewardCount.phase1, stats.appCount, stats.rewardRate.phase1, 'primary')}
            ${this.renderRewardCard('二阶段激励', '¥2,000', stats.rewardCount.phase2, stats.appCount, stats.rewardRate.phase2, 'warning')}
          </div>
        </div>
        
        <!-- 阶段分布 -->
        <div class="stats-section-bottom">
          <div class="stats-section-title compact">${getIcon('target', 16, '#333')} 阶段分布</div>
          <div class="phase-distribution">
            ${this.renderPhaseCard('基础', stats.phaseCount.phase1, 'phase1')}
            ${this.renderPhaseCard('一阶段', stats.phaseCount.phase2, 'phase2')}
            ${this.renderPhaseCard('二阶段', stats.phaseCount.phase3, 'phase3')}
            ${this.renderPhaseCard('已结束', stats.phaseCount.ended, 'ended')}
          </div>
        </div>
      </div>
    `;
  },
  
  // 渲染达标卡片
  renderRewardCard(label, amount, count, total, rate, colorTheme) {
    return `
      <div class="reward-card reward-card-${colorTheme}">
        <div class="reward-card-header">
          <div class="reward-card-title">${label}</div>
          <div class="reward-card-amount">${amount}</div>
        </div>
        <div class="reward-card-stats">
          <span class="reward-card-count color-${colorTheme}">${count}/${total}</span>
          <span class="reward-card-rate">${rate}%</span>
        </div>
        <div class="reward-card-progress">
          <div class="reward-card-progress-fill gradient-${colorTheme}" style="width: ${rate}%;"></div>
        </div>
      </div>
    `;
  },
  
  // 渲染阶段卡片
  renderPhaseCard(label, count, theme) {
    return `
      <div class="phase-dist-card phase-${theme}">
        <div class="phase-dist-count">${count}</div>
        <div class="phase-dist-label">${label}</div>
      </div>
    `;
  },
  
  // 渲染筛选器
  renderFilters() {
    return `
      <div class="filter-container">
        <div class="filter-row">
          <div class="filter-group">
            <span class="filter-label">阶段:</span>
            <select class="filter-select" id="filter-phase">
              <option value="all">全部</option>
              <option value="1">基础</option>
              <option value="2">一阶段</option>
              <option value="3">二阶段</option>
              <option value="4">已结束</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">类型:</span>
            <select class="filter-select" id="filter-type">
              <option value="all">全部</option>
              <option value="应用">应用</option>
              <option value="游戏">游戏</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">激励:</span>
            <select class="filter-select" id="filter-reward">
              <option value="all">全部</option>
              <option value="has">有激励</option>
              <option value="none">无激励</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">状态:</span>
            <select class="filter-select" id="filter-status">
              <option value="all">全部</option>
              <option value="urgent">紧急（≤7天）</option>
              <option value="soon">即将到期（8-14天）</option>
              <option value="safe">时间充足（≥15天）</option>
              <option value="ended">已结束</option>
            </select>
          </div>
        </div>
      </div>
    `;
  },
  
  // 渲染功能按钮
  renderActionButtons() {
    const totalCount = AppState.getAppsArray().length;
    
    return `
      <div class="action-buttons-container">
        <div class="total-count-display">
          总计 <span class="total-count-number">${totalCount}</span> 款
        </div>
        <div class="action-buttons-group">
          <button id="toggleMaskBtn" class="action-btn" title="切换敏感信息显示">
            ${getIcon(AppState.isMasked ? 'eye' : 'eyeOff', 14, '#666')}
            <span>${AppState.isMasked ? '显示' : '打码'}</span>
          </button>
          <button id="sharePosterBtn" class="action-btn action-btn-primary" title="生成分享海报">
            ${getIcon('camera', 14, 'white')}
            <span>生成海报</span>
          </button>
        </div>
      </div>
    `;
  },
  
  // 渲染应用表格
  renderAppsTable() {
    const appsArray = AppState.getAppsArray();
    
    let html = `
      <table class="apps-table">
        <thead>
          <tr>
            <th style="width: 30px;"></th>
            <th style="width: 40px;">#</th>
            <th style="width: 180px;">应用名称</th>
            <th style="width: 70px;">类型</th>
            <th style="width: 100px;">阶段状态</th>
            <th style="width: 90px;">上架日期</th>
            <th style="width: 65px;" title="昨天新增的日活用户数">昨天新增</th>
            <th style="width: 60px;" title="上架次日起第1-30天">首月<br><span style="font-size: 10px; font-weight: normal; opacity: 0.7;">(1-30天)</span></th>
            <th style="width: 60px;" title="上架次日起第31-60天">次月<br><span style="font-size: 10px; font-weight: normal; opacity: 0.7;">(31-60天)</span></th>
            <th style="width: 60px;" title="上架次日起第61-90天">第三月<br><span style="font-size: 10px; font-weight: normal; opacity: 0.7;">(61-90天)</span></th>
            <th style="width: 70px;">已获激励</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    html += appsArray.map((app, index) => this.renderAppRow(app, index)).join('');
    
    html += `
        </tbody>
      </table>
    `;
    
    return html;
  },
  
  // 渲染应用行（由appRow.js处理）
  renderAppRow(app, index) {
    return AppRowRenderer.render(app, index);
  },
  
  // 渲染底部社区区域
  renderCommunityFooter() {
    return `
      <div class="community-footer">
        <button id="footer-community-btn" class="community-footer-btn">
          <span>欢迎进群交流激励玩法</span>
        </button>
      </div>
    `;
  },

  // 渲染鸿蒙功德按钮
  renderMeritButton() {
    // 从localStorage读取功德次数
    const savedData = localStorage.getItem('hongmeng_merit_data');
    let meritCount = 0;
    let todayCount = 0;
    
    if (savedData) {
      const data = JSON.parse(savedData);
      meritCount = data.totalCount || 0;
      // 检查日期，如果是新的一天则重置今日计数
      if (data.lastDate === new Date().toDateString()) {
        todayCount = data.todayCount || 0;
      }
    }
    
    const muyuUrl = chrome.runtime.getURL('images/muyu.png');
    const bangziUrl = chrome.runtime.getURL('images/bangzi.png');
    
    return `
      <div class="merit-container">
        <button id="hongmeng-merit-btn" class="hongmeng-merit-btn">
          <div class="merit-woodenfish">
            <div class="merit-muyu-wrapper">
              <img src="${muyuUrl}" alt="木鱼" class="merit-icon" />
              <img src="${bangziUrl}" alt="棒子" class="merit-bangzi" id="merit-bangzi" />
            </div>
            <span class="merit-text">鸿蒙功德</span>
            <span class="merit-subtitle">点击木鱼 积累功德</span>
          </div>
          <div class="merit-stats">
            <div class="merit-stat-item">
              <span class="merit-stat-label">总计</span>
              <span class="merit-stat-value" id="merit-total-count">${meritCount}</span>
            </div>
            <div class="merit-stat-divider"></div>
            <div class="merit-stat-item">
              <span class="merit-stat-label">今日</span>
              <span class="merit-stat-value" id="merit-today-count">${todayCount}</span>
            </div>
          </div>
        </button>
      </div>
    `;
  },

  // 完整渲染
  renderAll() {
    return this.renderStatisticsPanel() + 
           this.renderFilters() + 
           this.renderActionButtons() + 
           this.renderAppsTable() +
           this.renderCommunityFooter() +
           this.renderMeritButton();
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.UIRenderer = UIRenderer;
}

