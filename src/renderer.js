// DOM 요소들
const elements = {
  // 메인 UI
  emptyState: document.getElementById('emptyState'),
  ddayGrid: document.getElementById('ddayGrid'),
  
  // 버튼들
  addDdayBtn: document.getElementById('addDdayBtn'),
  addFirstDdayBtn: document.getElementById('addFirstDdayBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  
  // D-day 모달
  ddayModal: document.getElementById('ddayModal'),
  modalTitle: document.getElementById('modalTitle'),
  ddayForm: document.getElementById('ddayForm'),
  closeDdayModal: document.getElementById('closeDdayModal'),
  cancelDdayModal: document.getElementById('cancelDdayModal'),
  saveDdayBtn: document.getElementById('saveDdayBtn'),
  
  // D-day 폼 필드들
  ddayTitle: document.getElementById('ddayTitle'),
  ddayDate: document.getElementById('ddayDate'),
  ddayDescription: document.getElementById('ddayDescription'),
  excludeWeekends: document.getElementById('excludeWeekends'),
  ddayColor: document.getElementById('ddayColor'),
  
  // 개별 제외 날짜 관련
  individualExcludeDate: document.getElementById('individualExcludeDate'),
  individualExcludeReason: document.getElementById('individualExcludeReason'),
  addIndividualExcludeDateBtn: document.getElementById('addIndividualExcludeDateBtn'),
  individualExcludeDatesList: document.getElementById('individualExcludeDatesList'),
  
  // 설정 모달
  settingsModal: document.getElementById('settingsModal'),
  closeSettingsModal: document.getElementById('closeSettingsModal'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  globalExcludeWeekends: document.getElementById('globalExcludeWeekends'),
  themeSelect: document.getElementById('themeSelect'),
  
  // 제외 날짜 관련
  excludeDate: document.getElementById('excludeDate'),
  excludeReason: document.getElementById('excludeReason'),
  addExcludeDateBtn: document.getElementById('addExcludeDateBtn'),
  excludeDatesList: document.getElementById('excludeDatesList'),
  
  // 정보 모달
  aboutModal: document.getElementById('aboutModal'),
  closeAboutModal: document.getElementById('closeAboutModal'),
  closeAboutModalBtn: document.getElementById('closeAboutModalBtn'),
  
  // 로딩
  loadingOverlay: document.getElementById('loadingOverlay')
};

// 앱 상태
const state = {
  ddays: [],
  excludeDates: [],
  settings: {},
  editingDdayId: null,
  currentDdayExcludeDates: [] // 현재 편집 중인 D-day의 개별 제외 날짜
};

// 유틸리티 함수들
const utils = {
  // 날짜를 한국시간 기준 문자열로 변환 (YYYY-MM-DD)
  toKoreanDateString: (date) => {
    const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
    return koreanDate.toISOString().split('T')[0];
  },

  // 날짜 포맷팅
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  },

  // D-day 계산 (주말 및 제외 날짜 고려)
  calculateDday: (targetDate, excludeWeekends = false, globalExcludeDates = [], individualExcludeDates = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    // 목표 날짜가 제외 날짜에 포함되어 있다면 실제 목표 날짜를 조정
    // 제외되지 않는 날짜를 찾을 때까지 하루씩 앞당기기
    let maxAdjustments = 365; // 최대 1년까지만 조정
    let adjustmentCount = 0;
    
    while (adjustmentCount < maxAdjustments) {
      const targetDateString = utils.toKoreanDateString(target);
      
      // 목표 날짜가 전역 제외 날짜에 포함되어 있는지 확인
      const isGlobalExcluded = globalExcludeDates && globalExcludeDates.some(ed => ed && ed.date === targetDateString);
      
      // 목표 날짜가 개별 제외 날짜에 포함되어 있는지 확인
      const isIndividualExcluded = individualExcludeDates && individualExcludeDates.some(ed => ed && ed.date === targetDateString);
      
      // 목표 날짜가 주말 제외 옵션에 해당하는지 확인
      const isWeekendExcluded = excludeWeekends && (target.getDay() === 0 || target.getDay() === 6);
      
      // 제외되지 않는다면 break (유효한 목표 날짜 발견)
      if (!isGlobalExcluded && !isIndividualExcluded && !isWeekendExcluded) {
        break;
      }
      
      // 제외된다면 하루 앞당기기 (6월 30일이 제외날짜면 6월 29일로 조정)
      target.setDate(target.getDate() - 1);
      adjustmentCount++;
    }
    
    if (target < today) {
      return { daysLeft: 0, isPast: true };
    }
    
    let daysLeft = 0;
    let currentDate = new Date(today);
    
    while (currentDate < target) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      // 주말 제외 옵션이 켜져있고 주말이면 제외
      if (excludeWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        console.log('주말 제외');
        console.log(currentDate);
        continue;
      }
      
      // 전역 제외 날짜에 포함되어 있으면 제외
      const dateString = utils.toKoreanDateString(currentDate);
      if (globalExcludeDates.some(ed => ed.date === dateString)) {
        console.log('전역 제외');
        console.log(currentDate);
        continue;
      }
      
      // 개별 제외 날짜에 포함되어 있으면 제외
      if (individualExcludeDates.some(ed => ed.date === dateString)) {
        console.log('개별 제외');
        console.log(individualExcludeDates);
        console.log(dateString);
        console.log(currentDate);
        continue;
      }
      
      daysLeft++;
    }
    
    return { daysLeft, isPast: false };
  },

  // 진행률 계산
  calculateProgress: (startDate, targetDate, excludeWeekends = false, globalExcludeDates = [], individualExcludeDates = []) => {
    const start = new Date(startDate);
    let target = new Date(targetDate);
    const today = new Date();
    
    start.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // 목표 날짜가 제외 날짜에 포함되어 있다면 실제 목표 날짜를 조정
    // 제외되지 않는 날짜를 찾을 때까지 하루씩 앞당기기
    let maxAdjustments = 365; // 최대 1년까지만 조정
    let adjustmentCount = 0;
    
    while (adjustmentCount < maxAdjustments) {
      const targetDateString = utils.toKoreanDateString(target);
      
      // 목표 날짜가 전역 제외 날짜에 포함되어 있는지 확인
      const isGlobalExcluded = globalExcludeDates && globalExcludeDates.some(ed => ed && ed.date === targetDateString);
      
      // 목표 날짜가 개별 제외 날짜에 포함되어 있는지 확인
      const isIndividualExcluded = individualExcludeDates && individualExcludeDates.some(ed => ed && ed.date === targetDateString);
      
      // 목표 날짜가 주말 제외 옵션에 해당하는지 확인
      const isWeekendExcluded = excludeWeekends && (target.getDay() === 0 || target.getDay() === 6);
      
      // 제외되지 않는다면 break (유효한 목표 날짜 발견)
      if (!isGlobalExcluded && !isIndividualExcluded && !isWeekendExcluded) {
        break;
      }
      
      // 제외된다면 하루 앞당기기 (6월 30일이 제외날짜면 6월 29일로 조정)
      target.setDate(target.getDate() - 1);
      adjustmentCount++;
    }
    
    if (today >= target) return 100;
    if (today <= start) return 0;
    
    // 전체 기간의 총 일수 계산
    let totalDays = 0;
    let currentDate = new Date(start);
    
    while (currentDate < target) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      if (excludeWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        continue;
      }
      
      const dateString = utils.toKoreanDateString(currentDate);
      if (globalExcludeDates.some(ed => ed.date === dateString)) {
        continue;
      }
      
      if (individualExcludeDates.some(ed => ed.date === dateString)) {
        continue;
      }
      
      totalDays++;
    }
    
    // 지난 일수 계산
    let passedDays = 0;
    currentDate = new Date(start);
    
    while (currentDate < today) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      if (excludeWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        continue;
      }
      
      const dateString = utils.toKoreanDateString(currentDate);
      if (globalExcludeDates.some(ed => ed.date === dateString)) {
        continue;
      }
      
      if (individualExcludeDates.some(ed => ed.date === dateString)) {
        continue;
      }
      
      passedDays++;
    }
    
    return totalDays > 0 ? Math.round((passedDays / totalDays) * 100) : 0;
  },

  // 상태에 따른 색상 클래스 반환
  getStatusClass: (daysLeft, isPast) => {
    if (isPast) return 'status-past';
    if (daysLeft <= 7) return 'status-danger';
    if (daysLeft <= 30) return 'status-warning';
    return 'status-active';
  },

  // 로딩 표시/숨김
  showLoading: () => {
    elements.loadingOverlay.classList.add('active');
  },

  hideLoading: () => {
    elements.loadingOverlay.classList.remove('active');
  },

  // 테마 적용
  applyTheme: (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      // 시스템 테마 따르기
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }
};

// D-day 카드 생성
function createDdayCard(dday) {
  const { daysLeft, isPast } = utils.calculateDday(
    dday.date, 
    dday.excludeWeekends, 
    state.excludeDates,
    dday.individualExcludeDates || []
  );
  
  const progress = utils.calculateProgress(
    dday.createdAt,
    dday.date,
    dday.excludeWeekends,
    state.excludeDates,
    dday.individualExcludeDates || []
  );
  
  const statusClass = utils.getStatusClass(daysLeft, isPast);
  
  const card = document.createElement('div');
  card.className = 'dday-card fade-in';
  card.style.setProperty('--card-color', dday.color);
  
  card.innerHTML = `
    <div class="dday-card-header">
      <div>
        <h3 class="dday-title">${dday.title}</h3>
        <p class="dday-date">${utils.formatDate(dday.date)}</p>
      </div>
      <div class="dday-actions">
        <button class="btn btn-ghost btn-small" onclick="editDday('${dday.id}')">
          <span class="icon">✏️</span>
        </button>
        <button class="btn btn-ghost btn-small" onclick="deleteDday('${dday.id}')">
          <span class="icon">🗑️</span>
        </button>
      </div>
    </div>
    
    <div class="dday-count">
      <span class="dday-number ${statusClass}">
        ${isPast ? 'D+' + Math.abs(daysLeft) : (daysLeft === 0 ? 'D-DAY!' : 'D-' + daysLeft)}
      </span>
      <p class="dday-label">
        ${isPast ? '지났습니다' : (daysLeft === 0 ? '오늘입니다!' : '남았습니다')}
      </p>
    </div>
    
    ${dday.description ? `<p class="dday-description">${dday.description}</p>` : ''}
    
    ${!isPast ? `
      <div class="dday-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <p class="progress-text">진행률 ${progress}%</p>
      </div>
    ` : ''}
  `;
  
  return card;
}

// D-day 목록 렌더링
async function renderDdays() {
  const ddays = await window.electronAPI.dday.getAll();
  state.ddays = ddays;
  
  if (ddays.length === 0) {
    elements.emptyState.style.display = 'flex';
    elements.ddayGrid.style.display = 'none';
  } else {
    elements.emptyState.style.display = 'none';
    elements.ddayGrid.style.display = 'grid';
    
    elements.ddayGrid.innerHTML = '';
    ddays.forEach(dday => {
      const card = createDdayCard(dday);
      elements.ddayGrid.appendChild(card);
    });
  }
}

// 제외 날짜 목록 렌더링
async function renderExcludeDates() {
  const excludeDates = await window.electronAPI.excludeDate.getAll();
  state.excludeDates = excludeDates;
  
  elements.excludeDatesList.innerHTML = '';
  
  if (excludeDates.length === 0) {
    elements.excludeDatesList.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--text-muted);">등록된 제외 날짜가 없습니다.</p>';
    return;
  }
  
  excludeDates.forEach(ed => {
    const item = document.createElement('div');
    item.className = 'exclude-date-item';
    item.innerHTML = `
      <div class="exclude-date-info">
        <div class="exclude-date-date">${utils.formatDate(ed.date)}</div>
        ${ed.reason ? `<div class="exclude-date-reason">${ed.reason}</div>` : ''}
      </div>
      <button class="btn btn-ghost btn-small" onclick="deleteExcludeDate('${ed.id}')">
        <span class="icon">🗑️</span>
      </button>
    `;
    elements.excludeDatesList.appendChild(item);
  });
}

// 개별 제외 날짜 목록 렌더링
function renderIndividualExcludeDates() {
  elements.individualExcludeDatesList.innerHTML = '';
  
  if (state.currentDdayExcludeDates.length === 0) {
    return; // CSS에서 :empty 가상 선택자로 처리
  }
  
  state.currentDdayExcludeDates.forEach((ed, index) => {
    const item = document.createElement('div');
    item.className = 'individual-exclude-date-item';
    item.innerHTML = `
      <div class="individual-exclude-date-info">
        <div class="individual-exclude-date-date">${utils.formatDate(ed.date)}</div>
        ${ed.reason ? `<div class="individual-exclude-date-reason">${ed.reason}</div>` : ''}
      </div>
      <button class="btn btn-ghost btn-small" onclick="removeIndividualExcludeDate(${index})">
        <span class="icon">🗑️</span>
      </button>
    `;
    elements.individualExcludeDatesList.appendChild(item);
  });
}

// 개별 제외 날짜 추가
function addIndividualExcludeDate() {
  const date = elements.individualExcludeDate.value;
  const reason = elements.individualExcludeReason.value.trim();
  
  if (!date) {
    alert('날짜를 선택해주세요.');
    return;
  }
  
  // 중복 체크
  if (state.currentDdayExcludeDates.some(ed => ed.date === date)) {
    alert('이미 추가된 날짜입니다.');
    return;
  }
  
  state.currentDdayExcludeDates.push({
    date: date,
    reason: reason || ''
  });
  
  elements.individualExcludeDate.value = '';
  elements.individualExcludeReason.value = '';
  
  renderIndividualExcludeDates();
}

// 개별 제외 날짜 제거
function removeIndividualExcludeDate(index) {
  state.currentDdayExcludeDates.splice(index, 1);
  renderIndividualExcludeDates();
}

// 모달 표시/숨김
function showModal(modal) {
  modal.classList.add('active');
}

function hideModal(modal) {
  modal.classList.remove('active');
}

// D-day 추가 모달 표시
function showAddDdayModal() {
  state.editingDdayId = null;
  state.currentDdayExcludeDates = [];
  elements.modalTitle.textContent = '새 D-day 추가';
  elements.ddayForm.reset();
  
  // 기본값 설정
  elements.ddayColor.value = '#007bff';
  elements.excludeWeekends.checked = state.settings.excludeWeekends || false;
  
  renderIndividualExcludeDates();
  showModal(elements.ddayModal);
  elements.ddayTitle.focus();
}

// D-day 편집 모달 표시
async function editDday(id) {
  const dday = state.ddays.find(d => d.id === id);
  if (!dday) return;
  
  state.editingDdayId = id;
  state.currentDdayExcludeDates = [...(dday.individualExcludeDates || [])];
  elements.modalTitle.textContent = 'D-day 편집';
  
  // 폼에 기존 값 설정
  elements.ddayTitle.value = dday.title;
  elements.ddayDate.value = dday.date;
  elements.ddayDescription.value = dday.description || '';
  elements.excludeWeekends.checked = dday.excludeWeekends;
  elements.ddayColor.value = dday.color;
  
  renderIndividualExcludeDates();
  showModal(elements.ddayModal);
  elements.ddayTitle.focus();
}

// D-day 삭제
async function deleteDday(id) {
  const dday = state.ddays.find(d => d.id === id);
  if (!dday) return;
  
  if (confirm(`"${dday.title}" D-day를 삭제하시겠습니까?`)) {
    utils.showLoading();
    try {
      await window.electronAPI.dday.delete(id);
      await renderDdays();
    } catch (error) {
      console.error('D-day 삭제 실패:', error);
      alert('D-day 삭제에 실패했습니다.');
    } finally {
      utils.hideLoading();
    }
  }
}

// 제외 날짜 삭제
async function deleteExcludeDate(id) {
  utils.showLoading();
  try {
    await window.electronAPI.excludeDate.delete(id);
    await renderExcludeDates();
    await renderDdays(); // D-day 목록도 다시 렌더링 (계산이 변경될 수 있음)
  } catch (error) {
    console.error('제외 날짜 삭제 실패:', error);
    alert('제외 날짜 삭제에 실패했습니다.');
  } finally {
    utils.hideLoading();
  }
}

// 설정 로드
async function loadSettings() {
  const settings = await window.electronAPI.settings.get();
  state.settings = settings;
  
  // UI에 설정 반영
  elements.globalExcludeWeekends.checked = settings.excludeWeekends || false;
  elements.themeSelect.value = settings.theme || 'system';
  
  // 테마 적용
  utils.applyTheme(settings.theme || 'system');
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 버튼 이벤트
  elements.addDdayBtn.addEventListener('click', showAddDdayModal);
  elements.addFirstDdayBtn.addEventListener('click', showAddDdayModal);
  elements.settingsBtn.addEventListener('click', () => showModal(elements.settingsModal));
  
  // 모달 닫기 이벤트
  elements.closeDdayModal.addEventListener('click', () => hideModal(elements.ddayModal));
  elements.cancelDdayModal.addEventListener('click', () => hideModal(elements.ddayModal));
  elements.closeSettingsModal.addEventListener('click', () => hideModal(elements.settingsModal));
  elements.closeAboutModal.addEventListener('click', () => hideModal(elements.aboutModal));
  elements.closeAboutModalBtn.addEventListener('click', () => hideModal(elements.aboutModal));
  
  // 모달 오버레이 클릭으로 닫기
  [elements.ddayModal, elements.settingsModal, elements.aboutModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideModal(modal);
      }
    });
  });
  
  // D-day 폼 제출
  elements.ddayForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const ddayData = {
      title: formData.get('title'),
      date: formData.get('date'),
      description: formData.get('description'),
      excludeWeekends: formData.has('excludeWeekends'),
      color: formData.get('color'),
      individualExcludeDates: [...state.currentDdayExcludeDates]
    };
    
    // 새로 추가하는 경우에만 createdAt 설정 (한국시간 기준)
    if (!state.editingDdayId) {
      ddayData.createdAt = utils.toKoreanDateString(new Date());
    }
    
    utils.showLoading();
    try {
      if (state.editingDdayId) {
        await window.electronAPI.dday.update(state.editingDdayId, ddayData);
      } else {
        await window.electronAPI.dday.add(ddayData);
      }
      
      hideModal(elements.ddayModal);
      await renderDdays();
    } catch (error) {
      console.error('D-day 저장 실패:', error);
      alert('D-day 저장에 실패했습니다.');
    } finally {
      utils.hideLoading();
    }
  });
  
  // 제외 날짜 추가
  elements.addExcludeDateBtn.addEventListener('click', async () => {
    const date = elements.excludeDate.value;
    const reason = elements.excludeReason.value.trim();
    
    if (!date) {
      alert('날짜를 선택해주세요.');
      return;
    }
    
    utils.showLoading();
    try {
      await window.electronAPI.excludeDate.add({ date, reason });
      elements.excludeDate.value = '';
      elements.excludeReason.value = '';
      await renderExcludeDates();
      await renderDdays(); // D-day 목록도 다시 렌더링
    } catch (error) {
      console.error('제외 날짜 추가 실패:', error);
      alert('제외 날짜 추가에 실패했습니다.');
    } finally {
      utils.hideLoading();
    }
  });
  
  // 설정 저장
  elements.saveSettingsBtn.addEventListener('click', async () => {
    const settings = {
      excludeWeekends: elements.globalExcludeWeekends.checked,
      theme: elements.themeSelect.value
    };
    
    utils.showLoading();
    try {
      await window.electronAPI.settings.update(settings);
      state.settings = { ...state.settings, ...settings };
      utils.applyTheme(settings.theme);
      hideModal(elements.settingsModal);
      
      // 주말 제외 설정이 변경되었으면 D-day 목록 다시 렌더링
      await renderDdays();
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      utils.hideLoading();
    }
  });
  
  // 색상 프리셋 클릭
  document.querySelectorAll('.color-preset').forEach(preset => {
    preset.addEventListener('click', () => {
      const color = preset.dataset.color;
      elements.ddayColor.value = color;
      
      // 활성 상태 표시
      document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
      preset.classList.add('active');
    });
  });
  
  // 메인 프로세스에서 오는 이벤트 리스너
  window.electronAPI.on('show-add-dday-modal', showAddDdayModal);
  window.electronAPI.on('show-settings-modal', () => showModal(elements.settingsModal));
  window.electronAPI.on('show-about-modal', () => showModal(elements.aboutModal));
  
  // 키보드 단축키
  document.addEventListener('keydown', (e) => {
    // ESC 키로 모달 닫기
    if (e.key === 'Escape') {
      if (elements.ddayModal.classList.contains('active')) {
        hideModal(elements.ddayModal);
      } else if (elements.settingsModal.classList.contains('active')) {
        hideModal(elements.settingsModal);
      } else if (elements.aboutModal.classList.contains('active')) {
        hideModal(elements.aboutModal);
      }
    }
  });
  
  // 시스템 테마 변경 감지
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.settings.theme === 'system') {
      utils.applyTheme('system');
    }
  });
  
  // 개별 제외 날짜 추가
  elements.addIndividualExcludeDateBtn.addEventListener('click', addIndividualExcludeDate);
  
  // Enter 키로 개별 제외 날짜 추가
  elements.individualExcludeReason.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addIndividualExcludeDate();
    }
  });
}

// 앱 초기화
async function initApp() {
  utils.showLoading();
  
  try {
    // 설정 로드
    await loadSettings();
    
    // 제외 날짜 로드
    await renderExcludeDates();
    
    // D-day 목록 로드
    await renderDdays();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 1분마다 D-day 업데이트 (실시간 카운트다운)
    setInterval(async () => {
      if (state.ddays.length > 0) {
        await renderDdays();
      }
    }, 60000); // 1분
    
  } catch (error) {
    console.error('앱 초기화 실패:', error);
    alert('앱 초기화에 실패했습니다.');
  } finally {
    utils.hideLoading();
  }
}

// 전역 함수들 (HTML에서 호출됨)
window.editDday = editDday;
window.deleteDday = deleteDday;
window.deleteExcludeDate = deleteExcludeDate;
window.removeIndividualExcludeDate = removeIndividualExcludeDate;

// DOM 로드 완료 후 앱 초기화
document.addEventListener('DOMContentLoaded', initApp); 