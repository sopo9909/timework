const { contextBridge, ipcRenderer } = require('electron');

// 안전하게 렌더러 프로세스에 API 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 기본 스토어 작업
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key),
    clear: () => ipcRenderer.invoke('store-clear')
  },

  // D-day 관련 작업
  dday: {
    add: (ddayData) => ipcRenderer.invoke('add-dday', ddayData),
    update: (id, ddayData) => ipcRenderer.invoke('update-dday', id, ddayData),
    delete: (id) => ipcRenderer.invoke('delete-dday', id),
    getAll: () => ipcRenderer.invoke('get-ddays')
  },

  // 제외 날짜 관련 작업
  excludeDate: {
    add: (dateData) => ipcRenderer.invoke('add-exclude-date', dateData),
    delete: (id) => ipcRenderer.invoke('delete-exclude-date', id),
    getAll: () => ipcRenderer.invoke('get-exclude-dates')
  },

  // 설정 관련 작업
  settings: {
    get: () => ipcRenderer.invoke('get-settings'),
    update: (settings) => ipcRenderer.invoke('update-settings', settings)
  },

  // 이벤트 리스너
  on: (channel, callback) => {
    const validChannels = [
      'show-add-dday-modal',
      'show-settings-modal',
      'show-about-modal'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  // 이벤트 리스너 제거
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
}); 