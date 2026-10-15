// ===== CONFIG =====
const C={
  startCash:3e6,winTarget:1e8,maxMonths:24,daysPerMonth:30,
  dayDuration:300,// 5 min
  fuelCost:150e3,fuelTime:10,sleepRate:2,// stamina/sec
  mgTime:20,mgFull:12,mgPartial:7,
  dailyInterest:0.002,
  monthly:[
    {n:'Thuê phòng trọ',c:25e5},{n:'Điện nước',c:4e5},{n:'Ăn uống',c:15e5},
    {n:'Điện thoại',c:2e5},{n:'Bảo hiểm xe',c:3e5},{n:'Trả góp xe',c:16e5},
  ],
  jobs:{
    food:{id:'food',icon:'bowl',name:'ĐỒ ĂN',earn:'25k-50k',sta:15,fuel:5,min:25e3,max:5e4},
    goods:{id:'goods',icon:'box',name:'HÀNG HÓA',earn:'50k-110k',sta:20,fuel:9,min:5e4,max:11e4},
  },
};
const BILLS=C.monthly.reduce((s,b)=>s+b.c,0);

// ===== UPGRADES =====
const UPGS=[
  {id:'gps',   name:'GPS thông minh',    icon:'flag',  cost:12e5,desc:'-50% kẹt xe & hủy đơn. Phí 150K/tháng',cat:'Phụ tùng',fee:15e4},
  {id:'insure',name:'Bảo hiểm mở rộng',  icon:'bank',  cost:2e6, desc:'-60% chi phí tai nạn. Phí 300K/tháng',cat:'Phụ tùng',fee:3e5},
  {id:'heat',  name:'Túi giữ nhiệt',     icon:'bowl',  cost:8e5, desc:'Đồ ăn +25%, hàng hóa -10% (chọn 1 trong 2 túi)',cat:'Túi giao hàng',grp:'bag'},
  {id:'crate', name:'Thùng hàng lớn',    icon:'box',   cost:12e5,desc:'Hàng hóa +20%, đồ ăn -10% (chọn 1 trong 2 túi)',cat:'Túi giao hàng',grp:'bag'},
  {id:'eco',   name:'Động cơ tiết kiệm', icon:'fuel',  cost:2e6, desc:'Xăng -35%, mỗi đơn chậm thêm 3 giây (chọn 1 trong 2 động cơ)',cat:'Động cơ',grp:'eng'},
  {id:'turbo', name:'Động cơ mạnh',      icon:'bolt',  cost:5e6, desc:'Thể lực -20%, nhanh hơn 3 giây/đơn, xăng +25% (chọn 1 trong 2 động cơ)',cat:'Động cơ',grp:'eng'},
  {id:'tire2', name:'Lốp chống thủng',   icon:'gear',  cost:3e6, desc:'Tai nạn làm mất ít độ bền hơn 40%',cat:'Mở khóa 25TR',req:25e6},
  {id:'prio',  name:'Ứng dụng ưu tiên',  icon:'star',  cost:6e6, desc:'Thấy 4 đơn mỗi lượt, nhiều đơn gấp hơn',cat:'Mở khóa 50TR',req:5e7},
  {id:'vip',   name:'Thẻ đối tác vàng',  icon:'trophy',cost:1e7, desc:'+15% thu nhập mọi đơn',cat:'Mở khóa 75TR',req:75e6},
  {id:'fix_s', name:'Sửa chữa nhẹ',      icon:'wrench',cost:5e5, desc:'+30% độ bền xe',cat:'Sửa xe',rep:true},
  {id:'fix_f', name:'Đại tu toàn diện',  icon:'gear',  cost:2e6, desc:'Phục hồi độ bền xe 100%',cat:'Sửa xe',rep:true},
];
const MS=[{at:25e6,reward:1e6},{at:5e7,reward:2e6},{at:75e6,reward:3e6}];   // savings milestones
const DIST=[{n:'GẦN',earn:.65,sta:.75,fuel:.6,t:0},{n:'VỪA',earn:1,sta:1,fuel:1,t:3},{n:'XA',earn:1.4,sta:1.35,fuel:1.6,t:6}];
const DRIVE=[{n:'CHẬM',risk:.4,fuel:.85,t:4},{n:'THƯỜNG',risk:1,fuel:1,t:0},{n:'NHANH',risk:1.8,fuel:1.2,t:-2}];


// ===== EVENTS =====
const EVTS=[
  {id:'tip',ic:'coin',t:'good',p:.07,ti:'TIP THÊM!',fn:(e)=>{const r=rnd(4e4,2e5);return{cash:r,msg:`Khách vui tính, tip ${fm(r)}`}}},
  {id:'vip',ic:'star',t:'good',p:.04,ti:'ĐƠN VIP!',fn:(e)=>{return{cash:e,msg:`VIP! Thù lao x2, thêm ${fm(e)}`}}},
  {id:'bon',ic:'trophy',t:'good',p:.02,ti:'BE THƯỞNG!',fn:(e)=>{const r=rnd(3e5,1e6);return{cash:r,msg:`Be thưởng tài xế: +${fm(r)}`}}},
  {id:'brk',ic:'wrench',t:'bad',p:.03,ti:'XE HỎNG!',fn:(e)=>{const r=rnd(25e4,85e4);return{cash:-r,hp:-20,msg:`Sửa xe khẩn: -${fm(r)}`}}},
  {id:'fin',ic:'warn',t:'bad',p:.03,ti:'BỊ PHẠT!',fn:(e)=>{const r=rnd(12e4,36e4);return{cash:-r,msg:`CSGT phạt: -${fm(r)}`}}},
  {id:'crs',ic:'warn',t:'bad',p:.02,ti:'VA CHẠM!',fn:(e)=>{const r=rnd(18e4,54e4);return{cash:-r,hp:-15,msg:`Bồi thường: -${fm(r)}`}}},
  {id:'cnl',ic:'skull',t:'neu',p:.04,ti:'KHÁCH HỦY!',fn:(e)=>{return{cash:0,sta:-10,skip:true,msg:`Khách hủy sau khi đến!`}}},
  {id:'jam',ic:'warn',t:'neu',p:.05,ti:'KẸT XE!',fn:(e)=>{return{cash:0,sta:-15,msg:`Kẹt xe kinh hoàng!`}}},
  {id:'rain',ic:'cloud',t:'bad',p:.01,ti:'MƯA TO!',fn:(e)=>{return{cash:0,rain:true,msg:`Thu nhập giảm 40% hôm nay`}}},
];

// ===== STATE =====
let g={};let modal=null;
let mgTmr,mgSpw,animTmr,dayTmr;

function init(){
  g={
    cash:C.startCash,savings:0,month:1,day:1,
    stamina:100,fuel:100,vehicleHp:100,
    stars:5.0,
    dayTimeLeft:C.dayDuration,
    dailyEarned:0,dailySpent:0,
    earned:0,delivered:0,totalDelivered:0,
    upgrades:{},log:[],
    phase:'start',activeAnim:null,
    rainToday:false,
    profile:defProfile(),reviews:[],
    drive:1,offers:[],ms:[],fin:{earn:0,fuel:0,repair:0,accident:0,bills:0,upg:0},
  };
  g.offers=genOffers();
  modal=null;
  clearTmrs();
}

// ===== HELPERS =====
function fm(n){
  if(!n&&n!==0)return'—';
  const a=Math.abs(Math.round(n));
  const s=n<0?'-':'';
  if(a>=1e6)return s+(a/1e6%1?((a/1e6).toFixed(1)):(a/1e6))+'TR';
  if(a>=1e3)return s+Math.round(a/1e3)+'K';
  return s+a.toLocaleString('vi-VN');
}
function ff(n){return(n<0?'-':'')+Math.abs(Math.round(n)).toLocaleString('vi-VN')+' đ'}
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function addLog(m,t='info'){g.log.unshift({m,t});if(g.log.length>20)g.log.pop()}
function up(id){return !!(g.upgrades&&g.upgrades[id])}
// GPS halves jams and cancellations; rush hour doubles jams; a worn bike breaks down more; riding fast raises accident/fine odds.
function evtChance(e){
  let p=e.p;
  if((e.id==='jam'||e.id==='cnl')&&up('gps'))p*=.5;
  if(e.id==='jam'&&isPeak())p*=2;
  if(e.id==='brk')p*=1+(100-g.vehicleHp)/50;
  if(e.id==='brk'||e.id==='crs'||e.id==='fin')p*=DRIVE[g.drive].risk;
  return p;
}
function rollEvt(){let r=Math.random(),c=0;for(const e of EVTS){c+=evtChance(e);if(r<c)return e;}return null}
// a failed delivery (no pay) cannot earn a customer tip, VIP bonus or reward: only bad events can still happen
function rollEvtFor(earn){const e=rollEvt();return(e&&earn<=0&&e.t==='good')?null:e}
function clearTmrs(){stopAllT()}
// ===== SAVE / LOAD (localStorage key btd_v2, same shape as older saves) =====
let _saveWarned=false;
// Only write states that are consistent: never mid-delivery/refuel (money moves at the end), never while a
// day/month summary is pending (interest is already applied but not yet confirmed), never after the game ended.
function canPersist(){
  if(!g||!g.phase)return false;
  if(['start','win','lose','minigame','anim-deliver','anim-refuel'].includes(g.phase))return false;
  if(modal&&(modal.type==='dayEnd'||modal.type==='monthEnd'))return false;
  return true;
}
function save(){
  if(!canPersist())return;
  const fixed=repairState(g);if(fixed.length)console.warn('[btd] repaired state fields:',fixed.join(', '));   // never write a broken state
  try{localStorage.setItem('btd_v2',JSON.stringify(g));}
  catch(e){if(!_saveWarned){_saveWarned=true;toast('KHÔNG LƯU ĐƯỢC TIẾN TRÌNH TRÊN TRÌNH DUYỆT NÀY','warn');}}
}
function load(){try{const s=localStorage.getItem('btd_v2');return s?JSON.parse(s):null;}catch(e){return null}}
function saneSave(s){
  return !!s&&typeof s==='object'&&['cash','savings','month','day','stamina','fuel','vehicleHp'].every(k=>Number.isFinite(s[k]));
}
// A save can be taken in the shop, the profile screen or mid-sleep; any of those resumes on the main screen.
function hasSave(){const s=load();return saneSave(s)&&!['start','win','lose'].includes(s.phase)}
function restore(s){
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,Number.isFinite(v)?v:lo));
  g=s;normalizeState();
  g.upgrades=g.upgrades&&typeof g.upgrades==='object'?g.upgrades:{};
  g.log=Array.isArray(g.log)?g.log:[];
  g.stamina=clamp(g.stamina,0,100);g.fuel=clamp(g.fuel,0,fuelMax());g.vehicleHp=clamp(g.vehicleHp,0,100);
  g.month=clamp(g.month,1,C.maxMonths);g.day=clamp(g.day,1,C.daysPerMonth);
  g.dayTimeLeft=clamp(g.dayTimeLeft,1,C.dayDuration);
  g.cash=Math.round(g.cash);g.savings=Math.max(0,Math.round(g.savings));
  ['dailyEarned','dailySpent','earned','delivered','totalDelivered'].forEach(k=>{g[k]=Number.isFinite(g[k])?g[k]:0});
  g.rainToday=!!g.rainToday;
  const od=g.upgrades,nu={};   // older saves: map retired upgrades onto the new ones
  Object.keys(od).forEach(k=>{const u=UPGS.find(x=>x.id===k);if(u&&!u.rep&&od[k])nu[k]=true});
  if(od.engine)nu.turbo=true;if(od.heatbag)nu.heat=true;
  if(od.tires)g.cash+=15e5;if(od.tank)g.cash+=2e6;
  g.upgrades=nu;
  g.drive=[0,1,2].includes(g.drive)?g.drive:1;
  if(!Array.isArray(g.ms))g.ms=MS.filter(m=>g.savings>=m.at).map(m=>m.at);
  g.fin=Object.assign({earn:0,fuel:0,repair:0,accident:0,bills:0,upg:0},g.fin&&typeof g.fin==='object'?g.fin:{});
  if(!Array.isArray(g.offers)||!g.offers.length||!g.offers.every(o=>o&&C.jobs[o.type]&&DIST[o.dist]&&Number.isFinite(o.base)))g.offers=genOffers();
  clearTmrs();modal=null;mgData=null;g.activeAnim=null;g.phase='game';
}
function earnMult(){return g.vehicleHp>=70?1:g.vehicleHp>=50?.85:g.vehicleHp>=30?.7:.55}
// ===== ORDERS =====
function hourOf(){return 6+16*(1-g.dayTimeLeft/C.dayDuration)}   // a game day runs 06:00-22:00
function isPeak(){const h=hourOf();return(h>=11&&h<13)||(h>=17&&h<19)}
function fmH(){const h=hourOf(),H=Math.floor(h),M=Math.floor((h-H)*6)*10;return(H<10?'0':'')+H+':'+(M<10?'0':'')+M}
function genOffer(peak){
  const type=Math.random()<.5?'food':'goods',job=C.jobs[type];
  const r=Math.random(),dist=r<.35?0:r<.75?1:2;
  const rush=Math.random()<(peak?.35:.2)+(up('prio')?.1:0);
  const mr=Math.random(),mg=mr<.4?'catch':mr<.7?'dodge':'route';
  const base=rnd(job.min,job.max)*DIST[dist].earn*(rush?1.7:1)*(peak?1.25:1);
  return{type,dist,rush,mg,peak:!!peak,base:Math.round(base/1000)*1000};
}
function genOffers(){const n=up('prio')?4:3,p=isPeak(),r=[];for(let i=0;i<n;i++)r.push(genOffer(p));return r}
function offerCost(o){
  const job=C.jobs[o.type],d=DIST[o.dist];
  const sta=job.sta*d.sta*(up('turbo')?.8:1);
  const fuel=job.fuel*d.fuel*DRIVE[g.drive].fuel*(up('eco')?.65:up('turbo')?1.25:1);
  return{sta:Math.max(4,Math.round(sta)),fuel:Math.max(1,Math.round(fuel))};
}
function offerTime(o){return Math.max(1,DIST[o.dist].t+DRIVE[g.drive].t+(up('eco')?3:0)-(up('turbo')?3:0))}   // travel seconds
function offerPay(o){
  let e=o.base;
  if(g.rainToday)e*=.6;
  if(up('heat'))e*=o.type==='food'?1.25:.9;
  if(up('crate'))e*=o.type==='goods'?1.2:.9;
  if(up('vip'))e*=1.15;
  return Math.floor(e*earnMult());
}
function canDoOffer(o){const c=offerCost(o);return g.stamina>=c.sta&&g.fuel>=c.fuel&&g.vehicleHp>0}
function offerWhy(o){
  const c=offerCost(o);
  if(g.vehicleHp<=0)return'xe hỏng, cần sửa ở mục Nâng cấp';
  const lack=[];
  if(g.fuel<c.fuel)lack.push(`xăng (cần ${c.fuel}%, còn ${g.fuel}%)`);
  if(g.stamina<c.sta)lack.push(`thể lực (cần ${c.sta}, còn ${g.stamina})`);
  return lack.length?'thiếu '+lack.join(' và '):'';
}
function refreshOffers(){
  if(modal||g.activeAnim||g.phase!=='game')return;
  if(g.dayTimeLeft<=10){toast('KHÔNG ĐỦ THỜI GIAN ĐỂ ĐỔI ĐƠN','warn');return}
  g.dayTimeLeft-=8;g.offers=genOffers();save();render();
}
function setDrive(i){
  if(modal||g.activeAnim||g.phase!=='game'||![0,1,2].includes(i))return;
  g.drive=i;save();render();
}
// Write the state with this order's costs already paid, so a reload mid-delivery cannot refund them.
function persistNow(patch){try{localStorage.setItem('btd_v2',JSON.stringify(Object.assign({},g,{phase:'game',activeAnim:null},patch||{})))}catch(e){}}
function fuelMax(){return 100}

// ===== DAY TIMER =====
function startDayTimer(){
  stopT(dayTmr);
  dayTmr=every(1000,()=>{if(!modal)dayStep()});   // popups (refuel, day/month end, tutorial) freeze the day; deliveries and sleeping use it up
}
function dayStep(){
  const busy=['minigame','anim-deliver','anim-refuel'].includes(g.phase);
  if(g.dayTimeLeft>0)g.dayTimeLeft--;
  const el=document.getElementById('day-tmr');
  if(el)el.textContent=fmT(g.dayTimeLeft);
  const ck=document.getElementById('clk');
  if(ck){const pk=isPeak();ck.textContent=fmH();ck.classList.toggle('peak',pk)}
  if(g.dayTimeLeft>0&&g.dayTimeLeft%10===0)save();   // keeps the clock when the tab is closed mid-day
  if(g.dayTimeLeft<=0&&!busy){stopT(dayTmr);triggerDayEnd();return false}   // a delivery in progress finishes first
  return true;
}
function fmT(s){const m=Math.floor(s/60);const sc=s%60;return`${m}:${sc<10?'0':''}${sc}`}

const HOLD_MS=1500;   // how long a finished refuel / sleep screen stays before returning to the game
// ===== ACTIONS =====
function startGame(fresh){
  if(!fresh){const s=load();if(saneSave(s)&&!['start','win','lose'].includes(s.phase)){restore(s);startDayTimer();render();toast('GAME CŨ ĐÃ TẢI!');return;}}
  if(fresh){const old=load(),keep=(old&&old.profile)||g.profile;init();g.profile=Object.assign(defProfile(),keep);}   // every stat back to its starting value, driver profile kept
  g.phase='game';addLog('Bắt đầu hành trình!','info');
  startDayTimer();save();render();   // save now so a reload cannot bring the old game back
}

function doDelivery(i){
  if(modal||g.activeAnim||g.phase!=='game')return;
  const o=g.offers[i];if(!o)return;
  const c=offerCost(o);
  if(!canDoOffer(o)){toast(g.vehicleHp<=0?'XE HỎNG QUÁ NẶNG!':g.fuel<c.fuel?'HẾT XĂNG!':'HẾT THỂ LỰC!','bad');return;}
  g.stamina=Math.max(0,g.stamina-c.sta);
  g.fuel=Math.max(0,g.fuel-c.fuel);
  const earn=offerPay(o);
  g.offers[i]=genOffer(isPeak());
  persistNow();
  startMinigame(o,earn);
}

function doRefuel(){
  if(modal||g.activeAnim||g.phase!=='game')return;
  if(g.fuel>=fuelMax()-2){toast('BÌNH ĐÃ GẦN ĐẦY!');return;}
  modal={type:'refuel',target:g.fuel};   // shared modal state: the day clock pauses while it is open
  render();
}
function rfInfo(){
  const t=modal.target,fill=Math.max(0,t-g.fuel);
  const cost=fill*Math.round(C.fuelCost/fuelMax());
  return{t,fill,cost,ok:g.cash>=cost};
}
function rfSlide(v){
  if(!modal||modal.type!=='refuel')return;
  modal.target=parseInt(v)||g.fuel;
  const i=rfInfo(),$=id=>document.getElementById(id);
  if($('rf-fill'))$('rf-fill').style.width=(i.t/fuelMax()*100)+'%';
  if($('rf-lbl'))$('rf-lbl').textContent=i.t+'/'+fuelMax()+'%';
  if($('rf-add'))$('rf-add').textContent=i.fill+'%';
  if($('rf-cost'))$('rf-cost').textContent=ff(i.cost);
  if($('rf-warn'))$('rf-warn').hidden=i.ok||i.fill===0;
  if($('rf-go'))$('rf-go').disabled=!i.ok||i.fill===0;
}
function rfConfirm(){
  if(!modal||modal.type!=='refuel')return;
  const i=rfInfo();
  if(i.fill<=0)return;
  if(!i.ok){toast('KHÔNG ĐỦ TIỀN!','bad');return;}
  const startFuel=g.fuel,val=i.t,fillable=i.fill,cost=i.cost;
  modal=null;
  g.cash-=cost;g.dailySpent+=cost;g.fin.fuel+=cost;
  persistNow({fuel:val});
  g.activeAnim={type:'refuel',timeLeft:3,total:3,targetFuel:val,startFuel,costPaid:cost};
  g.phase='anim-refuel';
  render();
  refuelVisual(startFuel,val,3000);
  animTmr=every(1000,()=>{
    g.activeAnim.timeLeft--;
    const tEl=document.getElementById('fuel-txt');
    if(tEl)tEl.textContent=g.activeAnim.timeLeft>0?g.activeAnim.timeLeft+'s còn lại':'Hoàn tất!';
    if(g.activeAnim.timeLeft<=0){
      stopT(animTmr);
      g.fuel=val;
      const f=document.getElementById('fuel-fill'),p=document.getElementById('fuel-pct');   // make sure the gauge really shows the finished tank
      if(f)f.style.width=val+'%';if(p)p.textContent=val+'%';
      addLog('Đổ xăng +'+fillable+'%: -'+ff(cost),'cost');
      after(HOLD_MS,()=>{if(g.phase!=='anim-refuel')return;g.activeAnim=null;g.phase='game';save();render();});   // let the full tank sit on screen for a moment
    }
  });
}

// Cosmetic only: the gauge fills with a CSS transition and the percentage counts up smoothly; the real fuel is set when the timer ends.
function refuelVisual(a,b,ms){
  const t0=gnow();
  (function step(){
    if(g.phase!=='anim-refuel')return;
    const k=Math.min(1,Math.max(0,(gnow()-t0)/ms)),v=a+(b-a)*k;
    const el=document.getElementById('fuel-pct'),f=document.getElementById('fuel-fill');
    if(el)el.textContent=Math.round(v)+'%';
    if(f)f.style.width=v+'%';
    if(k<1)requestAnimationFrame(step);
  })();
}

function doSleep(){
  if(modal||g.activeAnim||g.phase!=='game')return;
  if(g.stamina>=100){toast('THỂ LỰC ĐÃ ĐẦY!');return;}
  g.activeAnim={type:'sleep'};g.phase='anim-sleep';render();
  animTmr=every(1000,()=>{
    g.stamina=Math.min(100,g.stamina+C.sleepRate);
    const bar=document.getElementById('sleep-bar');
    const txt=document.getElementById('sleep-txt');
    if(bar)bar.style.width=g.stamina+'%';
    if(txt)txt.textContent=g.stamina+'/100';
    if(g.stamina>=100){
      stopT(animTmr);
      addLog('Nghỉ ngơi đủ giấc ('+g.stamina+'/100)','info');
      const sb=document.querySelector('.anim .btn');if(sb)sb.disabled=true;
      after(HOLD_MS,()=>{if(g.phase!=='anim-sleep')return;g.activeAnim=null;g.phase='game';save();render();});
    }
  });
}
function stopSleep(){
  stopT(animTmr);
  addLog('Dừng nghỉ — thể lực: '+g.stamina+'/100','info');
  g.activeAnim=null;g.phase='game';
  save();render();
}
function askEndDay(){
  if(modal||g.activeAnim||g.phase!=='game')return;
  if(g.dayTimeLeft>90){modal={type:'confirmEnd'};render();return}   // lots of the day left: ask first
  doEndDay();
}
function startClick(fresh){
  startGame(fresh);
  let seen=false;try{seen=!!localStorage.getItem('btd_tut')}catch(e){}
  if(!seen){if(g.phase==='game'&&!modal){modal={type:'tut',i:0};render()}}
}
function tutDone(){try{localStorage.setItem('btd_tut','1')}catch(e){}modal=null;render()}
function doEndDay(){
  if(modal||g.activeAnim||g.phase!=='game')return;
  stopT(dayTmr);
  triggerDayEnd();
}

function advanceDay(){
  if(g.day<C.daysPerMonth)g.day++;
  g.dayTimeLeft=C.dayDuration;g.offers=genOffers();
  startDayTimer();render();
}

function doSave(a){
  if(g.phase!=='game'&&g.phase!=='anim-sleep')return;
  let amt=a==='all'?Math.max(0,g.cash-5e5):a;
  if(amt<=0||amt>g.cash){toast('KHÔNG ĐỦ TIỀN!','bad');return;}
  g.cash-=amt;g.savings+=amt;
  addLog('Gửi tiết kiệm: +'+ff(amt),'save');
  if(g.savings>=C.winTarget){finish(true);return;}
  const ms=checkMilestones();if(ms.length)modal={type:'milestone',list:ms};
  save();render();
}

function checkMilestones(){
  const hit=[];
  MS.forEach(m=>{if(g.savings>=m.at&&!g.ms.includes(m.at)){g.ms.push(m.at);g.cash+=m.reward;addLog('Mốc '+fm(m.at)+': thưởng '+ff(m.reward),'earn');hit.push(m)}});
  return hit;
}

function doWd(a){
  if(g.phase!=='game')return;
  let amt=a==='all'?g.savings:a;
  if(amt<=0||amt>g.savings){toast('KHÔNG ĐỦ SỐ DƯ!','bad');return;}
  g.savings-=amt;g.cash+=amt;
  addLog('Rút tiết kiệm: '+ff(amt),'info');
  save();render();
}

function goUpgrade(){if(g.phase==='game'){g.phase='upgrade';render();}}
function goGame(){if(g.phase==='upgrade'||g.phase==='profile'){g.phase='game';render();}}

function buyUpgrade(id){
  const u=UPGS.find(x=>x.id===id);
  if(!u)return;
  if(u.req&&!g.ms.includes(u.req)){toast('CHƯA MỞ KHÓA — CẦN '+fm(u.req)+' TIẾT KIỆM','warn');return;}
  if(g.upgrades[u.id]&&!u.rep){toast('BẠN ĐÃ CÓ NÂNG CẤP NÀY','warn');return;}
  if(u.rep&&g.vehicleHp>=100){toast('XE CÒN NGUYÊN VẸN, KHÔNG CẦN SỬA','warn');return;}
  if(g.cash<u.cost){toast('KHÔNG ĐỦ TIỀN!','bad');return;}
  g.cash-=u.cost;g.dailySpent+=u.cost;
  if(u.rep)g.fin.repair+=u.cost;else g.fin.upg+=u.cost;
  if(id==='fix_s'){g.vehicleHp=Math.min(100,g.vehicleHp+30);}
  else if(id==='fix_f'){g.vehicleHp=100;}
  else{
    const other=u.grp&&UPGS.find(x=>x.grp===u.grp&&x.id!==u.id&&g.upgrades[x.id]);
    if(other){delete g.upgrades[other.id];addLog(`Thay ${other.name} bằng ${u.name}`,'info');}
    g.upgrades[u.id]=true;
  }
  addLog(`Mua ${u.name}: -${ff(u.cost)}`,'cost');
  save();render();toast('ĐÃ MUA!');
}

// ===== MINI-GAME =====
let mgData=null;

function startMinigame(o,baseEarn){
  const rush=!!o.rush,limit=rush?15:C.mgTime;
  mgData={jobId:o.type,offer:o,kind:o.mg,baseEarn,limit,full:rush?9:C.mgFull,part:rush?5:C.mgPartial,
    caught:0,total:0,hits:0,passed:0,obs:[],lane:1,spawnIn:.4,flash:0,lastTs:gnow(),
    timeLeft:limit,done:false,spots:Array(9).fill(null),startTs:gnow()};
  if(o.mg==='route')rtInit(mgData);
  g.phase='minigame';render();
  if(o.mg==='route'){mgTmr=every(50,rtTick);rtLoop();return;}
  if(o.mg==='dodge'){mgTmr=every(50,dgTick);dgLoop();return;}
  mgTmr=every(80,mgTick);
  mgSpw=every(1200,mgSpawn);
  after(200,mgSpawn);
}

function mgTick(){
  if(!mgData||mgData.done)return;
  const now=gnow();
  mgData.timeLeft=Math.max(0,mgData.limit-(now-mgData.startTs)/1000);
  mgData.spots=mgData.spots.map(sp=>sp&&now-sp.ts>1350?null:sp);
  if(mgData.timeLeft<=0){mgData.done=true;stopT(mgTmr);stopT(mgSpw);showMgResult();return;}
  mgPaint();
}

// ---- third mini-game: Route Rush. Memorise the turns, then steer the bike through each junction in time ----
const RT_N=5,RT_PREVIEW=3000,RT_PENALTY=2000;
const RT_ARR={'-1':'◀','0':'▲','1':'▶'};
function genTurns(){
  let t;
  do{t=Array.from({length:RT_N},()=>rnd(-1,1))}while(new Set(t).size<2);   // never five identical turns
  return t;
}
function rtApproach(){return mgData.offer.rush?1700:isPeak()?1900:2200}   // ms to reach the junction; peak hour = more traffic = tighter
function rtInit(m){Object.assign(m,{turns:genTurns(),idx:0,mistakes:0,rtPhase:'preview',previewEnd:gnow()+RT_PREVIEW,appTs:0,rtOk:0,fb:null,fbUntil:0})}
function rtMove(d){
  const m=mgData;if(!m||m.kind!=='route'||m.done||m.rtPhase!=='drive')return;
  if(m.turns[m.idx]===d){
    m.idx++;m.fb='ok';m.fbUntil=gnow()+350;m.appTs=gnow();
    if(m.idx>=RT_N){
      m.done=true;stopT(mgTmr);
      m.timeLeft=Math.max(0,m.limit-(gnow()-m.startTs)/1000);
      m.rtOk=m.mistakes<=1?2:1;
      rtPaint();after(450,showMgResult);return;
    }
  }else rtMiss();
  rtPaint();
}
function rtMiss(){   // wrong turn or missed junction: a detour costs time and the junction comes round again
  const m=mgData;m.mistakes++;m.startTs-=RT_PENALTY;m.fb='bad';m.fbUntil=gnow()+450;m.appTs=gnow();
}
function rtTick(){
  const m=mgData;if(!m||m.done||m.kind!=='route')return;
  const now=gnow();
  if(m.rtPhase==='preview'){
    if(now>=m.previewEnd){m.rtPhase='drive';m.startTs=now;m.appTs=now}
    rtPaint();return;
  }
  m.timeLeft=Math.max(0,m.limit-(now-m.startTs)/1000);
  if(m.timeLeft<=0){m.done=true;m.rtOk=m.idx>=3?1:0;stopT(mgTmr);rtPaint();showMgResult();return}
  if(now-m.appTs>=rtApproach())rtMiss();
  rtPaint();
}
function rtStripHTML(){
  const m=mgData,gps=up('gps'),pre=m.rtPhase==='preview';
  return m.turns.map((t,i)=>{
    const done=i<m.idx,cur=i===m.idx&&!pre;
    const vis=pre||done||(gps&&i<m.idx+3);
    return`<div class="rt-slot${done?' done':''}${cur?' cur':''}">${vis?RT_ARR[t]:'?'}</div>`;
  }).join('');
}
function rtMsg(){
  const m=mgData,pre=m.rtPhase==='preview',fb=gnow()<m.fbUntil?m.fb:null;
  return pre?'GHI NHỚ ĐƯỜNG ĐI! '+Math.max(1,Math.ceil((m.previewEnd-gnow())/1000))+'s':fb==='bad'?'SAI ĐƯỜNG! -2s':fb==='ok'?'ĐÚNG!':'';
}
function rtHTML(){
  return`<div class="rt-strip" id="rt-strip">${rtStripHTML()}</div>
  <div class="rt-road" id="rt-road"><canvas id="rt-cv" width="192" height="112"></canvas><div class="rt-msg" id="rt-msg">${rtMsg()}</div></div>`;
}
// Road scene on a canvas: scrolling lane stripes, the junction ahead, the bike closing in.
function rtDraw(){
  const m=mgData,cv=document.getElementById('rt-cv');
  if(!m||!cv||m.kind!=='route')return;
  const x=cv.getContext('2d'),W=192,H=112,T=gnow(),pre=m.rtPhase==='preview';
  x.fillStyle='#0f0b26';x.fillRect(0,0,W,H);
  const off=pre?0:(T/1000*60)%24;
  x.fillStyle='#1a1440';for(let y=-24+off;y<H;y+=24)x.fillRect(0,y,W,12);
  x.fillStyle='#3a3180';for(let y=-24+off;y<H;y+=24)x.fillRect(W/2-1,y,2,12);
  // junction arrows at the top: left, straight, right
  x.fillStyle='#ffd23f';
  for(let k=0;k<9;k++){
    x.fillRect(24+k,16-k,1,k*2+1);                 // left, apex on the left
    x.fillRect(W/2-k,6+k,k*2+1,1);                 // straight, apex on top
    x.fillRect(W-24-k,16-k,1,k*2+1);               // right, apex on the right
  }
  const prog=pre?0:Math.min(1,(T-m.appTs)/rtApproach());
  const bw=56,bh=38;
  x.imageSmoothingEnabled=false;
  const im=bikeImage();if(im.complete&&im.naturalWidth)x.drawImage(im,W/2-bw/2,H-bh-4-prog*(H-bh-36),bw,bh);
}
function rtLoop(){if(!mgData||mgData.kind!=='route'||mgData.done||g.phase!=='minigame')return;rtDraw();requestAnimationFrame(rtLoop)}
function rtPaint(){
  const f=document.getElementById('rt-field');if(!f||!mgData||mgData.kind!=='route')return;
  const m=mgData,st=document.getElementById('rt-strip'),road=document.getElementById('rt-road'),msg=document.getElementById('rt-msg');
  if(st){const h=rtStripHTML();if(st.dataset.h!==h){st.innerHTML=h;st.dataset.h=h}}
  const fb=gnow()<m.fbUntil?m.fb:null;
  if(road)road.className='rt-road'+(fb?' '+fb:'');
  if(msg)msg.textContent=rtMsg();
  const s=document.getElementById('mg-score');if(s)s.textContent=m.idx+'/'+RT_N;
  const t=document.getElementById('mg-timer');if(t)t.textContent=Math.ceil(m.timeLeft)+'s';
  rtDraw();
}
document.addEventListener('keydown',e=>{
  if(!mgData||mgData.kind!=='route')return;
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){e.preventDefault();rtMove(-1)}
  else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){e.preventDefault();rtMove(1)}
  else if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){e.preventDefault();rtMove(0)}
});

// ---- second mini-game: dodge obstacles on a 3-lane road ----
const DG_ROWS=7,DG_SPEED=4.2;
function dgTick(){
  const m=mgData;if(!m||m.done||m.kind!=='dodge')return;
  const now=gnow(),dt=Math.min(.2,(now-m.lastTs)/1000);m.lastTs=now;
  m.timeLeft=Math.max(0,m.limit-(now-m.startTs)/1000);
  if(m.timeLeft<=0){m.done=true;stopT(mgTmr);showMgResult();return;}
  m.spawnIn-=dt;
  if(m.spawnIn<=0){
    m.spawnIn=.6+Math.random()*.35;
    const a=rnd(0,2);m.obs.push({lane:a,y:-1});
    if(Math.random()<.25)m.obs.push({lane:(a+rnd(1,2))%3,y:-1});   // never all three lanes at once
  }
  m.flash=Math.max(0,m.flash-dt);
  m.obs.forEach(o=>{
    o.y+=DG_SPEED*dt;
    if(!o.hit&&o.lane===m.lane&&o.y>DG_ROWS-1.6&&o.y<DG_ROWS-.2){o.hit=true;m.hits++;m.flash=.35;}
  });
  m.obs=m.obs.filter(o=>{if(o.y>=DG_ROWS){if(!o.hit)m.passed++;return false}return true});
  dgPaint();
}
// Dodge field is a <canvas> (192x256 logical pixels, lane = 64px) drawn every animation frame from the game clock.
const DG_W=192,DG_H=256;
function dgPaint(){
  const m=mgData,$=id=>document.getElementById(id);
  if(!m||!$('dg-field'))return;
  $('mg-timer').textContent=Math.ceil(m.timeLeft)+'s';
  $('mg-score').textContent='VA '+m.hits+'/3';
  $('mg-bar').style.width=Math.min(100,(1-m.timeLeft/m.limit)*100)+'%';
  dgDraw();
}
function dgDraw(){
  const m=mgData,cv=document.getElementById('dg-field');
  if(!m||!cv||m.kind!=='dodge')return;
  const x=cv.getContext('2d'),T=gnow(),ahead=GT.paused?0:Math.min(.1,(T-m.lastTs)/1000);   // smooth between logic ticks
  x.fillStyle='#0a0814';x.fillRect(0,0,DG_W,DG_H);
  // road: scrolling lane dashes
  const off=(T/1000*DG_SPEED*DG_H/DG_ROWS)%32;
  x.fillStyle='#3a3180';
  for(let k=1;k<3;k++)for(let y=-32+off;y<DG_H;y+=32)x.fillRect(k*64-1,y,2,16);
  x.fillStyle='#1a1440';x.fillRect(0,0,2,DG_H);x.fillRect(DG_W-2,0,2,DG_H);
  const ob=spriteCanvas('warn');
  m.obs.forEach(o=>{
    const y=(o.y+DG_SPEED*ahead)*DG_H/DG_ROWS;
    x.globalAlpha=o.hit?.3:1;drawSprite(x,ob,o.lane*64+16,y,32);
  });
  x.globalAlpha=1;
  drawSprite(x,avatarCanvas(g.profile.helmet),m.lane*64+16,DG_H-44,32);
  if(m.flash>0){x.fillStyle=`rgba(255,77,94,${(m.flash/.35*.35).toFixed(2)})`;x.fillRect(0,0,DG_W,DG_H)}
}
function dgLoop(){if(!mgData||mgData.kind!=='dodge'||mgData.done||g.phase!=='minigame')return;dgDraw();requestAnimationFrame(dgLoop)}
function dgMove(d){if(mgData&&mgData.kind==='dodge'&&!mgData.done){mgData.lane=Math.min(2,Math.max(0,mgData.lane+d));dgPaint()}}
function dgTap(ev){
  if(!mgData||mgData.kind!=='dodge'||mgData.done)return;
  const r=ev.currentTarget.getBoundingClientRect();
  mgData.lane=Math.min(2,Math.max(0,Math.floor((ev.clientX-r.left)/r.width*3)));dgPaint();
}
document.addEventListener('keydown',e=>{
  if(!mgData||mgData.kind!=='dodge')return;
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){e.preventDefault();dgMove(-1)}
  else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){e.preventDefault();dgMove(1)}
});

// Update only what changed, so a tap is never lost to a re-render under the finger.
function mgPaint(){
  if(!mgData||mgData.done)return;
  const $=id=>document.getElementById(id);
  if(!$('mg-grid'))return;
  const now=gnow(),pk=mgData.jobId==='food'?'bowl':'box';
  $('mg-timer').textContent=Math.ceil(mgData.timeLeft)+'s';
  $('mg-score').textContent=mgData.caught+'/'+mgData.full;
  $('mg-bar').style.width=Math.min(100,mgData.caught/mgData.full*100)+'%';
  mgData.spots.forEach((sp,i)=>{
    const el=$('mgc-'+i);if(!el)return;
    const st=!sp?'e':((now-sp.ts)/1350>.65?'u':'h');
    if(el.dataset.s===st)return;
    el.dataset.s=st;
    el.className='mg-cell'+(st==='h'?' has':st==='u'?' urg':'');
    el.innerHTML=st==='e'?'':ic(pk,56);
    el.disabled=st==='e';
  });
}

function mgSpawn(){
  if(!mgData||mgData.done)return;
  const empty=mgData.spots.map((v,i)=>[v,i]).filter(([v])=>!v).map(([,i])=>i);
  if(!empty.length)return;
  const idx=empty[rnd(0,empty.length-1)];
  mgData.spots[idx]={ts:gnow()};mgData.total++;mgPaint();
}

function catchPkg(i){
  if(!mgData||mgData.done||!mgData.spots[i])return;
  mgData.spots[i]=null;mgData.caught++;mgPaint();
}

function showMgResult(){
  const {caught,baseEarn,jobId}=mgData;
  const job=C.jobs[jobId];
  let earn,ok;
  if(mgData.kind==='dodge')ok=mgData.hits<=2?2:mgData.hits<=5?1:0;
  else if(mgData.kind==='route')ok=mgData.rtOk;
  else ok=caught>=mgData.full?2:caught>=mgData.part?1:0;
  earn=[0,Math.floor(baseEarn*.5),baseEarn][ok];
  const evt=rollEvtFor(earn),res=evt?evt.fn(earn):null;   // decided up front: a cancelled order gets no customer review
  mgData.review=res&&res.skip?null:addReview(ok,job);
  mgData.result={earn,ok,job};render();
  const rvw=mgData.review;
  after(1800,()=>afterMinigame(earn,job,rvw,{evt,res}));
}

function afterMinigame(earn,job,rvw,pre){
  const evt=pre?pre.evt:rollEvtFor(earn);
  const res=pre?pre.res:(evt?evt.fn(earn):null);
  const paid=res&&res.skip?0:earn;          // "khách hủy" means no income for this order
  g.phase='anim-deliver';
  if(res&&res.hp&&up('tire2'))res.hp=Math.round(res.hp*.6);
  const travel=Math.max(1,offerTime((mgData&&mgData.offer)||g.offers[0]))*1000;
  g.activeAnim={type:'deliver',earn:paid,job};
  render(); // Render một lần — CSS bike animation bắt đầu
  // Sau 3s: patch DOM trực tiếp, KHÔNG gọi render() để tránh reset bike animation
  after(travel,()=>{
    const statusEl=document.getElementById('anim-status');
    const earnEl=document.getElementById('anim-earn-val');
    if(statusEl){
      statusEl.textContent=res&&res.skip?'KHÁCH HỦY ĐƠN':paid>0?'GIAO THÀNH CÔNG!':'GIAO THẤT BẠI';
      statusEl.classList.add('done');
    }
    if(earnEl){earnEl.textContent=paid>0?'+'+ff(paid):'KHÔNG CÓ THU NHẬP';earnEl.style.display='block';}
    if(paid>0)burst(26,FX_COIN);
    const rv=document.getElementById('rv');
    if(rv&&rvw){rv.dataset.id=String(rvw.t0);rv.innerHTML=reviewHTML(rvw);rv.classList.add('show');}
    after(1500,()=>{
      if(paid>0){g.cash+=paid;g.earned+=paid;g.dailyEarned+=paid;g.fin.earn+=paid;}
      g.delivered++;g.totalDelivered++;
      if(evt){
        if(res.hp){
          if(res.cash)res.cash=Math.round(res.cash*(g.upgrades.insure?.4:1));
          g.vehicleHp=Math.max(0,g.vehicleHp+res.hp);
        }
        if(res.rain)g.rainToday=true;
        if(res.sta)g.stamina=Math.max(0,g.stamina+res.sta);
        if(res.cash){g.cash+=res.cash;if(res.cash>0){g.dailyEarned+=res.cash;g.fin.earn+=res.cash}else{g.dailySpent+=Math.abs(res.cash);g.fin.accident+=Math.abs(res.cash)}}
        addLog(`${evt.ti}: ${res.msg}`,evt.t==='good'?'earn':evt.t==='bad'?'cost':'info');
        modal={type:'event',evt,res};
      }
      addLog(`${job.name}: ${paid>0?'+'+ff(paid):'không có thu nhập'}`,paid>0?'earn':'cost');
      g.activeAnim=null;g.phase='game';
      mgData=null;save();
      if(g.vehicleHp<=0)toast('XE HỎNG NẶNG! CẦN SỬA NGAY!','bad');
      render();
    });
  });
}

// ===== DAY END =====
function finish(win){
  clearTmrs();modal=null;g.activeAnim=null;mgData=null;
  g.phase=win?'win':'lose';
  try{localStorage.removeItem('btd_v2');}catch(e){}
  render();
  if(win){burst(90,FX_WIN,{v:420});after(500,()=>burst(70,FX_WIN,{x:innerWidth*.25,y:innerHeight*.45}));after(900,()=>burst(70,FX_WIN,{x:innerWidth*.75,y:innerHeight*.45}))}
}

function triggerDayEnd(){
  if(g.phase==='anim-sleep'){stopT(animTmr);g.activeAnim=null;g.phase='game';addLog('Hết ngày khi đang nghỉ ngơi','info');}
  const interest=Math.floor(g.savings*C.dailyInterest);
  g.savings+=interest;
  if(g.savings>=C.winTarget){finish(true);return;}
  const ms=checkMilestones();
  modal={type:'dayEnd',earned:g.dailyEarned,spent:g.dailySpent,interest,day:g.day,ms};
  render();
}

function confirmDayEnd(){
  g.dailyEarned=0;g.dailySpent=0;g.rainToday=false;modal=null;
  if(g.day>=C.daysPerMonth){triggerMonthEnd();return;}
  advanceDay();save();
}

function monthBonus(del){
  let b=del>=200?35e5:del>=150?2e6:del>=100?1e6:0;
  if(del>=50)b+=g.stars>=4.5?1e6:g.stars>=4?5e5:0;   // good ratings pay extra
  return b;
}
function billsTotal(){return BILLS+UPGS.reduce((n,u)=>n+(u.fee&&g.upgrades[u.id]?u.fee:0),0)}
function triggerMonthEnd(){
  stopT(dayTmr);
  const bonus=monthBonus(g.delivered);
  modal={type:'monthEnd',month:g.month,earned:g.earned,bonus,del:g.delivered,stars:g.stars,bills:billsTotal()};
  render();
}

function confirmMonthEnd(){
  const {bonus}=modal;
  const bills=billsTotal();
  g.cash+=bonus;g.cash-=bills;g.fin.bills+=bills;
  if(bonus>0)addLog('Thưởng Be: +'+ff(bonus),'earn');
  addLog('Chi phí tháng '+g.month+': -'+ff(bills),'cost');
  if(g.cash<0&&g.savings>0){   // bills come out of savings before the player is declared broke
    const t=Math.min(g.savings,-g.cash);g.savings-=t;g.cash+=t;
    addLog('Rút tiết kiệm '+ff(t)+' để trả chi phí tháng','info');
  }
  if(g.cash<-2e6){finish(false);return;}
  g.month++;g.day=1;g.earned=0;g.delivered=0;
  g.dailyEarned=0;g.dailySpent=0;g.dayTimeLeft=C.dayDuration;
  modal=null;
  if(g.month>C.maxMonths){finish(g.savings>=C.winTarget);return;}
  save();startDayTimer();render();
}

function resetGame(){const p=g.profile;try{localStorage.removeItem('btd_v2');}catch(e){}init();if(p)g.profile=p;g.phase='start';render();}

// ===== TOAST =====
let _tTmr;
function toast(msg,t=''){
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=msg;el.className=(t?t+' ':'')+' show';
  clearTimeout(_tTmr);_tTmr=setTimeout(()=>el.classList.remove('show'),2500);
}

// ===== RENDER =====
function render(){
  const root=document.getElementById('root');if(!root)return;
  let h='';
  if(g.phase==='start')h=rStart();
  else if(g.phase==='minigame')h=rMG();
  else if(g.phase==='anim-deliver')h=rDeliverAnim();
  else if(g.phase==='anim-refuel')h=rRefuelAnim();
  else if(g.phase==='anim-sleep')h=rSleepAnim();
  else if(g.phase==='upgrade')h=rShop();
  else if(g.phase==='profile')h=rProfile();
  else if(g.phase==='win')h=rEnd(true);
  else if(g.phase==='lose')h=rEnd(false);
  else h=rGame();
  root.innerHTML=h+(modal?rModal():'');
  sndBtnSync();musicSync();
}


// Save when the tab is hidden or closed (canPersist() skips unsafe moments).
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});
window.addEventListener('pagehide',()=>save());

// ===== PAUSE =====
// Everything runs on the game clock (loop.js), so pausing = freezing that clock. Screens that patch the DOM directly
// (delivery / refuel / sleep animations) get a light overlay instead of a modal, because a re-render would reset them.
let pausedLight=false;
function canPause(){
  if(!g||modal||GT.paused)return false;
  return ['game','minigame','anim-deliver','anim-refuel','anim-sleep'].includes(g.phase);
}
function pauseGame(){
  if(!canPause())return;
  setPaused(true);
  if(g.phase==='game'||g.phase==='minigame'){pausedLight=false;modal={type:'pause'};render();return}
  pausedLight=true;
  const o=document.getElementById('pause-ov');
  if(o){o.innerHTML=`<div class="pxf2 modal"><div class="m-title" style="color:var(--gold)">${ic('pause',28)} TẠM DỪNG</div><div class="lbl" style="text-align:center">Thời gian đang dừng.</div><button class="btn b-gr blk" onclick="resumeGame()">TIẾP TỤC</button></div>`;o.hidden=false}
  pauseBtnSync();
}
function resumeGame(){
  if(pausedLight){
    pausedLight=false;const o=document.getElementById('pause-ov');if(o){o.hidden=true;o.innerHTML=''}
    setPaused(false);pauseBtnSync();return;
  }
  if(!modal||(modal.type!=='pause'&&!(modal.type==='settings'&&modal.from==='pause')))return;
  modal=null;setPaused(false);render();
}
function pauseBtnSync(){
  const b=document.getElementById('pause-btn');if(!b)return;
  b.hidden=!canPause();
  b.innerHTML=ic('pause',24);
}
document.addEventListener('keydown',e=>{
  if(e.key==='p'||e.key==='P'||e.key==='Escape'){
    if(pausedLight||(modal&&modal.type==='pause'))resumeGame();
    else if(modal&&modal.type==='settings'&&modal.from==='pause')closeSettings();
    else if(canPause())pauseGame();
  }
});

document.addEventListener('visibilitychange',()=>{if(document.hidden&&canPause())pauseGame()});   // switching tabs pauses the game

// ===== EFFECTS: pixel particles on a full-screen canvas (follows the game clock, so pausing freezes them) =====
const FX={ps:[],run:false,last:0};
function burst(n,colors,opt){
  const cv=document.getElementById('fx');if(!cv)return;
  opt=opt||{};
  cv.width=innerWidth;cv.height=innerHeight;
  const cx=opt.x!==undefined?opt.x:innerWidth/2,cy=opt.y!==undefined?opt.y:innerHeight*.38;
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2,v=(opt.v||260)*(.35+Math.random()*.65);
    FX.ps.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(opt.up||160),life:0,max:900+Math.random()*700,s:4+(Math.random()*2|0)*2,c:colors[i%colors.length]});
  }
  if(!FX.run){FX.run=true;FX.last=gnow();requestAnimationFrame(fxStep)}
}
function fxStep(){
  const cv=document.getElementById('fx');if(!cv){FX.run=false;FX.ps=[];return}
  const T=gnow(),dt=Math.min(50,T-FX.last);FX.last=T;
  const x=cv.getContext('2d');x.clearRect(0,0,cv.width,cv.height);
  FX.ps=FX.ps.filter(p=>p.life<p.max);
  FX.ps.forEach(p=>{
    p.life+=dt;p.vy+=900*dt/1000;p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;
    x.globalAlpha=Math.max(0,1-p.life/p.max);x.fillStyle=p.c;x.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);
  });
  x.globalAlpha=1;
  if(FX.ps.length)requestAnimationFrame(fxStep);else{FX.run=false;x.clearRect(0,0,cv.width,cv.height)}
}
const FX_COIN=['#ffd23f','#ffb000','#fff3a8'],FX_WIN=['#ffd23f','#ff4d5e','#3dff7a','#4dd2ff','#b36bff'];
