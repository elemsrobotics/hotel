
'use strict';
const $ = id => document.getElementById(id);
const labels={occupied:'Хүнтэй',vacant:'Сул',offline:'Offline'};
const colors={occupied:'var(--green)',vacant:'var(--gray)',offline:'var(--red)'};
const icon = {
 occupied:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-8m18 8v-8M3 14h18M5 14V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6M3 18v2m18-2v2M5 10h6m2 0h6"/></svg>',
 vacant:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v17M3 21h18M15 12h.01"/></svg>',
 offline:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 2l20 20M8.4 8.6a10 10 0 0 1 11.6 1.3M2 9.9a15 15 0 0 1 3-2.1m10.9 6a5 5 0 0 1 2.1 1.1M6 14.8a8 8 0 0 1 3-1.6M12 20h.01"/></svg>'
};
function localNow(){
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ulaanbaatar',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  return {day:`${parts.year}-${parts.month}-${parts.day}`,minutes:Number(parts.hour)*60+Number(parts.minute)};
}
function plusDays(ymd,offset){const d=new Date(ymd+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)}
const first=localNow();
const state={day:first.day,minute:first.minutes,live:true,selected:null,detailDay:first.day,expand:false};
function timeStr(m){return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}
function duration(mins){return `${Math.floor(mins/60)}ц ${mins%60}м`}
function dateSeed(day){return Math.floor(Date.parse(day+'T00:00:00Z')/86400000)}
// Fixed, deterministic simulated events only; replace with backend sensor events in production.
function statusAt(id,day,min){
  const seed=dateSeed(day),n=id-101;
  if((id===120||id===147) && min>=420 && min<1100)return 'offline';
  const a=(n*19+seed*31)%610;
  const b=720+(n*37+seed*13)%490;
  return (min>=a && min<a+100+(n%7)*33)||(min>=b && min<b+110+(n%6)*36)?'occupied':'vacant';
}
function roomStatuses(){return Array.from({length:50},(_,i)=>({id:101+i,status:statusAt(101+i,state.day,state.minute)}))}
function syncDateBounds(){const now=localNow(); const start=plusDays(now.day,-29); for(const id of ['main-date','detail-date']){ const el=$(id);el.min=start;el.max=now.day;}}
function renderDashboard(){
 const all=roomStatuses(); const ordered=['occupied','vacant','offline'];
 $('mode-pill').textContent=state.live?'LIVE':'HISTORY';$('mode-pill').className='pill'+(state.live?'':' history');
 $('main-date').value=state.day;
 $('main-time').textContent=state.live?'Яг одоо':timeStr(state.minute);
 $('main-time-desc').textContent=state.live?'Одоогийн хяналт':state.day+' · сонгосон мөч';
 $('main-slider').value=Math.floor(state.minute/5)*5;
 $('main-stats').innerHTML=ordered.map(key=>`<div class="stat"><div class="label">${labels[key]}</div><div class="number">${all.filter(r=>r.status===key).length}</div><div class="mark" style="background:${colors[key]}"></div></div>`).join('');
 $('room-groups').innerHTML=ordered.map(key=>{const subset=all.filter(r=>r.status===key);return `<section class="group"><div class="grouptitle"><span class="dot" style="background:${colors[key]}"></span>${labels[key]} өрөөнүүд <span class="count">${subset.length}</span></div>${subset.length?`<div class="roomgrid">${subset.map(r=>`<button type="button" class="room ${key}" data-room="${r.id}" aria-label="Өрөө ${r.id}, ${labels[key]}, дэлгэрэнгүй харах">${icon[key]}<span class="room-number">${r.id}</span></button>`).join('')}</div>`:'<div class="empty">Энэ ангилалд өрөө алга</div>'}</section>`}).join('');
 $('room-groups').querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>openRoom(Number(b.dataset.room))));
}
function makeSpans(id,day){
 const arr=[];for(let t=0;t<1440;t+=5){const status=statusAt(id,day,t);const p=arr[arr.length-1];if(p&&p.status===status)p.end=t+5;else arr.push({start:t,end:t+5,status});}return arr;
}
function renderDetail(){
 const id=state.selected;if(id==null)return;
 const at=statusAt(id,state.day,state.minute);const segments=makeSpans(id,state.detailDay);
 const mins=segments.filter(s=>s.status==='occupied').reduce((a,s)=>a+s.end-s.start,0);
 const visits=segments.filter(s=>s.status==='occupied').length;
 $('detail-room').textContent='Өрөө '+id;$('detail-date').value=state.detailDay;
 $('detail-status').textContent=labels[at];$('detail-status').className='pill '+(at==='occupied'?'':'history');
 $('detail-stats').innerHTML=`<div class="stat"><div class="label">Хүнтэй байсан хугацаа</div><div class="number" style="font-size:24px">${duration(mins)}</div></div><div class="stat"><div class="label">Хүнтэй болсон удаа</div><div class="number">${visits}</div></div>`;
 $('timeline').innerHTML=segments.map(s=>`<div class="segment ${s.status}" title="${timeStr(s.start)}–${timeStr(s.end)} · ${labels[s.status]}" style="flex:${s.end-s.start}"></div>`).join('');
 const reversed=segments.slice().reverse();const visible=state.expand?reversed:reversed.slice(0,5);
 $('room-log').innerHTML=visible.map(s=>`<div class="logline"><span class="log-icon ${s.status}">${icon[s.status]}</span><div class="log-desc"><div class="log-status">${labels[s.status]}</div><div class="log-time">${timeStr(s.start)} – ${timeStr(s.end)}</div></div><span class="log-duration">${duration(s.end-s.start)}</span></div>`).join('');
 $('toggle-log').textContent=state.expand?'Хураах':'Бүгдийг харах';
}
function openRoom(id){state.selected=id;state.detailDay=state.day;state.expand=false;$('dashboard').classList.add('hidden');$('detail').classList.remove('hidden');renderDetail();window.scrollTo({top:0,behavior:'instant'});}
function back(){state.selected=null;$('detail').classList.add('hidden');$('dashboard').classList.remove('hidden');renderDashboard();window.scrollTo({top:0,behavior:'instant'});}
$('back-btn').addEventListener('click',back);$('bottom-back').addEventListener('click',back);
$('live-btn').addEventListener('click',()=>{const now=localNow();state.day=now.day;state.minute=now.minutes;state.live=true;syncDateBounds();renderDashboard();});
$('main-date').addEventListener('change',e=>{if(!e.target.value)return;state.day=e.target.value;state.live=false;renderDashboard();});
$('main-slider').addEventListener('input',e=>{state.minute=Number(e.target.value);state.live=false;renderDashboard();});
$('detail-date').addEventListener('change',e=>{if(!e.target.value)return;state.detailDay=e.target.value;state.expand=false;renderDetail();});
$('toggle-log').addEventListener('click',()=>{state.expand=!state.expand;renderDetail();});
setInterval(()=>{if(state.live){const now=localNow();state.day=now.day;state.minute=now.minutes;if(state.selected===null)renderDashboard();}syncDateBounds();},30000);
syncDateBounds();renderDashboard();

