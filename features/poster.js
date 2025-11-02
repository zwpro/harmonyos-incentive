// ========== 海报生成模块 ==========

const PosterGenerator = {
  // 生成海报
  async generate() {
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
      
      // 创建临时的海报内容（不显示在界面上）
      const tempContainer = this.createTempPosterContent();
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
      const posterContainer = this.createImagePosterContainer(imageUrl);
      document.body.appendChild(posterContainer);
      
      // 绑定关闭按钮
      document.getElementById('closePosterBtn').addEventListener('click', () => {
        posterContainer.remove();
      });
      
      // 绑定下载按钮
      document.getElementById('downloadPosterBtn').addEventListener('click', () => {
        this.downloadImage(imageUrl);
      });
      
    } catch (error) {
      console.error('生成海报失败:', error);
      alert('生成海报失败：' + error.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },
  
  // 创建临时海报内容（用于生成图片）
  createTempPosterContent() {
    const stats = Statistics.getAllStats();
    
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: -10000px;
      left: -10000px;
      width: 700px;
      background: white;
      padding: 30px;
      border-radius: 16px;
    `;
    
    container.innerHTML = `
      <!-- 标题区域 -->
      <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 3px solid #ff6b35;">
        <div style="font-size: 32px; font-weight: 800; color: #ff6b35; margin-bottom: 8px; letter-spacing: 1px;">
          鸿蒙激励计划小助手
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 12px;">
          <span style="font-size: 13px; color: #666; background: #f5f5f5; padding: 4px 12px; border-radius: 12px;">${AppConfig.version}</span>
          <span style="font-size: 13px; color: #666;">数据统计报告</span>
          ${AppState.cutOffTime ? `<span style="font-size: 13px; color: #666;">截止: ${AppState.cutOffTime}</span>` : ''}
        </div>
      </div>
      
      <!-- 核心指标 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
        <div style="background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%); padding: 24px; border-radius: 12px; text-align: center; color: white; box-shadow: 0 4px 12px rgba(242, 153, 74, 0.3);">
          <div style="font-size: 13px; opacity: 0.9; margin-bottom: 10px; font-weight: 500;">应用总数</div>
          <div style="font-size: 42px; font-weight: 800; margin-bottom: 6px;">${stats.appCount}</div>
          <div style="font-size: 11px; opacity: 0.8;">${stats.typeCount.app}应用 · ${stats.typeCount.game}游戏</div>
        </div>
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 24px; border-radius: 12px; text-align: center; color: white; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);">
          <div style="font-size: 13px; opacity: 0.9; margin-bottom: 10px; font-weight: 500;">预估激励</div>
          <div style="font-size: 42px; font-weight: 800; margin-bottom: 6px;"><span style="font-size: 28px;">¥</span>${(stats.estimatedReward / 10000).toFixed(1)}万</div>
          <div style="font-size: 11px; opacity: 0.8;">应用¥1万 · 游戏¥2千</div>
        </div>
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 24px; border-radius: 12px; text-align: center; color: white; box-shadow: 0 4px 12px rgba(0, 242, 254, 0.3);">
          <div style="font-size: 13px; opacity: 0.9; margin-bottom: 10px; font-weight: 500;">已获激励</div>
          <div style="font-size: 42px; font-weight: 800; margin-bottom: 6px;"><span style="font-size: 28px;">¥</span>${(stats.totalReward / 10000).toFixed(1)}万</div>
          <div style="font-size: 11px; opacity: 0.8;">平均 ¥${(stats.avgReward / 1000).toFixed(1)}k</div>
        </div>
      </div>
      
      <!-- 达标情况 -->
      <div style="background: linear-gradient(to right, #ffecd2 0%, #fcb69f 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: 700; color: #333; margin-bottom: 16px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#f57c00" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="6" fill="#f57c00"/>
            <circle cx="12" cy="12" r="2" fill="white"/>
          </svg>
          <span>达标情况</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 28px; font-weight: 800; color: #4caf50; margin-bottom: 4px;">${stats.rewardCount.base}</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">基础激励</div>
            <div style="font-size: 11px; color: #999; margin-top: 2px;">${stats.rewardRate.base}%</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 28px; font-weight: 800; color: #1976d2; margin-bottom: 4px;">${stats.rewardCount.phase1}</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">一阶段激励</div>
            <div style="font-size: 11px; color: #999; margin-top: 2px;">${stats.rewardRate.phase1}%</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 28px; font-weight: 800; color: #f57c00; margin-bottom: 4px;">${stats.rewardCount.phase2}</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">二阶段激励</div>
            <div style="font-size: 11px; color: #999; margin-top: 2px;">${stats.rewardRate.phase2}%</div>
          </div>
        </div>
      </div>
      
      <!-- 阶段分布 -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: 700; color: #333; margin-bottom: 16px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="14" width="4" height="7" rx="1" fill="#1976d2"/>
            <rect x="10" y="10" width="4" height="11" rx="1" fill="#388e3c"/>
            <rect x="17" y="6" width="4" height="15" rx="1" fill="#f57c00"/>
          </svg>
          <span>阶段分布</span>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <div style="background: #e3f2fd; padding: 12px 16px; border-radius: 8px; text-align: center; min-width: 80px;">
            <div style="font-size: 24px; font-weight: 700; color: #1976d2;">${stats.phaseCount.phase1}</div>
            <div style="font-size: 11px; color: #666; margin-top: 2px;">基础</div>
          </div>
          <div style="background: #e8f5e9; padding: 12px 16px; border-radius: 8px; text-align: center; min-width: 80px;">
            <div style="font-size: 24px; font-weight: 700; color: #388e3c;">${stats.phaseCount.phase2}</div>
            <div style="font-size: 11px; color: #666; margin-top: 2px;">一阶段</div>
          </div>
          <div style="background: #fff3e0; padding: 12px 16px; border-radius: 8px; text-align: center; min-width: 80px;">
            <div style="font-size: 24px; font-weight: 700; color: #f57c00;">${stats.phaseCount.phase3}</div>
            <div style="font-size: 11px; color: #666; margin-top: 2px;">二阶段</div>
          </div>
          <div style="background: #f5f5f5; padding: 12px 16px; border-radius: 8px; text-align: center; min-width: 80px;">
            <div style="font-size: 24px; font-weight: 700; color: #666;">${stats.phaseCount.ended}</div>
            <div style="font-size: 11px; color: #666; margin-top: 2px;">已结束</div>
          </div>
        </div>
      </div>
      
      <!-- 底部信息 -->
      <div style="text-align: center; padding-top: 16px; border-top: 2px dashed #e0e0e0;">
        <div style="font-size: 12px; color: #999;">生成时间: ${new Date().toLocaleString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})}</div>
      </div>
    `;
    
    return container;
  },
  
  // 创建显示图片的弹窗
  createImagePosterContainer(imageUrl) {
    const container = document.createElement('div');
    container.style.cssText = `
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
    
    container.innerHTML = `
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
             <path d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17" stroke="#667eea" stroke-width="2" stroke-linecap="round"/>
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
    
    return container;
  },
  
  // 下载图片
  downloadImage(imageUrl) {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `鸿蒙激励计划统计_${timestamp}.png`;
    link.href = imageUrl;
    link.click();
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.PosterGenerator = PosterGenerator;
}

