// ========== 打码工具模块 ==========

const MaskUtils = {
  // 完全打码（用于应用名称）
  maskFull(text, maxLength = 8) {
    if (!text) return '';
    return '*'.repeat(Math.min(text.length, maxLength));
  },
  
  // 部分打码（用于AppID等）
  maskPartial(text, showLength = 4) {
    if (!text || text.length <= showLength * 2) {
      return '*'.repeat(text.length);
    }
    return text.substring(0, showLength) + 
           '*'.repeat(text.length - showLength * 2) + 
           text.substring(text.length - showLength);
  },
  
  // 根据类型打码
  mask(text, type = 'full') {
    switch(type) {
      case 'full':
        return this.maskFull(text);
      case 'partial':
        return this.maskPartial(text);
      case 'appId':
        return this.maskPartial(text, 4);
      case 'appName':
        return this.maskFull(text, 8);
      default:
        return text;
    }
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.MaskUtils = MaskUtils;
}

