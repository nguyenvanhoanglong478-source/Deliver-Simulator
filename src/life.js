// ===== LIFE SIM: hidden difficulty, health/family/debt, choice events =====
// Difficulty is rolled at game start, never shown while playing, revealed on the win/lose screen.
const HARDS=[
  {n:'DỄ THỞ',m:.7,c:'var(--gr)'},
  {n:'BÌNH THƯỜNG',m:1,c:'var(--gold)'},
  {n:'KHẮC NGHIỆT',m:1.4,c:'var(--red)'},
];
function hardM(){return(HARDS[g.hard]||HARDS[1]).m}
function lifeDefaults(){return{hard:Math.floor(Math.random()*HARDS.length),health:100,family:60,debt:0,sickDays:0,lifeCd:0,lifeSeen:{},inv:{}}}
function lifeFix(s){   // fill / clamp life fields (older saves, repair)
  const d=lifeDefaults(),cl=(v,lo,hi,x)=>Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):x;
  s.hard=[0,1,2].includes(s.hard)?s.hard:1;
  s.health=cl(s.health,0,100,100);s.family=cl(s.family,0,100,60);s.debt=Math.round(cl(s.debt,0,1e12,0));
  s.sickDays=Math.round(cl(s.sickDays,0,30,0));s.lifeCd=Math.round(cl(s.lifeCd,0,60,0));
  if(!s.lifeSeen||typeof s.lifeSeen!=='object'||Array.isArray(s.lifeSeen))s.lifeSeen={};
  if(!s.inv||typeof s.inv!=='object'||Array.isArray(s.inv))s.inv={};
  Object.keys(s.inv).forEach(k=>{if(!Number.isFinite(s.inv[k])||s.inv[k]<0)s.inv[k]=0});
  return s;
}
function lifeBad(s){
  const p=[];
  if(![0,1,2].includes(s.hard))p.push('hard');
  ['health','family'].forEach(k=>{if(!_inR(s[k],0,100))p.push(k)});
  if(!_inR(s.debt,0,1e12))p.push('debt');
  if(!_inR(s.sickDays,0,30))p.push('sickDays');
  if(!_inR(s.lifeCd,0,60))p.push('lifeCd');
  if(!s.lifeSeen||typeof s.lifeSeen!=='object'||Array.isArray(s.lifeSeen))p.push('lifeSeen');
  if(!s.inv||typeof s.inv!=='object'||Array.isArray(s.inv)||Object.values(s.inv).some(v=>!_inR(v,0,1e12)))p.push('inv');
  return p;
}
function isSick(){return g.sickDays>0}
function lifeGain(k,d){g[k]=Math.min(100,Math.max(0,g[k]+d))}
function lifeSpend(n){g.cash-=n;g.fin.life=(g.fin.life||0)+n}

// Each event: when() gates it, p is the daily chance, choices apply their effect and return the result text.
const LIFE_EVTS=[
  {id:'cold',ic:'pill',ti:'CẢM LẠNH',
   when:()=>!isSick()&&(g.rainToday||g.health<45),p:()=>(g.rainToday?.14:.06)*hardM()*(g.health<45?1.6:1),
   text:()=>g.rainToday?'Dầm mưa cả buổi, bạn thấy người nóng ran, đầu nặng trịu.':'Chạy nhiều quá, cơ thể bắt đầu báo động: sốt, ho, mệt rã rời.',
   choices:[
    {l:'MUA THUỐC (80K)',ok:()=>g.cash>=8e4,fn:()=>{lifeSpend(8e4);g.sickDays=1;lifeGain('health',-4);return 'Uống thuốc, ngủ một giấc. Mai sẽ khá hơn, hôm nay chỉ nghỉ.'}},
    {l:'CHỊU ĐỰNG',fn:()=>{g.sickDays=Math.max(2,Math.round(2*hardM()+Math.random()));lifeGain('health',-10);return `Cố chịu không mua thuốc. Bạn nằm bẹp ${g.sickDays} ngày, không chạy xe được.`}},
   ]},
  {id:'mom',ic:'phone',ti:'MẸ GỌI TỪ QUÊ',
   when:()=>g.month>=1&&g.day>=3,p:()=>.05,
   text:()=>'Mẹ gọi: "Con ăn uống đủ chưa? Ở nhà mưa dột, mẹ đang tính sửa lại mái..."',
   choices:[
    {l:'GỬI MẸ 500K',ok:()=>g.cash>=5e5,fn:()=>{lifeSpend(5e5);lifeGain('family',12);return 'Mẹ mừng rơi nước mắt. Bạn thấy lòng nhẹ đi.'}},
    {l:'GỬI MẸ 200K',ok:()=>g.cash>=2e5,fn:()=>{lifeSpend(2e5);lifeGain('family',5);return 'Ít thôi nhưng là tấm lòng. Mẹ dặn con giữ sức khỏe.'}},
    {l:'"CON BẬN, ĐỂ SAU"',fn:()=>{lifeGain('family',-8);return 'Mẹ im lặng một chút rồi nói "ừ, con lo công việc đi".'}},
   ]},
];
function lifeNewDay(){
  if(g.sickDays>0){g.sickDays--;lifeGain('health',2);if(!g.sickDays)addLog('Đã khỏe lại, có thể chạy xe!','good');else addLog(`Còn ốm ${g.sickDays} ngày.`,'warn')}
  else lifeGain('health',3);
  if(g.lifeCd>0)g.lifeCd--;
}
// Roll at most one life event for the new day; returns true if a modal was opened.
function lifeRoll(){
  if(g.lifeCd>0||modal)return false;
  for(const e of LIFE_EVTS){
    if(e.when()&&Math.random()<e.p()){
      g.lifeCd=3;g.lifeSeen[e.id]=(g.lifeSeen[e.id]||0)+1;
      modal={type:'life',id:e.id,res:null};return true;
    }
  }
  return false;
}
function lifeEvt(){return modal&&modal.type==='life'?LIFE_EVTS.find(e=>e.id===modal.id):null}
function lifeChoose(i){
  const e=lifeEvt();if(!e||modal.res!==null)return;
  const c=e.choices[i];if(!c||(c.ok&&!c.ok()))return;
  modal.res=c.fn();addLog(e.ti+': '+modal.res.split('.')[0],'info');save();render();
}
function lifeClose(){modal=null;render()}

// ===== PHASE 2: family remittance + investments (hub modal) =====
// Investments are held as VND value per asset; each month the value moves by a random return. They are sold into savings
// automatically when the 24 months end. Savings interest (0.2%/day) stays the safe baseline.
const INVS=[
  {id:'gold',n:'VÀNG',ic:'gold',mu:.05,sd:.08,d:'Biến động vừa, hay tăng khi kinh tế xấu.'},
  {id:'stock',n:'CHỨNG KHOÁN',ic:'chart',mu:.08,sd:.25,d:'Có thể lãi lớn hoặc mất nhiều. Chơi bằng tiền nhàn rỗi.'},
];
const INV_FEE=.01;
function invOf(id){return(g.inv&&g.inv[id])||0}
function invTotal(){return INVS.reduce((n,x)=>n+invOf(x.id),0)}
function gauss(){let u=0;for(let i=0;i<6;i++)u+=Math.random();return(u-3)/.707}   // ~N(0,1)
function invMonthEnd(){
  INVS.forEach(x=>{
    const v=invOf(x.id);if(v<=0)return;
    const r=Math.max(-.6,x.mu+x.sd*gauss()*(g.hard===2?1.15:1)),nv=Math.round(v*(1+r));
    g.inv[x.id]=nv;addLog(`${x.n}: ${r>=0?'+':''}${(r*100).toFixed(1)}% (${fm(nv)})`,r>=0?'good':'warn');
  });
}
function invBuy(id,amt){
  if(g.phase!=='game'||!(amt>0)||amt>g.cash){toast('KHÔNG ĐỦ TIỀN!','bad');return}
  g.cash-=amt;g.inv[id]=invOf(id)+amt;addLog(`Mua ${INVS.find(x=>x.id===id).n}: ${ff(amt)}`,'save');save();render();
}
function invSell(id,amt){
  const v=invOf(id);if(g.phase!=='game'||v<=0)return;
  amt=amt==='all'?v:Math.min(amt,v);const fee=Math.round(amt*INV_FEE);
  g.inv[id]=v-amt;g.cash+=amt-fee;g.fin.life=(g.fin.life||0)+fee;
  addLog(`Bán ${INVS.find(x=>x.id===id).n}: +${ff(amt-fee)} (phí ${ff(fee)})`,'earn');save();render();
}
function remit(amt){
  if(g.phase!=='game'||!(amt>0)||amt>g.cash){toast('KHÔNG ĐỦ TIỀN!','bad');return}
  lifeSpend(amt);lifeGain('family',Math.round(amt/1e5*2.4));addLog(`Gửi về quê: ${ff(amt)}`,'save');save();render();
}
// monthly: family worries when nothing is sent; content family sends food and a little money
function familyMonthEnd(){
  lifeGain('family',-Math.round(6*hardM()));
  if(g.family>=70){const gift=rnd(2,4)*1e5;g.cash+=gift;addLog('Mẹ gửi đồ quê: +'+ff(gift),'earn')}
  else if(g.family<=20){lifeGain('health',-5);addLog('Lo chuyện nhà, ăn ngủ không yên: -5 sức khỏe','warn')}
}
function invLiquidate(){const t=invTotal();if(t>0){g.savings+=t;g.inv={};addLog('Bán hết đầu tư vào tiết kiệm: '+ff(t),'save')}}
function openHub(){if(modal||g.phase!=='game')return;modal={type:'hub'};render()}
