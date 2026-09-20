/* ============================================================
   منطق لوحة تتبع المركبات — بيانات تجريبية (Mock)
   ============================================================ */

let selectedTripId = null;
let selectedDeviceFilter = 'all';
let selectedVehicleFilter = 'all';
let searchQuery = '';
let dateFrom = '';
let dateTo = '';
let animFrame = null;
let map, deviceMarkersLayer, routeLayer, vehicleAnimMarker;

const DATE_LOCALE = 'ar-IQ-u-nu-latn-ca-gregory';

const fmtTime = iso => new Date(iso).toLocaleString(DATE_LOCALE, {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
});
const fmtTimeShort = iso => new Date(iso).toLocaleTimeString(DATE_LOCALE, { hour: '2-digit', minute: '2-digit' });

const STATUS_LABEL = { online: 'متصل', offline: 'غير متصل', warning: 'تحذير' };
const TRIP_STATUS_LABEL = { completed: 'مكتملة', 'in-transit': 'قيد التنفيذ', scheduled: 'مجدولة' };
const DIR_LABEL = { IN: 'دخول', OUT: 'خروج' };

/* ---------------- إعداد الخريطة ---------------- */
function initMap() {
  map = L.map('map', { zoomControl: true }).setView([32.8, 44.5], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19,
    className: 'dark-tiles',
  }).addTo(map);

  deviceMarkersLayer = L.layerGroup().addTo(map);
  routeLayer = L.layerGroup().addTo(map);

  renderDeviceMarkers();
}

function statusEmoji(status) {
  return status === 'online' ? '●' : status === 'warning' ? '!' : '×';
}

function renderDeviceMarkers() {
  deviceMarkersLayer.clearLayers();
  DEVICES.forEach(dev => {
    const icon = L.divIcon({
      className: '',
      html: `<div class="device-icon ${dev.status}">${statusEmoji(dev.status)}</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    const marker = L.marker([dev.lat, dev.lng], { icon }).addTo(deviceMarkersLayer);
    marker.bindPopup(buildDevicePopup(dev));
    marker.on('popupopen', () => {
      const btn = document.getElementById('popup-btn-' + dev.id);
      if (btn) btn.addEventListener('click', () => {
        selectedDeviceFilter = dev.id;
        selectedVehicleFilter = 'all';
        switchTab('transactions');
        renderTransactions();
      });
    });
  });
}

function buildDevicePopup(dev) {
  const recent = TRANSACTIONS.filter(t => t.deviceId === dev.id).length;
  return `
    <div class="popup-title">${dev.name}</div>
    <div class="popup-row">المدينة: ${dev.city}</div>
    <div class="popup-row">النوع: ${dev.type}</div>
    <div class="popup-row">الحالة: ${STATUS_LABEL[dev.status]}</div>
    <div class="popup-row">عدد القراءات المسجلة: ${recent}</div>
    <button class="popup-btn" id="popup-btn-${dev.id}">عرض المعاملات</button>
  `;
}

/* ---------------- البحث عن مركبة ---------------- */
const normalize = str => (str || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

function vehicleMatchesQuery(vehicle, q) {
  if (!q) return true;
  const nq = normalize(q);
  return normalize(vehicle.plate).includes(nq)
    || normalize(vehicle.driver).includes(nq)
    || normalize(vehicle.tagId).includes(nq);
}

/* يبحث عن راكب مطابق للاستعلام ضمن قائمة ركاب رحلة معينة */
function findMatchingPassenger(trip, q) {
  const m = MANIFESTS[trip.id];
  if (!m) return null;
  const nq = normalize(q);
  return m.passengers.find(p =>
    normalize(p.name).includes(nq)
    || normalize(p.nationalId).includes(nq)
    || normalize(p.phone).includes(nq)
  ) || null;
}

/* يحدد ما إذا كانت الرحلة تطابق نص البحث (عبر المركبة أو أحد الركاب) */
function tripMatchesQuery(trip, q) {
  if (!q) return { match: true, reason: null, passenger: null };
  if (vehicleMatchesQuery(vehicleById(trip.vehicleId), q)) {
    return { match: true, reason: 'vehicle', passenger: null };
  }
  const passenger = findMatchingPassenger(trip, q);
  if (passenger) return { match: true, reason: 'passenger', passenger };
  return { match: false, reason: null, passenger: null };
}

/* يتحقق أن تاريخ الرحلة (YYYY-MM-DD) يقع ضمن النطاق الزمني المحدد */
function dateInRange(dateStr) {
  if (dateFrom && dateStr < dateFrom) return false;
  if (dateTo && dateStr > dateTo) return false;
  return true;
}

/* ---------------- قائمة الرحلات ---------------- */
function renderTripList() {
  const list = document.getElementById('trip-list');
  const q = searchQuery.trim();

  document.getElementById('vehicle-search').parentElement.classList.toggle('has-query', !!q);
  document.getElementById('date-filter').classList.toggle('has-range', !!(dateFrom || dateTo));

  const results = TRIPS
    .map(trip => ({ trip, info: tripMatchesQuery(trip, q) }))
    .filter(x => x.info.match && dateInRange(x.trip.startTime.slice(0, 10)));

  list.innerHTML = '';
  if (results.length === 0) {
    const msg = q ? 'لا توجد رحلات مطابقة لبحثك.' : 'لا توجد رحلات ضمن النطاق الزمني المحدد.';
    list.innerHTML = `<div class="empty-state">${msg}</div>`;
  } else {
    results.forEach(({ trip, info }) => {
      const v = vehicleById(trip.vehicleId);
      const card = document.createElement('div');
      card.className = 'trip-card' + (trip.id === selectedTripId ? ' active' : '');
      card.innerHTML = `
        <div class="trip-card-top">
          <span class="trip-plate">${v.plate}</span>
          <span class="badge ${trip.status}">${TRIP_STATUS_LABEL[trip.status]}</span>
        </div>
        <div class="trip-route-line">من ${trip.origin} إلى ${trip.destination}</div>
        ${info.reason === 'passenger' ? `<div class="trip-passenger-match">👤 راكب مطابق: ${info.passenger.name}</div>` : ''}
        <div class="trip-meta">
          <span>${v.type}</span>
          <span>${trip.route.length} قراءة</span>
        </div>
      `;
      card.addEventListener('click', () => selectTrip(trip.id, info.reason === 'passenger' ? 'manifest' : 'route'));
      list.appendChild(card);
    });
  }

  renderSearchExtras(q);

  // إذا كانت نتيجة البحث رحلة واحدة فقط، اخترها تلقائياً وأظهرها
  if (q && results.length === 1 && results[0].trip.id !== selectedTripId) {
    selectTrip(results[0].trip.id, results[0].info.reason === 'passenger' ? 'manifest' : 'route');
  }
}

/* مركبات مطابقة للبحث لكن بلا رحلة مسجّلة (مثل مركبات القراءات العابرة) */
function renderSearchExtras(q) {
  const container = document.getElementById('search-extra');
  if (!q) { container.innerHTML = ''; return; }

  const vehiclesWithTrip = new Set(TRIPS.map(t => t.vehicleId));
  const matches = VEHICLES.filter(v => !vehiclesWithTrip.has(v.id) && vehicleMatchesQuery(v, q));

  if (matches.length === 0) { container.innerHTML = ''; return; }

  container.innerHTML = matches.map(v => {
    const count = TRANSACTIONS.filter(t => t.vehicleId === v.id).length;
    return `
      <div class="vehicle-noresult-card">
        <div class="trip-card-top">
          <span class="trip-plate">${v.plate}</span>
          <span class="badge no-trip">بدون رحلة مسجّلة</span>
        </div>
        <div class="trip-route-line">السائق: ${v.driver} · ${v.type}</div>
        <div class="trip-meta">
          <span>${count} معاملة UHF مسجلة</span>
          <button class="btn secondary small" data-veh="${v.id}">عرض المعاملات</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('button[data-veh]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedVehicleFilter = btn.dataset.veh;
      switchTab('transactions');
      renderTransactions();
    });
  });
}

function selectTrip(tripId, tab = 'route') {
  selectedTripId = tripId;
  stopAnimation();
  renderTripList();
  renderRouteTab();
  renderManifestTab();
  drawRouteOnMap(tripId);
  switchTab(tab);
}

/* ---------------- رسم المسار ---------------- */
function drawRouteOnMap(tripId) {
  routeLayer.clearLayers();
  const trip = tripById(tripId);
  if (!trip || trip.route.length === 0) return;

  const latlngs = trip.route.map(stop => {
    const d = deviceById(stop.deviceId);
    return [d.lat, d.lng];
  });

  L.polyline(latlngs, { color: '#4f8cff', weight: 3, dashArray: '6 6', opacity: 0.9 }).addTo(routeLayer);

  trip.route.forEach((stop, i) => {
    const d = deviceById(stop.deviceId);
    const icon = L.divIcon({
      className: '',
      html: `<div class="stop-icon">${i + 1}</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker([d.lat, d.lng], { icon, zIndexOffset: 1000 })
      .addTo(routeLayer)
      .bindTooltip(`${i + 1}. ${d.name}<br>${fmtTime(stop.timestamp)}`, { direction: 'top' });
  });

  map.fitBounds(L.latLngBounds(latlngs), { padding: [60, 60] });
}

/* ---------------- تبويب المسار والجدول الزمني ---------------- */
function buildNarrative(trip, vehicle) {
  if (trip.route.length === 0) {
    return `<b>${vehicle.plate}</b> لم تبدأ هذه الرحلة بعد. الانطلاق المجدول من <b>${trip.origin}</b> باتجاه <b>${trip.destination}</b>.`;
  }
  const stops = trip.route.map((s, i) => {
    const d = deviceById(s.deviceId);
    if (i === 0) return `انطلقت من <b>${d.name}</b> الساعة ${fmtTimeShort(s.timestamp)}`;
    if (i === trip.route.length - 1 && trip.status === 'completed')
      return `ووصلت إلى <b>${d.name}</b> الساعة ${fmtTimeShort(s.timestamp)}`;
    return `ثم مرت عبر <b>${d.name}</b> الساعة ${fmtTimeShort(s.timestamp)}`;
  });
  let text = `المركبة <b>${vehicle.plate}</b> (السائق: ${vehicle.driver}) ${stops.join('، ')}.`;
  if (trip.status === 'in-transit') {
    const last = deviceById(trip.route[trip.route.length - 1].deviceId);
    text += ` وهي الآن في الطريق نحو <b>${trip.destination}</b>، وكان آخر ظهور لها عند <b>${last.name}</b>.`;
  }
  return text;
}

function renderRouteTab() {
  const container = document.getElementById('route-tab-body');
  if (!selectedTripId) {
    container.innerHTML = `<div class="empty-state">اختر رحلة من القائمة لعرض مسارها وسردها الحي وجدول القراءات الزمني.</div>`;
    return;
  }
  const trip = tripById(selectedTripId);
  const vehicle = vehicleById(trip.vehicleId);

  const timelineItems = trip.route.map((s, i) => {
    const d = deviceById(s.deviceId);
    return `<li data-n="${i + 1}">
      <div class="t-device">${d.name} <span class="dir-${s.direction.toLowerCase()}">${DIR_LABEL[s.direction]}</span></div>
      <div class="t-time">${fmtTime(s.timestamp)}</div>
      <div class="t-meta">${d.city} · ${s.speedKmh} كم/س</div>
    </li>`;
  }).join('');

  container.innerHTML = `
    <div class="route-summary">${buildNarrative(trip, vehicle)}</div>
    <div class="route-actions">
      <button class="btn" id="play-anim-btn" ${trip.route.length < 2 ? 'disabled' : ''}>▶ تشغيل محاكاة المسار</button>
      <button class="btn secondary" id="reset-anim-btn">إعادة تعيين</button>
    </div>
    <ul class="timeline">${timelineItems || '<div class="empty-state">لا توجد قراءات بعد.</div>'}</ul>
  `;

  document.getElementById('play-anim-btn').addEventListener('click', () => playRouteAnimation(trip));
  document.getElementById('reset-anim-btn').addEventListener('click', () => {
    stopAnimation();
    drawRouteOnMap(trip.id);
  });
}

/* ---------------- المحاكاة الحركية ---------------- */
function stopAnimation() {
  if (animFrame) cancelAnimationFrame(animFrame);
  animFrame = null;
  if (vehicleAnimMarker) {
    map.removeLayer(vehicleAnimMarker);
    vehicleAnimMarker = null;
  }
}

function playRouteAnimation(trip) {
  stopAnimation();
  const latlngs = trip.route.map(s => {
    const d = deviceById(s.deviceId);
    return L.latLng(d.lat, d.lng);
  });
  if (latlngs.length < 2) return;

  const icon = L.divIcon({ className: '', html: '<div class="vehicle-icon">🚌</div>', iconSize: [24, 24], iconAnchor: [12, 12] });
  vehicleAnimMarker = L.marker(latlngs[0], { icon, zIndexOffset: 2000 }).addTo(map);

  // حساب المسافات التراكمية مسبقاً لتبدو السرعة متساوية عبر المقاطع
  const segLengths = [];
  let total = 0;
  for (let i = 0; i < latlngs.length - 1; i++) {
    const len = latlngs[i].distanceTo(latlngs[i + 1]);
    segLengths.push(len);
    total += len;
  }

  const DURATION_MS = 6000;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const frac = Math.min(elapsed / DURATION_MS, 1);
    const targetDist = frac * total;

    let acc = 0, segIndex = 0;
    for (; segIndex < segLengths.length; segIndex++) {
      if (acc + segLengths[segIndex] >= targetDist || segIndex === segLengths.length - 1) break;
      acc += segLengths[segIndex];
    }
    const segFrac = segLengths[segIndex] ? (targetDist - acc) / segLengths[segIndex] : 1;
    const p1 = latlngs[segIndex];
    const p2 = latlngs[segIndex + 1] || latlngs[segIndex];
    const lat = p1.lat + (p2.lat - p1.lat) * segFrac;
    const lng = p1.lng + (p2.lng - p1.lng) * segFrac;
    vehicleAnimMarker.setLatLng([lat, lng]);

    if (frac < 1) {
      animFrame = requestAnimationFrame(step);
    } else {
      animFrame = null;
    }
  }
  animFrame = requestAnimationFrame(step);
}

/* ---------------- تبويب قائمة الركاب (Manifest) ---------------- */
function renderManifestTab() {
  const container = document.getElementById('manifest-tab-body');
  if (!selectedTripId) {
    container.innerHTML = `<div class="empty-state">اختر رحلة لعرض قائمة الركاب الخاصة بها.</div>`;
    return;
  }
  const trip = tripById(selectedTripId);
  const vehicle = vehicleById(trip.vehicleId);
  const m = MANIFESTS[trip.id];
  if (!m) {
    container.innerHTML = `<div class="empty-state">لا توجد قائمة ركاب متاحة لهذه الرحلة.</div>`;
    return;
  }

  const q = searchQuery.trim();
  const nq = normalize(q);
  const rows = m.passengers.map(p => {
    const isMatch = q && (
      normalize(p.name).includes(nq)
      || normalize(p.nationalId).includes(nq)
      || normalize(p.phone).includes(nq)
    );
    return `
    <tr class="${isMatch ? 'highlight' : ''}">
      <td>${p.name}</td>
      <td><span class="ltr-num">${p.nationalId}</span></td>
      <td>${p.gender}</td>
      <td>${p.age}</td>
      <td>${p.seat}</td>
      <td><span class="ltr-num">${p.phone}</span></td>
    </tr>
  `;
  }).join('');

  container.innerHTML = `
    <div class="manifest-header">
      <div class="trip-plate">${m.manifestNo}</div>
      <div class="trip-route-line">${m.tripRef} · الناقل: ${m.carrier}</div>
    </div>
    <div class="manifest-grid">
      <div><span>المركبة</span>${vehicle.plate} (${vehicle.type})</div>
      <div><span>السائق</span>${vehicle.driver}</div>
      <div><span>إجمالي الركاب</span>${m.totalPassengers}</div>
      <div><span>إجمالي الحقائب</span>${m.totalLuggage}</div>
    </div>
    <table class="manifest-items">
      <thead><tr><th>الاسم</th><th>الرقم الوطني</th><th>الجنس</th><th>العمر</th><th>المقعد</th><th>الهاتف</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="5">إجمالي الركاب المسجلين في القائمة</td><td>${m.passengers.length}</td></tr></tfoot>
    </table>
  `;
}

/* ---------------- تبويب المعاملات ---------------- */
function populateDeviceFilterOptions() {
  const sel = document.getElementById('txn-device-filter');
  sel.innerHTML = '<option value="all">كل الأجهزة</option>' +
    DEVICES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  sel.value = selectedDeviceFilter;
  sel.addEventListener('change', () => {
    selectedDeviceFilter = sel.value;
    renderTransactions();
  });
}

function renderVehicleChip() {
  const el = document.getElementById('txn-vehicle-chip');
  if (selectedVehicleFilter === 'all') { el.innerHTML = ''; return; }
  const v = vehicleById(selectedVehicleFilter);
  el.innerHTML = `<span class="chip">المركبة: ${v.plate} <button id="clear-veh-filter" title="إلغاء التصفية">×</button></span>`;
  document.getElementById('clear-veh-filter').addEventListener('click', () => {
    selectedVehicleFilter = 'all';
    renderTransactions();
  });
}

function renderTransactions() {
  const tbody = document.getElementById('txn-tbody');
  const rows = TRANSACTIONS.filter(t =>
    (selectedDeviceFilter === 'all' || t.deviceId === selectedDeviceFilter) &&
    (selectedVehicleFilter === 'all' || t.vehicleId === selectedVehicleFilter)
  );

  renderVehicleChip();

  tbody.innerHTML = rows.map(t => {
    const d = deviceById(t.deviceId);
    const v = vehicleById(t.vehicleId);
    const highlighted = t.tripId === selectedTripId;
    return `
      <tr class="${highlighted ? 'highlight' : ''}">
        <td>${fmtTime(t.timestamp)}</td>
        <td>${d.name}</td>
        <td>${v.plate}</td>
        <td class="dir-${t.direction.toLowerCase()}">${DIR_LABEL[t.direction]}</td>
        <td>${t.speedKmh} كم/س</td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="5" class="empty-state">لا توجد معاملات لهذا الفلتر.</td></tr>`;

  document.getElementById('txn-device-filter').value = selectedDeviceFilter;
}

/* ---------------- التبويبات ---------------- */
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-' + name));
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

/* ---------------- شريط بحث المركبات والركاب ---------------- */
function initSearch() {
  const input = document.getElementById('vehicle-search');
  const clearBtn = document.getElementById('clear-search-btn');

  input.addEventListener('input', () => {
    searchQuery = input.value;
    renderTripList();
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    input.focus();
    renderTripList();
  });
}

/* ---------------- نطاق التاريخ (من / إلى) ---------------- */
function initDateFilter() {
  const fromInput = document.getElementById('date-from');
  const toInput = document.getElementById('date-to');
  const clearBtn = document.getElementById('clear-date-btn');

  fromInput.addEventListener('change', () => {
    dateFrom = fromInput.value;
    toInput.min = dateFrom;
    renderTripList();
  });

  toInput.addEventListener('change', () => {
    dateTo = toInput.value;
    fromInput.max = dateTo;
    renderTripList();
  });

  clearBtn.addEventListener('click', () => {
    dateFrom = '';
    dateTo = '';
    fromInput.value = '';
    toInput.value = '';
    fromInput.removeAttribute('max');
    toInput.removeAttribute('min');
    renderTripList();
  });
}

/* ---------------- شريط الإحصائيات ---------------- */
function renderStats() {
  const onlineCount = DEVICES.filter(d => d.status === 'online').length;
  const activeTrips = TRIPS.filter(t => t.status === 'in-transit').length;
  const todayCount = TRANSACTIONS.filter(t => t.timestamp.startsWith('2026-09-20')).length;

  document.getElementById('stat-devices').innerHTML = `<b>${onlineCount}/${DEVICES.length}</b> جهاز متصل`;
  document.getElementById('stat-trips').innerHTML = `<b>${activeTrips}</b> رحلة نشطة`;
  document.getElementById('stat-txn').innerHTML = `<b>${todayCount}</b> قراءة اليوم`;
}

/* ---------------- التهيئة ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initTabs();
  initSearch();
  initDateFilter();
  renderStats();
  renderTripList();
  renderRouteTab();
  renderManifestTab();
  populateDeviceFilterOptions();
  renderTransactions();
  switchTab('route');
});
