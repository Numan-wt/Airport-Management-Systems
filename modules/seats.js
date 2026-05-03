// ============================================================
// AeroNexus — Smart Seat Allocation Module
// ============================================================
window.SeatsModule = (() => {
  let selectedFlight = null;
  let seatChart = null;

  function getFlightSeats(flightId) {
    const f = AMS.state.flights.find(x=>x.id===flightId);
    if (!f) return { capacity:180, firstRows:2, bizRows:4 };
    const capMap = { 'Airbus A380':471,'Boeing 777':354,'Boeing 787':280,'Airbus A321':196,'Airbus A320':180,'Boeing 737':162 };
    const cap = capMap[f.aircraft]||180;
    const rows = Math.ceil(cap/6);
    const firstRows = cap > 280 ? 5 : cap > 180 ? 3 : 2;
    const bizRows   = cap > 280 ? 8 : cap > 180 ? 6 : 4;
    return { rows, firstRows, bizRows, capacity:cap, flight:f };
  }

  function getOccupied(flightId) {
    return AMS.state.passengers.filter(p=>p.flightId===flightId&&p.checkedIn).map(p=>p.seat);
  }

  function renderFlightSelector() {
    const flights = AMS.state.flights.filter(f=>f.status!=='Cancelled'&&f.status!=='Departed'&&f.status!=='Landed');
    return `<div class="form-group" style="max-width:400px">
      <label class="form-label">Select Flight</label>
      <select class="form-control" onchange="SeatsModule.selectFlight(this.value)" id="seat-flight-sel">
        <option value="">— Choose a flight —</option>
        ${flights.map(f=>`<option value="${f.id}" ${selectedFlight?.id===f.id?'selected':''}>${f.flightNumber} · ${f.origin}→${f.destination} · ${f.aircraft}</option>`).join('')}
      </select>
    </div>`;
  }

  function renderSeatMap(flightId) {
    if (!flightId) return `<div class="empty-state"><div class="empty-icon">💺</div><p>Select a flight to view the seat map.</p></div>`;
    const { rows, firstRows, bizRows, capacity, flight: f } = getFlightSeats(flightId);
    const occupied = getOccupied(flightId);
    const totalRows = Math.min(rows, 40);
    let html = `<div class="seat-map-wrap"><div class="seat-map">
      <div class="seat-row">
        <div class="seat-row-num"></div>
        ${['A','B','C','','D','E','F'].map(c=>c?`<div class="seat" style="background:transparent;border:none;font-size:11px;color:var(--txt2);width:30px">${c}</div>`:`<div class="seat aisle"></div>`).join('')}
      </div>`;
    for (let r=1;r<=totalRows;r++) {
      const cls = r<=firstRows?'first':r<=firstRows+bizRows?'business':'economy';
      html += `<div class="seat-row"><div class="seat-row-num">${r}</div>`;
      ['A','B','C'].forEach(col=>{
        const sid=`${r}${col}`;
        const occ=occupied.includes(sid);
        html+=`<div class="seat ${cls} ${occ?'occupied':'available'}" onclick="SeatsModule.clickSeat('${sid}','${flightId}')" title="${sid}">${occ?'●':sid}</div>`;
      });
      html+=`<div class="seat aisle"></div>`;
      ['D','E','F'].forEach(col=>{
        const sid=`${r}${col}`;
        const occ=occupied.includes(sid);
        html+=`<div class="seat ${cls} ${occ?'occupied':'available'}" onclick="SeatsModule.clickSeat('${sid}','${flightId}')" title="${sid}">${occ?'●':sid}</div>`;
      });
      html+=`</div>`;
    }
    html+=`</div></div>`;
    const firstSeats = totalRows<=firstRows?totalRows*6:firstRows*6;
    const bizSeats   = Math.max(0,Math.min(bizRows,totalRows-firstRows)*6);
    const econSeats  = capacity-firstSeats-bizSeats;
    const occFirst  = occupied.filter(s=>parseInt(s)<=firstRows).length;
    const occBiz    = occupied.filter(s=>{ const r=parseInt(s); return r>firstRows&&r<=firstRows+bizRows; }).length;
    const occEcon   = occupied.filter(s=>parseInt(s)>firstRows+bizRows).length;
    return html + `
      <div class="grid-3" style="margin-top:20px">
        <div class="card-sm" style="border-top:3px solid var(--amber)">
          <label class="form-label">First Class</label>
          <div style="font-size:22px;font-weight:800;color:var(--amber)">${occFirst}<span style="font-size:14px;color:var(--txt2)">/${firstSeats}</span></div>
          <div class="progress" style="margin-top:6px"><div class="progress-fill" style="width:${Math.round(occFirst/firstSeats*100)||0}%;background:var(--amber)"></div></div>
        </div>
        <div class="card-sm" style="border-top:3px solid var(--purple)">
          <label class="form-label">Business Class</label>
          <div style="font-size:22px;font-weight:800;color:var(--purple)">${occBiz}<span style="font-size:14px;color:var(--txt2)">/${bizSeats}</span></div>
          <div class="progress" style="margin-top:6px"><div class="progress-fill" style="width:${Math.round(occBiz/bizSeats*100)||0}%;background:var(--purple)"></div></div>
        </div>
        <div class="card-sm" style="border-top:3px solid var(--blue)">
          <label class="form-label">Economy Class</label>
          <div style="font-size:22px;font-weight:800;color:var(--blue)">${occEcon}<span style="font-size:14px;color:var(--txt2)">/${econSeats}</span></div>
          <div class="progress" style="margin-top:6px"><div class="progress-fill" style="width:${Math.round(occEcon/econSeats*100)||0}%;background:var(--blue)"></div></div>
        </div>
      </div>`;
  }

  function clickSeat(sid, flightId) {
    const occupied = getOccupied(flightId);
    if (occupied.includes(sid)) {
      const pax = AMS.state.passengers.find(p=>p.flightId===flightId&&p.seat===sid);
      if (pax) { AMS.toast(`Seat ${sid} — ${pax.name} (${pax.seatClass})`, 'info'); }
      return;
    }
    AMS.modal.open(`💺 Assign Seat ${sid}`, `
      <p style="color:var(--txt2);margin-bottom:16px">Assign seat <strong style="color:var(--blue);font-size:18px">${sid}</strong> to a passenger:</p>
      <div class="form-group"><label class="form-label">Select Passenger</label>
        <select id="seat-pax-sel" class="form-control">
          <option value="">— Select —</option>
          ${AMS.state.passengers.filter(p=>p.flightId===flightId&&!p.checkedIn).map(p=>`<option value="${p.id}">${p.name} (${p.seatClass})</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="AMS.modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="SeatsModule.assignSeat('${sid}','${flightId}')">✅ Assign</button>
      </div>`);
  }

  function assignSeat(sid, flightId) {
    const paxId = document.getElementById('seat-pax-sel').value;
    if (!paxId) { AMS.toast('Select a passenger', 'warning'); return; }
    const pax = AMS.state.passengers.find(p=>p.id===paxId);
    if (!pax) return;
    const occupied = getOccupied(flightId);
    if (occupied.includes(sid)) { AMS.toast('Seat already taken', 'error'); return; }
    pax.seat = sid; pax.checkedIn = true;
    AMS.modal.close();
    selectFlight(flightId);
    AMS.toast(`Seat ${sid} assigned to ${pax.name}`, 'success');
  }

  function autoAssignAll(flightId) {
    const f = AMS.state.flights.find(x=>x.id===flightId);
    if (!f) return;
    const { rows, firstRows, bizRows } = getFlightSeats(flightId);
    const occupied = new Set(getOccupied(flightId));
    const unassigned = AMS.state.passengers.filter(p=>p.flightId===flightId&&!p.checkedIn);
    let count = 0;
    unassigned.forEach(pax => {
      const maxRow = pax.seatClass==='First'?firstRows:pax.seatClass==='Business'?firstRows+bizRows:Math.min(rows,40);
      const minRow = pax.seatClass==='First'?1:pax.seatClass==='Business'?firstRows+1:firstRows+bizRows+1;
      for (let r=minRow;r<=maxRow;r++) {
        for (const col of ['A','B','C','D','E','F']) {
          const sid=`${r}${col}`;
          if (!occupied.has(sid)) {
            pax.seat=sid; pax.checkedIn=true; occupied.add(sid); count++;
            const f2=AMS.state.flights.find(x=>x.id===flightId);
            if(f2) f2.checkedIn=Math.min(f2.capacity,f2.checkedIn+1);
            break;
          }
        }
        if (pax.checkedIn) break;
      }
    });
    selectFlight(flightId);
    AMS.toast(`Auto-assigned ${count} passengers`, 'success');
  }

  function renderOccupancyChart(flightId) {
    return `<div class="card mb-24"><div class="card-header"><div class="card-title">📊 Occupancy Overview</div></div><div class="chart-wrap"><canvas id="seat-chart"></canvas></div></div>`;
  }

  function buildOccupancyChart(flightId) {
    if (seatChart) { seatChart.destroy(); seatChart=null; }
    const { firstRows, bizRows, rows } = getFlightSeats(flightId);
    const occupied = getOccupied(flightId);
    const totalRows = Math.min(rows,40);
    const firstSeats=firstRows*6, bizSeats=bizRows*6, econSeats=(totalRows-firstRows-bizRows)*6;
    const occFirst=occupied.filter(s=>parseInt(s)<=firstRows).length;
    const occBiz=occupied.filter(s=>{const r=parseInt(s);return r>firstRows&&r<=firstRows+bizRows;}).length;
    const occEcon=occupied.filter(s=>parseInt(s)>firstRows+bizRows).length;
    const ctx = document.getElementById('seat-chart');
    if (!ctx) return;
    seatChart = new Chart(ctx, {
      type:'bar',
      data:{
        labels:['First Class','Business Class','Economy'],
        datasets:[
          {label:'Occupied',data:[occFirst,occBiz,occEcon],backgroundColor:['rgba(245,158,11,.7)','rgba(168,85,247,.7)','rgba(79,142,247,.7)'],borderRadius:4,borderSkipped:false},
          {label:'Available',data:[firstSeats-occFirst,bizSeats-occBiz,econSeats-occEcon],backgroundColor:['rgba(245,158,11,.2)','rgba(168,85,247,.2)','rgba(79,142,247,.2)'],borderRadius:4,borderSkipped:false},
        ]
      },
      options:{responsive:true,maintainAspectRatio:false,
        scales:{x:{stacked:true,ticks:{color:'#566880'},grid:{color:'#1f2d48'}},y:{stacked:true,ticks:{color:'#566880'},grid:{color:'#1f2d48'}}},
        plugins:{legend:{labels:{color:'#8a9bbf',boxWidth:12}}}
      }
    });
  }

  function selectFlight(flightId) {
    selectedFlight = AMS.state.flights.find(x=>x.id===flightId)||null;
    const f = selectedFlight;
    const mapEl = document.getElementById('seat-map-area');
    const chartEl = document.getElementById('seat-chart-area');
    const actEl = document.getElementById('seat-actions');
    if (!mapEl) return;
    if (!f) {
      mapEl.innerHTML = `<div class="empty-state"><div class="empty-icon">💺</div><p>Select a flight above.</p></div>`;
      if(chartEl) chartEl.innerHTML='';
      if(actEl) actEl.innerHTML='';
      return;
    }
    const occupied = getOccupied(f.id);
    const pct = Math.round(occupied.length/f.capacity*100);
    if(actEl) actEl.innerHTML=`
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <div><strong style="font-size:22px">${occupied.length}</strong><span style="color:var(--txt2)"> / ${f.capacity} seats occupied (${pct}%)</span></div>
        <div class="progress" style="flex:1;min-width:120px"><div class="progress-fill" style="width:${pct}%;background:${pct>90?'var(--red)':pct>70?'var(--amber)':'var(--blue)'}"></div></div>
        <button class="btn btn-warning btn-sm" onclick="SeatsModule.autoAssignAll('${f.id}')">🤖 Auto-Assign All</button>
      </div>`;
    if(chartEl) { chartEl.innerHTML=renderOccupancyChart(f.id); setTimeout(()=>buildOccupancyChart(f.id),50); }
    mapEl.innerHTML = renderSeatMap(f.id);
  }

  function init() {
    const el = document.getElementById('page-seats');
    const totalSeats = AMS.state.flights.reduce((a,f)=>a+f.capacity,0);
    const totalOcc   = AMS.state.passengers.filter(p=>p.checkedIn).length;
    el.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">💺 Smart Seat Allocation</div><div class="page-subtitle">Visual seat map with intelligent auto-assignment</div></div>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="stat-card blue"><div class="stat-icon">💺</div><div class="stat-label">Total Seats Today</div><div class="stat-value">${totalSeats.toLocaleString()}</div></div>
        <div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-label">Seats Occupied</div><div class="stat-value">${totalOcc}</div></div>
        <div class="stat-card amber"><div class="stat-icon">📈</div><div class="stat-label">Load Factor</div><div class="stat-value">${Math.round(totalOcc/totalSeats*100)}%</div></div>
        <div class="stat-card purple"><div class="stat-icon">🪑</div><div class="stat-label">Available Seats</div><div class="stat-value">${(totalSeats-totalOcc).toLocaleString()}</div></div>
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:16px;border-radius:4px;background:rgba(245,158,11,.3);border:1px solid rgba(245,158,11,.5)"></div><span style="font-size:12px;color:var(--txt2)">First Class</span></div>
        <div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:16px;border-radius:4px;background:rgba(168,85,247,.3);border:1px solid rgba(168,85,247,.5)"></div><span style="font-size:12px;color:var(--txt2)">Business Class</span></div>
        <div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:16px;border-radius:4px;background:rgba(79,142,247,.3);border:1px solid rgba(79,142,247,.5)"></div><span style="font-size:12px;color:var(--txt2)">Economy</span></div>
        <div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:16px;border-radius:4px;background:rgba(100,116,139,.15)"></div><span style="font-size:12px;color:var(--txt2)">Occupied</span></div>
      </div>
      <div class="card mb-24">
        <div class="card-header"><div class="card-title">🛫 Flight Selection</div></div>
        ${renderFlightSelector()}
        <div id="seat-actions" style="margin-top:12px"></div>
      </div>
      <div id="seat-chart-area"></div>
      <div class="card"><div class="card-header"><div class="card-title">🗺 Seat Map</div></div><div id="seat-map-area"><div class="empty-state"><div class="empty-icon">💺</div><p>Select a flight to view the seat map.</p></div></div></div>`;
  }

  return { init, selectFlight, clickSeat, assignSeat, autoAssignAll };
})();
