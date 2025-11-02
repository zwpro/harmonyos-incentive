// ========== 数据处理模块 ==========

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
        const enrichedApp = enrichAppData(app);
        AppState.addApp(enrichedApp);
      }
    });
    
    // 提取截止时间
    if (firstResult.cutOffTime) {
      AppState.cutOffTime = firstResult.cutOffTime;
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
  const phases = calculatePhases(startDate, app);
  
  // 判断当前在哪个阶段
  const phaseInfo = getCurrentPhase(today, phases);
  
  // 计算激励金额
  const rewards = calculateRewards(app);
  
  // 统一应用类型显示：小游戏 -> 游戏
  const normalizedAppType = app.appType === '小游戏' ? '游戏' : app.appType;
  
  return {
    ...app,
    appType: normalizedAppType,
    phases,
    ...phaseInfo,
    isMature: app.isMatureApp === '是',
    totalUsers: (parseInt(app.firstMonthValidActiveUserNum) || 0) +
                (parseInt(app.secondMonthValidActiveUserNum) || 0) +
                (parseInt(app.thirdMonthValidActiveUserNum) || 0),
    rewards,
    estimatedReward: rewards.total
  };
}

// 计算三个阶段的时间范围
function calculatePhases(startDate, app) {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const phase1Start = new Date(startDate);
  const phase1End = new Date(startDate);
  phase1End.setDate(phase1End.getDate() + 29);
  
  const phase2Start = new Date(startDate);
  phase2Start.setDate(phase2Start.getDate() + 30);
  const phase2End = new Date(startDate);
  phase2End.setDate(phase2End.getDate() + 59);
  
  const phase3Start = new Date(startDate);
  phase3Start.setDate(phase3Start.getDate() + 60);
  const phase3End = new Date(startDate);
  phase3End.setDate(phase3End.getDate() + 89);
  
  return {
    phase1: {
      range: `${formatDate(phase1Start)} ~ ${formatDate(phase1End)}`,
      start: formatDate(phase1Start),
      end: formatDate(phase1End),
      startDate: phase1Start,
      endDate: phase1End,
      users: parseInt(app.firstMonthValidActiveUserNum) || 0
    },
    phase2: {
      range: `${formatDate(phase2Start)} ~ ${formatDate(phase2End)}`,
      start: formatDate(phase2Start),
      end: formatDate(phase2End),
      startDate: phase2Start,
      endDate: phase2End,
      users: parseInt(app.secondMonthValidActiveUserNum) || 0
    },
    phase3: {
      range: `${formatDate(phase3Start)} ~ ${formatDate(phase3End)}`,
      start: formatDate(phase3Start),
      end: formatDate(phase3End),
      startDate: phase3Start,
      endDate: phase3End,
      users: parseInt(app.thirdMonthValidActiveUserNum) || 0
    }
  };
}

// 获取当前阶段信息
function getCurrentPhase(today, phases) {
  let currentPhase = 0;
  let daysUntilDeadline = 0;
  let phaseStatus = '未开始';
  
  if (today < phases.phase1.startDate) {
    currentPhase = 0;
    phaseStatus = '未开始';
    daysUntilDeadline = Math.ceil((phases.phase1.startDate - today) / (1000 * 60 * 60 * 24));
  } else if (today <= phases.phase1.endDate) {
    currentPhase = 1;
    phaseStatus = '第一阶段';
    daysUntilDeadline = Math.ceil((phases.phase1.endDate - today) / (1000 * 60 * 60 * 24));
  } else if (today <= phases.phase2.endDate) {
    currentPhase = 2;
    phaseStatus = '第二阶段';
    daysUntilDeadline = Math.ceil((phases.phase2.endDate - today) / (1000 * 60 * 60 * 24));
  } else if (today <= phases.phase3.endDate) {
    currentPhase = 3;
    phaseStatus = '第三阶段';
    daysUntilDeadline = Math.ceil((phases.phase3.endDate - today) / (1000 * 60 * 60 * 24));
  } else {
    currentPhase = 4;
    phaseStatus = '已结束';
    daysUntilDeadline = 0;
  }
  
  return { currentPhase, phaseStatus, daysUntilDeadline };
}

// 计算激励金额
function calculateRewards(app) {
  const user1 = parseInt(app.firstMonthValidActiveUserNum) || 0;
  const user2 = parseInt(app.secondMonthValidActiveUserNum) || 0;
  const user3 = parseInt(app.thirdMonthValidActiveUserNum) || 0;
  const isMature = app.isMatureApp === '是';
  const isGame = app.appType === '小游戏';
  
  let baseReward = 0;
  let phase1Reward = 0;
  let phase2Reward = 0;
  
  if (isGame) {
    // 游戏激励规则
    // 基础激励：1200元（首月≥50）
    if (user1 >= 50) {
      baseReward = 1200;
    }
    
    // 活跃激励：800元（次月≥100）
    if (user2 >= 100) {
      phase1Reward = 800;
    }
    
    // 游戏没有二阶段激励
    phase2Reward = 0;
  } else {
    // 应用激励规则
    // 基础激励：5000元
    if (isMature) {
      baseReward = 5000;
    } else if (user1 >= 50) {
      baseReward = 5000;
    }
    
    // 一阶段激励：3000元
    if (isMature) {
      phase1Reward = 3000;
    } else if (user2 >= 100) {
      phase1Reward = 3000;
    }
    
    // 二阶段激励：2000元
    if (user3 >= 200) {
      phase2Reward = 2000;
    }
  }
  
  return {
    base: baseReward,
    phase1: phase1Reward,
    phase2: phase2Reward,
    total: baseReward + phase1Reward + phase2Reward
  };
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.DataProcessor = {
    extractAppsFromResponse,
    enrichAppData,
    calculatePhases,
    getCurrentPhase,
    calculateRewards
  };
}

