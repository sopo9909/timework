const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// 데이터 저장을 위한 store 인스턴스 생성
const store = new Store({
  defaults: {
    ddays: [],
    excludeDates: [],
    settings: {
      excludeWeekends: false,
      theme: 'system'
    }
  }
});

let mainWindow;

function createWindow() {
  // 브라우저 윈도우 생성
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 400,
    maxWidth: 500,
    maxHeight: 800,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    show: false,
    titleBarStyle: 'default',
    skipTaskbar: false
  });

  // HTML 파일 로드
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 윈도우가 준비되면 보여주기
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 개발 모드에서는 개발자 도구 열기
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// 키보드 단축키 처리
function setupShortcuts() {
  // Ctrl+N 또는 Cmd+N으로 새 D-day 추가
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control || input.meta) {
      if (input.key === 'n') {
        mainWindow.webContents.send('show-add-dday-modal');
      } else if (input.key === ',') {
        mainWindow.webContents.send('show-settings-modal');
      } else if (input.key === 'q') {
        app.quit();
      }
    }
  });
}

// 앱이 준비되면 윈도우 생성
app.whenReady().then(() => {
  createWindow();
  setupShortcuts();

  // macOS에서 독 아이콘 클릭 시 윈도우 다시 생성
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      setupShortcuts();
    }
  });

  // 메뉴바 완전 제거
  Menu.setApplicationMenu(null);
});

// 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 핸들러들
ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key);
});

ipcMain.handle('store-clear', () => {
  store.clear();
});

// D-day 관련 IPC 핸들러들
ipcMain.handle('add-dday', (event, ddayData) => {
  const ddays = store.get('ddays', []);
  const newDday = {
    id: Date.now().toString(),
    ...ddayData,
    createdAt: new Date().toISOString()
  };
  ddays.push(newDday);
  store.set('ddays', ddays);
  return newDday;
});

ipcMain.handle('update-dday', (event, id, ddayData) => {
  const ddays = store.get('ddays', []);
  const index = ddays.findIndex(d => d.id === id);
  if (index !== -1) {
    ddays[index] = { ...ddays[index], ...ddayData };
    store.set('ddays', ddays);
    return ddays[index];
  }
  return null;
});

ipcMain.handle('delete-dday', (event, id) => {
  const ddays = store.get('ddays', []);
  const filteredDdays = ddays.filter(d => d.id !== id);
  store.set('ddays', filteredDdays);
  return true;
});

ipcMain.handle('get-ddays', () => {
  return store.get('ddays', []);
});

// 제외 날짜 관련 IPC 핸들러들
ipcMain.handle('add-exclude-date', (event, dateData) => {
  const excludeDates = store.get('excludeDates', []);
  const newDate = {
    id: Date.now().toString(),
    ...dateData,
    createdAt: new Date().toISOString()
  };
  excludeDates.push(newDate);
  store.set('excludeDates', excludeDates);
  return newDate;
});

ipcMain.handle('delete-exclude-date', (event, id) => {
  const excludeDates = store.get('excludeDates', []);
  const filteredDates = excludeDates.filter(d => d.id !== id);
  store.set('excludeDates', filteredDates);
  return true;
});

ipcMain.handle('get-exclude-dates', () => {
  return store.get('excludeDates', []);
});

// 설정 관련 IPC 핸들러들
ipcMain.handle('get-settings', () => {
  return store.get('settings', {});
});

ipcMain.handle('update-settings', (event, settings) => {
  const currentSettings = store.get('settings', {});
  const newSettings = { ...currentSettings, ...settings };
  store.set('settings', newSettings);
  return newSettings;
}); 