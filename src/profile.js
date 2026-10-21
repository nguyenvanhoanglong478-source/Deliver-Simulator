// ===== DRIVER PROFILE + CUSTOMER REVIEWS =====
const HOBBIES=[
  {id:'nhac',t:T('Nghe nhạc','Music')},{id:'bongda',t:T('Bóng đá','Football')},{id:'game',t:T('Chơi game','Gaming')},{id:'cafe',t:T('Cà phê','Coffee')},
  {id:'nau',t:T('Nấu ăn','Cooking')},{id:'phim',t:T('Xem phim','Movies')},{id:'dulich',t:T('Du lịch','Travel')},{id:'sach',t:T('Đọc sách','Reading')},
  {id:'cauca',t:T('Câu cá','Fishing')},{id:'thucung',t:T('Thú cưng','Pets')},
];
const HOBBY_LINE={
  nhac: T('Anh shipper nghe nhạc hay phết, giao hàng lại còn nhanh.','The driver has great taste in music, and delivers fast too.'),
  bongda: T('Tài xế bàn bóng đá vui lắm, đơn đến cực nhanh.','Fun driver to talk football with, and the order came super fast.'),
  game: T('Shipper này tay lái chắc như chơi game, né kẹt xe giỏi thật.','This rider handles the bike like a gamer, dodging traffic like a pro.'),
  cafe: T('Giao đúng giờ như ly cà phê pha chuẩn vị.','Delivered right on time, like a perfectly brewed coffee.'),
  nau: T('Giữ đồ ăn cẩn thận như người biết nấu ăn, mở ra còn nóng.','Handled the food like someone who cooks, still hot when I opened it.'),
  phim: T('Shipper vui tính, kể chuyện phim nghe cuốn lắm.','Funny rider, his movie stories were great to listen to.'),
  dulich: T('Rành đường như đi du lịch khắp phố, tới nơi rất nhanh.','Knows the streets like a seasoned traveler, arrived really fast.'),
  sach: T('Tài xế lịch sự, nhẹ nhàng, giao hàng gọn gàng.','Polite, gentle driver, and the delivery was neat and tidy.'),
  cauca: T('Kiên nhẫn như người câu cá, đứng chờ mình xuống lấy rất lịch sự.','Patient like an angler, waited politely for me to come down.'),
  thucung: T('Con chó nhà mình còn quý bạn shipper này luôn.','Even my dog likes this rider.'),
};
const TPL_VI={
  5:['Giao rất nhanh, {j} còn nguyên vẹn. Năm sao!','{name} thân thiện, giao đúng hẹn. Sẽ đặt lại.','{J} đến sớm hơn dự kiến, đóng gói cẩn thận.','Quá tuyệt vời, shipper nhiệt tình và lịch sự.','Nhanh gọn, không có gì để chê. Cảm ơn bạn!','Giao tận tay, nói chuyện dễ thương. Đánh giá cao.',
    'Vừa đặt xong đã thấy tới, nhanh hơn mình nghĩ nhiều.','{J} còn nguyên, shipper còn chào hỏi rất lễ phép.','Đường đông mà vẫn giao đúng giờ, quá đỉnh.','Shipper gọi trước khi tới, rất chuyên nghiệp.','Năm sao không cần suy nghĩ, lần sau lại gọi bạn này.','{J} được bọc cẩn thận, không sót món nào.','Lịch sự, nhanh nhẹn, giao tới tận cửa luôn.','Dịch vụ tốt, mình sẽ giới thiệu cho bạn bè.','Trời nóng mà bạn vẫn niềm nở, cảm ơn nhiều nhé.','App báo 15 phút mà 10 phút đã tới, cực kỳ nhanh.','Cảm ơn {name} nhiều, {j} đến đúng lúc mình đang cần.','Chạy xe chắc tay, hàng không bị xô lệch gì cả.'],
  4:['Giao khá nhanh, {j} ổn. Chỉ hơi trễ một chút.','Tài xế lịch sự, {j} đầy đủ. Bốn sao nhé.','Ổn áp, lần sau mình vẫn chọn bạn này.','Giao đúng gần giờ hẹn, {j} không sao cả.',
    'Khá tốt, chỉ tiếc là phải chờ thêm vài phút.','{J} ổn, shipper nhã nhặn. Trừ một sao vì hơi trễ.','Hài lòng, nếu nhanh thêm chút nữa là trọn vẹn.','Giao đủ, thái độ tốt, chỉ hơi lòng vòng tìm đường.','Tạm ổn, bạn shipper dễ mến.','{J} đến hơi trễ nhưng shipper xin lỗi rất chân thành.','Nhìn chung tốt, sẽ đặt lại nếu cần.','Đóng gói ổn, chỉ hơi móp nhẹ một góc.'],
  3:['Tạm được, {j} đến hơi trễ so với dự kiến.','Bình thường, không tệ mà cũng chưa nổi bật.','Giao hơi lâu, nhưng {j} vẫn nguyên vẹn.','Cũng được, mong lần sau nhanh hơn chút.',
    'Trễ gần 15 phút, nhưng {j} không bị gì.','Không có gì đặc biệt, giao cho xong là được.','Chờ hơi sốt ruột, bù lại shipper khá lịch sự.','Ba sao thôi, giao chậm hơn app báo.','{J} đến nơi hơi nguội, shipper thì nhã nhặn.','Chấp nhận được, cần cải thiện tốc độ.'],
  2:['Chờ hơi lâu, {j} đến nơi không còn như ban đầu.','Giao trễ khá nhiều, mình phải gọi hai lần.','Hơi thất vọng, {j} bị móp và đến muộn.',
    'Trễ quá, {j} nguội hết rồi mới tới.','Shipper đi lạc, mình phải ra đầu hẻm đón.','{J} bị đổ một ít, giao lại còn chậm.','Không như mong đợi, lần sau chắc mình chọn người khác.','Chờ hơn nửa tiếng, thái độ cũng không vui vẻ lắm.'],
  1:['Quá trễ, {j} nguội ngắt và bị hư. Không hài lòng.','Chờ rất lâu, tài xế không báo gì cả. Một sao.','{J} bị thiếu và hỏng, mình sẽ khiếu nại.',
    'Tệ, một tiếng mới tới, mất hết thiện cảm.','{J} nát bét, không thể dùng được.','Gọi không bắt máy, tới nơi thì hàng hư. Một sao.','Thất vọng hoàn toàn, sẽ không đặt lại.','Giao sai chỗ, trễ hơn nửa tiếng. Rất tệ.'],
};
const TPL_EN={5:['Super fast, the {j} arrived intact. Five stars!','{name} was friendly and on time. Will order again.','The {J} came earlier than expected, carefully packed.','Awesome, the rider was enthusiastic and polite.','Quick and neat, nothing to complain about. Thank you!','Handed it to me in person, lovely to talk to. Highly recommend.','It arrived right after I ordered, way faster than I expected.','The {J} was intact, and the rider greeted me so politely.','Busy streets and still on time, amazing.','The rider called before arriving, very professional.','Five stars, no hesitation, I\'ll book this rider again.','The {J} was wrapped carefully, nothing missing.','Polite, quick, brought it right to my door.','Great service, I\'ll recommend it to friends.','Hot weather and still so friendly, thanks a lot.','The app said 15 minutes but it came in 10, super fast.','Thanks so much {name}, the {j} came right when I needed it.','Steady rider, nothing got knocked around.'],4:['Pretty fast, the {j} was fine. Just a little late.','Polite driver, the {j} was complete. Four stars.','Solid, I\'d pick this rider again.','Arrived close to the promised time, the {j} was fine.','Pretty good, just a few extra minutes of waiting.','The {J} was fine, rider was courteous. One star off for being slightly late.','Satisfied, a bit faster and it would be perfect.','Complete order, good attitude, just circled around a bit looking for the place.','Okay, the rider is likeable.','The {J} came a bit late but the rider apologized sincerely.','Good overall, will order again if needed.','Packed fine, just a slight dent in one corner.'],3:['Okay, the {j} came a little later than expected.','Average, not bad but nothing special.','Took a while, but the {j} was intact.','Fine, hoping for faster next time.','Almost 15 minutes late, but the {j} was fine.','Nothing special, it got delivered and that\'s it.','A bit nerve-wracking to wait, but the rider was fairly polite.','Three stars, slower than the app said.','The {J} arrived a bit cold, the rider was courteous though.','Acceptable, speed needs improving.'],2:['Waited a long time, the {j} wasn\'t the same as when it left.','Quite late, I had to call twice.','A bit disappointed, the {j} was dented and late.','Too late, the {j} was cold by the time it arrived.','The rider got lost, I had to go to the end of the alley to meet them.','Some of the {j} spilled, and it was slow too.','Not what I expected, I\'ll probably pick someone else next time.','Waited over half an hour, and the attitude wasn\'t very cheerful.'],1:['Way too late, the {j} was stone cold and damaged. Not satisfied.','Waited forever, the driver never told me anything. One star.','The {J} was missing and broken, I\'ll file a complaint.','Terrible, took an hour, lost all goodwill.','The {J} was destroyed, completely unusable.','Didn\'t pick up my calls, and the goods were ruined when they arrived. One star.','Totally disappointed, won\'t order again.','Wrong location, over half an hour late. Very bad.']};
const TPL={};for(const k in TPL_VI)TPL[k]=TPL_VI[k].map((v,i)=>T(v,TPL_EN[k][i]));
const CUSTOMERS=[T('Chị Lan','Ms. Lan'),T('Anh Minh','Mr. Minh'),T('Cô Hạnh','Mrs. Hanh'),T('Bạn Tú','Tu'),T('Bé Na','Little Na'),T('Anh Đạt','Mr. Dat'),T('Chị Mai','Ms. Mai'),T('Chú Hùng','Uncle Hung'),T('Bạn Linh','Linh'),T('Anh Phúc','Mr. Phuc'),T('Chị Thảo','Ms. Thao'),T('Bạn Khoa','Khoa'),T('Cô Ngọc','Aunt Ngoc'),T('Anh Long','Mr. Long')];

function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function defProfile(){return{name:'',hobbies:[],hobbyText:'',helmet:HELMETS[0],reviewsOn:true}}
function pname(){return(g.profile&&g.profile.name.trim())||T('Tài xế','Driver')}
function hobbyList(){
  const p=g.profile;const l=p.hobbies.map(id=>(HOBBIES.find(h=>h.id===id)||{}).t).filter(Boolean);
  if(p.hobbyText.trim())l.push(p.hobbyText.trim());return l;
}
function normalizeState(){
  if(!g.profile)g.profile=defProfile();
  g.profile=Object.assign(defProfile(),g.profile);
  if(!Array.isArray(g.reviews))g.reviews=[];
  if(typeof g.stars!=='number')g.stars=5;
}
function calcStars(){
  const last=g.reviews.slice(0,20);
  const sum=last.reduce((s,r)=>s+r.stars,0);
  return(25+sum)/(5+last.length);   // five invisible 5-star ratings keep one bad order from wrecking the score
}
function rollRating(ok){
  const r=Math.random();
  if(ok===2)return r<.85?5:4;
  if(ok===1)return r<.2?2:r<.6?3:4;
  return r<.5?1:2;
}
function templateReview(stars,job){
  const food=job.id==='food';
  const pool=TPL[stars].slice();
  const hl=g.profile.hobbies.map(id=>HOBBY_LINE[id]).filter(Boolean);
  if(stars>=4&&hl.length&&Math.random()<.45)return hl[rnd(0,hl.length-1)];
  const t=pool[rnd(0,pool.length-1)];
  return t.replace(/\{name\}/g,g.profile.name.trim()?T('Tài xế ','Driver ')+pname():T('Tài xế','Driver')).replace(/\{J\}/g,food?T('Đồ ăn','Food'):T('Hàng','Goods')).replace(/\{j\}/g,food?T('đồ ăn','food'):T('hàng','goods'));
}

// ---- Claude-written reviews (only where the page can ask Claude) ----
let _sample,_aiBusyUntil=0,_aiInflight=false;
async function getSample(){
  if(_sample!==undefined)return _sample;
  try{_sample=(window.claude&&typeof window.claude.use==='function'&&await window.claude.use('sample'))||null}catch(e){_sample=null}
  return _sample;
}
function aiPrompt(r,ctx){
  const ds=T(['giao rất trễ, hàng bị hỏng hoặc thiếu','giao hơi trễ','giao nhanh, hàng nguyên vẹn'],['very late delivery, goods damaged or missing','slightly late delivery','fast delivery, goods intact'])[ctx.ok];
  const hb=hobbyList();
  return T(`Bạn là một khách hàng Việt Nam vừa nhận ${ctx.job.id==='food'?'đơn đồ ăn':'đơn hàng'} từ tài xế${g.profile.name.trim()?` tên ${pname()}`:''}${hb.length?` (sở thích của tài xế: ${hb.join(', ')})`:''}.
Tình hình lần giao này: ${ds}${g.rainToday?', trời đang mưa':''}${g.vehicleHp<40?', xe của tài xế trông đã cũ hỏng':''}.
Bạn đã chấm ${r.stars}/5 sao.
Viết đúng một câu đánh giá bằng tiếng Việt, tối đa 110 ký tự, giọng tự nhiên như người thật, hợp với số sao đã chấm. Có thể nhắc nhẹ đến sở thích của tài xế nếu hợp. Không emoji, không ngoặc kép. Chỉ trả về câu đánh giá.`,
`You are a customer in Vietnam who just received ${ctx.job.id==='food'?'a food order':'an order'} from a driver${g.profile.name.trim()?` named ${pname()}`:''}${hb.length?` (the driver's hobbies: ${hb.join(', ')})`:''}.
How this delivery went: ${ds}${g.rainToday?', it was raining':''}${g.vehicleHp<40?', the driver\'s bike looked old and worn':''}.
You gave ${r.stars}/5 stars.
Write exactly one review sentence in English, at most 110 characters, in a natural voice like a real person, matching the star rating. You may lightly mention the driver's hobbies if it fits. No emoji, no quotation marks. Return only the review sentence.`);
}
async function askClaudeReview(r,ctx,onDone){
  if(_aiInflight||Date.now()<_aiBusyUntil)return;
  const sample=await getSample();if(!sample)return;
  _aiInflight=true;
  const ac=new AbortController();const to=setTimeout(()=>ac.abort(),15000);
  try{
    const out=await sample(aiPrompt(r,ctx),{signal:ac.signal,modelTier:'quick',cache:false});
    let t=(out&&out.text||'').trim().split('\n')[0].replace(/^["“”']+|["“”']+$/g,'').trim();
    if(t&&t.length<=160){r.text=t;r.ai=true;save();onDone&&onDone(r)}
  }catch(e){
    const code=e&&e.code;
    if(code==='not_granted'){_aiBusyUntil=Infinity;toast(T('KHÔNG BẬT ĐƯỢC ĐÁNH GIÁ MỚI — DÙNG ĐÁNH GIÁ CÓ SẴN','CAN\'T GENERATE NEW REVIEWS — USING BUILT-IN ONES'),'warn')}
    else if(code==='rate_limited')_aiBusyUntil=Date.now()+60000;
  }finally{clearTimeout(to);_aiInflight=false}
}
function addReview(ok,job){
  if(!g.profile.reviewsOn)return null;
  const stars=rollRating(ok);
  const r={stars,text:templateReview(stars,job),who:CUSTOMERS[rnd(0,CUSTOMERS.length-1)],job:job.id,day:g.day,month:g.month,ai:false};
  g.reviews.unshift(r);if(g.reviews.length>40)g.reviews.pop();
  g.stars=calcStars();
  askClaudeReview(r,{ok,job},rv=>{
    const el=document.getElementById('rv');if(el&&el.dataset.id===String(r.t0))el.innerHTML=reviewHTML(rv);
  });
  r.t0=Date.now()+Math.random();
  return r;
}

// ---- profile screen actions ----
function goProfile(){if(g.phase==='game'){g.phase='profile';render();getSample().then(()=>{if(g.phase==='profile')render()})}}
function setName(v){g.profile.name=String(v).slice(0,16);save()}
function setHobbyText(v){g.profile.hobbyText=String(v).slice(0,24);save()}
function toggleHobby(id){
  const a=g.profile.hobbies,i=a.indexOf(id);
  if(i>=0)a.splice(i,1);else if(a.length<3)a.push(id);else{toast(T('CHỌN TỐI ĐA 3 SỞ THÍCH','PICK UP TO 3 HOBBIES'),'warn');return}
  save();render();
}
function setHelmet(i){g.profile.helmet=HELMETS[i];save();render()}
function toggleReviews(){g.profile.reviewsOn=!g.profile.reviewsOn;save();render()}
