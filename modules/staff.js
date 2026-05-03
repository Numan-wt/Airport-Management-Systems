// ============================================================
// AeroNexus — Staff & Admin Panel Module
// ============================================================
window.StaffModule = (() => {
  let filter = { search:'', role:'all', shift:'all', status:'all' };

  function filtered() {
    return AMS.state.staff.filter(s => {
      const q = filter.search.toLowerCase();
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || s.dept.toLowerCase().includes(q);
      const matchR = filter.role === 'all' || s.role === filter.role;
      const matchSh= filter.shift === 'all' || s.shift === filter.shift;
      const matchSt= filter.status === 'all' || s.status === filter.status;
      return matchQ && matchR && matchSh && matchSt;
    });
  }

  function renderTable() {
    const rows = filtered();
    if (!rows.length) return `<div class="empty-state"><div class="empty-icon">🛡</div><p>No staff found.</p></div>`;
    return `<div class="tbl-wrap"><table>
      <thead><tr><th>Staff</th><th>Role</th><th>Department</th><th>Shift</th><th>Gate</th><th>Status</th><th>Performance</th><th>Actions</th></tr></thead>
      <tbody>${rows.map(s=>`
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0">${s.name[0]}</div>
              <div><div style="font-weight:600">${s.name}</div><div style="font-size:11px;color:var(--txt2)">${s.email}</div></div>
            </div>
          </td>
          <td><span class="badge ${s.role==='Supervisor'||s.role==='Admin'?'purple':s.role==='Security Officer'?'red':s.role==='Gate Agent'||s.role==='Check-in Agent'?'blue':'gray'}">${s.role}</span></td>
          <td style="color:var(--txt2);font-size:12px">${s.dept}</td>
          <td><span class="badge ${s.shift==='Morning'?'amber':s.shift==='Evening'?'purple':'cyan'}">${s.shift}</span></td>
          <td><strong>${s.gate}</strong></td>
          <td>${AMS.statusBadge(s.status)}</td>
          <td style="min-width:120px">
            <div class="perf-bar">
              <div class="progress" style="flex:1"><div class="progress-fill" style="width:${s.performance}%;background:${s.performance>=90?'var(--green)':s.performance>=75?'var(--amber)':'var(--red)'}"></div></div>
              <span style="font-size:12px;font-weight:700;color:${s.performance>=90?'var(--green)':s.performance>=75?'var(--amber)':'var(--red)'}">${s.performance}%</span>
            </div>
          </td>
          <td>
            <div style="display:flex;gap:4px">
              <button class="btn btn-ghost btn-sm" onclick="StaffModule.openDetail('${s.id}')">👁 View</button>
              <button class="btn btn-ghost btn-sm" onclick="StaffModule.toggleStatus('${s.id}')">${s.status==='On Duty'?'⏸':'▶'}</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody></table></div>`;
  }

  function render() { document.getElementById('staff-table').innerHTML = renderTable(); }

  function openDetail(id) {
    const s = AMS.state.staff.find(x=>x.id===id);
    if (!s) return;
    AMS.modal.open(`👤 ${s.name}`, `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800">${s.name[0]}</div>
        <div><div style="font-size:20px;font-weight:700">${s.name}</div>
          <span class="badge ${s.role==='Supervisor'||s.role==='Admin'?'purple':'blue'}">${s.role}</span>
          <div style="color:var(--txt2);font-size:12px;margin-top:4px">${s.email} · ${s.phone}</div>
        </div>
      </div>
      <div class="grid-2" style="gap:12px;margin-bottom:16px">
        <div class="card-sm"><label class="form-label">Department</label><strong>${s.dept}</strong></div>
        <div class="card-sm"><label class="form-label">Experience</label><strong>${s.experience}</strong></div>
        <div class="card-sm"><label class="form-label">Shift</label><span class="badge ${s.shift==='Morning'?'amber':s.shift==='Evening'?'purple':'cyan'}">${s.shift}</span></div>
        <div class="card-sm"><label class="form-label">Status</label>${AMS.statusBadge(s.status)}</div>
        <div class="card-sm"><label class="form-label">Assigned Gate</label><strong style="font-size:20px">${s.gate}</strong></div>
        <div class="card-sm"><label class="form-label">Performance Score</label>
          <div class="perf-bar" style="margin-top:4px">
            <strong style="color:${s.performance>=90?'var(--green)':s.performance>=75?'var(--amber)':'var(--red)'}">${s.performance}%</strong>
            <div class="progress" style="flex:1"><div class="progress-fill" style="width:${s.performance}%;background:${s.performance>=90?'var(--green)':s.performance>=75?'var(--amber)':'var(--red)'}"></div></div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-warning" onclick="StaffModule.openEdit('${id}')">✏ Edit Staff</button>
        <button class="btn btn-ghost" onclick="AMS.modal.close()">Close</button>
      </div>`);
  }

  function openEdit(id) {
    const s = AMS.state.staff.find(x=>x.id===id);
    if (!s) return;
    AMS.modal.open(`✏ Edit — ${s.name}`, `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Shift</label>
          <select id="ed-shift" class="form-control">
            ${['Morning','Evening','Night'].map(sh=>`<option ${s.shift===sh?'selected':''}>${sh}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Gate Assignment</label>
          <select id="ed-gate" class="form-control">
            ${AMS.state.gates.map(g=>`<option ${s.gate===g.id?'selected':''}>${g.id}</option>`).join('')}
            <option ${s.gate==='-'?'selected':''}>-</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Status</label>
          <select id="ed-status" class="form-control">
            ${['On Duty','Off Duty'].map(st=>`<option ${s.status===st?'selected':''}>${st}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Performance (%)</label>
          <input id="ed-perf" type="number" class="form-control" value="${s.performance}" min="0" max="100"/>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="AMS.modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="StaffModule.saveEdit('${id}')">💾 Save</button>
      </div>`);
  }

  function saveEdit(id) {
    const s = AMS.state.staff.find(x=>x.id===id);
    if (!s) return;
    s.shift  = document.getElementById('ed-shift').value;
    s.gate   = document.getElementById('ed-gate').value;
    s.status = document.getElementById('ed-status').value;
    s.performance = parseInt(document.getElementById('ed-perf').value)||s.performance;
    AMS.modal.close(); render();
    AMS.toast(`${s.name} updated`, 'success');
  }

  function toggleStatus(id) {
    const s = AMS.state.staff.find(x=>x.id===id);
    if (!s) return;
    s.status = s.status === 'On Duty' ? 'Off Duty' : 'On Duty';
    render();
    AMS.toast(`${s.name} is now ${s.status}`, 'info');
  }

  function openAdd() {
    AMS.modal.open('➕ Add Staff Member', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full Name</label><input id="ns-name" class="form-control" placeholder="Full name"/></div>
        <div class="form-group"><label class="form-label">Role</label>
          <select id="ns-role" class="form-control">
            ${['Check-in Agent','Gate Agent','Security Officer','Supervisor','Baggage Handler','Customer Service','Admin'].map(r=>`<option>${r}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Department</label>
          <select id="ns-dept" class="form-control">
            ${['Ground Ops','Security','Baggage','Passenger Svc','Administration'].map(d=>`<option>${d}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Shift</label>
          <select id="ns-shift" class="form-control"><option>Morning</option><option>Evening</option><option>Night</option></select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email</label><input id="ns-email" type="email" class="form-control"/></div>
        <div class="form-group"><label class="form-label">Phone</label><input id="ns-phone" class="form-control" placeholder="+91 9800000000"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Gate</label>
          <select id="ns-gate" class="form-control">${AMS.state.gates.map(g=>`<option>${g.id}</option>`).join('')}<option>-</option></select>
        </div>
        <div class="form-group"><label class="form-label">Experience</label><input id="ns-exp" class="form-control" placeholder="e.g. 2 years"/></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="AMS.modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="StaffModule.saveAdd()">✅ Add Staff</button>
      </div>`);
  }

  function saveAdd() {
    const name = document.getElementById('ns-name').value.trim();
    if (!name) { AMS.toast('Name is required', 'warning'); return; }
    const num = String(AMS.state.staff.length+1).padStart(3,'0');
    AMS.state.staff.unshift({
      id:'ST'+num, name,
      role:document.getElementById('ns-role').value,
      dept:document.getElementById('ns-dept').value,
      shift:document.getElementById('ns-shift').value,
      gate:document.getElementById('ns-gate').value,
      status:'On Duty', performance:85,
      experience:document.getElementById('ns-exp').value||'New',
      phone:document.getElementById('ns-phone').value,
      email:document.getElementById('ns-email').value,
    });
    AMS.modal.close(); render();
    AMS.toast(`${name} added to staff roster`, 'success');
  }

  function setFilter(key, val) { filter[key] = val; render(); }

  function init() {
    const s = AMS.state.staff;
    const onDuty = s.filter(x=>x.status==='On Duty').length;
    const roles = [...new Set(s.map(x=>x.role))];
    const el = document.getElementById('page-staff');
    el.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">🛡 Staff & Admin Panel</div><div class="page-subtitle">${s.length} staff members · ${onDuty} on duty now</div></div>
        <button class="btn btn-primary" onclick="StaffModule.openAdd()">➕ Add Staff</button>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="stat-card green"><div class="stat-icon">🛡</div><div class="stat-label">On Duty</div><div class="stat-value">${onDuty}</div></div>
        <div class="stat-card gray"><div class="stat-icon">🌙</div><div class="stat-label">Off Duty</div><div class="stat-value">${s.length-onDuty}</div></div>
        <div class="stat-card blue"><div class="stat-icon">🌅</div><div class="stat-label">Morning Shift</div><div class="stat-value">${s.filter(x=>x.shift==='Morning').length}</div></div>
        <div class="stat-card purple"><div class="stat-icon">⭐</div><div class="stat-label">Avg Performance</div><div class="stat-value">${Math.round(s.reduce((a,x)=>a+x.performance,0)/s.length)}%</div></div>
      </div>
      <div class="toolbar">
        <div class="search-box"><input placeholder="Search staff by name, role…" oninput="StaffModule.setFilter('search',this.value)"/></div>
        <select class="form-control" style="width:auto" onchange="StaffModule.setFilter('role',this.value)">
          <option value="all">All Roles</option>${roles.map(r=>`<option>${r}</option>`).join('')}
        </select>
        <select class="form-control" style="width:auto" onchange="StaffModule.setFilter('shift',this.value)">
          <option value="all">All Shifts</option><option>Morning</option><option>Evening</option><option>Night</option>
        </select>
        <select class="form-control" style="width:auto" onchange="StaffModule.setFilter('status',this.value)">
          <option value="all">All Statuses</option><option>On Duty</option><option>Off Duty</option>
        </select>
      </div>
      <div class="card" id="staff-table"></div>`;
    render();
  }

  return { init, render, openDetail, openEdit, saveEdit, toggleStatus, openAdd, saveAdd, setFilter };
})();
