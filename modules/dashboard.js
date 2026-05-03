// ============================================================
// AeroNexus — Live Dashboard Module
// ============================================================
window.DashboardModule = (() => {
  let charts = {};

  function getStats() {
    const f = AMS.state.flights;
    const p = AMS.state.passengers;
    const total = f.length;
    const delayed = f.filter(x => x.status === 'Delayed').length;
    const boarding = f.filter(x => x.status === 'Boarding').length;
    const totalPax = p.length;
    const checkedIn = p.filter(x => x.checkedIn).length;
    const gatesOccupied = AMS.state.gates.filter(g => g.status === 'Occupied').length;
    const gatesTotal = AMS.state.gates.length;
    return { total, delayed, boarding, totalPax, checkedIn, gatesOccupied, gatesTotal };
  }

  function renderStatCards(s) {
    return `
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">🛫</div>
        <div class="stat-label">Total Flights Today</div>
        <div class="stat-value counter" data-target="${s.total}">${s.total}</div>
        <div class="stat-sub">${s.boarding} boarding now</div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon">⚠</div>
        <div class="stat-label">Delayed Flights</div>
        <div class="stat-value counter" data-target="${s.delayed}">${s.delayed}</div>
        <div class="stat-sub">${Math.round(s.delayed/s.total*100)}% delay rate today</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">👤</div>
        <div class="stat-label">Passengers Checked-in</div>
        <div class="stat-value counter" data-target="${s.checkedIn}">${s.checkedIn}</div>
        <div class="stat-sub">of ${s.totalPax} registered today</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-icon">🚪</div>
        <div class="stat-label">Gates Occupied</div>
        <div class="stat-value counter" data-target="${s.gatesOccupied}">${s.gatesOccupied}</div>
        <div class="stat-sub">of ${s.gatesTotal} total gates</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">🛡</div>
        <div class="stat-label">Staff On Duty</div>
        <div class="stat-value counter" data-target="${AMS.state.staff.filter(x=>x.status==='On Duty').length}">${AMS.state.staff.filter(x=>x.status==='On Duty').length}</div>
        <div class="stat-sub">across all terminals</div>
      </div>
    </div>`;
  }

  function renderFlightBoard() {
    const flights = AMS.state.flights.slice(0, 10);
    return `
    <div class="card mb-24">
      <div class="card-header">
        <div class="card-title">✈ Live Flight Board <span class="badge red" style="margin-left:8px;animation:pulse-badge 2s infinite">● LIVE</span></div>
        <button class="btn btn-ghost btn-sm" onclick="AMS.navigate('flights')">View All →</button>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr>
            <th>Flight</th><th>Route</th><th>Scheduled</th><th>Gate</th><th>Status</th><th>Occupancy</th>
          </tr></thead>
          <tbody>
            ${flights.map(f => {
              const al = AMS.airline(f.airlineCode);
              const pct = Math.round(f.checkedIn / f.capacity * 100);
              return `<tr>
                <td>${AMS.airlineChip(f.airlineCode)}<br><span style="font-size:11px;color:var(--txt2);margin-top:4px;display:block">${f.flightNumber}</span></td>
                <td><strong>${f.origin}</strong> <span style="color:var(--txt3)">→</span> <strong>${f.destination}</strong><br><span style="font-size:11px;color:var(--txt2)">${f.type}</span></td>
                <td>${AMS.fmtTime(f.scheduledDep)}${f.delayMinutes>0?`<br><span style="color:var(--red);font-size:11px">+${f.delayMinutes}min</span>`:''}</td>
                <td><span style="font-size:16px;font-weight:700">${f.gate}</span><br><span style="font-size:11px;color:var(--txt2)">${f.terminal}</span></td>
                <td>${AMS.statusBadge(f.status)}</td>
                <td style="min-width:100px">
                  <div style="font-size:11px;color:var(--txt2);margin-bottom:4px">${f.checkedIn}/${f.capacity} (${pct}%)</div>
                  <div class="progress"><div class="progress-fill" style="width:${pct}%;background:${pct>90?'var(--red)':pct>70?'var(--amber)':'var(--blue)'}"></div></div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function renderCharts() {
    return `
    <div class="grid-2 mb-24">
      <div class="card">
        <div class="card-header"><div class="card-title">📊 Flight Status Distribution</div></div>
        <div class="chart-wrap"><canvas id="chart-status"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">📈 Hourly Passenger Flow</div></div>
        <div class="chart-wrap"><canvas id="chart-pax"></canvas></div>
      </div>
    </div>
    <div class="grid-2 mb-24">
      <div class="card">
        <div class="card-header"><div class="card-title">🌤 Airport Weather</div></div>
        ${renderWeather()}
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">🕐 Recent Activity</div></div>
        ${renderTimeline()}
      </div>
    </div>`;
  }

  function renderWeather() {
    const w = AMS.state.weather;
    return `
      <div style="display:flex;align-items:center;gap:24px;padding:16px 0">
        <div style="font-size:56px">🌤</div>
        <div>
          <div style="font-size:48px;font-weight:900;line-height:1">${w.temp}°C</div>
          <div style="color:var(--txt2);font-size:14px">${w.condition}</div>
        </div>
      </div>
      <div class="grid-4" style="grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">
        <div class="card-sm"><div style="font-size:10px;color:var(--txt2);font-weight:600;letter-spacing:.5px;text-transform:uppercase">Wind</div><div style="font-size:16px;font-weight:700;margin-top:4px">${w.wind} km/h</div></div>
        <div class="card-sm"><div style="font-size:10px;color:var(--txt2);font-weight:600;letter-spacing:.5px;text-transform:uppercase">Visibility</div><div style="font-size:16px;font-weight:700;margin-top:4px">${w.visibility} km</div></div>
        <div class="card-sm"><div style="font-size:10px;color:var(--txt2);font-weight:600;letter-spacing:.5px;text-transform:uppercase">Humidity</div><div style="font-size:16px;font-weight:700;margin-top:4px">${w.humidity}%</div></div>
        <div class="card-sm"><div style="font-size:10px;color:var(--txt2);font-weight:600;letter-spacing:.5px;text-transform:uppercase">Delay Risk</div><div style="font-size:16px;font-weight:700;margin-top:4px;color:var(--green)">${w.delayRisk}</div></div>
      </div>`;
  }

  function renderTimeline() {
    const events = [
      { time:'07:32', icon:'🛫', text:'EK-509 departed Gate C4 on time' },
      { time:'07:15', icon:'🚨', text:'SG-112 delayed 45 min — weather at CCU' },
      { time:'07:05', icon:'🛬', text:'EK-510 landed successfully — T3' },
      { time:'06:48', icon:'✅', text:'AI-202 check-in closed — 265/280 boarded' },
      { time:'06:30', icon:'🚪', text:'Gate A5 allocated to 6E-789' },
      { time:'06:12', icon:'👤', text:'15 passengers require special assistance' },
    ];
    return `<div class="timeline">${events.map(e=>`
      <div class="timeline-item">
        <div class="timeline-time">${e.time}</div>
        <div class="timeline-text">${e.icon} ${e.text}</div>
      </div>`).join('')}</div>`;
  }

  function buildCharts() {
    const statusCounts = { 'On Time':0,'Boarding':0,'Delayed':0,'Departed':0,'Landed':0,'Scheduled':0,'Cancelled':0 };
    AMS.state.flights.forEach(f => { if (statusCounts[f.status]!==undefined) statusCounts[f.status]++; });
    const nonZero = Object.entries(statusCounts).filter(([,v])=>v>0);

    // Destroy old
    Object.values(charts).forEach(c => c.destroy());
    charts = {};

    const baseOpts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#8a9bbf', boxWidth:12 } } } };
    const colorMap = { 'On Time':'#22c55e','Boarding':'#f59e0b','Delayed':'#ef4444','Departed':'#566880','Landed':'#06b6d4','Scheduled':'#4f8ef7','Cancelled':'#be123c' };

    charts.status = new Chart(document.getElementById('chart-status'), {
      type:'doughnut',
      data:{ labels:nonZero.map(x=>x[0]), datasets:[{ data:nonZero.map(x=>x[1]), backgroundColor:nonZero.map(x=>colorMap[x[0]]+'cc'), borderColor:'#141c30', borderWidth:3 }] },
      options:{ ...baseOpts, cutout:'65%' }
    });

    const hours = ['06','07','08','09','10','11','12','13','14','15','16','17','18','19','20'];
    const paxData = [120,280,310,240,180,200,390,320,280,150,190,420,380,260,310];
    charts.pax = new Chart(document.getElementById('chart-pax'), {
      type:'bar',
      data:{ labels:hours, datasets:[{ label:'Passengers', data:paxData, backgroundColor:'rgba(79,142,247,.6)', borderRadius:4, borderSkipped:false }] },
      options:{ ...baseOpts, scales:{ x:{ ticks:{color:'#566880'}, grid:{color:'#1f2d48'} }, y:{ ticks:{color:'#566880'}, grid:{color:'#1f2d48'} } }, plugins:{ legend:{display:false} } }
    });
  }

  function init() {
    const el = document.getElementById('page-dashboard');
    const s = getStats();
    el.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">✈ Live Airport Dashboard</div><div class="page-subtitle">Indira Gandhi International Airport · Real-time Overview</div></div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" onclick="DashboardModule.refresh()">🔄 Refresh</button>
        </div>
      </div>
      ${renderStatCards(s)}
      ${renderFlightBoard()}
      ${renderCharts()}`;
    setTimeout(buildCharts, 50);
  }

  function refresh() { init(); AMS.toast('Dashboard refreshed', 'success'); }

  return { init, refresh };
})();
