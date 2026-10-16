// ===== LIFE SIM: hidden difficulty, health/family/debt, choice events =====
// Difficulty is rolled at game start, never shown while playing, revealed on the win/lose screen.
const HARDS=[
  {n:'DỄ THỞ',m:.7,c:'var(--gr)'},
  {n:'BÌNH THƯỜNG',m:1,c:'var(--gold)'},
  {n:'KHẮC NGHIỆT',m:1.4,c:'var(--red)'},
];
function hardM(){return(HARDS[g.hard]||HARDS[1]).m}
function lifeDefaults(){return{hard:Math.floor(Math.random()*HARDS.length),health:100,family:60,debt:0,sickDays:0,lifeCd:0,lifeSeen:{}}}
function lifeFix(s){   // fill / clamp life fields (older saves, repair)
  const d=lifeDefaults(),cl=(v,lo,hi,x)=>Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):x;
  s.hard=[0,1,2].includes(s.hard)?s.hard:1;
  s.health=cl(s.health,0,100,100);s.family=cl(s.family,0,100,60);s.debt=Math.round(cl(s.debt,0,1e12,0));
  s.sickDays=Math.round(cl(s.sickDays,0,30,0));s.lifeCd=Math.round(cl(s.lifeCd,0,60,0));
  if(!s.lifeSeen||typeof s.lifeSeen!=='object'||Array.isArray(s.lifeSeen))s.lifeSeen={};
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
