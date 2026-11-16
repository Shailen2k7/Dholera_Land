
const S=SKD,L=S.buildLayout(),B=S.BASE,C=S.COSTS,$=id=>document.getElementById(id),CRU=1e7;
const inr=S.inr,pct=(v,d=1)=>(v*100).toFixed(d)+'%';
const money=(v,d=2)=>{const s=v<0?'−':'';v=Math.abs(v);return s+(v>=1?'₹'+v.toFixed(d)+' Cr':'₹'+(v*100).toFixed(1)+' L');};
const lakh=v=>'₹'+(+v).toFixed(+v<10&&+v%1?1:0)+' L';
const r2=x=>Math.round(x*100)/100;
const COL={'Land & acquisition':'#14213D','Approvals & consultants':'#566077','Site development':'#A8803F','Contingency':'#C9A86A','Show villa':'#D9B77E','Marketing & brand':'#8FA77E','Admin & overheads':'#7FA6C4','Maintenance till handover':'#B9C7A9','Finance cost':'#C8795A','Dealer commission':'#9C4A35'};
const SHORT={'Land & acquisition':'Land','Approvals & consultants':'Approvals','Site development':'Develop.','Contingency':'Conting.','Show villa':'Villa','Marketing & brand':'Marketing','Admin & overheads':'Admin','Maintenance till handover':'Upkeep','Finance cost':'Finance','Dealer commission':'Comm.'};

/* ================= controls ================= */
const TABS={
 quick:{t:'Start here',d:'The six numbers that matter most',items:[
  {id:'qPrice',ref:['p250','p350','p500'],l:'Selling price',min:7000,max:14000,step:50,def:B.launch[250],get:()=>st.p250,set:v=>{st.p250=v;st.p350=v-250;st.p500=v-500;},f:v=>'₹'+inr(v)+' per sq yd',n:'Launch price for a 250 sq yd plot. 350 and 500 sq yd plots are ₹250 and ₹500 lower per sq yd.'},
  {id:'qStep',ref:['step'],l:'Price increase as plots sell',min:0,max:12,step:0.5,def:r2(B.step*100),get:()=>st.step,set:v=>st.step=v,f:v=>'+'+(+v).toFixed(1)+'% every 50 plots',n:'Early buyers get the lowest price; it goes up as the project fills.'},
  {id:'qPace',ref:['pace'],l:'How fast plots sell',min:0.6,max:2,step:0.1,def:1,get:()=>st.pace,set:v=>st.pace=v,f:v=>paceTxt(v),n:'Normal means about 6 to 7 plots a month after a strong launch.'},
  {id:'qDev',ref:['devMul'],l:'Construction cost',min:0.7,max:1.4,step:0.05,def:1,get:()=>st.devMul,set:v=>st.devMul=v,f:v=>Math.abs(v-1)<1e-9?'As estimated':(v>1?'+':'−')+Math.round(Math.abs(v-1)*100)+'%',n:'Roads, wall, drains, power, clubhouse and all other site work.'},
  {id:'qLaunch',ref:['launchMonth'],l:'Sales start',min:1,max:15,step:1,def:B.launchMonth,get:()=>st.launchMonth,set:v=>st.launchMonth=v,f:v=>S.monthFull(+v),n:'Plan pass is in its final stage. GujRERA registration must be in hand before the first booking.'},
  {id:'qTax',ref:['taxRate'],l:'Tax structure',min:0,max:40,step:0.01,def:r2(B.taxRate*100),get:()=>st.taxRate,set:v=>st.taxRate=v,f:v=>(+v).toFixed(2)+'%',choice:[['Firm / LLP',34.94],['Company',25.17]],noslider:1}]},
 land:{t:'Land',d:'Purchase rate, stamp duty and legal',items:[
  {id:'landRate',l:'Land purchase rate',min:3000,max:5500,step:50,def:B.landRate,f:v=>'₹'+inr(v)+' / sq yd',n:'On 1,02,417 sq yd. Already paid, but it sets the bar every plot has to clear.'},
  {id:'stampPct',l:'Stamp duty & registration',min:0,max:8,step:0.1,def:r2(B.stampPct*100),f:v=>(+v).toFixed(1)+'%',n:'4.9% stamp duty + 1% registration on the deed value.'},
  {id:'naCost',l:'NA, NOC, title & legal',min:0,max:100,step:1,def:r2(B.naCost*100),f:lakh,n:'Already done: put in the actual figure.'}]},
 sales:{t:'Prices & sales',d:'Prices, increases, speed and payments',items:[
  {id:'p250',l:'Launch price · 250 sq yd',min:7000,max:14000,step:50,def:B.launch[250],f:v=>'₹'+inr(v)+' / sq yd',n:'88 plots, the investor favourite.'},
  {id:'p350',l:'Launch price · 350 sq yd',min:7000,max:14000,step:50,def:B.launch[350],f:v=>'₹'+inr(v)+' / sq yd',n:'66 family plots.'},
  {id:'p500',l:'Launch price · 500 sq yd',min:7000,max:14000,step:50,def:B.launch[500],f:v=>'₹'+inr(v)+' / sq yd',n:'40 premium plots.'},
  {id:'step',l:'Price rise after each tranche',min:0,max:12,step:0.5,def:r2(B.step*100),f:v=>(+v).toFixed(1)+'%',n:'Early buyers get the best price; it rewards moving fast.'},
  {id:'tranche',l:'Tranche size',min:20,max:100,step:5,def:B.tranche,f:v=>v+' plots'},
  {id:'plcMul',l:'Preferential location charges',min:0,max:2,step:0.25,def:1,f:v=>+v===0?'Off':'×'+(+v).toFixed(2),n:'At ×1: corner +10%, garden or green-belt facing +5%.'},
  {id:'club',l:'Club membership per plot',min:0,max:3,step:0.25,def:r2(B.club*100),f:lakh},
  {id:'pace',l:'How fast plots sell',min:0.6,max:2,step:0.1,def:1,f:v=>paceTxt(v)},
  {id:'launchMonth',l:'Launch month',min:1,max:15,step:1,def:B.launchMonth,f:v=>S.monthFull(+v),n:'GujRERA registration must be in hand before the first booking.'},
  {id:'booking',l:'Booking amount',min:10,max:50,step:5,def:r2(B.booking*100),f:v=>v+'%'},
  {id:'registryLag',l:'Booking to registry',min:1,max:6,step:1,def:B.registryLag,f:v=>v+(+v===1?' month':' months')}]},
 dev:{t:'Construction',d:'All 16 work packages, PMC, contingency',items:[
  {id:'devMul',l:'Scale all development',min:0.7,max:1.4,step:0.05,def:1,f:v=>Math.round(v*100)+'%',n:'Quick way to test a cheaper or costlier contractor.'},
  {id:'pmc',l:'Project management (PMC)',min:0,max:6,step:0.5,def:r2(B.pmc*100),f:v=>(+v).toFixed(1)+'% of development'},
  {id:'contingency',l:'Contingency',min:0,max:15,step:0.5,def:r2(B.contingency*100),f:v=>(+v).toFixed(1)+'% of development'},
  {id:'escalation',l:'Cost escalation per year',min:0,max:12,step:0.5,def:r2(B.escalation*100),f:v=>(+v).toFixed(1)+'%'},
  {id:'villaCost',l:'Show villa build cost',min:40,max:160,step:5,def:r2(B.villa.cost*100),f:lakh},
  {id:'villaSale',l:'Show villa sale value',min:0,max:220,step:5,def:r2(B.villa.sale*100),f:lakh,n:'Sold with its plot once the last phase is selling.'},
  ...C.development.map((c,i)=>({id:'d'+i,l:c.k,min:0,max:Math.ceil(c.v*100*2.5),step:c.v<0.2?0.5:1,def:r2(c.v*100),f:lakh,line:1,h:i===0?'Work packages (₹ lakh, today’s rates)':''}))]},
 soft:{t:'Running costs',d:'Marketing, team, office and approvals',items:[
  {id:'marketingPct',l:'Marketing & brand',min:0.25,max:4,step:0.25,def:r2(B.marketingPct*100),f:v=>(+v).toFixed(2)+'% of sales',n:'Launch, digital leads, hoardings, site events.'},
  {id:'adminMonthly',l:'Team & salaries',min:1,max:10,step:0.5,def:r2(B.adminMonthly*100),f:v=>lakh(v)+' / month'},
  {id:'office',l:'Office, IT, CRM & legal retainers',min:0,max:80,step:5,def:r2(B.office*100),f:lakh},
  {id:'insurance',l:'Insurance',min:0,max:30,step:1,def:r2(B.insurance*100),f:lakh},
  {id:'maintenance',l:'Maintenance till handover',min:0,max:100,step:5,def:r2(B.maintenance*100),f:lakh},
  {id:'commission',l:'Dealer commission',min:0,max:5,step:0.25,def:0,f:v=>+v===0?'Off · direct sales':(+v).toFixed(2)+'% of sales',n:'Off in this plan. Use only to test a broker-led route.'},
  ...C.approvals.map((c,i)=>({id:'a'+i,l:c.k,min:0,max:Math.ceil(c.v*100*3),step:0.5,def:r2(c.v*100),f:lakh,line:1,h:i===0?'Approvals & consultants (₹ lakh)':''}))]},
 fin:{t:'Loan & tax',d:'Interest rate and tax structure',items:[
  {id:'interest',l:'Interest on working capital',min:6,max:18,step:0.5,def:r2(B.interest*100),f:v=>(+v).toFixed(1)+'%',n:'Only charged on the gap once the land equity is used.'},
  {id:'taxRate',l:'Income tax rate',min:0,max:40,step:0.01,def:r2(B.taxRate*100),f:v=>(+v).toFixed(2)+'%',noslider:1,choice:[['Firm / LLP',34.94],['Company 115BAA',25.17],['Before tax',0]],n:'GST is not charged on developed plots (CBIC circular 177/09/2022).'}]}
};
function paceTxt(v){v=+v;return Math.abs(v-1)<1e-9?'Normal':v>1?Math.round((v-1)*100)+'% slower':Math.round((1-v)/v*100)+'% faster';}
const ALL={};Object.entries(TABS).forEach(([t,g])=>g.items.forEach(it=>{it.tab=t;if(t!=='quick')ALL[it.id]=it;}));
const QI=Object.fromEntries(TABS.quick.items.map(it=>[it.id,it]));
const item=id=>QI[id]||ALL[id],val=it=>it.get?it.get():st[it.id];
const DEF=Object.fromEntries(Object.values(ALL).map(it=>[it.id,it.def]));
let st={...DEF},tab='quick';
const PRE={conservative:{p250:9300,p350:9050,p500:8850,pace:1.5,escalation:7,marketingPct:2.25},base:{},optimistic:{p250:10800,p350:10550,p500:10250,pace:0.8,step:7}};
function opts(v=st){return{landRate:+v.landRate,stampPct:v.stampPct/100,naCost:v.naCost/100,launch:{250:+v.p250,350:+v.p350,500:+v.p500},step:v.step/100,tranche:+v.tranche,plcMul:+v.plcMul,club:v.club/100,pace:+v.pace,launchMonth:+v.launchMonth,booking:v.booking/100,registryLag:+v.registryLag,
 devMul:+v.devMul,dev:C.development.map((_,i)=>v['d'+i]/100),pmc:v.pmc/100,contingency:v.contingency/100,escalation:v.escalation/100,villa:{cost:v.villaCost/100,sale:v.villaSale/100},
 marketingPct:v.marketingPct/100,adminMonthly:v.adminMonthly/100,office:v.office/100,insurance:v.insurance/100,maintenance:v.maintenance/100,commission:v.commission/100,appr:C.approvals.map((_,i)=>v['a'+i]/100),interest:v.interest/100,taxRate:v.taxRate/100};}
const chg=id=>{const it=item(id);return Math.abs(+val(it)-+it.def)>1e-9;};

function drawTabs(){if(!$('tabs'))return;
 $('tabs').innerHTML=Object.entries(TABS).map(([k,g],i)=>{const n=k==='quick'?0:g.items.filter(it=>chg(it.id)).length;return `<button data-t="${k}" class="${k===tab?'on':''}"><span class="mi">${i+1}</span><span class="mt"><b>${g.t}</b><small>${g.d}</small></span>${n?`<i class="mb">${n}</i>`:''}</button>`;}).join('');}
const pos=(it,v)=>((+v-it.min)/(it.max-it.min)*100).toFixed(1);
function drawCtls(){if(!$('ctls'))return;const g=TABS[tab],i=Object.keys(TABS).indexOf(tab);
 $('ctlhead').innerHTML=`<span class="mi big">${i+1}</span><div><h3>${g.t}</h3><p>${g.d}${tab==='quick'?'. Every other cost has its own section in the menu.':''}</p></div>`;
 $('ctls').innerHTML=g.items.map(it=>{const v=val(it);return `${it.h?`<div class="subh">${it.h}</div>`:''}<div class="ctl ${it.line?'line':''} ${chg(it.id)?'chg':''}" id="c_${it.id}">
  <div class="ct"><span class="cl">${it.l}</span><output class="cv">${it.f(v)}</output></div>${it.n?`<div class="cn">${it.n}</div>`:''}
  ${it.choice?`<div class="choice">${it.choice.map(([l,x])=>`<button data-ch="${it.id}" data-v="${x}" class="${+v===x?'on':''}">${l}</button>`).join('')}</div>`:''}
  ${it.noslider?'':`<input type="range" data-id="${it.id}" min="${it.min}" max="${it.max}" step="${it.step}" value="${v}" style="--p:${pos(it,v)}%"><div class="mm"><span>${it.f(it.min)}</span><span>${it.f(it.max)}</span></div>`}
  <div class="cfoot"><span class="imp" id="i_${it.id}"></span><button class="rs" data-rs="${it.id}">↺ Back to plan · ${it.f(it.def)}</button></div></div>`;}).join('');updImpacts();}
const setv=(id,v)=>{const it=item(id);it.set?it.set(v):st[id]=v;};
const refs=it=>it.ref||[it.id];
function impact(ids){const s={...DEF};ids.forEach(k=>s[k]=st[k]);const r=S.run(opts(s));return {pbt:r.pbt-RB.pbt,pat:r.pat-RB.pat};}
const impTxt=(it,d)=>{const tax=refs(it).includes('taxRate'),v=tax?d.pat:d.pbt;return Math.abs(v)<0.005?'<span class="flat">No effect on profit</span>':`<span class="${v>0?'up':'dn'}">${v>0?'▲':'▼'} ${tax?'Profit after tax':'Profit'} ${v>0?'+':''}${money(v)}</span> <span class="flat">from this change alone</span>`;};
function updImpacts(){if(!$('ctls'))return;TABS[tab].items.forEach(it=>{const el=$('i_'+it.id);if(el)el.innerHTML=chg(it.id)?impTxt(it,impact(refs(it))):'';});
 const ch=Object.values(ALL).filter(it=>chg(it.id));const box=$('changes');if(!box)return;
 if(!ch.length){box.innerHTML=`<div class="chempty"><b>Nothing changed yet</b><span>You are looking at our plan. Move any slider and it will be listed here with its effect on profit.</span></div>`;return;}
 const tot=R.pbt-RB.pbt;
 box.innerHTML=`<div class="chtot"><span>All changes together</span><b class="${tot>=0?'up':'dn'}">${tot>=0?'+':''}${money(tot)}</b><small>profit before tax: ${money(RB.pbt)} in plan → ${money(R.pbt)} now</small></div>`+ch.map(it=>{const d=impact([it.id]),v=it.id==='taxRate'?d.pat:d.pbt;return `<button class="chrow" data-focus="${it.id}"><span class="chl">${it.l}<small>${it.f(it.def)} → <b>${it.f(st[it.id])}</b></small></span><span class="${Math.abs(v)<0.005?'flat':v>0?'up':'dn'}">${Math.abs(v)<0.005?'—':(v>0?'+':'')+money(v)}</span></button>`;}).join('')+`<button class="btn ghost sm" id="reset2" style="margin-top:12px;width:100%;justify-content:center">↺ Undo all changes</button>`;}
function setScen(k){document.querySelectorAll('#scen [data-s]').forEach(x=>x.classList.toggle('on',x.dataset.s===k));}
function clearScen(){setScen('');drawTabs();}
function resetAll(){st={...DEF};drawCtls();drawTabs();setScen('base');schedule();}
if($('ctls')){
 $('tabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;tab=b.dataset.t;drawTabs();drawCtls();const t=$('ctlpanel');if(t.getBoundingClientRect().top<0)t.scrollIntoView({behavior:'smooth'});};
 $('ctls').addEventListener('input',e=>{const id=e.target.dataset.id;if(!id)return;setv(id,+e.target.value);const it=item(id),c=$('c_'+id);e.target.style.setProperty('--p',pos(it,val(it))+'%');c.querySelector('output').textContent=it.f(val(it));c.classList.toggle('chg',chg(id));c.querySelectorAll('[data-ch]').forEach(b=>b.classList.toggle('on',+b.dataset.v===+val(it)));clearScen();schedule();});
 $('ctls').addEventListener('click',e=>{const rs=e.target.closest('[data-rs]'),ch=e.target.closest('[data-ch]');
  if(rs){const it=item(rs.dataset.rs);refs(it).forEach(k=>st[k]=DEF[k]);drawCtls();clearScen();schedule();}
  if(ch){setv(ch.dataset.ch,+ch.dataset.v);drawCtls();clearScen();schedule();}});
 document.querySelectorAll('#scen [data-s]').forEach(b=>b.onclick=()=>{st={...DEF,...PRE[b.dataset.s]};drawCtls();drawTabs();setScen(b.dataset.s);schedule();});
 $('reset').onclick=resetAll;document.addEventListener('click',e=>{if(e.target.closest('#reset2'))resetAll();});
}
function focusCtl(id){closeD();const it=ALL[id];if(!it)return;if(!$('ctls')){location.href='calculator.html#'+id;return;}tab=it.tab;drawTabs();drawCtls();setTimeout(()=>{const c=$('c_'+id);if(!c)return;c.scrollIntoView({block:'center',behavior:'smooth'});c.classList.add('flash');},80);}
let raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;update();});}

/* ================= charts ================= */
function bars(d,o={}){const W=o.W||540,H=o.H||190,mx=Math.max(...d.map(x=>Math.abs(x.v)),1e-9),bw=W/d.length,ev=o.every||1;let g='';
 d.forEach((x,i)=>{const h=Math.abs(x.v)/mx*(H-22);g+=`<rect x="${(i*bw+bw*.16).toFixed(1)}" y="${(H-h).toFixed(1)}" width="${(bw*.68).toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${x.c||'#C9A86A'}"><title>${x.t||x.l}: ${(o.fmt||(v=>v))(x.v)}</title></rect>`;
  if(o.vals&&x.v)g+=`<text x="${i*bw+bw/2}" y="${H-h-5}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#14213D">${(o.vf||(v=>v))(x.v)}</text>`;
  if(x.l&&i%ev===0)g+=`<text x="${i*bw+bw/2}" y="${H+15}" text-anchor="middle" font-size="10" fill="#6B7385">${x.l}</text>`;});
 return `<svg viewBox="0 -8 ${W} ${H+26}" font-family="Manrope">${g}</svg>`;}
function lines(series,o={}){const W=o.W||540,H=o.H||200,P=44;let xs=[],ys=[];series.forEach(s=>s.pts.forEach(p=>{xs.push(p.x);ys.push(p.y);}));if(o.zero!==false)ys.push(0);
 const x0=Math.min(...xs),x1=Math.max(...xs);let y0=Math.min(...ys),y1=Math.max(...ys);if(y1-y0<1e-9)y1=y0+1;const pd=(y1-y0)*.1;y0-=pd;y1+=pd;
 const sx=x=>P+(x-x0)/((x1-x0)||1)*(W-P-8),sy=y=>(y1-y)/(y1-y0)*H;let g='';
 const rs=(y1-y0)/4,mg=Math.pow(10,Math.floor(Math.log10(rs))),stp=[1,2,2.5,5,10].map(x=>x*mg).find(x=>x>=rs)||10*mg;for(let v=Math.ceil(y0/stp)*stp;v<=y1+1e-9;v+=stp){g+=`<line x1="${P}" x2="${W}" y1="${sy(v)}" y2="${sy(v)}" stroke="#EEE6D6"/><text x="${P-6}" y="${sy(v)+3}" text-anchor="end" font-size="10" fill="#9A9FAB">${(o.yf||(v=>v.toFixed(0)))(v)}</text>`;}
 if(o.zero!==false&&y0<0&&y1>0)g+=`<line x1="${P}" x2="${W}" y1="${sy(0)}" y2="${sy(0)}" stroke="#14213D" stroke-width="1.2"/>`;
 series.forEach(s=>{const d=s.pts.map((p,i)=>(i?'L':'M')+sx(p.x).toFixed(1)+' '+sy(p.y).toFixed(1)).join('');
  if(s.fill)g+=`<path d="${d}L${sx(s.pts[s.pts.length-1].x)} ${sy(Math.max(y0,0))}L${sx(s.pts[0].x)} ${sy(Math.max(y0,0))}Z" fill="${s.c}" opacity=".16"/>`;
  g+=`<path d="${d}" fill="none" stroke="${s.c}" stroke-width="${s.w||2.5}" ${s.dash?'stroke-dasharray="5 4"':''}/>`;});
 (o.xt||[]).forEach(t=>g+=`<text x="${sx(t.x)}" y="${H+16}" text-anchor="middle" font-size="10" fill="#6B7385">${t.l}</text>`);
 (o.marks||[]).forEach(m=>g+=`<circle cx="${sx(m.x)}" cy="${sy(m.y)}" r="5.5" fill="#fff" stroke="${m.c||'#A8803F'}" stroke-width="2.5"/><text x="${sx(m.x)+(m.dx||8)}" y="${sy(m.y)+(m.dy||-10)}" font-size="11.5" font-weight="700" fill="#14213D" text-anchor="${m.a||'start'}">${m.l}</text>`);
 return `<svg viewBox="0 -8 ${W} ${H+28}" font-family="Manrope">${g}</svg>`;}
function hbars(rows,o={}){const W=o.W||540,rh=30,LW=o.lw||200,mx=Math.max(...rows.map(r=>Math.max(Math.abs(r.lo||0),Math.abs(r.hi||0),Math.abs(r.v||0))),1e-9);let g='';
 if(o.tornado){const cx=LW+(W-LW)/2,half=(W-LW)/2-38;g+=`<line x1="${cx}" x2="${cx}" y1="0" y2="${rows.length*rh}" stroke="#14213D"/>`;
  rows.forEach((r,i)=>{const y=i*rh+6;[[r.lo,'#C8795A'],[r.hi,'#8FA77E']].forEach(([v,c])=>{const w=Math.abs(v)/mx*half,x=v<0?cx-w:cx;g+=`<rect x="${x}" y="${y}" width="${w}" height="${rh-12}" rx="3" fill="${c}"/><text x="${v<0?x-5:x+w+5}" y="${y+12}" font-size="10.5" font-weight="700" fill="#14213D" text-anchor="${v<0?'end':'start'}">${v>0?'+':''}${v.toFixed(2)}</text>`;});
   g+=`<text x="0" y="${y+12}" font-size="12" fill="#1E2A44">${r.l}</text>`;});}
 else rows.forEach((r,i)=>{const y=i*rh+6,w=Math.abs(r.v)/mx*(W-LW-80);g+=`<text x="0" y="${y+12}" font-size="12" fill="#1E2A44">${r.l}</text><rect x="${LW}" y="${y}" width="${w}" height="${rh-12}" rx="3" fill="${r.c||'#C9A86A'}"/><text x="${LW+w+6}" y="${y+12}" font-size="11" font-weight="700" fill="#14213D">${(o.fmt||(v=>v))(r.v)}</text>`;});
 return `<svg viewBox="0 0 ${W} ${rows.length*rh+6}" font-family="Manrope">${g}</svg>`;}
function quarters(R,fn){const out=[];R.months.forEach(m=>{const q=Math.floor(m.i/3);out[q]=out[q]||{v:0,l:S.monthLabel(q*3)};out[q].v+=fn(m);});return out;}

/* ================= 3D ================= */
let R=S.run(opts()),RB=S.run(opts(DEF)),BE=S.breakEven(opts()),BEB=BE,scene3=null;
(function(){if(!$('stage'))return;try{
  const stage=$('stage');let s;
  try{ s=SKD3D.create(stage,{view:'cover',shadowSize:2048}); }catch(e){ stage.insertAdjacentHTML('afterbegin','<img src="assets/img/cover.png" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0">'); return; }
  scene3=s;stage.insertBefore(s.renderer.domElement,stage.firstChild);
  const c=new THREE.OrbitControls(s.camera,s.renderer.domElement);
  c.enableDamping=true;c.maxPolarAngle=Math.PI/2.15;c.minDistance=15;c.maxDistance=900;s.controls=c;
  s.setView('cover');
  let tw=null,tour=null;
  function go(v,speed=0.022){const p0=s.camera.position.clone(),t0=c.target.clone(),p1=new THREE.Vector3(...v.p),t1=new THREE.Vector3(...v.t),f0=s.camera.fov,f1=v.fov||f0;let k=0;
    return new Promise(res=>{tw=()=>{k=Math.min(1,k+speed);const e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;s.camera.position.lerpVectors(p0,p1,e);c.target.lerpVectors(t0,t1,e);s.camera.fov=f0+(f1-f0)*e;s.camera.updateProjectionMatrix();if(k>=1){tw=null;res();}};});}
  const vb=document.querySelectorAll('.views button');
  async function runTour(){const seq=['aerial','entrance','club','villa','cover'];tour=true;for(const n of seq){if(!tour)return;vb.forEach(x=>x.classList.toggle('on',x.dataset.v===n||x.dataset.v==='tour'));await go(s.VIEWS[n],0.008);await new Promise(r=>setTimeout(r,1400));}tour=false;vb.forEach(x=>x.classList.toggle('on',x.dataset.v==='cover'));}
  vb.forEach(b=>b.onclick=()=>{tour=false;vb.forEach(x=>x.classList.remove('on'));b.classList.add('on');if(b.dataset.v==='tour')runTour();else go(s.VIEWS[b.dataset.v]);});
  s.renderer.domElement.addEventListener('pointerdown',()=>{tour=false;});
  const orig=new Map();s.plotMeshes.forEach(m=>orig.set(m,m.material));
  const dim=new THREE.MeshStandardMaterial({color:new THREE.Color('#E9E4D8').convertSRGBToLinear(),roughness:1});
  let filt='all';
  document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('on'));b.classList.add('on');filt=b.dataset.f;
    s.plotMeshes.forEach(m=>{const on=filt==='all'||String(m.userData.plot.type)===filt;m.material=on?orig.get(m):dim;m.userData.ty=on&&filt!=='all'?3:1;});});
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),tip=$('tip');let hov=null,pinned=null;
  const hl=new THREE.MeshStandardMaterial({color:new THREE.Color('#14213D').convertSRGBToLinear(),roughness:.6});
  const pinM=new THREE.MeshStandardMaterial({color:new THREE.Color('#A8803F').convertSRGBToLinear(),roughness:.5,emissive:new THREE.Color('#5a3d10'),emissiveIntensity:.25});
  const baseMat=m=>m===pinned?pinM:(filt==='all'||String(m.userData.plot.type)===filt?orig.get(m):dim);
  function pick(e){const r=s.renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,s.camera);return [ray.intersectObjects(s.plotMeshes)[0],r];}
  s.renderer.domElement.addEventListener('pointermove',e=>{const [hit,r]=pick(e);
    if(hov&&(!hit||hit.object!==hov)){hov.material=baseMat(hov);hov=null;}
    if(hit){const m=hit.object,p=m.userData.plot;if(hov!==m&&m!==pinned){m.material=hl;hov=m;}
      const rate=plotRate(p);s.renderer.domElement.style.cursor='pointer';
      tip.innerHTML=`<b>Plot ${p.id}</b> · ${p.type} sq yd<div style="font-family:Fraunces,serif;font-size:20px;color:var(--gold)">${money(p.type*rate/CRU)}</div><div style="color:var(--muted);font-size:12px">click for details</div>`;
      tip.style.display='block';const x=e.clientX-r.left+18,y=e.clientY-r.top+18;tip.style.left=Math.min(x,r.width-220)+'px';tip.style.top=Math.min(y,r.height-110)+'px';
    } else {tip.style.display='none';s.renderer.domElement.style.cursor='grab';}});
  s.renderer.domElement.addEventListener('pointerleave',()=>tip.style.display='none');
  let down=null;s.renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
  s.renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const [hit]=pick(e);if(!hit)return;
    const m=hit.object;if(pinned&&pinned!==m){const o=pinned;pinned=null;o.material=baseMat(o);}pinned=m;hov=null;m.material=pinM;tip.style.display='none';
    showPin(m.userData.plot);const P=m.position;go({p:[P.x+38,52,P.z+58],t:[P.x,0,P.z],fov:34});});
  $('pin').querySelector('.x').onclick=()=>{$('pin').classList.remove('on');if(pinned){const o=pinned;pinned=null;o.material=baseMat(o);}go(s.VIEWS.cover);vb.forEach(x=>x.classList.toggle('on',x.dataset.v==='cover'));};
  new ResizeObserver(()=>s.resize(stage.clientWidth,stage.clientHeight)).observe(stage);
  let t=0;(function loop(){requestAnimationFrame(loop);t+=0.016;if(tw)tw();
    s.plotMeshes.forEach(m=>{const ty=m.userData.ty||1;m.scale.y+=(ty-m.scale.y)*.12;});
    if(pinned)pinned.position.y=pinned.userData.y0+Math.sin(t*3)*.25;c.update();s.render();})();
  s.plotMeshes.forEach(m=>m.userData.y0=m.position.y);
}catch(err){console.warn('3D view unavailable',err);if(!$('stage').querySelector('img'))$('stage').insertAdjacentHTML('afterbegin','<img src="assets/img/cover.png" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0">');}})();
function plotRate(p){const o=opts();return o.launch[p.type]*(1+p.plc*o.plcMul);}
let pinPlot=null;
function showPin(p){pinPlot=p;const rate=plotRate(p),t=S.TYPES[p.type],v=p.type*rate,o=opts(),tot=v+o.club*CRU;
  $('pinb').innerHTML=`<div class="kicker" style="font-size:13px">Row ${p.row} · ${p.side==='L'?'west':'east'} of the boulevard</div><div class="serif" style="font-size:28px;color:var(--navy);line-height:1.1;margin-top:2px">Plot ${p.id}</div><div style="color:var(--muted);font-size:13.5px">${p.type} sq yd · ${t.ft} · ${t.sqm} m²</div>
  <div class="p">${money(v/CRU)}</div><div style="font-size:12.5px;color:var(--muted)">at launch, ₹${inr(rate)} / sq yd${p.plc?` incl. ${p.tag.toLowerCase()} +${Math.round(p.plc*o.plcMul*100)}%`:''}</div>
  <table style="margin-top:10px"><tr><td>Club membership</td><td class="r num">${money(o.club)}</td></tr><tr><td>Booking (${Math.round(o.booking*100)}%)</td><td class="r num">${money(tot*o.booking/CRU)}</td></tr><tr><td>At registry</td><td class="r num">${money(tot*(1-o.booking)/CRU)}</td></tr><tr><td>After first ${o.tranche} plots</td><td class="r num">${money(v*(1+o.step)/CRU)}</td></tr></table>`;
  $('pin').classList.add('on');}

/* ================= static sections ================= */
if($('glance')){
const G=[['Total land','21.161 acres','85,633 m² · 1,02,417 sq yd',1],['Saleable','194 plots',`${inr(L.saleSqyd)} sq yd · ${L.landUse[0].pct.toFixed(1)}%`],['Plot sizes','250 · 350 · 500',`${L.byType[250].count} · ${L.byType[350].count} · ${L.byType[500].count} plots`],['Sales start',S.monthFull(B.launchMonth),'plan pass in final stage'],['Sell-out',S.monthFull(RB.sellout),`${RB.sellout-B.launchMonth+1} months of sales`],['Launch price','₹9,500–10,000','per sq yd, +6% every 50 plots'],['Show villa','500 sq yd','ready by mid-2027'],['Approvals','NA ✓ NOC ✓','plan pass nearly done, then GujRERA']];
$('glance').innerHTML=G.map(([a,b,c,d])=>`<div class="card stat ${d?'dark':''}"><div class="l">${a}</div><div class="v" data-count="${b}">${b}</div><div style="font-size:14px;color:${d?'#C9D1E3':'var(--muted)'}">${c}</div></div>`).join('');
const LOC=[['Ahmedabad–Dholera Expressway',0.933,'Nearest interchange access'],['Kamiyala Dham',2.5,'Local landmark and temple'],['Lothal SIR boundary',2.93,'Next growth node'],['Pipli Diamond Circle',3.42,'Highway junction'],['Dholera SIR boundary',7.0,'India’s first greenfield smart city'],['NHMC / Lothal',7.31,'National Maritime Heritage Complex'],['Dholera International Airport',8.0,'Under development'],['ABCD Building',18.0,'Dholera SIR administrative HQ']];
$('loclist').innerHTML=LOC.map(([k,d,n])=>`<div class="lrow"><b>${k}</b><span class="km num">${d<1?Math.round(d*1000)+' m':d.toFixed(d%1?2:0).replace(/0$/,'')+' km'}</span><div class="bar"><i data-w="${Math.max(4,Math.sqrt(d/18)*100)}"></i></div><small>${n} · about ${Math.max(2,Math.round(d/45*60+2))} min drive</small></div>`).join('');
$('landuse').innerHTML=L.landUse.map(u=>`<tr><td><i style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${u.color};margin-right:8px"></i>${u.k}</td><td class="r num">${inr(u.sqm)} m²</td><td class="r num"><b>${u.pct.toFixed(1)}%</b></td></tr>`).join('');

}
/* ================= live sections ================= */
function invTable(){const o=opts();$('inventory').innerHTML=`<tr><th>Size</th><th>Dimensions</th><th class="r">Plots</th><th class="r">sq yd</th><th class="r">Launch ticket</th></tr>`+[250,350,500].map(k=>`<tr class="go" data-open="kpi:avgRate"><td>${k} sq yd</td><td>${S.TYPES[k].ft}</td><td class="r">${L.byType[k].count}</td><td class="r num">${inr(L.byType[k].sqyd)}</td><td class="r num">₹${(k*o.launch[k]/1e5).toFixed(1)} L</td></tr>`).join('')+`<tr class="sub"><td colspan="2">Total</td><td class="r">194</td><td class="r num">${inr(L.saleSqyd)}</td><td></td></tr>`;}
function journey(R){const A=R.A,ms=[[0,'Today','NA, NOC & plan pass','Plan pass in its final stage',1],[A.launchMonth,'','GujRERA','Registered before the first booking'],[A.launchMonth,'','Sales start','First tranche opens',2],[1,'','Ground-breaking','Levelling, wall, gate and show villa'],[8,'','Show villa ready','Furnished, for site visits'],[16,'','Roads & services','Roads, drains, power complete'],[20,'','Clubhouse opens','Pool, gym and gardens'],[R.sellout,'','Last plot sold',`${R.sellout-A.launchMonth+1} months of selling`,2],[R.end,'','Handover','Final registries, RWA takes over']].sort((a,b)=>a[0]-b[0]);
 $('tl').innerHTML=ms.map(([m,d,t,p,k])=>`<div class="ms ${k===1?'done':k===2?'key':''}"><div class="d">${d||S.monthFull(m)}</div><b>${t}</b><p>${p}</p></div>`).join('');}
function costs(R){const cb=Object.entries(R.costBy).sort((a,b)=>b[1]-a[1]);$('ctot').textContent=money(R.totalCost);
 $('stack').innerHTML=cb.map(([k,v])=>`<div data-open="cat:${k}" title="${k}: ${money(v)}" style="flex-grow:${v};background:${COL[k]}">${v/R.totalCost>.07?SHORT[k]+' '+Math.round(v/R.totalCost*100)+'%':''}</div>`).join('');
 $('ccards').innerHTML=cb.map(([k,v])=>`<div class="card ccard click" data-open="cat:${k}"><div class="top"><b style="color:var(--navy);font-size:14.5px"><span class="dot" style="background:${COL[k]}"></span>${k}</b><span class="s num">${pct(v/R.totalCost)}</span></div><div class="v num">${money(v)}</div><div class="s">${CAT[k].d}</div><div class="s num">₹${inr(v*CRU/L.saleSqyd)} per sold sq yd</div></div>`).join('');
 const o=R.A;$('devtable').innerHTML=`<tr><th>Work package</th><th class="r">Today</th><th class="r">When spent*</th><th class="r">Months</th></tr>`+C.development.map((c,i)=>{const ln=R.lines.find(x=>x.k===c.k);return `<tr class="go" data-open="ctl:d${i}"><td>${c.k}</td><td class="r num">${lakh(r2(o.dev[i]*o.devMul*100))}</td><td class="r num">${lakh(r2(ln.v*100))}</td><td class="r num" style="color:var(--muted)">${S.monthLabel(c.m[0])} – ${S.monthLabel(c.m[1])}</td></tr>`;}).join('')+`<tr class="sub"><td>Total work packages</td><td class="r num">${money(R.devBase)}</td><td class="r num">${money(R.lines.filter(x=>C.development.some(c=>c.k===x.k)).reduce((a,x)=>a+x.v,0))}</td><td class="r" style="color:var(--muted);font-weight:500;font-size:12px">*with ${pct(o.escalation)} a year escalation</td></tr>`;
 $('vcost').textContent=money(R.costBy['Show villa']);$('vsale').textContent=money(R.villaRev);}
function charts(R){
 const Q=quarters(R,m=>m.sold).filter((q,i)=>i>=Math.floor(R.A.launchMonth/3));
 $('salesChart').innerHTML=bars(Q.map(q=>({v:q.v,l:q.l,t:'Quarter from '+q.l})),{W:560,H:240,vals:1,every:2,fmt:v=>v+' plots'});
 const ms=R.months;$('cashChart').innerHTML=lines([{pts:ms.map(m=>({x:m.i,y:m.cumNet})),c:'#A8803F',fill:1}],{W:560,H:240,yf:v=>v.toFixed(0),xt:ms.filter(m=>m.i%6===0).map(m=>({x:m.i,l:m.label})),marks:[{x:R.troughMonth,y:R.trough,l:'Deepest '+money(R.trough,1),dy:18},{x:ms[ms.length-1].i,y:ms[ms.length-1].cumNet,l:money(ms[ms.length-1].cumNet,1),a:'end',dx:-8}]});}
function waterfall(R){const W=700,H=220;const st=[{l:'Money in',a:0,b:R.revenue,c:'#8FA77E',k:'kpi:revenue'}];let lv=R.revenue;
 Object.entries(R.costBy).forEach(([k,v])=>{st.push({l:SHORT[k],a:lv-v,b:lv,c:COL[k],k:'cat:'+k,v});lv-=v;});
 st.push({l:'Profit',a:Math.min(0,R.pbt),b:Math.max(0,R.pbt),c:R.pbt>=0?'#14213D':'#B5503C',k:'kpi:pbt'});
 if(R.tax>0){st.push({l:'Tax',a:R.pat,b:R.pbt,c:'#9AA3B5',k:'kpi:pat'});st.push({l:'After tax',a:Math.min(0,R.pat),b:Math.max(0,R.pat),c:'#4E6B3E',k:'kpi:pat'});}
 const y1=R.revenue*1.08,y0=Math.min(0,R.pbt)*1.2,sy=v=>(y1-v)/(y1-y0)*H,bw=W/st.length;let g=`<line x1="0" x2="${W}" y1="${sy(0)}" y2="${sy(0)}" stroke="#D8CDB6"/>`;
 st.forEach((x,i)=>{const h=Math.max(1.5,sy(x.a)-sy(x.b)),val=x.b-x.a;g+=`<g data-open="${x.k}" style="cursor:pointer"><rect x="${i*bw+bw*.14}" y="${sy(x.b)}" width="${bw*.72}" height="${h}" rx="3" fill="${x.c}"><title>${x.l}: ${money(val)}</title></rect><text x="${i*bw+bw/2}" y="${sy(x.b)-5}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#14213D">${val.toFixed(1)}</text><text x="${i*bw+bw/2}" y="${H+15}" text-anchor="middle" font-size="10" fill="#6B7385">${x.l}</text></g>`;
  if(i<st.length-1&&i>0)g+=`<line x1="${i*bw+bw*.86}" x2="${(i+1)*bw+bw*.14}" y1="${sy(x.a)}" y2="${sy(x.a)}" stroke="#C9BFA8" stroke-dasharray="3 3"/>`;});
 $('wf').innerHTML=`<svg viewBox="0 -14 ${W} ${H+32}" font-family="Manrope" style="width:100%;height:auto">${g}</svg>`;}

const KPI=[['revenue','Money coming in',R=>R.revenue,'cr',1,'Selling all 194 plots, club fees and the show villa'],
 ['cost','Money going out',R=>R.totalCost,'cr',-1,'Land, construction and every other expense'],
 ['pat','Profit we keep after tax',R=>R.pat,'cr',1,'What reaches the partners'],
 ['be','Lowest safe price',(R,b)=>b.avgRate,'rate',-1,'Average price per sq yd below which we make a loss'],
 ['costSqyd','Our cost per sq yd sold',R=>R.costPerSqyd,'rate',-1,'Every rupee spent, spread over the plots we sell'],
 ['sellout','All plots sold by',R=>R.sellout,'mo',-1,'Date of the last booking'],
 ['avgRate','Average selling price',R=>R.avgRate,'rate',1,'Per sq yd, after price increases and corner premiums'],
 ['margin','Profit as % of sales',R=>R.margin,'pct',1,'Out of every ₹100 a buyer pays, what we keep before tax'],
 ['equity','Partners’ own money',R=>R.equity,'cr',-1,'Already put into the land'],
 ['peak','Extra loan needed',R=>R.peakDebt,'cr',-1,'Highest short-term borrowing before collections catch up'],
 ['eqBack','Partners’ money back by',R=>R.eqBack,'mo',-1,'When the land money is fully recovered'],
 ['roi','Return on money invested',R=>R.roi,'pct',1,'Profit after tax ÷ partners’ money + loan']];
const FMT={cr:v=>money(v),pct:v=>pct(v),rate:v=>'₹'+inr(v),mo:v=>v==null?'Not in plan':S.monthFull(v)};
const DFMT={cr:d=>(d>0?'+':'')+money(d),pct:d=>(d>0?'+':'')+(d*100).toFixed(1)+' pts',rate:d=>(d>0?'+₹':'−₹')+inr(Math.abs(d)),mo:d=>(d>0?'+':'')+d+(Math.abs(d)===1?' month':' months')};
const KGROUPS=[['Money',['revenue','cost','pat','margin']],['Price per sq yd',['avgRate','costSqyd','be']],['Time & funding',['sellout','eqBack','equity','peak','roi']]];
function kcard(k,R){const [,l,f,t,dir,ex]=KPI.find(x=>x[0]===k);const v=f(R,BE),b=f(RB,BEB);let d=(v==null||b==null)?0:v-b;const z=Math.abs(d)<(t==='cr'?0.005:t==='pct'?0.0005:t==='rate'?1:0.5);const cls=z?'flat':(d*dir>0?'up':'dn');
 return {k,l,v:FMT[t](v),d:z?'as per plan':DFMT[t](d)+' vs plan',cls,ex};}
function kpis(R){const g=R.pbt>=0;
 if($('story'))$('story').innerHTML=`Selling at <b>₹${inr(R.A.launch[250])}</b> per sq yd, with all plots sold by <b>${S.monthFull(R.sellout)}</b>, we spend <b>${money(R.totalCost,1)}</b> and receive <b>${money(R.revenue,1)}</b>. That leaves <b style="color:${g?'var(--green)':'var(--red)'}">${g?'a profit':'a loss'} of ${money(Math.abs(R.pbt))}</b> before tax and <b>${money(R.pat)}</b> after tax.`;
 if($('kgrid'))$('kgrid').innerHTML=KGROUPS.map(([h,ks])=>`<div class="kgroup"><h4>${h}</h4><div class="kgrid">${ks.map(k=>{const c=kcard(k,R);return `<div class="card kpi click" data-open="kpi:${k}"><div class="l">${c.l}</div><div class="v num">${c.v}</div><div class="d ${c.cls}">${c.d}</div><div class="e">${c.ex}</div></div>`;}).join('')}</div></div>`).join('');}
let shown={};
function tween(el,key,to,fmt){const from=shown[key]??to;shown[key]=to;const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/600),e=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*e);if(k<1)requestAnimationFrame(f);})(t0);}
function pl(R){const cb=R.costBy;const rows=[['Revenue'],[`Plot sales (${inr(L.saleSqyd)} sq yd @ ₹${inr(R.avgRate)})`,R.plotRev,0,'kpi:revenue'],['Club membership',R.clubRev,0,'kpi:revenue'],['Show villa sale',R.villaRev,0,'cat:Show villa'],['Total revenue',R.revenue,1,'kpi:revenue'],['Costs'],
  ...Object.keys(cb).map(k=>[k==='Land & acquisition'?'Land, stamp duty, NA & legal':k,cb[k],0,'cat:'+k]),['Total project cost',R.totalCost,1,'kpi:cost'],['Result'],['Profit before tax',R.pbt,1,'kpi:pbt'],[`Income tax @ ${(R.A.taxRate*100).toFixed(2)}%`,-R.tax,0,'kpi:pat'],['Profit after tax',R.pat,1,'kpi:pat']];
 $('pltable').innerHTML=`<tr><th>₹ crore</th><th class="r">Amount</th><th class="r">% of revenue</th></tr>`+rows.map(([k,v,t,o])=>v===undefined?`<tr><td colspan="3" style="color:#A8803F;font-weight:700;font-size:12.5px;padding-top:14px">${k}</td></tr>`:`<tr class="${t?'sub':''} go" data-open="${o}"><td>${k}</td><td class="r num">${v.toFixed(2)}</td><td class="r num" style="color:var(--muted);width:110px">${(v/R.revenue*100).toFixed(1)}%</td></tr>`).join('');
 tween($('pbtBig'),'pl',R.pbt,v=>money(v));$('pbtSub').textContent=`${pct(R.margin)} of revenue · ${pct(R.pbt/R.totalCost)} on cost`;$('plbig').classList.toggle('neg',R.pbt<0);
 $('plTiles').innerHTML=[['Income tax',money(R.tax),'kpi:pat'],['Profit after tax',money(R.pat),'kpi:pat'],['Return on capital',pct(R.roi),'kpi:roi'],['Duration',(R.end/12).toFixed(1)+' years','kpi:sellout'],['All-in cost / sold sq yd','₹'+inr(R.costPerSqyd),'kpi:costSqyd'],['Break-even average rate','₹'+inr(BE.avgRate),'kpi:be']].map(([a,b,o])=>`<div class="tile" data-open="${o}"><div class="l">${a}</div><div class="v num">${b}</div></div>`).join('');}
function hero(R){const el=$('rbar');if(!el)return;const d=(v,b)=>{const x=v-b;return Math.abs(x)<0.005?'<span class="flat">as per plan</span>':`<span class="${x>0?'up':'dn'}">${x>0?'+':''}${money(x)} vs plan</span>`;};
 if(!el.dataset.init){el.dataset.init=1;el.innerHTML=`<div class="rb main" data-open="kpi:pbt"><span>Profit before tax</span><b class="num" id="hbig"></b><small id="hd"></small></div>`+['pat','rev','cost','margin','sold'].map(k=>`<div class="rb" id="rb_${k}"></div>`).join('');}
 tween($('hbig'),'h',R.pbt,v=>money(v));$('hd').innerHTML=d(R.pbt,RB.pbt);el.classList.toggle('neg',R.pbt<0);
 const set=(k,o,l,v,dd)=>{const x=$('rb_'+k);x.dataset.open=o;x.innerHTML=`<span>${l}</span><b class="num">${v}</b><small>${dd}</small>`;};
 set('pat','kpi:pat','After tax',money(R.pat),d(R.pat,RB.pat));set('rev','kpi:revenue','Money in',money(R.revenue,1),d(R.revenue,RB.revenue));
 const xc=R.totalCost-RB.totalCost;set('cost','kpi:cost','Money out',money(R.totalCost,1),Math.abs(xc)<0.005?'<span class="flat">as per plan</span>':`<span class="${xc<0?'up':'dn'}">${xc>0?'+':''}${money(xc)} vs plan</span>`);
 set('margin','kpi:margin','We keep',`₹${(R.margin*100).toFixed(1)} <em>per ₹100</em>`,`<span class="flat">plan: ₹${(RB.margin*100).toFixed(1)}</span>`);
 set('sold','kpi:sellout','All plots sold',S.monthFull(R.sellout),R.sellout===RB.sellout?'<span class="flat">as per plan</span>':`<span class="${R.sellout<RB.sellout?'up':'dn'}">${R.sellout-RB.sellout>0?'+':''}${R.sellout-RB.sellout} months</span>`);}
function teaser(R){const el=$('teaser');if(!el)return;el.innerHTML=[['Profit before tax',money(R.pbt)],['After tax',money(R.pat)],['Lowest safe price','₹'+inr(BE.avgRate)],['All plots sold',S.monthFull(R.sellout)]].map(([a,b])=>`<div><span>${a}</span><b class="num">${b}</b></div>`).join('');}
function update(){const o=opts();R=S.run(o);BE=S.breakEven(o);const on=id=>!!$(id);hero(R);kpis(R);teaser(R);if(on('wf'))waterfall(R);if(on('stack'))costs(R);if(on('salesChart'))charts(R);if(on('pltable'))pl(R);if(on('tl'))journey(R);if(on('inventory'))invTable();updImpacts();if(pinPlot&&$('pin')&&$('pin').classList.contains('on'))showPin(pinPlot);if(document.body.classList.contains('dopen')&&cur)openD(cur,true);}

/* ================= drill-down drawer ================= */
const CAT={
 'Land & acquisition':{d:'Land, stamp duty, registration, NA & legal',tab:'land',ctl:'landRate',t:R=>`The raw land at ₹${inr(R.A.landRate)} per sq yd on all 1,02,417 sq yd, stamp duty and registration on the deed, and the NA, NOC and title work. Promoters fund this upfront from their own capital, so it carries no interest. It is ${pct(R.costBy['Land & acquisition']/R.totalCost,0)} of the total cost, which is why price per saleable sq yd matters more than anything else: we paid for 1,02,417 sq yd but can only sell ${inr(L.saleSqyd)}.`},
 'Approvals & consultants':{d:'Plan pass, architect, GujRERA & compliance',tab:'soft',ctl:'a0',t:()=>`Layout plan pass and development permission fees, the architect and town planner, GujRERA registration with quarterly compliance through to completion, plus surveys and utility approvals. Small in rupees, but every month of delay here pushes the launch and the whole cash curve.`},
 'Site development':{d:'Roads, wall, utilities, clubhouse, landscape + PMC',tab:'dev',ctl:'devMul',t:R=>`Sixteen work packages, from levelling and the boundary wall to roads, drains, sewer, power, the clubhouse and landscaping, plus ${pct(R.A.pmc,1)} project management. Each is priced at today’s rates and escalated at ${pct(R.A.escalation,1)} a year to the month it is actually spent.`},
 'Contingency':{d:'Buffer for surprises on site',tab:'dev',ctl:'contingency',t:R=>`${pct(R.A.contingency,1)} of development cost, spread across the build. Soil conditions, rate changes and design upgrades always appear; keeping this visible stops them eating into profit unnoticed.`},
 'Show villa':{d:'500 sq yd villa, built to sell the dream',tab:'dev',ctl:'villaCost',t:R=>`A fully built and furnished G+1 villa next to the clubhouse, built from the first month and ready by ${S.monthFull(R.A.villa.m[1])}. It costs ${money(R.costBy['Show villa'])} and is sold with its plot for ${money(R.villaRev)} in ${S.monthFull(R.A.villa.saleMonth)}, so it nearly pays for itself while doing the heavy lifting in sales.`},
 'Marketing & brand':{d:'Launch campaign, digital leads, site events',tab:'soft',ctl:'marketingPct',t:R=>`${pct(R.A.marketingPct,2)} of plot sales. About a third goes into the launch (brand, brochures, hoardings, site events) and the rest into steady digital lead generation and the sales lounge until the last plot is sold. With no dealer commission, this budget does the work brokers would have done.`},
 'Admin & overheads':{d:'Team, office, insurance',tab:'soft',ctl:'adminMonthly',t:R=>`The site and sales team at ${lakh(r2(R.A.adminMonthly*100))} a month for ${R.end} months, office set-up, CRM and legal retainers, and insurance. Because it runs every month, a faster sell-out saves real money here.`},
 'Maintenance till handover':{d:'Security & upkeep until the RWA',tab:'soft',ctl:'maintenance',t:()=>`Security, gardening, street lights and utilities from the time amenities open until the residents’ association takes over.`},
 'Finance cost':{d:'Interest on the working-capital gap',tab:'fin',ctl:'interest',t:R=>`Promoters fund the land. Development is mostly funded by bookings, but there is a gap in the early months: at most ${money(R.peakDebt)} in ${S.monthFull(R.peakDebtMonth)}. Interest at ${pct(R.A.interest,1)} on that gap totals ${money(R.interestTot)}.`},
 'Dealer commission':{d:'Broker-led sales',tab:'soft',ctl:'commission',t:R=>`${pct(R.A.commission,2)} of plot sales, paid at registry. Switched off in the base plan; shown here because it was turned on in the control room.`}
};
const LINECTL=[[/Land purchase/,'landRate'],[/Stamp/,'stampPct'],[/NA conversion/,'naCost'],[/PMC/,'pmc'],[/Contingency on/,'contingency'],[/Show villa build/,'villaCost'],[/campaign|Digital/,'marketingPct'],[/salaries/,'adminMonthly'],[/Office set-up/,'office'],[/Insurance/,'insurance'],[/upkeep/,'maintenance'],[/Interest/,'interest'],[/Dealer/,'commission']];
function ctlFor(ln){const di=C.development.findIndex(c=>c.k===ln.k);if(di>=0)return 'd'+di;const ai=C.approvals.findIndex(c=>c.k===ln.k);if(ai>=0)return 'a'+ai;const m=LINECTL.find(([re])=>re.test(ln.k));return m&&m[1];}
const adj=id=>id?`<button class="btn sm" style="margin-top:18px" data-focus="${id}">Change this in the calculator ›</button>`:'';
const chips=a=>`<div class="chips">${a.map(([l,v])=>`<div><span>${l}</span><b class="num">${v}</b></div>`).join('')}</div>`;
const lineTable=(ls,tot)=>`<table>${ls.map(l=>{const i=R.lines.indexOf(l);return `<tr class="go" data-open="line:${i}"><td>${l.k}</td><td class="r num" style="white-space:nowrap">${money(l.v)}</td><td class="r num" style="color:var(--muted);width:60px">${tot?pct(l.v/tot,0):''}</td></tr>`;}).join('')}</table>`;
function sweep(o,ks,fn){return ks.map(k=>{const r=S.run({...o,priceMul:k});return {x:r.avgRate,y:fn(r),r};});}
function sens(o){const base=S.run(o).pbt,d=over=>S.run({...o,...over}).pbt-base;
 return [{l:'Price ±5%',lo:d({priceMul:.95}),hi:d({priceMul:1.05})},{l:'Sales pace ±25%',lo:d({pace:o.pace*1.25}),hi:d({pace:o.pace*.75})},{l:'Development ±10%',lo:d({devMul:o.devMul*1.1}),hi:d({devMul:o.devMul*.9})},{l:'Launch 3 months later / earlier',lo:d({launchMonth:o.launchMonth+3}),hi:d({launchMonth:Math.max(0,o.launchMonth-3)})},{l:'Escalation ±2 pts',lo:d({escalation:o.escalation+.02}),hi:d({escalation:Math.max(0,o.escalation-.02)})},{l:'Marketing ±0.5 pts',lo:d({marketingPct:o.marketingPct+.005}),hi:d({marketingPct:Math.max(0,o.marketingPct-.005)})},{l:'Interest ±2 pts',lo:d({interest:o.interest+.02}),hi:d({interest:Math.max(0,o.interest-.02)})}].sort((a,b)=>(Math.abs(b.hi)+Math.abs(b.lo))-(Math.abs(a.hi)+Math.abs(a.lo)));}
const xtM=R=>R.months.filter(m=>m.i%6===0).map(m=>({x:m.i,l:m.label}));

function detail(key){const o=opts(),[kind,id]=key.split(/:(.+)/);
 if(kind==='cat'){const c=CAT[id],v=R.costBy[id]||0,ls=R.lines.filter(l=>l.cat===id);const q=quarters(R,m=>m.out[id]||0).map(x=>({v:x.v,l:x.l}));
  return {k:'Cost detail',t:id,v:money(v),s:`${pct(v/R.totalCost)} of total cost · ₹${inr(v*CRU/L.saleSqyd)} per sold sq yd · ${pct(v/R.revenue)} of revenue`,
   h:`<p>${c.t(R)}</p><h4>Every line</h4>${lineTable(ls,v)}<h4>When the money goes out (per quarter, ₹ Cr)</h4><div class="chart">${bars(q,{every:2,fmt:v=>money(v),c:COL[id]})}</div>${adj(c.ctl)}`};}
 if(kind==='line'){const l=R.lines[+id],cid=ctlFor(l);const n=l.m?l.m[1]-l.m[0]+1:0;
  const q=l.m?R.months.slice(l.m[0],l.m[1]+1).map(m=>({v:l.v/n,l:m.label})):[];
  return {k:l.cat,t:l.k,v:money(l.v),s:`${pct(l.v/R.totalCost,1)} of total cost · ₹${inr(l.v*CRU/L.saleSqyd)} per sold sq yd`,
   h:chips([['At today’s rates',l.base!=null?money(l.base):'—'],['As spent',money(l.v)],['Window',l.m?`${S.monthLabel(l.m[0])} – ${S.monthLabel(l.m[1])}`:'Across project']])+(l.base!=null&&Math.abs(l.v-l.base)>0.0005?`<p style="margin-top:14px">The difference of ${money(l.v-l.base)} is cost escalation at ${pct(R.A.escalation,1)} a year between today and the month each rupee is spent.</p>`:'')+(q.length>1?`<h4>Monthly spend</h4><div class="chart">${bars(q.map(x=>({...x,v:x.v})),{every:Math.ceil(q.length/8),fmt:v=>money(v),c:COL[l.cat]})}</div>`:'')+adj(cid)};}
 if(kind==='ctl'){return null;}
 const K={
  revenue:()=>{const rt=R.revByType,q=quarters(R,m=>m.rev).map(x=>({v:x.v,l:x.l}));return {k:'Revenue',t:'Where the money comes from',v:money(R.revenue),s:`Average ₹${inr(R.avgRate)} per sq yd across ${inr(L.saleSqyd)} sq yd`,
   h:`<table><tr><th>Source</th><th class="r">Plots</th><th class="r">Avg ₹ / sq yd</th><th class="r">₹ Cr</th></tr>${[250,350,500].map(t=>`<tr><td>${t} sq yd plots</td><td class="r">${rt[t].count}</td><td class="r num">${inr(rt[t].rate)}</td><td class="r num">${rt[t].rev.toFixed(2)}</td></tr>`).join('')}<tr><td>Club membership</td><td class="r">194</td><td></td><td class="r num">${R.clubRev.toFixed(2)}</td></tr><tr><td>Show villa sale</td><td class="r">1</td><td></td><td class="r num">${R.villaRev.toFixed(2)}</td></tr><tr class="sub"><td>Total</td><td></td><td></td><td class="r num">${R.revenue.toFixed(2)}</td></tr></table>
   <h4>Sales booked per quarter (₹ Cr)</h4><div class="chart">${bars(q.filter((x,i)=>i>=Math.floor(R.A.launchMonth/3)),{every:2,vals:1,vf:v=>v.toFixed(1),fmt:v=>money(v),c:'#8FA77E'})}</div><p style="margin-top:12px">Prices rise ${pct(R.A.step,1)} after every ${R.A.tranche} plots, so the average realisation (₹${inr(R.avgRate)}) ends up above the launch list. Buyers pay ${pct(R.A.booking,0)} at booking and the rest at registry ${R.A.registryLag} months later.</p>${adj('p250')}`};},
  cost:()=>{const cb=Object.entries(R.costBy).sort((a,b)=>b[1]-a[1]);return {k:'Total project cost',t:'Every rupee we spend',v:money(R.totalCost),s:`₹${inr(R.costPerSqyd)} per sold sq yd · ${R.lines.length} cost lines`,
   h:`<div class="chart">${hbars(cb.map(([k,v])=>({l:k,v,c:COL[k]})),{fmt:v=>money(v)})}</div>${cb.map(([k,v])=>`<h4 style="cursor:pointer" data-open="cat:${k}">${k} · ${money(v)} ›</h4>${lineTable(R.lines.filter(l=>l.cat===k),v)}`).join('')}`};},
  pbt:()=>{const sw=sweep(o,[.8,.85,.9,.95,1,1.05,1.1,1.15,1.2,1.25,1.3],r=>r.pbt);return {k:'Profit before tax',t:'What we make, and what moves it',v:money(R.pbt),s:`${pct(R.margin)} of revenue · ${pct(R.pbt/R.totalCost)} on cost`,
   h:`${chips([['Revenue',money(R.revenue)],['Total cost',money(R.totalCost)],['Profit',money(R.pbt)]])}<h4>What moves profit the most (₹ Cr change)</h4><div class="chart">${hbars(sens(o),{tornado:1,lw:210})}</div><p style="margin-top:8px;font-size:13.5px;color:var(--muted)">Red is the downside, green the upside. ${(()=>{const t=sens(o);return `<b>${t[0].l.split(' ')[0]}</b> moves profit the most, then <b>${t[1].l.split(' ')[0].toLowerCase()}</b>; ${t[t.length-1].l.split(' ')[0].toLowerCase()} barely matters.`})()}</p>
   <h4>Profit at different price levels</h4><div class="chart">${lines([{pts:sw.map(p=>({x:p.x,y:p.y})),c:'#A8803F',fill:1}],{yf:v=>v.toFixed(0),xt:sw.filter((p,i)=>i%2===0).map(p=>({x:p.x,l:'₹'+inr(p.x)})),marks:[{x:R.avgRate,y:R.pbt,l:'You are here'},{x:BE.avgRate,y:0,l:'Break-even ₹'+inr(BE.avgRate),dy:18}]})}</div>`};},
  pat:()=>({k:'Profit after tax',t:'What reaches the promoters',v:money(R.pat),s:`after ${money(R.tax)} income tax`,
   h:`<table><tr><td>Profit before tax</td><td class="r num">${money(R.pbt)}</td></tr><tr><td>Income tax @ ${(R.A.taxRate*100).toFixed(2)}%</td><td class="r num">−${money(R.tax)}</td></tr><tr class="sub"><td>Profit after tax</td><td class="r num">${money(R.pat)}</td></tr></table>
   <h4>Tax notes</h4><p>34.94% applies to a partnership firm or LLP (30% + 12% surcharge + 4% cess). A company under section 115BAA pays 25.17%, which on this profit would leave ${money(R.pbt-Math.max(0,R.pbt)*.2517)} after tax. GST is not charged on developed plots (CBIC circular 177/09/2022), but GST paid to contractors is a cost and is already included. Confirm the structure with the CA before launch.</p>${adj('taxRate')}`}),
  margin:()=>{const sw=sweep(o,[.8,.85,.9,.95,1,1.05,1.1,1.15,1.2,1.25,1.3],r=>r.margin*100);return {k:'Margin',t:'How much of every rupee we keep',v:pct(R.margin),s:`${money(R.pbt)} profit on ${money(R.revenue)} revenue`,
   h:`<p>Out of every ₹100 a buyer pays, about ₹${(R.costBy['Land & acquisition']/R.revenue*100).toFixed(0)} goes back into the land, ₹${((R.costBy['Site development']+(R.costBy['Contingency']||0))/R.revenue*100).toFixed(0)} into development and ₹${((R.totalCost-R.costBy['Land & acquisition']-R.costBy['Site development']-(R.costBy['Contingency']||0))/R.revenue*100).toFixed(0)} into everything else. We keep ₹${(R.margin*100).toFixed(0)}.</p>
   <h4>Margin vs average realisation</h4><div class="chart">${lines([{pts:sw.map(p=>({x:p.x,y:p.y})),c:'#4E6B3E',fill:1}],{yf:v=>v.toFixed(0)+'%',xt:sw.filter((p,i)=>i%2===0).map(p=>({x:p.x,l:'₹'+inr(p.x)})),marks:[{x:R.avgRate,y:R.margin*100,l:'Now '+pct(R.margin)}]})}</div><p style="margin-top:10px">A healthy plotted project targets 20–25%. Every ₹100 per sq yd on the average rate is worth about ${money(65100*100/CRU)}.</p>`};},
  avgRate:()=>{const n=Math.ceil(194/R.A.tranche),base=R.invValue*CRU/L.saleSqyd;const tr=[...Array(n)].map((_,i)=>({v:base*Math.pow(1+R.A.step,i),l:`${i*R.A.tranche+1}–${Math.min(194,(i+1)*R.A.tranche)}`}));
   return {k:'Average realisation',t:'The price ladder',v:'₹'+inr(R.avgRate),s:'average per sq yd across all 194 plots',
   h:`<h4>Price per sq yd by tranche (plots sold)</h4><div class="chart">${bars(tr,{vals:1,vf:v=>inr(v),fmt:v=>'₹'+inr(v)})}</div><h4>By plot size</h4><table><tr><th>Size</th><th class="r">Launch list</th><th class="r">Average realised</th><th class="r">Average ticket</th></tr>${[250,350,500].map(t=>`<tr><td>${t} sq yd</td><td class="r num">₹${inr(R.A.launch[t])}</td><td class="r num">₹${inr(R.revByType[t].rate)}</td><td class="r num">${money(R.revByType[t].rev/R.revByType[t].count)}</td></tr>`).join('')}</table><p style="margin-top:12px">Preferential location charges (corners, garden and green-belt facing plots) and the tranche increases lift the average above the list price. Market reference for Dholera plotted schemes near the expressway: about ₹8,500–9,800 per sq yd today.</p>${adj('p250')}`};},
  costSqyd:()=>{const cb=Object.entries(R.costBy).sort((a,b)=>b[1]-a[1]);return {k:'All-in cost',t:'What one sold sq yd costs us',v:'₹'+inr(R.costPerSqyd),s:`vs average realisation ₹${inr(R.avgRate)}`,
   h:`<div class="chart">${hbars(cb.map(([k,v])=>({l:k,v:v*CRU/L.saleSqyd,c:COL[k]})),{fmt:v=>'₹'+inr(v)})}</div><p style="margin-top:12px">Land alone is ₹${inr(R.costBy['Land & acquisition']*CRU/L.saleSqyd)} per sold sq yd: we bought ₹${inr(R.A.landRate)} land, but only ${L.landUse[0].pct.toFixed(0)}% of it becomes plots after roads, gardens and the clubhouse.</p>`};},
  be:()=>{const sw=sweep(o,[.75,.8,.85,.9,.95,1,1.05,1.1,1.15,1.2],r=>r.pbt);return {k:'Break-even',t:'The price below which we lose money',v:'₹'+inr(BE.avgRate),s:`average per sq yd · 250 sq yd launch of ₹${inr(BE.launch250)}`,
   h:`<p>Solved exactly: the model is re-run with every price scaled until profit before tax is zero, including the knock-on effects on marketing, finance cost and timing. Our current average of ₹${inr(R.avgRate)} sits ${R.avgRate>=BE.avgRate?`<b>₹${inr(R.avgRate-BE.avgRate)} above</b>`:`<b style="color:var(--red)">₹${inr(BE.avgRate-R.avgRate)} below</b>`} break-even, a cushion of ${pct((R.avgRate-BE.avgRate)/R.avgRate)}.</p>
   <h4>Profit vs average rate</h4><div class="chart">${lines([{pts:sw.map(p=>({x:p.x,y:p.y})),c:'#A8803F',fill:1}],{xt:sw.filter((p,i)=>i%2===0).map(p=>({x:p.x,l:'₹'+inr(p.x)})),marks:[{x:BE.avgRate,y:0,l:'Break-even',dy:18},{x:R.avgRate,y:R.pbt,l:'Now'}]})}</div>`};},
  equity:()=>({k:'Promoter capital',t:'What the promoters put in',v:money(R.equity),s:'funds the land on day one, interest-free',
   h:`${lineTable(R.lines.filter(l=>l.cat==='Land & acquisition'),R.equity)}<p style="margin-top:12px">Everything after the land is funded by customer bookings, with a short working-capital gap of ${money(R.peakDebt)} at its peak. Promoters get their capital back in ${R.eqBack!=null?S.monthFull(R.eqBack):'—'}.</p>${adj('landRate')}`}),
  peak:()=>({k:'Funding',t:'The working-capital gap',v:money(R.peakDebt),s:`at its peak in ${S.monthFull(R.peakDebtMonth)} · ${money(R.interestTot)} interest in total`,
   h:`<h4>Borrowing needed, month by month (₹ Cr)</h4><div class="chart">${lines([{pts:R.months.map(m=>({x:m.i,y:m.debt})),c:'#C8795A',fill:1}],{yf:v=>v.toFixed(1),xt:xtM(R)})}</div><p style="margin-top:12px">Between ground-breaking and the first registries, development spending runs ahead of collections. A 25% booking amount, faster sales or launching earlier all shrink this gap.</p>${adj('booking')}`}),
  roi:()=>({k:'Return on capital',t:'What the money earns',v:pct(R.roi),s:`profit after tax ÷ (promoter capital + peak funding) over ${R.years.toFixed(1)} years`,
   h:`${chips([['Capital employed',money(R.capital)],['Profit after tax',money(R.pat)],['Per year (simple)',pct(R.roi/R.years)]])}<p style="margin-top:14px">Compounded, that is about ${pct(Math.pow(1+Math.max(-0.99,R.roi),1/R.years)-1)} a year on the capital. The land was already bought, so the real question for each decision is how much it adds to or takes from this number.</p>`}),
  sellout:()=>{let c=0;const pts=R.months.map(m=>({x:m.i,y:(c+=m.sold)}));return {k:'Sales forecast',t:'How fast the plots go',v:S.monthFull(R.sellout),s:`${R.sellout-R.A.launchMonth+1} months of selling from a ${S.monthFull(R.A.launchMonth)} launch`,
   h:`<h4>Plots sold, cumulative</h4><div class="chart">${lines([{pts,c:'#14213D',fill:1}],{zero:false,yf:v=>v.toFixed(0),xt:xtM(R),marks:[{x:R.A.launchMonth,y:0,l:'Launch',dy:-10},{x:R.sellout,y:194,l:'All 194 sold',a:'end',dx:-8,dy:18}]})}</div><p style="margin-top:12px">The launch quarter is the strongest (pent-up demand and the best price), then sales settle to roughly six to seven plots a month. Slower sales cost twice: more months of overheads and interest, and fewer price increases realised.</p>${adj('pace')}`};},
  eqBack:()=>({k:'Cash story',t:'When the promoters are back in the money',v:R.eqBack!=null?S.monthFull(R.eqBack):'Not recovered',s:`project cash turns positive in ${R.cashBreakeven!=null?S.monthFull(R.cashBreakeven):'—'}`,
   h:`<h4>Cumulative project cash (₹ Cr)</h4><div class="chart">${lines([{pts:R.months.map(m=>({x:m.i,y:m.cumNet})),c:'#A8803F',fill:1}],{xt:xtM(R),marks:[{x:R.troughMonth,y:R.trough,l:'Deepest point '+money(R.trough,1),dy:18}]})}</div><p style="margin-top:12px">The curve drops on day one with the land (${money(R.equity)}), dips further as development starts, then climbs as bookings and registries arrive. Promoters recover their full land capital in ${R.eqBack!=null?S.monthFull(R.eqBack):'—'}, and everything after that is profit.</p>`})
 };
 return K[kind==='kpi'?id:id]?K[id]():null;}
let cur=null;
function openD(key,silent){if(key.startsWith('ctl:')){focusCtl(key.slice(4));return;}const d=detail(key);if(!d)return;cur=key;
 $('dbody').innerHTML=`<div class="dh"><button id="dx" aria-label="Close">×</button><div class="k">${d.k}</div><h3>${d.t}</h3><div class="v num">${d.v}</div><div class="s">${d.s}</div></div><div class="db">${d.h}</div>`;
 if(!silent)$('drawer').scrollTop=0;document.body.classList.add('dopen');$('drawer').setAttribute('aria-hidden','false');}
function closeD(){document.body.classList.remove('dopen');$('drawer').setAttribute('aria-hidden','true');cur=null;}
document.addEventListener('click',e=>{const f=e.target.closest('[data-focus]');if(f){focusCtl(f.dataset.focus);return;}if(e.target.closest('#dx')){closeD();return;}const o=e.target.closest('[data-open]');if(o)openD(o.dataset.open);});
$('scrim').onclick=closeD;document.addEventListener('keydown',e=>{if(e.key==='Escape')closeD();});

/* ================= engagement ================= */
function countUp(el){const m=el.dataset.count.match(/^([\d,]+(?:\.\d+)?)(.*)$/);if(!m)return;const n=+m[1].replace(/,/g,''),dec=(m[1].split('.')[1]||'').length,t0=performance.now();
 (function f(t){const k=Math.min(1,(t-t0)/1400),e=1-Math.pow(1-k,3),v=n*e;el.textContent=(dec?v.toFixed(dec):Math.round(v).toLocaleString('en-IN'))+m[2];if(k<1)requestAnimationFrame(f);})(t0);}
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;el.classList.add('in');el.querySelectorAll('[data-count]').forEach(countUp);el.querySelectorAll('.bar i').forEach(i=>i.style.width=i.dataset.w+'%');io.unobserve(el);}),{threshold:.12}):null;
document.querySelectorAll('section:not(#hero) .wrap > *').forEach(el=>{if(io){el.classList.add('rv');io.observe(el);}else el.querySelectorAll('.bar i').forEach(i=>i.style.width=i.dataset.w+'%');});
const navIO='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.links a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id));}),{rootMargin:'-45% 0px -50% 0px'}):null;
document.querySelectorAll('section[id]').forEach(s=>navIO&&navIO.observe(s));
addEventListener('scroll',()=>{const h=document.documentElement;if($('prog'))$('prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';},{passive:true});

drawTabs();drawCtls();update();
if($('ctls')&&location.hash.length>1&&ALL[location.hash.slice(1)])setTimeout(()=>focusCtl(location.hash.slice(1)),400);
