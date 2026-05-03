// ============================================================
// AeroNexus — Check-in System Module
// ============================================================
window.CheckinModule = (() => {
  let step = 1;
  let selectedPax = null;
  let selectedSeat = null;

  // ── COUNTER STATUS ──────────────────────────────────────────
  const counters = [
    { id:'C1', label:'Counter 1', terminal:'T1', flight:'6E-789', status:'Open',   agent:'Raj Kumar',    queue:12 },
    { id:'C2', label:'Counter 2', terminal:'T1', flight:'SG-112', status:'Open',   agent:'Sneha Pillai', queue:8 },
    { id:'C3', label:'Counter 3', terminal:'T1', flight:'AI-440', status:'Open',   agent:'Priya Mehta',  queue:5 },
    { id:'C4', label:'Counter 4', terminal:'T2', flight:'UK-831', status:'Open',   agent:'Pooja Saxena', queue:20 },
    { id:'C5', label:'Counter 5', terminal:'T3', flight:'EK-509', status:'Closed', agent:'—',            queue:0 },
    { id:'C6', label:'Counter 6', terminal:'T3', flight:'QR-571', status:'Open',   agent:'Divya Sharma', queue:15 },
  ];

  function renderCounters() {
    return `<div class="grid-3" style="margin-bottom:24px">
      ${counters.map(c=>`
        <div class="card-sm" style="border-left:3px solid ${c.status==='Open'?'var(--green)':'var(--txt3)'}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong>${c.label}</strong>${AMS.statusBadge(c.status)}
          </div>
          <div style="font-size:12px;color:var(--txt2);margin-bottom:4px">✈ ${c.flight} · ${c.terminal}</div>
          <div style="font-size:12px;color:var(--txt2);margin-bottom:4px">👤 ${c.agent}</div>
          ${c.status==='Open'?`<div style="display:flex;align-items:center;gap:8px;margin-top:8px"><span style="font-size:12px;color:var(--txt2)">Queue: ${c.queue}</span><div class="progress" style="flex:1"><div class="progress-fill" style="width:${Math.min(100,c.queue*4)}%;background:${c.queue>15?'var(--red)':c.queue>8?'var(--amber)':'var(--green)'}"></div></div></div>`:''}
        </div>`).join('')}
    </div>`;
  }

  // ── WIZARD ──────────────────────────────────────────────────
  function renderWizard() {
    return `
      <div class="card">
        <div class="card-header"><div class="card-title">✅ Passenger Check-in Wizard</div></div>
        <div class="wizard-steps">
          <div class="wizard-step ${step>=1?step>1?'done':'active':''}">
            <div class="step-num">${step>1?'✓':'1'}</div><div class="step-label">Find Booking</div>
          </div>
          <div class="step-line ${step>1?'done':''}"></div>
          <div class="wizard-step ${step>=2?step>2?'done':'active':''}">
            <div class="step-num">${step>2?'✓':'2'}</div><div class="step-label">Select Seat</div>
          </div>
          <div class="step-line ${step>2?'done':''}"></div>
          <div class="wizard-step ${step>=3?'active':''}">
            <div class="step-num">3</div><div class="step-label">Boarding Pass</div>
          </div>
        </div>
        <div id="wizard-content">${renderStep()}</div>
      </div>`;
  }

  function renderStep() {
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    return '';
  }

  function renderStep1() {
    return `
      <div style="max-width:480px;margin:0 auto">
        <h3 style="margin-bottom:16px;font-size:16px">Enter Booking ID or Passenger Name</h3>
        <div class="form-group"><label class="form-label">Booking ID / Passport</label>
          <input id="ci-lookup" class="form-control" placeholder="e.g. BK-8821 or Rahul Sharma" style="font-size:15px;padding:12px"/>
        </div>
        <button class="btn btn-primary" style="width:100%;padding:12px" onclick="CheckinModule.lookup()">🔍 Find Passenger</button>
        <div id="lookup-result" style="margin-top:16px"></div>
      </div>`;
  }

  function lookup() {
    const q = document.getElementById('ci-lookup').value.trim().toLowerCase();
    if (!q) { AMS.toast('Enter a booking ID or name', 'warning'); return; }
    const p = AMS.state.passengers.find(x =>
      x.bookingId.toLowerCase().includes(q) || x.name.toLowerCase().includes(q) || x.passport.toLowerCase().includes(q)
    );
    if (!p) {
      document.getElementById('lookup-result').innerHTML = `<div class="card-sm" style="border-left:3px solid var(--red)"><strong style="color:var(--red)">❌ No passenger found</strong><p style="color:var(--txt2);font-size:12px;margin-top:4px">Check the booking ID or name and try again.</p></div>`;
      return;
    }
    if (p.checkedIn) {
      document.getElementById('lookup-result').innerHTML = `<div class="card-sm" style="border-left:3px solid var(--amber)"><strong style="color:var(--amber)">⚠ Already checked in</strong><p style="color:var(--txt2);font-size:12px;margin-top:4px">${p.name} (${p.bookingId}) is already checked in. Seat: ${p.seat}</p><button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="PassengersModule.openBoardingPass('${p.id}')">🎫 Print Boarding Pass</button></div>`;
      return;
    }
    const f = AMS.state.flights.find(x=>x.id===p.flightId);
    document.getElementById('lookup-result').innerHTML = `
      <div class="card-sm" style="border-left:3px solid var(--green)">
        <strong style="color:var(--green)">✅ Passenger Found</strong>
        <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div><div style="font-size:10px;color:var(--txt2)">NAME</div><div style="font-weight:600">${p.name}</div></div>
          <div><div style="font-size:10px;color:var(--txt2)">BOOKING</div><div style="font-weight:600;color:var(--cyan)">${p.bookingId}</div></div>
          <div><div style="font-size:10px;color:var(--txt2)">FLIGHT</div><div style="font-weight:600">${f?f.flightNumber:p.flightId}</div></div>
          <div><div style="font-size:10px;color:var(--txt2)">CLASS</div><span class="badge ${p.seatClass==='First'?'amber':p.seatClass==='Business'?'purple':'blue'}">${p.seatClass}</span></div>
          <div><div style="font-size:10px;color:var(--txt2)">ROUTE</div><div style="font-weight:600">${f?f.origin+'→'+f.destination:'—'}</div></div>
          <div><div style="font-size:10px;color:var(--txt2)">BAGGAGE</div><div style="font-weight:600">${p.baggage} kg</div></div>
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:12px" onclick="CheckinModule.proceed('${p.id}')">Next: Select Seat →</button>
      </div>`;
  }

  function proceed(id) {
    selectedPax = AMS.state.passengers.find(x=>x.id===id);
    selectedSeat = null;
    step = 2;
    document.getElementById('wizard-steps-wrap').outerHTML = renderWizard();
    // Re-render wizard
    document.getElementById('wizard-content').innerHTML = renderStep();
    updateWizardSteps();
  }

  function updateWizardSteps() {
    document.querySelectorAll('.wizard-step').forEach((el, i) => {
      el.className = 'wizard-step';
      if (i+1 < step) el.classList.add('done');
      else if (i+1 === step) el.classList.add('active');
    });
    document.querySelectorAll('.step-line').forEach((el, i) => {
      el.className = 'step-line';
      if (i+1 < step) el.classList.add('done');
    });
    document.getElementById('wizard-content').innerHTML = renderStep();
  }

  function renderStep2() {
    const f = selectedPax ? AMS.state.flights.find(x=>x.id===selectedPax.flightId) : null;
    const cap = f ? f.capacity : 180;
    const rows = Math.ceil(cap/6);
    const firstRows = 2, bizRows = 4;
    let seatHTML = `<div style="margin-bottom:12px;display:flex;gap:16px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:16px;border-radius:4px;background:rgba(245,158,11,.3);border:1px solid rgba(245,158,11,.5)"></div><span style="font-size:11px;color:var(--txt2)">First</span></div>
      <div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:16px;border-radius:4px;background:rgba(168,85,247,.3);border:1px solid rgba(168,85,247,.5)"></div><span style="font-size:11px;color:var(--txt2)">Business</span></div>
      <div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:16px;border-radius:4px;background:rgba(79,142,247,.3);border:1px solid rgba(79,142,247,.5)"></div><span style="font-size:11px;color:var(--txt2)">Economy</span></div>
      <div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:16px;border-radius:4px;background:rgba(100,116,139,.15)"></div><span style="font-size:11px;color:var(--txt2)">Occupied</span></div>
    </div>
    <div class="seat-map-wrap"><div class="seat-map">
      <div class="seat-row"><div class="seat-row-num"></div><div class="seat" style="background:transparent;border:none;font-size:11px;color:var(--txt2);width:30px">A</div><div class="seat" style="background:transparent;border:none;font-size:11px;color:var(--txt2);width:30px">B</div><div class="seat" style="background:transparent;border:none;font-size:11px;color:var(--txt2);width:30px">C</div><div class="seat aisle"></div><div class="seat" style="background:transparent;border:none;font-size:11px;color:var(--txt2);width:30px">D</div><div class="seat" style="background:transparent;border:none;font-size:11px;color:var(--txt2);width:30px">E</div><div class="seat" style="background:transparent;border:none;font-size:11px;color:var(--txt2);width:30px">F</div></div>`;
    const occupied = AMS.state.passengers.filter(x=>x.flightId===f?.id&&x.checkedIn).map(x=>x.seat);
    for (let r=1;r<=Math.min(rows,30);r++) {
      const cls = r<=firstRows?'first':r<=firstRows+bizRows?'business':'economy';
      seatHTML += `<div class="seat-row"><div class="seat-row-num">${r}</div>`;
      ['A','B','C'].forEach(col => {
        const sid=`${r}${col}`;
        const occ=occupied.includes(sid);
        seatHTML+=`<div class="seat ${cls} ${occ?'occupied':'available'}" onclick="CheckinModule.selectSeat('${sid}','${cls}')" title="${sid} — ${cls.charAt(0).toUpperCase()+cls.slice(1)}">${occ?'●':''}</div>`;
      });
      seatHTML+=`<div class="seat aisle"></div>`;
      ['D','E','F'].forEach(col => {
        const sid=`${r}${col}`;
        const occ=occupied.includes(sid);
        seatHTML+=`<div class="seat ${cls} ${occ?'occupied':'available'}" onclick="CheckinModule.selectSeat('${sid}','${cls}')" title="${sid} — ${cls.charAt(0).toUpperCase()+cls.slice(1)}">${occ?'●':''}</div>`;
      });
      seatHTML+=`</div>`;
    }
    seatHTML += `</div></div></div>`;
    return `
      <div><h3 style="margin-bottom:4px;font-size:16px">Select a Seat</h3>
      <p style="color:var(--txt2);font-size:12px;margin-bottom:16px">Recommended class: <span class="badge ${selectedPax?.seatClass==='First'?'amber':selectedPax?.seatClass==='Business'?'purple':'blue'}">${selectedPax?.seatClass}</span></p>
      ${seatHTML}
      <div id="seat-confirm" style="margin-top:16px"></div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-ghost" onclick="CheckinModule.goBack()">← Back</button>
        <button class="btn btn-ghost btn-sm" onclick="CheckinModule.autoSeat()">🤖 Auto-Assign</button>
      </div></div>`;
  }

  function selectSeat(sid, cls) {
    selectedSeat = sid;
    document.querySelectorAll('.seat.selected').forEach(s=>s.classList.remove('selected'));
    document.querySelectorAll(`.seat`).forEach(s=>{ if(s.title && s.title.startsWith(sid+' ')) s.classList.add('selected'); });
    document.getElementById('seat-confirm').innerHTML = `
      <div class="card-sm" style="border-left:3px solid var(--green);display:flex;align-items:center;justify-content:space-between">
        <div><strong>Seat ${sid}</strong> selected — <span class="badge ${cls==='first'?'amber':cls==='business'?'purple':'blue'}">${cls}</span></div>
        <button class="btn btn-primary" onclick="CheckinModule.confirmSeat()">Confirm →</button>
      </div>`;
  }

  function autoSeat() {
    const f = AMS.state.flights.find(x=>x.id===selectedPax?.flightId);
    const occupied = AMS.state.passengers.filter(x=>x.flightId===f?.id&&x.checkedIn).map(x=>x.seat);
    const cols=['A','B','C','D','E','F'];
    for (let r=1;r<=30;r++) {
      for (const col of cols) {
        const sid=`${r}${col}`;
        if (!occupied.includes(sid)) { selectSeat(sid, r<=2?'first':r<=6?'business':'economy'); return; }
      }
    }
    AMS.toast('No seats available', 'error');
  }

  function confirmSeat() {
    if (!selectedSeat || !selectedPax) return;
    step = 3;
    selectedPax.seat = selectedSeat;
    selectedPax.checkedIn = true;
    const f = AMS.state.flights.find(x=>x.id===selectedPax.flightId);
    if (f) f.checkedIn = Math.min(f.capacity, f.checkedIn + 1);
    updateWizardSteps();
  }

  function renderStep3() {
    const p = selectedPax;
    const f = p ? AMS.state.flights.find(x=>x.id===p.flightId) : null;
    return `
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:48px;margin-bottom:8px">🎉</div>
        <h3 style="font-size:20px;color:var(--green)">Check-in Successful!</h3>
        <p style="color:var(--txt2);font-size:13px">${p?.name} is now checked in</p>
      </div>
      <div class="boarding-pass" style="margin-bottom:16px">
        <div class="bp-header">
          <div><div class="bp-airline">${f?AMS.airline(f.airlineCode).name:'Flight'}</div><div class="bp-type">BOARDING PASS</div></div>
          <div style="text-align:right"><div style="font-size:11px;color:var(--txt2)">Class</div><div style="font-size:15px;font-weight:700">${p?.seatClass?.toUpperCase()}</div></div>
        </div>
        <div class="bp-route">
          <div class="bp-airport"><div class="bp-code">${f?.origin||'—'}</div><div class="bp-city">${f?AMS.airport(f.origin).city:'—'}</div></div>
          <div class="bp-arrow">✈</div>
          <div class="bp-airport"><div class="bp-code">${f?.destination||'—'}</div><div class="bp-city">${f?AMS.airport(f.destination).city:'—'}</div></div>
        </div>
        <div class="bp-details">
          <div class="bp-field"><label>Passenger</label><span>${p?.name}</span></div>
          <div class="bp-field"><label>Flight</label><span>${f?.flightNumber}</span></div>
          <div class="bp-field"><label>Gate</label><span>${f?.gate}</span></div>
          <div class="bp-field"><label>Seat</label><span style="font-size:22px;color:var(--blue)">${p?.seat}</span></div>
        </div>
        <div style="display:flex;justify-content:center;margin-top:12px" id="qr-ci"></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn btn-primary" onclick="window.print()">🖨 Print Pass</button>
        <button class="btn btn-ghost" onclick="CheckinModule.reset()">✅ New Check-in</button>
      </div>`;
  }

  function goBack() { step = Math.max(1, step - 1); updateWizardSteps(); }

  function reset() {
    step = 1; selectedPax = null; selectedSeat = null;
    document.getElementById('wizard-content').innerHTML = renderStep();
    updateWizardSteps();
  }

  function init() {
    step = 1; selectedPax = null; selectedSeat = null;
    const el = document.getElementById('page-checkin');
    el.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">✅ Check-in System</div><div class="page-subtitle">Manage passenger check-in and seat assignment</div></div>
      </div>
      <h3 style="font-size:14px;font-weight:700;color:var(--txt2);letter-spacing:.5px;text-transform:uppercase;margin-bottom:12px">Counter Status</h3>
      ${renderCounters()}
      <div id="wizard-steps-wrap">${renderWizard()}</div>`;
    setTimeout(()=>{
      const qrel = document.getElementById('qr-ci');
      if(qrel&&selectedPax&&typeof QRCode!=='undefined') new QRCode(qrel,{text:selectedPax.bookingId,width:80,height:80,colorDark:'#4f8ef7',colorLight:'#141c30'});
    },200);
  }

  return { init, lookup, proceed, selectSeat, autoSeat, confirmSeat, goBack, reset };
})();
