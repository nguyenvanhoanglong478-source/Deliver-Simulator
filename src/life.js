// ===== LIFE SIM: hidden difficulty, health/family/debt, choice events =====
// Difficulty is rolled at game start, never shown while playing, revealed on the win/lose screen.
const HARDS=[
  {n:T('DỄ THỞ','EASY GOING'),m:.7,c:'var(--gr)'},
  {n:T('BÌNH THƯỜNG','NORMAL'),m:1,c:'var(--gold)'},
  {n:T('KHẮC NGHIỆT','BRUTAL'),m:1.4,c:'var(--red)'},
];
function hardM(){return(HARDS[g.hard]||HARDS[1]).m}
function lifeDefaults(){return{hard:Math.floor(Math.random()*HARDS.length),health:100,family:60,debt:0,sickDays:0,lifeCd:0,lifeSeen:{},tickets:0,invCost:{},wasRain:false,pend:'',inv:{},drink:0,gamble:0,bjToday:0,bjLoss:0,bjNet:0,quitM:0,debtRate:0,endWhy:''}}
function lifeFix(s){   // fill / clamp life fields (older saves, repair)
  const d=lifeDefaults(),cl=(v,lo,hi,x)=>Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):x;
  s.hard=[0,1,2].includes(s.hard)?s.hard:1;
  s.health=cl(s.health,0,100,100);s.family=cl(s.family,0,100,60);s.debt=Math.round(cl(s.debt,0,1e12,0));
  s.sickDays=Math.round(cl(s.sickDays,0,30,0));s.lifeCd=Math.round(cl(s.lifeCd,0,60,0));
  if(!s.lifeSeen||typeof s.lifeSeen!=='object'||Array.isArray(s.lifeSeen))s.lifeSeen={};
  s.tickets=Math.round(cl(s.tickets,0,TICKET_MAX,0));
  if(!s.invCost||typeof s.invCost!=='object'||Array.isArray(s.invCost))s.invCost={};
  Object.keys(s.invCost).forEach(k=>{if(!Number.isFinite(s.invCost[k])||s.invCost[k]<0)s.invCost[k]=0});
  s.wasRain=!!s.wasRain;s.pend=typeof s.pend==='string'?s.pend:'';
  s.debtRate=cl(s.debtRate,0,1,0);if(!s.debt)s.debtRate=0;s.endWhy=typeof s.endWhy==='string'?s.endWhy:'';
  s.drink=cl(s.drink,0,100,0);s.gamble=cl(s.gamble,0,100,0);
  s.bjToday=Math.round(cl(s.bjToday,0,BJ_MAX,0));s.bjLoss=Math.round(cl(s.bjLoss,0,99,0));s.bjNet=Math.round(cl(s.bjNet,-1e12,1e12,0));s.quitM=Math.round(cl(s.quitM,0,99,0));
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
  if(!_inR(s.debtRate,0,1))p.push('debtRate');
  if(!_inR(s.tickets,0,TICKET_MAX))p.push('tickets');
  if(!s.invCost||typeof s.invCost!=='object'||Array.isArray(s.invCost)||Object.values(s.invCost).some(v=>!_inR(v,0,1e12)))p.push('invCost');
  ['drink','gamble'].forEach(k=>{if(!_inR(s[k],0,100))p.push(k)});
  if(!_inR(s.bjToday,0,BJ_MAX))p.push('bjToday');if(!_inR(s.bjLoss,0,99))p.push('bjLoss');if(!_inR(s.bjNet,-1e12,1e12))p.push('bjNet');
  if(!s.inv||typeof s.inv!=='object'||Array.isArray(s.inv)||Object.values(s.inv).some(v=>!_inR(v,0,1e12)))p.push('inv');
  return p;
}
const BJ_MAX=5;   // blackjack hands per day (see blackjack.js)
function isSick(){return g.sickDays>0}
function lifeGain(k,d){g[k]=Math.min(100,Math.max(0,g[k]+d))}
function lifeSpend(n){g.cash-=n;g.fin.life=(g.fin.life||0)+n}

// Each event: when() gates it, p is the daily chance, choices apply their effect and return the result text.
const LIFE_EVTS=[
  {id:'cold',ic:'pill',ti:T('CẢM LẠNH','COMMON COLD'),
   when:()=>!isSick()&&(g.wasRain||g.health<45),p:()=>(g.wasRain?.14:.06)*hardM()*(g.health<45?1.6:1),
   text:()=>g.wasRain?T('Hôm qua dầm mưa cả buổi, sáng nay bạn thấy người nóng ran, đầu nặng trịu.','You got soaked in the rain all day yesterday. This morning you feel feverish and your head is heavy.'):T('Chạy nhiều quá, cơ thể bắt đầu báo động: sốt, ho, mệt rã rời.','You have been riding too much and your body is sounding the alarm: fever, cough, total exhaustion.'),
   choices:[
    {l:T('MUA THUỐC (80K)','BUY MEDS (80K)'),ok:()=>g.cash>=8e4,fn:()=>{lifeSpend(8e4);g.sickDays=1;lifeGain('health',-4);return T('Uống thuốc, ngủ một giấc. Mai sẽ khá hơn, hôm nay chỉ nghỉ.','You take the medicine and sleep it off. Tomorrow will be better; today you just rest.')}},
    {l:T('CHỊU ĐỰNG','TOUGH IT OUT'),fn:()=>{g.sickDays=Math.max(2,Math.round(2*hardM()+Math.random()));lifeGain('health',-10);return T(`Cố chịu không mua thuốc. Bạn nằm bẹp ${g.sickDays} ngày, không chạy xe được.`,`You try to tough it out without medicine. You are stuck in bed for ${g.sickDays} days and cannot ride.`)}},
   ]},
  {id:'mom',ic:'phone',ti:T('MẸ GỌI TỪ QUÊ','MOM CALLS FROM HOME'),
   when:()=>g.month>=1&&g.day>=3,p:()=>.05,
   text:()=>T('Mẹ gọi hỏi thăm: "Con ăn uống đủ chưa? Dạo này trời trở lạnh, nhớ mặc ấm. Mẹ nhớ con lắm."','Mom calls to check on you: "Are you eating enough, son? It is getting cold, remember to dress warm. I miss you so much."'),
   choices:[
    {l:T('GỬI MẸ 500K','SEND MOM 500K'),ok:()=>g.cash>=5e5,fn:()=>{lifeSpend(5e5);lifeGain('family',12);return T('Mẹ mừng rơi nước mắt. Bạn thấy lòng nhẹ đi.','Mom is moved to tears. Your heart feels lighter.')}},
    {l:T('GỬI MẸ 200K','SEND MOM 200K'),ok:()=>g.cash>=2e5,fn:()=>{lifeSpend(2e5);lifeGain('family',5);return T('Ít thôi nhưng là tấm lòng. Mẹ dặn con giữ sức khỏe.','It is not much, but it comes from the heart. Mom tells you to look after your health.')}},
    {l:T('"CON BẬN, ĐỂ SAU"','"I\'M BUSY, LATER"'),fn:()=>{lifeGain('family',-8);return T('Mẹ im lặng một chút rồi nói "ừ, con lo công việc đi".','Mom is quiet for a moment, then says "okay, you go take care of your work".')}},
   ]},
  // --- temptations: small, optional, never the "right" answer; each yes has a visible cost ---
  {id:'friendDrink',ic:'beer',ti:T('BẠN RỦ NHẬU','FRIEND WANTS A DRINK'),
   when:()=>g.day>=4&&!isSick(),p:()=>.045*hardM()*(1+g.drink/60),
   text:()=>g.drink>=40?T('Mấy anh em cùng xóm trọ rủ: "Hôm nay làm vài chai cho đỡ mệt, bao nhiêu mà tính".','The guys from your boarding house say: "Let\'s have a few bottles tonight to shake off the tiredness, it\'s no big deal".'):T('Một người bạn cùng quê rủ sau ca: "Đi làm một ly cho vui, lên phố khổ lắm, giải sầu tí".','A friend from your village asks after your shift: "Come have a drink, life in the city is hard, let\'s drown our sorrows a bit".'),
   choices:[
    {l:T('TỪ CHỐI, VỀ NGHỈ','DECLINE, GO REST'),fn:()=>{g.drink=Math.max(0,g.drink-3);lifeGain('health',2);return T('Bạn cười trừ rồi về phòng. Ngủ sớm, sáng mai đỡ mệt hơn.','You smile it off and head to your room. An early night, and tomorrow you feel less tired.')}},
    {l:T('ĐI MỘT LY THÔI (150K)','JUST ONE (150K)'),ok:()=>g.cash>=15e4,fn:()=>{lifeSpend(15e4);g.drink=Math.min(100,g.drink+7);g.stamina=Math.max(0,g.stamina-10);return T('Một ly thành vài ly. Về trễ, người nặng nề.','One drink becomes several. You get home late, feeling heavy.')}},
    {l:T('NHẬU CHO ĐÃ (400K)','GO ALL OUT (400K)'),ok:()=>g.cash>=4e5,fn:()=>{lifeSpend(4e5);g.drink=Math.min(100,g.drink+16);lifeGain('health',-8);g.sickDays=Math.max(g.sickDays,1);return T('Sáng hôm sau đầu như búa bổ, bạn nằm bẹp cả ngày. Tiền mất, việc cũng mất.','Next morning your head is pounding and you lie in bed all day. Money gone, work gone too.')}},
   ]},
  {id:'craveDrink',ic:'beer',ti:T('THÈM MEN','CRAVING A DRINK'),
   when:()=>g.drink>=35&&!isSick(),p:()=>.03+g.drink/1500,
   text:()=>T('Tối về phòng trọ vắng, bạn thấy bứt rứt, tay cứ muốn với chai bia trong tủ lạnh.','Back in your empty room at night you feel restless, your hand keeps reaching for the beer in the fridge.'),
   choices:[
    {l:T('NHỊN, ĐI TẮM RỒI NGỦ','RESIST, SHOWER, SLEEP'),fn:()=>{g.drink=Math.max(0,g.drink-10);lifeGain('health',3);return T('Cơn thèm qua đi sau nửa tiếng. Bạn thấy nhẹ nhõm vì đã nhịn được.','The craving passes after half an hour. You feel relieved that you held out.')}},
    {l:T('UỐNG MỘT MÌNH (100K)','DRINK ALONE (100K)'),ok:()=>g.cash>=1e5,fn:()=>{lifeSpend(1e5);g.drink=Math.min(100,g.drink+6);lifeGain('health',-4);return T('Một chai rồi hai chai. Sáng dậy bạn thấy hơi hối hận.','One bottle, then two. You wake up feeling a bit of regret.')}},
   ]},
  {id:'hangover',ic:'pill',ti:T('MỆT SAU RƯỢU BIA','HANGOVER'),
   when:()=>g.drink>=45&&!isSick(),p:()=>g.drink/700*hardM(),
   text:()=>T('Thói quen uống bắt đầu đòi nợ: đau đầu, buồn nôn, tay run khi cầm lái.','The drinking habit starts to collect its debt: headache, nausea, shaky hands on the handlebars.'),
   choices:[
    {l:T('MUA THUỐC & NGHỈ (120K)','MEDS & REST (120K)'),ok:()=>g.cash>=12e4,fn:()=>{lifeSpend(12e4);g.sickDays=1;return T('Bạn nằm nghỉ một ngày, nghĩ lại chuyện uống bia.','You rest for a day and rethink the drinking.')}},
    {l:T('CỐ CHẠY XE','RIDE ANYWAY'),fn:()=>{g.sickDays=2;lifeGain('health',-8);return T('Chạy được nửa buổi thì choáng, phải tấp vào lề. Bạn nghỉ hai ngày, may chưa tai nạn.','Half a shift in you get dizzy and have to pull over. You rest two days, lucky there was no accident.')}},
   ]},
  {id:'liver',ic:'pill',ti:T('ĐI KHÁM: GAN YẾU','CHECKUP: WEAK LIVER'),
   when:()=>g.drink>=65&&g.health<55,p:()=>.05*hardM(),
   text:()=>T('Bác sĩ nhìn kết quả xét nghiệm rồi lắc đầu: "Gan anh đang quá tải. Phải bỏ rượu và nghỉ ngơi."','The doctor looks at your test results and shakes his head: "Your liver is overloaded. You must quit drinking and rest."'),
   choices:[
    {l:T('ĐIỀU TRỊ (1,5TR)','TREATMENT (1.5M)'),ok:()=>g.cash>=15e5,fn:()=>{lifeSpend(15e5);g.sickDays=3;g.drink=Math.max(0,g.drink-30);lifeGain('health',10);return T('Nằm viện vài ngày, bạn hứa với mình sẽ bỏ. Gia đình biết tin đã rất lo.','After a few days in the hospital, you promise yourself to quit. Your family was very worried when they heard.')}},
    {l:T('BỎ QUA','IGNORE IT'),fn:()=>{g.sickDays=5;lifeGain('health',-15);lifeGain('family',-6);return T('Bạn tự ý bỏ qua. Cơ thể đòi lại: năm ngày ốm liệt giường.','You ignore the advice. Your body strikes back: five days bedridden.')}},
   ]},
  {id:'friendCards',ic:'dice',ti:T('BẠN RỦ ĐÁNH BÀI','FRIEND WANTS CARDS'),
   when:()=>g.day>=6&&!isSick(),p:()=>.035*hardM()*(1+g.gamble/60),
   text:()=>T('Anh bạn quán nước vẫy tay: "Vào chơi ván cho vui, mấy trăm thôi, nhẹ nhàng!"','The guy from the tea stall waves you over: "Come play a round for fun, just a few hundred, easy!"'),
   choices:[
    {l:T('KHÔNG CHƠI','DON\'T PLAY'),fn:()=>{g.gamble=Math.max(0,g.gamble-3);return T('Bạn nói còn phải đi giao hàng. Anh bạn nhún vai, rủ người khác.','You say you still have deliveries to make. He shrugs and asks someone else.')}},
    {l:T('THỬ MỘT VÁN (100K)','ONE ROUND (100K)'),ok:()=>g.cash>=1e5,fn:()=>gamble(1e5,6)},
    {l:T('CHƠI LỚN (500K)','BET BIG (500K)'),ok:()=>g.cash>=5e5,fn:()=>gamble(5e5,13)},
   ]},
  {id:'curiousBet',ic:'phone',ti:T('TÒ MÒ ĐIỆN THOẠI','PHONE CURIOSITY'),
   when:()=>g.day>=6&&!isSick(),p:()=>.025*hardM()*(1+g.gamble/60),
   text:()=>T('Quảng cáo "trò chơi đỏ đen, thắng ngay tiền mặt" hiện lên trên điện thoại lúc chờ đơn. Bạn tò mò.','An ad for a "red-black game, win cash instantly" pops up on your phone while you wait for an order. You are curious.'),
   choices:[
    {l:T('TẮT QUẢNG CÁO','CLOSE THE AD'),fn:()=>{g.gamble=Math.max(0,g.gamble-2);return T('Bạn tắt đi, tập trung chờ đơn tiếp theo.','You close it and focus on waiting for the next order.')}},
    {l:T('THỬ NẠP 100K','TOP UP 100K'),ok:()=>g.cash>=1e5,fn:()=>gamble(1e5,7)},
   ]},
  {id:'craveBet',ic:'dice',ti:T('NGỨA TAY','ITCHY HANDS'),
   when:()=>g.gamble>=35&&!isSick(),p:()=>.03+g.gamble/1500,
   text:()=>T('Điện thoại rung. Bạn nhớ cảm giác hồi hộp lần trước, và cả số tiền đã mất. "Gỡ lại một ván thôi".','Your phone buzzes. You remember the thrill from last time, and the money you lost. "Just one round to win it back".'),
   choices:[
    {l:T('XÓA ỨNG DỤNG','DELETE THE APP'),fn:()=>{g.gamble=Math.max(0,g.gamble-12);return T('Bạn xóa app, hít một hơi. Số tiền đã mất không quay lại, nhưng sẽ không mất thêm.','You delete the app and take a deep breath. The lost money will not come back, but you will not lose more.')}},
    {l:T('GỠ LẠI (300K)','WIN IT BACK (300K)'),ok:()=>g.cash>=3e5,fn:()=>gamble(3e5,9)},
   ]},
  // --- money trouble and luck ---
  {id:'broke',ic:'bag',ti:T('HẾT TIỀN ĂN','OUT OF FOOD MONEY'),
   when:()=>g.day>=5&&g.cash<3e5&&g.savings<2e6&&invTotal()<2e6&&g.debt<2e7,p:()=>.35,
   text:()=>T('Trong túi chỉ còn lẻ tẻ, xăng cũng sắp hết. Bạn bè xung quanh cũng đều chật vật.','Only loose change left in your pocket and the fuel is nearly gone. Your friends are all struggling too.'),
   choices:[
    {l:T('MƯỢN BẠN 1TR (KHÔNG LÃI)','BORROW 1M (NO INTEREST)'),fn:()=>{borrow(1e6,0);return T('Bạn quê cho mượn, dặn bao giờ có thì trả. Bạn thấy ngại nhưng nhẹ người.','A friend from home lends it, saying pay back whenever you can. You feel embarrassed but relieved.')}},
    {l:T('VAY NÓNG 3TR (15%/THÁNG)','HOT LOAN 3M (15%/MO)'),fn:()=>{borrow(3e6,.15);return T('Tiền về tay nhanh, giấy tờ ngắn gọn. Bạn chưa kịp đọc kỹ lãi.','The money arrives fast with barely any paperwork. You did not get to read the interest terms.')}},
    {l:T('ĂN MÌ GÓI, CHỊU KHÓ','INSTANT NOODLES'),fn:()=>{g.stamina=Math.max(0,g.stamina-20);lifeGain('health',-5);return T('Ba bữa mì gói, người xanh xao. Nhưng bạn không nợ ai đồng nào.','Three meals of instant noodles, you look pale. But you owe nobody a cent.')}},
   ]},
  {id:'collector',ic:'bag',ti:T('NGƯỜI ĐÒI NỢ','DEBT COLLECTORS'),
   when:()=>g.debt>=3e6&&g.debtRate>=.15,p:()=>.07*hardM(),
   text:()=>T(`Hai người lạ chặn trước phòng trọ: "Nợ ${ff(g.debt)} rồi nhé, lãi chạy từng ngày đấy."`,`Two strangers block your boarding-house door: "You owe ${ff(g.debt)} now, and the interest runs every day."`),
   choices:[
    {l:T('TRẢ BỚT 1TR','PAY 1M NOW'),ok:()=>g.cash>=1e6,fn:()=>{repay(1e6);return T('Họ nhận tiền, hẹn tuần sau quay lại. Bạn thở ra.','They take the money and say they will be back next week. You breathe out.')}},
    {l:T('XIN KHẤT','BEG FOR TIME'),fn:()=>{g.stamina=Math.max(0,g.stamina-15);lifeGain('health',-3);lifeGain('family',-3);return T('Họ cảnh cáo rồi bỏ đi. Cả đêm bạn không ngủ được.','They warn you and leave. You cannot sleep all night.')}},
   ]},
  {id:'lotto',ic:'ticket',ti:T('BÀ BÁN VÉ SỐ','LOTTERY LADY'),
   when:()=>g.cash>=2e5,p:()=>.04,
   text:()=>T('Bà cụ bán vé số dạo năn nỉ: "Con mua giúp bà tờ vé, biết đâu lại trúng". Vé 20K một tờ.','An old street lottery seller pleads: "Buy a ticket from me, dear, you might get lucky". 20K a ticket.'),
   choices:[
    {l:T('KHÔNG MUA','DON\'T BUY'),fn:()=>T('Bạn xin lỗi bà, chúc bà bán đắt.','You apologize and wish her good sales.')},
    {l:T('MUA 1 TỜ (20K)','BUY 1 (20K)'),ok:()=>g.cash>=2e4&&g.tickets<TICKET_MAX,fn:()=>lottoBuy(1)},
    {l:T('MUA 10 TỜ (200K)','BUY 10 (200K)'),ok:()=>g.cash>=2e5&&g.tickets<=TICKET_MAX-10,fn:()=>lottoBuy(10)},
   ]},
  // --- story chain: fires once at the start of months 3, 9, 15, 21 (see STORY) ---
  {id:'roof',ic:'house',ti:T('CHUYỆN NHÀ: MÁI DỘT','HOME: LEAKY ROOF'),when:()=>false,p:()=>0,
   text:()=>T('Mẹ gọi báo mùa mưa này mái nhà dột nặng, giường ướt hết. Mẹ nói "không sao", nhưng giọng nghe rất mệt.','Mom calls to say the roof leaks badly this rainy season and the bed is soaked. She says "it\'s fine", but she sounds very tired.'),
   choices:[
    {l:T('GỬI 4TR SỬA MÁI','SEND 4M FOR ROOF'),ok:()=>g.cash>=4e6,fn:()=>{lifeSpend(4e6);lifeGain('family',25);return T('Mái nhà được lợp lại. Mẹ khóc khi gọi báo tin, bạn bảo "con lo được".','The roof gets re-tiled. Mom cries when she calls with the news, and you tell her "I can handle it".')}},
    {l:T('GỬI 1,5TR','SEND 1.5M'),ok:()=>g.cash>=15e5,fn:()=>{lifeSpend(15e5);lifeGain('family',10);return T('Đủ vá tạm chỗ dột nặng nhất. Mẹ dặn con đừng lo.','Enough to patch the worst leak. Mom tells you not to worry.')}},
    {l:T('ĐỂ SAU, CON ĐANG KHÓ','LATER, I\'M STRUGGLING'),fn:()=>{lifeGain('family',-12);return T('Mẹ nói "ừ, con lo công việc". Bạn nghe tiếng mưa bên kia đầu dây mà thấy nghẹn.','Mom says "okay, you take care of work". You hear the rain on the other end of the line and your throat tightens.')}},
   ]},
  {id:'sibling',ic:'phone',ti:T('EM ĐÓNG HỌC PHÍ','SIBLING\'S TUITION'),when:()=>false,p:()=>0,
   text:()=>T('Em gái nhắn tin: trường báo đóng học phí kỳ mới 2 triệu, em đang tính nghỉ đi làm phụ quán.','Your little sister texts: the school wants 2 million for the new term\'s tuition, and she is thinking of quitting to work at a food stall.'),
   choices:[
    {l:T('GỬI 2TR CHO EM','SEND 2M TO HER'),ok:()=>g.cash>=2e6,fn:()=>{lifeSpend(2e6);lifeGain('family',15);return T('Em nhắn lại một chữ "cảm ơn anh/chị" và hình trường lớp. Bạn nhìn mãi.','She replies with a simple "thank you" and a photo of her classroom. You stare at it for a long time.')}},
    {l:T('GỬI 800K','SEND 800K'),ok:()=>g.cash>=8e5,fn:()=>{lifeSpend(8e5);lifeGain('family',5);return T('Em nói sẽ xin hoãn phần còn lại. Bạn hứa tháng sau bù.','She says she will ask to defer the rest. You promise to cover it next month.')}},
    {l:T('"EM TỰ LO NHÉ"','"FIGURE IT OUT"'),fn:()=>{lifeGain('family',-10);return T('Em không nhắn lại. Một lúc sau bạn mới nghĩ lại câu mình vừa nói.','She does not reply. A while later you rethink what you just said.')}},
   ]},
  {id:'momSick',ic:'pill',ti:T('MẸ NHẬP VIỆN','MOM IN HOSPITAL'),when:()=>false,p:()=>0,
   text:()=>T('Cậu gọi giữa trưa: mẹ nhập viện tuyến huyện, cần ứng viện phí khoảng 6 triệu. Bạn đứng khựng giữa đường.','Your uncle calls at noon: Mom is in the district hospital and needs about 6 million for fees up front. You freeze in the middle of the road.'),
   choices:[
    {l:T('GỬI 6TR','SEND 6M'),ok:()=>g.cash>=6e6,fn:()=>{lifeSpend(6e6);lifeGain('family',30);return T('Viện phí được đóng đủ. Vài ngày sau mẹ xuất viện, gọi bảo con đừng lo.','The hospital fees are paid in full. A few days later Mom is discharged and calls to tell you not to worry.')}},
    {l:T('GỬI 3TR','SEND 3M'),ok:()=>g.cash>=3e6,fn:()=>{lifeSpend(3e6);lifeGain('family',12);return T('Cậu xoay thêm phần còn lại. Bạn nợ gia đình thêm một lần ơn.','Your uncle scrapes together the rest. You owe your family one more favor.')}},
    {l:T('VAY NÓNG 6TR GỬI VỀ','HOT LOAN 6M, SEND'),ok:()=>g.debt<=2.4e7,fn:()=>{borrow(6e6,.15);lifeSpend(6e6);lifeGain('family',30);return T('Mẹ khỏe lại, nhưng bạn giờ mang món nợ lãi cao trên vai.','Mom recovers, but now you carry a high-interest debt on your shoulders.')}},
    {l:T('KHÔNG GỬI NỔI','CAN\'T AFFORD IT'),fn:()=>{lifeGain('family',-25);lifeGain('health',-10);return T('Cậu im lặng rồi cúp máy. Bạn không ngủ nổi nhiều đêm sau đó.','Your uncle goes quiet, then hangs up. You cannot sleep for many nights after.')}},
   ]},
  {id:'friendBiz',ic:'shop',ti:T('BẠN RỦ GÓP VỐN','FRIEND WANTS INVESTORS'),when:()=>false,p:()=>0,
   text:()=>T('Người bạn cùng quê mở quán cà phê nhỏ ở khu trọ và rủ bạn góp vốn: "Chia lời theo tháng, không lo đâu". Bạn không biết quán sẽ ra sao.','A friend from home opens a small coffee shop near the boarding houses and asks you to chip in: "Profits split monthly, no worries". You have no idea how it will turn out.'),
   choices:[
    {l:T('KHÔNG GÓP','DON\'T JOIN'),fn:()=>T('Bạn nói sẽ cổ vũ bằng cách ghé uống cà phê. Bạn bè vẫn vui.','You say you will support him by dropping in for coffee. He is still happy.')},
    {l:T('GÓP 2TR','PUT IN 2M'),ok:()=>g.cash>=2e6,fn:()=>bizBet(2e6,.5)},
    {l:T('GÓP 5TR','PUT IN 5M'),ok:()=>g.cash>=5e6,fn:()=>bizBet(5e6,.45)},
   ]},
];
const STORY={3:'roof',9:'sibling',15:'momSick',21:'friendBiz'};
const CHAPTERS={
  7:{ti:T('CHƯƠNG 2: BÁM TRỤ','CHAPTER 2: HOLDING ON'),tx:T('Nửa năm đã trôi qua kể từ ngày bạn từ quê lên phố. Đường xá đã quen, khách quen cũng có. Nhưng phố không để ai yên: tiền phòng, tiền xăng, và những cuộc gọi về quê.','Half a year has passed since you left the village for the city. You know the streets now and have regular customers. But the city lets no one rest: rent, fuel, and the calls from home.')},
  13:{ti:T('CHƯƠNG 3: NGÃ RẼ','CHAPTER 3: CROSSROADS'),tx:T('Một năm. Có người bạn đã bỏ nghề, có người khá lên, có người sa vào chuyện không đâu. Bạn đang đứng ở một ngã rẽ: giữ thói quen tốt hay buông mình.','One year. Some friends have quit, some are doing better, some fell into pointless trouble. You stand at a crossroads: keep your good habits or let yourself go.')},
  19:{ti:T('CHƯƠNG 4: VỀ ĐÍCH','CHAPTER 4: THE HOME STRETCH'),tx:T('Còn sáu tháng. Con số tiết kiệm đã đủ để bạn nhìn thấy ngày về quê. Chỉ cần đừng để mệt mỏi, nợ nần hay một phút yếu lòng kéo lùi.','Six months left. Your savings are enough for you to see the day you go home. Just do not let exhaustion, debt or one weak moment pull you back.')},
};
function chapterNote(){
  const n=[];
  if(g.debt>0)n.push(T(`Bạn đang nợ ${ff(g.debt)}.`,`You owe ${ff(g.debt)}.`));
  if(g.health<40)n.push(T('Sức khỏe bạn đang yếu.','Your health is poor.'));
  if(g.family<30)n.push(T('Gia đình đang rất lo cho bạn.','Your family is very worried about you.'));
  else if(g.family>=70)n.push(T('Mẹ luôn yên tâm về bạn.','Mom never worries about you.'));
  if(g.drink>=40||g.gamble>=40)n.push(T('Có những thói quen bạn biết là cần bớt.','There are habits you know you should cut back on.'));
  if(g.savings>=C.winTarget*.5)n.push(T('Tiết kiệm đã được một nửa chặng đường.','Your savings are halfway there.'));
  return n.join(' ');
}
function bizBet(amt,p){
  lifeSpend(amt);
  if(Math.random()<p){const back=Math.round(amt*1.7);g.cash+=back;g.fin.life=Math.max(0,(g.fin.life||0)-back);return T(`Quán đông khách, chia lời đều đặn: bạn nhận lại ${ff(back)}.`,`The shop is busy and profits are shared steadily: you get back ${ff(back)}.`)}
  return T('Quán vắng khách rồi đóng cửa sau vài tháng. Số vốn góp coi như mất. Bạn bè xin lỗi rối rít.','The shop stays empty and closes after a few months. Your investment is as good as gone. Your friend apologizes endlessly.');
}
// Ending text for the win/lose screen: depends on how the player lived, not only on the money.
function endingInfo(win){
  if(win){
    if(g.drink>=50||g.gamble>=50)return{t:T('ĐẾN ĐÍCH, NHƯNG THÓI QUEN CÒN BÁM','MADE IT, BUT HABITS REMAIN'),l:T('Bạn đã có đủ tiền, nhưng những thói quen cũ vẫn theo bạn về quê.','You have enough money, but your old habits follow you home.')};
    if(g.health<40)return{t:T('ĐẾN ĐÍCH TRONG KIỆT SỨC','MADE IT, EXHAUSTED'),l:T('Bạn đạt mục tiêu, cơ thể thì đã trả giá đắt. Giờ là lúc nghỉ ngơi.','You reached your goal, but your body paid a steep price. Now it is time to rest.')};
    if(g.family<30)return{t:T('GIÀU HƠN, XA NHÀ HƠN','RICHER, FARTHER FROM HOME'),l:T('Số tiền có rồi, nhưng quê nhà đã xa hơn bạn tưởng. Hãy gọi về cho mẹ.','You have the money, but home has drifted farther than you thought. Call Mom.')};
    if(g.family>=70&&g.health>=70)return{t:T('VỀ QUÊ VẸN TOÀN','HOME, SAFE AND SOUND'),l:T('Bạn về quê với tiền tiết kiệm, sức khỏe tốt và nụ cười của mẹ ở cổng nhà.','You go home with your savings, good health, and Mom\'s smile at the gate.')};
    return{t:T('HOÀN THÀNH MỤC TIÊU','GOAL REACHED'),l:T('Hai năm vất vả đã đổi lấy một khoản tiết kiệm xứng đáng.','Two hard years have earned you a worthy nest egg.')};
  }
  if(g.endWhy==='debt')return{t:T('NỢ NẦN SIẾT CỔ','CHOKED BY DEBT'),l:T('Lãi mẹ đẻ lãi con, chủ nợ đến tận cửa. Lần sau, hãy tránh xa vay nóng.','Interest piles on interest and the lenders come to your door. Next time, stay away from hot loans.')};
  if(g.month<=C.maxMonths)return{t:T('HẾT VỐN NƠI PHỐ','BROKE IN THE CITY'),l:T('Bạn hết tiền trước khi kịp đứng vững. Bài học: giữ lại một khoản dự phòng.','You ran out of money before you could find your feet. Lesson: keep some money in reserve.')};
  const r=g.savings/C.winTarget;
  if(r>=.7)return{t:T('THIẾU MỘT CHÚT','JUST SHORT'),l:T('Bạn chỉ còn cách đích một đoạn ngắn. Phố vẫn còn đó, thử lại nhé.','You were only a short way from the goal. The city is still there, try again.')};
  if(g.family<30)return{t:T('LẠC NHỊP','OUT OF STEP'),l:T('Bạn tiết kiệm được ít và cũng xa gia đình. Có lẽ đã đến lúc về nhà.','You saved little and grew distant from your family. Maybe it is time to go home.')};
  return{t:T('CHƯA ĐỦ SỨC','NOT ENOUGH YET'),l:T('Hai năm trôi qua nhanh hơn bạn nghĩ. Hãy thử cách khác: ít chi tiêu lặt vặt, nhiều đơn hợp lý.','Two years passed faster than you thought. Try another way: fewer small expenses, more sensible orders.')};
}
function borrow(amt,rate){
  g.cash+=amt;g.debt+=amt;g.debtRate=Math.max(g.debtRate,rate);addLog(T('Vay ','Borrowed ')+ff(amt)+(rate?T(` (lãi ${Math.round(rate*100)}%/tháng)`,` (${Math.round(rate*100)}%/month interest)`):T(' (không lãi)',' (no interest)')),'warn');
}
function repay(amt){
  amt=Math.min(amt,g.debt,Math.max(0,g.cash));if(amt<=0)return;
  g.cash-=amt;g.debt-=amt;if(g.debt<=0){g.debt=0;g.debtRate=0}addLog(T('Trả nợ ','Repaid debt ')+ff(amt),'save');
  if(g.phase==='game'&&netWin()){modal=null;finish(true)}
}
// Lottery: expected return a little under the ticket price, rare big prizes (drawn per ticket).
const TICKET=2e4,TICKET_MAX=40;
// Tickets are bought during the day and drawn at the end of the day (see lottoDraw, called from triggerDayEnd).
function lottoBuy(n){
  n=Math.min(n,TICKET_MAX-g.tickets);if(n<=0)return T('Hôm nay bạn đã mua đủ số vé tối đa rồi.','You have already bought the maximum number of tickets today.');
  if(g.cash<n*TICKET)return T('Không đủ tiền mua vé.','Not enough money for tickets.');
  lifeSpend(n*TICKET);g.tickets+=n;if(n>=10)g.gamble=Math.min(100,g.gamble+2);
  return T(`Bạn cất ${n} tờ vé vào túi. Tối nay sẽ có kết quả xổ số.`,`You tuck ${n} tickets into your pocket. The lottery draw is tonight.`);
}
function lottoDraw(){
  const n=g.tickets;let prize=0,best=0;
  for(let i=0;i<n;i++){const r=Math.random();const p=r<.0005?1e7:r<.0085?1e6:r<.0685?1e5:0;prize+=p;best=Math.max(best,p)}
  g.tickets=0;
  if(prize){g.cash+=prize;g.fin.life=Math.max(0,(g.fin.life||0)-prize)}
  return{n,prize,best,cost:n*TICKET};
}
// Gambling: a first small win ("beginner's luck") hooks, afterwards the house wins more often. Hard mode tilts it further.
function gamble(stake,hook){
  const first=!g.lifeSeen.won;g.gamble=Math.min(100,g.gamble+hook);
  const pWin=first?1:Math.max(.25,.42-g.gamble/400-(g.hard===2?.04:0));
  if(Math.random()<pWin){const w=Math.round(stake*1.8);g.cash+=w-stake;g.lifeSeen.won=1;return first?T(`Bạn thắng ${ff(w-stake)}! Tim đập thình thịch... và muốn chơi thêm.`,`You win ${ff(w-stake)}! Your heart pounds... and you want to play more.`):T(`Lần này bạn thắng ${ff(w-stake)}.`,`You win ${ff(w-stake)} this time.`)}
  lifeSpend(stake);return T(`Thua sạch ${ff(stake)}. Bạn thấy cay, nhưng cũng thấy mình dại.`,`Lost all ${ff(stake)}. You feel bitter, and a little foolish.`);
}
function lifeNewDay(){
  if(g.sickDays>0){g.sickDays--;lifeGain('health',2);if(!g.sickDays)addLog(T('Đã khỏe lại, có thể chạy xe!','Feeling better, you can ride again!'),'good');else addLog(T(`Còn ốm ${g.sickDays} ngày.`,`${g.sickDays} more sick days.`),'warn')}
  else lifeGain('health',3);
  if(g.lifeCd>0)g.lifeCd--;
  g.bjToday=0;g.bjLoss=0;
  if(Math.random()<.5)g.drink=Math.max(0,g.drink-1);if(Math.random()<.5)g.gamble=Math.max(0,g.gamble-1);
}
// Roll at most one life event for the new day; returns true if a modal was opened.
function lifeRoll(){
  if(modal)return false;
  if(g.day===1){
    const sid=STORY[g.month],k='s'+g.month;
    if(sid&&!g.lifeSeen[k]){g.pend=sid;modal={type:'life',id:sid,res:null};return true}
    if(CHAPTERS[g.month]&&!g.lifeSeen['c'+g.month]){modal={type:'chapter',n:g.month};return true}
  }
  if(g.lifeCd>0)return false;
  const order=LIFE_EVTS.map(e=>[Math.random(),e]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  for(const e of order){
    if(e.when()&&Math.random()<e.p()){
      g.lifeCd=3;g.lifeSeen[e.id]=(g.lifeSeen[e.id]||0)+1;
      g.pend=e.id;modal={type:'life',id:e.id,res:null};return true;
    }
  }
  return false;
}
// a reload while an event is open brings the same event back (no dodging a bad event by refreshing)
function lifeResume(){if(g.pend&&LIFE_EVTS.some(e=>e.id===g.pend))modal={type:'life',id:g.pend,res:null};else g.pend=''}
function lifeEvt(){return modal&&modal.type==='life'?LIFE_EVTS.find(e=>e.id===modal.id):null}
function lifeChoose(i){
  const e=lifeEvt();if(!e||modal.res!==null)return;
  const c=e.choices[i];if(!c||(c.ok&&!c.ok()))return;
  g.pend='';if(STORY[g.month]===e.id)g.lifeSeen['s'+g.month]=1;
  modal.res=c.fn();addLog(e.ti+': '+modal.res.split('.')[0],'info');save();render();
}
function lifeClose(){modal=null;render()}

// ===== PHASE 2: family remittance + investments (hub modal) =====
// Investments are held as VND value per asset; each month the value moves by a random return. They are sold into savings
// automatically when the 24 months end. Savings interest (0.2%/day) stays the safe baseline.
const INVS=[
  {id:'gold',n:T('VÀNG','GOLD'),ic:'gold',mu:.05,sd:.08,d:T('Biến động vừa, hay tăng khi kinh tế xấu.','Moderate swings, often rises when the economy is bad.')},
  {id:'stock',n:T('CHỨNG KHOÁN','STOCKS'),ic:'chart',mu:.08,sd:.25,d:T('Có thể lãi lớn hoặc mất nhiều. Chơi bằng tiền nhàn rỗi.','Can gain big or lose a lot. Use spare money only.')},
];
const INV_FEE=.01;
function invOf(id){return(g.inv&&g.inv[id])||0}
function invTotal(){return INVS.reduce((n,x)=>n+invOf(x.id),0)}
function gauss(){let u=0;for(let i=0;i<6;i++)u+=Math.random();return(u-3)/.707}   // ~N(0,1)
// Prices move every day; returns one row per held asset for the end-of-day summary (change %, VND change, value, profit vs cost).
function invDayEnd(){
  const rows=[];
  INVS.forEach(x=>{
    const v=invOf(x.id);if(v<=0)return;
    const r=Math.max(-.25,x.mu/30+x.sd/Math.sqrt(30)*gauss()*(g.hard===2?1.15:1)),nv=Math.round(v*(1+r));
    g.inv[x.id]=nv;rows.push({id:x.id,n:x.n,ic:x.ic,pct:r*100,delta:nv-v,val:nv,pl:nv-(g.invCost[x.id]||0)});
  });
  return rows;
}
function invBuy(id,amt){
  if(g.phase!=='game'||!(amt>0)||amt>g.cash){toast(T('KHÔNG ĐỦ TIỀN!','NOT ENOUGH MONEY!'),'bad');return}
  g.cash-=amt;g.inv[id]=invOf(id)+amt;g.invCost[id]=(g.invCost[id]||0)+amt;addLog(T(`Mua ${INVS.find(x=>x.id===id).n}: ${ff(amt)}`,`Bought ${INVS.find(x=>x.id===id).n}: ${ff(amt)}`),'save');save();render();
}
function invSell(id,amt){
  const v=invOf(id);if(g.phase!=='game'||v<=0)return;
  amt=amt==='all'?v:Math.min(amt,v);const fee=Math.round(amt*INV_FEE);
  g.invCost[id]=Math.round((g.invCost[id]||0)*(v-amt)/v);g.inv[id]=v-amt;g.cash+=amt-fee;g.fin.life=(g.fin.life||0)+fee;
  addLog(T(`Bán ${INVS.find(x=>x.id===id).n}: +${ff(amt-fee)} (phí ${ff(fee)})`,`Sold ${INVS.find(x=>x.id===id).n}: +${ff(amt-fee)} (fee ${ff(fee)})`),'earn');save();render();
}
function remit(amt){
  if(g.phase!=='game'||!(amt>0)||amt>g.cash){toast(T('KHÔNG ĐỦ TIỀN!','NOT ENOUGH MONEY!'),'bad');return}
  lifeSpend(amt);lifeGain('family',Math.round(amt/1e5*2.4));addLog(T(`Gửi về quê: ${ff(amt)}`,`Sent home: ${ff(amt)}`),'save');save();render();
}
// monthly: family worries when nothing is sent; content family sends food and a little money
function debtMonthEnd(){
  if(g.debt<=0)return;
  const add=Math.round(g.debt*g.debtRate);if(add>0){g.debt+=add;g.fin.loan=(g.fin.loan||0)+add;addLog(T('Lãi vay tháng này: +','Loan interest this month: +')+ff(add),'warn')}
  if(g.debt>=3e7){g.endWhy='debt'}
}
function familyMonthEnd(){
  lifeGain('family',-Math.round(6*hardM()));
  if(g.drink>=50){lifeGain('family',-4);addLog(T('Người nhà nghe tin bạn hay nhậu: -4 gia đình','Family heard you drink a lot: -4 family'),'warn')}
  if(g.gamble>=50){lifeGain('family',-4);addLog(T('Người nhà nghe tin bạn hay cá cược: -4 gia đình','Family heard you gamble a lot: -4 family'),'warn')}
  if(g.family>=70){const gift=rnd(2,4)*1e5;g.cash+=gift;addLog(T('Mẹ gửi đồ quê: +','Mom sent country goods: +')+ff(gift),'earn')}
  else if(g.family<=20){lifeGain('health',-5);addLog(T('Lo chuyện nhà, ăn ngủ không yên: -5 sức khỏe','Worrying about home, eating and sleeping badly: -5 health'),'warn')}
}
function netWin(){return g.debt===0&&g.savings>=C.winTarget}
function invLiquidate(){const t=invTotal();if(t>0){g.savings+=t;g.inv={};g.invCost={};addLog(T('Bán hết đầu tư vào tiết kiệm: ','Sold all investments into savings: ')+ff(t),'save')}}
function quitHabits(){
  if(g.phase!=='game'||g.quitM===g.month||(g.drink<=0&&g.gamble<=0))return;
  g.quitM=g.month;g.drink=Math.max(0,g.drink-15);g.gamble=Math.max(0,g.gamble-15);lifeGain('family',2);addLog(T('Bạn tự nhủ phải bớt lại.','You tell yourself to cut back.'),'good');save();render();
}
function takeLoan(k){
  if(g.phase!=='game'||g.debt>=2e7)return;
  if(k==='hot')borrow(3e6,.15);else{borrow(5e6,.25);g.cash-=5e5;addLog(T('Phí làm hồ sơ vay: -500K','Loan processing fee: -500K'),'cost')}save();render();
}
function openHub(){if(modal||g.phase!=='game')return;modal={type:'hub'};render()}
function lottoHub(n){
  if(g.phase!=='game')return;
  const t=lottoBuy(n);toast(t.startsWith(T('Bạn cất','You tuck'))?T(`ĐÃ MUA ${n} TỜ VÉ SỐ`,`BOUGHT ${n} LOTTERY TICKETS`):t.toUpperCase(),t.startsWith(T('Bạn cất','You tuck'))?'':'bad');save();render();
}
