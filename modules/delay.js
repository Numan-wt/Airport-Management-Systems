// ============================================================
// AeroNexus — Delay Prediction Engine Module
// ============================================================
window.DelayModule = (() => {
  let chart = null;

  function renderPredictionTable() {
    const rows = AMS.state.flights.map(f => {
      const p = AMS.predictDelay(f);
      return { f, p };
    }).sort((a,b) => b.p.score - a.p.score);

    return `<div class="tbl-wrap"><table>
      <thead><tr><th>Flight</th><th>Route</th><th>Departure</th><th>Current Status</th><th>Risk Score</th><th>Risk Level</th><th>Predicted Delay</th><th>Factors</th></tr></thead>
      <tbody>${rows.map(({f,p})=>`
        <tr>
          <td>${AMS.airlineChip(f.airlineCode)}<br><span style="font-size:11px;color:var(--txt2)">${f.flightNumber}</span></td>
          <td><strong>${f.origin}</strong> → <strong>${f.destination}</strong></td>
          <td>${AMS.fmtTime(f.scheduledDep)}</td>
          <td>${AMS.statusBadge(f.status)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;min-width:120px">
              <div class="progress" style="flex:1"><div class="progress-fill" style="width:${p.score}%;background:${p.color}"></div></div>
              <strong style="color:${p.color};min-width:28px">${p.score}</strong>
            </div>
          </td>
          <td><span class="badge ${p.level==='Low'?'green':p.level==='Medium'?'amber':'red'}">${p.level}</span></td>
          <td style="color:${p.color};font-weight:600">${p.predictedMinutes > 0 ? '+'+p.predictedMinutes+' min' : '<span style="color:var(--green)">On Time</span>'}</td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="DelayModule.openFactors('${f.id}')">📊 Details</button>
          </td>
        </tr>`).join('')}
      </tbody></table></div>`;
  }

  function openFactors(flightId) {
    const f = AMS.state.flights.find(x=>x.id===flightId);
    if (!f) return;
    const p = AMS.predictDelay(f);
    const al = AIRLINES[f.airlineCode] || {};
    const airlineRate = DELAY_RATES[f.airlineCode] || 0.2;
    const hour = new Date(f.scheduledDep).getHours();
    let timeLabel = 'Off-peak'; let timeScore = 10;
    if (hour>=7&&hour<=9){ timeLabel='Morning Peak'; timeScore=40; }
    if (hour>=17&&hour<=20){ timeLabel='Evening Peak'; timeScore=50; }
    const seed = parseInt(f.id.replace('FL',''));
    const wxScore = ((seed*7)%5)*7;

    AMS.modal.open(`📊 Delay Analysis — ${f.flightNumber}`, `
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>${AMS.airlineChip(f.airlineCode)} <strong>${f.flightNumber}</strong></div>
          <div style="text-align:right">
            <div style="font-size:32px;font-weight:900;color:${p.color}">${p.score}</div>
            <div style="font-size:12px;color:var(--txt2)">Risk Score / 100</div>
          </div>
        </div>
        <div class="risk-meter"><div class="risk-needle" style="left:${p.score}%"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--txt3);margin-top:4px"><span>Low Risk</span><span>Medium</span><span>High Risk</span></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:13px;min-width:160px;color:var(--txt2)">✈ Airline History (40%)</span>
          <div class="progress" style="flex:1"><div class="progress-fill" style="width:${Math.round(airlineRate*100)}%;background:var(--blue)"></div></div>
          <strong style="min-width:36px;text-align:right">${Math.round(airlineRate*100)}%</strong>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:13px;min-width:160px;color:var(--txt2)">🕐 Time of Day (35%) — ${timeLabel}</span>
          <div class="progress" style="flex:1"><div class="progress-fill" style="width:${timeScore}%;background:var(--amber)"></div></div>
          <strong style="min-width:36px;text-align:right">${timeScore}%</strong>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:13px;min-width:160px;color:var(--txt2)">🌤 Weather Factor (25%)</span>
          <div class="progress" style="flex:1"><div class="progress-fill" style="width:${wxScore}%;background:var(--cyan)"></div></div>
          <strong style="min-width:36px;text-align:right">${wxScore}%</strong>
        </div>
      </div>
      <div class="card-sm" style="border-left:3px solid ${p.color};margin-bottom:16px">
        <strong>Prediction: </strong>
        ${p.predictedMinutes > 0 
          ? `<span style="color:${p.color}">⚠ Likely delayed by ~${p.predictedMinutes} minutes</span>` 
          : `<span style="color:var(--green)">✅ Expected to depart on time</span>`}
        <div style="font-size:11px;color:var(--txt2);margin-top:4px">
          ${p.level === 'High' ? 'Recommend proactive passenger notification and gate standby.' :
            p.level === 'Medium' ? 'Monitor closely. Consider early boarding to minimize impact.' :
            'No immediate action required. Routine monitoring.'}
        </div>
      </div>
      <div class="card-sm">
        <label class="form-label">Historical Delay Rate — ${al.name||f.airlineCode}</label>
        <div style="font-size:24px;font-weight:800;color:${airlineRate>0.2?'var(--red)':'var(--green)'};">${Math.round(airlineRate*100)}%</div>
        <div style="font-size:11px;color:var(--txt2)">of flights delayed in last 30 days</div>
      </div>`);
  }

  function renderHeatmap() {
    const airlines = Object.keys(AIRLINES);
    const hours = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    const cells = airlines.map(al => {
      return `<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
        <div style="width:60px;font-size:11px;color:var(--txt2);flex-shrink:0">${al}</div>
        ${hours.map(h=>{
          const rate = DELAY_RATES[al]||0.2;
          const timeMult = (h>=7&&h<=9||h>=17&&h<=20)?1.8:1;
          const risk = Math.min(100,Math.round(rate*timeMult*100));
          const bg = risk < 20 ? '#22c55e30' : risk < 50 ? '#f59e0b40' : '#ef444450';
          const border = risk < 20 ? 'var(--green)' : risk < 50 ? 'var(--amber)' : 'var(--red)';
          return `<div style="width:28px;height:22px;background:${bg};border:1px solid ${border}20;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:600;color:${border}" title="${al} at ${h}:00 — Risk: ${risk}%">${risk}</div>`;
        }).join('')}
      </div>`;
    }).join('');
    const hourLabels = `<div style="display:flex;gap:4px;margin-bottom:6px;margin-left:64px">${hours.map(h=>`<div style="width:28px;font-size:9px;color:var(--txt3);text-align:center">${h}</div>`).join('')}</div>`;
    return `
      <div class="card mb-24">
        <div class="card-header"><div class="card-title">🔥 Delay Risk Heatmap — By Airline & Hour</div></div>
        <div style="overflow-x:auto;padding-bottom:4px">${hourLabels}${cells}</div>
        <div style="display:flex;gap:16px;margin-top:12px;font-size:11px;color:var(--txt2)">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:14px;height:14px;background:#22c55e30;border:1px solid var(--green);border-radius:2px"></div>Low (&lt;25)</div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:14px;height:14px;background:#f59e0b40;border:1px solid var(--amber);border-radius:2px"></div>Medium (25–55)</div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:14px;height:14px;background:#ef444450;border:1px solid var(--red);border-radius:2px"></div>High (&gt;55)</div>
        </div>
      </div>`;
  }

  function renderChart() {
    return `<div class="card mb-24">
      <div class="card-header"><div class="card-title">📈 Risk Score Distribution</div></div>
      <div class="chart-wrap"><canvas id="delay-chart"></canvas></div>
    </div>`;
  }

  function buildChart() {
    if (chart) { chart.destroy(); chart = null; }
    const data = AMS.state.flights.map(f => ({ label: f.flightNumber, score: AMS.predictDelay(f).score }))
      .sort((a,b)=>b.score-a.score).slice(0,15);
    chart = new Chart(document.getElementById('delay-chart'), {
      type:'bar',
      data:{ labels:data.map(x=>x.label), datasets:[{
        label:'Delay Risk Score',
        data:data.map(x=>x.score),
        backgroundColor:data.map(x=>x.score<25?'rgba(34,197,94,.6)':x.score<55?'rgba(245,158,11,.6)':'rgba(239,68,68,.6)'),
        borderRadius:6, borderSkipped:false,
      }]},
      options:{ responsive:true, maintainAspectRatio:false,
        scales:{ x:{ticks:{color:'#566880'},grid:{color:'#1f2d48'}}, y:{min:0,max:100,ticks:{color:'#566880'},grid:{color:'#1f2d48'}} },
        plugins:{ legend:{display:false} }
      }
    });
  }

  function init() {
    const el = document.getElementById('page-delay');
    const predictions = AMS.state.flights.map(f=>AMS.predictDelay(f));
    const highRisk = predictions.filter(p=>p.level==='High').length;
    const medRisk  = predictions.filter(p=>p.level==='Medium').length;
    const lowRisk  = predictions.filter(p=>p.level==='Low').length;
    el.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">⚠ Delay Prediction Engine</div><div class="page-subtitle">AI-powered delay risk analysis for all scheduled flights</div></div>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card red"><div class="stat-icon">🚨</div><div class="stat-label">High Risk Flights</div><div class="stat-value">${highRisk}</div><div class="stat-sub">Delay likely &gt;30 min</div></div>
        <div class="stat-card amber"><div class="stat-icon">⚠</div><div class="stat-label">Medium Risk</div><div class="stat-value">${medRisk}</div><div class="stat-sub">Monitor closely</div></div>
        <div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-label">Low Risk (On Time)</div><div class="stat-value">${lowRisk}</div><div class="stat-sub">Expected on time</div></div>
      </div>
      ${renderChart()}
      ${renderHeatmap()}
      <div class="card">
        <div class="card-header"><div class="card-title">🛫 All Flights — Delay Risk Predictions</div></div>
        ${renderPredictionTable()}
      </div>`;
    setTimeout(buildChart, 50);
  }

  return { init, openFactors };
})();
