// ========== 事件处理模块 ==========

const EventHandlers = {
  // 绑定所有事件
  attachAll() {
    this.attachAppRowEvents();
    this.attachFilterEvents();
    this.attachActionButtonEvents();
    this.attachCommunityButtonEvents();
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
      }
    });
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.EventHandlers = EventHandlers;
}

