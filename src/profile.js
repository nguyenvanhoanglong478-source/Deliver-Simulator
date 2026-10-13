// ===== DRIVER PROFILE + CUSTOMER REVIEWS =====
const HOBBIES=[
  {id:'nhac',t:'Nghe nhạc'},{id:'bongda',t:'Bóng đá'},{id:'game',t:'Chơi game'},{id:'cafe',t:'Cà phê'},
  {id:'nau',t:'Nấu ăn'},{id:'phim',t:'Xem phim'},{id:'dulich',t:'Du lịch'},{id:'sach',t:'Đọc sách'},
  {id:'cauca',t:'Câu cá'},{id:'thucung',t:'Thú cưng'},
];
const HOBBY_LINE={
  nhac:'Anh shipper nghe nhạc hay phết, giao hàng lại còn nhanh.',
  bongda:'Tài xế bàn bóng đá vui lắm, đơn đến cực nhanh.',
  game:'Shipper này tay lái chắc như chơi game, né kẹt xe giỏi thật.',
  cafe:'Giao đúng giờ như ly cà phê pha chuẩn vị.',
  nau:'Giữ đồ ăn cẩn thận như người biết nấu ăn, mở ra còn nóng.',
  phim:'Shipper vui tính, kể chuyện phim nghe cuốn lắm.',
  dulich:'Rành đường như đi du lịch khắp phố, tới nơi rất nhanh.',
  sach:'Tài xế lịch sự, nhẹ nhàng, giao hàng gọn gàng.',
  cauca:'Kiên nhẫn như người câu cá, đứng chờ mình xuống lấy rất lịch sự.',
  thucung:'Con chó nhà mình còn quý bạn shipper này luôn.',
};
const TPL={
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
const CUSTOMERS=['Chị Lan','Anh Minh','Cô Hạnh','Bạn Tú','Bé Na','Anh Đạt','Chị Mai','Chú Hùng','Bạn Linh','Anh Phúc','Chị Thảo','Bạn Khoa','Cô Ngọc','Anh Long'];

function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function defProfile(){return{name:'',hobbies:[],hobbyText:'',helmet:HELMETS[0],reviewsOn:true}}
function pname(){return(g.profile&&g.profile.name.trim())||'Tài xế'}
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
  return t.replace(/\{name\}/g,g.profile.name.trim()?'Tài xế '+pname():'Tài xế').replace(/\{J\}/g,food?'Đồ ăn':'Hàng').replace(/\{j\}/g,food?'đồ ăn':'hàng');
}

// ---- Claude-written reviews (only where the page can ask Claude) ----
let _sample,_aiBusyUntil=0,_aiInflight=false;
async function getSample(){
  if(_sample!==undefined)return _sample;
  try{_sample=(window.claude&&typeof window.claude.use==='function'&&await window.claude.use('sample'))||null}catch(e){_sample=null}
  return _sample;
}
function aiAvailable(){return !!_sample}
function aiPrompt(r,ctx){
  const ds=['giao rất trễ, hàng bị hỏng hoặc thiếu','giao hơi trễ','giao nhanh, hàng nguyên vẹn'][ctx.ok];
  const hb=hobbyList();
  return`Bạn là một khách hàng Việt Nam vừa nhận ${ctx.job.id==='food'?'đơn đồ ăn':'đơn hàng'} từ tài xế Be${g.profile.name.trim()?` tên ${pname()}`:''}${hb.length?` (sở thích của tài xế: ${hb.join(', ')})`:''}.
Tình hình lần giao này: ${ds}${g.rainToday?', trời đang mưa':''}${g.vehicleHp<40?', xe của tài xế trông đã cũ hỏng':''}.
Bạn đã chấm ${r.stars}/5 sao.
Viết đúng một câu đánh giá bằng tiếng Việt, tối đa 110 ký tự, giọng tự nhiên như người thật, hợp với số sao đã chấm. Có thể nhắc nhẹ đến sở thích của tài xế nếu hợp. Không emoji, không ngoặc kép. Chỉ trả về câu đánh giá.`;
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
    if(code==='not_granted'){_aiBusyUntil=Infinity;toast('KHÔNG BẬT ĐƯỢC ĐÁNH GIÁ MỚI — DÙNG ĐÁNH GIÁ CÓ SẴN','warn')}
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
  if(i>=0)a.splice(i,1);else if(a.length<3)a.push(id);else{toast('CHỌN TỐI ĐA 3 SỞ THÍCH','warn');return}
  save();render();
}
function setHelmet(i){g.profile.helmet=HELMETS[i];save();render()}
function toggleReviews(){g.profile.reviewsOn=!g.profile.reviewsOn;save();render()}
