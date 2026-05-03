// ============================================================
// AeroNexus — Flight Management Module
// ============================================================
window.FlightsModule = (() => {
  let filter = { search:'', status:'all', type:'all' };

  function filtered() {
    return AMS.state.flights.filter(f => {
      const q = filter.search.toLowerCase();
      const matchQ = !q || f.flightNumber.toLowerCase().includes(q) || f.origin.toLowerCase().includes(q) || f.destination.toLowerCase().includes(q) || AMS.airline(f.airlineCode).name.toLowerCase().includes(q);
      const matchS = filter.status === 'all' || f.status === filter.status;
      const matchT = filter.type === 'all' || f.type === filter.type;
      return matchQ && matchS && matchT;
    });
  }

  function renderTable() {
    const rows = filtered();
    if (!rows.length) return `<div class="empty-state"><div class="empty-icon">🛫</div><p>No flights match your filter.</p></div>`;
    return `<div class="tbl-wrap"><table>
      <thead><tr><th>Flight #</th><th>Airline</th><th>Type</th><th>Route</th><th>Departure</th><th>Arrival</th><th>Gate</th><th>Aircraft</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${rows.map(f => `
        <tr>
          <td><strong>${f.flightNumber}</strong></td>
          <td>${AMS.airlineChip(f.airlineCode)}</td>
          <td><span class="badge ${f.type==='Departure'?'blue':'cyan'}">${f.type}</span></td>
          <td><strong>${f.origin}</strong> → <strong>${f.destination}</strong></td>
          <td>${AMS.fmtTime(f.scheduledDep)}${f.delayMinutes>0?` <span style="color:var(--red);font-size:11px">(+${f.delayMinutes}m)</span>`:''}</td>
          <td>${AMS.fmtTime(f.scheduledArr)}</td>
          <td><strong>${f.gate}</strong> <span style="color:var(--txt2);font-size:11px">${f.terminal}</span></td>
          <td style="font-size:12px;color:var(--txt2)">${f.aircraft}</td>
          <td>${AMS.statusBadge(f.status)}</td>
          <td>
            <div style="display:flex;gap:4px">
              <button class="btn btn-ghost btn-sm" onclick="FlightsModule.openEdit('${f.id}')">✏ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="FlightsModule.cancel('${f.id}')">✕</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody></table></div>`;
  }

  function render() {
    document.getElementById('flights-table').innerHTML = renderTable();
  }

  function openAdd() {
    AMS.modal.open('➕ Add New Flight', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Flight Number</label><input id="f-num" class="form-control" placeholder="e.g. 6E-999"/></div>
        <div class="form-group"><label class="form-label">Airline Code</label>
          <select id="f-al" class="form-control">${Object.entries(AIRLINES).map(([k,v])=>`<option value="${k}">${k} — ${v.name}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Type</label>
          <select id="f-type" class="form-control"><option value="Departure">Departure</option><option value="Arrival">Arrival</option></select>
        </div>
        <div class="form-group"><label class="form-label">Aircraft</label>
          <select id="f-acft" class="form-control">
            <option>Airbus A320</option><option>Airbus A321</option><option>Airbus A380</option>
            <option>Boeing 737</option><option>Boeing 777</option><option>Boeing 787</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Origin</label>
          <select id="f-orig" class="form-control">${Object.keys(AIRPORTS_DB).map(k=>`<option value="${k}">${k} — ${AIRPORTS_DB[k].city}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Destination</label>
          <select id="f-dest" class="form-control">${Object.keys(AIRPORTS_DB).map(k=>`<option value="${k}">${k} — ${AIRPORTS_DB[k].city}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Departure Time</label><input id="f-dep" type="datetime-local" class="form-control"/></div>
        <div class="form-group"><label class="form-label">Arrival Time</label><input id="f-arr" type="datetime-local" class="form-control"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Terminal</label>
          <select id="f-term" class="form-control"><option>T1</option><option>T2</option><option>T3</option></select>
        </div>
        <div class="form-group"><label class="form-label">Capacity</label><input id="f-cap" type="number" class="form-control" value="180"/></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
        <button class="btn btn-ghost" onclick="AMS.modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="FlightsModule.saveAdd()">✅ Add Flight</button>
      </div>`);
  }

  function saveAdd() {
    const num = document.getElementById('f-num').value.trim();
    const al  = document.getElementById('f-al').value;
    const type= document.getElementById('f-type').value;
    const acft= document.getElementById('f-acft').value;
    const orig= document.getElementById('f-orig').value;
    const dest= document.getElementById('f-dest').value;
    const dep = document.getElementById('f-dep').value;
    const arr = document.getElementById('f-arr').value;
    const term= document.getElementById('f-term').value;
    const cap = parseInt(document.getElementById('f-cap').value);
    if (!num || !dep || !arr) { AMS.toast('Please fill all required fields', 'warning'); return; }
    const capMap = { 'Airbus A320':180,'Airbus A321':196,'Airbus A380':471,'Boeing 737':162,'Boeing 777':354,'Boeing 787':280 };
    const newFlight = {
      id:'FL'+String(AMS.state.flights.length+1).padStart(3,'0'),
      flightNumber:num, airlineCode:al, type, origin:orig, destination:dest,
      scheduledDep:new Date(dep).toISOString(), scheduledArr:new Date(arr).toISOString(),
      status:'Scheduled', gate:'TBD', terminal:term, aircraft:acft,
      capacity:capMap[acft]||cap, checkedIn:0, boarded:0, delayMinutes:0, delayReason:null,
    };
    AMS.state.flights.unshift(newFlight);
    AMS.modal.close();
    render();
    AMS.toast(`Flight ${num} added successfully`, 'success');
  }

  function openEdit(id) {
    const f = AMS.state.flights.find(x => x.id === id);
    if (!f) return;
    AMS.modal.open(`✏ Edit Flight — ${f.flightNumber}`, `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Status</label>
          <select id="e-status" class="form-control">
            ${['Scheduled','On Time','Boarding','Delayed','Departed','Landed','Cancelled'].map(s=>`<option ${f.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Gate</label>
          <select id="e-gate" class="form-control">
            ${AMS.state.gates.map(g=>`<option ${f.gate===g.id?'selected':''}>${g.id}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Delay (minutes)</label><input id="e-delay" type="number" class="form-control" value="${f.delayMinutes}" min="0"/></div>
        <div class="form-group"><label class="form-label">Delay Reason</label>
          <select id="e-reason" class="form-control">
            <option value="">None</option>
            ${['Weather','ATC Hold','Technical','Crew','Slot Delay','Fuelling','Catering'].map(r=>`<option ${f.delayReason===r?'selected':''}>${r}</option>`).join('')}
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
        <button class="btn btn-ghost" onclick="AMS.modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="FlightsModule.saveEdit('${id}')">💾 Save Changes</button>
      </div>`);
  }

  function saveEdit(id) {
    const f = AMS.state.flights.find(x => x.id === id);
    if (!f) return;
    f.status = document.getElementById('e-status').value;
    f.gate   = document.getElementById('e-gate').value;
    f.delayMinutes = parseInt(document.getElementById('e-delay').value) || 0;
    f.delayReason  = document.getElementById('e-reason').value || null;
    AMS.modal.close();
    render();
    AMS.toast(`Flight ${f.flightNumber} updated`, 'success');
  }

  function cancel(id) {
    const f = AMS.state.flights.find(x => x.id === id);
    if (!f) return;
    if (f.status === 'Departed' || f.status === 'Landed') { AMS.toast('Cannot cancel a completed flight', 'error'); return; }
    if (!confirm(`Cancel flight ${f.flightNumber}?`)) return;
    f.status = 'Cancelled';
    render();
    AMS.toast(`Flight ${f.flightNumber} cancelled`, 'warning');
  }

  function init() {
    const el = document.getElementById('page-flights');
    el.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">🛫 Flight Management</div><div class="page-subtitle">${AMS.state.flights.length} flights scheduled today</div></div>
        <button class="btn btn-primary" onclick="FlightsModule.openAdd()">➕ Add Flight</button>
      </div>
      <div class="toolbar">
        <div class="search-box"><input id="fl-search" placeholder="Search flight, route, airline…" oninput="FlightsModule.setFilter('search',this.value)"/></div>
        <select class="form-control" style="width:auto" onchange="FlightsModule.setFilter('status',this.value)">
          <option value="all">All Statuses</option>
          ${['On Time','Boarding','Delayed','Departed','Landed','Scheduled','Cancelled'].map(s=>`<option>${s}</option>`).join('')}
        </select>
        <select class="form-control" style="width:auto" onchange="FlightsModule.setFilter('type',this.value)">
          <option value="all">All Types</option><option>Departure</option><option>Arrival</option>
        </select>
      </div>
      <div class="card" id="flights-table"></div>`;
    render();
  }

  function setFilter(key, val) { filter[key] = val; render(); }

  return { init, render, openAdd, saveAdd, openEdit, saveEdit, cancel, setFilter };
})();
