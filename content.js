// ========== API 拦截功能 ==========
// 注意：SVG图标库已从 icons.js 加载
// 通过加载外部文件的方式注入脚本，避免 CSP 限制
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Content Script 中接收拦截的数据
const apiRequests = [];
// 存储所有应用数据（根据appId去重）
const appsMap = new Map();
// 打码状态
let isMasked = false;
// 保存展开状态的应用ID列表
let expandedAppIds = new Set();

// 监听页面上下文发来的API数据
window.addEventListener('apiCaptured', function(event) {
  const requestInfo = event.detail;
  apiRequests.push(requestInfo);
  
  // 解析并提取应用列表
  extractAppsFromResponse(requestInfo.response);
  
  updateApiDisplay();
});

// 解析响应数据，提取应用列表
function extractAppsFromResponse(response) {
  try {
    if (!response || !response.resJson) return;
    
    // 第一层解析：resJson 是字符串
    const resJsonObj = JSON.parse(response.resJson);
    if (!resJsonObj.result || !resJsonObj.result.resultString) return;
    
    // 第二层解析：resultString 也是字符串
    const resultArray = JSON.parse(resJsonObj.result.resultString);
    if (!Array.isArray(resultArray) || resultArray.length === 0) return;
    
    const firstResult = resultArray[0];
    if (!firstResult.list || !Array.isArray(firstResult.list)) return;
    
    // 提取应用列表并根据appId去重
    firstResult.list.forEach(app => {
      if (app.appId) {
        // 计算时间段和激励
        const enrichedApp = enrichAppData(app);
        appsMap.set(app.appId, enrichedApp);
      }
    });
    
    // 提取截止时间
    if (firstResult.cutOffTime) {
      window.__cutOffTime = firstResult.cutOffTime;
    }
  } catch (error) {
    // 静默处理错误
  }
}

// 增强应用数据：计算时间段、截止天数、激励金额
function enrichAppData(app) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 解析首次上架日期
  const onShelfDate = new Date(app.firstOnShelfDate);
  onShelfDate.setHours(0, 0, 0, 0);
  
  // 上架次日（阶段起始日）
  const startDate = new Date(onShelfDate);
  startDate.setDate(startDate.getDate() + 1);
  
  // 计算三个阶段的时间范围
  const phase1Start = new Date(startDate);
  const phase1End = new Date(startDate);
  phase1End.setDate(phase1End.getDate() + 29); // 第1-30天
  
  const phase2Start = new Date(startDate);
  phase2Start.setDate(phase2Start.getDate() + 30); // 第31天
  const phase2End = new Date(startDate);
  phase2End.setDate(phase2End.getDate() + 59); // 第31-60天
  
  const phase3Start = new Date(startDate);
  phase3Start.setDate(phase3Start.getDate() + 60); // 第61天
  const phase3End = new Date(startDate);
  phase3End.setDate(phase3End.getDate() + 89); // 第61-90天
  
  // 格式化日期
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 判断当前在哪个阶段，计算截止天数
  let currentPhase = 0;
  let daysUntilDeadline = 0;
  let phaseStatus = '未开始';
  
  if (today < phase1Start) {
    currentPhase = 0;
    phaseStatus = '未开始';
    daysUntilDeadline = Math.ceil((phase1Start - today) / (1000 * 60 * 60 * 24));
  } else if (today <= phase1End) {
    currentPhase = 1;
    phaseStatus = '第一阶段';
    daysUntilDeadline = Math.ceil((phase1End - today) / (1000 * 60 * 60 * 24));
  } else if (today <= phase2End) {
    currentPhase = 2;
    phaseStatus = '第二阶段';
    daysUntilDeadline = Math.ceil((phase2End - today) / (1000 * 60 * 60 * 24));
  } else if (today <= phase3End) {
    currentPhase = 3;
    phaseStatus = '第三阶段';
    daysUntilDeadline = Math.ceil((phase3End - today) / (1000 * 60 * 60 * 24));
  } else {
    currentPhase = 4;
    phaseStatus = '已结束';
    daysUntilDeadline = 0;
  }
  
  // 根据官方激励标准计算激励金额
  const user1 = parseInt(app.firstMonthValidActiveUserNum) || 0;
  const user2 = parseInt(app.secondMonthValidActiveUserNum) || 0;
  const user3 = parseInt(app.thirdMonthValidActiveUserNum) || 0;
  
  const isMature = app.isMatureApp === '是';
  
  let baseReward = 0;      // 基础激励
  let phase1Reward = 0;    // 一阶段激励
  let phase2Reward = 0;    // 二阶段激励
  let totalReward = 0;
  
  // 1. 基础激励：5000元
  if (isMature) {
    // 成熟应用：正式上架即可获得
    baseReward = 5000;
  } else {
    // 新应用：首月有效月活 ≥ 50
    if (user1 >= 50) {
      baseReward = 5000;
    }
  }
  
  // 2. 活跃激励 - 一阶段：3000元
  if (isMature) {
    // 成熟应用：功能和HarmonyOS 4.x版本对齐（暂时假设都对齐）
    // 可以根据实际数据判断
    phase1Reward = 3000;
  } else {
    // 新应用：次月有效月活 ≥ 100
    if (user2 >= 100) {
      phase1Reward = 3000;
    }
  }
  
  // 3. 活跃激励 - 二阶段：2000元
  // 成熟应用/新应用：第三个月有效月活 ≥ 200
  if (user3 >= 200) {
    phase2Reward = 2000;
  }
  
  totalReward = baseReward + phase1Reward + phase2Reward;
  
  // 返回增强后的数据
  return {
    ...app,
    phases: {
      phase1: {
        range: `${formatDate(phase1Start)} ~ ${formatDate(phase1End)}`,
        start: formatDate(phase1Start),
        end: formatDate(phase1End),
        users: user1
      },
      phase2: {
        range: `${formatDate(phase2Start)} ~ ${formatDate(phase2End)}`,
        start: formatDate(phase2Start),
        end: formatDate(phase2End),
        users: user2
      },
      phase3: {
        range: `${formatDate(phase3Start)} ~ ${formatDate(phase3End)}`,
        start: formatDate(phase3Start),
        end: formatDate(phase3End),
        users: user3
      }
    },
    currentPhase,
    phaseStatus,
    daysUntilDeadline,
    totalUsers: user1 + user2 + user3,
    isMature,
    rewards: {
      base: baseReward,
      phase1: phase1Reward,
      phase2: phase2Reward,
      total: totalReward
    },
    estimatedReward: totalReward
  };
}

// 更新侧边栏的API显示
function updateApiDisplay() {
  const apiListElement = document.getElementById('api-request-list');
  if (!apiListElement) return;
  
  // 如果没有应用数据，显示等待状态
  if (appsMap.size === 0) {
    if (apiRequests.length === 0) {
      return;
    } else {
      apiListElement.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">正在解析数据...</p>';
      return;
    }
  }
  
  // 显示应用列表
  const appsArray = Array.from(appsMap.values());
  
  // 计算总激励和统计
  const totalReward = appsArray.reduce((sum, app) => sum + app.estimatedReward, 0);
  const totalUsers = appsArray.reduce((sum, app) => sum + app.totalUsers, 0);
  
  // 统计各阶段应用数量
  const phaseCount = {
    waiting: appsArray.filter(app => app.currentPhase === 0).length,
    phase1: appsArray.filter(app => app.currentPhase === 1).length,
    phase2: appsArray.filter(app => app.currentPhase === 2).length,
    phase3: appsArray.filter(app => app.currentPhase === 3).length,
    ended: appsArray.filter(app => app.currentPhase === 4).length
  };
  
  // 统计达标情况
  const baseCount = appsArray.filter(app => app.rewards.base > 0).length;
  const phase1Count = appsArray.filter(app => app.rewards.phase1 > 0).length;
  const phase2Count = appsArray.filter(app => app.rewards.phase2 > 0).length;
  
  // 计算额外统计数据
  const avgReward = appsMap.size > 0 ? Math.round(totalReward / appsMap.size) : 0;
  const avgUsers = appsMap.size > 0 ? Math.round(totalUsers / appsMap.size) : 0;
  const baseRate = appsMap.size > 0 ? Math.round((baseCount / appsMap.size) * 100) : 0;
  const phase1Rate = appsMap.size > 0 ? Math.round((phase1Count / appsMap.size) * 100) : 0;
  const phase2Rate = appsMap.size > 0 ? Math.round((phase2Count / appsMap.size) * 100) : 0;
  
  let html = `
    <div style="margin-bottom: 16px; background: #fff; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
      <!-- 标题栏 -->
      <div style="padding: 14px 16px; background: linear-gradient(135deg, #ff6b35 0%, #ff8555 100%); color: white;">
        <div style="font-size: 16px; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            ${getIcon('star', 22, 'white')}
            激励计划统计
          </div>
          ${window.__cutOffTime ? `<div style="font-size: 11px; opacity: 0.9;">截止: ${window.__cutOffTime}</div>` : ''}
        </div>
      </div>
      
      <!-- 主要指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border-bottom: 1px solid #e0e0e0;">
        <div style="padding: 16px; text-align: center; border-right: 1px solid #e0e0e0;">
          <div style="font-size: 11px; color: #999; margin-bottom: 6px;">应用总数</div>
          <div style="font-size: 28px; font-weight: bold; color: #1976d2;">${appsMap.size}</div>
          <div style="font-size: 10px; color: #999; margin-top: 4px;">个应用</div>
        </div>
        <div style="padding: 16px; text-align: center; border-right: 1px solid #e0e0e0;">
          <div style="font-size: 11px; color: #999; margin-bottom: 6px;">累计激励</div>
          <div style="font-size: 28px; font-weight: bold; color: #ff6b35;">¥${totalReward.toLocaleString()}</div>
          <div style="font-size: 10px; color: #999; margin-top: 4px;">平均 ¥${avgReward.toLocaleString()}/应用</div>
        </div>
        <div style="padding: 16px; text-align: center;">
          <div style="font-size: 11px; color: #999; margin-bottom: 6px;">总活跃用户</div>
          <div style="font-size: 28px; font-weight: bold; color: #388e3c;">${totalUsers.toLocaleString()}</div>
          <div style="font-size: 10px; color: #999; margin-top: 4px;">平均 ${avgUsers}/应用</div>
        </div>
      </div>
      
      <!-- 达标情况 -->
      <div style="padding: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #333; margin-bottom: 12px;">${getIcon('chart', 16, '#333')} 达标情况</div>
        
        <!-- 基础激励 -->
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 12px; color: #666;">基础激励 (¥5,000)</span>
            <span style="font-size: 12px; font-weight: 600; color: #388e3c;">${baseCount}/${appsMap.size} (${baseRate}%)</span>
          </div>
          <div style="height: 6px; background: #e8f5e9; border-radius: 3px; overflow: hidden;">
            <div style="height: 100%; background: linear-gradient(90deg, #66bb6a, #43a047); width: ${baseRate}%; transition: width 0.3s;"></div>
          </div>
        </div>
        
        <!-- 一阶段激励 -->
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 12px; color: #666;">一阶段激励 (¥3,000)</span>
            <span style="font-size: 12px; font-weight: 600; color: #1976d2;">${phase1Count}/${appsMap.size} (${phase1Rate}%)</span>
          </div>
          <div style="height: 6px; background: #e3f2fd; border-radius: 3px; overflow: hidden;">
            <div style="height: 100%; background: linear-gradient(90deg, #42a5f5, #1976d2); width: ${phase1Rate}%; transition: width 0.3s;"></div>
          </div>
        </div>
        
        <!-- 二阶段激励 -->
        <div style="margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 12px; color: #666;">二阶段激励 (¥2,000)</span>
            <span style="font-size: 12px; font-weight: 600; color: #f57c00;">${phase2Count}/${appsMap.size} (${phase2Rate}%)</span>
          </div>
          <div style="height: 6px; background: #fff3e0; border-radius: 3px; overflow: hidden;">
            <div style="height: 100%; background: linear-gradient(90deg, #ffa726, #f57c00); width: ${phase2Rate}%; transition: width 0.3s;"></div>
          </div>
        </div>
      </div>
      
      <!-- 阶段分布 -->
      <div style="padding: 0 16px 16px 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #333; margin-bottom: 8px;">${getIcon('target', 16, '#333')} 阶段分布</div>
        <div style="display: flex; gap: 6px; font-size: 11px;">
          <div style="flex: ${phaseCount.waiting}; min-width: 40px; padding: 6px 4px; background: #f5f5f5; border-radius: 4px; text-align: center;">
            <div style="color: #999; font-weight: 600;">${phaseCount.waiting}</div>
            <div style="color: #999;">未开始</div>
          </div>
          <div style="flex: ${phaseCount.phase1}; min-width: 40px; padding: 6px 4px; background: #e3f2fd; border-radius: 4px; text-align: center;">
            <div style="color: #1976d2; font-weight: 600;">${phaseCount.phase1}</div>
            <div style="color: #1976d2;">阶段1</div>
          </div>
          <div style="flex: ${phaseCount.phase2}; min-width: 40px; padding: 6px 4px; background: #e8f5e9; border-radius: 4px; text-align: center;">
            <div style="color: #388e3c; font-weight: 600;">${phaseCount.phase2}</div>
            <div style="color: #388e3c;">阶段2</div>
          </div>
          <div style="flex: ${phaseCount.phase3}; min-width: 40px; padding: 6px 4px; background: #fff3e0; border-radius: 4px; text-align: center;">
            <div style="color: #f57c00; font-weight: 600;">${phaseCount.phase3}</div>
            <div style="color: #f57c00;">阶段3</div>
          </div>
          <div style="flex: ${phaseCount.ended}; min-width: 40px; padding: 6px 4px; background: #f5f5f5; border-radius: 4px; text-align: center;">
            <div style="color: #666; font-weight: 600;">${phaseCount.ended}</div>
            <div style="color: #666;">已结束</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加筛选器
  html += `
    <div class="filter-container">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">阶段:</span>
          <select class="filter-select" id="filter-phase">
            <option value="all">全部</option>
            <option value="0">未开始</option>
            <option value="1">第一阶段</option>
            <option value="2">第二阶段</option>
            <option value="3">第三阶段</option>
            <option value="4">已结束</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">类型:</span>
          <select class="filter-select" id="filter-type">
            <option value="all">全部</option>
            <option value="mature">成熟应用</option>
            <option value="new">新应用</option>
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
      </div>
    </div>
  `;
  
  // 添加功能按钮区
  html += `
    <div style="margin-bottom: 16px; display: flex; gap: 8px; justify-content: flex-end;">
      <button id="toggleMaskBtn" class="action-btn" title="切换敏感信息显示">
        ${getIcon(isMasked ? 'eye' : 'eyeOff', 14, '#666')}
        <span>${isMasked ? '显示' : '打码'}</span>
      </button>
      <button id="sharePosterBtn" class="action-btn action-btn-primary" title="生成分享海报">
        ${getIcon('camera', 14, 'white')}
        <span>生成海报</span>
      </button>
    </div>
  `;
  
  // 开始表格
  html += `
    <table class="apps-table">
      <thead>
        <tr>
          <th style="width: 30px;"></th>
          <th style="width: 40px;">#</th>
          <th style="width: 180px;">应用名称</th>
          <th style="width: 70px;">类型</th>
          <th style="width: 100px;">阶段状态</th>
          <th style="width: 90px;">上架日期</th>
          <th style="width: 60px;" title="上架次日起第1-30天">首月<br><span style="font-size: 10px; font-weight: normal; opacity: 0.7;">(1-30天)</span></th>
          <th style="width: 60px;" title="上架次日起第31-60天">次月<br><span style="font-size: 10px; font-weight: normal; opacity: 0.7;">(31-60天)</span></th>
          <th style="width: 60px;" title="上架次日起第61-90天">第三月<br><span style="font-size: 10px; font-weight: normal; opacity: 0.7;">(61-90天)</span></th>
          <th style="width: 60px;">总用户</th>
          <th style="width: 70px;">已获激励</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  html += appsArray.map((app, index) => {
    const statusIcon = app.status === '1' ? getIcon('success') : getIcon('error');
    
    // 阶段状态样式和文本
    let phaseClass = '';
    let phaseText = '';
    let phaseColor = '';
    let phaseBg = '';
    
    switch(app.currentPhase) {
      case 0:
        phaseClass = 'phase-waiting';
        phaseText = '未开始';
        phaseColor = '#999';
        phaseBg = '#f5f5f5';
        break;
      case 1:
        phaseClass = 'phase-1';
        phaseText = '阶段 1';
        phaseColor = '#1976d2';
        phaseBg = '#e3f2fd';
        break;
      case 2:
        phaseClass = 'phase-2';
        phaseText = '阶段 2';
        phaseColor = '#388e3c';
        phaseBg = '#e8f5e9';
        break;
      case 3:
        phaseClass = 'phase-3';
        phaseText = '阶段 3';
        phaseColor = '#f57c00';
        phaseBg = '#fff3e0';
        break;
      case 4:
        phaseClass = 'phase-end';
        phaseText = '已完成';
        phaseColor = '#666';
        phaseBg = '#f5f5f5';
        break;
    }
    
    return `
      <tr class="app-row" data-app-id="${app.appId}" data-phase="${app.currentPhase}" data-type="${app.isMature ? 'mature' : 'new'}" data-reward="${app.estimatedReward > 0 ? 'has' : 'none'}">
        <td style="text-align: center;">
          <span class="expand-icon" data-app-id="${app.appId}">${getIcon('chevronRight', 14, '#999')}</span>
        </td>
        <td style="text-align: center; font-weight: 500; color: #999;">${index + 1}</td>
        <td class="app-name-cell">
          ${isMasked ? '*'.repeat(Math.min(app.appName.length, 8)) : app.appName} ${statusIcon}
        </td>
        <td style="text-align: center;">
          <span style="color: ${app.isMature ? '#1976d2' : '#f57c00'}; font-size: 11px; font-weight: 500;">
            ${app.isMature ? getIcon('starSmall', 12, '#1976d2') + '成熟' : getIcon('location', 12, '#f57c00') + '新应用'}
          </span>
        </td>
        <td style="padding: 6px 8px;">
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
            <div class="phase-badge ${phaseClass}" style="background: ${phaseBg}; color: ${phaseColor}; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap; border: 1px solid ${phaseColor}33;">
              ${phaseText}
            </div>
            ${app.daysUntilDeadline > 0 ? `
              <div style="font-size: 10px; color: ${phaseColor}; font-weight: 500; white-space: nowrap;">
                剩 ${app.daysUntilDeadline} 天
              </div>
            ` : ''}
          </div>
        </td>
        <td style="font-size: 11px;">${app.firstOnShelfDate}</td>
        <td class="number-cell">${app.phases.phase1.users}</td>
        <td class="number-cell">${app.phases.phase2.users}</td>
        <td class="number-cell">${app.phases.phase3.users}</td>
        <td class="number-cell" style="color: #ff6b35; font-weight: 600;">${app.totalUsers}</td>
        <td class="reward-cell">¥${app.estimatedReward}</td>
      </tr>
      <tr class="detail-row" id="detail-${app.appId}">
        <td colspan="11" class="detail-cell">
          <div class="detail-content">
            <div class="detail-section">
              <div class="detail-section-title">${getIcon('calendar', 14, '#1976d2')} 阶段时间表 <span style="font-size: 10px; font-weight: normal; opacity: 0.7;">(从上架次日开始计算)</span></div>
              <div class="detail-grid">
                <div class="detail-item" style="background: #e3f2fd; border-color: #2196f3;">
                  <div class="detail-item-label">首月 (上架次日起1-30天)</div>
                  <div class="detail-item-value">${app.phases.phase1.range}</div>
                  <div style="font-size: 10px; color: #666; margin-top: 2px;">有效月活: ${app.phases.phase1.users}</div>
                </div>
                <div class="detail-item" style="background: #e8f5e9; border-color: #4caf50;">
                  <div class="detail-item-label">次月 (上架次日起31-60天)</div>
                  <div class="detail-item-value">${app.phases.phase2.range}</div>
                  <div style="font-size: 10px; color: #666; margin-top: 2px;">有效月活: ${app.phases.phase2.users}</div>
                </div>
                <div class="detail-item" style="background: #fff3e0; border-color: #ff9800;">
                  <div class="detail-item-label">第三月 (上架次日起61-90天)</div>
                  <div class="detail-item-value">${app.phases.phase3.range}</div>
                  <div style="font-size: 10px; color: #666; margin-top: 2px;">有效月活: ${app.phases.phase3.users}</div>
                </div>
              </div>
              <div style="font-size: 10px; color: #999; margin-top: 8px; padding: 6px; background: #f5f5f5; border-radius: 4px;">
                ${getIcon('info', 12, '#2196f3')} 说明：有效月活指HarmonyOS 5.0及之后系统的去重活跃设备数
              </div>
            </div>
            
            <div class="detail-section">
              <div class="detail-section-title">${getIcon('money', 14, '#ff6b35')} 激励明细</div>
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-item-label">基础激励</div>
                  <div class="detail-item-value" style="color: ${app.rewards.base > 0 ? '#4caf50' : '#999'};">
                    ${app.rewards.base > 0 ? getIcon('check', 12, '#4caf50') + ' ¥' + app.rewards.base : getIcon('cross', 12, '#999') + ' ¥0'}
                    ${!app.isMature && app.rewards.base === 0 ? `<br><span style="font-size: 10px; color: #ff9800;">需要首月≥50</span>` : ''}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-item-label">一阶段激励</div>
                  <div class="detail-item-value" style="color: ${app.rewards.phase1 > 0 ? '#4caf50' : '#999'};">
                    ${app.rewards.phase1 > 0 ? getIcon('check', 12, '#4caf50') + ' ¥' + app.rewards.phase1 : getIcon('cross', 12, '#999') + ' ¥0'}
                    ${!app.isMature && app.rewards.phase1 === 0 ? `<br><span style="font-size: 10px; color: #ff9800;">需要次月≥100</span>` : ''}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-item-label">二阶段激励</div>
                  <div class="detail-item-value" style="color: ${app.rewards.phase2 > 0 ? '#4caf50' : '#999'};">
                    ${app.rewards.phase2 > 0 ? getIcon('check', 12, '#4caf50') + ' ¥' + app.rewards.phase2 : getIcon('cross', 12, '#999') + ' ¥0'}
                    ${app.rewards.phase2 === 0 ? `<br><span style="font-size: 10px; color: #ff9800;">需要第三月≥200</span>` : ''}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <div class="detail-section-title">${getIcon('key', 14, '#666')} AppID</div>
              <div style="font-size: 11px; font-family: monospace; color: #666; word-break: break-all;">${isMasked ? maskText(app.appId, 4) : app.appId}</div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  // 关闭表格
  html += `
      </tbody>
    </table>
  `;
  
  apiListElement.innerHTML = html;
  
  // 重新绑定点击事件
  attachAppClickEvents();
  
  // 绑定筛选事件
  attachFilterEvents();
  
  // 绑定功能按钮事件
  attachActionButtonEvents();
  
  // 恢复展开状态
  restoreExpandedState();
}

// 恢复展开状态
function restoreExpandedState() {
  expandedAppIds.forEach(appId => {
    const detailRow = document.getElementById(`detail-${appId}`);
    const appRow = document.querySelector(`.app-row[data-app-id="${appId}"]`);
    const expandIcon = appRow?.querySelector('.expand-icon');
    
    if (detailRow && appRow) {
      detailRow.classList.add('show');
      if (expandIcon) {
        // 展开状态：显示向下箭头（高亮）
        expandIcon.innerHTML = getIcon('chevronDown', 14, '#ff6b35');
      }
    }
  });
}

// 打码函数
function maskText(text, showLength = 3) {
  if (!text || text.length <= showLength * 2) {
    return '*'.repeat(text.length);
  }
  return text.substring(0, showLength) + '*'.repeat(text.length - showLength * 2) + text.substring(text.length - showLength);
}

// 切换打码状态
function toggleMask() {
  isMasked = !isMasked;
  updateApiDisplay(); // 重新渲染
}

// 生成海报
async function generatePoster() {
  const btn = document.getElementById('sharePosterBtn');
  if (!btn) return;
  
  const originalText = btn.innerHTML;
  btn.innerHTML = `${getIcon('info', 14, 'white')} <span>生成中...</span>`;
  btn.disabled = true;
  
  try {
    // 确保 html2canvas 已定义
    if (typeof html2canvas === 'undefined') {
      throw new Error('html2canvas 未加载，请重新加载插件');
    }
    
    // 创建临时海报容器（不显示在界面上）
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: fixed;
      top: -10000px;
      left: -10000px;
      width: 600px;
      background: white;
      padding: 30px;
      border-radius: 16px;
    `;
    
    // 获取统计数据
    const appsArray = Array.from(appsMap.values());
    const totalReward = appsArray.reduce((sum, app) => sum + app.estimatedReward, 0);
    const totalUsers = appsArray.reduce((sum, app) => sum + app.totalUsers, 0);
    const baseCount = appsArray.filter(app => app.rewards.base > 0).length;
    const phase1Count = appsArray.filter(app => app.rewards.phase1 > 0).length;
    const phase2Count = appsArray.filter(app => app.rewards.phase2 > 0).length;
    
    tempContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 28px; font-weight: bold; color: #ff6b35; margin-bottom: 8px;">
          鸿蒙激励计划小助手 <span style="font-size: 16px; opacity: 0.7;">${AppConfig.version}</span>
        </div>
        <div style="font-size: 14px; color: #999;">数据统计报告</div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
        <div style="background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%); padding: 20px; border-radius: 12px; text-align: center; color: white;">
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">应用总数</div>
          <div style="font-size: 36px; font-weight: bold;">${appsMap.size}</div>
        </div>
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; text-align: center; color: white;">
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">累计激励</div>
          <div style="font-size: 36px; font-weight: bold;"><span style="font-size: 24px;">¥</span>${totalReward.toLocaleString()}</div>
        </div>
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 12px; text-align: center; color: white;">
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">总用户数</div>
          <div style="font-size: 36px; font-weight: bold;">${totalUsers.toLocaleString()}</div>
        </div>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#f57c00" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="6" fill="#f57c00"/>
            <circle cx="12" cy="12" r="2" fill="white"/>
          </svg>
          <span>达标情况</span>
        </div>
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #4caf50;">${baseCount}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">基础激励</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #1976d2;">${phase1Count}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">一阶段</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #f57c00;">${phase2Count}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">二阶段</div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; padding: 16px; border-top: 2px dashed #e0e0e0;">
        <div style="font-size: 12px; color: #999;">生成时间: ${new Date().toLocaleString('zh-CN')}</div>
      </div>
    `;
    
    document.body.appendChild(tempContainer);
    
    // 使用 html2canvas 生成图片
    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      width: tempContainer.offsetWidth,
      height: tempContainer.offsetHeight
    });
    
    // 移除临时容器
    tempContainer.remove();
    
    // 将canvas转换为图片URL
    const imageUrl = canvas.toDataURL('image/png');
    
    // 创建显示图片的弹窗
    const posterContainer = document.createElement('div');
    posterContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(5px);
    `;
    
    posterContainer.innerHTML = `
      <div style="max-width: 90%; max-height: 90vh; display: flex; flex-direction: column; align-items: center; gap: 20px;">
        <!-- 海报图片 -->
        <div style="background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); overflow: hidden; max-height: calc(90vh - 100px);">
          <img src="${imageUrl}" alt="分享海报" style="display: block; max-width: 100%; height: auto; max-height: calc(90vh - 100px);">
        </div>
        
        <!-- 操作按钮 -->
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="downloadPosterBtn" style="padding: 14px 36px; background: white; color: #667eea; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3V16M12 16L7 11M12 16L17 11" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 19V17" stroke="#667eea" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>下载海报</span>
          </button>
          <button id="closePosterBtn" style="padding: 14px 36px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>关闭</span>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(posterContainer);
    
    // 绑定关闭按钮
    document.getElementById('closePosterBtn').addEventListener('click', () => {
      posterContainer.remove();
    });
    
    // 绑定下载按钮
    document.getElementById('downloadPosterBtn').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `鸿蒙激励计划_${new Date().getTime()}.png`;
      link.href = imageUrl;
      link.click();
    });
    
  } catch (error) {
    console.error('生成海报失败:', error);
    alert('生成海报失败：' + error.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// 绑定功能按钮事件
function attachActionButtonEvents() {
  const maskBtn = document.getElementById('toggleMaskBtn');
  const posterBtn = document.getElementById('sharePosterBtn');
  
  if (maskBtn) {
    maskBtn.addEventListener('click', toggleMask);
  }
  
  if (posterBtn) {
    posterBtn.addEventListener('click', generatePoster);
  }
}

// 为应用项绑定点击事件
function attachAppClickEvents() {
  const appRows = document.querySelectorAll('.app-row');
  appRows.forEach(row => {
    row.addEventListener('click', function(e) {
      const appId = this.getAttribute('data-app-id');
      const detailRow = document.getElementById(`detail-${appId}`);
      const expandIcon = this.querySelector('.expand-icon');
      
      if (detailRow) {
        const isExpanded = detailRow.classList.contains('show');
        detailRow.classList.toggle('show');
        
        // 更新展开状态记录
        if (isExpanded) {
          expandedAppIds.delete(appId);
        } else {
          expandedAppIds.add(appId);
        }
        
        // 更新箭头图标和样式
        if (expandIcon) {
          if (isExpanded) {
            // 折叠后：显示向右箭头
            expandIcon.innerHTML = getIcon('chevronRight', 14, '#999');
          } else {
            // 展开后：显示向下箭头（高亮）
            expandIcon.innerHTML = getIcon('chevronDown', 14, '#ff6b35');
          }
        }
      }
    });
  });
}

// 为筛选器绑定事件
function attachFilterEvents() {
  const phaseFilter = document.getElementById('filter-phase');
  const typeFilter = document.getElementById('filter-type');
  const rewardFilter = document.getElementById('filter-reward');
  
  if (!phaseFilter || !typeFilter || !rewardFilter) return;
  
  function filterApps() {
    const phaseValue = phaseFilter.value;
    const typeValue = typeFilter.value;
    const rewardValue = rewardFilter.value;
    
    const appRows = document.querySelectorAll('.app-row');
    const detailRows = document.querySelectorAll('.detail-row');
    
    appRows.forEach((row, index) => {
      const phase = row.getAttribute('data-phase');
      const type = row.getAttribute('data-type');
      const reward = row.getAttribute('data-reward');
      
      let show = true;
      
      if (phaseValue !== 'all' && phase !== phaseValue) {
        show = false;
      }
      
      if (typeValue !== 'all' && type !== typeValue) {
        show = false;
      }
      
      if (rewardValue !== 'all' && reward !== rewardValue) {
        show = false;
      }
      
      row.style.display = show ? '' : 'none';
      // 隐藏对应的详情行
      detailRows[index].style.display = 'none';
      detailRows[index].classList.remove('show');
    });
  }
  
  phaseFilter.addEventListener('change', filterApps);
  typeFilter.addEventListener('change', filterApps);
  rewardFilter.addEventListener('change', filterApps);
}

// 截断URL显示
function truncateUrl(url) {
  if (typeof url !== 'string') return String(url);
  const maxLength = 50;
  if (url.length > maxLength) {
    return url.substring(0, maxLength) + '...';
  }
  return url;
}

// ========== 侧边栏UI ==========
// 创建侧边栏元素
function createSidebar() {
  // 检查是否已经存在侧边栏
  if (document.getElementById('my-extension-sidebar')) {
    return;
  }

  // 创建侧边栏容器
  const sidebar = document.createElement('div');
  sidebar.id = 'my-extension-sidebar';
  sidebar.className = 'my-sidebar';

  // 创建标题
  const title = document.createElement('div');
  title.className = 'sidebar-title';
  const logoUrl = chrome.runtime.getURL('images/logo.png');
  title.innerHTML = `
    <div class="sidebar-title-left">
      <img src="${logoUrl}" alt="Logo" class="sidebar-logo" />
      <span>鸿蒙激励计划小助手</span>
      <span class="sidebar-title-version">${AppConfig.version}</span>
    </div>
    <div class="sidebar-title-right">
      <button class="sidebar-title-community" id="community-btn-content">
        ${getIcon('users', 16, 'white')}
        <span>进群</span>
      </button>
      <a href="${AppConfig.githubUrl}" target="_blank" class="sidebar-title-github">
        ${getIcon('github', 16, 'white')}
        <span>开源</span>
      </a>
      <button class="sidebar-close" id="sidebar-close-btn-content">×</button>
    </div>
  `;

  // 创建内容区域
  const content = document.createElement('div');
  content.className = 'sidebar-content';
  
  // 添加应用列表
  const info = document.createElement('div');
  info.innerHTML = `
    <div class="api-monitor">
      <div id="api-request-list" class="api-list">
        <p style="text-align: center; color: #999; padding: 20px;">
          等待数据加载...<br>
          <span style="font-size: 11px;">刷新页面或切换分页</span>
        </p>
      </div>
    </div>
  `;
  
  content.appendChild(info);

  // 创建打开按钮（当侧边栏关闭时显示）
  const openBtn = document.createElement('button');
  openBtn.className = 'sidebar-open';
  openBtn.innerHTML = getIcon('sidebarOpen');
  openBtn.onclick = function() {
    sidebar.style.right = '0';
  };

  // 组装侧边栏
  sidebar.appendChild(title);
  sidebar.appendChild(content);
  
  // 绑定关闭按钮事件
  setTimeout(() => {
    const closeBtn = document.getElementById('sidebar-close-btn-content');
    if (closeBtn) {
      closeBtn.onclick = function() {
        sidebar.style.right = '-920px';
      };
    }
    
    // 绑定进群按钮事件
    const communityBtn = document.getElementById('community-btn-content');
    if (communityBtn) {
      communityBtn.onclick = function() {
        showCommunityModal();
      };
    }
    
    // 绑定底部社区按钮事件
    const footerCommunityBtn = document.getElementById('footer-community-btn');
    if (footerCommunityBtn) {
      footerCommunityBtn.onclick = function() {
        showCommunityModal();
      };
    }
  }, 0);
  
  // 显示社群弹窗
  function showCommunityModal() {
    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'community-modal';
    modal.innerHTML = `
      <div class="community-modal-content">
        <button class="community-modal-close">×</button>
        <div class="community-modal-title">社群交流</div>
        <div class="community-qrcode">
          <img src="${AppConfig.community.qrCodeUrl}" alt="群二维码">
        </div>
      </div>
    `;
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 绑定关闭事件
    modal.querySelector('.community-modal-close').onclick = function() {
      modal.remove();
    };
    
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    };
  }
  
  // 添加到页面
  document.body.appendChild(sidebar);
  document.body.appendChild(openBtn);
}

// 页面加载完成后创建侧边栏
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createSidebar);
} else {
  createSidebar();
}

