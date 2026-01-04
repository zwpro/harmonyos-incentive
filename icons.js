// ========== SVG 图标库 ==========
const SVGIcons = {
  // 状态图标
  success: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#4caf50"/><path d="M8 12l3 3 5-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
  error: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#f44336"/><path d="M8 8l8 8M16 8l-8 8" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  
  check: (size = 12, color = '#4caf50') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle;"><circle cx="12" cy="12" r="10" fill="${color}"/><path d="M8 12l3 3 5-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
  cross: (size = 12, color = '#999') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle;"><circle cx="12" cy="12" r="10" fill="${color}"/><path d="M8 8l8 8M16 8l-8 8" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  
  // 阶段状态圆点
  dot: (color, size = 8) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10" fill="${color}"/></svg>`,
  
  dotOutline: (color, size = 12) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 3px;"><circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2" fill="none"/><path d="M12 6v6l4 4" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`,
  
  // 功能图标
  star: (size = 22, color = 'white') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${color}"/></svg>`,
  
  starSmall: (size = 14, color = '#1976d2') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 3px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${color}"/></svg>`,
  
  location: (size = 14, color = '#f57c00') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 3px;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}"/><circle cx="12" cy="9" r="2" fill="white"/></svg>`,
  
  // 信息图标
  calendar: (size = 16, color = '#1976d2') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;"><rect x="3" y="4" width="18" height="18" rx="2" stroke="${color}" stroke-width="2" fill="none"/><line x1="3" y1="9" x2="21" y2="9" stroke="${color}" stroke-width="2"/><circle cx="8" cy="14" r="1" fill="${color}"/><circle cx="12" cy="14" r="1" fill="${color}"/><circle cx="16" cy="14" r="1" fill="${color}"/></svg>`,
  
  money: (size = 16, color = '#ff6b35') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2" fill="none"/><text x="12" y="17" text-anchor="middle" font-size="14" fill="${color}" font-weight="bold">¥</text></svg>`,
  
  key: (size = 16, color = '#666') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;"><circle cx="7" cy="7" r="3" stroke="${color}" stroke-width="2" fill="none"/><path d="M9.5 8.5L20 19M16 15l2 2M18 13l2 2" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`,
  
  chart: (size = 16, color = '#1976d2') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;"><rect x="3" y="14" width="4" height="7" rx="1" fill="${color}"/><rect x="10" y="8" width="4" height="13" rx="1" fill="${color}" opacity="0.7"/><rect x="17" y="3" width="4" height="18" rx="1" fill="${color}" opacity="0.5"/></svg>`,
  
  target: (size = 16, color = '#f57c00') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="6" stroke="${color}" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="2" fill="${color}"/></svg>`,
  
  info: (size = 16, color = '#2196f3') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2" fill="none"/><path d="M12 8v8M12 6v1" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`,
  
  // 菜单图标
  menu: (size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="4" rx="1" fill="white"/><rect x="3" y="10" width="18" height="4" rx="1" fill="white" opacity="0.8"/><rect x="3" y="17" width="18" height="4" rx="1" fill="white" opacity="0.6"/></svg>`,
  
  // 侧边栏图标 - 更现代的设计
  sidebarOpen: (size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="2" stroke="white" stroke-width="2" fill="none"/>
    <rect x="13" y="2" width="9" height="20" fill="white" opacity="0.3"/>
    <path d="M16 8l-3 4 3 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  
  // 展开/收起箭头
  chevronDown: (size = 16, color = '#666') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; transition: transform 0.3s;"><path d="M6 9l6 6 6-6" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
  chevronUp: (size = 16, color = '#666') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; transition: transform 0.3s;"><path d="M18 15l-6-6-6 6" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
  chevronRight: (size = 16, color = '#666') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; transition: transform 0.3s;"><path d="M9 6l6 6-6 6" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
  // 功能操作图标
  eye: (size = 16, color = '#666') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;"><path d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5z" stroke="${color}" stroke-width="2" fill="none"/><circle cx="12" cy="12.5" r="3" stroke="${color}" stroke-width="2" fill="none"/></svg>`,
  
  eyeOff: (size = 16, color = '#666') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;"><path d="M3 3l18 18M10.5 10.5a3 3 0 004 4M7.36 7.36A9 9 0 0112 5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 01-2.16 3.08M12 20c-5 0-9.27-3.11-11-7.5a11.8 11.8 0 012.16-3.08" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`,
  
  share: (size = 16, color = '#666') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;"><circle cx="18" cy="5" r="3" stroke="${color}" stroke-width="2" fill="none"/><circle cx="6" cy="12" r="3" stroke="${color}" stroke-width="2" fill="none"/><circle cx="18" cy="19" r="3" stroke="${color}" stroke-width="2" fill="none"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="${color}" stroke-width="2"/></svg>`,
  
  camera: (size = 16, color = '#666') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;"><rect x="2" y="6" width="20" height="14" rx="2" stroke="${color}" stroke-width="2" fill="none"/><circle cx="12" cy="13" r="3" stroke="${color}" stroke-width="2" fill="none"/><path d="M7 6L9 3h6l2 3" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`,
  
  github: (size = 16, color = 'white') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle;"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="${color}"/></svg>`,
  
  users: (size = 16, color = 'white') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle;"><circle cx="9" cy="7" r="4" stroke="${color}" stroke-width="2" fill="none"/><circle cx="17" cy="9" r="3" stroke="${color}" stroke-width="2" fill="none"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M15 20c0-2 1.5-4 5-4s5 2 5 4" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`,
  
  refresh: (size = 16, color = 'white') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle;"><path d="M21 10a9 9 0 11-9-9 9 9 0 019 9z" stroke="${color}" stroke-width="2" fill="none"/><path d="M21 4v6h-6" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
  settings: (size = 16, color = '#666') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="vertical-align: middle;"><circle cx="12" cy="12" r="3" stroke="${color}" stroke-width="2" fill="none"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="${color}" stroke-width="2" fill="none"/></svg>`,
  
  // 统计图标
  dashboard: (size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="margin-right: 6px;"><rect x="3" y="3" width="7" height="7" rx="1" fill="#ff6b35"/><rect x="14" y="3" width="7" height="7" rx="1" fill="#1976d2"/><rect x="3" y="14" width="7" height="7" rx="1" fill="#388e3c"/><rect x="14" y="14" width="7" height="7" rx="1" fill="#f57c00"/></svg>`
};

// SVG 图标获取函数
function getIcon(name, ...args) {
  if (typeof SVGIcons[name] === 'function') {
    return SVGIcons[name](...args);
  }
  return '';
}

// 导出到全局作用域（用于content script）
if (typeof window !== 'undefined') {
  window.SVGIcons = SVGIcons;
  window.getIcon = getIcon;
}

