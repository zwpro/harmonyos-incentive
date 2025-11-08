// ========== 事件处理模块 ==========

const EventHandlers = {
  // 绑定所有事件
  attachAll() {
    this.attachAppRowEvents();
    this.attachFilterEvents();
    this.attachActionButtonEvents();
    this.attachCommunityButtonEvents();
    this.attachMeritButtonEvents();
    this.restoreExpandedState();
  },
  
  // 绑定应用行点击事件
  attachAppRowEvents() {
    const appRows = document.querySelectorAll('.app-row');
    appRows.forEach(row => {
      row.addEventListener('click', (e) => {
        const appId = row.getAttribute('data-app-id');
        const detailRow = document.getElementById(`detail-${appId}`);
        const expandIcon = row.querySelector('.expand-icon');
        
        if (detailRow) {
          const isExpanding = AppState.toggleExpanded(appId);
          detailRow.classList.toggle('show');
          
          // 更新箭头图标
          if (expandIcon) {
            expandIcon.innerHTML = isExpanding 
              ? getIcon('chevronUp', 14, '#ff6b35')
              : getIcon('chevronRight', 14, '#999');
          }
          
          // 如果是展开状态，渲染图表
          if (isExpanding && typeof AppRowRenderer !== 'undefined' && AppRowRenderer.renderChart) {
            // 延迟一点时间以确保DOM已完全渲染
            setTimeout(() => {
              AppRowRenderer.renderChart(appId);
            }, 100);
          }
        }
      });
    });
  },
  
  // 绑定筛选器事件
  attachFilterEvents() {
    const phaseFilter = document.getElementById('filter-phase');
    const typeFilter = document.getElementById('filter-type');
    const rewardFilter = document.getElementById('filter-reward');
    const statusFilter = document.getElementById('filter-status');
    
    if (!phaseFilter || !typeFilter || !rewardFilter || !statusFilter) return;
    
    const filterApps = () => {
      const phaseValue = phaseFilter.value;
      const typeValue = typeFilter.value;
      const rewardValue = rewardFilter.value;
      const statusValue = statusFilter.value;
      
      const appRows = document.querySelectorAll('.app-row');
      const detailRows = document.querySelectorAll('.detail-row');
      
      appRows.forEach((row, index) => {
        const phase = row.getAttribute('data-phase');
        const type = row.getAttribute('data-type');
        const reward = row.getAttribute('data-reward');
        const status = row.getAttribute('data-status');
        
        let show = true;
        
        if (phaseValue !== 'all' && phase !== phaseValue) show = false;
        if (typeValue !== 'all' && type !== typeValue) show = false;
        if (rewardValue !== 'all' && reward !== rewardValue) show = false;
        if (statusValue !== 'all' && status !== statusValue) show = false;
        
        row.style.display = show ? '' : 'none';
        detailRows[index].style.display = 'none';
        detailRows[index].classList.remove('show');
      });
    };
    
    phaseFilter.addEventListener('change', filterApps);
    typeFilter.addEventListener('change', filterApps);
    rewardFilter.addEventListener('change', filterApps);
    statusFilter.addEventListener('change', filterApps);
  },
  
  // 绑定功能按钮事件
  attachActionButtonEvents() {
    const maskBtn = document.getElementById('toggleMaskBtn');
    const posterBtn = document.getElementById('sharePosterBtn');
    
    if (maskBtn) {
      maskBtn.addEventListener('click', () => {
        AppState.toggleMask();
        App.render();
      });
    }
    
    if (posterBtn) {
      posterBtn.addEventListener('click', () => {
        PosterGenerator.generate();
      });
    }
  },
  
  // 绑定社区按钮事件
  attachCommunityButtonEvents() {
    const footerCommunityBtn = document.getElementById('footer-community-btn');
    
    if (footerCommunityBtn) {
      footerCommunityBtn.addEventListener('click', () => {
        App.showCommunityModal();
      });
    }
  },
  
  // 绑定功德按钮事件
  attachMeritButtonEvents() {
    const meritBtn = document.getElementById('hongmeng-merit-btn');
    
    if (meritBtn) {
      meritBtn.addEventListener('click', (event) => {
        this.incrementMerit(event);
      });
    }
  },
  
  // 增加功德
  incrementMerit(event) {
    // 读取当前功德数据
    const savedData = localStorage.getItem('hongmeng_merit_data');
    let data = {
      totalCount: 0,
      todayCount: 0,
      lastDate: new Date().toDateString()
    };
    
    if (savedData) {
      data = JSON.parse(savedData);
      // 检查日期，如果是新的一天则重置今日计数
      if (data.lastDate !== new Date().toDateString()) {
        data.todayCount = 0;
        data.lastDate = new Date().toDateString();
      }
    }
    
    // 增加计数
    data.totalCount += 1;
    data.todayCount += 1;
    
    // 保存数据
    localStorage.setItem('hongmeng_merit_data', JSON.stringify(data));
    
    // 更新显示
    const totalCountElement = document.getElementById('merit-total-count');
    const todayCountElement = document.getElementById('merit-today-count');
    
    if (totalCountElement) {
      totalCountElement.textContent = data.totalCount;
      // 添加动画效果
      totalCountElement.classList.add('merit-count-pulse');
      setTimeout(() => totalCountElement.classList.remove('merit-count-pulse'), 300);
    }
    
    if (todayCountElement) {
      todayCountElement.textContent = data.todayCount;
      // 添加动画效果
      todayCountElement.classList.add('merit-count-pulse');
      setTimeout(() => todayCountElement.classList.remove('merit-count-pulse'), 300);
    }
    
    // 棒子敲击动画
    this.animateBangzi();
    
    // 创建涟漪效果
    this.createMeritRipple(event);
    
    // 创建浮动文字
    this.createMeritFloatingText(event);
    
    // 播放音效
    this.playMeritSound();
  },
  
  // 棒子敲击动画
  animateBangzi() {
    const bangzi = document.getElementById('merit-bangzi');
    if (bangzi) {
      bangzi.classList.add('merit-bangzi-hit');
      setTimeout(() => {
        bangzi.classList.remove('merit-bangzi-hit');
      }, 300);
    }
  },
  
  // 创建涟漪效果
  createMeritRipple(event) {
    const ripple = document.createElement('div');
    ripple.className = 'merit-ripple';
    
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    btn.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  },
  
  // 创建浮动文字
  createMeritFloatingText(event) {
    const texts = ['功德+1', '🙏', '✨', '善哉', '🪷'];
    const text = document.createElement('div');
    text.className = 'merit-floating-text';
    text.textContent = texts[Math.floor(Math.random() * texts.length)];
    
    const x = event.clientX + (Math.random() - 0.5) * 60;
    const y = event.clientY - 20;
    
    text.style.left = x + 'px';
    text.style.top = y + 'px';
    
    document.body.appendChild(text);
    
    setTimeout(() => text.remove(), 1000);
  },
  
  // 播放音效
  playMeritSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // 静默失败
    }
  },
  
  // 恢复展开状态
  restoreExpandedState() {
    AppState.expandedAppIds.forEach(appId => {
      const detailRow = document.getElementById(`detail-${appId}`);
      const appRow = document.querySelector(`.app-row[data-app-id="${appId}"]`);
      const expandIcon = appRow?.querySelector('.expand-icon');
      
      if (detailRow && appRow) {
        detailRow.classList.add('show');
        if (expandIcon) {
          expandIcon.innerHTML = getIcon('chevronUp', 14, '#ff6b35');
        }
        
        // 渲染图表
        if (typeof AppRowRenderer !== 'undefined' && AppRowRenderer.renderChart) {
          setTimeout(() => {
            AppRowRenderer.renderChart(appId);
          }, 100);
        }
      }
    });
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.EventHandlers = EventHandlers;
}

