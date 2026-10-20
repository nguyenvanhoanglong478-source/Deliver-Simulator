let foldOpen={sav:false,log:false};
const TUT=[
 {ic:'flag',t:'MỤC TIÊU',b:'Tiết kiệm 100 triệu trong 24 tháng. Cuối mỗi tháng có hóa đơn 6,5 triệu phải trả, nên đừng tiêu hết tiền mặt.'},
 {ic:'box',t:'NHẬN ĐƠN',b:'Chọn một trong các đơn hàng rồi chờ giao xong: thanh tiến độ chạy ngay trong ô đơn, mỗi lần chỉ giao một đơn. Đơn xa trả cao nhưng tốn thể lực, xăng và thời gian. Đơn ghép trả nhiều hơn nhưng lâu và tốn hơn.'},
 {ic:'fuel',t:'THỂ LỰC VÀ XĂNG',b:'Hết xăng hoặc thể lực thì không giao được. Dùng NẠP XĂNG và NGỦ NGHỈ, nhưng ngủ tốn thời gian trong ngày.'},
 {ic:'cal',t:'MỘT NGÀY GAME',b:'Mỗi ngày chạy từ 06:00 đến 22:00. Giờ cao điểm (11-13h, 17-19h) đơn trả thêm 25% nhưng dễ kẹt xe. Bấm ⏸ hoặc phím P để tạm dừng.'},
 {ic:'house',t:'ĐỜI SỐNG',b:'Bạn là người từ quê lên phố. Sức khỏe, gia đình và nợ nần cũng ảnh hưởng ván chơi: ốm thì không chạy xe, gia đình lo thì tinh thần xuống. Mở mục ĐỜI SỐNG để gửi tiền về quê, đầu tư hoặc trả nợ. Thỉnh thoảng sẽ có lời rủ rê, hãy cân nhắc.'},
 {ic:'gear',t:'NÂNG CẤP',b:'Mua phụ tùng, túi giao hàng và động cơ ở mục NÂNG CẤP. Một số món loại trừ nhau, GPS và bảo hiểm tính phí hàng tháng. Gửi tiền tiết kiệm để nhận lãi mỗi ngày.'}
];
// ===== RENDER =====
function money(n){n=Math.round(n);return(n<0?'-':'')+Math.abs(n).toLocaleString('vi-VN')+'<span class="cur">đ</span>'}
function meterColor(v,lo,mid){return v<lo?'red':v<mid?'or':'gr'}
function offerCard(o,i){
  if(DLV&&DLV.i===i){
    const job=C.jobs[DLV.o.type],left=dlvLeft(),pc=Math.min(100,(1-left/DLV.dur)*100);
    return`<div class="btn ${DLV.o.type==='food'?'b-gr':'b-cy'} offer delivering${DLV.o.rush?' rush':''}" aria-live="polite">
    <span class="of-ic">${ic(job.icon,32)}</span>
    <span class="of-main"><span class="nm">ĐANG GIAO · ${job.name}</span><span class="er">${money(DLV.earn)}</span>
      <span class="dl-track"><span class="dl-bar" id="dl-bar" style="width:${pc}%"><img class="dl-bike" src="${BIKE}" alt=""></span><span class="dl-flag">${ic('flag',20)}</span></span></span>
    <span class="co"><span id="dl-t">${Math.ceil(left)}s</span></span>
  </div>`;
  }
  const c=offerCost(o),d=DIST[o.dist],job=C.jobs[o.type],ok=canDoOffer(o)&&!DLV;
  return`<button class="btn ${o.type==='food'?'b-gr':'b-cy'} offer${o.rush?' rush':''}${o.combo?' combo':''}" ${ok?'':'disabled'} onclick="doDelivery(${i})">
    <span class="of-ic">${ic(job.icon,32)}</span>
    <span class="of-main"><span class="nm">${job.name} · ${d.n} <span class="pips" aria-hidden="true">${[0,1,2].map(k=>`<i${k<=o.dist?' class="on"':''}></i>`).join('')}</span></span><span class="er">${money(offerPay(o))}</span>
      <span class="of-tags">${o.combo?'<b class="tg combo">ĐƠN GHÉP</b>':''}${o.rush?'<b class="tg rush">GẤP</b>':''}${o.peak?'<b class="tg peak">CAO ĐIỂM</b>':''}</span></span>
    <span class="co"><span>${ic('bolt',16)}${c.sta}</span><span>${ic('fuel',16)}${c.fuel}%</span><span>${ic('flag',16)}${offerTime(o)}s</span></span>
  </button>`;
}
// live street scene on the main screen: sun/moon follow the clock, rain when it rains, scenery only moves while delivering
function hscene(){
  return`<div id="hscene" class="scene hscene${DLV?' go':''}${g.rainToday?' rainy':''}" data-t="${dayPart()}" aria-hidden="true">
    <div class="sun" style="${sunPos()}"></div><div class="sstars"></div><div class="sky-far"></div><div class="sky-near"></div>
    <div class="road"></div><img class="bike" src="${BIKE}" alt="">${DLV?`<div class="cargo">${ic(C.jobs[DLV.o.type].icon,32)}</div>`:''}<div class="rain"></div></div>`;
}
function sceneHTML(cargo){
  return`<div class="scene"><div class="sstars"></div><div class="sky-far"></div><div class="sky-near"></div><div class="road"></div>
    <img class="bike" src="${BIKE}" alt="Xe Honda Cub">${cargo?`<div class="cargo">${ic(cargo,32)}</div>`:''}</div>`;
}
function reviewHTML(r){
  return`<div class="who"><span>${esc(r.who)}</span>${starsFixed(r.stars,18)}</div>
    <div class="txt">${esc(r.text)}</div>`;
}

// START
let _billsOpen=false;
function toggleBills(){
  _billsOpen=!_billsOpen;
  const d=document.getElementById('bills-detail'),a=document.getElementById('bills-arr'),h=document.getElementById('bills-hdr');
  if(d)d.style.display=_billsOpen?'block':'none';
  if(a)a.textContent=_billsOpen?'▲':'▼';
  if(h)h.classList.toggle('open',_billsOpen);
}
function rStart(){
  const saved=load();const hs=hasSave();
  const nm=saved&&saved.profile&&typeof saved.profile.name==='string'&&saved.profile.name.trim();
  const br=C.monthly.map(b=>`<div class="bill-row"><span>${b.n}</span><span style="color:var(--red)">${ff(b.c)}</span></div>`).join('');
  return`<div class="start">
    <div class="st-l">
    ${sceneHTML('box')}
    <div class="logo"><h1>BE THE<br>DRIVER</h1><div class="tagline">Mô phỏng tài xế giao hàng</div></div>
    ${nm?`<div class="hi">Chào mừng trở lại, ${esc(nm)}!</div>`:''}
    </div>
    <div class="st-r">
    <div class="start-stats">
      <div class="pxf sstat">${ic('coin',28)}<div class="v" style="color:var(--gold)">100TR</div><div class="l">MỤC TIÊU<br>TIẾT KIỆM</div></div>
      <div class="pxf sstat">${ic('cal',28)}<div class="v" style="color:var(--cy)">24</div><div class="l">THÁNG<br>GIỚI HẠN</div></div>
      <div class="pxf sstat">${ic('bolt',28)}<div class="v" style="color:var(--or)">5</div><div class="l">PHÚT<br>MỖI NGÀY</div></div>
    </div>
    <div class="pxf">
      <div class="bills-hdr" id="bills-hdr" onclick="toggleBills()">
        <span>Chi phí mỗi tháng: <span style="color:var(--red)">${ff(BILLS)}</span></span><span id="bills-arr">▼</span>
      </div>
      <div id="bills-detail" style="display:none">${br}
        <div class="bill-row"><span>TỔNG CỘNG</span><span style="color:var(--red)">${ff(BILLS)}</span></div></div>
    </div>
    <div class="start-actions">
      ${hs
        ?`<button class="btn b-gr blk start-main" onclick="startClick(false)">TIẾP TỤC</button>
          <button class="btn b-dim blk" onclick="startClick(true)">BẮT ĐẦU MỚI</button>`
        :`<button class="btn b-gr blk start-main blink" onclick="startClick(false)">BẮT ĐẦU!</button>`}
    </div>
    </div>
  </div>`;
}

// MAIN GAME
function rGame(){
  const pct=Math.min(100,g.savings/C.winTarget*100);
  const cashLow=g.cash<8e5,fuelLow=g.fuel<15,hpLow=g.vehicleHp<30;
  const blocked=g.offers.filter(o=>!canDoOffer(o));
  const logs=g.log.slice(0,10).map(l=>`<div class="log-i ${l.t}">${l.m}</div>`).join('')||'<div class="log-i">Chưa có hoạt động.</div>';
  return`<div>
  <div class="hud pxf">
    <button class="hud-av" onclick="goProfile()" aria-label="Mở hồ sơ tài xế">${avatarHTML(g.profile.helmet,40)}</button>
    <div class="hud-who"><div class="hud-name">${esc(pname())}</div>
      <div class="hud-stars">${starsHTML(g.stars,14)}<b>${g.stars.toFixed(1)}</b></div></div>
    <div class="tags"><span class="tag${isPeak()?' peak':''}" id="clk">${fmH()}</span><span class="tag" id="day-tmr">${fmT(g.dayTimeLeft)}</span><span class="tag gr">T.${g.month}/${C.maxMonths}</span></div>
  </div>
  <div class="game-body">
  <div class="pc-col">
    ${hscene()}
    <div class="stat-row">
      <div class="pxf stat${cashLow?' warn':''}"><div class="l">${ic('coin',20)}TIỀN MẶT</div><div class="v ${cashLow?'red':'gr'}">${money(g.cash)}</div></div>
      <div class="pxf stat"><div class="l">${ic('bank',20)}TIẾT KIỆM</div><div class="v gold">${money(g.savings)}</div>
        <div class="bar thin" style="margin-top:12px"><i class="gold" style="width:${pct}%"></i></div>
        <div class="sub">${pct.toFixed(1)}% / 100TR</div></div>
    </div>
    <div class="meters">
      <div class="pxf meter" aria-label="Thể lực"><div class="meter-top"><span>${ic('bolt',20)}<em>THỂ LỰC</em></span><b>${g.stamina}</b></div>
        <div class="bar"><i class="${meterColor(g.stamina,25,50)}" style="width:${g.stamina}%"></i></div></div>
      <div class="pxf meter" aria-label="Xăng"><div class="meter-top"><span>${ic('fuel',20)}<em>XĂNG</em></span><b>${g.fuel}%</b></div>
        <div class="bar"><i class="${meterColor(g.fuel,15,40)}" style="width:${g.fuel/fuelMax()*100}%"></i></div></div>
      <div class="pxf meter hp" aria-label="Độ bền xe"><div class="meter-top"><span>${ic('gear',20)}<em>ĐỘ BỀN XE</em></span><b${hpLow?' style="color:var(--red)"':''}>${g.vehicleHp}%</b></div>
        <div class="bar"><i class="${g.vehicleHp>=60?'gr':g.vehicleHp>=30?'or':'red'}" style="width:${g.vehicleHp}%"></i></div></div>
    </div>
    <div class="lmeters">
      <div class="pxf meter" aria-label="Sức khỏe"><div class="meter-top"><span>${ic('heart',20)}<em>SỨC KHỎE</em></span><b>${g.health}</b></div>
        <div class="bar"><i class="${meterColor(g.health,35,60)}" style="width:${g.health}%"></i></div></div>
      <div class="pxf meter" aria-label="Gia đình yên tâm"><div class="meter-top"><span>${ic('house',20)}<em>GIA ĐÌNH</em></span><b>${g.family}</b></div>
        <div class="bar"><i class="${meterColor(g.family,25,50)}" style="width:${g.family}%"></i></div></div>
    </div>
    <div class="pxf strip">
      <span>${ic('cal',20)}NGÀY ${g.day}/${C.daysPerMonth}</span>
      <span>${ic('box',20)}${g.delivered} ĐƠN</span>
      ${g.debt>0?`<span style="color:var(--red)">${ic('bag',20)}NỢ ${fm(g.debt)}</span>`:''}
      ${isSick()?`<span class="rain-tag" style="color:var(--red)">${ic('pill',20)}ỐM ${g.sickDays} NGÀY</span>`:''}
      ${g.rainToday?`<span class="rain-tag">${ic('cloud',20)}MƯA</span>`:''}
    </div>
    ${g.reviews[0]?`<div id="rv-last" class="pxf2 review show static${RVNEW&&RVNEW===g.reviews[0]?' rv-new':''}" style="display:block;cursor:pointer" onclick="goProfile()"><div class="lbl" style="margin-bottom:8px">ĐÁNH GIÁ MỚI NHẤT</div>${reviewHTML(g.reviews[0])}</div>`:''}
  </div>
  <div class="pc-col">
    <div>
      <div class="sec-t">${ic('box',22)}NHẬN ĐƠN</div>
      <div class="offers">${g.offers.map(offerCard).join('')}</div>
      ${blocked.length?`<div class="job-why">${ic('warn',18)}<div>${[...new Set(blocked.map(offerWhy))].join('<br>')}</div></div>`:''}
      <div class="drive-row"><span class="lbl">TỐC ĐỘ LÁI</span>
        ${DRIVE.map((d,i)=>`<button class="btn sm ${g.drive===i?'b-gold':'b-dim'}" onclick="setDrive(${i})" aria-pressed="${g.drive===i}">${d.n}</button>`).join('')}
        <button class="btn sm b-pu" onclick="refreshOffers()">ĐỔI ĐƠN −8s</button></div>
      <div class="lbl drive-note">${['Chậm: ít tai nạn, xăng -15%, mỗi đơn +4s','Thường: không thay đổi','Nhanh: -2s mỗi đơn, nhưng dễ tai nạn và bị phạt, xăng +20%'][g.drive]}</div>
      ${isPeak()?`<div class="lbl peak-note">GIỜ CAO ĐIỂM: đơn mới trả +25%, kẹt xe gấp đôi.</div>`:''}
    </div>
    <div>
      <div class="sec-t">HÀNH ĐỘNG</div>
      <div class="util-grid">
        <button class="btn b-dim util" onclick="doRefuel()">${ic('fuel',28)}<span class="lb">NẠP XĂNG</span><span class="sb" style="color:var(--or)">${Math.round(C.fuelCost/fuelMax()).toLocaleString('vi-VN')}đ/%</span></button>
        <button class="btn b-dim util" onclick="doSleep()">${ic('moon',28)}<span class="lb">NGỦ NGHỈ</span><span class="sb" style="color:var(--cy)">+${C.sleepRate}/giây</span></button>
        <button class="btn b-pu util" onclick="goUpgrade()">${ic('gear',28)}<span class="lb">NÂNG CẤP</span><span class="sb">xe & phụ tùng</span></button>
      </div>
      <button class="btn b-dim blk life-btn" onclick="openHub()">${ic('house',24)}ĐỜI SỐNG${invTotal()>0||g.debt>0?` <small>(${[invTotal()>0?'ĐT '+fm(invTotal()):'',g.debt>0?'NỢ '+fm(g.debt):''].filter(Boolean).join(' · ')})</small>`:''}</button>
      <button class="btn b-cy blk endday" onclick="askEndDay()">${ic('flag',24)}KẾT THÚC NGÀY ${g.day}</button>
    </div>
    <div class="save-sec">
      <div class="sec-t">${ic('bank',22)}TIẾT KIỆM <span class="fold-hint">(${money(g.savings)})</span></div>
      <div class="save-grid">
        <button class="btn b-gold sm" onclick="doSave(5e5)" ${g.cash<5e5?'disabled':''}>GỬI 500K</button>
        <button class="btn b-gold sm" onclick="doSave(1e6)" ${g.cash<1e6?'disabled':''}>GỬI 1TR</button>
        <button class="btn b-gold sm" onclick="doSave(5e6)" ${g.cash<5e6?'disabled':''}>GỬI 5TR</button>
        <button class="btn b-gold sm" onclick="doSave('all')" ${g.cash<=5e5?'disabled':''}>GỬI TẤT CẢ</button>
        <button class="btn b-red sm" onclick="doWd(1e6)" ${g.savings<1e6?'disabled':''}>RÚT 1TR</button>
        <button class="btn b-red sm" onclick="doWd('all')" ${!g.savings?'disabled':''}>RÚT HẾT</button>
      </div>
      <div class="lbl save-note">"Gửi tất cả" giữ lại 500K tiền mặt.${g.cash<5e5?'<br>Chưa đủ tiền mặt để gửi (cần ít nhất 500K).':''}${!g.savings?'<br>Chưa có tiết kiệm để rút.':g.savings<1e6?'<br>Cần ít nhất 1TR tiết kiệm để rút từng phần.':''}</div>
    </div>
    <details class="fold" ${foldOpen.log||innerWidth>=860?'open':''} ontoggle="foldOpen.log=this.open">
      <summary class="sec-t">NHẬT KÝ</summary>
      <div class="log">${logs}</div>
    </details>
  </div>
  </div></div>`;
}

// (delivery has no screen of its own: progress shows inside the order card)
function rRefuelAnim(){
  if(!g.activeAnim)return'';
  const{timeLeft,startFuel,targetFuel,costPaid}=g.activeAnim;
  const s=startFuel===undefined?g.fuel:startFuel,t=targetFuel||100;
  const hose='M104 80 C 130 36, 232 36, 262 86';
  const drops=[0,.3,.6,.9].map(d=>`<rect width="6" height="6" x="-3" y="-3" fill="#ffd43b"><animateMotion path="${hose}" dur="1.2s" begin="${d}s" repeatCount="indefinite"/></rect>`).join('');
  return`<div class="anim rf-anim">
    <div class="anim-t">ĐANG ĐỔ XĂNG</div>
    <div class="scene rf-scene"><div class="sky-far still"></div><div class="sky-near still"></div><div class="road"></div>
      <svg class="rf-svg" viewBox="0 0 360 190" shape-rendering="crispEdges" aria-hidden="true">
        <g transform="translate(22,52)">${ic('fuel',104)}</g>
        <image href="${BIKE}" x="172" y="48" width="172" height="115" class="rf-bike"/>
        <path d="${hose}" fill="none" stroke="#0a0814" stroke-width="8"/>
        <path d="${hose}" fill="none" stroke="#ff9d2e" stroke-width="4" stroke-dasharray="8 8" class="rf-flow"/>
        ${drops}
      </svg></div>
    <div class="rf-pct"><b id="fuel-pct">${s}%</b><span>→ ${t}%</span></div>
    <div class="fgauge"><div id="fuel-fill" class="fgauge-fill" style="width:${s}%"></div><div class="fgauge-seg"></div></div>
    <div class="fgauge-lbl"><span>E</span><span>F</span></div>
    <div id="fuel-txt" class="refuel-txt">${timeLeft}s còn lại</div>
    <div class="lbl">Chi phí: ${ff(costPaid||0)}</div>
  </div>`;
}
function rSleepAnim(){
  return`<div class="anim">
    <div class="anim-t">ĐANG NGỦ NGHỈ</div>
    <div class="sleep-wrap">${ic('moon',88)}<span class="zzz z1">z</span><span class="zzz z2">Z</span><span class="zzz z3">Z</span></div>
    <div class="sleep-bar">
      <div class="sleep-top"><span>THỂ LỰC</span><span id="sleep-txt">${g.stamina}/100</span></div>
      <div class="bar"><i id="sleep-bar" class="gr" style="width:${g.stamina}%"></i></div>
    </div>
    <div class="lbl">+${C.sleepRate} thể lực mỗi giây</div>
    <button class="btn b-red" style="min-width:200px" onclick="stopSleep()">DỪNG NGHỈ NGƠI</button>
  </div>`;
}

// SHOP
function rShop(){
  const hp=g.vehicleHp;
  const hpClr=hp>=70?'var(--gr)':hp>=30?'var(--or)':'var(--red)';
  const cats=[...new Set(UPGS.map(u=>u.cat))];
  const items=cats.map(cat=>{
    const rows=UPGS.filter(u=>u.cat===cat).map(u=>{
      const owned=g.upgrades[u.id],locked=u.req&&!g.ms.includes(u.req);
      const swap=u.grp&&UPGS.some(x=>x.grp===u.grp&&x.id!==u.id&&g.upgrades[x.id]);
      const btn=owned&&!u.rep
        ?`<div class="owned">${ic('check',18)}ĐÃ CÓ</div>`
        :locked?`<div class="owned lock">KHÓA</div>`
        :`<button class="btn b-pu" onclick="buyUpgrade('${u.id}')" ${g.cash<u.cost||(u.rep&&g.vehicleHp>=100)?'disabled':''}>${u.rep&&g.vehicleHp>=100?'XE ĐẦY':(swap?'ĐỔI ':'')+ff(u.cost)}</button>`;
      return`<div class="pxf upg-row"><div class="upg-ic">${ic(u.icon,28)}</div>
        <div class="upg-det"><div class="upg-n">${u.name}</div><div class="upg-d">${u.desc}</div></div>
        <div class="upg-act">${btn}</div></div>`;
    }).join('');
    return`<div class="upg-cat">${cat.toUpperCase()}</div>${rows}`;
  }).join('');
  return`<div class="shop">
    <div class="shop-hdr"><button class="btn b-dim sm" onclick="goGame()">${ic('back',20)}VỀ</button><span class="shop-title">NÂNG CẤP XE</span><span style="width:76px"></span></div>
    <div class="pxf bike-card">
      <img src="${BIKE}" alt="Xe Honda Cub" style="${hp<30?'filter:grayscale(.5) brightness(.8)':''}">
      <div class="bike-hp"><span style="color:${hpClr}">ĐỘ BỀN XE</span><b style="color:${hpClr}">${hp}%</b></div>
      <div class="bar"><i class="${hp>=60?'gr':hp>=30?'or':'red'}" style="width:${hp}%"></i></div>
      ${hp<30?`<div class="bike-warn">${ic('warn',20)} XE HỎNG NẶNG — CẦN SỬA NGAY!</div>`:''}
    </div>
    <div class="upg-list">${items}</div>
  </div>`;
}

// DRIVER PROFILE
function rProfile(){
  const p=g.profile;
  const chips=HOBBIES.map(h=>{const on=p.hobbies.includes(h.id);
    return`<button class="chip${on?' on':''}" aria-pressed="${on}" onclick="toggleHobby('${h.id}')">${h.t}</button>`}).join('');
  const sws=HELMETS.map((c,i)=>`<button class="sw${c===p.helmet?' on':''}" style="--c:${c}" aria-label="Màu mũ ${i+1}" onclick="setHelmet(${i})"></button>`).join('');
  const ai=`<div class="pxf ai-row"><div class="t">Bật đánh giá<small>Khách để lại số sao và một câu nhận xét sau mỗi đơn.</small></div>
        <button class="btn sm ${p.reviewsOn?'b-gr':'b-dim'}" onclick="toggleReviews()" aria-pressed="${p.reviewsOn}">${p.reviewsOn?'BẬT':'TẮT'}</button></div>`;
  const revs=g.reviews.length?g.reviews.slice(0,10).map(r=>`<div class="pxf2 rev">
      <div class="rev-top"><span class="rev-who">${esc(r.who)}</span>${starsFixed(r.stars,16)}</div>
      <div class="rev-txt">${esc(r.text)}</div>
      <div class="rev-who" style="margin-top:8px">${ic(r.job==='food'?'bowl':'box',16)} Ngày ${r.day}, tháng ${r.month}</div></div>`).join('')
    :`<div class="pxf empty">Chưa có đánh giá nào. Hãy giao đơn đầu tiên!</div>`;
  return`<div class="prof">
    <div class="shop-hdr"><button class="btn b-dim sm" onclick="goGame()">${ic('back',20)}VỀ</button><span class="shop-title">HỒ SƠ TÀI XẾ</span><span style="width:76px"></span></div>
    <div class="pxf prof-top"><div class="avatar">${avatarHTML(p.helmet,96)}</div>
      <div class="prof-info"><div class="prof-name">${esc(pname())}</div>
        <div class="prof-avg">${starsHTML(g.stars,20)}<b>${g.stars.toFixed(1)}</b></div>
        <div class="lbl">${Math.min(10,g.reviews.length)} đánh giá gần nhất</div></div></div>
    <div class="prof-nums">
      <div class="pxf pn"><div class="v">${g.totalDelivered}</div><div class="l">ĐƠN ĐÃ GIAO</div></div>
      <div class="pxf pn"><div class="v">${g.month}/${C.maxMonths}</div><div class="l">THÁNG</div></div>
      <div class="pxf pn"><div class="v">${g.stars.toFixed(1)}</div><div class="l">SỐ SAO</div></div>
    </div>
    <div class="field"><label for="prof-name">TÊN TÀI XẾ</label>
      <input class="txt" id="prof-name" type="text" maxlength="16" placeholder="Tài xế" value="${esc(p.name)}" oninput="setName(this.value)" autocomplete="off"></div>
    <div class="field"><span class="fl">SỞ THÍCH (chọn tối đa 3)</span><div class="chips">${chips}</div></div>
    <div class="field"><label for="prof-hobby">SỞ THÍCH KHÁC</label>
      <input class="txt" id="prof-hobby" type="text" maxlength="24" placeholder="Ví dụ: sưu tầm mô hình" value="${esc(p.hobbyText)}" oninput="setHobbyText(this.value)" autocomplete="off"></div>
    <div class="field"><span class="fl">MÀU MŨ BẢO HIỂM</span><div class="swatches">${sws}</div></div>
    ${ai}
    <div class="sec-t">ĐÁNH GIÁ CỦA KHÁCH</div>
    <div class="rev-list">${revs}</div>
  </div>`;
}

// MODALS
function rModal(){
  if(!modal)return'';
  const{type}=modal;
  if(type==='event'){
    const{evt,res}=modal;
    const clr=evt.t==='good'?'var(--gr)':evt.t==='bad'?'var(--red)':'var(--or)';
    const effs=[
      res.skip?`<div class="eff red">${ic('warn',20)}Mất thu nhập lần này</div>`:'',
      res.cash>0?`<div class="eff gr">${ic('coin',20)}+${ff(res.cash)}</div>`:'',
      res.cash<0?`<div class="eff red">${ic('coin',20)}-${ff(Math.abs(res.cash))}</div>`:'',
      res.sta?`<div class="eff ${res.sta<0?'red':'gr'}">${ic('bolt',20)}${res.sta>0?'+':''}${res.sta} thể lực</div>`:'',
      res.hp?`<div class="eff ${res.hp<0?'red':'gr'}">${ic('wrench',20)}Xe ${res.hp<0?res.hp:'+'+res.hp}%</div>`:'',
      res.rain?`<div class="eff or">${ic('cloud',20)}Thu nhập giảm 40% hôm nay</div>`:'',
    ].filter(Boolean).join('');
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:${clr}">${ic(evt.ic,28)} ${evt.ti}</div>
      <div class="m-body">${res.msg}</div>
      ${effs?`<div class="m-eff">${effs}</div>`:''}
      <button class="btn b-gr blk" onclick="modal=null;render()">TIẾP TỤC</button>
    </div></div>`;
  }
  if(type==='life'){
    const e=lifeEvt();if(!e){modal=null;return''}
    const done=modal.res!==null;
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--or)">${ic(e.ic,28)} ${e.ti}</div>
      <div class="m-body">${done?esc(modal.res):esc(e.text())}</div>
      ${done?`<button class="btn b-gr blk" onclick="lifeClose()">TIẾP TỤC</button>`
        :`<div class="life-ch">${e.choices.map((c,i)=>`<button class="btn ${i?'b-dim':'b-gr'} blk" ${c.ok&&!c.ok()?'disabled':''} onclick="lifeChoose(${i})">${c.l}</button>`).join('')}</div>`}
    </div></div>`;
  }
  if(type==='hub'){
    const rb=(a,l)=>`<button class="btn b-gold sm" onclick="remit(${a})" ${g.cash<a?'disabled':''}>${l}</button>`;
    const lb=(fn,cls,l,dis)=>`<button class="btn ${cls} sm" onclick="${fn}" ${dis?'disabled':''}>${l}</button>`;
    return`<div class="overlay"><div class="pxf2 modal hub">
      <div class="m-title" style="color:var(--gold)">${ic('house',28)} ĐỜI SỐNG</div>
      <div class="hub-sum"><span>Tiền mặt <b>${ff(g.cash)}</b></span><span>Sức khỏe <b>${g.health}</b></span><span>Gia đình <b>${g.family}</b></span></div>
      <section class="hub-sec">
        <div class="sec-t">${ic('phone',20)}GỬI TIỀN VỀ QUÊ</div>
        <div class="hub-grid g4">${rb(2e5,'200K')}${rb(5e5,'500K')}${rb(1e6,'1TR')}${rb(2e6,'2TR')}</div>
        <div class="sub">Gia đình lo lắng dần theo tháng. Yên tâm thì mẹ gửi đồ quê, lo quá thì bạn ăn ngủ không yên.</div>
      </section>
      ${g.drink>0||g.gamble>0?`<section class="hub-sec">
        <div class="sec-t">${ic('heart',20)}THÓI QUEN</div>
        <div class="hub-habits">${g.drink>0?`<span>${ic('beer',20)} Rượu bia <b>${g.drink}</b>/100</span>`:''}${g.gamble>0?`<span>${ic('dice',20)} Cờ bạc <b>${g.gamble}</b>/100</span>`:''}</div>
        <div class="hub-grid g1">${lb('quitHabits()','b-dim',g.quitM===g.month?'ĐÃ TỰ NHỦ THÁNG NÀY':'TỰ NHỦ BỚT LẠI (-15)',g.quitM===g.month)}</div>
      </section>`:''}
      <section class="hub-sec">
        <div class="sec-t">${ic('bag',20)}VAY & TRẢ NỢ</div>
        <div class="hub-debt">Nợ <b style="color:${g.debt?'var(--red)':'inherit'}">${ff(g.debt)}</b>${g.debt?` <em>lãi ${Math.round(g.debtRate*100)}%/tháng</em>`:''}</div>
        ${g.debt>0?`<div class="hub-grid g3">${lb('repay(1e6);render()','b-gr','TRẢ 1TR',g.cash<1e6)}${lb('repay(5e6);render()','b-gr','TRẢ 5TR',g.cash<5e6)}${lb('repay(g.debt);render()','b-gr','TRẢ HẾT',g.cash<=0)}</div>`:''}
        <div class="hub-grid g2">${lb("takeLoan('hot')",'b-red','<span>VAY NÓNG 3TR<small>lãi 15%/tháng</small></span>',g.debt>=2e7)}${lb("takeLoan('app')",'b-red','<span>VAY APP 5TR<small>phí 10%, lãi 25%</small></span>',g.debt>=2e7)}</div>
        <div class="sub">Lãi cộng dồn mỗi tháng. Nợ từ 30TR là bị siết nhà. Phải hết nợ mới được tính là thắng.</div>
      </section>
      <section class="hub-sec">
        <div class="sec-t">${ic('chart',20)}ĐẦU TƯ (GIÁ ĐỔI MỖI NGÀY)</div>
        ${INVS.map(x=>`<div class="inv-row"><div class="inv-h">${ic(x.ic,28)}<div><b>${x.n}</b> <span>${fm(invOf(x.id))}</span>${invOf(x.id)>0?` <em class="${invOf(x.id)-(g.invCost[x.id]||0)>=0?'up':'dn'}">${invOf(x.id)-(g.invCost[x.id]||0)>=0?'lãi':'lỗ'} ${fm(Math.abs(invOf(x.id)-(g.invCost[x.id]||0)))}</em>`:''}<div class="sub">${x.d}</div></div></div>
          <div class="hub-grid g3">${lb(`invBuy('${x.id}',1e6)`,'b-gr','MUA 1TR',g.cash<1e6)}${lb(`invBuy('${x.id}',5e6)`,'b-gr','MUA 5TR',g.cash<5e6)}${lb(`invSell('${x.id}','all')`,'b-red','BÁN HẾT',invOf(x.id)<=0)}</div></div>`).join('')}
        <div class="sub">Giá thay đổi mỗi ngày, lãi lỗ hiện ở bảng cuối ngày. Bán mất phí 1%. Hết 24 tháng, đầu tư tự bán vào tiết kiệm.</div>
      </section>
      <section class="hub-sec">
        <div class="sec-t">${ic('ticket',20)}VÉ SỐ</div>
        <div class="hub-debt">Vé hôm nay <b>${g.tickets}</b> tờ <em>(${ff(g.tickets*TICKET)})</em></div>
        <div class="hub-grid g3">${lb('lottoHub(1)','b-gold','<span>MUA 1 TỜ<small>20K</small></span>',g.cash<TICKET||g.tickets>=TICKET_MAX)}${lb('lottoHub(5)','b-gold','<span>MUA 5 TỜ<small>100K</small></span>',g.cash<5*TICKET||g.tickets>TICKET_MAX-5)}${lb('lottoHub(10)','b-gold','<span>MUA 10 TỜ<small>200K</small></span>',g.cash<10*TICKET||g.tickets>TICKET_MAX-10)}</div>
        <div class="sub">Vé 20K một tờ, tối nay xổ số, kết quả hiện ở bảng cuối ngày. Giải 100K, 1TR, độc đắc 10TR nhưng rất hiếm. Tối đa ${TICKET_MAX} tờ mỗi ngày. Mua nhiều dễ thành thói quen.</div>
      </section>
      <section class="hub-sec">
        <div class="sec-t">${ic('dice',20)}SÒNG BÀI · BLACKJACK</div>
        <div class="hub-debt">Hôm nay còn <b>${BJ_MAX-g.bjToday}</b>/${BJ_MAX} ván <em>(tổng ${g.bjNet>=0?'+':''}${ff(g.bjNet)})</em></div>
        <div class="hub-grid g1">${lb('bjOpen()','b-gold','VÀO BÀN',false)}</div>
        <div class="sub">Blackjack chuẩn, bộ bài mới mỗi ván, trả 3:2. Tối đa ${BJ_MAX} ván mỗi ngày, mỗi ván tốn ${BJ_TIME} giây và tăng chỉ số cờ bạc. Thắng thua hoàn toàn do may rủi, bạn tự chịu trách nhiệm.</div>
      </section>
      <button class="btn b-cy blk" onclick="modal=null;render()">ĐÓNG</button>
    </div></div>`;
  }
  if(type==='bj')return bjHTML();
  if(type==='chapter'){
    const c=CHAPTERS[modal.n],note=chapterNote();
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--gold)">${ic('cal',28)} ${c.ti}</div>
      <div class="m-body">${c.tx}${note?`<br><br>${esc(note)}`:''}</div>
      <button class="btn b-gr blk" onclick="g.lifeSeen['c'+modal.n]=1;modal=null;save();render()">TIẾP TỤC</button>
    </div></div>`;
  }
  if(type==='confirmEnd'){
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--or)">${ic('flag',28)} KẾT THÚC NGÀY?</div>
      <div class="m-body">Ngày còn ${fmT(g.dayTimeLeft)}. Kết thúc sớm sẽ bỏ lỡ thời gian giao hàng.</div>
      <div class="rf-btns"><button class="btn b-dim" onclick="modal=null;render()">Ở LẠI</button>
      <button class="btn b-cy" onclick="modal=null;doEndDay()">KẾT THÚC</button></div>
    </div></div>`;
  }
  if(type==='tut'){
    const P=TUT[modal.i],last=modal.i===TUT.length-1;
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--gold)">${ic(P.ic,28)} ${P.t}</div>
      <div class="m-body">${P.b}</div>
      <div class="lbl" style="text-align:center">${modal.i+1}/${TUT.length}</div>
      <div class="rf-btns">
        ${modal.i>0?`<button class="btn b-dim" onclick="modal.i--;render()">◀</button>`:`<button class="btn b-dim" onclick="${modal.from==='pause'?"modal={type:'pause'};render()":'tutDone()'}">BỎ QUA</button>`}
        ${last?`<button class="btn b-gr" onclick="${modal.from==='pause'?"modal={type:'pause'};render()":'tutDone()'}">XONG</button>`:`<button class="btn b-gr" onclick="modal.i++;render()">TIẾP ▶</button>`}
      </div>
    </div></div>`;
  }
  if(type==='pause'){
    return`<div class="overlay"><div class="pxf2 modal set-box">
      <div class="m-title" style="color:var(--gold)">${ic('pause',28)} TẠM DỪNG</div>
      <div class="lbl" style="text-align:center">Thời gian đang dừng.</div>
      <button class="btn b-gr blk" onclick="resumeGame()">TIẾP TỤC</button>
      <button class="btn b-dim blk" style="margin-top:8px" onclick="openSettings()">ÂM THANH</button>
      <button class="btn b-dim blk" style="margin-top:8px" onclick="modal={type:'tut',i:0,from:'pause'};render()">HƯỚNG DẪN</button>
      <button class="btn b-dim blk" style="margin-top:8px" onclick="askHome()">VỀ MÀN HÌNH BẮT ĐẦU</button>
    </div></div>`;
  }
  if(type==='confirmHome'){
    const mid=!!DLV||g.phase==='anim-refuel';
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--or)">${ic('flag',28)} VỀ MÀN HÌNH BẮT ĐẦU?</div>
      <div class="m-body">Game được lưu lại, bạn có thể bấm TIẾP TỤC để chơi tiếp.${mid?' Đơn hoặc việc đang làm dở sẽ bị hủy, xăng và thể lực đã dùng không được hoàn lại.':''}</div>
      <div class="rf-btns"><button class="btn b-dim" onclick="cancelHome()">Ở LẠI</button>
      <button class="btn b-cy" onclick="goHome()">VỀ MÀN HÌNH</button></div>
    </div></div>`;
  }
  if(type==='settings'){
    return`<div class="overlay" onclick="if(event.target===this)closeSettings()"><div class="pxf2 modal set-box">
      <div class="m-title" style="color:var(--cy)">${ic(AUD.on||AUD.sfx?'sound':'mute',28)} ÂM THANH</div>
      <div class="set-row"><span class="m-h" style="color:var(--gold);margin:0">NHẠC NỀN</span>
        <button class="btn sm ${AUD.on?'b-gr':'b-dim'}" onclick="toggleMusic()" aria-pressed="${AUD.on}">${AUD.on?'BẬT':'TẮT'}</button></div>
      <div class="set-row trk"><span>Bài hát</span><span class="trk-ctl">
        <button class="btn sm b-dim" onclick="skipTrack(-1)" ${g.phase==='start'?'disabled':''} aria-label="Bài trước">◀</button>
        <button class="btn sm b-dim" onclick="skipTrack(1)" ${g.phase==='start'?'disabled':''} aria-label="Bài sau">▶</button></span></div>
      <div class="lbl trk-name">${g.phase==='start'?'Màn hình bắt đầu: nhạc cố định':`${AUD.track+1}/${TRACKS.length} · ${TRACKS[AUD.track].n}`}</div>
      <div class="set-row"><span>Âm lượng nhạc</span><b id="vol-lbl">${Math.round(AUD.vol*100)}%</b></div>
      <input id="vol-slider" type="range" min="0" max="100" step="5" value="${Math.round(AUD.vol*100)}" oninput="setVolume(this.value)" aria-label="Âm lượng nhạc nền">
      <div class="set-row" style="margin-top:6px"><span class="m-h" style="color:var(--gold);margin:0">HIỆU ỨNG</span>
        <button class="btn sm ${AUD.sfx?'b-gr':'b-dim'}" onclick="toggleSfx()" aria-pressed="${AUD.sfx}">${AUD.sfx?'BẬT':'TẮT'}</button></div>
      <div class="set-row"><span>Âm lượng hiệu ứng</span><b id="sfx-lbl">${Math.round(AUD.sfxVol*100)}%</b></div>
      <input id="sfx-slider" type="range" min="0" max="100" step="5" value="${Math.round(AUD.sfxVol*100)}" oninput="setSfxVolume(this.value)" onchange="sfxPreview()" aria-label="Âm lượng hiệu ứng">
      <div class="lbl" style="text-align:center;font-size:16px">Phiên bản ${BUILD}</div>
      <button class="btn b-gr blk" onclick="closeSettings()">ĐÓNG</button>
    </div></div>`;
  }
  if(type==='milestone'){
    const un=UPGS.filter(u=>modal.list.some(m=>m.at===u.req));
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--gold)">${ic('trophy',28)} MỐC TIẾT KIỆM!</div>
      ${modal.list.map(m=>`<div class="m-body">Đạt ${ff(m.at)}<br>Thưởng +${ff(m.reward)}</div>`).join('')}
      ${un.length?`<div class="m-eff"><div class="eff gr">${ic('star',20)}Mở khóa: ${un.map(u=>u.name).join(', ')}</div></div>`:''}
      <button class="btn b-gr blk" onclick="modal=null;render()">TIẾP TỤC</button>
    </div></div>`;
  }
  if(type==='refuel'){
    const i=rfInfo(),fm=fuelMax();
    return`<div class="rf-overlay"><div class="pxf2 rf-box">
      <div class="rf-title">ĐỔ XĂNG</div>
      <div class="rf-gauge"><span>Bình xăng</span>
        <div class="bar"><i id="rf-fill" class="or" style="width:${i.t/fm*100}%;opacity:.5"></i><i class="or" style="width:${g.fuel/fm*100}%"></i></div>
        <span class="lbl-v" id="rf-lbl">${i.t}/${fm}%</span></div>
      <div class="lbl">Kéo thanh trượt để chọn lượng xăng muốn đổ</div>
      <input id="rf-slider" type="range" min="${g.fuel}" max="${fm}" step="1" value="${i.t}" oninput="rfSlide(this.value)" aria-label="Lượng xăng muốn đổ">
      <div class="rf-cost"><span>Đổ thêm: <b id="rf-add">${i.fill}%</b></span><span>Chi phí: <b id="rf-cost">${ff(i.cost)}</b></span></div>
      <div id="rf-warn" class="rf-warn" hidden>Không đủ tiền!</div>
      <div class="rf-btns"><button class="btn b-dim" onclick="modal=null;render()">HỦY</button>
        <button id="rf-go" class="btn b-or" onclick="rfConfirm()" ${i.ok&&i.fill>0?'':'disabled'}>ĐỔ XĂNG</button></div>
    </div></div>`;
  }
  if(type==='dayEnd'){
    const{earned,spent,interest,day}=modal;const net=earned-spent;
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--cy)">${ic('cal',28)} KẾT NGÀY ${day}</div>
      <div class="day-grid">
        <div class="day-row"><span>Thu nhập</span><span style="color:var(--gr)">+${ff(earned)}</span></div>
        <div class="day-row"><span>Chi tiêu</span><span style="color:var(--red)">-${ff(spent)}</span></div>
        <div class="day-div"></div>
        <div class="day-row"><span>Kết quả</span><span style="color:${net>=0?'var(--gr)':'var(--red)'}">${net>=0?'+':''}${ff(net)}</span></div>
        <div class="day-div"></div>
        <div class="day-row"><span>Số đơn giao</span><span>${modal.n}${modal.n?` <small>(TB ${fm(Math.round(earned/modal.n))})</small>`:''}</span></div>
        ${modal.best?`<div class="day-row"><span>Đơn cao nhất</span><span style="color:var(--gold)">${ff(modal.best)}</span></div>`:''}
        <div class="day-row"><span>Sự cố gặp phải</span><span style="color:${modal.mishap?'var(--red)':'var(--gr)'}">${modal.mishap||'Không'}</span></div>
        <div class="day-row"><span>Đánh giá · Độ bền xe</span><span>${modal.stars.toFixed(1)}★ · ${Math.round(modal.hp)}%</span></div>
        ${modal.prev!==null?`<div class="day-row"><span>So với hôm qua</span><span style="color:${net>=modal.prev?'var(--gr)':'var(--red)'}">${net>=modal.prev?'+':'-'}${ff(Math.abs(net-modal.prev))}</span></div>`:''}
      </div>
      <div class="interest">${ic('bank',20)} LÃI TIẾT KIỆM ${(C.dailyInterest*100).toFixed(1).replace(/\.0$/,'')}%: +${ff(interest)}<small>Tiết kiệm: ${ff(g.savings)}</small></div>
      ${(modal.inv&&modal.inv.length)?`<div class="day-sec"><div class="m-h" style="color:var(--cy)">${ic('chart',20)} ĐẦU TƯ HÔM NAY</div>${modal.inv.map(r=>`<div class="day-row"><span>${ic(r.ic,20)} ${r.n} <small>${r.pct>=0?'+':''}${r.pct.toFixed(1)}%</small></span><span style="color:${r.delta>=0?'var(--gr)':'var(--red)'}">${r.delta>=0?'+':'-'}${ff(Math.abs(r.delta))}</span></div><div class="day-sub"><span>Giá trị ${fm(r.val)}</span><span style="color:${r.pl>=0?'var(--gr)':'var(--red)'}">${r.pl>=0?'Lãi':'Lỗ'} tổng ${fm(Math.abs(r.pl))}</span></div>`).join('')}</div>`:''}
      ${(modal.lot&&modal.lot.n>0)?`<div class="day-sec"><div class="m-h" style="color:var(--gold)">${ic('ticket',20)} XỔ SỐ TỐI NAY</div><div class="day-row"><span>${modal.lot.n} tờ vé <small>(-${fm(modal.lot.cost)})</small></span><span style="color:${modal.lot.prize>0?'var(--gr)':'var(--dim)'}">${modal.lot.prize>0?'TRÚNG +'+fm(modal.lot.prize):'không trúng'}</span></div>${modal.lot.best>=1e7?'<div class="day-sub"><span style="color:var(--gold)">ĐỘC ĐẮC! Bạn không tin vào mắt mình.</span></div>':modal.lot.best>=1e6?'<div class="day-sub"><span style="color:var(--gold)">Trúng giải lớn, may mắn thật.</span></div>':''}</div>`:''}
      ${(modal.ms||[]).map(m=>`<div class="interest">${ic('trophy',20)} MỐC ${fm(m.at)}: thưởng +${ff(m.reward)}</div>`).join('')}
      <button class="btn b-gr blk" onclick="confirmDayEnd()">${day<C.daysPerMonth?'NGÀY '+(day+1):'KẾT THÁNG'}</button>
    </div></div>`;
  }
  if(type==='monthEnd'){
    const{month,earned,bonus,del,bills}=modal;const net=earned+bonus-bills;
    const billRows=C.monthly.map(b=>`<div class="month-row"><span>${b.n}</span><span style="color:var(--red)">-${ff(b.c)}</span></div>`).join('')+UPGS.filter(u=>u.fee&&g.upgrades[u.id]).map(u=>`<div class="month-row"><span>Phí ${u.name}</span><span style="color:var(--red)">-${ff(u.fee)}</span></div>`).join('');
    const bl=del>=480?'(KIM CƯƠNG)':del>=360?'(VÀNG)':del>=240?'(BẠC)':'';
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--gold)">${ic('cal',28)} THÁNG ${month} KẾT THÚC</div>
      <div class="lbl" style="margin-bottom:8px">${del} đơn ${bl}</div>
      <div class="m-h" style="color:var(--gr)">THU NHẬP</div>
      <div class="month-row"><span>Giao hàng</span><span style="color:var(--gr)">+${ff(earned)}</span></div>
      ${bonus?`<div class="month-row"><span>Thưởng Be ${bl} + đánh giá ${modal.stars.toFixed(1)}★</span><span style="color:var(--gr)">+${ff(bonus)}</span></div>`:''}
      <div class="m-h" style="color:var(--red)">CHI PHÍ</div>
      ${billRows}
      <div class="bar" style="margin:14px 4px"><i class="${net>=0?'gr':'red'}" style="width:100%"></i></div>
      <div class="month-row" style="color:var(--tx)"><span>KẾT QUẢ</span><span style="color:${net>=0?'var(--gr)':'var(--red)'}">${net>=0?'+':''}${ff(net)}</span></div>
      <div class="lbl" style="margin:8px 0 14px">Tiền mặt sau: ${ff(g.cash+bonus-bills)}${g.cash+bonus-bills<0&&g.savings>0?'<br>Thiếu sẽ tự rút từ tiết kiệm.':''}</div>
      <button class="btn b-gr blk" onclick="confirmMonthEnd()">${month<C.maxMonths?'THÁNG '+(month+1):'KẾT THÚC GAME'}</button>
    </div></div>`;
  }
  return'';
}

// END
function finRows(){
  const f=g.fin,r=(n,v,c)=>`<div class="month-row"><span>${n}</span><span style="color:var(--${c})">${c==='gr'?'+':'-'}${ff(v)}</span></div>`;
  return`<div class="sec-t" style="margin-top:12px">TIỀN ĐI ĐÂU?</div>`+r('Thu từ giao hàng',f.earn,'gr')+r('Xăng',f.fuel,'red')+r('Sửa xe',f.repair,'red')+r('Nâng cấp',f.upg,'red')+r('Tai nạn & phạt',f.accident,'red')+r('Hóa đơn tháng',f.bills,'red')+(f.life?r('Gia đình & đời sống',f.life,'red'):'')+(f.loan?r('Lãi vay',f.loan,'red'):'');
}
function rEnd(win){
  const m=g.month,lack=Math.max(0,C.winTarget-g.savings+g.debt);
  if(win)return`<div class="end">
    ${ic('trophy',88)}
    <h1 style="color:var(--gold);font-family:var(--f-tx);font-size:44px">CHIẾN THẮNG!</h1>
    <div class="lbl">${esc(pname())} đã đạt mục tiêu 100 triệu</div>
    <div class="end-t" style="color:var(--gold)">${endingInfo(true).t}</div><div class="lbl">${endingInfo(true).l}</div>
    <div class="pxf end-stats">
      <div class="month-row"><span>Tiết kiệm</span><span style="color:var(--gold)">${ff(g.savings)}</span></div>
      <div class="month-row"><span>Mức khắc nghiệt</span><span style="color:${HARDS[g.hard].c}">${HARDS[g.hard].n}</span></div>
      <div class="month-row"><span>Số tháng</span><span>${m}/24</span></div>
      <div class="month-row"><span>Tổng đơn</span><span>${g.totalDelivered}</span></div>
      <div class="month-row"><span>Đánh giá</span><span>${g.stars.toFixed(1)}/5.0</span></div>
      ${finRows()}
    </div>
    <button class="btn b-gr" onclick="resetGame()">CHƠI LẠI</button>
  </div>`;
  return`<div class="end">
    ${ic('skull',88)}
    <h1 style="color:var(--red);font-family:var(--f-tx);font-size:44px">THẤT BẠI</h1>
    <div class="lbl">${g.endWhy==='debt'?'Nợ nần chồng chất, chủ nợ siết hết!':g.month>C.maxMonths?(g.debt>0?'Hết 24 tháng, còn nợ!':'Hết 24 tháng!'):'Hết tiền!'}</div>
    <div class="end-t" style="color:var(--red)">${endingInfo(false).t}</div><div class="lbl">${endingInfo(false).l}</div>
    <div class="pxf end-stats">
      <div class="month-row"><span>Mức khắc nghiệt</span><span style="color:${HARDS[g.hard].c}">${HARDS[g.hard].n}</span></div>
      ${g.debt>0?`<div class="month-row"><span>Còn nợ</span><span style="color:var(--red)">${ff(g.debt)}</span></div>`:''}
      <div class="month-row"><span>Đã tiết kiệm</span><span>${ff(g.savings)}</span></div>
      <div class="month-row"><span>Còn thiếu</span><span style="color:var(--red)">${ff(lack)}</span></div>
      <div class="month-row"><span>Tổng đơn</span><span>${g.totalDelivered}</span></div>
      ${finRows()}
    </div>
    <button class="btn b-gr" onclick="resetGame()">THỬ LẠI</button>
  </div>`;
}

// INIT
init();render();getSample();
