// ===== CONFIG =====
const C={
  startCash:3e6,winTarget:1e8,maxMonths:24,daysPerMonth:30,
  dayDuration:300,// 5 min
  fuelCost:150e3,fuelTime:10,sleepRate:2,// stamina/sec
  mgTime:20,mgFull:12,mgPartial:7,
  dailyInterest:0.005,
  monthly:[
    {n:'Thuê phòng trọ',c:3e6},{n:'Điện nước',c:5e5},{n:'Ăn uống',c:2e6},
    {n:'Điện thoại',c:2e5},{n:'Bảo hiểm xe',c:3e5},{n:'Trả góp xe',c:15e5},
  ],
  jobs:{
    food:{id:'food',icon:'bowl',name:'ĐỒ ĂN',earn:'45k-90k',sta:15,fuel:5,min:45e3,max:9e4},
    goods:{id:'goods',icon:'box',name:'HÀNG HÓA',earn:'90k-200k',sta:20,fuel:9,min:9e4,max:2e5},
  },
};
const BILLS=C.monthly.reduce((s,b)=>s+b.c,0);

// ===== UPGRADES =====
const UPGS=[
  {id:'tires',  name:'Lốp cao cấp',      icon:'gear',cost:15e5,desc:'Giảm 1% tiêu hao xăng/đơn',cat:'Phụ tùng',rep:false},
  {id:'heatbag',name:'Túi giữ nhiệt',    icon:'bowl',cost:8e5, desc:'+20% thu nhập đồ ăn',      cat:'Phụ tùng',rep:false},
  {id:'gps',    name:'GPS thông minh',   icon:'flag',cost:12e5,desc:'-50% kẹt xe & hủy đơn',   cat:'Phụ tùng',rep:false},
  {id:'engine', name:'Nâng cấp động cơ', icon:'bolt', cost:5e6, desc:'-3 thể lực/đơn',           cat:'Động cơ', rep:false},
  {id:'tank',   name:'Bình xăng lớn',    icon:'fuel',cost:2e6, desc:'Tiêu hao xăng -2% mỗi chuyến',       cat:'Động cơ', rep:false},
  {id:'insure', name:'Bảo hiểm mở rộng', icon:'bank',cost:2e6, desc:'-60% chi phí tai nạn',     cat:'Bảo vệ',  rep:false},
  {id:'fix_s',  name:'Sửa chữa nhẹ',    icon:'wrench',cost:5e5, desc:'+30% độ bền xe',            cat:'Sửa xe',  rep:true},
  {id:'fix_f',  name:'Đại tu toàn diện', icon:'gear',cost:2e6, desc:'Phục hồi độ bền xe 100%',          cat:'Sửa xe',  rep:true},
];

// ===== EVENTS =====
const EVTS=[
  {id:'tip',ic:'coin',t:'good',p:.07,ti:'TIP THÊM!',fn:(e)=>{const r=rnd(8e4,45e4);return{cash:r,msg:`Khách vui tính, tip ${fm(r)}`}}},
  {id:'vip',ic:'star',t:'good',p:.04,ti:'ĐƠN VIP!',fn:(e)=>{return{cash:e,msg:`VIP! Thù lao x2, thêm ${fm(e)}`}}},
  {id:'bon',ic:'trophy',t:'good',p:.02,ti:'BE THƯỞNG!',fn:(e)=>{const r=rnd(5e5,2e6);return{cash:r,msg:`Be thưởng tài xế: +${fm(r)}`}}},
  {id:'brk',ic:'wrench',t:'bad',p:.03,ti:'XE HỎNG!',fn:(e)=>{const r=rnd(4e5,14e5);return{cash:-r,hp:-20,msg:`Sửa xe khẩn: -${fm(r)}`}}},
  {id:'fin',ic:'warn',t:'bad',p:.03,ti:'BỊ PHẠT!',fn:(e)=>{const r=rnd(2e5,6e5);return{cash:-r,msg:`CSGT phạt: -${fm(r)}`}}},
  {id:'crs',ic:'warn',t:'bad',p:.02,ti:'VA CHẠM!',fn:(e)=>{const r=rnd(3e5,9e5);return{cash:-r,hp:-15,msg:`Bồi thường: -${fm(r)}`}}},
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
    stamina:100,fuel:80,vehicleHp:100,
    stars:5.0,
    dayTimeLeft:C.dayDuration,
    dailyEarned:0,dailySpent:0,
    earned:0,delivered:0,totalDelivered:0,
    upgrades:{},log:[],
    phase:'start',activeAnim:null,
    rainToday:false,
    profile:defProfile(),reviews:[],
  };
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
function rollEvt(){let r=Math.random(),c=0;for(const e of EVTS){c+=e.p;if(r<c)return e;}return null}
function clearTmrs(){clearInterval(mgTmr);clearInterval(mgSpw);clearInterval(animTmr);clearInterval(dayTmr)}
function save(){try{localStorage.setItem('btd_v2',JSON.stringify(g));}catch(e){}}
function load(){try{const s=localStorage.getItem('btd_v2');return s?JSON.parse(s):null;}catch(e){return null}}
function jobCost(job){return{sta:Math.max(5,job.sta-(g.upgrades.engine?3:0)),fuel:Math.max(1,job.fuel-(g.upgrades.tires?1:0)-(g.upgrades.tank?2:0))}}
function canDoJob(job){const c=jobCost(job);return g.stamina>=c.sta&&g.fuel>=c.fuel&&g.vehicleHp>0}
function earnMult(){return g.vehicleHp>=70?1:g.vehicleHp>=50?.85:g.vehicleHp>=30?.7:.55}
function fuelMax(){return 100}

// ===== DAY TIMER =====
function startDayTimer(){
  clearInterval(dayTmr);
  dayTmr=setInterval(()=>{
    const pause=['minigame','anim-deliver','anim-refuel'];   // sleeping uses up day time
    if(pause.includes(g.phase)||modal)return;
    g.dayTimeLeft=Math.max(0,g.dayTimeLeft-1);
    const el=document.getElementById('day-tmr');
    if(el)el.textContent=fmT(g.dayTimeLeft);
    if(g.dayTimeLeft<=0){clearInterval(dayTmr);triggerDayEnd();}
  },1000);
}
function fmT(s){const m=Math.floor(s/60);const sc=s%60;return`${m}:${sc<10?'0':''}${sc}`}

// ===== ACTIONS =====
function startGame(fresh){
  if(!fresh){const s=load();if(s&&s.phase==='game'){g=s;normalizeState();modal=null;startDayTimer();render();toast('GAME CŨ ĐÃ TẢI!');return;}}
  if(fresh){const old=load();if(old&&old.profile){g.profile=Object.assign(defProfile(),old.profile);}}
  g.phase='game';addLog('Bắt đầu hành trình!','info');
  startDayTimer();render();
}

function doDelivery(id){
  if(modal||g.activeAnim||g.phase!=='game')return;
  const job=C.jobs[id];
  const jc=jobCost(job);
  if(!canDoJob(job)){toast(g.vehicleHp<=0?'XE HỎNG QUÁ NẶNG!':g.fuel<jc.fuel?'HẾT XĂNG!':'HẾT THỂ LỰC!','bad');return;}
  const staCost=jc.sta,fuelCost=jc.fuel;
  g.stamina=Math.max(0,g.stamina-staCost);
  g.fuel=Math.max(0,g.fuel-fuelCost);
  let earn=rnd(job.min,job.max);
  if(g.rainToday)earn=Math.floor(earn*.6);
  if(id==='food'&&g.upgrades.heatbag)earn=Math.floor(earn*1.2);
  earn=Math.floor(earn*earnMult());
  startMinigame(id,earn);
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
  g.cash-=cost;g.dailySpent+=cost;
  g.activeAnim={type:'refuel',timeLeft:3,total:3,targetFuel:val,startFuel,costPaid:cost};
  g.phase='anim-refuel';
  render();
  animTmr=setInterval(()=>{
    g.activeAnim.timeLeft--;
    const pct=Math.min(1,(3-g.activeAnim.timeLeft)/3);
    const curFuel=Math.round(startFuel+(val-startFuel)*pct);
    const fEl=document.getElementById('fuel-fill'),tEl=document.getElementById('fuel-txt');
    if(fEl)fEl.style.height=curFuel+'%';
    if(tEl)tEl.textContent=g.activeAnim.timeLeft>0?g.activeAnim.timeLeft+'s còn lại · '+curFuel+'%':'Hoàn tất!';
    if(g.activeAnim.timeLeft<=0){
      clearInterval(animTmr);
      g.fuel=val;
      addLog('Đổ xăng +'+fillable+'%: -'+ff(cost),'cost');
      g.activeAnim=null;g.phase='game';save();render();
    }
  },1000);
}

function doSleep(){
  if(modal||g.activeAnim||g.phase!=='game')return;
  if(g.stamina>=100){toast('THỂ LỰC ĐÃ ĐẦY!');return;}
  g.activeAnim={type:'sleep'};g.phase='anim-sleep';render();
  animTmr=setInterval(()=>{
    g.stamina=Math.min(100,g.stamina+C.sleepRate);
    const bar=document.getElementById('sleep-bar');
    const txt=document.getElementById('sleep-txt');
    if(bar)bar.style.width=g.stamina+'%';
    if(txt)txt.textContent=g.stamina+'/100';
    if(g.stamina>=100){
      clearInterval(animTmr);
      addLog('Nghỉ ngơi đủ giấc ('+g.stamina+'/100)','info');
      g.activeAnim=null;g.phase='game';
      save();render();
    }
  },1000);
}
function stopSleep(){
  clearInterval(animTmr);
  addLog('Dừng nghỉ — thể lực: '+g.stamina+'/100','info');
  g.activeAnim=null;g.phase='game';
  save();render();
}
function doEndDay(){
  if(modal||g.activeAnim||g.phase!=='game')return;
  clearInterval(dayTmr);
  triggerDayEnd();
}

function advanceDay(){
  if(g.day<C.daysPerMonth)g.day++;
  g.dayTimeLeft=C.dayDuration;
  startDayTimer();render();
}

function doSave(a){
  if(g.phase!=='game'&&g.phase!=='anim-sleep')return;
  let amt=a==='all'?Math.max(0,g.cash-5e5):a;
  if(amt<=0||amt>g.cash){toast('KHÔNG ĐỦ TIỀN!','bad');return;}
  g.cash-=amt;g.savings+=amt;
  addLog('Gửi tiết kiệm: +'+ff(amt),'save');
  if(g.savings>=C.winTarget)g.phase='win';
  save();render();
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
  if(!u||g.cash<u.cost){toast('KHÔNG ĐỦ TIỀN!','bad');return;}
  g.cash-=u.cost;g.dailySpent+=u.cost;
  if(id==='fix_s'){g.vehicleHp=Math.min(100,g.vehicleHp+30);}
  else if(id==='fix_f'){g.vehicleHp=100;}
  else g.upgrades[id]=true;
  addLog(`Mua ${u.name}: -${ff(u.cost)}`,'cost');
  save();render();toast('ĐÃ MUA!');
}

// ===== MINI-GAME =====
let mgData=null;

function startMinigame(jobId,baseEarn){
  const pkgIcon=jobId==='food'?'':'';
  mgData={jobId,baseEarn,pkgIcon,caught:0,total:0,timeLeft:C.mgTime,done:false,spots:Array(9).fill(null),startTs:Date.now()};
  g.phase='minigame';render();
  mgTmr=setInterval(mgTick,80);
  mgSpw=setInterval(mgSpawn,1200);
  setTimeout(mgSpawn,200);
}

function mgTick(){
  if(!mgData||mgData.done)return;
  const now=Date.now();
  mgData.timeLeft=Math.max(0,C.mgTime-(now-mgData.startTs)/1000);
  mgData.spots=mgData.spots.map(sp=>sp&&now-sp.ts>1350?null:sp);
  if(mgData.timeLeft<=0){mgData.done=true;clearInterval(mgTmr);clearInterval(mgSpw);showMgResult();return;}
  mgPaint();
}
// Update only what changed, so a tap is never lost to a re-render under the finger.
function mgPaint(){
  if(!mgData||mgData.done)return;
  const $=id=>document.getElementById(id);
  if(!$('mg-grid'))return;
  const now=Date.now(),pk=mgData.jobId==='food'?'bowl':'box';
  $('mg-timer').textContent=Math.ceil(mgData.timeLeft)+'s';
  $('mg-score').textContent=mgData.caught+'/'+C.mgFull;
  $('mg-bar').style.width=Math.min(100,mgData.caught/C.mgFull*100)+'%';
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
  mgData.spots[idx]={ts:Date.now()};mgData.total++;mgPaint();
}

function catchPkg(i){
  if(!mgData||mgData.done||!mgData.spots[i])return;
  mgData.spots[i]=null;mgData.caught++;mgPaint();
}

function showMgResult(){
  const {caught,baseEarn,jobId}=mgData;
  const job=C.jobs[jobId];
  let earn,ok;
  if(caught>=C.mgFull){earn=baseEarn;ok=2;}
  else if(caught>=C.mgPartial){earn=Math.floor(baseEarn*.5);ok=1;}
  else{earn=0;ok=0;}
  mgData.review=addReview(ok,job);
  mgData.result={earn,ok,job};render();
  const rvw=mgData.review;
  setTimeout(()=>afterMinigame(earn,job,rvw),1800);
}

function afterMinigame(earn,job,rvw){
  g.phase='anim-deliver';
  g.activeAnim={type:'deliver',earn,job};
  render(); // Render một lần — CSS bike animation bắt đầu
  // Sau 3s: patch DOM trực tiếp, KHÔNG gọi render() để tránh reset bike animation
  setTimeout(()=>{
    const statusEl=document.getElementById('anim-status');
    const earnEl=document.getElementById('anim-earn-val');
    if(statusEl){statusEl.textContent='GIAO THÀNH CÔNG!';statusEl.classList.add('done');}
    if(earnEl){earnEl.textContent=earn>0?'+'+ff(earn):'THẤT BẠI';earnEl.style.display='block';}
    const rv=document.getElementById('rv');
    if(rv&&rvw){rv.dataset.id=String(rvw.t0);rv.innerHTML=reviewHTML(rvw);rv.classList.add('show');}
    setTimeout(()=>{
      if(earn>0){g.cash+=earn;g.earned+=earn;g.dailyEarned+=earn;}
      g.delivered++;g.totalDelivered++;
      const evt=rollEvt();
      if(evt){
        const res=evt.fn(earn);
        if(res.hp){
          if(res.cash)res.cash=Math.round(res.cash*(g.upgrades.insure?.4:1));
          g.vehicleHp=Math.max(0,g.vehicleHp+res.hp);
        }
        if(res.rain)g.rainToday=true;
        if(res.sta)g.stamina=Math.max(0,g.stamina+res.sta);
        if(res.cash){g.cash+=res.cash;if(res.cash>0)g.dailyEarned+=res.cash;else g.dailySpent+=Math.abs(res.cash);}
        if(!res.skip)addLog(`${evt.ti}: ${res.msg}`,evt.t==='good'?'earn':evt.t==='bad'?'cost':'info');
        modal={type:'event',evt,res};
      }
      addLog(`${job.name}: ${earn>0?'+'+ff(earn):'THẤT BẠI'}`,earn>0?'earn':'cost');
      g.activeAnim=null;g.phase='game';
      mgData=null;save();
      if(g.vehicleHp<=0)toast('XE HỎNG NẶNG! CẦN SỬA NGAY!','bad');
      render();
    },1500);
  },3000);
}

// ===== DAY END =====
function triggerDayEnd(){
  if(g.phase==='anim-sleep'){clearInterval(animTmr);g.activeAnim=null;g.phase='game';addLog('Hết ngày khi đang nghỉ ngơi','info');}
  const interest=Math.floor(g.savings*C.dailyInterest);
  g.savings+=interest;
  if(g.savings>=C.winTarget){g.phase='win';render();return;}
  modal={type:'dayEnd',earned:g.dailyEarned,spent:g.dailySpent,interest,day:g.day};
  render();
}

function confirmDayEnd(){
  g.dailyEarned=0;g.dailySpent=0;g.rainToday=false;modal=null;
  if(g.day>=C.daysPerMonth){triggerMonthEnd();return;}
  advanceDay();save();
}

function triggerMonthEnd(){
  clearInterval(dayTmr);
  let bonus=0;
  if(g.delivered>=150)bonus=3e6;else if(g.delivered>=100)bonus=15e5;else if(g.delivered>=50)bonus=5e5;
  modal={type:'monthEnd',month:g.month,earned:g.earned,bonus,del:g.delivered};
  render();
}

function confirmMonthEnd(){
  const {bonus}=modal;
  g.cash+=bonus;g.cash-=BILLS;
  if(bonus>0)addLog('Thưởng Be: +'+ff(bonus),'earn');
  addLog('Chi phí tháng '+g.month+': -'+ff(BILLS),'cost');
  if(g.cash<-2e6){g.phase='lose';modal=null;render();return;}
  g.month++;g.day=1;g.earned=0;g.delivered=0;
  g.dailyEarned=0;g.dailySpent=0;g.dayTimeLeft=C.dayDuration;
  modal=null;
  if(g.month>C.maxMonths&&g.savings<C.winTarget){g.phase='lose';}
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
}

