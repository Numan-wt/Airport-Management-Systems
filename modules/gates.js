// ============================================================
// AeroNexus — Smart Gate Allocation Module
// ============================================================
window.GatesModule = (() => {

  function renderTerminalMap() {
    const terminals = ['T1','T2','T3'];
    return terminals.map(t => {
      const gates = AMS.state.gates.filter(g=>g.terminal===t);
      return `
        <div class="card mb-24">
          <div class="card-header">
            <div class="card-title">🏢 Terminal ${t.slice(1)} — ${t==='T3'?'International':'Domestic'}</div>
            <div style="display:flex;gap:8px">
              <span class="badge green">${gates.filter(g=>g.status==='Available').length} Available</span>
              <span class="badge blue">${gates.filter(g=>g.status==='Occupied').length} Occupied</span>
            </div>
          </div>
          <div class="terminal-label">CONCOURSE ${gates[0]?.section||'?'}</div>
          <div class="gates-row">${gates.map(g => renderGateBlock(g)).join('')}</div>
        </div>`;
    }).join('');
  }

  function renderGateBlock(g) {
    const f = g.assignedFlight ? AMS.state.flights.find(x=>x.id===g.assignedFlight) : null;
    return `
      <div class="gate-block ${g.status.toLowerCase().replace(' ','-')}" onclick="GatesModule.openGateDetail('${g.id}')" title="${g.id} — ${g.status}${f?' | '+f.flightNumber:''}">
        <div class="gate-id">${g.id}</div>
        <div class="gate-status-txt">${g.status}</div>
        ${f?`<div style="font-size:9px;color:var(--txt2);margin-top:2px">${f.flightNumber}</div>`:''}
        ${f?`<div style="font-size:8px;color:var(--txt3)">${AMS.fmtTime(f.scheduledDep)}</div>`:''}
      </div>`;
  }

  function openGateDetail(id) {
    const g = AMS.state.gates.find(x=>x.id===id);
    if (!g) return;
    const f = g.assignedFlight ? AMS.state.flights.find(x=>x.id===g.assignedFlight) : null;
    const staff = AMS.state.staff.filter(x=>x.gate===g.id);
    AMS.modal.open(`🚪 Gate ${g.id} — ${g.terminal}`, `
      <div class="grid-2" style="gap:12px;margin-bottom:16px">
        <div class="card-sm"><label class="form-label">Terminal</label><strong style="font-size:18px">${g.terminal}</strong></div>
        <div class="card-sm"><label class="form-label">Status</label>${AMS.statusBadge(g.status)}</div>
        <div class="card-sm"><label class="form-label">Type</label><strong>${g.type}</strong></div>
        <div class="card-sm"><label class="form-label">Aircraft Capacity</label><strong>${g.capacity}</strong></div>
      </div>
      ${f?`<div class="card-sm" style="margin-bottom:16px;border-left:3px solid var(--blue)">
        <label class="form-label">Assigned Flight</label>
        <div style="margin-top:6px">${AMS.airlineChip(f.airlineCode)} <strong>${f.flightNumber}</strong>
        <br><span style="font-size:12px;color:var(--txt2)">${f.origin} → ${f.destination} · ${AMS.fmtTime(f.scheduledDep)}</span>
        <br>${AMS.statusBadge(f.status)}</div>
      </div>`:`<div class="card-sm" style="margin-bottom:16px;border-left:3px solid var(--green);color:var(--green)">✅ Gate is available for assignment</div>`}
      ${staff.length?`<div class="card-sm" style="margin-bottom:16px">
        <label class="form-label">Assigned Staff (${staff.length})</label>
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
          ${staff.map(s=>`<div style="display:flex;align-items:center;gap:8px">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${s.name[0]}</div>
            <div><div style="font-size:13px;font-weight:600">${s.name}</div><div style="font-size:11px;color:var(--txt2)">${s.role} · ${s.status}</div></div>
          </div>`).join('')}
        </div>
      </div>`:''}
      <div style="display:flex;gap:8px;justify-content:flex-end">
        ${g.status==='Available'?`<button class="btn btn-primary" onclick="GatesModule.openAssign('${g.id}')">✈ Assign Flight</button>`:''}
        ${g.status==='Occupied'?`<button class="btn btn-warning" onclick="GatesModule.releaseGate('${g.id}')">🔓 Release Gate</button>`:''}
        <button class="btn btn-ghost" onclick="GatesModule.changeStatus('${g.id}')">🔄 Change Status</button>
        <button class="btn btn-ghost" onclick="AMS.modal.close()">Close</button>
      </div>`);
  }

  function openAssign(gateId) {
    const available = AMS.state.flights.filter(f => f.gate === 'TBD' || f.status === 'Scheduled' || f.status === 'On Time');
    AMS.modal.open(`✈ Assign Flight to Gate ${gateId}`, `
      <div class="form-group"><label class="form-label">Select Flight</label>
        <select id="asgn-flight" class="form-control">
          ${available.map(f=>`<option value="${f.id}">${f.flightNumber} — ${f.origin}→${f.destination} (${AMS.fmtTime(f.scheduledDep)})</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
        <button class="btn btn-ghost" onclick="AMS.modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="GatesModule.assignFlight('${gateId}')">✅ Assign</button>
      </div>`);
  }

  function assignFlight(gateId) {
    const flightId = document.getElementById('asgn-flight').value;
    const g = AMS.state.gates.find(x=>x.id===gateId);
    const f = AMS.state.flights.find(x=>x.id===flightId);
    if (!g || !f) return;
    // Check for conflict
    const conflict = AMS.state.gates.find(x=>x.assignedFlight===flightId && x.id!==gateId);
    if (conflict) { AMS.toast(`⚠ ${f.flightNumber} already assigned to Gate ${conflict.id}`, 'warning'); return; }
    g.assignedFlight = flightId;
    g.status = 'Occupied';
    f.gate = gateId;
    f.terminal = g.terminal;
    AMS.modal.close();
    init();
    AMS.toast(`${f.flightNumber} assigned to Gate ${gateId}`, 'success');
  }

  function releaseGate(gateId) {
    const g = AMS.state.gates.find(x=>x.id===gateId);
    if (!g) return;
    const f = g.assignedFlight ? AMS.state.flights.find(x=>x.id===g.assignedFlight) : null;
    if (f) { f.gate = 'TBD'; }
    g.assignedFlight = null;
    g.status = 'Available';
    AMS.modal.close();
    init();
    AMS.toast(`Gate ${gateId} released`, 'info');
  }

  function changeStatus(gateId) {
    const g = AMS.state.gates.find(x=>x.id===gateId);
    if (!g) return;
    const statuses = ['Available','Maintenance','Closed'];
    const cur = statuses.indexOf(g.status);
    g.status = statuses[(cur+1)%statuses.length];
    AMS.modal.close();
    init();
    AMS.toast(`Gate ${gateId} → ${g.status}`, 'info');
  }

  function autoAllocateAll() {
    let count = 0;
    const unassigned = AMS.state.flights.filter(f => f.gate === 'TBD' && f.status !== 'Cancelled');
    unassigned.forEach(f => {
      const g = AMS.allocateGate(f);
      if (g) {
        g.status = 'Occupied';
        g.assignedFlight = f.id;
        f.gate = g.id;
        f.terminal = g.terminal;
        count++;
      }
    });
    init();
    AMS.toast(`Auto-allocated ${count} flight${count!==1?'s':''} to gates`, 'success');
  }

  function init() {
    const g = AMS.state.gates;
    const el = document.getElementById('page-gates');
    const conflicts = AMS.state.flights.filter(f => {
      const assigned = g.filter(x=>x.assignedFlight===f.id);
      return assigned.length > 1;
    });
    el.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">🚪 Smart Gate Allocation</div><div class="page-subtitle">${g.length} gates across T1, T2, T3</div></div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-warning btn-sm" onclick="GatesModule.autoAllocateAll()">🤖 Auto-Allocate All</button>
          <button class="btn btn-primary" onclick="GatesModule.openAssignNew()">➕ Assign Gate</button>
        </div>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="stat-card green"><div class="stat-icon">🟢</div><div class="stat-label">Available</div><div class="stat-value">${g.filter(x=>x.status==='Available').length}</div></div>
        <div class="stat-card blue"><div class="stat-icon">✈</div><div class="stat-label">Occupied</div><div class="stat-value">${g.filter(x=>x.status==='Occupied').length}</div></div>
        <div class="stat-card amber"><div class="stat-icon">🔧</div><div class="stat-label">Maintenance</div><div class="stat-value">${g.filter(x=>x.status==='Maintenance').length}</div></div>
        <div class="stat-card red"><div class="stat-icon">🚫</div><div class="stat-label">Conflicts</div><div class="stat-value">${conflicts.length}</div></div>
      </div>
      ${conflicts.length?`<div class="card-sm mb-24" style="border-left:3px solid var(--red)"><strong style="color:var(--red)">⚠ ${conflicts.length} Gate Conflict(s) Detected</strong><p style="color:var(--txt2);font-size:12px;margin-top:4px">Multiple assignments found. Please review and resolve manually.</p></div>`:''}
      <div class="mb-24">
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:6px"><div style="width:14px;height:14px;border-radius:3px;background:rgba(34,197,94,.3);border:1px solid rgba(34,197,94,.5)"></div><span style="font-size:12px;color:var(--txt2)">Available</span></div>
          <div style="display:flex;align-items:center;gap:6px"><div style="width:14px;height:14px;border-radius:3px;background:rgba(79,142,247,.3);border:1px solid rgba(79,142,247,.5)"></div><span style="font-size:12px;color:var(--txt2)">Occupied</span></div>
          <div style="display:flex;align-items:center;gap:6px"><div style="width:14px;height:14px;border-radius:3px;background:rgba(245,158,11,.3);border:1px solid rgba(245,158,11,.5)"></div><span style="font-size:12px;color:var(--txt2)">Maintenance</span></div>
          <div style="display:flex;align-items:center;gap:6px"><div style="width:14px;height:14px;border-radius:3px;background:rgba(100,116,139,.2)"></div><span style="font-size:12px;color:var(--txt2)">Closed</span></div>
        </div>
        ${renderTerminalMap()}
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">📋 Gate Assignment List</div></div>
        <div class="tbl-wrap"><table>
          <thead><tr><th>Gate</th><th>Terminal</th><th>Type</th><th>Capacity</th><th>Status</th><th>Assigned Flight</th><th>Staff</th><th>Actions</th></tr></thead>
          <tbody>${g.map(gate=>{
            const f = gate.assignedFlight ? AMS.state.flights.find(x=>x.id===gate.assignedFlight):null;
            const staffCount = AMS.state.staff.filter(x=>x.gate===gate.id).length;
            return `<tr>
              <td><strong style="font-size:16px">${gate.id}</strong></td>
              <td>${gate.terminal}</td>
              <td><span class="badge ${gate.type==='International'?'cyan':'blue'}">${gate.type}</span></td>
              <td style="font-size:12px;color:var(--txt2)">${gate.capacity}</td>
              <td>${AMS.statusBadge(gate.status)}</td>
              <td>${f?`${AMS.airlineChip(f.airlineCode)} <strong>${f.flightNumber}</strong>`:'<span style="color:var(--txt3)">Unassigned</span>'}</td>
              <td><span class="badge gray">${staffCount} staff</span></td>
              <td>
                <div style="display:flex;gap:4px">
                  <button class="btn btn-ghost btn-sm" onclick="GatesModule.openGateDetail('${gate.id}')">👁</button>
                  ${gate.status==='Available'?`<button class="btn btn-success btn-sm" onclick="GatesModule.openAssign('${gate.id}')">Assign</button>`:''}
                  ${gate.status==='Occupied'?`<button class="btn btn-warning btn-sm" onclick="GatesModule.releaseGate('${gate.id}')">Release</button>`:''}
                </div>
              </td>
            </tr>`;
          }).join('')}
          </tbody>
        </table></div>
      </div>`;
  }

  function openAssignNew() { openAssign(AMS.state.gates.find(g=>g.status==='Available')?.id||AMS.state.gates[0].id); }

  return { init, openGateDetail, openAssign, assignFlight, releaseGate, changeStatus, autoAllocateAll, openAssignNew };
})();
