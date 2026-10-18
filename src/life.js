// ===== LIFE SIM: hidden difficulty, health/family/debt, choice events =====
// Difficulty is rolled at game start, never shown while playing, revealed on the win/lose screen.
const HARDS=[
  {n:'DỄ THỞ',m:.7,c:'var(--gr)'},
  {n:'BÌNH THƯỜNG',m:1,c:'var(--gold)'},
  {n:'KHẮC NGHIỆT',m:1.4,c:'var(--red)'},
];
function hardM(){return(HARDS[g.hard]||HARDS[1]).m}
function lifeDefaults(){return{hard:Math.floor(Math.random()*HARDS.length),health:100,family:60,debt:0,sickDays:0,lifeCd:0,lifeSeen:{},tickets:0,invCost:{},wasRain:false,pend:'',inv:{},drink:0,gamble:0,quitM:0,debtRate:0,endWhy:''}}
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
  if(!_inR(s.debtRate,0,1))p.push('debtRate');
  if(!_inR(s.tickets,0,TICKET_MAX))p.push('tickets');
  if(!s.invCost||typeof s.invCost!=='object'||Array.isArray(s.invCost)||Object.values(s.invCost).some(v=>!_inR(v,0,1e12)))p.push('invCost');
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
   when:()=>!isSick()&&(g.wasRain||g.health<45),p:()=>(g.wasRain?.14:.06)*hardM()*(g.health<45?1.6:1),
   text:()=>g.wasRain?'Hôm qua dầm mưa cả buổi, sáng nay bạn thấy người nóng ran, đầu nặng trịu.':'Chạy nhiều quá, cơ thể bắt đầu báo động: sốt, ho, mệt rã rời.',
   choices:[
    {l:'MUA THUỐC (80K)',ok:()=>g.cash>=8e4,fn:()=>{lifeSpend(8e4);g.sickDays=1;lifeGain('health',-4);return 'Uống thuốc, ngủ một giấc. Mai sẽ khá hơn, hôm nay chỉ nghỉ.'}},
    {l:'CHỊU ĐỰNG',fn:()=>{g.sickDays=Math.max(2,Math.round(2*hardM()+Math.random()));lifeGain('health',-10);return `Cố chịu không mua thuốc. Bạn nằm bẹp ${g.sickDays} ngày, không chạy xe được.`}},
   ]},
  {id:'mom',ic:'phone',ti:'MẸ GỌI TỪ QUÊ',
   when:()=>g.month>=1&&g.day>=3,p:()=>.05,
   text:()=>'Mẹ gọi hỏi thăm: "Con ăn uống đủ chưa? Dạo này trời trở lạnh, nhớ mặc ấm. Mẹ nhớ con lắm."',
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
  // --- money trouble and luck ---
  {id:'broke',ic:'bag',ti:'HẾT TIỀN ĂN',
   when:()=>g.day>=5&&g.cash<3e5&&g.savings<2e6&&invTotal()<2e6&&g.debt<2e7,p:()=>.35,
   text:()=>'Trong túi chỉ còn lẻ tẻ, xăng cũng sắp hết. Bạn bè xung quanh cũng đều chật vật.',
   choices:[
    {l:'MƯỢN BẠN 1TR (KHÔNG LÃI)',fn:()=>{borrow(1e6,0);return 'Bạn quê cho mượn, dặn bao giờ có thì trả. Bạn thấy ngại nhưng nhẹ người.'}},
    {l:'VAY NÓNG 3TR (15%/THÁNG)',fn:()=>{borrow(3e6,.15);return 'Tiền về tay nhanh, giấy tờ ngắn gọn. Bạn chưa kịp đọc kỹ lãi.'}},
    {l:'ĂN MÌ GÓI, CHỊU KHÓ',fn:()=>{g.stamina=Math.max(0,g.stamina-20);lifeGain('health',-5);return 'Ba bữa mì gói, người xanh xao. Nhưng bạn không nợ ai đồng nào.'}},
   ]},
  {id:'collector',ic:'bag',ti:'NGƯỜI ĐÒI NỢ',
   when:()=>g.debt>=3e6&&g.debtRate>=.15,p:()=>.07*hardM(),
   text:()=>`Hai người lạ chặn trước phòng trọ: "Nợ ${ff(g.debt)} rồi nhé, lãi chạy từng ngày đấy."`,
   choices:[
    {l:'TRẢ BỚT 1TR',ok:()=>g.cash>=1e6,fn:()=>{repay(1e6);return 'Họ nhận tiền, hẹn tuần sau quay lại. Bạn thở ra.'}},
    {l:'XIN KHẤT',fn:()=>{g.stamina=Math.max(0,g.stamina-15);lifeGain('health',-3);lifeGain('family',-3);return 'Họ cảnh cáo rồi bỏ đi. Cả đêm bạn không ngủ được.'}},
   ]},
  {id:'lotto',ic:'ticket',ti:'BÀ BÁN VÉ SỐ',
   when:()=>g.cash>=2e5,p:()=>.04,
   text:()=>'Bà cụ bán vé số dạo năn nỉ: "Con mua giúp bà tờ vé, biết đâu lại trúng". Vé 20K một tờ.',
   choices:[
    {l:'KHÔNG MUA',fn:()=>'Bạn xin lỗi bà, chúc bà bán đắt.'},
    {l:'MUA 1 TỜ (20K)',ok:()=>g.cash>=2e4&&g.tickets<TICKET_MAX,fn:()=>lottoBuy(1)},
    {l:'MUA 10 TỜ (200K)',ok:()=>g.cash>=2e5&&g.tickets<=TICKET_MAX-10,fn:()=>lottoBuy(10)},
   ]},
  // --- story chain: fires once at the start of months 3, 9, 15, 21 (see STORY) ---
  {id:'roof',ic:'house',ti:'CHUYỆN NHÀ: MÁI DỘT',when:()=>false,p:()=>0,
   text:()=>'Mẹ gọi báo mùa mưa này mái nhà dột nặng, giường ướt hết. Mẹ nói "không sao", nhưng giọng nghe rất mệt.',
   choices:[
    {l:'GỬI 4TR SỬA MÁI',ok:()=>g.cash>=4e6,fn:()=>{lifeSpend(4e6);lifeGain('family',25);return 'Mái nhà được lợp lại. Mẹ khóc khi gọi báo tin, bạn bảo "con lo được".'}},
    {l:'GỬI 1,5TR',ok:()=>g.cash>=15e5,fn:()=>{lifeSpend(15e5);lifeGain('family',10);return 'Đủ vá tạm chỗ dột nặng nhất. Mẹ dặn con đừng lo.'}},
    {l:'ĐỂ SAU, CON ĐANG KHÓ',fn:()=>{lifeGain('family',-12);return 'Mẹ nói "ừ, con lo công việc". Bạn nghe tiếng mưa bên kia đầu dây mà thấy nghẹn.'}},
   ]},
  {id:'sibling',ic:'phone',ti:'EM ĐÓNG HỌC PHÍ',when:()=>false,p:()=>0,
   text:()=>'Em gái nhắn tin: trường báo đóng học phí kỳ mới 2 triệu, em đang tính nghỉ đi làm phụ quán.',
   choices:[
    {l:'GỬI 2TR CHO EM',ok:()=>g.cash>=2e6,fn:()=>{lifeSpend(2e6);lifeGain('family',15);return 'Em nhắn lại một chữ "cảm ơn anh/chị" và hình trường lớp. Bạn nhìn mãi.'}},
    {l:'GỬI 800K',ok:()=>g.cash>=8e5,fn:()=>{lifeSpend(8e5);lifeGain('family',5);return 'Em nói sẽ xin hoãn phần còn lại. Bạn hứa tháng sau bù.'}},
    {l:'"EM TỰ LO NHÉ"',fn:()=>{lifeGain('family',-10);return 'Em không nhắn lại. Một lúc sau bạn mới nghĩ lại câu mình vừa nói.'}},
   ]},
  {id:'momSick',ic:'pill',ti:'MẸ NHẬP VIỆN',when:()=>false,p:()=>0,
   text:()=>'Cậu gọi giữa trưa: mẹ nhập viện tuyến huyện, cần ứng viện phí khoảng 6 triệu. Bạn đứng khựng giữa đường.',
   choices:[
    {l:'GỬI 6TR',ok:()=>g.cash>=6e6,fn:()=>{lifeSpend(6e6);lifeGain('family',30);return 'Viện phí được đóng đủ. Vài ngày sau mẹ xuất viện, gọi bảo con đừng lo.'}},
    {l:'GỬI 3TR',ok:()=>g.cash>=3e6,fn:()=>{lifeSpend(3e6);lifeGain('family',12);return 'Cậu xoay thêm phần còn lại. Bạn nợ gia đình thêm một lần ơn.'}},
    {l:'VAY NÓNG 6TR GỬI VỀ',ok:()=>g.debt<=2.4e7,fn:()=>{borrow(6e6,.15);lifeSpend(6e6);lifeGain('family',30);return 'Mẹ khỏe lại, nhưng bạn giờ mang món nợ lãi cao trên vai.'}},
    {l:'KHÔNG GỬI NỔI',fn:()=>{lifeGain('family',-25);lifeGain('health',-10);return 'Cậu im lặng rồi cúp máy. Bạn không ngủ nổi nhiều đêm sau đó.'}},
   ]},
  {id:'friendBiz',ic:'shop',ti:'BẠN RỦ GÓP VỐN',when:()=>false,p:()=>0,
   text:()=>'Người bạn cùng quê mở quán cà phê nhỏ ở khu trọ và rủ bạn góp vốn: "Chia lời theo tháng, không lo đâu". Bạn không biết quán sẽ ra sao.',
   choices:[
    {l:'KHÔNG GÓP',fn:()=>'Bạn nói sẽ cổ vũ bằng cách ghé uống cà phê. Bạn bè vẫn vui.'},
    {l:'GÓP 2TR',ok:()=>g.cash>=2e6,fn:()=>bizBet(2e6,.5)},
    {l:'GÓP 5TR',ok:()=>g.cash>=5e6,fn:()=>bizBet(5e6,.45)},
   ]},
];
const STORY={3:'roof',9:'sibling',15:'momSick',21:'friendBiz'};
const CHAPTERS={
  7:{ti:'CHƯƠNG 2: BÁM TRỤ',tx:'Nửa năm đã trôi qua kể từ ngày bạn từ quê lên phố. Đường xá đã quen, khách quen cũng có. Nhưng phố không để ai yên: tiền phòng, tiền xăng, và những cuộc gọi về quê.'},
  13:{ti:'CHƯƠNG 3: NGÃ RẼ',tx:'Một năm. Có người bạn đã bỏ nghề, có người khá lên, có người sa vào chuyện không đâu. Bạn đang đứng ở một ngã rẽ: giữ thói quen tốt hay buông mình.'},
  19:{ti:'CHƯƠNG 4: VỀ ĐÍCH',tx:'Còn sáu tháng. Con số tiết kiệm đã đủ để bạn nhìn thấy ngày về quê. Chỉ cần đừng để mệt mỏi, nợ nần hay một phút yếu lòng kéo lùi.'},
};
function chapterNote(){
  const n=[];
  if(g.debt>0)n.push(`Bạn đang nợ ${ff(g.debt)}.`);
  if(g.health<40)n.push('Sức khỏe bạn đang yếu.');
  if(g.family<30)n.push('Gia đình đang rất lo cho bạn.');
  else if(g.family>=70)n.push('Mẹ luôn yên tâm về bạn.');
  if(g.drink>=40||g.gamble>=40)n.push('Có những thói quen bạn biết là cần bớt.');
  if(g.savings>=C.winTarget*.5)n.push('Tiết kiệm đã được một nửa chặng đường.');
  return n.join(' ');
}
function bizBet(amt,p){
  lifeSpend(amt);
  if(Math.random()<p){const back=Math.round(amt*1.7);g.cash+=back;g.fin.life=Math.max(0,(g.fin.life||0)-back);return `Quán đông khách, chia lời đều đặn: bạn nhận lại ${ff(back)}.`}
  return 'Quán vắng khách rồi đóng cửa sau vài tháng. Số vốn góp coi như mất. Bạn bè xin lỗi rối rít.';
}
// Ending text for the win/lose screen: depends on how the player lived, not only on the money.
function endingInfo(win){
  if(win){
    if(g.drink>=50||g.gamble>=50)return{t:'ĐẾN ĐÍCH, NHƯNG THÓI QUEN CÒN BÁM',l:'Bạn đã có đủ tiền, nhưng những thói quen cũ vẫn theo bạn về quê.'};
    if(g.health<40)return{t:'ĐẾN ĐÍCH TRONG KIỆT SỨC',l:'Bạn đạt mục tiêu, cơ thể thì đã trả giá đắt. Giờ là lúc nghỉ ngơi.'};
    if(g.family<30)return{t:'GIÀU HƠN, XA NHÀ HƠN',l:'Số tiền có rồi, nhưng quê nhà đã xa hơn bạn tưởng. Hãy gọi về cho mẹ.'};
    if(g.family>=70&&g.health>=70)return{t:'VỀ QUÊ VẸN TOÀN',l:'Bạn về quê với tiền tiết kiệm, sức khỏe tốt và nụ cười của mẹ ở cổng nhà.'};
    return{t:'HOÀN THÀNH MỤC TIÊU',l:'Hai năm vất vả đã đổi lấy một khoản tiết kiệm xứng đáng.'};
  }
  if(g.endWhy==='debt')return{t:'NỢ NẦN SIẾT CỔ',l:'Lãi mẹ đẻ lãi con, chủ nợ đến tận cửa. Lần sau, hãy tránh xa vay nóng.'};
  if(g.month<=C.maxMonths)return{t:'HẾT VỐN NƠI PHỐ',l:'Bạn hết tiền trước khi kịp đứng vững. Bài học: giữ lại một khoản dự phòng.'};
  const r=g.savings/C.winTarget;
  if(r>=.7)return{t:'THIẾU MỘT CHÚT',l:'Bạn chỉ còn cách đích một đoạn ngắn. Phố vẫn còn đó, thử lại nhé.'};
  if(g.family<30)return{t:'LẠC NHỊP',l:'Bạn tiết kiệm được ít và cũng xa gia đình. Có lẽ đã đến lúc về nhà.'};
  return{t:'CHƯA ĐỦ SỨC',l:'Hai năm trôi qua nhanh hơn bạn nghĩ. Hãy thử cách khác: ít chi tiêu lặt vặt, nhiều đơn hợp lý.'};
}
function borrow(amt,rate){
  g.cash+=amt;g.debt+=amt;g.debtRate=Math.max(g.debtRate,rate);addLog('Vay '+ff(amt)+(rate?` (lãi ${Math.round(rate*100)}%/tháng)`:' (không lãi)'),'warn');
}
function repay(amt){
  amt=Math.min(amt,g.debt,Math.max(0,g.cash));if(amt<=0)return;
  g.cash-=amt;g.debt-=amt;if(g.debt<=0){g.debt=0;g.debtRate=0}addLog('Trả nợ '+ff(amt),'save');
  if(g.phase==='game'&&netWin()){modal=null;finish(true)}
}
// Lottery: expected return a little under the ticket price, rare big prizes (drawn per ticket).
const TICKET=2e4,TICKET_MAX=40;
// Tickets are bought during the day and drawn at the end of the day (see lottoDraw, called from triggerDayEnd).
function lottoBuy(n){
  n=Math.min(n,TICKET_MAX-g.tickets);if(n<=0)return 'Hôm nay bạn đã mua đủ số vé tối đa rồi.';
  if(g.cash<n*TICKET)return 'Không đủ tiền mua vé.';
  lifeSpend(n*TICKET);g.tickets+=n;if(n>=10)g.gamble=Math.min(100,g.gamble+2);
  return `Bạn cất ${n} tờ vé vào túi. Tối nay sẽ có kết quả xổ số.`;
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
  {id:'gold',n:'VÀNG',ic:'gold',mu:.05,sd:.08,d:'Biến động vừa, hay tăng khi kinh tế xấu.'},
  {id:'stock',n:'CHỨNG KHOÁN',ic:'chart',mu:.08,sd:.25,d:'Có thể lãi lớn hoặc mất nhiều. Chơi bằng tiền nhàn rỗi.'},
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
  if(g.phase!=='game'||!(amt>0)||amt>g.cash){toast('KHÔNG ĐỦ TIỀN!','bad');return}
  g.cash-=amt;g.inv[id]=invOf(id)+amt;g.invCost[id]=(g.invCost[id]||0)+amt;addLog(`Mua ${INVS.find(x=>x.id===id).n}: ${ff(amt)}`,'save');save();render();
}
function invSell(id,amt){
  const v=invOf(id);if(g.phase!=='game'||v<=0)return;
  amt=amt==='all'?v:Math.min(amt,v);const fee=Math.round(amt*INV_FEE);
  g.invCost[id]=Math.round((g.invCost[id]||0)*(v-amt)/v);g.inv[id]=v-amt;g.cash+=amt-fee;g.fin.life=(g.fin.life||0)+fee;
  addLog(`Bán ${INVS.find(x=>x.id===id).n}: +${ff(amt-fee)} (phí ${ff(fee)})`,'earn');save();render();
}
function remit(amt){
  if(g.phase!=='game'||!(amt>0)||amt>g.cash){toast('KHÔNG ĐỦ TIỀN!','bad');return}
  lifeSpend(amt);lifeGain('family',Math.round(amt/1e5*2.4));addLog(`Gửi về quê: ${ff(amt)}`,'save');save();render();
}
// monthly: family worries when nothing is sent; content family sends food and a little money
function debtMonthEnd(){
  if(g.debt<=0)return;
  const add=Math.round(g.debt*g.debtRate);if(add>0){g.debt+=add;g.fin.loan=(g.fin.loan||0)+add;addLog('Lãi vay tháng này: +'+ff(add),'warn')}
  if(g.debt>=3e7){g.endWhy='debt'}
}
function familyMonthEnd(){
  lifeGain('family',-Math.round(6*hardM()));
  if(g.drink>=50){lifeGain('family',-4);addLog('Người nhà nghe tin bạn hay nhậu: -4 gia đình','warn')}
  if(g.gamble>=50){lifeGain('family',-4);addLog('Người nhà nghe tin bạn hay cá cược: -4 gia đình','warn')}
  if(g.family>=70){const gift=rnd(2,4)*1e5;g.cash+=gift;addLog('Mẹ gửi đồ quê: +'+ff(gift),'earn')}
  else if(g.family<=20){lifeGain('health',-5);addLog('Lo chuyện nhà, ăn ngủ không yên: -5 sức khỏe','warn')}
}
function netWin(){return g.debt===0&&g.savings>=C.winTarget}
function invLiquidate(){const t=invTotal();if(t>0){g.savings+=t;g.inv={};g.invCost={};addLog('Bán hết đầu tư vào tiết kiệm: '+ff(t),'save')}}
function quitHabits(){
  if(g.phase!=='game'||g.quitM===g.month||(g.drink<=0&&g.gamble<=0))return;
  g.quitM=g.month;g.drink=Math.max(0,g.drink-15);g.gamble=Math.max(0,g.gamble-15);lifeGain('family',2);addLog('Bạn tự nhủ phải bớt lại.','good');save();render();
}
function takeLoan(k){
  if(g.phase!=='game'||g.debt>=2e7)return;
  if(k==='hot')borrow(3e6,.15);else{borrow(5e6,.25);g.cash-=5e5;addLog('Phí làm hồ sơ vay: -500K','cost')}save();render();
}
function openHub(){if(modal||DLV||g.phase!=='game')return;modal={type:'hub'};render()}
function lottoHub(n){
  if(g.phase!=='game')return;
  const t=lottoBuy(n);toast(t.startsWith('Bạn cất')?`ĐÃ MUA ${n} TỜ VÉ SỐ`:t.toUpperCase(),t.startsWith('Bạn cất')?'':'bad');save();render();
}
