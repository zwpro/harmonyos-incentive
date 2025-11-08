// ========== 应用行渲染模块 ==========

const AppRowRenderer = {
  // 渲染应用行
  render(app, index) {
    const statusIcon = app.status === '1' ? getIcon('success') : getIcon('error');
    const phaseInfo = this.getPhaseInfo(app.currentPhase);
    const statusByDays = this.getStatusByDays(app.currentPhase, app.daysUntilDeadline);
    
    return `
      <tr class="app-row" data-app-id="${app.appId}" data-phase="${app.currentPhase}" data-type="${app.appType}" data-reward="${app.estimatedReward > 0 ? 'has' : 'none'}" data-status="${statusByDays}">
        <td style="text-align: center;">
          <span class="expand-icon" data-app-id="${app.appId}">${getIcon('chevronRight', 14, '#999')}</span>
        </td>
        <td style="text-align: center; font-weight: 500; color: #999;">${index + 1}</td>
        <td class="app-name-cell">
          <div>
            ${AppState.isMasked ? MaskUtils.maskFull(app.appName) : app.appName} ${statusIcon}
          </div>
        </td>
        <td style="text-align: center;">
          <span style="color: ${app.appType === '游戏' ? '#9c27b0' : '#1976d2'}; font-size: 11px; font-weight: 500;">
            ${app.appType || '应用'}
          </span>
        </td>
        <td style="padding: 6px 8px;">
          ${this.renderPhaseStatus(phaseInfo, app.daysUntilDeadline)}
        </td>
        <td style="font-size: 11px;">${app.firstOnShelfDate}</td>
        <td class="number-cell" style="color: ${this.getYesterdayColor(app.yesterdayIncrement)}; font-weight: 600;">${this.formatYesterdayIncrement(app.yesterdayIncrement)}</td>
        <td class="number-cell" style="color: ${this.getUserColor(app.phases.phase1.users, 50)}; font-weight: ${app.phases.phase1.users >= 50 ? '600' : '400'};">${app.phases.phase1.users}</td>
        <td class="number-cell" style="color: ${this.getUserColor(app.phases.phase2.users, 100)}; font-weight: ${app.phases.phase2.users >= 100 ? '600' : '400'};">${app.phases.phase2.users}</td>
        <td class="number-cell" style="color: ${app.appType === '游戏' ? '#999' : this.getUserColor(app.phases.phase3.users, 200)}; font-weight: ${app.phases.phase3.users >= 200 ? '600' : '400'};">${app.appType === '游戏' ? '-' : app.phases.phase3.users}</td>
        <td class="reward-cell">¥${app.estimatedReward}</td>
      </tr>
      <tr class="detail-row" id="detail-${app.appId}">
        <td colspan="11" class="detail-cell">
          ${this.renderDetail(app)}
        </td>
      </tr>
    `;
  },
  
  // 获取阶段信息
  getPhaseInfo(currentPhase) {
    const phaseMap = {
      0: { text: '未开始', color: '#999', bg: '#f5f5f5' },
      1: { text: '基础', color: '#1976d2', bg: '#e3f2fd' },
      2: { text: '一阶段', color: '#388e3c', bg: '#e8f5e9' },
      3: { text: '二阶段', color: '#f57c00', bg: '#fff3e0' },
      4: { text: '已完成', color: '#666', bg: '#f5f5f5' }
    };
    return phaseMap[currentPhase] || phaseMap[0];
  },
  
  // 根据剩余天数获取状态
  getStatusByDays(currentPhase, daysLeft) {
    if (currentPhase === 4) return 'ended';
    if (currentPhase === 0) return 'waiting';
    if (daysLeft <= 7) return 'urgent';
    if (daysLeft <= 14) return 'soon';
    return 'safe';
  },
  
  // 获取用户数颜色（根据是否达标）
  getUserColor(users, threshold) {
    return users >= threshold ? '#4caf50' : '#f44336';
  },
  
  // 格式化昨天新增显示
  formatYesterdayIncrement(increment) {
    if (increment === null || increment === undefined) {
      return '<span style="font-size: 10px; color: #999;">加载中...</span>';
    }
    if (increment === '-') {
      return '<span style="font-size: 10px; color: #999;">-</span>';
    }
    if (increment === 0) {
      return '<span style="color: #999;">0</span>';
    }
    return `+${increment}`;
  },
  
  // 获取昨天新增的颜色
  getYesterdayColor(increment) {
    if (increment === null || increment === undefined || increment === '-') {
      return '#999';
    }
    if (increment === 0) {
      return '#999';
    }
    if (increment > 0) {
      return '#4caf50'; // 绿色表示增长
    }
    return '#999';
  },
  
  // 渲染阶段状态
  renderPhaseStatus(phaseInfo, daysLeft) {
    return `
      <div class="phase-status-container">
        <div class="phase-badge phase-badge-inline" style="background: ${phaseInfo.bg}; color: ${phaseInfo.color}; border: 1px solid ${phaseInfo.color}33;">
          ${phaseInfo.text}
        </div>
        ${daysLeft >= 0 && phaseInfo.text !== '已完成' && phaseInfo.text !== '未开始' ? `
          <div class="phase-days-left" style="color: ${phaseInfo.color};">
            剩 ${daysLeft} 天
          </div>
        ` : ''}
      </div>
    `;
  },
  
  // 渲染详情
  renderDetail(app) {
    return `
      <div class="detail-content">
        <div class="detail-section">
          <div class="detail-section-title">${getIcon('calendar', 14, '#1976d2')} 阶段时间表 <span class="detail-subtitle">(从上架次日开始计算)</span></div>
          <div class="detail-grid">
            ${this.renderPhaseTimeCard('首月 (上架次日起1-30天)', app.phases.phase1, 'phase1')}
            ${this.renderPhaseTimeCard('次月 (上架次日起31-60天)', app.phases.phase2, 'phase2')}
            ${this.renderPhaseTimeCard('第三月 (上架次日起61-90天)', app.phases.phase3, 'phase3')}
          </div>
          <div class="detail-info-box">
            ${getIcon('info', 12, '#2196f3')} 说明：有效月活指HarmonyOS 5.0及之后系统的去重活跃设备数
          </div>
        </div>
        
        <div class="detail-section">
          <div class="detail-section-title">${getIcon('chart', 14, '#4caf50')} 每日新增趋势 <span class="detail-subtitle">(最近90天)</span></div>
          <div class="chart-container">
            <canvas id="chart-${app.appId}" class="trend-chart"></canvas>
          </div>
          <div class="chart-loading" id="chart-loading-${app.appId}">
            加载图表数据中...
          </div>
        </div>
        
        <div class="detail-section">
          <div class="detail-section-title">${getIcon('money', 14, '#ff6b35')} 激励明细</div>
          <div class="detail-grid">
            ${app.appType === '游戏' ? 
              this.renderRewardCard('基础激励 (¥1,200)', app.rewards.base, false, app.phases.phase1.users, 50) :
              this.renderRewardCard('基础激励 (¥5,000)', app.rewards.base, app.isMature, app.phases.phase1.users, 50)
            }
            ${app.appType === '游戏' ? 
              this.renderRewardCard('活跃激励 (¥800)', app.rewards.phase1, false, app.phases.phase2.users, 100) :
              this.renderRewardCard('一阶段激励 (¥3,000)', app.rewards.phase1, app.isMature, app.phases.phase2.users, 100)
            }
            ${app.appType !== '游戏' ? 
              this.renderRewardCard('二阶段激励 (¥2,000)', app.rewards.phase2, true, app.phases.phase3.users, 200) : 
              ''
            }
          </div>
        </div>
        
        <div class="detail-section">
          <div class="detail-section-title">${getIcon('key', 14, '#666')} AppID</div>
          <div class="detail-appid">
            ${AppState.isMasked ? MaskUtils.maskPartial(app.appId, 4) : app.appId}
          </div>
        </div>
      </div>
    `;
  },
  
  // 渲染阶段时间卡片
  renderPhaseTimeCard(label, phase, theme) {
    return `
      <div class="detail-item phase-${theme}">
        <div class="detail-item-label">${label}</div>
        <div class="detail-item-value">${phase.range}</div>
        <div class="detail-phase-users">有效月活: ${phase.users}</div>
      </div>
    `;
  },
  
  // 渲染激励卡片
  renderRewardCard(label, amount, checkMature, users, threshold) {
    const hasReward = amount > 0;
    const needCheck = !checkMature && !hasReward;
    
    return `
      <div class="detail-item">
        <div class="detail-item-label">${label}</div>
        <div class="detail-item-value">
          <div class="detail-item-amount" style="color: ${hasReward ? '#4caf50' : '#999'};">
            ${hasReward ? getIcon('check', 12, '#4caf50') + ' ¥' + amount : getIcon('cross', 12, '#999') + ' ¥0'}
          </div>
          ${needCheck ? `<div class="detail-item-requirement">需要≥${threshold}（当前: ${users}）</div>` : ''}
        </div>
      </div>
    `;
  },
  
  // 渲染图表
  async renderChart(appId) {
    if (typeof AppStorage === 'undefined' || typeof Chart === 'undefined') {
      console.error('AppStorage或Chart未加载');
      return;
    }
    
    const canvas = document.getElementById(`chart-${appId}`);
    const loadingEl = document.getElementById(`chart-loading-${appId}`);
    
    if (!canvas) return;
    
    try {
      // 获取图表数据
      const chartData = await AppStorage.getChartData(appId);
      
      // 隐藏加载提示
      if (loadingEl) {
        loadingEl.style.display = 'none';
      }
      
      // 如果没有历史数据
      if (!chartData.dates || chartData.dates.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Arial';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('暂无历史数据，数据将从今天开始记录', canvas.width / 2, canvas.height / 2);
        return;
      }
      
      // 销毁已存在的图表实例
      const existingChart = Chart.getChart(canvas);
      if (existingChart) {
        existingChart.destroy();
      }
      
      // 创建图表
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.dates,
          datasets: [
            {
              label: '每日新增',
              data: chartData.dailyIncrement.total,
              borderColor: '#4caf50',
              backgroundColor: 'rgba(76, 175, 80, 0.15)',
              tension: 0.3,
              fill: true,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: '#4caf50',
              pointBorderColor: '#fff',
              pointBorderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 13
              },
              bodyFont: {
                size: 12
              },
              callbacks: {
                label: function(context) {
                  return '新增用户: ' + context.parsed.y;
                }
              }
            }
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: 10
                }
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: '每日新增用户数',
                font: {
                  size: 11
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                font: {
                  size: 10
                },
                beginAtZero: true,
                precision: 0,
                stepSize: 1,
                callback: function(value) {
                  // 只显示整数
                  if (Math.floor(value) === value) {
                    return value;
                  }
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('渲染图表失败:', error);
      if (loadingEl) {
        loadingEl.textContent = '加载图表失败';
        loadingEl.style.color = '#f44336';
      }
    }
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.AppRowRenderer = AppRowRenderer;
}

