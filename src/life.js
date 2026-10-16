// ===== LIFE SIM: hidden difficulty, health/family/debt, choice events =====
// Difficulty is rolled at game start, never shown while playing, revealed on the win/lose screen.
const HARDS=[
  {n:'DỄ THỞ',m:.7,c:'var(--gr)'},
  {n:'BÌNH THƯỜNG',m:1,c:'var(--gold)'},
  {n:'KHẮC NGHIỆT',m:1.4,c:'var(--red)'},
];
function hardM(){return(HARDS[g.hard]||HARDS[1]).m}
function lifeDefaults(){return{hard:Math.floor(Math.random()*HARDS.length),health:100,family:60,debt:0,sickDays:0,lifeCd:0,lifeSeen:{},inv:{},drink:0,gamble:0,quitM:0}}
function lifeFix(s){   // fill / clamp life fields (older saves, repair)
  const d=lifeDefaults(),cl=(v,lo,hi,x)=>Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):x;
  s.hard=[0,1,2].includes(s.hard)?s.hard:1;
  s.health=cl(s.health,0,100,100);s.family=cl(s.family,0,100,60);s.debt=Math.round(cl(s.debt,0,1e12,0));
  s.sickDays=Math.round(cl(s.sickDays,0,30,0));s.lifeCd=Math.round(cl(s.lifeCd,0,60,0));
  if(!s.lifeSeen||typeof s.lifeSeen!=='object'||Array.isArray(s.lifeSeen))s.lifeSeen={};
  s.drink=cl(s.drink,0,100,0);s.gamble=cl(s.gamble,0,100,0);s.quitM=Math.round(cl(s.quitM,0,99,0));
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
  ['drink','gamble'].forEach(k=>{if(!_inR(s[k],0,100))p.push(k)});
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
  // --- temptations: small, optional, never the "right" answer; each yes has a visible cost ---
  {id:'friendDrink',ic:'beer',ti:'BẠN RỦ NHẬU',
   when:()=>g.day>=4&&!isSick(),p:()=>.045*hardM()*(1+g.drink/60),
   text:()=>g.drink>=40?'Mấy anh em cùng xóm trọ rủ: "Hôm nay làm vài chai cho đỡ mệt, bao nhiêu mà tính".':'Một người bạn cùng quê rủ sau ca: "Đi làm một ly cho vui, lên phố khổ lắm, giải sầu tí".',
   choices:[
    {l:'TỪ CHỐI, VỀ NGHỈ',fn:()=>{g.drink=Math.max(0,g.drink-3);lifeGain('health',2);return 'Bạn cười trừ rồi về phòng. Ngủ sớm, sáng mai đỡ mệt hơn.'}},
    {l:'ĐI MỘT LY THÔI (150K)',ok:()=>g.cash>=15e4,fn:()=>{lifeSpend(15e4);g.drink=Math.min(100,g.drink+7);g.stamina=Math.max(0,g.stamina-10);return 'Một ly thành vài ly. Về trễ, người nặng nề.'}},
    {l:'NHẬU CHO ĐÃ (400K)',ok:()=>g.cash>=4e5,fn:()=>{lifeSpend(4e5);g.drink=Math.min(100,g.drink+16);lifeGain('health',-8);g.sickDays=Math.max(g.sickDays,1);return 'Sáng hôm sau đầu như búa bổ, bạn nằm bẹp cả ngày. Tiền mất, việc cũng mất.'}},
   ]},
  {id:'craveDrink',ic:'beer',ti:'THÈM MEN',
   when:()=>g.drink>=35&&!isSick(),p:()=>.03+g.drink/1500,
   text:()=>'Tối về phòng trọ vắng, bạn thấy bứt rứt, tay cứ muốn với chai bia trong tủ lạnh.',
   choices:[
    {l:'NHỊN, ĐI TẮM RỒI NGỦ',fn:()=>{g.drink=Math.max(0,g.drink-10);lifeGain('health',3);return 'Cơn thèm qua đi sau nửa tiếng. Bạn thấy nhẹ nhõm vì đã nhịn được.'}},
    {l:'UỐNG MỘT MÌNH (100K)',ok:()=>g.cash>=1e5,fn:()=>{lifeSpend(1e5);g.drink=Math.min(100,g.drink+6);lifeGain('health',-4);return 'Một chai rồi hai chai. Sáng dậy bạn thấy hơi hối hận.'}},
   ]},
  {id:'hangover',ic:'pill',ti:'MỆT SAU RƯỢU BIA',
   when:()=>g.drink>=45&&!isSick(),p:()=>g.drink/700*hardM(),
   text:()=>'Thói quen uống bắt đầu đòi nợ: đau đầu, buồn nôn, tay run khi cầm lái.',
   choices:[
    {l:'MUA THUỐC & NGHỈ (120K)',ok:()=>g.cash>=12e4,fn:()=>{lifeSpend(12e4);g.sickDays=1;return 'Bạn nằm nghỉ một ngày, nghĩ lại chuyện uống bia.'}},
    {l:'CỐ CHẠY XE',fn:()=>{g.sickDays=2;lifeGain('health',-8);return 'Chạy được nửa buổi thì choáng, phải tấp vào lề. Bạn nghỉ hai ngày, may chưa tai nạn.'}},
   ]},
  {id:'liver',ic:'pill',ti:'ĐI KHÁM: GAN YẾU',
   when:()=>g.drink>=65&&g.health<55,p:()=>.05*hardM(),
   text:()=>'Bác sĩ nhìn kết quả xét nghiệm rồi lắc đầu: "Gan anh đang quá tải. Phải bỏ rượu và nghỉ ngơi."',
   choices:[
    {l:'ĐIỀU TRỊ (1,5TR)',ok:()=>g.cash>=15e5,fn:()=>{lifeSpend(15e5);g.sickDays=3;g.drink=Math.max(0,g.drink-30);lifeGain('health',10);return 'Nằm viện vài ngày, bạn hứa với mình sẽ bỏ. Gia đình biết tin đã rất lo.'}},
    {l:'BỎ QUA',fn:()=>{g.sickDays=5;lifeGain('health',-15);lifeGain('family',-6);return 'Bạn tự ý bỏ qua. Cơ thể đòi lại: năm ngày ốm liệt giường.'}},
   ]},
  {id:'friendCards',ic:'dice',ti:'BẠN RỦ ĐÁNH BÀI',
   when:()=>g.day>=6&&!isSick(),p:()=>.035*hardM()*(1+g.gamble/60),
   text:()=>'Anh bạn quán nước vẫy tay: "Vào chơi ván cho vui, mấy trăm thôi, nhẹ nhàng!"',
   choices:[
    {l:'KHÔNG CHƠI',fn:()=>{g.gamble=Math.max(0,g.gamble-3);return 'Bạn nói còn phải đi giao hàng. Anh bạn nhún vai, rủ người khác.'}},
    {l:'THỬ MỘT VÁN (100K)',ok:()=>g.cash>=1e5,fn:()=>gamble(1e5,6)},
    {l:'CHƠI LỚN (500K)',ok:()=>g.cash>=5e5,fn:()=>gamble(5e5,13)},
   ]},
  {id:'curiousBet',ic:'phone',ti:'TÒ MÒ ĐIỆN THOẠI',
   when:()=>g.day>=6&&!isSick(),p:()=>.025*hardM()*(1+g.gamble/60),
   text:()=>'Quảng cáo "trò chơi đỏ đen, thắng ngay tiền mặt" hiện lên trên điện thoại lúc chờ đơn. Bạn tò mò.',
   choices:[
    {l:'TẮT QUẢNG CÁO',fn:()=>{g.gamble=Math.max(0,g.gamble-2);return 'Bạn tắt đi, tập trung chờ đơn tiếp theo.'}},
    {l:'THỬ NẠP 100K',ok:()=>g.cash>=1e5,fn:()=>gamble(1e5,7)},
   ]},
  {id:'craveBet',ic:'dice',ti:'NGỨA TAY',
   when:()=>g.gamble>=35&&!isSick(),p:()=>.03+g.gamble/1500,
   text:()=>'Điện thoại rung. Bạn nhớ cảm giác hồi hộp lần trước, và cả số tiền đã mất. "Gỡ lại một ván thôi".',
   choices:[
    {l:'XÓA ỨNG DỤNG',fn:()=>{g.gamble=Math.max(0,g.gamble-12);return 'Bạn xóa app, hít một hơi. Số tiền đã mất không quay lại, nhưng sẽ không mất thêm.'}},
    {l:'GỠ LẠI (300K)',ok:()=>g.cash>=3e5,fn:()=>gamble(3e5,9)},
   ]},
];
// Gambling: a first small win ("beginner's luck") hooks, afterwards the house wins more often. Hard mode tilts it further.
function gamble(stake,hook){
  const first=!g.lifeSeen.won;g.gamble=Math.min(100,g.gamble+hook);
  const pWin=first?1:Math.max(.25,.42-g.gamble/400-(g.hard===2?.04:0));
  if(Math.random()<pWin){const w=Math.round(stake*1.8);g.cash+=w-stake;g.lifeSeen.won=1;return first?`Bạn thắng ${ff(w-stake)}! Tim đập thình thịch... và muốn chơi thêm.`:`Lần này bạn thắng ${ff(w-stake)}.`}
  lifeSpend(stake);return `Thua sạch ${ff(stake)}. Bạn thấy cay, nhưng cũng thấy mình dại.`;
}
function lifeNewDay(){
  if(g.sickDays>0){g.sickDays--;lifeGain('health',2);if(!g.sickDays)addLog('Đã khỏe lại, có thể chạy xe!','good');else addLog(`Còn ốm ${g.sickDays} ngày.`,'warn')}
  else lifeGain('health',3);
  if(g.lifeCd>0)g.lifeCd--;
  if(Math.random()<.5)g.drink=Math.max(0,g.drink-1);if(Math.random()<.5)g.gamble=Math.max(0,g.gamble-1);
}
// Roll at most one life event for the new day; returns true if a modal was opened.
function lifeRoll(){
  if(g.lifeCd>0||modal)return false;
  const order=LIFE_EVTS.map(e=>[Math.random(),e]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  for(const e of order){
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
  if(g.drink>=50){lifeGain('family',-4);addLog('Người nhà nghe tin bạn hay nhậu: -4 gia đình','warn')}
  if(g.gamble>=50){lifeGain('family',-4);addLog('Người nhà nghe tin bạn hay cá cược: -4 gia đình','warn')}
  if(g.family>=70){const gift=rnd(2,4)*1e5;g.cash+=gift;addLog('Mẹ gửi đồ quê: +'+ff(gift),'earn')}
  else if(g.family<=20){lifeGain('health',-5);addLog('Lo chuyện nhà, ăn ngủ không yên: -5 sức khỏe','warn')}
}
function invLiquidate(){const t=invTotal();if(t>0){g.savings+=t;g.inv={};addLog('Bán hết đầu tư vào tiết kiệm: '+ff(t),'save')}}
function quitHabits(){
  if(g.phase!=='game'||g.quitM===g.month||(g.drink<=0&&g.gamble<=0))return;
  g.quitM=g.month;g.drink=Math.max(0,g.drink-15);g.gamble=Math.max(0,g.gamble-15);lifeGain('family',2);addLog('Bạn tự nhủ phải bớt lại.','good');save();render();
}
function openHub(){if(modal||g.phase!=='game')return;modal={type:'hub'};render()}
