// ========== Background Service Worker ==========
// 处理跨域请求

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PUSH_DATA') {
    fetch(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.data)
    })
    .then(response => {
      sendResponse({ success: response.ok, status: response.status });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    
    // 返回 true 表示异步响应
    return true;
  }
});
