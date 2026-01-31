// ========== 事件处理模块 ==========

const EventHandlers = {
  // 排序状态: 'none' | 'asc' | 'desc'
  currentSortColumn: null,
  currentSortOrder: 'none',
  
  // 绑定所有事件
  attachAll() {
    this.attachAppRowEvents();
    this.attachFilterEvents();
    this.attachSortEvents();
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
    const nameFilter = document.getElementById('filter-name');
    const phaseFilter = document.getElementById('filter-phase');
    const typeFilter = document.getElementById('filter-type');
    const rewardFilter = document.getElementById('filter-reward');
    const statusFilter = document.getElementById('filter-status');
    
    if (!phaseFilter || !typeFilter || !rewardFilter || !statusFilter) return;
    
    const filterApps = () => {
      const nameValue = nameFilter ? nameFilter.value.trim().toLowerCase() : '';
      const phaseValue = phaseFilter.value;
      const typeValue = typeFilter.value;
      const rewardValue = rewardFilter.value;
      const statusValue = statusFilter.value;
      
      const appRows = document.querySelectorAll('.app-row');
      const detailRows = document.querySelectorAll('.detail-row');
      
      appRows.forEach((row, index) => {
        const name = (row.getAttribute('data-name') || '').toLowerCase();
        const phase = row.getAttribute('data-phase');
        const type = row.getAttribute('data-type');
        const reward = row.getAttribute('data-reward');
        const status = row.getAttribute('data-status');
        
        let show = true;
        
        // 名称搜索筛选
        if (nameValue && !name.includes(nameValue)) show = false;
        if (phaseValue !== 'all' && phase !== phaseValue) show = false;
        if (typeValue !== 'all' && type !== typeValue) show = false;
        if (rewardValue !== 'all' && reward !== rewardValue) show = false;
        if (statusValue !== 'all' && status !== statusValue) show = false;
        
        row.style.display = show ? '' : 'none';
        detailRows[index].style.display = 'none';
        detailRows[index].classList.remove('show');
      });
    };
    
    // 名称搜索支持实时输入筛选
    if (nameFilter) {
      nameFilter.addEventListener('input', filterApps);
    }
    phaseFilter.addEventListener('change', filterApps);
    typeFilter.addEventListener('change', filterApps);
    rewardFilter.addEventListener('change', filterApps);
    statusFilter.addEventListener('change', filterApps);
  },
  
  // 绑定排序事件
  attachSortEvents() {
    const sortColumns = [
      { id: 'sort-name', dataAttr: 'data-name', type: 'string' },
      { id: 'sort-date', dataAttr: 'data-date', type: 'date' },
      { id: 'sort-yesterday', dataAttr: 'data-yesterday', type: 'number' },
      { id: 'sort-phase1', dataAttr: 'data-phase1', type: 'number' },
      { id: 'sort-phase2', dataAttr: 'data-phase2', type: 'number' },
      { id: 'sort-phase3', dataAttr: 'data-phase3', type: 'number' }
    ];
    
    sortColumns.forEach(col => {
      const sortBtn = document.getElementById(col.id);
      if (!sortBtn) return;
      
      sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.handleSort(col.id, col.dataAttr, col.type);
      });
    });
  },
  
  // 处理排序
  handleSort(columnId, dataAttr, type) {
    // 重置其他列的排序图标
    const allIcons = document.querySelectorAll('.sort-icon');
    allIcons.forEach(icon => {
      if (icon.id !== `${columnId}-icon`) {
        icon.textContent = '↕';
      }
    });
    
    const sortIcon = document.getElementById(`${columnId}-icon`);
    
    // 切换排序状态
    if (this.currentSortColumn !== columnId || this.currentSortOrder === 'desc') {
      this.currentSortOrder = 'asc';
      if (sortIcon) sortIcon.textContent = '↑';
    } else {
      this.currentSortOrder = 'desc';
      if (sortIcon) sortIcon.textContent = '↓';
    }
    
    this.currentSortColumn = columnId;
    this.sortTable(dataAttr, type);
  },
  
  // 排序表格
  sortTable(dataAttr, type) {
    const tbody = document.querySelector('.apps-table tbody');
    if (!tbody) return;
    
    const appRows = Array.from(document.querySelectorAll('.app-row'));
    const detailRows = Array.from(document.querySelectorAll('.detail-row'));
    
    // 根据dataAttr确定列索引
    const colIndexMap = {
      'data-name': 2,       // 应用名称是第3列(索引2)
      'data-date': 5,       // 上架日期是第6列(索引5)
      'data-yesterday': 6,  // 昨天新增是第7列(索引6)
      'data-phase1': 7,     // 首月是第8列(索引7)
      'data-phase2': 8,     // 次月是第9列(索引8)
      'data-phase3': 9      // 第三月是第10列(索引9)
    };
    const colIndex = colIndexMap[dataAttr];
    
    // 创建行对数组
    const rowPairs = appRows.map((appRow, index) => {
      // 通过列索引获取单元格
      const cells = appRow.querySelectorAll('td');
      const cell = cells[colIndex];
      
      let value;
      if (dataAttr === 'data-yesterday') {
        // 昨日新增：从显示文本解析，因为数据是异步加载的
        const text = cell ? cell.textContent.trim() : '';
        if (text === '-' || text === '加载中...') {
          value = '-9999';
        } else if (text === '0') {
          value = '0';
        } else {
          // 移除 + 号，解析数字
          value = text.replace('+', '');
        }
      } else if (dataAttr === 'data-name') {
        // 应用名称：从 tr 的 data-name 属性获取
        value = appRow.getAttribute('data-name') || '';
      } else {
        // 其他列：从 data 属性获取
        value = cell ? cell.getAttribute(dataAttr) : '';
      }
      
      return {
        appRow,
        detailRow: detailRows[index],
        value
      };
    });
    
    // 排序
    rowPairs.sort((a, b) => {
      let valA, valB;
      
      if (type === 'date') {
        valA = this.parseDate(a.value);
        valB = this.parseDate(b.value);
        return this.currentSortOrder === 'asc' ? valA - valB : valB - valA;
      } else if (type === 'string') {
        // 字符串类型：使用 localeCompare 进行中文排序
        valA = a.value || '';
        valB = b.value || '';
        return this.currentSortOrder === 'asc' 
          ? valA.localeCompare(valB, 'zh-CN') 
          : valB.localeCompare(valA, 'zh-CN');
      } else {
        // 数字类型：处理空值、NaN和特殊值
        valA = a.value === '' || a.value === null ? -Infinity : parseFloat(a.value);
        valB = b.value === '' || b.value === null ? -Infinity : parseFloat(b.value);
        if (isNaN(valA)) valA = -Infinity;
        if (isNaN(valB)) valB = -Infinity;
        return this.currentSortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });
    
    // 清空tbody并重新添加排序后的行
    tbody.innerHTML = '';
    rowPairs.forEach(({ appRow, detailRow }, index) => {
      // 更新序号
      const indexCell = appRow.querySelector('td:nth-child(2)');
      if (indexCell) {
        indexCell.textContent = index + 1;
      }
      tbody.appendChild(appRow);
      tbody.appendChild(detailRow);
    });
    
    // 重新绑定应用行事件
    this.attachAppRowEvents();
  },
  
  // 解析日期字符串为时间戳
  parseDate(dateStr) {
    if (!dateStr) return 0;
    // 支持 YYYY-MM-DD 或 YYYY/MM/DD 格式
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
    }
    return 0;
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

