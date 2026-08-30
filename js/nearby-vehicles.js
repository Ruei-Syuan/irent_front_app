// 取得 index.html 中各頁面、按鈕與資料容器，後續互動都透過 data-* 屬性綁定。
const mapElement = document.querySelector('[data-nearby-map]');
const mapPanel = document.querySelector('.map-panel');
const fallbackElement = document.querySelector('[data-map-fallback]');
const searchInput = document.querySelector('[data-vehicle-search]');
const listElement = document.querySelector('[data-vehicle-list]');
const countElement = document.querySelector('[data-vehicle-count]');
const currentLocationLabel = document.querySelector('[data-current-location-label]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const functionMenu = document.querySelector('[data-function-menu]');
const menuBackdrop = document.querySelector('.menu-backdrop');
const menuCloseButtons = document.querySelectorAll('[data-menu-close]');
const menuActionButtons = document.querySelectorAll('[data-menu-action]');
const notificationButtons = document.querySelectorAll('.notification-button, .detail-notification, .order-notification, .inspection-notification, .return-notification');
const notificationPanel = document.querySelector('[data-notification-panel]');
const notificationCloseButton = document.querySelector('[data-notification-close]');
const notificationMarkReadButton = document.querySelector('[data-notification-mark-read]');
const loginOpenButtons = document.querySelectorAll('[data-login-open]');
const loginModal = document.querySelector('[data-login-modal]');
const loginCloseButton = document.querySelector('[data-login-close]');
const loginForm = document.querySelector('[data-login-form]');
const loginAccountInput = document.querySelector('[data-login-account]');
const loginPasswordInput = document.querySelector('[data-login-password]');
const loginError = document.querySelector('[data-login-error]');
const loginLogoutButton = document.querySelector('[data-login-logout]');
const refreshVehiclesButton = document.querySelector('[data-refresh-vehicles]');
const quickRentButton = document.querySelector('[data-quick-rent]');
const locateButton = document.querySelector('[data-locate]');
const nearbyViews = document.querySelectorAll('[data-nearby-view]');
const viewPanels = document.querySelectorAll('[data-view-panel]');
const navigationButtons = document.querySelectorAll('[data-nav-view]');
const appHeader = document.querySelector('[data-app-header]');
const appHeaderTitle = document.querySelector('[data-header-title]');
const appHeaderBack = document.querySelector('[data-shared-back]');
const nearbyApp = document.querySelector('.nearby-app');
const floatingAssistantButton = document.querySelector('[data-floating-assistant]');
const historyFilters = document.querySelector('[data-history-filters]');
const historyStartInput = document.querySelector('[data-history-start]');
const historyEndInput = document.querySelector('[data-history-end]');
const historyStationSelect = document.querySelector('[data-history-station]');
const historyKeywordInput = document.querySelector('[data-history-keyword]');
const historyResultCount = document.querySelector('[data-history-result-count]');
const historyRecordList = document.querySelector('[data-history-record-list]');
const scanButton = document.querySelector('[data-scan-start]');
const scanCount = document.querySelector('[data-scan-count]');
const inspectionScreens = document.querySelectorAll('[data-inspection-screen]');
const scanRecordNext = document.querySelector('[data-scan-record-next]');
const scanCaptureNext = document.querySelector('[data-scan-capture-next]');
const scanBackButtons = document.querySelectorAll('[data-inspection-back]');
const scanCabinNext = document.querySelector('[data-scan-cabin-next]');
const cabinCaptureNext = document.querySelector('[data-cabin-capture-next]');
const cameraSwitchButtons = document.querySelectorAll('.return-recording-screen .inspection-camera-controls > button:last-child, .return-capture-screen .inspection-camera-controls--capture > button:last-child');
const feedbackSubmit = document.querySelector('[data-feedback-submit]');
const assistantResponse = document.querySelector('[data-assistant-response]');
const assistantPrompts = document.querySelectorAll('[data-assistant-prompt]');
const assistantScreens = document.querySelectorAll('[data-assistant-screen]');
const assistantCaseButtons = document.querySelectorAll('[data-assistant-case]');
const assistantHomeButtons = document.querySelectorAll('[data-assistant-home]');
const returnScreens = document.querySelectorAll('[data-return-screen]');
const returnStartButtons = document.querySelectorAll('[data-return-start]');
const returnTimer = document.querySelector('[data-return-timer]');
const returnScanStartButtons = document.querySelectorAll('[data-return-scan-start]');
const returnSubmitButton = document.querySelector('[data-return-submit]');
const returnResultBackButton = document.querySelector('[data-return-result-back]');
const cabinReturnButtons = document.querySelectorAll('[data-cabin-return-submit]');
const cabinRecheckButtons = document.querySelectorAll('[data-cabin-recheck]');
const returnSummaryBackButton = document.querySelector('[data-return-summary-back]');
const returnCompleteBackButton = document.querySelector('[data-return-complete-back]');
const returnSummaryButton = document.querySelector('[data-return-summary-next]');
const returnFinishButton = document.querySelector('[data-return-finish]');

// 頁面執行期間使用的狀態資料。
let allVehicles = createDefaultVehicles();
let selectedVehicleId = allVehicles.features[0].properties.id;
let map;
let currentLocation;
let scanProgress = 3;
let inspectionScreen = 'start';
let returnTimerSeconds = 600;
let returnTimerInterval;
let toastTimer;
const API_BASE_URL = String(window.__IRENT_API_BASE_URL__ || '').replace(/\/+$/, '');
const API_TIMEOUT_MS = 8000;

// 相機狀態：只保留目前頁面的串流，離開拍攝頁時會停止所有軌道。
let cameraStream;
let cameraFacingMode = 'environment';
let cameraRequestId = 0;
const capturedPhotos = { exterior: [], cabin: [] };
const LOGIN_STORAGE_KEY = 'irent-front-app-user';
let currentUser = readStoredUser();

// 租借歷史預覽資料；之後可直接替換為後端 API 回傳的紀錄。
const rentalHistoryRecords = [
  { start: '2026-07-21T09:30', end: '2026-07-21T11:42', pickup: '台北車站東停車場', dropoff: '市民大道停車場', vehicle: 'Toyota Yaris', plate: 'ABC-1234', duration: '2 小時 12 分', cost: '$278', status: '已完成' },
  { start: '2026-06-25T14:10', end: '2026-06-25T16:05', pickup: '忠孝敦化站', dropoff: '大安站', vehicle: 'Toyota Corolla Cross', plate: 'EFG-5678', duration: '1 小時 55 分', cost: '$352', status: '已完成' },
  { start: '2026-05-20T09:30', end: '2026-05-20T11:30', pickup: '台北車站東停車場', dropoff: '台北車站東停車場', vehicle: 'Toyota Yaris', plate: 'ABC-1234', duration: '2 小時', cost: '$485', status: '已完成' },
  { start: '2026-04-30T18:20', end: '2026-04-30T20:00', pickup: '大安站', dropoff: '忠孝敦化站', vehicle: 'Toyota RAV4', plate: 'HIJ-9012', duration: '1 小時 40 分', cost: '$420', status: '已完成' },
];

const sharedHeaderViews = {
  nearby: { title: '找車', home: true },
  vehicle: { title: '車輛詳情', back: 'nearby' },
  'order-confirm': { title: '確認訂單', back: 'vehicle' },
  'order-detail': { title: '訂單詳情', back: 'order-confirm' },
  scan: { title: 'AI 車況掃描', back: 'nearby' },
  'rental-ready': { title: '取車準備', back: 'scan' },
  renting: { title: '租借中', back: 'trips' },
  return: { title: '還車流程', back: 'nearby' },
  'return-summary': { title: '還車檢查摘要', back: 'scan' },
  'return-complete': { title: '還車完成', back: 'return-summary' },
  feedback: { title: '異常回饋', back: 'nearby' },
  assistant: { title: 'AI 助手', back: 'nearby' },
  trips: { title: '租借歷史', back: 'nearby' },
  points: { title: '點數紀錄', back: 'nearby' },
  support: { title: '客服中心', back: 'nearby' },
  settings: { title: '設定', back: 'nearby' },
};

// AI 客服僅顯示於一般功能頁，避免遮住取車、還車與檢查流程的主要操作按鈕。
const floatingAssistantViews = new Set(['nearby', 'vehicle', 'trips', 'points', 'settings']);

// 讀取本機登入狀態；瀏覽器禁止儲存資料時仍可正常使用網站預覽。
function readStoredUser() {
  try {
    const storedUser = window.localStorage.getItem(LOGIN_STORAGE_KEY);
    const user = storedUser ? JSON.parse(storedUser) : null;
    return user?.name && user?.initials ? user : null;
  } catch {
    return null;
  }
}

function isNativeApp() {
  return window.location.protocol === 'capacitor:' || Boolean(window.Capacitor?.isNativePlatform?.());
}

// 原生環境使用完整安全區域，避免內容被瀏海或主畫面指示條遮住。
function configureNativeViewport() {
  if (!isNativeApp()) return;

  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) return;

  const content = viewport.getAttribute('content') || '';
  if (!content.includes('viewport-fit=cover')) {
    viewport.setAttribute('content', `${content}, viewport-fit=cover`);
  }
}

// 組合 API 網址；未設定 API 網址時，網站會使用預設示範資料。
function apiUrl(pathname) {
  return `${API_BASE_URL}${pathname}`;
}

// 為 API 請求加入逾時控制，避免網路異常時畫面長時間等待。
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

// ------------------------------
// 相機功能：預覽、拍照、切換鏡頭與釋放資源。
// ------------------------------
function cameraScreenSelector(screenName) {
  return `[data-inspection-screen="${screenName}"]`;
}

function getCameraContainer(screenName) {
  const screen = document.querySelector(cameraScreenSelector(screenName));
  return screen?.querySelector('.inspection-camera, .cabin-camera');
}

function getCameraSlot(screenName) {
  return screenName === 'cabin-capture' ? 'cabin' : 'exterior';
}

function stopCurrentCamera() {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = undefined;
  document.querySelectorAll('.has-live-camera').forEach((container) => {
    container.classList.remove('has-live-camera');
  });
  document.querySelectorAll('.inspection-live-video').forEach((video) => {
    video.srcObject = null;
  });
}

function stopCamera() {
  cameraRequestId += 1;
  stopCurrentCamera();
}

function createLiveVideo(container) {
  let video = container.querySelector('.inspection-live-video');
  if (video) return video;

  video = document.createElement('video');
  video.className = 'inspection-live-video';
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('aria-label', '即時相機畫面');
  container.prepend(video);
  return video;
}

async function startCamera(screenName) {
  const container = getCameraContainer(screenName);
  if (!container) return false;

  const requestId = ++cameraRequestId;
  stopCurrentCamera();

  if (!navigator.mediaDevices?.getUserMedia) {
    showToast('此裝置或瀏覽器不支援相機功能');
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: cameraFacingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    if (requestId !== cameraRequestId) {
      stream.getTracks().forEach((track) => track.stop());
      return false;
    }

    cameraStream = stream;
    const video = createLiveVideo(container);
    video.srcObject = stream;
    container.classList.add('has-live-camera');
    await video.play().catch(() => {});
    return true;
  } catch (error) {
    console.warn('Unable to access device camera.', error);
    showToast('無法開啟相機，請允許相機權限後再試');
    return false;
  }
}

function revokeCapturedPhotos() {
  Object.values(capturedPhotos).flat().forEach((photo) => URL.revokeObjectURL(photo.url));
  capturedPhotos.exterior = [];
  capturedPhotos.cabin = [];
}

function updateCapturedPhotoPreview(screenName, photo) {
  const screen = document.querySelector(cameraScreenSelector(screenName));
  const thumbnail = screen?.querySelector('.inspection-thumbnails span.is-current, .inspection-thumbnails span');
  const thumbnailImage = thumbnail?.querySelector('i');

  if (thumbnailImage) {
    thumbnailImage.classList.add('has-captured-photo');
    thumbnailImage.style.backgroundImage = `url("${photo.url}")`;
  }

  const slot = getCameraSlot(screenName);
  const result = slot === 'cabin'
    ? document.querySelector('.return-cabin-result-screen .cabin-result-photo')
    : document.querySelector('.return-result-screen .inspection-result-car');
  if (result) {
    result.classList.add('has-captured-photo');
    result.style.backgroundImage = `url("${photo.url}")`;
  }
}

function capturePhoto(screenName) {
  const container = getCameraContainer(screenName);
  const video = container?.querySelector('.inspection-live-video');
  if (!video?.videoWidth || !video.videoHeight) {
    showToast('相機畫面尚未準備完成，請稍候再拍攝');
    return Promise.resolve(null);
  }

  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 1280 / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        showToast('照片產生失敗，請重新拍攝');
        resolve(null);
        return;
      }

      const photo = { blob, url: URL.createObjectURL(blob) };
      capturedPhotos[getCameraSlot(screenName)].push(photo);
      updateCapturedPhotoPreview(screenName, photo);
      resolve(photo);
    }, 'image/jpeg', 0.88);
  });
}

async function switchCamera() {
  if (!['recording', 'capture', 'cabin-capture'].includes(inspectionScreen)) return;
  cameraFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
  await startCamera(inspectionScreen);
}

// ------------------------------
// 車輛資料：建立預設 GeoJSON 與處理車輛顯示內容。
// ------------------------------
function createDefaultVehicles() {
  return {
    type: 'FeatureCollection',
    features: [
      vehicleFeature('yaris', 'IRE-2026', 'Toyota Yaris', 121.5324, 25.0451, 92, 3, 'available', '2026-08-24T09:39:00+08:00', 1, 3.2, 200, '汽油', 5, 'white'),
      vehicleFeature('corolla', 'IRE-2027', 'Toyota Corolla Cross', 121.5299, 25.0433, 86, 4, 'available', '2026-08-24T09:37:00+08:00', 3, 3.0, 400, '油電', 5, 'silver'),
      vehicleFeature('rav4', 'IRE-2028', 'Toyota RAV4', 121.5346, 25.0417, 78, 2, 'available', '2026-08-24T09:35:00+08:00', 4, 3.5, 500, '汽油', 5, 'white'),
      vehicleFeature('yaris-park', 'KLM-3456', 'Toyota Yaris', 121.5365, 25.0489, 89, 3, 'available', '2026-08-24T09:31:00+08:00', 5, 3.2, 360, '汽油', 5, 'white', false),
      vehicleFeature('corolla-west', 'NOP-7890', 'Toyota Corolla Cross', 121.5255, 25.0478, 83, 6, 'available', '2026-08-24T09:28:00+08:00', 6, 3.0, 420, '油電', 5, 'silver', false),
      vehicleFeature('rav4-river', 'QRS-2468', 'Toyota RAV4', 121.5395, 25.0408, 81, 2, 'available', '2026-08-24T09:25:00+08:00', 7, 3.5, 520, '汽油', 5, 'white', false),
    ],
  };
}

function vehicleFeature(id, plateNumber, displayName, longitude, latitude, healthScore, issueCount, status, updatedAt, walkMinutes, rate, distanceMeters = 120, fuelType = '汽油', doorCount = 5, bodyTone = 'white', showInList = true) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [longitude, latitude] },
    properties: { id, plateNumber, displayName, longitude, latitude, healthScore, issueCount, status, updatedAt, walkMinutes, rate, distanceMeters, fuelType, doorCount, bodyTone, showInList },
  };
}

function getProperties(feature) {
  return feature.properties || {};
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function vehicleTone(healthScore) {
  if (healthScore >= 88) return 'is-teal';
  if (healthScore >= 80) return 'is-blue';
  return 'is-slate';
}

function carIcon(bodyTone = 'white') {
  return `<svg class="vehicle-thumbnail vehicle-thumbnail--${escapeHtml(bodyTone)}" aria-hidden="true" viewBox="0 0 160 80">
    <ellipse class="car-shadow" cx="80" cy="67" rx="57" ry="7" />
    <path class="car-fill" d="M31 52 43 29c2-4 6-7 11-7h49c6 0 10 3 13 8l12 22c6 1 10 5 10 10v3H22v-3c0-5 3-9 9-10Z" />
    <path class="car-window" d="M49 28h48c4 0 7 2 9 6l6 11H39l6-12c1-3 2-5 4-5Z" />
    <path class="car-line" d="M79 28v17M39 48h82" />
    <circle class="car-wheel" cx="46" cy="61" r="9" /><circle class="car-wheel" cx="114" cy="61" r="9" />
    <circle class="car-hub" cx="46" cy="61" r="4" /><circle class="car-hub" cx="114" cy="61" r="4" />
    <path class="car-light" d="m29 50 8-2 5 6H29zM131 50l-8-2-5 6h13z" />
  </svg>`;
}

// 依搜尋關鍵字篩選車名、車牌與車輛狀態。
function filteredVehicles() {
  const keyword = searchInput.value.trim().toLowerCase();
  const listVehicles = allVehicles.features.filter((feature) => getProperties(feature).showInList !== false);
  if (!keyword) return listVehicles;
  return listVehicles.filter((feature) => {
    const properties = getProperties(feature);
    return `${properties.displayName} ${properties.plateNumber} ${properties.status}`.toLowerCase().includes(keyword);
  });
}

function renderVehicleList() {
  const features = filteredVehicles();
  countElement.textContent = features.length ? `距離你最近的 ${features.length} 台` : '找不到符合的車輛';
  listElement.replaceChildren();

  if (!features.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-list';
    empty.textContent = '找不到車輛，請換個關鍵字搜尋。';
    listElement.append(empty);
    return;
  }

  features.forEach((feature) => {
    const properties = getProperties(feature);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `nearby-row${properties.id === selectedVehicleId ? ' is-selected' : ''}`;
    row.dataset.vehicleId = properties.id;
    row.innerHTML = `
      <span class="row-car ${vehicleTone(Number(properties.healthScore))}">${carIcon(properties.bodyTone)}</span>
      <span class="row-name"><strong>${escapeHtml(properties.displayName)}</strong><small>${escapeHtml(properties.plateNumber)}</small><span class="row-specs"><em>${escapeHtml(properties.doorCount)}門</em><em>${escapeHtml(properties.fuelType)}</em></span></span>
      <span class="row-rate"><small class="row-distance">♟ 約 ${escapeHtml(properties.walkMinutes)} 分鐘・${escapeHtml((Number(properties.distanceMeters) / 1000).toFixed(1))} km</small><strong>$${escapeHtml(properties.rate)}<small> / 分鐘</small></strong></span>
    `;
    row.addEventListener('click', () => {
      selectVehicle(properties.id, true);
      setActiveView('vehicle');
    });
    listElement.append(row);
  });
}

function selectVehicle(vehicleId, flyTo) {
  const feature = allVehicles.features.find((item) => getProperties(item).id === vehicleId);
  if (!feature) return;

  selectedVehicleId = vehicleId;
  renderVehicleList();

  if (!map) return;
  const coordinates = feature.geometry.coordinates;
  if (flyTo) map.flyTo({ center: coordinates, zoom: 15.8, essential: true, duration: 500 });
  showVehiclePopup(feature);
}

function showVehiclePopup(feature) {
  const properties = getProperties(feature);
  document.querySelectorAll('.maplibregl-popup').forEach((popup) => popup.remove());
  new maplibregl.Popup({ closeButton: false, closeOnClick: true, offset: 16 })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(`<strong>${escapeHtml(properties.displayName)}</strong><span>${escapeHtml(properties.plateNumber)}・健康 ${escapeHtml(properties.healthScore)} 分</span>`)
    .addTo(map);
}

// ------------------------------
// MapLibre 地圖：建立底圖、車輛圖層與目前位置圖層。
// ------------------------------
function updateMapSource() {
  if (!map || !map.getSource('vehicles')) return;
  map.getSource('vehicles').setData(allVehicles);
}

// 建立目前位置的 GeoJSON，尚未取得 GPS 時先使用示範座標。
function currentLocationData() {
  const coordinates = currentLocation?.coordinates || [121.5311, 25.0442];
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'Point', coordinates },
      properties: { accuracy: currentLocation?.accuracy || 0 },
    }],
  };
}

// 將手機目前位置更新到地圖上的 GeoJSON 圖層。
function updateCurrentLocation(longitude, latitude, accuracy) {
  currentLocation = { coordinates: [longitude, latitude], accuracy };
  if (currentLocationLabel) currentLocationLabel.textContent = `目前位置：已定位（${latitude.toFixed(5)}, ${longitude.toFixed(5)}）`;
  const source = map?.getSource('current-location');
  source?.setData(currentLocationData());
}

// 讀取手機 GPS，定位地圖並顯示目前位置；網站需在 HTTPS 或 localhost 下才能取得定位。
function locateUser() {
  if (!map) {
    showToast('地圖尚未準備完成，請稍候再試');
    return;
  }

  if (!navigator.geolocation) {
    showToast('此裝置或瀏覽器不支援定位功能');
    return;
  }

  locateButton.disabled = true;
  locateButton.setAttribute('aria-busy', 'true');
  locateButton.classList.add('is-locating');

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const longitude = Number(coords.longitude);
      const latitude = Number(coords.latitude);
      const accuracy = Number(coords.accuracy);
      updateCurrentLocation(longitude, latitude, accuracy);
      map.flyTo({ center: [longitude, latitude], zoom: 15.4, essential: true, duration: 500 });
      showToast(`已取得目前位置${Number.isFinite(accuracy) ? `，誤差約 ${Math.round(accuracy)} 公尺` : ''}`);
      locateButton.disabled = false;
      locateButton.removeAttribute('aria-busy');
      locateButton.classList.remove('is-locating');
    },
    (error) => {
      const messages = {
        1: '請允許瀏覽器使用定位權限',
        2: '目前無法取得位置，請確認 GPS 已開啟',
        3: '定位逾時，請稍後再試',
      };
      showToast(messages[error.code] || '定位失敗，請稍後再試');
      locateButton.disabled = false;
      locateButton.removeAttribute('aria-busy');
      locateButton.classList.remove('is-locating');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
  );
}

function createMapBackdrop() {
  return {
    roads: {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[121.519, 25.039], [121.544, 25.046], [121.5435, 25.0472], [121.5185, 25.0402], [121.519, 25.039]]] }, properties: {} },
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[121.521, 25.047], [121.543, 25.038], [121.544, 25.0394], [121.522, 25.0484], [121.521, 25.047]]] }, properties: {} },
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[121.5285, 25.036], [121.531, 25.051], [121.5324, 25.0508], [121.5299, 25.0358], [121.5285, 25.036]]] }, properties: {} },
      ],
    },
    blocks: {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[121.521, 25.045], [121.525, 25.045], [121.525, 25.048], [121.521, 25.048], [121.521, 25.045]]] }, properties: {} },
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[121.535, 25.044], [121.539, 25.044], [121.539, 25.048], [121.535, 25.048], [121.535, 25.044]]] }, properties: {} },
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[121.522, 25.037], [121.526, 25.037], [121.526, 25.040], [121.522, 25.040], [121.522, 25.037]]] }, properties: {} },
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[121.537, 25.036], [121.542, 25.036], [121.542, 25.040], [121.537, 25.040], [121.537, 25.036]]] }, properties: {} },
      ],
    },
  };
}

async function fetchVehicleMapSummary() {
  if (isNativeApp() && !API_BASE_URL) {
    showToast('請先設定後端 API 網址，目前顯示示範車輛');
    return;
  }

  try {
    const response = await fetchWithTimeout(apiUrl('/api/v1/vehicles/map-summary'));
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const collection = await response.json();
    if (collection?.type !== 'FeatureCollection' || !Array.isArray(collection.features) || !collection.features.length) return;

    const validFeatures = collection.features.map((feature, index) => {
      const properties = feature.properties || feature;
      return vehicleFeature(
        properties.id || `vehicle-${index}`,
        properties.plateNumber || '未提供車牌',
        properties.displayName || properties.vehicleName || `iRent 車輛 ${index + 1}`,
        Number(properties.longitude ?? feature.geometry?.coordinates?.[0]),
        Number(properties.latitude ?? feature.geometry?.coordinates?.[1]),
        Number(properties.healthScore ?? 80),
        Number(properties.issueCount ?? 0),
        properties.status || 'available',
        properties.updatedAt || '',
        Number(properties.walkMinutes ?? index * 2 + 2),
        Number(properties.rate ?? 3.2),
        Number(properties.distanceMeters ?? (index + 1) * 80 + 40),
        properties.fuelType || '汽油',
        Number(properties.doorCount ?? 5),
        properties.bodyTone || 'white',
      );
    }).filter((feature) => Number.isFinite(feature.geometry.coordinates[0]) && Number.isFinite(feature.geometry.coordinates[1]));

    if (!validFeatures.length) throw new Error('Vehicle map API returned no valid coordinates');

    allVehicles = {
      type: 'FeatureCollection',
      features: validFeatures,
    };

    if (!allVehicles.features.some((feature) => getProperties(feature).id === selectedVehicleId)) {
      selectedVehicleId = allVehicles.features[0]?.properties.id;
    }

    updateMapSource();
    renderVehicleList();
  } catch (error) {
    console.warn('Vehicle map API unavailable; using default vehicles.', error);
    showToast('車輛資料暫時無法更新，目前顯示示範車輛');
    // 後端尚未啟動或 API 尚未實作時，維持畫面預覽的 GeoJSON 資料。
  }
}

// ------------------------------
// 頁面切換與流程狀態控制。
// ------------------------------
function vehicleMarkerImageUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="32" viewBox="0 0 48 32">
    <path d="M6 20 10 11c1-2 3-3 6-3h13c3 0 5 1 7 4l3 8c4 1 6 3 6 6v1H1v-1c0-3 2-5 5-6Z" fill="#273942" stroke="#17272f" stroke-width="1.5"/>
    <path d="m14 11 3-3h12c2 0 4 1 5 3l2 4H11l3-4Z" fill="#9fb1b7" stroke="#3d545d" stroke-width="1.2"/>
    <path d="M24 8v7M11 17h26" fill="none" stroke="#dbe6e8" stroke-width="1.2"/>
    <circle cx="11" cy="25" r="4" fill="#17272f"/><circle cx="37" cy="25" r="4" fill="#17272f"/>
    <circle cx="11" cy="25" r="1.7" fill="#aebdc2"/><circle cx="37" cy="25" r="1.7" fill="#aebdc2"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// 加入找車頁面的icon
function addVehicleIconLayer() {
  const image = new Image();

  image.onload = () => {
    if (!map.hasImage('vehicle-car')) {
      map.addImage('vehicle-car', image, { pixelRatio: 2 });
    }

    map.addLayer({
      id: 'vehicle-icon',
      type: 'symbol',
      source: 'vehicles',
      layout: {
        'icon-image': 'vehicle-car',
        'icon-size': 0.85,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  };

  image.onerror = () => {
    console.error('車輛圖示載入失敗');
  };

  image.src = vehicleMarkerImageUrl();
}

function initMap() {
  if (!mapElement) return;
  if (!window.maplibregl) {
    mapPanel.classList.add('is-map-error');
    fallbackElement?.setAttribute('aria-hidden', 'false');
    return;
  }

  map = new maplibregl.Map({
    container: mapElement,
    // MapLibre GL JS 使用 OpenStreetMap 圖磚建立實際底圖，車輛資料仍由 GeoJSON 圖層提供。
    style: {
      version: 8,
      sources: {
        openstreetmap: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [{ id: 'openstreetmap-tiles', type: 'raster', source: 'openstreetmap' }],
    },
    center: [121.532, 25.044],
    zoom: 14.9,
    attributionControl: true,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  map.on('load', () => {
    mapPanel.classList.add('is-map-ready');
    fallbackElement.setAttribute('aria-hidden', 'true');

    map.addSource('vehicles', { type: 'geojson', data: allVehicles });
    map.addSource('current-location', {
      type: 'geojson',
      data: currentLocationData(),
    });

    map.addLayer({
      id: 'vehicle-shadow',
      type: 'circle',
      source: 'vehicles',
      paint: { 'circle-radius': 20, 'circle-color': '#00a79b', 'circle-opacity': 0.16 },
    });
    map.addLayer({
      id: 'vehicle-circle',
      type: 'circle',
      source: 'vehicles',
      paint: {
        'circle-radius': 22,
        'circle-color': '#ffffff',
        'circle-opacity': 0.98,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#e7f0ef',
      },
    });
    addVehicleIconLayer();
    map.addLayer({ id: 'vehicle-badge', type: 'circle', source: 'vehicles', paint: { 'circle-radius': 10, 'circle-color': '#00a79b', 'circle-translate': [15, 15], 'circle-translate-anchor': 'viewport' } });
    map.addLayer({ id: 'vehicle-badge-text', type: 'symbol', source: 'vehicles', layout: { 'text-field': ['to-string', ['get', 'issueCount']], 'text-size': 11, 'text-offset': [1.35, 1.35], 'text-allow-overlap': true }, paint: { 'text-color': '#ffffff' } });
    map.addLayer({ id: 'current-location-halo', type: 'circle', source: 'current-location', paint: { 'circle-radius': 30, 'circle-color': '#5a9ee9', 'circle-opacity': 0.16 } });
    map.addLayer({ id: 'current-location', type: 'circle', source: 'current-location', paint: { 'circle-radius': 11, 'circle-color': '#1689e8', 'circle-stroke-width': 4, 'circle-stroke-color': '#ffffff' } });

    map.on('click', 'vehicle-circle', (event) => {
      const feature = event.features?.[0];
      if (feature) selectVehicle(feature.properties.id, false);
    });
    map.on('mouseenter', 'vehicle-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'vehicle-circle', () => { map.getCanvas().style.cursor = ''; });
  });

  map.on('error', () => {
    // MapLibre 載入失敗時顯示提示，不再以 CSS 假地圖取代實際地圖。
    if (!mapPanel.classList.contains('is-map-ready')) {
      mapPanel.classList.add('is-map-error');
      fallbackElement?.setAttribute('aria-hidden', 'false');
    }
  });
}

function setMenuOpen(isOpen) {
  functionMenu.classList.toggle('is-open', isOpen);
  menuBackdrop.classList.toggle('is-open', isOpen);
  functionMenu.setAttribute('aria-hidden', String(!isOpen));
  menuToggle.setAttribute('aria-expanded', String(isOpen));
}

// 開啟或關閉共用通知面板，所有頁面的右上角鈴鐺都使用同一個面板。
function setNotificationOpen(isOpen) {
  if (!notificationPanel) return;

  notificationPanel.classList.toggle('is-open', isOpen);
  notificationPanel.setAttribute('aria-hidden', String(!isOpen));
  notificationButtons.forEach((button) => button.setAttribute('aria-expanded', String(isOpen)));
}

// 預覽版的通知讀取狀態：移除未讀樣式並隱藏鈴鐺紅點。
function markNotificationsRead() {
  notificationPanel?.querySelectorAll('.notification-item.is-unread').forEach((item) => item.classList.remove('is-unread'));
  notificationButtons.forEach((button) => {
    const badge = button.querySelector('i');
    if (badge) badge.hidden = true;
  });
  setNotificationOpen(false);
  showToast('通知已全部標記為已讀');
}

// 同步設定頁的會員卡與登入視窗狀態。
function updateProfileUI() {
  const profileInitials = document.querySelector('[data-profile-initials]');
  const profileName = document.querySelector('[data-profile-name]');
  const profileStatus = document.querySelector('[data-profile-status]');
  const isLoggedIn = Boolean(currentUser);

  if (profileInitials) profileInitials.textContent = isLoggedIn ? currentUser.initials : '訪';
  if (profileName) profileName.textContent = isLoggedIn ? currentUser.name : '登入會員';
  if (profileStatus) profileStatus.textContent = isLoggedIn ? '一般會員・已登入' : '登入後查看會員資料';
  if (loginLogoutButton) loginLogoutButton.hidden = !isLoggedIn;
}

// 控制登入視窗，開啟時自動將游標放到帳號欄位。
function setLoginModalOpen(isOpen) {
  if (!loginModal) return;

  loginModal.classList.toggle('is-open', isOpen);
  loginModal.setAttribute('aria-hidden', String(!isOpen));
  if (isOpen) {
    if (loginError) loginError.textContent = '';
    window.setTimeout(() => loginAccountInput?.focus(), 0);
  }
}

// 前端示範登入：驗證欄位後將會員資料保存於 localStorage。
function handleLoginSubmit(event) {
  event.preventDefault();
  const account = loginAccountInput?.value.trim() || '';
  const password = loginPasswordInput?.value || '';

  if (account.length < 3) {
    if (loginError) loginError.textContent = '請輸入至少 3 個字元的帳號或手機號碼。';
    loginAccountInput?.focus();
    return;
  }

  if (password.length < 4) {
    if (loginError) loginError.textContent = '密碼至少需要 4 個字元。';
    loginPasswordInput?.focus();
    return;
  }

  const name = account.includes('@') ? account.split('@')[0] : `會員 ${account.slice(-4)}`;
  currentUser = { name, initials: name.slice(0, 2), account };
  try {
    window.localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(currentUser));
  } catch {
    // localStorage 不可用時仍保留目前頁面的登入狀態。
  }

  updateProfileUI();
  setLoginModalOpen(false);
  loginForm?.reset();
  showToast('登入成功');
}

function handleLogout() {
  currentUser = null;
  try {
    window.localStorage.removeItem(LOGIN_STORAGE_KEY);
  } catch {
    // localStorage 不可用時只清除目前頁面的登入狀態。
  }
  updateProfileUI();
  setLoginModalOpen(false);
  showToast('已登出目前帳號');
}

// 依開始時間、站點與車輛關鍵字篩選租借歷史。
function filteredRentalHistory() {
  const startDate = historyStartInput?.value || '';
  const endDate = historyEndInput?.value || '';
  const station = historyStationSelect?.value || '';
  const keyword = historyKeywordInput?.value.trim().toLowerCase() || '';

  return rentalHistoryRecords.filter((record) => {
    const recordDate = record.start.slice(0, 10);
    const searchableText = `${record.vehicle} ${record.plate} ${record.pickup} ${record.dropoff}`.toLowerCase();
    if (startDate && recordDate < startDate) return false;
    if (endDate && recordDate > endDate) return false;
    if (station && record.pickup !== station && record.dropoff !== station) return false;
    if (keyword && !searchableText.includes(keyword)) return false;
    return true;
  });
}

function formatHistoryDateTime(value) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value)).replace(/\//g, '/');
}

// 將篩選後的租借紀錄繪製到畫面上。
function renderRentalHistory() {
  if (!historyRecordList) return;

  const records = filteredRentalHistory();
  if (historyResultCount) historyResultCount.textContent = `共 ${records.length} 筆租借紀錄`;
  historyRecordList.replaceChildren();

  if (!records.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'history-empty-state';
    emptyState.textContent = '找不到符合條件的租借紀錄。';
    historyRecordList.append(emptyState);
    return;
  }

  records.forEach((record) => {
    const item = document.createElement('article');
    item.className = 'history-record';
    item.innerHTML = `
      <div class="history-record__heading"><strong>${escapeHtml(record.vehicle)}</strong><span>${escapeHtml(record.status)}</span><small>${escapeHtml(record.plate)}</small></div>
      <div class="history-record__times"><div><small>開始時間</small><strong>${escapeHtml(formatHistoryDateTime(record.start))}</strong></div><i aria-hidden="true"></i><div><small>結束時間</small><strong>${escapeHtml(formatHistoryDateTime(record.end))}</strong></div></div>
      <div class="history-record__details"><span>取車：${escapeHtml(record.pickup)}</span><span>還車：${escapeHtml(record.dropoff)}</span><span>${escapeHtml(record.duration)}</span><b>${escapeHtml(record.cost)}</b></div>
    `;
    historyRecordList.append(item);
  });
}

// 更新共用上方 Bar 的標題、返回按鈕與首頁狀態。
function updateSharedHeader(viewName) {
  const config = sharedHeaderViews[viewName] || sharedHeaderViews.nearby;
  if (!appHeader) return;

  const hasHeaderTitle = Boolean(config.title?.trim());
  appHeader.classList.toggle('is-home', Boolean(config.home));
  appHeader.classList.toggle('is-empty', !hasHeaderTitle);
  nearbyApp?.classList.toggle('has-empty-header', !hasHeaderTitle);
  if (appHeaderTitle) appHeaderTitle.textContent = config.title;
  if (appHeaderBack) {
    appHeaderBack.hidden = !config.back;
    appHeaderBack.dataset.backView = config.back || '';
    appHeaderBack.setAttribute('aria-label', config.back ? `返回${sharedHeaderViews[config.back]?.title || '上一頁'}` : '返回上一頁');
  }
}

function setActiveView(viewName) {
  if (viewName !== 'scan') stopCamera();
  updateSharedHeader(viewName);
  nearbyViews.forEach((element) => element.classList.toggle('is-hidden', viewName !== 'nearby'));
  viewPanels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.viewPanel === viewName));
  menuActionButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.view === viewName));
  const isTakeCarFlow = ['order-confirm', 'order-detail', 'scan', 'rental-ready'].includes(viewName);
  const isRentingView = viewName === 'renting';
  const isReturnFlow = ['return', 'return-summary', 'return-complete'].includes(viewName);
  navigationButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.navView === viewName || (viewName === 'vehicle' && button.dataset.navView === 'nearby') || (isTakeCarFlow && button.classList.contains('take-car')) || (isReturnFlow && button.classList.contains('take-car')) || (isRentingView && button.dataset.navView === 'trips')));
  floatingAssistantButton?.toggleAttribute('hidden', !floatingAssistantViews.has(viewName));
  if (viewName === 'return') setReturnScreen('choice');
  if (viewName === 'nearby' && map) window.setTimeout(() => map.resize(), 0);
}

function resizeMap() {
  if (!map) return;
  window.requestAnimationFrame(() => map.resize());
}

function setInspectionScreen(screenName) {
  inspectionScreen = screenName;
  inspectionScreens.forEach((screen) => screen.classList.toggle('is-active', screen.dataset.inspectionScreen === screenName));
  if (screenName === 'recording') updateInspectionProgress();
  if (['recording', 'capture', 'cabin-capture'].includes(screenName)) {
    void startCamera(screenName);
  } else {
    stopCamera();
  }
}

function updateInspectionProgress() {
  if (scanCount) scanCount.textContent = `${scanProgress} / 8`;
}

function updateReturnTimer() {
  if (!returnTimer) return;
  const minutes = String(Math.floor(returnTimerSeconds / 60)).padStart(2, '0');
  const seconds = String(returnTimerSeconds % 60).padStart(2, '0');
  returnTimer.textContent = `${minutes}:${seconds}`;
}

function setReturnScreen(screenName) {
  returnScreens.forEach((screen) => screen.classList.toggle('is-active', screen.dataset.returnScreen === screenName));
  if (screenName !== 'active') {
    window.clearInterval(returnTimerInterval);
    return;
  }

  returnTimerSeconds = 600;
  updateReturnTimer();
  window.clearInterval(returnTimerInterval);
  returnTimerInterval = window.setInterval(() => {
    returnTimerSeconds = Math.max(0, returnTimerSeconds - 1);
    updateReturnTimer();
    if (!returnTimerSeconds) window.clearInterval(returnTimerInterval);
  }, 1000);
}

function updateAssistantResponse(prompt) {
  const responses = {
    '這台車可以借嗎？': 'Toyota Yaris 的健康分數為 92 分，外觀正常、車內乾淨，目前可以安心取車。',
    '掃描要怎麼做？': '請距離車輛約 2～3 公尺，按下開始掃描後繞車一圈；系統會依 8 個角度自動取圖。',
    '最近還車點在哪？': '最近可還車點是市民大道停車場，距離約 0.7 公里，預計 6 分鐘可以抵達。',
    '無法解鎖怎麼辦？': '請先確認藍牙與定位功能已開啟，並靠近車輛重新點擊解鎖；若仍無法開啟，請聯絡人工客服協助。',
    '發現刮痕如何處理？': '請先拍攝清楚的車損照片並提交異常回報，系統會比對歷史紀錄，再協助您判斷是否可以安心取車。',
    '如何延長租借時間？': '請在租借結束前從行程頁點選延長租借，系統會依車輛後續預約狀況顯示可延長時間與費用。',
  };
  if (assistantResponse) assistantResponse.textContent = responses[prompt] || '請稍候，客服小助手正在整理相關資訊。';
}

// ------------------------------
// AI 助手與全域提示訊息。
// ------------------------------
function setAssistantScreen(screenName) {
  assistantScreens.forEach((screen) => screen.classList.toggle('is-active', screen.dataset.assistantScreen === screenName));
}

function showToast(message) {
  const toast = document.querySelector('[data-app-toast]');
  if (!toast) return;

  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function submitAssistantQuestion(button) {
  const composer = button.closest('.assistant-composer, .assistant-case-composer');
  const input = composer?.querySelector('input');
  const question = input?.value.trim();

  if (!question) {
    showToast('請先輸入想詢問的內容');
    input?.focus();
    return;
  }

  if (assistantResponse) assistantResponse.textContent = `已收到：「${question}」；客服正在為你查詢。`;
  if (input) input.value = '';
  setAssistantScreen('case');
}

// 未被主要流程使用的按鈕，統一顯示預覽提示或處理簡單互動。
function handleUnboundButton(button) {
  if (button.matches('.feedback-options button')) {
    document.querySelectorAll('.feedback-options button').forEach((option) => option.classList.toggle('is-selected', option === button));
    showToast(`已選擇「${button.textContent.trim()}」`);
    return;
  }

  if (button.matches('.assistant-composer button, .assistant-case-composer button')) {
    submitAssistantQuestion(button);
    return;
  }

  if (button.matches('[data-return-summary-report]')) {
    showToast('詳細報告已準備完成');
    return;
  }

  if (button.matches('.favorite-button')) {
    const isFavorite = button.classList.toggle('is-favorite');
    button.setAttribute('aria-pressed', String(isFavorite));
    button.textContent = isFavorite ? '♥' : '♡';
    showToast(isFavorite ? '已加入收藏' : '已取消收藏');
    return;
  }

  if (button.matches('.assistant-history')) {
    showToast('服務紀錄已開啟');
    return;
  }

  if (button.matches('.assistant-case-actions button:not([data-nav-view])')) {
    showToast('功能已開啟，請依畫面指示操作');
    return;
  }

  if (button.matches('.support-list button')) {
    showToast(`已開啟「${button.querySelector('strong')?.textContent.trim() || '客服項目'}」`);
    return;
  }

  if (button.matches('.support-call, .completion-headset')) {
    showToast('線上客服已準備好為你服務');
    return;
  }

  if (button.matches('.settings-list button')) {
    showToast(`已開啟「${button.querySelector('span')?.textContent.trim() || '設定'}」`);
    return;
  }

  if (button.matches('.notification-button, .detail-notification, .order-notification, .inspection-notification, .return-notification')) {
    setNotificationOpen(true);
    return;
  }

  if (button.matches('.return-info-link')) {
    showToast('逾時費用將依實際使用時間計算');
    return;
  }

  if (button.matches('.rental-history-card header button, .history-card button')) {
    showToast('完整紀錄已開啟');
    return;
  }

  if (button.matches('.more-info-bar button, .inspection-help, .rental-help, [aria-label="說明"]')) {
    showToast('說明內容已開啟');
    return;
  }

  const label = button.textContent.trim().replace(/\s+/g, ' ');
  showToast(label ? `${label}已開啟` : '功能已開啟');
}

// ------------------------------
// 全域事件與各流程按鈕事件綁定。
// ------------------------------
document.addEventListener('click', (event) => {
  const button = event.target.closest?.('button');
  if (!button) return;

  const handledByExistingFlow = button.matches([
    '[data-menu-toggle]', '[data-menu-close]', '[data-menu-action]',
    '[data-refresh-vehicles]', '[data-quick-rent]', '[data-locate]', '[data-nav-view]',
    '[data-notification-close]', '[data-notification-mark-read]',
    '.notification-button', '.detail-notification', '.order-notification', '.inspection-notification', '.return-notification',
    '[data-login-open]', '[data-login-close]', '[data-login-logout]',
    '[data-floating-assistant]',
    '[data-shared-back]', '[data-history-reset]',
    '[data-vehicle-id]', '[data-scan-start]', '[data-scan-record-next]', '[data-scan-capture-next]',
    '[data-inspection-back]', '[data-scan-cabin-next]', '[data-cabin-capture-next]', '[data-feedback-submit]',
    '[data-assistant-prompt]', '[data-assistant-case]', '[data-assistant-home]', '[data-return-start]',
    '[data-return-scan-start]', '[data-return-submit]', '[data-return-result-back]', '[data-cabin-return-submit]',
    '[data-cabin-recheck]', '[data-return-summary-back]', '[data-return-complete-back]', '[data-return-summary-next]',
    '[data-return-finish]',
  ].join(','));

  if (!handledByExistingFlow) handleUnboundButton(button);
});

searchInput.addEventListener('input', renderVehicleList);
menuToggle.addEventListener('click', () => setMenuOpen(true));
menuCloseButtons.forEach((button) => button.addEventListener('click', () => setMenuOpen(false)));
notificationButtons.forEach((button) => {
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    setNotificationOpen(true);
  });
});
notificationCloseButton?.addEventListener('click', () => setNotificationOpen(false));
notificationMarkReadButton?.addEventListener('click', markNotificationsRead);
document.addEventListener('click', (event) => {
  if (!notificationPanel?.classList.contains('is-open')) return;
  if (event.target.closest?.('.notification-panel, .notification-button, .detail-notification, .order-notification, .inspection-notification, .return-notification')) return;
  setNotificationOpen(false);
});
loginOpenButtons.forEach((button) => button.addEventListener('click', () => setLoginModalOpen(true)));
loginCloseButton?.addEventListener('click', () => setLoginModalOpen(false));
loginForm?.addEventListener('submit', handleLoginSubmit);
loginLogoutButton?.addEventListener('click', handleLogout);
loginModal?.addEventListener('click', (event) => {
  if (event.target === loginModal) setLoginModalOpen(false);
});
appHeaderBack?.addEventListener('click', () => {
  const targetView = appHeaderBack.dataset.backView || 'nearby';
  if (targetView === 'scan') setInspectionScreen('start');
  setActiveView(targetView);
});
historyFilters?.addEventListener('input', renderRentalHistory);
historyFilters?.addEventListener('change', renderRentalHistory);
historyFilters?.addEventListener('reset', () => window.setTimeout(renderRentalHistory, 0));
refreshVehiclesButton.addEventListener('click', async () => {
  refreshVehiclesButton.classList.add('is-refreshing');
  refreshVehiclesButton.disabled = true;

  try {
    await fetchVehicleMapSummary();
  } finally {
    renderVehicleList();
    refreshVehiclesButton.disabled = false;
    window.setTimeout(() => refreshVehiclesButton.classList.remove('is-refreshing'), 450);
  }
});
quickRentButton.addEventListener('click', () => { setActiveView('scan'); setInspectionScreen('start'); });
locateButton.addEventListener('click', locateUser);
floatingAssistantButton?.addEventListener('click', () => {
  setMenuOpen(false);
  setAssistantScreen('home');
  setActiveView('assistant');
});
menuActionButtons.forEach((button) => button.addEventListener('click', () => {
  setActiveView(button.dataset.view);
  setMenuOpen(false);
}));
navigationButtons.forEach((button) => button.addEventListener('click', () => {
  if (button.dataset.navView === 'scan') setInspectionScreen('start');
  setActiveView(button.dataset.navView);
}));
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  setMenuOpen(false);
  setNotificationOpen(false);
  setLoginModalOpen(false);
});
scanButton.addEventListener('click', () => { revokeCapturedPhotos(); scanProgress = 3; setInspectionScreen('recording'); });
scanRecordNext.addEventListener('click', () => { scanProgress = 4; setInspectionScreen('capture'); });
scanCaptureNext.addEventListener('click', async () => {
  scanCaptureNext.disabled = true;
  const photo = await capturePhoto('capture');
  if (photo) setInspectionScreen('result');
  scanCaptureNext.disabled = false;
});
scanBackButtons.forEach((button) => button.addEventListener('click', () => setInspectionScreen('start')));
scanCabinNext?.addEventListener('click', () => setInspectionScreen('cabin-capture'));
cabinCaptureNext.addEventListener('click', async () => {
  cabinCaptureNext.disabled = true;
  const photo = await capturePhoto('cabin-capture');
  if (photo) setInspectionScreen('cabin-clean');
  cabinCaptureNext.disabled = false;
});
feedbackSubmit.addEventListener('click', () => setActiveView('nearby'));
assistantPrompts.forEach((button) => button.addEventListener('click', () => {
  updateAssistantResponse(button.dataset.assistantPrompt);
  setAssistantScreen('case');
}));
assistantCaseButtons.forEach((button) => button.addEventListener('click', () => setAssistantScreen('case')));
assistantHomeButtons.forEach((button) => button.addEventListener('click', () => setAssistantScreen('home')));
returnStartButtons.forEach((button) => button.addEventListener('click', () => {
  setActiveView('return');
  setReturnScreen('active');
}));
returnScanStartButtons.forEach((button) => button.addEventListener('click', () => {
  revokeCapturedPhotos();
  setActiveView('scan');
  setInspectionScreen('recording');
}));
returnSubmitButton.addEventListener('click', () => {
  setInspectionScreen('cabin-capture');
});
returnResultBackButton.addEventListener('click', () => {
  setActiveView('return');
  setReturnScreen('active');
});
cabinReturnButtons.forEach((button) => button.addEventListener('click', () => {
  setActiveView('return-summary');
}));
cabinRecheckButtons.forEach((button) => button.addEventListener('click', () => setInspectionScreen('cabin-capture')));
returnSummaryBackButton.addEventListener('click', () => {
  setActiveView('scan');
  setInspectionScreen('cabin-clean');
});
returnCompleteBackButton.addEventListener('click', () => setActiveView('return-summary'));
returnSummaryButton.addEventListener('click', () => setActiveView('return-complete'));
returnFinishButton.addEventListener('click', () => setActiveView('nearby'));
cameraSwitchButtons.forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation();
  void switchCamera();
}));
window.addEventListener('resize', resizeMap, { passive: true });
window.addEventListener('orientationchange', resizeMap, { passive: true });
window.visualViewport?.addEventListener('resize', resizeMap, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopCamera();
    return;
  }

  resizeMap();
  if (['recording', 'capture', 'cabin-capture'].includes(inspectionScreen)) void startCamera(inspectionScreen);
});

// ------------------------------
// 啟動順序：設定環境、初始化頁面、清單、地圖與後端資料。
// ------------------------------
configureNativeViewport();
updateProfileUI();
setActiveView('nearby');
setInspectionScreen(inspectionScreen);
// 等頁面完成首次版面配置後再產生清單，避免右側欄在初始繪製時漏顯示。
requestAnimationFrame(() => renderVehicleList());
renderRentalHistory();
initMap();
fetchVehicleMapSummary();
