// ============================================================
// AeroNexus — Passenger System Module
// ============================================================
window.PassengersModule = (() => {
  let search = '';

  function filtered() {
    const q = search.toLowerCase();
    return AMS.state.passengers.filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.bookingId.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) || p.flightId.toLowerCase().includes(q)
    );
  }

  function renderTable() {
    const rows = filtered();
    if (!rows.length) return `<div class="empty-state"><div class="empty-icon">👤</div><p>No passengers found.</p></div>`;
    return `<div class="tbl-wrap"><table>
      <thead><tr><th>Booking ID</th><th>Passenger</th><th>Flight</th><th>Seat</th><th>Class</th><th>Baggage</th><th>Check-in</th><th>Special</th><th>Actions</th></tr></thead>
      <tbody>${rows.map(p => {
        const f = AMS.state.flights.find(x=>x.id===p.flightId);
        return `<tr>
          <td><code style="color:var(--cyan);font-size:12px">${p.bookingId}</code></td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0">${p.name[0]}</div>
              <div><div style="font-weight:600">${p.name}</div><div style="font-size:11px;color:var(--txt2)">${p.nationality}</div></div>
            </div>
          </td>
          <td><strong>${f?f.flightNumber:p.flightId}</strong>${f?`<br><span style="font-size:11px;color:var(--txt2)">${f.origin}→${f.destination}</span>`:''}</td>
          <td><strong style="font-size:15px">${p.seat}</strong></td>
          <td><span class="badge ${p.seatClass==='First'?'amber':p.seatClass==='Business'?'purple':'blue'}">${p.seatClass}</span></td>
          <td>${p.baggage} kg</td>
          <td>${p.checkedIn?'<span class="badge green">✓ Done</span>':'<span class="badge gray">Pending</span>'}</td>
          <td>${p.specialAssistance?'<span class="badge amber">♿ Yes</span>':'<span class="badge gray">No</span>'}</td>
          <td>
            <div style="display:flex;gap:4px">
              <button class="btn btn-ghost btn-sm" onclick="PassengersModule.openDetail('${p.id}')">👁 View</button>
              <button class="btn btn-success btn-sm" onclick="PassengersModule.openBoardingPass('${p.id}')">🎫 Pass</button>
            </div>
          </td>
        </tr>`;
      }).join('')}
      </tbody></table></div>`;
  }

  function render() { document.getElementById('pax-table').innerHTML = renderTable(); }

  function openDetail(id) {
    const p = AMS.state.passengers.find(x=>x.id===id);
    if (!p) return;
    const f = AMS.state.flights.find(x=>x.id===p.flightId);
    AMS.modal.open(`👤 Passenger — ${p.name}`, `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800">${p.name[0]}</div>
        <div><div style="font-size:20px;font-weight:700">${p.name}</div><div style="color:var(--txt2)">${p.email}</div><div style="color:var(--txt2)">${p.phone}</div></div>
      </div>
      <div class="grid-2" style="gap:12px;margin-bottom:16px">
        <div class="card-sm"><label class="form-label">Booking ID</label><strong style="color:var(--cyan)">${p.bookingId}</strong></div>
        <div class="card-sm"><label class="form-label">Nationality</label><strong>${p.nationality}</strong></div>
        <div class="card-sm"><label class="form-label">Passport</label><strong>${p.passport}</strong></div>
        <div class="card-sm"><label class="form-label">Class</label><span class="badge ${p.seatClass==='First'?'amber':p.seatClass==='Business'?'purple':'blue'}">${p.seatClass}</span></div>
        <div class="card-sm"><label class="form-label">Seat</label><strong style="font-size:20px">${p.seat}</strong></div>
        <div class="card-sm"><label class="form-label">Baggage</label><strong>${p.baggage} kg</strong></div>
        <div class="card-sm"><label class="form-label">Check-in Status</label>${p.checkedIn?'<span class="badge green">Checked In</span>':'<span class="badge gray">Pending</span>'}</div>
        <div class="card-sm"><label class="form-label">Special Assistance</label>${p.specialAssistance?'<span class="badge amber">♿ Required</span>':'<span class="badge gray">Not Required</span>'}</div>
      </div>
      ${f?`<div class="card-sm" style="margin-bottom:16px"><label class="form-label">Flight Details</label><div style="margin-top:6px">${AMS.airlineChip(f.airlineCode)} <strong>${f.flightNumber}</strong> — ${f.origin} → ${f.destination}<br><span style="font-size:12px;color:var(--txt2)">${AMS.fmtTime(f.scheduledDep)} · Gate ${f.gate} · ${f.terminal}</span></div></div>`:''}
      <div style="display:flex;gap:8px;justify-content:flex-end">
        ${!p.checkedIn?`<button class="btn btn-success" onclick="PassengersModule.checkIn('${p.id}')">✅ Check In Now</button>`:''}
        <button class="btn btn-primary" onclick="PassengersModule.openBoardingPass('${p.id}')">🎫 Boarding Pass</button>
      </div>`);
  }

  function checkIn(id) {
    const p = AMS.state.passengers.find(x=>x.id===id);
    if (!p) return;
    p.checkedIn = true;
    AMS.modal.close();
    render();
    AMS.toast(`${p.name} checked in successfully`, 'success');
  }

  function openBoardingPass(id) {
    const p = AMS.state.passengers.find(x=>x.id===id);
    if (!p) return;
    const f = AMS.state.flights.find(x=>x.id===p.flightId);
    if (!f) { AMS.toast('Flight not found', 'error'); return; }
    AMS.modal.open('🎫 Boarding Pass', `
      <div class="boarding-pass">
        <div class="bp-header">
          <div><div class="bp-airline">${AMS.airline(f.airlineCode).name}</div><div class="bp-type">BOARDING PASS</div></div>
          <div style="text-align:right"><div style="font-size:11px;color:var(--txt2)">Class</div><div style="font-size:15px;font-weight:700">${p.seatClass.toUpperCase()}</div></div>
        </div>
        <div class="bp-route">
          <div class="bp-airport"><div class="bp-code">${f.origin}</div><div class="bp-city">${AMS.airport(f.origin).city}</div></div>
          <div class="bp-arrow">✈</div>
          <div class="bp-airport"><div class="bp-code">${f.destination}</div><div class="bp-city">${AMS.airport(f.destination).city}</div></div>
        </div>
        <div class="bp-details">
          <div class="bp-field"><label>Passenger</label><span>${p.name}</span></div>
          <div class="bp-field"><label>Flight</label><span>${f.flightNumber}</span></div>
          <div class="bp-field"><label>Date</label><span>${AMS.fmtDate(f.scheduledDep)}</span></div>
          <div class="bp-field"><label>Departure</label><span>${AMS.fmtTime(f.scheduledDep)}</span></div>
          <div class="bp-field"><label>Gate</label><span>${f.gate}</span></div>
          <div class="bp-field"><label>Terminal</label><span>${f.terminal}</span></div>
          <div class="bp-field"><label>Seat</label><span style="font-size:22px;color:var(--blue)">${p.seat}</span></div>
          <div class="bp-field"><label>Booking</label><span style="font-size:11px;color:var(--cyan)">${p.bookingId}</span></div>
        </div>
        <div style="display:flex;justify-content:center;margin-top:16px" id="qr-bp-${id}"></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:16px">
        <button class="btn btn-primary" onclick="window.print()">🖨 Print Pass</button>
        <button class="btn btn-ghost" onclick="AMS.modal.close()">Close</button>
      </div>`);
    setTimeout(() => {
      const el = document.getElementById(`qr-bp-${id}`);
      if (el && typeof QRCode !== 'undefined') new QRCode(el, { text:`${p.bookingId}|${f.flightNumber}|${p.seat}`, width:100, height:100, colorDark:'#4f8ef7', colorLight:'#141c30' });
    }, 100);
  }

  function openAdd() {
    AMS.modal.open('➕ Add Passenger', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full Name</label><input id="np-name" class="form-control" placeholder="Passenger full name"/></div>
        <div class="form-group"><label class="form-label">Nationality</label><input id="np-nat" class="form-control" placeholder="e.g. Indian"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email</label><input id="np-email" type="email" class="form-control"/></div>
        <div class="form-group"><label class="form-label">Phone</label><input id="np-phone" class="form-control" placeholder="+91 9876543210"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Flight</label>
          <select id="np-flight" class="form-control">${AMS.state.flights.filter(f=>f.status!=='Cancelled'&&f.status!=='Departed'&&f.status!=='Landed').map(f=>`<option value="${f.id}">${f.flightNumber} — ${f.origin}→${f.destination}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Class</label>
          <select id="np-class" class="form-control"><option>Economy</option><option>Business</option><option>First</option></select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Passport #</label><input id="np-pass" class="form-control" placeholder="Passport number"/></div>
        <div class="form-group"><label class="form-label">Baggage (kg)</label><input id="np-bag" type="number" class="form-control" value="15"/></div>
      </div>
      <div class="form-group">
        <label class="form-label" style="display:flex;align-items:center;gap:8px">
          <input type="checkbox" id="np-special"/> Special Assistance Required
        </label>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="AMS.modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="PassengersModule.saveAdd()">✅ Add Passenger</button>
      </div>`);
  }

  function saveAdd() {
    const name = document.getElementById('np-name').value.trim();
    const email= document.getElementById('np-email').value.trim();
    if (!name || !email) { AMS.toast('Name and email are required', 'warning'); return; }
    const num  = AMS.state.passengers.length + 1;
    const pad  = String(num).padStart(3,'0');
    AMS.state.passengers.unshift({
      id:'PAX'+pad, bookingId:'BK-'+Math.floor(9000+Math.random()*1000),
      name, email, phone:document.getElementById('np-phone').value,
      flightId:document.getElementById('np-flight').value,
      seat:'TBA', seatClass:document.getElementById('np-class').value,
      checkedIn:false, boarded:false,
      baggage:parseInt(document.getElementById('np-bag').value)||15,
      specialAssistance:document.getElementById('np-special').checked,
      nationality:document.getElementById('np-nat').value||'Unknown',
      passport:document.getElementById('np-pass').value,
    });
    AMS.modal.close(); render();
    AMS.toast(`${name} added successfully`, 'success');
  }

  function init() {
    const el = document.getElementById('page-passengers');
    const stats = { total:AMS.state.passengers.length, checked:AMS.state.passengers.filter(x=>x.checkedIn).length, special:AMS.state.passengers.filter(x=>x.specialAssistance).length };
    el.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">👤 Passenger System</div><div class="page-subtitle">${stats.total} passengers registered today</div></div>
        <button class="btn btn-primary" onclick="PassengersModule.openAdd()">➕ Add Passenger</button>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card blue"><div class="stat-icon">👥</div><div class="stat-label">Total Passengers</div><div class="stat-value">${stats.total}</div></div>
        <div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-label">Checked In</div><div class="stat-value">${stats.checked}</div><div class="stat-sub">${Math.round(stats.checked/stats.total*100)}% of total</div></div>
        <div class="stat-card amber"><div class="stat-icon">♿</div><div class="stat-label">Special Assistance</div><div class="stat-value">${stats.special}</div></div>
      </div>
      <div class="toolbar">
        <div class="search-box"><input placeholder="Search by name, booking ID, flight…" oninput="PassengersModule.setSearch(this.value)"/></div>
      </div>
      <div class="card" id="pax-table"></div>`;
    render();
  }

  function setSearch(v) { search = v; render(); }

  return { init, render, openDetail, checkIn, openBoardingPass, openAdd, saveAdd, setSearch };
})();
