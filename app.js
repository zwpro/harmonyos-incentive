// ========== 主应用模块 ==========

const App = {
  // 初始化
  init() {
    this.injectAPIInterceptor();
    this.createSidebar();
    this.listenToAPIData();
  },
  
  // 注入API拦截器
  injectAPIInterceptor() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  },
  
  // 监听API数据
  listenToAPIData() {
    window.addEventListener('apiCaptured', (event) => {
      const requestInfo = event.detail;
      AppState.apiRequests.push(requestInfo);
      
      // 解析并提取应用列表
      DataProcessor.extractAppsFromResponse(requestInfo.response);
      
      // 更新显示
      this.render();
    });
  },
  
  // 渲染主界面
  render() {
    const apiListElement = document.getElementById('api-request-list');
    if (!apiListElement) return;
    
    // 如果没有应用数据，显示等待状态
    if (AppState.appsMap.size === 0) {
      if (AppState.apiRequests.length === 0) {
        return;
      } else {
        apiListElement.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">正在解析数据...</p>';
        return;
      }
    }
    
    // 渲染完整界面
    apiListElement.innerHTML = UIRenderer.renderAll();
    
    // 绑定事件
    EventHandlers.attachAll();
  },
  
  // 创建侧边栏
  createSidebar() {
    // 检查是否已经存在侧边栏
    if (document.getElementById('my-extension-sidebar')) {
      return;
    }

    // 创建侧边栏容器
    const sidebar = document.createElement('div');
    sidebar.id = 'my-extension-sidebar';
    sidebar.className = 'my-sidebar';

    // 创建标题（包含关闭按钮）
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
        <button class="sidebar-title-community" id="community-btn">
          ${getIcon('users', 16, 'white')}
          <span>进群</span>
        </button>
        <a href="${AppConfig.githubUrl}" target="_blank" class="sidebar-title-github">
          ${getIcon('github', 16, 'white')}
          <span>开源</span>
        </a>
        <button class="sidebar-close" id="sidebar-close-btn">×</button>
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
    openBtn.innerHTML = ''; // 使用 CSS 背景图显示 logo
    openBtn.style.backgroundImage = `url('${chrome.runtime.getURL('images/logo.png')}')`;
    openBtn.onclick = function() {
      sidebar.style.right = '0';
    };

    // 组装侧边栏
    sidebar.appendChild(title);
    sidebar.appendChild(content);
    
    // 绑定关闭按钮事件
    setTimeout(() => {
      const closeBtn = document.getElementById('sidebar-close-btn');
      if (closeBtn) {
        closeBtn.onclick = function() {
          sidebar.style.right = '-920px';
        };
      }
      
      // 绑定进群按钮事件
      const communityBtn = document.getElementById('community-btn');
      if (communityBtn) {
        communityBtn.onclick = function() {
          App.showCommunityModal();
        };
      }
    }, 0);
    
    // 添加到页面
    document.body.appendChild(sidebar);
    document.body.appendChild(openBtn);
  },
  
  // 显示社群弹窗
  showCommunityModal() {
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
};

// 页面加载完成后初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.App = App;
}

