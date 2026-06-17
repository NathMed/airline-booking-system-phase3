/* ════════════════════════════════════════════════════
   Flight606 – index.js  (v3 — fully fixed)
   · Theme toggle with localStorage persistence
   · Booking widget: One Way / Round Trip / Multi-City
   · Calendar datepicker (all fields)
   · All peripheral features preserved
════════════════════════════════════════════════════ */

/* ── Airport Label Maps ─────────────────────────── */
const airportLabels = {
  MNL: 'Manila (MNL)', CEB: 'Cebu (CEB)', DVO: 'Davao (DVO)',
  SIN: 'Singapore (SIN)', TYO: 'Tokyo (TYO)', DXB: 'Dubai (DXB)',
  CDG: 'Paris (CDG)', NRT: 'Tokyo (NRT)', MLE: 'Maldives (MLE)',
  GVA: 'Geneva (GVA)', JFK: 'New York (JFK)'
};

const airportShort = {
  MNL: 'Manila · MNL', CEB: 'Cebu · CEB', DVO: 'Davao · DVO',
  SIN: 'Singapore · SIN', TYO: 'Tokyo · TYO', DXB: 'Dubai · DXB',
  CDG: 'Paris · CDG', NRT: 'Tokyo · NRT', MLE: 'Maldives · MLE',
  GVA: 'Geneva · GVA', JFK: 'New York · JFK'
};

/* ════════════════════════════════════════════════════
   THEME TOGGLE  — Bug Fix #1
   Reads/writes data-theme on <html>; persists to localStorage.
════════════════════════════════════════════════════ */
(function initTheme() {
  const saved = localStorage.getItem('f606-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme() {
  const root    = document.documentElement;
  const current = root.getAttribute('data-theme') || 'dark';
  const next    = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('f606-theme', next);
}

/* ════════════════════════════════════════════════════
   NAVBAR SCROLL BEHAVIOUR
════════════════════════════════════════════════════ */
(function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  function handleScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
})();

/* ════════════════════════════════════════════════════
   PAGE NAVIGATION
════════════════════════════════════════════════════ */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
  closeProfileMenu();
  // Close all open calendars when navigating
  document.querySelectorAll('.cal-popup.open').forEach(p => p.classList.remove('open'));

  const navCollapse = document.getElementById('navbarContent');
  if (navCollapse && navCollapse.classList.contains('show')) {
    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
    if (bsCollapse) bsCollapse.hide();
  }
}

function goNav(el, page, section) {
  showPage(page);
  if (el) {
    document.querySelectorAll('.navbar-nav .nav-link').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
  }
  if (section) {
    setTimeout(() => {
      const target = document.getElementById(section);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }
}

/* ════════════════════════════════════════════════════
   HERO SLIDER
════════════════════════════════════════════════════ */
const heroSlides = [
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1800&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1800&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1800&q=80'
];

let currentSlide = 0;
let slideInterval = null;

function applySlide(index) {
  currentSlide = (index + heroSlides.length) % heroSlides.length;
  const bg = document.getElementById('heroBg');
  if (bg) {
    bg.style.backgroundImage = `url('${heroSlides[currentSlide]}')`;
    bg.style.backgroundSize = 'cover';
    bg.style.backgroundPosition = 'center';
  }
  document.querySelectorAll('#sliderDots .dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function nextSlide() { applySlide(currentSlide + 1); }
function prevSlide() { applySlide(currentSlide - 1); }
function goSlide(i)  { applySlide(i); }

function startSlideInterval() {
  stopSlideInterval();
  slideInterval = setInterval(nextSlide, 5000);
}

function stopSlideInterval() {
  if (slideInterval) { clearInterval(slideInterval); slideInterval = null; }
}

/* ════════════════════════════════════════════════════
   BOOKING WIDGET TABS
════════════════════════════════════════════════════ */
function wTab(tab) {
  const isBuy = tab === 'buy';
  document.getElementById('wtb-buy').classList.toggle('active', isBuy);
  document.getElementById('wtb-status').classList.toggle('active', !isBuy);
  document.getElementById('wp-buy').style.display    = isBuy ? '' : 'none';
  document.getElementById('wp-status').style.display = isBuy ? 'none' : '';
}

/* ════════════════════════════════════════════════════
   BOOKING WIDGET — TRIP MODE  (Bug Fix #2)
════════════════════════════════════════════════════ */
function setTripMode(mode) {
  const isMulti = mode === 'multi';
  const isRound = mode === 'round';

  document.getElementById('mode-one-rt').style.display = isMulti ? 'none' : '';
  document.getElementById('mode-multi').style.display  = isMulti ? '' : 'none';
  document.getElementById('fields-one').style.display  = (!isMulti && !isRound) ? '' : 'none';
  document.getElementById('fields-round').style.display = isRound ? '' : 'none';

  // Seed two rows when switching to multi-city for the first time
  if (isMulti && mcCount === 0) {
    addMcRow();
    addMcRow();
  }

  // Close any open calendar that's no longer visible
  document.querySelectorAll('.cal-popup.open').forEach(p => p.classList.remove('open'));
}

/* ════════════════════════════════════════════════════
   CALENDAR DATEPICKER
════════════════════════════════════════════════════ */
const CAL_MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
const CAL_DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// Airport option data for multi-city select rebuilding
const MC_AIRPORTS = ['Select Departure…','Manila (MNL)','Cebu (CEB)','Davao (DVO)','Singapore (SIN)','Tokyo (TYO)','Dubai (DXB)'];
const MC_AVALS    = ['','MNL','CEB','DVO','SIN','TYO','DXB'];
const MC_DESTS    = ['Select Destination…','Paris (CDG)','Tokyo (NRT)','Maldives (MLE)','Geneva (GVA)','New York (JFK)','Dubai (DXB)','Manila (MNL)','Cebu (CEB)'];
const MC_DVALS    = ['','CDG','NRT','MLE','GVA','JFK','DXB','MNL','CEB'];

const calDates  = {};       // selected date keys, indexed by selKey
const calStates = {};       // { y, m } per calendar popup id
let   mcCount   = 0;
let   mcIdx     = 0;

const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

function _pad(n)          { return String(n).padStart(2, '0'); }
function _fmtDisp(y, m, d){ return CAL_MONTHS[m].slice(0, 3) + ' ' + _pad(d) + ', ' + y; }
function _fmtKey(y, m, d) { return y + '-' + _pad(m + 1) + '-' + _pad(d); }

/**
 * Render calendar HTML into a popup element.
 * @param {string} containerId  - id of .cal-popup element
 * @param {string} selKey       - key into calDates for the selected date
 * @param {string} onPickId     - prefix for the display btn / clear btn (e.g. 'dep')
 * @param {string} [minDate]    - YYYY-MM-DD lower bound (optional)
 * @param {string} [maxDate]    - YYYY-MM-DD upper bound (optional)
 */
function buildCal(containerId, selKey, onPickId, minDate, maxDate) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!calStates[containerId]) {
    calStates[containerId] = { y: todayDate.getFullYear(), m: todayDate.getMonth() };
  }
  const { y, m } = calStates[containerId];
  const sel      = calDates[selKey];
  const first    = new Date(y, m, 1).getDay();
  const total    = new Date(y, m + 1, 0).getDate();

  // Escape for inline onclick strings
  const esc = s => (s || '').replace(/'/g, "\\'");

  let html = `<div class="cal-nav">
    <button onclick="shiftCal('${containerId}','${esc(selKey)}',-1,'${esc(onPickId)}','${esc(minDate)}','${esc(maxDate)}')" aria-label="Previous month">&#8249;</button>
    <span class="cal-month-lbl">${CAL_MONTHS[m]} ${y}</span>
    <button onclick="shiftCal('${containerId}','${esc(selKey)}',1,'${esc(onPickId)}','${esc(minDate)}','${esc(maxDate)}')" aria-label="Next month">&#8250;</button>
  </div><div class="cal-grid">`;

  CAL_DAYS.forEach(d => { html += `<div class="cal-dow">${d}</div>`; });

  for (let i = 0; i < first; i++) html += `<div class="cal-day empty"></div>`;

  for (let d = 1; d <= total; d++) {
    const dt      = new Date(y, m, d);
    const key     = _fmtKey(y, m, d);
    const iso     = `${y}-${_pad(m + 1)}-${_pad(d)}`;
    const isSel   = sel === key;
    const isToday = dt.getTime() === todayDate.getTime();
    const disabled = dt < todayDate
                  || (minDate && key < minDate)
                  || (maxDate && key > maxDate);

    let cls = 'cal-day';
    if (isSel)   cls += ' selected';
    if (isToday && !isSel) cls += ' today';
    if (disabled) cls += ' disabled';

    const click = disabled ? '' :
      `onclick="pickDate('${containerId}','${esc(selKey)}','${key}','${iso}','${esc(onPickId)}','${esc(minDate)}','${esc(maxDate)}')"`;

    html += `<button class="${cls}" ${click} ${disabled ? 'disabled' : ''}>${d}</button>`;
  }
  html += '</div>';
  el.innerHTML = html;
}

/** Move calendar one month forward or backward */
function shiftCal(containerId, selKey, dir, onPickId, minDate, maxDate) {
  if (!calStates[containerId]) {
    calStates[containerId] = { y: todayDate.getFullYear(), m: todayDate.getMonth() };
  }
  const s = calStates[containerId];
  s.m += dir;
  if (s.m > 11) { s.m = 0;  s.y++; }
  if (s.m <  0) { s.m = 11; s.y--; }
  buildCal(containerId, selKey, onPickId, minDate, maxDate);
}

/** Handle a day click — store selection, update display button, close popup */
function pickDate(containerId, selKey, key, isoVal, onPickId, minDate, maxDate) {
  calDates[selKey] = key;

  const [y, mo, d] = isoVal.split('-').map(Number);
  const dispEl = document.getElementById(onPickId + '-btn');
  const clrEl  = document.getElementById(onPickId + '-clear');

  if (dispEl) {
    dispEl.textContent = _fmtDisp(y, mo - 1, d);
    dispEl.classList.remove('empty');
  }
  if (clrEl) clrEl.classList.add('vis');

  // Re-render so the selected day highlights
  buildCal(containerId, selKey, onPickId, minDate, maxDate);

  // Close with a tiny delay so the user sees the highlight
  setTimeout(() => {
    const el = document.getElementById(containerId);
    if (el) el.classList.remove('open');
  }, 180);
}

/** Open / close a named calendar popup */
function toggleCal(id, align) {
  const el = document.getElementById(id);
  if (!el) return;

  const isOpen = el.classList.contains('open');

  // Close all others first
  document.querySelectorAll('.cal-popup.open').forEach(p => {
    if (p.id !== id) p.classList.remove('open');
  });

  if (isOpen) { el.classList.remove('open'); return; }

  // Map popup id → selKey (which key into calDates) and display btn prefix
  const map = {
    'dep-cal':    { selKey: 'dep',    onPick: 'dep' },
    'rt-dep-cal': { selKey: 'rt-dep', onPick: 'rt-dep' },
    'rt-ret-cal': { selKey: 'rt-ret', onPick: 'rt-ret' },
    'st-cal':     { selKey: 'st',     onPick: 'st' }
  };
  const cfg = map[id] || { selKey: id, onPick: id };

  if (!calStates[id]) {
    calStates[id] = { y: todayDate.getFullYear(), m: todayDate.getMonth() };
  }

  buildCal(id, cfg.selKey, cfg.onPick, '', '');

  el.classList.add('open');
  if (align === 'right') el.classList.add('right');
  else                   el.classList.remove('right');
}

/** Clear a named date field */
function clearDate(id) {
  calDates[id] = null;
  const btn = document.getElementById(id + '-btn');
  const clr = document.getElementById(id + '-clear');
  if (btn) { btn.textContent = 'Select date…'; btn.classList.add('empty'); }
  if (clr) clr.classList.remove('vis');
}

/* ════════════════════════════════════════════════════
   MULTI-CITY ROWS
════════════════════════════════════════════════════ */
function _buildSelOpts(labels, vals, selected) {
  return labels.map((lbl, i) =>
    `<option value="${vals[i]}"${vals[i] === selected ? ' selected' : ''}>${lbl}</option>`
  ).join('');
}

function addMcRow() {
  mcIdx++;
  const id       = mcIdx;
  const calId    = 'mc-cal-' + id;
  const selKey   = 'mc-' + id;
  const container = document.getElementById('mc-rows');
  if (!container) return;

  // Default presets for first two rows
  const defaultFrom = id === 1 ? 'MNL' : id === 2 ? 'CEB' : '';
  const defaultTo   = id === 1 ? 'MLE' : id === 2 ? 'CDG' : '';

  const div = document.createElement('div');
  div.className = 'mc-row';
  div.id        = 'mc-row-' + id;
  div.innerHTML = `
    <div class="w-field">
      <label class="w-flabel"><i class="ti ti-plane-departure" aria-hidden="true"></i> From</label>
      <select class="w-sel">${_buildSelOpts(MC_AIRPORTS, MC_AVALS, defaultFrom)}</select>
    </div>
    <div class="w-field">
      <label class="w-flabel"><i class="ti ti-plane-arrival" aria-hidden="true"></i> To</label>
      <select class="w-sel">${_buildSelOpts(MC_DESTS, MC_DVALS, defaultTo)}</select>
    </div>
    <div class="w-field" style="position:relative">
      <label class="w-flabel"><i class="ti ti-calendar" aria-hidden="true"></i> Date</label>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="date-btn empty" id="mc-btn-${id}">Select date…</button>
        <button class="date-clear" id="mc-clr-${id}" onclick="clearMcDate(${id})">✕</button>
      </div>
      <div class="cal-popup" id="${calId}"></div>
    </div>
    <button class="mc-remove" onclick="removeMcRow(${id})" aria-label="Remove flight ${id}">
      <i class="ti ti-x" aria-hidden="true" style="font-size:14px"></i>
    </button>`;
  container.appendChild(div);

  // Wire up the date button (avoids inline onclick so we can capture the scoped id)
  const calEl = document.getElementById(calId);
  const dateBtn = document.getElementById('mc-btn-' + id);

  if (!calStates[calId]) {
    calStates[calId] = { y: todayDate.getFullYear(), m: todayDate.getMonth() };
  }

  dateBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    document.querySelectorAll('.cal-popup.open').forEach(p => {
      if (p.id !== calId) p.classList.remove('open');
    });
    if (!calEl.classList.contains('open')) {
      buildMcCal(calId, id);
      calEl.classList.add('open');
    } else {
      calEl.classList.remove('open');
    }
  });

  mcCount++;
  const addBtn = document.getElementById('mc-add-btn');
  if (addBtn) addBtn.style.display = mcCount >= 5 ? 'none' : '';
}

function buildMcCal(calId, rowId) {
  const selKey = 'mc-' + rowId;
  buildCal(calId, selKey, 'mc-' + rowId, '', '');

  // Patch nav buttons so they rebuild with the correct mc context
  const el = document.getElementById(calId);
  if (!el) return;
  el.querySelectorAll('.cal-nav button').forEach((btn, i) => {
    btn.onclick = function () {
      shiftCal(calId, selKey, i === 0 ? -1 : 1, 'mc-' + rowId, '', '');
    };
  });

  // Patch day buttons so selection updates the mc btn/clear
  el.querySelectorAll('.cal-day:not(.disabled):not(.empty)').forEach(day => {
    day.onclick = function () {
      const d    = parseInt(day.textContent, 10);
      const s    = calStates[calId];
      const key  = _fmtKey(s.y, s.m, d);
      const iso  = `${s.y}-${_pad(s.m + 1)}-${_pad(d)}`;
      const [yr, mo, dd] = iso.split('-').map(Number);

      calDates[selKey] = key;

      const dispBtn = document.getElementById('mc-btn-' + rowId);
      const clrBtn  = document.getElementById('mc-clr-' + rowId);
      if (dispBtn) { dispBtn.textContent = _fmtDisp(yr, mo - 1, dd); dispBtn.classList.remove('empty'); }
      if (clrBtn)  clrBtn.classList.add('vis');

      setTimeout(() => el.classList.remove('open'), 180);
    };
  });
}

function clearMcDate(id) {
  calDates['mc-' + id] = null;
  const btn = document.getElementById('mc-btn-' + id);
  const clr = document.getElementById('mc-clr-' + id);
  if (btn) { btn.textContent = 'Select date…'; btn.classList.add('empty'); }
  if (clr) clr.classList.remove('vis');
}

function removeMcRow(id) {
  const row = document.getElementById('mc-row-' + id);
  if (row) row.remove();
  mcCount = Math.max(0, mcCount - 1);
  const addBtn = document.getElementById('mc-add-btn');
  if (addBtn) addBtn.style.display = mcCount >= 5 ? 'none' : '';
}

/* Close calendars on outside click */
document.addEventListener('click', e => {
  if (!e.target.closest('.w-field') && !e.target.closest('.cal-popup')) {
    document.querySelectorAll('.cal-popup.open').forEach(p => p.classList.remove('open'));
  }
});

/* ════════════════════════════════════════════════════
   SYNC HERO WIDGET → SEARCH PAGE
════════════════════════════════════════════════════ */
function syncSearchFrom() {
  const val = document.getElementById('hw-from').value;
  const sf  = document.getElementById('sf-from');
  if (val && sf) sf.value = val;
  updateFlightBanner();
}

function syncSearchTo() {
  const val = document.getElementById('hw-to').value;
  const sf  = document.getElementById('sf-to');
  if (val && sf) sf.value = val;
  updateFlightBanner();
}

function syncSearchDate() {
  const val = document.getElementById('hw-date') && document.getElementById('hw-date').value;
  const sf  = document.getElementById('sf-date');
  if (val && sf) sf.value = val;
}

function syncSearchPax() {
  const val = document.getElementById('hw-pax').value;
  const sf  = document.getElementById('sf-pax');
  if (val && sf) sf.value = val;
}

/* ════════════════════════════════════════════════════
   UPDATE FLIGHT RESULTS LABELS
════════════════════════════════════════════════════ */
function updateFlightBanner() {
  const fromEl = document.getElementById('sf-from');
  const toEl   = document.getElementById('sf-to');
  if (!fromEl || !toEl) return;

  const from = fromEl.value;
  const to   = toEl.value;
  const fl   = airportLabels[from] || from;
  const tl   = airportLabels[to]   || to;
  const fs   = airportShort[from]  || from;
  const ts   = airportShort[to]    || to;

  setTextById('sf-from-label',  fl);
  setTextById('sf-to-label',    tl);
  setTextById('sf-to-label2',   tl);
  setTextById('sf-from-label2', fl);

  ['fc-dep1', 'fc-dep2'].forEach(id => setTextById(id, fs));
  ['fc-arr1', 'fc-arr2'].forEach(id => setTextById(id, ts));
  ['fc-ret-dep1', 'fc-ret-dep2'].forEach(id => setTextById(id, ts));
  ['fc-ret-arr1', 'fc-ret-arr2'].forEach(id => setTextById(id, fs));

  const bs = document.getElementById('booking-flight-summary');
  if (bs) bs.textContent = `Fri May 17  ${from} – ${to} | Fri May 31  ${to} – ${from}`;

  setTextById('luggage-out-label', `${from} → ${to}`);
  setTextById('luggage-ret-label', `${to} → ${from}`);
}

function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ════════════════════════════════════════════════════
   FLIGHT CARD SELECTION
════════════════════════════════════════════════════ */
function selectFlight(card) {
  const allCards = card.parentElement.querySelectorAll('.flight-card');
  allCards.forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
}

/* ════════════════════════════════════════════════════
   BOOKING SECTION ACCORDION
════════════════════════════════════════════════════ */
function toggleSection(header) {
  const body   = header.nextElementSibling;
  const toggle = header.querySelector('.bs-toggle i');
  if (!body) return;

  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? '' : 'none';

  if (toggle) {
    toggle.classList.toggle('bi-chevron-up',   isHidden);
    toggle.classList.toggle('bi-chevron-right', !isHidden);
  }
}

/* ════════════════════════════════════════════════════
   SEAT MAP
════════════════════════════════════════════════════ */
(function buildSeatMap() {
  const map = document.getElementById('seatMap');
  if (!map) return;

  const taken    = ['1A','1C','2B','3D','4E','4F','5A','7B','8C','9D','10F','11A','11C'];
  const selected = ['11B'];
  const cols     = ['A','B','C', null, 'D','E','F'];

  // Column label row
  const labelRow = document.createElement('div');
  labelRow.className = 'seat-col-labels';
  const numSpacer = document.createElement('div');
  numSpacer.className = 'seat-row-num';
  labelRow.appendChild(numSpacer);
  cols.forEach(col => {
    const lbl = document.createElement('div');
    lbl.className = col === null ? 'seat-aisle-gap' : 'seat-col-label';
    if (col) lbl.textContent = col;
    labelRow.appendChild(lbl);
  });
  map.appendChild(labelRow);

  for (let r = 1; r <= 12; r++) {
    const row = document.createElement('div');
    row.className = 'seat-row';

    const num = document.createElement('div');
    num.className = 'seat-row-num';
    num.textContent = r;
    row.appendChild(num);

    cols.forEach(col => {
      if (!col) {
        const aisle = document.createElement('div');
        aisle.className = 'seat-aisle';
        row.appendChild(aisle);
        return;
      }
      const seatId = r + col;
      const seat   = document.createElement('div');
      seat.className = 'seat';
      seat.textContent = seatId;
      seat.title = seatId;

      if (taken.includes(seatId)) {
        seat.classList.add('taken');
        seat.title = 'Seat taken';
      } else if (selected.includes(seatId)) {
        seat.classList.add('selected');
        seat.title = 'Your seat';
      } else {
        seat.addEventListener('click', () => {
          const cur = map.querySelector('.seat.selected:not(.taken)');
          if (cur && cur !== seat) cur.classList.remove('selected');
          seat.classList.toggle('selected');
        });
      }
      row.appendChild(seat);
    });
    map.appendChild(row);
  }
})();

/* ════════════════════════════════════════════════════
   PROFILE DROPDOWN
════════════════════════════════════════════════════ */
function toggleProfileMenu() {
  const menu = document.getElementById('profileMenu');
  if (menu) menu.classList.toggle('open');
}

function closeProfileMenu() {
  const menu = document.getElementById('profileMenu');
  if (menu) menu.classList.remove('open');
}

document.addEventListener('click', e => {
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown && !dropdown.contains(e.target)) closeProfileMenu();
});

/* ════════════════════════════════════════════════════
   AUTH STATE
════════════════════════════════════════════════════ */
let isLoggedIn = false;

function setLoggedIn(state) {
  isLoggedIn = state;
  const out = document.getElementById('nav-logged-out');
  const inn = document.getElementById('nav-logged-in');
  if (out) out.style.display = state ? 'none' : 'flex';
  if (inn) inn.style.setProperty('display', state ? 'flex' : 'none', 'important');
}

function doLogin() {
  const email = (document.getElementById('l-email').value || '').trim();
  const pass  = document.getElementById('l-pass').value || '';
  const eErr  = document.getElementById('l-email-err');
  const gErr  = document.getElementById('login-err');

  eErr.classList.add('d-none');
  gErr.classList.add('d-none');
  document.getElementById('l-email').classList.remove('err');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    eErr.classList.remove('d-none');
    document.getElementById('l-email').classList.add('err');
    return;
  }

  if (email === 'demo@flight606.com' && pass === 'password123') {
    setLoggedIn(true);
    showPage('home');
  } else {
    gErr.classList.remove('d-none');
    document.getElementById('l-email').classList.add('err');
  }
}

function doLogout() {
  setLoggedIn(false);
  closeProfileMenu();
  showPage('home');
}

function doSignup() {
  let valid = true;

  const fields = [
    { id: 'su-fn', errId: 'su-fn-e', check: v => v.length > 0 },
    { id: 'su-ln', errId: 'su-ln-e', check: v => v.length > 0 },
    { id: 'su-em', errId: 'su-em-e', check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'su-pw', errId: 'su-pw-e', check: v => v.length >= 8 }
  ];

  fields.forEach(f => {
    const el  = document.getElementById(f.id);
    const err = document.getElementById(f.errId);
    if (!f.check(el.value.trim())) {
      el.classList.add('err'); err.classList.remove('d-none'); valid = false;
    } else {
      el.classList.remove('err'); err.classList.add('d-none');
    }
  });

  const pw   = document.getElementById('su-pw').value;
  const cp   = document.getElementById('su-cp').value;
  const cpe  = document.getElementById('su-cp-e');
  const cpEl = document.getElementById('su-cp');
  if (pw !== cp) {
    cpEl.classList.add('err'); cpe.classList.remove('d-none'); valid = false;
  } else {
    cpEl.classList.remove('err'); cpe.classList.add('d-none');
  }

  const termsErr = document.getElementById('su-terms-e');
  if (!document.getElementById('su-terms').checked) {
    termsErr.classList.remove('d-none'); valid = false;
  } else {
    termsErr.classList.add('d-none');
  }

  if (!valid) return;

  document.getElementById('su-ok').classList.remove('d-none');
  setTimeout(() => showPage('login'), 1800);
}

/* ════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════ */
function togglePass(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function autofillPassenger(n) {
  const cb = document.getElementById(`autofill-p${n}`);
  if (!cb || !cb.checked) return;
  if (n === 1) {
    setVal('p1-fn', 'Passenger'); setVal('p1-ln', 'One');
    setVal('p1-dob', '1990-01-01'); setVal('p1-gender', 'Male');
  }
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

document.addEventListener('input', e => {
  if (e.target.classList.contains('f-input')) e.target.classList.remove('err');
});

/* ════════════════════════════════════════════════════
   INITIALISE
════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Hero widget defaults
  const hwFrom = document.getElementById('hw-from');
  const hwTo   = document.getElementById('hw-to');
  if (hwFrom) hwFrom.value = 'MNL';
  if (hwTo)   hwTo.value   = 'CEB';

  // Add onchange sync handlers to hero widget dropdowns
  if (hwFrom) hwFrom.addEventListener('change', syncSearchFrom);
  if (hwTo)   hwTo.addEventListener('change',   syncSearchTo);

  const hwPax = document.getElementById('hw-pax');
  if (hwPax)  hwPax.addEventListener('change', syncSearchPax);

  // Initialise calendar state for static popups
  ['dep-cal','rt-dep-cal','rt-ret-cal','st-cal'].forEach(id => {
    if (!calStates[id]) calStates[id] = { y: todayDate.getFullYear(), m: todayDate.getMonth() };
  });

  updateFlightBanner();
  applySlide(0);
  startSlideInterval();
});