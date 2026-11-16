/* SKD Empire — layout + financial model (shared by website, renders and deck) */
(function (root) {
  const SQM_PER_SQYD = 0.83612736;
  const LAND = { sqm: 85633, sqyd: 102417.068, acres: 21.161, rate: 4000 };

  /* ---------------- Layout (metres). x = width, z = depth, gate at z = SITE.D ---------------- */
  const SITE = { W: 334, D: 256, blvd: [159.5, 174.5], road: 9 };
  const TYPES = {
    250: { w: 13.716, d: 15.24, ft: '45 ft × 50 ft', sqm: 209.0, color: '#F3E4C2' },
    350: { w: 13.716, d: 21.336, ft: '45 ft × 70 ft', sqm: 292.6, color: '#E4C68E' },
    500: { w: 15.24, d: 27.432, ft: '50 ft × 90 ft', sqm: 418.1, color: '#D4AE6C' }
  };
  // rows from the back wall (z=0) towards the gate; 'R' = 9 m road
  const SEQ = [['A', 250, +1], 'R', ['B', 250, -1], ['C', 250, +1], 'R', ['D', 250, -1], ['E', 350, +1], 'R',
               ['F', 350, -1], ['G', 350, +1], 'R', ['H', 500, -1], ['I', 500, +1], 'R'];
  // facing: +1 = road on the gate side (higher z), -1 = road on the back side

  function buildLayout() {
    const plots = [], roads = [], rows = [];
    let z = 0, no = 1;
    for (const s of SEQ) {
      if (s === 'R') { roads.push({ x0: 0, x1: SITE.W, z0: z, z1: z + SITE.road, w: SITE.road }); z += SITE.road; continue; }
      const [row, type, facing] = s, t = TYPES[type];
      const halfW = SITE.blvd[0];
      const n = Math.floor(halfW / t.w);
      rows.push({ row, type, z0: z, z1: z + t.d, n: n * 2 });
      for (const side of ['L', 'R']) {
        for (let i = 0; i < n; i++) {
          const x0 = side === 'L' ? SITE.blvd[0] - (i + 1) * t.w : SITE.blvd[1] + i * t.w;
          let plc = 0, tag = 'Standard';
          if (i === 0) { plc = 0.10; tag = 'Boulevard corner'; }
          else if (row === 'I') { plc = 0.05; tag = 'Garden facing'; }
          else if (i === n - 1) { plc = 0.05; tag = 'Green-belt facing'; }
          plots.push({ id: `${row}-${String(no).padStart(3, '0')}`, no, row, side, type, x0, z0: z, w: t.w, d: t.d, facing, plc, tag });
          no++;
        }
      }
      z += t.d;
    }
    const frontZ = z; // amenity zone from frontZ to SITE.D
    roads.push({ x0: SITE.blvd[0], x1: SITE.blvd[1], z0: 0, z1: SITE.D, w: 15, blvd: true });
    // land-use statement
    const plotSqm = plots.reduce((a, p) => a + p.w * p.d, 0);
    const roadSqm = roads.filter(r => !r.blvd).reduce((a, r) => a + (r.x1 - r.x0 - (SITE.blvd[1] - SITE.blvd[0])) * r.w, 0) + 15 * SITE.D;
    const clubSqm = 2600, utilSqm = 900;
    const openSqm = LAND.sqm - plotSqm - roadSqm - clubSqm - utilSqm;
    const byType = {};
    for (const k of [250, 350, 500]) { const c = plots.filter(p => p.type == k).length; byType[k] = { count: c, sqyd: c * k }; }
    const saleSqyd = plots.reduce((a, p) => a + p.type, 0);
    return {
      plots, roads, rows, frontZ, byType, saleSqyd,
      landUse: [
        { k: 'Saleable plots', sqm: plotSqm, color: '#C9A86A' },
        { k: 'Roads & footpaths', sqm: roadSqm, color: '#566077' },
        { k: 'Gardens, green belts & open space', sqm: openSqm, color: '#8FA77E' },
        { k: 'Clubhouse & amenities', sqm: clubSqm, color: '#7FA6C4' },
        { k: 'Utilities (STP, sump, substation)', sqm: utilSqm, color: '#C8795A' }
      ].map(o => ({ ...o, pct: o.sqm / LAND.sqm * 100 }))
    };
  }

  /* ---------------- Cost book (₹ crore at Nov-2026 rates, GST-inclusive) ---------------- */
  const CR = 1e7;
  const inr = n => Math.round(n).toLocaleString('en-IN');
  const landCost = LAND.sqyd * LAND.rate / CR;
  const COSTS = {
    acquisition: [
      { k: 'Land purchase (1,02,417 sq yd × ₹4,000)', v: landCost, m: [0, 0] },
      { k: 'Stamp duty 4.9% + registration 1%', v: landCost * 0.059, m: [0, 0] },
      { k: 'NA conversion, NOC, title & legal (already done — confirm actuals)', v: 0.35, m: [0, 0] }
    ],
    approvals: [
      { k: 'Layout plan pass & development permission fees', v: 0.15, m: [0, 1] },
      { k: 'Architect, town planner & structural consultants', v: 0.15, m: [0, 20] },
      { k: 'GujRERA registration & quarterly compliance (CA, legal)', v: 0.17, m: [0, 36] },
      { k: 'Contour survey, soil test & DISCOM / water approvals', v: 0.04, m: [0, 3] }
    ],
    development: [
      { k: 'Site clearing, levelling & murrum filling', v: 1.00, m: [1, 4], icon: 'level' },
      { k: 'Boundary wall 2.4 m (≈1,180 rm)', v: 0.80, m: [1, 6], icon: 'wall' },
      { k: 'Grand entrance gate, security cabin & signage', v: 0.45, m: [2, 6], icon: 'gate' },
      { k: 'Roads: 15 m boulevard + 9 m internal, bituminous, kerbs & pavers', v: 2.50, m: [4, 16], icon: 'road' },
      { k: 'Storm-water drains (≈3,700 rm, covered)', v: 0.96, m: [3, 14], icon: 'drain' },
      { k: 'Sewer network & house chambers', v: 0.60, m: [3, 12], icon: 'sewer' },
      { k: 'Sewage treatment plant 130 KLD (modular)', v: 0.45, m: [18, 24], icon: 'stp' },
      { k: 'Water supply: sump, pumps, borewells & HDPE network', v: 0.70, m: [4, 14], icon: 'water' },
      { k: 'Underground power: transformers, RMU, LT cabling, feeder pillars', v: 1.30, m: [5, 18], icon: 'power' },
      { k: 'LED street lights (≈140 poles) & boulevard lighting', v: 0.50, m: [12, 20], icon: 'light' },
      { k: 'Clubhouse 6,500 sq ft, pool, gym & furnishing', v: 2.42, m: [4, 20], icon: 'club' },
      { k: 'Landscaping: central garden, green belts, 450 avenue trees', v: 0.75, m: [8, 24], icon: 'tree' },
      { k: 'Kids play, sports court & jogging track', v: 0.35, m: [14, 22], icon: 'sport' },
      { k: 'CCTV, boom barrier & smart access', v: 0.20, m: [16, 20], icon: 'cctv' },
      { k: 'Rain-water harvesting & percolation wells', v: 0.12, m: [6, 12], icon: 'rain' },
      { k: 'Plot demarcation pillars & numbering', v: 0.06, m: [1, 3], icon: 'peg' }
    ]
  };

  const BASE = {
    // land
    landRate: 4000, stampPct: 0.059, naCost: 0.35,
    // pricing & sales
    launch: { 250: 10000, 350: 9750, 500: 9500 },   // ₹ per sq yd, launch (all-inclusive of development)
    tranche: 50, step: 0.06,                         // +6% after every 50 plots sold
    quarters: [34, 22, 20, 20, 20, 18, 18, 16, 14, 12], // plots sold per quarter from launch
    launchMonth: 1, pace: 1, priceMul: 1, plcMul: 1,
    club: 0.01,                                      // ₹1 lakh club membership per plot (₹ Cr)
    booking: 0.25, registryLag: 2,
    // development
    devMul: 1, dev: null, appr: null,                // dev / appr: optional arrays of ₹ Cr overrides per line
    pmc: 0.03, contingency: 0.07, escalation: 0.05,
    villa: { cost: 0.85, sale: 1.10, m: [1, 8], saleMonth: 24 },
    // soft costs
    marketingPct: 0.0175, adminMonthly: 0.045, office: 0.30, insurance: 0.08, maintenance: 0.30,
    commission: 0,                                   // dealer commission switched off (direct sales)
    // finance & tax
    interest: 0.12, taxRate: 0.3494
  };

  const SCENARIOS = {
    conservative: { name: 'Conservative', priceMul: 0.93, pace: 1.5, escalation: 0.07, marketingPct: 0.0225 },
    base: { name: 'Base case' },
    optimistic: { name: 'Optimistic', priceMul: 1.08, pace: 0.8, step: 0.07 }
  };

  const START = { y: 2026, m: 11 }; // month 0 = Nov 2026
  function monthLabel(i) { const d = new Date(START.y, START.m - 1 + i, 1); return d.toLocaleString('en-GB', { month: 'short' }).replace('Sept', 'Sep') + ' ’' + String(d.getFullYear()).slice(2); }
  function monthFull(i) { const d = new Date(START.y, START.m - 1 + i, 1); return d.toLocaleString('en-GB', { month: 'short' }).replace('Sept', 'Sep') + ' ' + d.getFullYear(); }

  function run(over = {}) {
    const A = { ...BASE, ...over, launch: { ...BASE.launch, ...(over.launch || {}) }, villa: { ...BASE.villa, ...(over.villa || {}) } };
    const L = buildLayout();
    const N = L.plots.length;
    const landC = LAND.sqyd * A.landRate / CR;
    const acq = [
      { k: `Land purchase (1,02,417 sq yd × ₹${inr(A.landRate)})`, v: landC },
      { k: `Stamp duty & registration (${(A.stampPct * 100).toFixed(1)}%)`, v: landC * A.stampPct },
      { k: 'NA conversion, NOC, title & legal', v: A.naCost }
    ];
    // inventory value at launch rates (with PLC)
    const valOf = p => p.type * A.launch[p.type] * A.priceMul * (1 + p.plc * A.plcMul) / CR;
    const invValue = L.plots.reduce((a, p) => a + valOf(p), 0);
    const invByType = { 250: 0, 350: 0, 500: 0 };
    L.plots.forEach(p => invByType[p.type] += valOf(p));
    const avgPlot = invValue / N;
    // sales curve
    const qs = A.quarters, cum = [0];
    qs.forEach(q => { for (let i = 0; i < 3; i++) cum.push(cum[cum.length - 1] + q / 3); });
    const C = t => { if (t <= 0) return 0; const i = Math.floor(t); if (i >= cum.length - 1) return N; return cum[i] + (cum[i + 1] - cum[i]) * (t - i); };
    const H = 120, months = [...Array(H)].map((_, i) => ({ i, label: monthLabel(i), sold: 0, rev: 0, bookingIn: 0, registryIn: 0, out: {}, outTotal: 0 }));
    let soldCum = 0, sellout = 0;
    const lm = Math.round(A.launchMonth);
    for (let m = lm; m < H; m++) {
      const target = Math.min(N, Math.round(C((m - lm + 1) / A.pace)));
      let s = target - soldCum; if (s <= 0) continue;
      for (let k = 0; k < s; k++) {
        const tr = Math.floor(soldCum / A.tranche);
        const v = avgPlot * Math.pow(1 + A.step, tr) + A.club;
        months[m].rev += v; months[m].bookingIn += v * A.booking;
        months[Math.min(H - 1, m + A.registryLag)].registryIn += v * (1 - A.booking);
        soldCum++;
      }
      months[m].sold = s; if (soldCum >= N && !sellout) sellout = m;
    }
    if (!sellout) sellout = H - A.registryLag - 1;
    const end = sellout + A.registryLag;
    const lines = [];
    const add = (cat, k, v, m0, m1, esc) => {
      m0 = Math.max(0, Math.min(m0, H - 1)); m1 = Math.max(m0, Math.min(m1, H - 1));
      const n = m1 - m0 + 1; let tot = 0;
      for (let m = m0; m <= m1; m++) { const f = esc ? Math.pow(1 + A.escalation, m / 12) : 1; const x = v / n * f; tot += x; months[m].out[cat] = (months[m].out[cat] || 0) + x; }
      lines.push({ cat, k, base: v, v: tot, m: [m0, m1] });
    };
    acq.forEach(c => add('Land & acquisition', c.k, c.v, 0, 0, false));
    COSTS.approvals.forEach((c, i) => add('Approvals & consultants', c.k, A.appr ? A.appr[i] : c.v, c.m[0], Math.min(c.m[1], end), false));
    const devVals = COSTS.development.map((c, i) => (A.dev ? A.dev[i] : c.v) * A.devMul);
    const devBase = devVals.reduce((a, b) => a + b, 0);
    COSTS.development.forEach((c, i) => add('Site development', c.k, devVals[i], ...c.m, true));
    add('Site development', 'Project management (PMC) & site supervision', devBase * A.pmc, 1, 24, true);
    add('Contingency', 'Contingency on development', devBase * A.contingency, 1, 26, true);
    add('Show villa', 'Show villa build (500 sq yd, G+1, furnished)', A.villa.cost * A.devMul, ...A.villa.m, true);
    const plotRev = months.reduce((a, m) => a + m.rev, 0) - N * A.club;
    add('Marketing & brand', 'Launch campaign, brochures, site events', plotRev * A.marketingPct * 0.35, Math.max(0, lm - 1), lm + 5, false);
    add('Marketing & brand', 'Digital leads, sales lounge & ongoing promotion', plotRev * A.marketingPct * 0.65, lm + 6, Math.max(lm + 6, sellout), false);
    add('Admin & overheads', `Site office team & salaries (₹${(A.adminMonthly * 100).toFixed(1)} L / month)`, A.adminMonthly * end, 1, end, false);
    add('Admin & overheads', 'Office set-up, IT, CRM & legal retainers', A.office, 1, end, false);
    add('Admin & overheads', 'Insurance (CAR, public liability)', A.insurance, 1, end, false);
    add('Maintenance till handover', 'Security, upkeep & utilities until RWA takes over', A.maintenance, 20, Math.max(21, end), false);
    if (A.commission > 0) {
      let tot = 0;
      for (let m = 0; m < H; m++) { const s = months[m].sold; if (s) { const mm = Math.min(H - 1, m + A.registryLag), x = (months[m].rev - s * A.club) * A.commission; tot += x; months[mm].out['Dealer commission'] = (months[mm].out['Dealer commission'] || 0) + x; } }
      lines.push({ cat: 'Dealer commission', k: 'Dealer commission', v: tot });
    }
    const vsm = Math.min(H - 1, Math.max(A.villa.m[1] + 1, A.villa.saleMonth));
    months[vsm].villaIn = A.villa.sale;
    // cash, debt, interest
    const equity = acq.reduce((a, c) => a + c.v, 0);
    let cash = 0, debt = 0, peakDebt = 0, interestTot = 0, cumNet = 0, peakDebtMonth = 0;
    months.forEach((m, i) => {
      m.in = m.bookingIn + m.registryIn + (m.villaIn || 0);
      if (i === 0) m.in += equity; // promoters fund land
      m.interest = debt * A.interest / 12; interestTot += m.interest;
      if (m.interest) m.out['Finance cost'] = m.interest;
      m.outTotal = Object.values(m.out).reduce((a, b) => a + b, 0);
      cash += m.in - m.outTotal;
      if (cash < 0) { debt += -cash; cash = 0; } else if (debt > 0) { const r = Math.min(debt, cash); debt -= r; cash -= r; }
      if (debt > peakDebt) { peakDebt = debt; peakDebtMonth = i; }
      m.debt = debt; m.cash = cash;
      cumNet += (m.in - (i === 0 ? equity : 0)) - m.outTotal; m.cumNet = cumNet; // project view (land as outflow)
    });
    if (interestTot > 0) lines.push({ cat: 'Finance cost', k: `Interest on working capital at ${(A.interest * 100).toFixed(1)}%`, v: interestTot });
    const sumCat = k => months.reduce((a, m) => a + (m.out[k] || 0), 0);
    const cats = ['Land & acquisition', 'Approvals & consultants', 'Site development', 'Contingency', 'Show villa', 'Marketing & brand', 'Dealer commission', 'Admin & overheads', 'Maintenance till handover', 'Finance cost'];
    const costBy = {};
    cats.forEach(k => { const v = sumCat(k); if (v > 1e-9 || k !== 'Dealer commission') costBy[k] = v; });
    const totalCost = Object.values(costBy).reduce((a, b) => a + b, 0);
    const clubRev = N * A.club, villaRev = A.villa.sale;
    const revenue = plotRev + clubRev + villaRev;
    const revByType = {};
    [250, 350, 500].forEach(t => { const share = invByType[t] / invValue; revByType[t] = { count: L.byType[t].count, sqyd: L.byType[t].sqyd, rev: plotRev * share, rate: plotRev * share * CR / L.byType[t].sqyd }; });
    const pbt = revenue - totalCost, tax = Math.max(0, pbt) * A.taxRate, pat = pbt - tax;
    let eqBack = null; { for (const m of months) if (m.cash >= equity - 1e-6 && m.debt < 1e-6 && eqBack === null && m.i > 0) eqBack = m.i; }
    const capital = equity + peakDebt;
    const breakEvenRate = (totalCost - clubRev - villaRev) * CR / L.saleSqyd; // ignoring second-order effects
    const cut = months.slice(0, end + 2);
    let trough = 0, troughMonth = 0; cut.forEach(m => { if (m.cumNet < trough) { trough = m.cumNet; troughMonth = m.i; } });
    return {
      A, L, months: cut, sellout, end, equity, peakDebt, peakDebtMonth, interestTot, costBy, lines, totalCost, devBase, landC,
      revenue, plotRev, clubRev, villaRev, revByType, invValue, pbt, cashBreakeven: (cut.find(m => m.i > 0 && m.cumNet >= 0) || {}).i, trough, troughMonth,
      tax, pat, margin: pbt / revenue, roi: pat / capital, capital,
      avgRate: plotRev * CR / L.saleSqyd, costPerSqyd: totalCost * CR / L.saleSqyd, breakEvenRate, eqBack, years: end / 12
    };
  }

  // true break-even: the price multiplier (and resulting average ₹/sq yd) at which profit before tax = 0
  function breakEven(over = {}) {
    let lo = 0.4, hi = 2.0;
    const f = k => run({ ...over, priceMul: (over.priceMul || 1) * k }).pbt;
    for (let i = 0; i < 28; i++) { const mid = (lo + hi) / 2; if (f(mid) > 0) hi = mid; else lo = mid; }
    const k = (lo + hi) / 2, r = run({ ...over, priceMul: (over.priceMul || 1) * k });
    return { k, avgRate: r.avgRate, launch250: (over.launch && over.launch[250] || BASE.launch[250]) * (over.priceMul || 1) * k };
  }

  const fmtCr = (v, d = 2) => '₹' + v.toFixed(d) + ' Cr';
    const api = { SQM_PER_SQYD, LAND, SITE, TYPES, COSTS, BASE, SCENARIOS, buildLayout, run, breakEven, fmtCr, inr, monthLabel, monthFull, landCost };
  root.SKD = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
