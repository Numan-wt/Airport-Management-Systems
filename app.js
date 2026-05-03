// ============================================================
// AeroNexus — Core App Engine
// ============================================================
const AMS = (() => {
  const state = {
    flights: JSON.parse(JSON.stringify(MOCK_FLIGHTS)),
    passengers: JSON.parse(JSON.stringify(MOCK_PASSENGERS)),
    staff: JSON.parse(JSON.stringify(MOCK_STAFF)),
    gates: JSON.parse(JSON.stringify(MOCK_GATES)),
    weather: { ...MOCK_WEATHER },
    currentPage: 'dashboard',
    notifications: [
      { icon: '⚠', title: 'SG-112 Delayed 45 min', text: 'Weather conditions at CCU', time: '5m ago' },
      { icon: '🚪', title: 'Gate C4 reassigned', text: 'EK-509 moved to Gate C4', time: '12m ago' },
      { icon: '✅', title: 'Check-in open', text: 'FL003 check-in counters open', time: '18m ago' },
    ],
    apiKey: '',
    initialized: {},
    refreshTimer: null,
  };

  // ── HELPERS ────────────────────────────────────────────────
  const airline = code => AIRLINES[code] || { name: code, color: '#8a9bbf', bg: '#8a9bbf20' };
  const airport = code => AIRPORTS_DB[code] || { name: code, city: code };
  const fmtTime = iso => {
    if (!iso) return '--:--';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  const fmtDate = iso => {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const statusBadge = status => {
    const map = {
      'On Time':   'green',  'Departed': 'gray',   'Landed':    'cyan',
      'Boarding':  'amber',  'Delayed':  'red',    'Cancelled': 'red',
      'Scheduled': 'blue',   'On Duty':  'green',  'Off Duty':  'gray',
      'Available': 'green',  'Occupied': 'blue',   'Maintenance':'amber','Closed':'gray',
    };
    return `<span class="badge ${map[status]||'gray'}">${status}</span>`;
  };
  const airlineChip = code => {
    const a = airline(code);
    return `<span class="airline-chip" style="background:${a.bg};color:${a.color}">${code} · ${a.name}</span>`;
  };
  const uid = () => 'ID-' + Math.random().toString(36).substr(2,8).toUpperCase();

  // ── CLOCK ──────────────────────────────────────────────────
  function startClock() {
    const tick = () => {
      const now = new Date();
      const el = document.getElementById('sidebar-clock');
      if (el) el.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }

  // ── NAVIGATION ─────────────────────────────────────────────
  function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
    const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');
    const titles = {
      dashboard:'Live Dashboard', flights:'Flight Management', passengers:'Passenger System',
      checkin:'Check-in System', staff:'Staff & Admin Panel', gates:'Smart Gate Allocation',
      delay:'Delay Prediction Engine', seats:'Smart Seat Allocation',
    };
    document.getElementById('header-title').textContent = titles[page] || page;
    state.currentPage = page;

    const inits = {
      dashboard: () => window.DashboardModule?.init(),
      flights:   () => window.FlightsModule?.init(),
      passengers:() => window.PassengersModule?.init(),
      checkin:   () => window.CheckinModule?.init(),
      staff:     () => window.StaffModule?.init(),
      gates:     () => window.GatesModule?.init(),
      delay:     () => window.DelayModule?.init(),
      seats:     () => window.SeatsModule?.init(),
    };
    inits[page]?.();
  }

  // ── SIDEBAR ────────────────────────────────────────────────
  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
  }

  // ── NOTIFICATIONS ──────────────────────────────────────────
  function toggleNotifications() {
    const dd = document.getElementById('notif-dropdown');
    if (dd.classList.contains('hidden')) {
      renderNotifications();
      dd.classList.remove('hidden');
    } else {
      dd.classList.add('hidden');
    }
  }
  function renderNotifications() {
    const dd = document.getElementById('notif-dropdown');
    dd.innerHTML = `<div class="notif-header">Notifications (${state.notifications.length})</div>` +
      state.notifications.map(n => `
        <div class="notif-item">
          <div class="notif-icon">${n.icon}</div>
          <div class="notif-text"><strong>${n.title}</strong>${n.text}<br><span style="color:var(--txt3);font-size:10px">${n.time}</span></div>
        </div>`).join('') +
      `<div style="padding:10px 16px;text-align:center"><button class="btn btn-ghost btn-sm" onclick="document.getElementById('notif-dropdown').classList.add('hidden')">Dismiss All</button></div>`;
  }

  // ── TOAST ──────────────────────────────────────────────────
  function toast(msg, type = 'info') {
    const icons = { success:'✅', error:'❌', warning:'⚠', info:'ℹ' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type]||'ℹ'}</span><span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  // ── MODAL ──────────────────────────────────────────────────
  const modal = {
    open(title, html) {
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-body').innerHTML = html;
      document.getElementById('modal-backdrop').classList.remove('hidden');
    },
    close() {
      document.getElementById('modal-backdrop').classList.add('hidden');
    }
  };

  // ── DELAY PREDICTION ───────────────────────────────────────
  function predictDelay(flight) {
    const hour = new Date(flight.scheduledDep).getHours();
    const airlineRate = DELAY_RATES[flight.airlineCode] || 0.2;
    let timeFactor = 0.1;
    if (hour >= 7 && hour <= 9) timeFactor = 0.4;
    if (hour >= 17 && hour <= 20) timeFactor = 0.5;
    const seed = parseInt(flight.id.replace('FL',''));
    const wxFactor = ((seed * 7) % 5) * 0.07;
    const score = Math.min(99, Math.round((airlineRate * 0.4 + timeFactor * 0.35 + wxFactor * 0.25) * 100));
    return {
      score,
      level: score < 25 ? 'Low' : score < 55 ? 'Medium' : 'High',
      color: score < 25 ? 'var(--green)' : score < 55 ? 'var(--amber)' : 'var(--red)',
      predictedMinutes: score < 25 ? 0 : score < 55 ? 20 : 50,
    };
  }

  // ── SMART GATE ALLOCATION ──────────────────────────────────
  function allocateGate(flight) {
    const available = state.gates.filter(g => g.status === 'Available');
    if (!available.length) return null;
    const intl = ['LHR','DXB','SIN','JFK','DOH'].includes(flight.destination);
    const wide = ['Boeing 777','Boeing 787','Airbus A380'].includes(flight.aircraft);
    const scored = available.map(g => {
      let s = 50;
      if (intl && g.type === 'International') s += 30;
      if (!intl && g.type === 'Domestic') s += 30;
      if (wide && g.capacity === 'Wide Body') s += 20;
      if (!wide && g.capacity === 'Narrow Body') s += 20;
      return { gate: g, score: s };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].gate;
  }

  // ── BOOT ───────────────────────────────────────────────────
  function boot() {
    setTimeout(() => {
      const ls = document.getElementById('loading-screen');
      ls.classList.add('fade-out');
      setTimeout(() => ls.remove(), 500);
      startClock();
      navigate('dashboard');
      // Close notif on outside click
      document.addEventListener('click', e => {
        if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-dropdown'))
          document.getElementById('notif-dropdown')?.classList.add('hidden');
      });
      // Auto-refresh every 60s
      state.refreshTimer = setInterval(() => {
        if (state.currentPage === 'dashboard') window.DashboardModule?.refresh();
      }, 60000);
    }, 2200);
  }

  return { state, boot, navigate, toggleSidebar, toggleNotifications, toast, modal,
           airline, airport, fmtTime, fmtDate, statusBadge, airlineChip, uid,
           predictDelay, allocateGate };
})();
