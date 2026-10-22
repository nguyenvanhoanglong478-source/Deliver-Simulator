let foldOpen={sav:false,log:false};
const TUT=[
 {ic:'flag',t:T('MỤC TIÊU','GOAL'),b:T('Tiết kiệm 100 triệu trong 24 tháng. Cuối mỗi tháng có hóa đơn 6,5 triệu phải trả, nên đừng tiêu hết tiền mặt.','Save 100 million in 24 months. A 6.5 million bill is due at the end of every month, so don\'t spend all your cash.')},
 {ic:'box',t:T('NHẬN ĐƠN','TAKE ORDERS'),b:T('Chọn một trong các đơn hàng rồi chờ giao xong: thanh tiến độ chạy ngay trong ô đơn, mỗi lần chỉ giao một đơn. Đơn xa trả cao nhưng tốn thể lực, xăng và thời gian. Đơn ghép trả nhiều hơn nhưng lâu và tốn hơn.','Pick an order and wait until it is delivered: the progress bar runs inside the order card, and you can only deliver one order at a time. Far orders pay more but cost stamina, fuel and time. Combo orders pay even more but take longer and cost more.')},
 {ic:'fuel',t:T('THỂ LỰC VÀ XĂNG','STAMINA AND FUEL'),b:T('Hết xăng hoặc thể lực thì không giao được. Dùng NẠP XĂNG và NGỦ NGHỈ, nhưng ngủ tốn thời gian trong ngày.','You can\'t deliver with no fuel or stamina. Use REFUEL and SLEEP, but sleeping eats into the day.')},
 {ic:'cal',t:T('MỘT NGÀY GAME','A GAME DAY'),b:T('Mỗi ngày chạy từ 06:00 đến 22:00. Giờ cao điểm (11-13h, 17-19h) đơn trả thêm 25% nhưng dễ kẹt xe. Bấm ⏸ hoặc phím P để tạm dừng.','Each day runs from 06:00 to 22:00. At peak hours (11-13h, 17-19h) orders pay 25% more but traffic jams are likelier. Press ⏸ or the P key to pause.')},
 {ic:'house',t:T('ĐỜI SỐNG','LIFE'),b:T('Bạn là người từ quê lên phố. Sức khỏe, gia đình và nợ nần cũng ảnh hưởng ván chơi: ốm thì không chạy xe, gia đình lo thì tinh thần xuống. Mở mục ĐỜI SỐNG để gửi tiền về quê, đầu tư hoặc trả nợ. Thỉnh thoảng sẽ có lời rủ rê, hãy cân nhắc.','You came to the city from the countryside. Health, family and debt also shape your run: when sick you can\'t ride, and a worried family drags you down. Open LIFE to send money home, invest or pay off debt. Now and then someone will tempt you, so think twice.')},
 {ic:'gear',t:T('NÂNG CẤP','UPGRADES'),b:T('Mua phụ tùng, túi giao hàng và động cơ ở mục NÂNG CẤP. Một số món loại trừ nhau, GPS và bảo hiểm tính phí hàng tháng. Gửi tiền tiết kiệm để nhận lãi mỗi ngày.','Buy parts, delivery bags and engines in UPGRADES. Some items exclude each other, and GPS and insurance charge a monthly fee. Put money in savings to earn interest every day.')}
];
// ===== RENDER =====
function money(n){n=Math.round(n);return(n<0?'-':'')+Math.abs(n).toLocaleString(NUM_LOCALE)+'<span class="cur">đ</span>'}
function meterColor(v,lo,mid){return v<lo?'red':v<mid?'or':'gr'}
function offerCard(o,i){
  if(DLV&&DLV.i===i){
    const job=C.jobs[DLV.o.type],left=dlvLeft(),pc=Math.min(100,(1-left/DLV.dur)*100);
    return`<div class="btn ${DLV.o.type==='food'?'b-gr':'b-cy'} offer delivering${DLV.o.rush?' rush':''}" aria-live="polite">
    <span class="of-main"><span class="nm">${T('ĐANG GIAO','DELIVERING')} · ${job.name}</span><span class="er">${money(DLV.earn)}</span>
      <span class="dl-track"><span class="dl-bar" id="dl-bar" style="width:${pc}%"></span></span></span>
    <span class="co"><span id="dl-t">${Math.ceil(left)}s</span></span>
  </div>`;
  }
  const c=offerCost(o),d=DIST[o.dist],job=C.jobs[o.type],ok=canDoOffer(o)&&!DLV;
  return`<button class="btn ${o.type==='food'?'b-gr':'b-cy'} offer${o.rush?' rush':''}${o.combo?' combo':''}" ${ok?'':'disabled'} onclick="doDelivery(${i})">
    <span class="of-ic">${ic(job.icon,32)}</span>
    <span class="of-main"><span class="nm">${job.name} · ${d.n} <span class="pips" aria-hidden="true">${[0,1,2].map(k=>`<i${k<=o.dist?' class="on"':''}></i>`).join('')}</span></span><span class="er">${money(offerPay(o))}</span>
      <span class="of-tags">${o.combo?`<b class="tg combo">${T('ĐƠN GHÉP','COMBO')}</b>`:''}${o.rush?`<b class="tg rush">${T('GẤP','RUSH')}</b>`:''}${o.peak?`<b class="tg peak">${T('CAO ĐIỂM','PEAK')}</b>`:''}</span></span>
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
    <img class="bike" src="${BIKE}" alt="${T('Xe Honda Cub','Honda Cub bike')}">${cargo?`<div class="cargo">${ic(cargo,32)}</div>`:''}</div>`;
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
    <div class="logo"><h1>${T('MỘT NGÀY<br>LÀM SHIPPER','SHIPPER<br>SIMULATOR')}</h1><div class="tagline">${T('Mô phỏng tài xế giao hàng','Delivery driver simulation')}</div>${langBtns()}</div>
    ${nm?`<div class="hi">${T(`Chào mừng trở lại, ${esc(nm)}!`,`Welcome back, ${esc(nm)}!`)}</div>`:''}
    </div>
    <div class="st-r">
    <div class="start-stats">
      <div class="pxf sstat">${ic('coin',28)}<div class="v" style="color:var(--gold)">${T('100TR','100M')}</div><div class="l">${T('MỤC TIÊU<br>TIẾT KIỆM','SAVINGS<br>GOAL')}</div></div>
      <div class="pxf sstat">${ic('cal',28)}<div class="v" style="color:var(--cy)">24</div><div class="l">${T('THÁNG<br>GIỚI HẠN','MONTH<br>LIMIT')}</div></div>
      <div class="pxf sstat">${ic('bolt',28)}<div class="v" style="color:var(--or)">5</div><div class="l">${T('PHÚT<br>MỖI NGÀY','MINUTES<br>PER DAY')}</div></div>
    </div>
    <div class="pxf">
      <div class="bills-hdr" id="bills-hdr" onclick="toggleBills()">
        <span>${T('Chi phí mỗi tháng:','Monthly costs:')} <span style="color:var(--red)">${ff(BILLS)}</span></span><span id="bills-arr">▼</span>
      </div>
      <div id="bills-detail" style="display:none">${br}
        <div class="bill-row"><span>${T('TỔNG CỘNG','TOTAL')}</span><span style="color:var(--red)">${ff(BILLS)}</span></div></div>
    </div>
    <div class="start-actions">
      ${hs
        ?`<button class="btn b-gr blk start-main" onclick="startClick(false)">${T('TIẾP TỤC','CONTINUE')}</button>
          <button class="btn b-dim blk" onclick="startClick(true)">${T('BẮT ĐẦU MỚI','NEW GAME')}</button>`
        :`<button class="btn b-gr blk start-main blink" onclick="startClick(false)">${T('BẮT ĐẦU!','START!')}</button>`}
    </div>
    </div>
  </div>`;
}

// MAIN GAME
function rGame(){
  const pct=Math.min(100,g.savings/C.winTarget*100);
  const cashLow=g.cash<8e5,fuelLow=g.fuel<15,hpLow=g.vehicleHp<30;
  const blocked=g.offers.filter(o=>!canDoOffer(o));
  const logs=g.log.slice(0,10).map(l=>`<div class="log-i ${l.t}">${l.m}</div>`).join('')||'<div class="log-i">'+T('Chưa có hoạt động.','No activity yet.')+'</div>';
  return`<div>
  <div class="hud pxf">
    <button class="hud-av" onclick="goProfile()" aria-label="${T('Mở hồ sơ tài xế','Open driver profile')}">${avatarHTML(g.profile.helmet,40)}</button>
    <div class="hud-who"><div class="hud-name">${esc(pname())}</div>
      <div class="hud-stars">${starsHTML(g.stars,14)}<b>${g.stars.toFixed(1)}</b></div></div>
    <div class="tags"><span class="tag${isPeak()?' peak':''}" id="clk">${fmH()}</span><span class="tag" id="day-tmr">${fmT(g.dayTimeLeft)}</span><span class="tag gr">${T('T.','M')}${g.month}/${C.maxMonths}</span></div>
  </div>
  <div class="game-body">
  <div class="pc-col">
    ${hscene()}
    <div class="stat-row">
      <div class="pxf stat${cashLow?' warn':''}"><div class="l">${ic('coin',20)}${T('TIỀN MẶT','CASH')}</div><div class="v ${cashLow?'red':'gr'}">${money(g.cash)}</div></div>
      <div class="pxf stat"><div class="l">${ic('bank',20)}${T('TIẾT KIỆM','SAVINGS')}</div><div class="v gold">${money(g.savings)}</div>
        <div class="bar thin" style="margin-top:12px"><i class="gold" style="width:${pct}%"></i></div>
        <div class="sub">${pct.toFixed(1)}% / ${T('100TR','100M')}</div></div>
    </div>
    <div class="meters">
      <div class="pxf meter" aria-label="${T('Thể lực','Stamina')}"><div class="meter-top"><span>${ic('bolt',20)}<em>${T('THỂ LỰC','STAMINA')}</em></span><b>${g.stamina}</b></div>
        <div class="bar"><i class="${meterColor(g.stamina,25,50)}" style="width:${g.stamina}%"></i></div></div>
      <div class="pxf meter" aria-label="${T('Xăng','Fuel')}"><div class="meter-top"><span>${ic('fuel',20)}<em>${T('XĂNG','FUEL')}</em></span><b>${g.fuel}%</b></div>
        <div class="bar"><i class="${meterColor(g.fuel,15,40)}" style="width:${g.fuel/fuelMax()*100}%"></i></div></div>
      <div class="pxf meter hp" aria-label="${T('Độ bền xe','Bike condition')}"><div class="meter-top"><span>${ic('gear',20)}<em>${T('ĐỘ BỀN XE','BIKE')}</em></span><b${hpLow?' style="color:var(--red)"':''}>${g.vehicleHp}%</b></div>
        <div class="bar"><i class="${g.vehicleHp>=60?'gr':g.vehicleHp>=30?'or':'red'}" style="width:${g.vehicleHp}%"></i></div></div>
    </div>
    <div class="lmeters">
      <div class="pxf meter" aria-label="${T('Sức khỏe','Health')}"><div class="meter-top"><span>${ic('heart',20)}<em>${T('SỨC KHỎE','HEALTH')}</em></span><b>${g.health}</b></div>
        <div class="bar"><i class="${meterColor(g.health,35,60)}" style="width:${g.health}%"></i></div></div>
      <div class="pxf meter" aria-label="${T('Gia đình yên tâm','Family at ease')}"><div class="meter-top"><span>${ic('house',20)}<em>${T('GIA ĐÌNH','FAMILY')}</em></span><b>${g.family}</b></div>
        <div class="bar"><i class="${meterColor(g.family,25,50)}" style="width:${g.family}%"></i></div></div>
    </div>
    <div class="pxf strip">
      <span>${ic('cal',20)}${T(`NGÀY ${g.day}/${C.daysPerMonth}`,`DAY ${g.day}/${C.daysPerMonth}`)}</span>
      <span>${ic('box',20)}${T(`${g.delivered} ĐƠN`,`${g.delivered} ORDERS`)}</span>
      ${g.debt>0?`<span style="color:var(--red)">${ic('bag',20)}${T(`NỢ ${fm(g.debt)}`,`DEBT ${fm(g.debt)}`)}</span>`:''}
      ${isSick()?`<span class="rain-tag" style="color:var(--red)">${ic('pill',20)}${T(`ỐM ${g.sickDays} NGÀY`,`SICK ${g.sickDays} DAYS`)}</span>`:''}
      ${g.rainToday?`<span class="rain-tag">${ic('cloud',20)}${T('MƯA','RAIN')}</span>`:''}
    </div>
    ${g.reviews[0]?`<div id="rv-last" class="pxf2 review show static${RVNEW&&RVNEW===g.reviews[0]?' rv-new':''}" style="display:block;cursor:pointer" onclick="goProfile()"><div class="lbl" style="margin-bottom:8px">${T('ĐÁNH GIÁ MỚI NHẤT','LATEST REVIEW')}</div>${reviewHTML(g.reviews[0])}</div>`:''}
  </div>
  <div class="pc-col">
    <div>
      <div class="sec-t">${ic('box',22)}${T('NHẬN ĐƠN','ORDERS')}</div>
      <div class="offers">${g.offers.map(offerCard).join('')}</div>
      ${blocked.length?`<div class="job-why">${ic('warn',18)}<div>${[...new Set(blocked.map(offerWhy))].join('<br>')}</div></div>`:''}
      <div class="drive-row"><span class="lbl">${T('TỐC ĐỘ LÁI','RIDING SPEED')}</span>
        ${DRIVE.map((d,i)=>`<button class="btn sm ${g.drive===i?'b-gold':'b-dim'}" onclick="setDrive(${i})" aria-pressed="${g.drive===i}">${d.n}</button>`).join('')}
        <button class="btn sm b-pu" onclick="refreshOffers()">${T('ĐỔI ĐƠN −8s','REFRESH −8s')}</button></div>
      <div class="lbl drive-note">${[T('Chậm: ít tai nạn, xăng -15%, mỗi đơn +4s','Slow: fewer accidents, fuel -15%, +4s per order'),T('Thường: không thay đổi','Normal: no change'),T('Nhanh: -2s mỗi đơn, nhưng dễ tai nạn và bị phạt, xăng +20%','Fast: -2s per order, but more accidents and fines, fuel +20%')][g.drive]}</div>
      ${isPeak()?`<div class="lbl peak-note">${T('GIỜ CAO ĐIỂM: đơn mới trả +25%, kẹt xe gấp đôi.','PEAK HOURS: new orders pay +25%, double the traffic jams.')}</div>`:''}
    </div>
    <div>
      <div class="sec-t">${T('HÀNH ĐỘNG','ACTIONS')}</div>
      <div class="util-grid">
        <button class="btn b-dim util" onclick="doRefuel()">${ic('fuel',28)}<span class="lb">${T('NẠP XĂNG','REFUEL')}</span><span class="sb" style="color:var(--or)">${Math.round(C.fuelCost/fuelMax()).toLocaleString(NUM_LOCALE)}đ/%</span></button>
        <button class="btn b-dim util" onclick="doSleep()">${ic('moon',28)}<span class="lb">${T('NGỦ NGHỈ','SLEEP')}</span><span class="sb" style="color:var(--cy)">${T(`+${C.sleepRate}/giây`,`+${C.sleepRate}/sec`)}</span></button>
        <button class="btn b-pu util" onclick="goUpgrade()">${ic('gear',28)}<span class="lb">${T('NÂNG CẤP','UPGRADES')}</span><span class="sb">${T('xe & phụ tùng','bike & parts')}</span></button>
      </div>
      <button class="btn b-dim blk life-btn" onclick="openHub()">${ic('house',24)}${T('ĐỜI SỐNG','LIFE')}${invTotal()>0||g.debt>0?` <small>(${[invTotal()>0?T('ĐT ','INV ')+fm(invTotal()):'',g.debt>0?T('NỢ ','DEBT ')+fm(g.debt):''].filter(Boolean).join(' · ')})</small>`:''}</button>
      <button class="btn b-cy blk endday" onclick="askEndDay()">${ic('flag',24)}${T(`KẾT THÚC NGÀY ${g.day}`,`END DAY ${g.day}`)}</button>
    </div>
    <div class="save-sec">
      <div class="sec-t">${ic('bank',22)}${T('TIẾT KIỆM','SAVINGS')} <span class="fold-hint">(${money(g.savings)})</span></div>
      <div class="save-grid">
        <button class="btn b-gold sm" onclick="doSave(5e5)" ${g.cash<5e5?'disabled':''}>${T('GỬI 500K','SAVE 500K')}</button>
        <button class="btn b-gold sm" onclick="doSave(1e6)" ${g.cash<1e6?'disabled':''}>${T('GỬI 1TR','SAVE 1M')}</button>
        <button class="btn b-gold sm" onclick="doSave(5e6)" ${g.cash<5e6?'disabled':''}>${T('GỬI 5TR','SAVE 5M')}</button>
        <button class="btn b-gold sm" onclick="doSave('all')" ${g.cash<=5e5?'disabled':''}>${T('GỬI TẤT CẢ','SAVE ALL')}</button>
        <button class="btn b-red sm" onclick="doWd(1e6)" ${g.savings<1e6?'disabled':''}>${T('RÚT 1TR','TAKE 1M')}</button>
        <button class="btn b-red sm" onclick="doWd('all')" ${!g.savings?'disabled':''}>${T('RÚT HẾT','TAKE ALL')}</button>
      </div>
      <div class="lbl save-note">${T('"Gửi tất cả" giữ lại 500K tiền mặt.','"Save all" keeps 500K in cash.')}${g.cash<5e5?'<br>'+T('Chưa đủ tiền mặt để gửi (cần ít nhất 500K).','Not enough cash to deposit (need at least 500K).'):''}${!g.savings?'<br>'+T('Chưa có tiết kiệm để rút.','No savings to withdraw yet.'):g.savings<1e6?'<br>'+T('Cần ít nhất 1TR tiết kiệm để rút từng phần.','Need at least 1M in savings for a partial withdrawal.'):''}</div>
    </div>
    <details class="fold" ${foldOpen.log||innerWidth>=860?'open':''} ontoggle="foldOpen.log=this.open">
      <summary class="sec-t">${T('NHẬT KÝ','LOG')}</summary>
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
  return`<div class="anim rf-anim">
    <div class="anim-t">${T('ĐANG ĐỔ XĂNG','REFUELING')}</div>
    <div class="rf-ic">${ic('fuel',72)}</div>
    <div class="rf-pct"><b id="fuel-pct">${s}%</b><span>→ ${t}%</span></div>
    <div class="fgauge"><div id="fuel-fill" class="fgauge-fill" style="width:${s}%"></div><div class="fgauge-seg"></div></div>
    <div class="fgauge-lbl"><span>E</span><span>F</span></div>
    <div id="fuel-txt" class="refuel-txt">${T(`${timeLeft}s còn lại`,`${timeLeft}s left`)}</div>
    <div class="lbl">${T('Chi phí:','Cost:')} ${ff(costPaid||0)}</div>
  </div>`;
}
function rSleepAnim(){
  return`<div class="anim">
    <div class="anim-t">${T('ĐANG NGỦ NGHỈ','RESTING')}</div>
    <div class="sleep-wrap">${ic('moon',88)}<span class="zzz z1">z</span><span class="zzz z2">Z</span><span class="zzz z3">Z</span></div>
    <div class="sleep-bar">
      <div class="sleep-top"><span>${T('THỂ LỰC','STAMINA')}</span><span id="sleep-txt">${g.stamina}/100</span></div>
      <div class="bar"><i id="sleep-bar" class="gr" style="width:${g.stamina}%"></i></div>
    </div>
    <div class="lbl">${T(`+${C.sleepRate} thể lực mỗi giây`,`+${C.sleepRate} stamina per second`)}</div>
    <button class="btn b-red" style="min-width:200px" onclick="stopSleep()">${T('DỪNG NGHỈ NGƠI','STOP RESTING')}</button>
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
        ?`<div class="owned">${ic('check',18)}${T('ĐÃ CÓ','OWNED')}</div>`
        :locked?`<div class="owned lock">${T('KHÓA','LOCKED')}</div>`
        :`<button class="btn b-pu" onclick="buyUpgrade('${u.id}')" ${g.cash<u.cost||(u.rep&&g.vehicleHp>=100)?'disabled':''}>${u.rep&&g.vehicleHp>=100?T('XE ĐẦY','BIKE FULL'):(swap?T('ĐỔI ','SWAP '):'')+ff(u.cost)}</button>`;
      return`<div class="pxf upg-row"><div class="upg-ic">${ic(u.icon,28)}</div>
        <div class="upg-det"><div class="upg-n">${u.name}</div><div class="upg-d">${u.desc}</div></div>
        <div class="upg-act">${btn}</div></div>`;
    }).join('');
    return`<div class="upg-cat">${cat.toUpperCase()}</div>${rows}`;
  }).join('');
  return`<div class="shop">
    <div class="shop-hdr"><button class="btn b-dim sm" onclick="goGame()">${ic('back',20)}${T('VỀ','BACK')}</button><span class="shop-title">${T('NÂNG CẤP XE','BIKE UPGRADES')}</span><span style="width:76px"></span></div>
    <div class="pxf bike-card">
      <img src="${BIKE}" alt="${T('Xe Honda Cub','Honda Cub bike')}" style="${hp<30?'filter:grayscale(.5) brightness(.8)':''}">
      <div class="bike-hp"><span style="color:${hpClr}">${T('ĐỘ BỀN XE','BIKE CONDITION')}</span><b style="color:${hpClr}">${hp}%</b></div>
      <div class="bar"><i class="${hp>=60?'gr':hp>=30?'or':'red'}" style="width:${hp}%"></i></div>
      ${hp<30?`<div class="bike-warn">${ic('warn',20)} ${T('XE HỎNG NẶNG — CẦN SỬA NGAY!','BIKE WRECKED, REPAIR NOW!')}</div>`:''}
    </div>
    <div class="upg-list">${items}</div>
  </div>`;
}

// DRIVER PROFILE
function rProfile(){
  const p=g.profile;
  const chips=HOBBIES.map(h=>{const on=p.hobbies.includes(h.id);
    return`<button class="chip${on?' on':''}" aria-pressed="${on}" onclick="toggleHobby('${h.id}')">${h.t}</button>`}).join('');
  const sws=HELMETS.map((c,i)=>`<button class="sw${c===p.helmet?' on':''}" style="--c:${c}" aria-label="${T(`Màu mũ ${i+1}`,`Helmet color ${i+1}`)}" onclick="setHelmet(${i})"></button>`).join('');
  const ai=`<div class="pxf ai-row"><div class="t">${T('Bật đánh giá','Enable reviews')}<small>${T('Khách để lại số sao và một câu nhận xét sau mỗi đơn.','Customers leave a star rating and a short comment after each order.')}</small></div>
        <button class="btn sm ${p.reviewsOn?'b-gr':'b-dim'}" onclick="toggleReviews()" aria-pressed="${p.reviewsOn}">${p.reviewsOn?T('BẬT','ON'):T('TẮT','OFF')}</button></div>`;
  const revs=g.reviews.length?g.reviews.slice(0,10).map(r=>`<div class="pxf2 rev">
      <div class="rev-top"><span class="rev-who">${esc(r.who)}</span>${starsFixed(r.stars,16)}</div>
      <div class="rev-txt">${esc(r.text)}</div>
      <div class="rev-who" style="margin-top:8px">${ic(r.job==='food'?'bowl':'box',16)} ${T(`Ngày ${r.day}, tháng ${r.month}`,`Day ${r.day}, month ${r.month}`)}</div></div>`).join('')
    :`<div class="pxf empty">${T('Chưa có đánh giá nào. Hãy giao đơn đầu tiên!','No reviews yet. Deliver your first order!')}</div>`;
  return`<div class="prof">
    <div class="shop-hdr"><button class="btn b-dim sm" onclick="goGame()">${ic('back',20)}${T('VỀ','BACK')}</button><span class="shop-title">${T('HỒ SƠ TÀI XẾ','DRIVER PROFILE')}</span><span style="width:76px"></span></div>
    <div class="pxf prof-top"><div class="avatar">${avatarHTML(p.helmet,96)}</div>
      <div class="prof-info"><div class="prof-name">${esc(pname())}</div>
        <div class="prof-avg">${starsHTML(g.stars,20)}<b>${g.stars.toFixed(1)}</b></div>
        <div class="lbl">${T(`${Math.min(10,g.reviews.length)} đánh giá gần nhất`,`Latest ${Math.min(10,g.reviews.length)} reviews`)}</div></div></div>
    <div class="prof-nums">
      <div class="pxf pn"><div class="v">${g.totalDelivered}</div><div class="l">${T('ĐƠN ĐÃ GIAO','DELIVERED')}</div></div>
      <div class="pxf pn"><div class="v">${g.month}/${C.maxMonths}</div><div class="l">${T('THÁNG','MONTH')}</div></div>
      <div class="pxf pn"><div class="v">${g.stars.toFixed(1)}</div><div class="l">${T('SỐ SAO','RATING')}</div></div>
    </div>
    <div class="field"><label for="prof-name">${T('TÊN TÀI XẾ','DRIVER NAME')}</label>
      <input class="txt" id="prof-name" type="text" maxlength="16" placeholder="${T('Tài xế','Driver')}" value="${esc(p.name)}" oninput="setName(this.value)" autocomplete="off"></div>
    <div class="field"><span class="fl">${T('SỞ THÍCH (chọn tối đa 3)','HOBBIES (pick up to 3)')}</span><div class="chips">${chips}</div></div>
    <div class="field"><label for="prof-hobby">${T('SỞ THÍCH KHÁC','OTHER HOBBY')}</label>
      <input class="txt" id="prof-hobby" type="text" maxlength="24" placeholder="${T('Ví dụ: sưu tầm mô hình','e.g. collecting model kits')}" value="${esc(p.hobbyText)}" oninput="setHobbyText(this.value)" autocomplete="off"></div>
    <div class="field"><span class="fl">${T('MÀU MŨ BẢO HIỂM','HELMET COLOR')}</span><div class="swatches">${sws}</div></div>
    ${ai}
    <div class="sec-t">${T('ĐÁNH GIÁ CỦA KHÁCH','CUSTOMER REVIEWS')}</div>
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
      res.skip?`<div class="eff red">${ic('warn',20)}${T('Mất thu nhập lần này','Income lost this time')}</div>`:'',
      res.cash>0?`<div class="eff gr">${ic('coin',20)}+${ff(res.cash)}</div>`:'',
      res.cash<0?`<div class="eff red">${ic('coin',20)}-${ff(Math.abs(res.cash))}</div>`:'',
      res.sta?`<div class="eff ${res.sta<0?'red':'gr'}">${ic('bolt',20)}${res.sta>0?'+':''}${res.sta} ${T('thể lực','stamina')}</div>`:'',
      res.hp?`<div class="eff ${res.hp<0?'red':'gr'}">${ic('wrench',20)}${T('Xe','Bike')} ${res.hp<0?res.hp:'+'+res.hp}%</div>`:'',
      res.rain?`<div class="eff or">${ic('cloud',20)}${T('Thu nhập giảm 40% hôm nay','Income -40% today')}</div>`:'',
    ].filter(Boolean).join('');
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:${clr}">${ic(evt.ic,28)} ${evt.ti}</div>
      <div class="m-body">${res.msg}</div>
      ${effs?`<div class="m-eff">${effs}</div>`:''}
      <button class="btn b-gr blk" onclick="modal=null;render()">${T('TIẾP TỤC','CONTINUE')}</button>
    </div></div>`;
  }
  if(type==='life'){
    const e=lifeEvt();if(!e){modal=null;return''}
    const done=modal.res!==null;
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--or)">${ic(e.ic,28)} ${e.ti}</div>
      <div class="m-body">${done?esc(modal.res):esc(e.text())}</div>
      ${done?`<button class="btn b-gr blk" onclick="lifeClose()">${T('TIẾP TỤC','CONTINUE')}</button>`
        :`<div class="life-ch">${e.choices.map((c,i)=>`<button class="btn ${i?'b-dim':'b-gr'} blk" ${c.ok&&!c.ok()?'disabled':''} onclick="lifeChoose(${i})">${c.l}</button>`).join('')}</div>`}
    </div></div>`;
  }
  if(type==='hub'){
    const rb=(a,l)=>`<button class="btn b-gold sm" onclick="remit(${a})" ${g.cash<a?'disabled':''}>${l}</button>`;
    const lb=(fn,cls,l,dis)=>`<button class="btn ${cls} sm" onclick="${fn}" ${dis?'disabled':''}>${l}</button>`;
    return`<div class="overlay"><div class="pxf2 modal hub">
      <div class="m-title" style="color:var(--gold)">${ic('house',28)} ${T('ĐỜI SỐNG','LIFE')}</div>
      <div class="hub-sum"><span>${T('Tiền mặt','Cash')} <b>${ff(g.cash)}</b></span><span>${T('Sức khỏe','Health')} <b>${g.health}</b></span><span>${T('Gia đình','Family')} <b>${g.family}</b></span></div>
      <section class="hub-sec">
        <div class="sec-t">${ic('phone',20)}${T('GỬI TIỀN VỀ QUÊ','SEND MONEY HOME')}</div>
        <div class="hub-grid g4">${rb(2e5,'200K')}${rb(5e5,'500K')}${rb(1e6,fm(1e6))}${rb(2e6,fm(2e6))}</div>
        <div class="sub">${T('Gia đình lo lắng dần theo tháng. Yên tâm thì mẹ gửi đồ quê, lo quá thì bạn ăn ngủ không yên.','Your family worries more as months pass. When they are at ease, Mom sends food from home; when too worried, you lose sleep and appetite.')}</div>
      </section>
      ${g.drink>0||g.gamble>0?`<section class="hub-sec">
        <div class="sec-t">${ic('heart',20)}${T('THÓI QUEN','HABITS')}</div>
        <div class="hub-habits">${g.drink>0?`<span>${ic('beer',20)} ${T('Rượu bia','Drinking')} <b>${g.drink}</b>/100</span>`:''}${g.gamble>0?`<span>${ic('dice',20)} ${T('Cờ bạc','Gambling')} <b>${g.gamble}</b>/100</span>`:''}</div>
        <div class="hub-grid g1">${lb('quitHabits()','b-dim',g.quitM===g.month?T('ĐÃ TỰ NHỦ THÁNG NÀY','DONE THIS MONTH'):T('TỰ NHỦ BỚT LẠI (-15)','CUT BACK (-15)'),g.quitM===g.month)}</div>
      </section>`:''}
      <section class="hub-sec">
        <div class="sec-t">${ic('bag',20)}${T('VAY & TRẢ NỢ','LOANS & DEBT')}</div>
        <div class="hub-debt">${T('Nợ','Debt')} <b style="color:${g.debt?'var(--red)':'inherit'}">${ff(g.debt)}</b>${g.debt?` <em>${T(`lãi ${Math.round(g.debtRate*100)}%/tháng`,`${Math.round(g.debtRate*100)}%/mo interest`)}</em>`:''}</div>
        ${g.debt>0?`<div class="hub-grid g3">${lb('repay(1e6);render()','b-gr',T('TRẢ 1TR','PAY 1M'),g.cash<1e6)}${lb('repay(5e6);render()','b-gr',T('TRẢ 5TR','PAY 5M'),g.cash<5e6)}${lb('repay(g.debt);render()','b-gr',T('TRẢ HẾT','PAY ALL'),g.cash<=0)}</div>`:''}
        <div class="hub-grid g2">${lb("takeLoan('hot')",'b-red',`<span>${T('VAY NÓNG 3TR','LOAN SHARK 3M')}<small>${T('lãi 15%/tháng','15%/mo interest')}</small></span>`,g.debt>=2e7)}${lb("takeLoan('app')",'b-red',`<span>${T('VAY APP 5TR','APP LOAN 5M')}<small>${T('phí 10%, lãi 25%','10% fee, 25% int.')}</small></span>`,g.debt>=2e7)}</div>
        <div class="sub">${T('Lãi cộng dồn mỗi tháng. Nợ từ 30TR là bị siết nhà. Phải hết nợ mới được tính là thắng.','Interest compounds monthly. Debt of 30M or more gets your home seized. You must be debt-free to count as a win.')}</div>
      </section>
      <section class="hub-sec">
        <div class="sec-t">${ic('chart',20)}${T('ĐẦU TƯ (GIÁ ĐỔI MỖI NGÀY)','INVESTING (PRICES CHANGE DAILY)')}</div>
        ${INVS.map(x=>`<div class="inv-row"><div class="inv-h">${ic(x.ic,28)}<div><b>${x.n}</b> <span>${fm(invOf(x.id))}</span>${invOf(x.id)>0?` <em class="${invOf(x.id)-(g.invCost[x.id]||0)>=0?'up':'dn'}">${invOf(x.id)-(g.invCost[x.id]||0)>=0?T('lãi','gain'):T('lỗ','loss')} ${fm(Math.abs(invOf(x.id)-(g.invCost[x.id]||0)))}</em>`:''}<div class="sub">${x.d}</div></div></div>
          <div class="hub-grid g3">${lb(`invBuy('${x.id}',1e6)`,'b-gr',T('MUA 1TR','BUY 1M'),g.cash<1e6)}${lb(`invBuy('${x.id}',5e6)`,'b-gr',T('MUA 5TR','BUY 5M'),g.cash<5e6)}${lb(`invSell('${x.id}','all')`,'b-red',T('BÁN HẾT','SELL ALL'),invOf(x.id)<=0)}</div></div>`).join('')}
        <div class="sub">${T('Giá thay đổi mỗi ngày, lãi lỗ hiện ở bảng cuối ngày. Bán mất phí 1%. Hết 24 tháng, đầu tư tự bán vào tiết kiệm.','Prices change daily; gains and losses show in the end-of-day summary. Selling costs a 1% fee. After 24 months, investments are sold into savings automatically.')}</div>
      </section>
      <section class="hub-sec">
        <div class="sec-t">${ic('ticket',20)}${T('VÉ SỐ','LOTTERY')}</div>
        <div class="hub-debt">${T(`Vé hôm nay <b>${g.tickets}</b> tờ <em>(${ff(g.tickets*TICKET)})</em>`,`Tickets today: <b>${g.tickets}</b> <em>(${ff(g.tickets*TICKET)})</em>`)}</div>
        <div class="hub-grid g3">${lb('lottoHub(1)','b-gold',`<span>${T('MUA 1 TỜ','BUY 1')}<small>20K</small></span>`,g.cash<TICKET||g.tickets>=TICKET_MAX)}${lb('lottoHub(5)','b-gold',`<span>${T('MUA 5 TỜ','BUY 5')}<small>100K</small></span>`,g.cash<5*TICKET||g.tickets>TICKET_MAX-5)}${lb('lottoHub(10)','b-gold',`<span>${T('MUA 10 TỜ','BUY 10')}<small>200K</small></span>`,g.cash<10*TICKET||g.tickets>TICKET_MAX-10)}</div>
        <div class="sub">${T(`Vé 20K một tờ, tối nay xổ số, kết quả hiện ở bảng cuối ngày. Giải 100K, 1TR, độc đắc 10TR nhưng rất hiếm. Tối đa ${TICKET_MAX} tờ mỗi ngày. Mua nhiều dễ thành thói quen.`,`20K per ticket, drawn tonight, results show in the end-of-day summary. Prizes 100K, 1M, jackpot 10M but very rare. Max ${TICKET_MAX} tickets per day. Buying a lot can become a habit.`)}</div>
      </section>
      <section class="hub-sec">
        <div class="sec-t">${ic('dice',20)}${T('SÒNG BÀI · BLACKJACK','CASINO · BLACKJACK')}</div>
        <div class="hub-debt">${T(`Hôm nay còn <b>${BJ_MAX-g.bjToday}</b>/${BJ_MAX} ván <em>(tổng ${g.bjNet>=0?'+':''}${ff(g.bjNet)})</em>`,`Hands left today: <b>${BJ_MAX-g.bjToday}</b>/${BJ_MAX} <em>(total ${g.bjNet>=0?'+':''}${ff(g.bjNet)})</em>`)}</div>
        <div class="hub-grid g1">${lb('bjOpen()','b-gold',T('VÀO BÀN','PLAY'),false)}</div>
        <div class="sub">${T(`Blackjack chuẩn, bộ bài mới mỗi ván, trả 3:2. Tối đa ${BJ_MAX} ván mỗi ngày, mỗi ván tốn ${BJ_TIME} giây và tăng chỉ số cờ bạc. Thắng thua hoàn toàn do may rủi, bạn tự chịu trách nhiệm.`,`Standard blackjack, fresh deck every hand, pays 3:2. Max ${BJ_MAX} hands per day, each takes ${BJ_TIME} seconds and raises your gambling stat. Wins and losses are pure luck, and you are responsible for your choices.`)}</div>
      </section>
      <button class="btn b-cy blk" onclick="modal=null;render()">${T('ĐÓNG','CLOSE')}</button>
    </div></div>`;
  }
  if(type==='bj')return bjHTML();
  if(type==='chapter'){
    const c=CHAPTERS[modal.n],note=chapterNote();
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--gold)">${ic('cal',28)} ${c.ti}</div>
      <div class="m-body">${c.tx}${note?`<br><br>${esc(note)}`:''}</div>
      <button class="btn b-gr blk" onclick="g.lifeSeen['c'+modal.n]=1;modal=null;save();render()">${T('TIẾP TỤC','CONTINUE')}</button>
    </div></div>`;
  }
  if(type==='confirmEnd'){
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--or)">${ic('flag',28)} ${T('KẾT THÚC NGÀY?','END THE DAY?')}</div>
      <div class="m-body">${g.dayTimeLeft>90?T(`Ngày còn ${fmT(g.dayTimeLeft)}. Kết thúc sớm sẽ bỏ lỡ thời gian giao hàng.`,`${fmT(g.dayTimeLeft)} left in the day. Ending early wastes delivery time.`):T(`Ngày còn ${fmT(g.dayTimeLeft)}. Bạn muốn kết thúc ngày và xem tổng kết?`,`${fmT(g.dayTimeLeft)} left in the day. End it now and see the summary?`)}</div>
      <div class="rf-btns"><button class="btn b-dim" onclick="modal=null;render()">${T('Ở LẠI','STAY')}</button>
      <button class="btn b-cy" onclick="modal=null;doEndDay()">${T('KẾT THÚC','END DAY')}</button></div>
    </div></div>`;
  }
  if(type==='tut'){
    const P=TUT[modal.i],last=modal.i===TUT.length-1;
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--gold)">${ic(P.ic,28)} ${P.t}</div>
      <div class="m-body">${P.b}</div>
      <div class="lbl" style="text-align:center">${modal.i+1}/${TUT.length}</div>
      <div class="rf-btns">
        ${modal.i>0?`<button class="btn b-dim" onclick="modal.i--;render()">◀</button>`:`<button class="btn b-dim" onclick="${modal.from==='pause'?"modal={type:'pause'};render()":'tutDone()'}">${T('BỎ QUA','SKIP')}</button>`}
        ${last?`<button class="btn b-gr" onclick="${modal.from==='pause'?"modal={type:'pause'};render()":'tutDone()'}">${T('XONG','DONE')}</button>`:`<button class="btn b-gr" onclick="modal.i++;render()">${T('TIẾP','NEXT')} ▶</button>`}
      </div>
    </div></div>`;
  }
  if(type==='pause'){
    return`<div class="overlay"><div class="pxf2 modal set-box">
      <div class="m-title" style="color:var(--gold)">${ic('pause',28)} ${T('TẠM DỪNG','PAUSED')}</div>
      <div class="lbl" style="text-align:center">${T('Thời gian đang dừng.','Time is paused.')}</div>
      <button class="btn b-gr blk" onclick="resumeGame()">${T('TIẾP TỤC','CONTINUE')}</button>
      <button class="btn b-dim blk" style="margin-top:8px" onclick="openSettings()">${T('ÂM THANH','SOUND')}</button>
      <button class="btn b-dim blk" style="margin-top:8px" onclick="modal={type:'tut',i:0,from:'pause'};render()">${T('HƯỚNG DẪN','HOW TO PLAY')}</button>
      <button class="btn b-dim blk" style="margin-top:8px" onclick="askHome()">${T('VỀ MÀN HÌNH BẮT ĐẦU','BACK TO TITLE')}</button>
    </div></div>`;
  }
  if(type==='confirmHome'){
    const mid=!!DLV||g.phase==='anim-refuel';
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--or)">${ic('flag',28)} ${T('VỀ MÀN HÌNH BẮT ĐẦU?','BACK TO TITLE SCREEN?')}</div>
      <div class="m-body">${T('Game được lưu lại, bạn có thể bấm TIẾP TỤC để chơi tiếp.','Your game is saved; press CONTINUE to resume.')}${mid?' '+T('Đơn hoặc việc đang làm dở sẽ bị hủy, xăng và thể lực đã dùng không được hoàn lại.','The order or task in progress will be cancelled, and fuel and stamina already used are not refunded.'):''}</div>
      <div class="rf-btns"><button class="btn b-dim" onclick="cancelHome()">${T('Ở LẠI','STAY')}</button>
      <button class="btn b-cy" onclick="goHome()">${T('VỀ MÀN HÌNH','TO TITLE')}</button></div>
    </div></div>`;
  }
  if(type==='settings'){
    return`<div class="overlay" onclick="if(event.target===this)closeSettings()"><div class="pxf2 modal set-box">
      <div class="m-title" style="color:var(--cy)">${ic(AUD.on||AUD.sfx?'sound':'mute',28)} ${T('ÂM THANH','SOUND')}</div>
      <div class="set-row"><span class="m-h" style="color:var(--gold);margin:0">${T('NHẠC NỀN','MUSIC')}</span>
        <button class="btn sm ${AUD.on?'b-gr':'b-dim'}" onclick="toggleMusic()" aria-pressed="${AUD.on}">${AUD.on?T('BẬT','ON'):T('TẮT','OFF')}</button></div>
      <div class="set-row trk"><span>${T('Bài hát','Track')}</span><span class="trk-ctl">
        <button class="btn sm b-dim" onclick="skipTrack(-1)" ${g.phase==='start'?'disabled':''} aria-label="${T('Bài trước','Previous track')}">◀</button>
        <button class="btn sm b-dim" onclick="skipTrack(1)" ${g.phase==='start'?'disabled':''} aria-label="${T('Bài sau','Next track')}">▶</button></span></div>
      <div class="lbl trk-name">${g.phase==='start'?T('Màn hình bắt đầu: nhạc cố định','Title screen: fixed music'):`${AUD.track+1}/${TRACKS.length} · ${TRACKS[AUD.track].n}`}</div>
      <div class="set-row"><span>${T('Âm lượng nhạc','Music volume')}</span><b id="vol-lbl">${Math.round(AUD.vol*100)}%</b></div>
      <input id="vol-slider" type="range" min="0" max="100" step="5" value="${Math.round(AUD.vol*100)}" oninput="setVolume(this.value)" aria-label="${T('Âm lượng nhạc nền','Music volume')}">
      <div class="set-row" style="margin-top:6px"><span class="m-h" style="color:var(--gold);margin:0">${T('HIỆU ỨNG','EFFECTS')}</span>
        <button class="btn sm ${AUD.sfx?'b-gr':'b-dim'}" onclick="toggleSfx()" aria-pressed="${AUD.sfx}">${AUD.sfx?T('BẬT','ON'):T('TẮT','OFF')}</button></div>
      <div class="set-row"><span>${T('Âm lượng hiệu ứng','Effects volume')}</span><b id="sfx-lbl">${Math.round(AUD.sfxVol*100)}%</b></div>
      <input id="sfx-slider" type="range" min="0" max="100" step="5" value="${Math.round(AUD.sfxVol*100)}" oninput="setSfxVolume(this.value)" onchange="sfxPreview()" aria-label="${T('Âm lượng hiệu ứng','Effects volume')}">
      <div class="set-row"><span>${T('Ngôn ngữ','Language')}</span>${langBtns()}</div>
      <div class="lbl" style="text-align:center;font-size:16px">${T('Phiên bản','Version')} ${BUILD}</div>
      <button class="btn b-gr blk" onclick="closeSettings()">${T('ĐÓNG','CLOSE')}</button>
    </div></div>`;
  }
  if(type==='milestone'){
    const un=UPGS.filter(u=>modal.list.some(m=>m.at===u.req));
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--gold)">${ic('trophy',28)} ${T('MỐC TIẾT KIỆM!','SAVINGS MILESTONE!')}</div>
      ${modal.list.map(m=>`<div class="m-body">${T(`Đạt ${ff(m.at)}<br>Thưởng +${ff(m.reward)}`,`Reached ${ff(m.at)}<br>Bonus +${ff(m.reward)}`)}</div>`).join('')}
      ${un.length?`<div class="m-eff"><div class="eff gr">${ic('star',20)}${T('Mở khóa:','Unlocked:')} ${un.map(u=>u.name).join(', ')}</div></div>`:''}
      <button class="btn b-gr blk" onclick="modal=null;render()">${T('TIẾP TỤC','CONTINUE')}</button>
    </div></div>`;
  }
  if(type==='refuel'){
    const i=rfInfo(),fm=fuelMax();
    return`<div class="rf-overlay"><div class="pxf2 rf-box">
      <div class="rf-title">${T('ĐỔ XĂNG','REFUEL')}</div>
      <div class="rf-gauge"><span>${T('Bình xăng','Fuel tank')}</span>
        <div class="bar"><i id="rf-fill" class="or" style="width:${i.t/fm*100}%;opacity:.5"></i><i class="or" style="width:${g.fuel/fm*100}%"></i></div>
        <span class="lbl-v" id="rf-lbl">${i.t}/${fm}%</span></div>
      <div class="lbl">${T('Kéo thanh trượt để chọn lượng xăng muốn đổ','Drag the slider to choose how much fuel to add')}</div>
      <input id="rf-slider" type="range" min="${g.fuel}" max="${fm}" step="1" value="${i.t}" oninput="rfSlide(this.value)" aria-label="${T('Lượng xăng muốn đổ','Fuel amount to add')}">
      <div class="rf-cost"><span>${T('Đổ thêm:','Add:')} <b id="rf-add">${i.fill}%</b></span><span>${T('Chi phí:','Cost:')} <b id="rf-cost">${ff(i.cost)}</b></span></div>
      <div id="rf-warn" class="rf-warn" hidden>${T('Không đủ tiền!','Not enough money!')}</div>
      <div class="rf-btns"><button class="btn b-dim" onclick="modal=null;render()">${T('HỦY','CANCEL')}</button>
        <button id="rf-go" class="btn b-or" onclick="rfConfirm()" ${i.ok&&i.fill>0?'':'disabled'}>${T('ĐỔ XĂNG','REFUEL')}</button></div>
    </div></div>`;
  }
  if(type==='dayEnd'){
    const{earned,spent,interest,day}=modal;const net=earned-spent;
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--cy)">${ic('cal',28)} ${T(`KẾT NGÀY ${day}`,`END OF DAY ${day}`)}</div>
      <div class="day-grid">
        <div class="day-row"><span>${T('Thu nhập','Income')}</span><span style="color:var(--gr)">+${ff(earned)}</span></div>
        <div class="day-row"><span>${T('Chi tiêu','Spending')}</span><span style="color:var(--red)">-${ff(spent)}</span></div>
        <div class="day-div"></div>
        <div class="day-row"><span>${T('Kết quả','Result')}</span><span style="color:${net>=0?'var(--gr)':'var(--red)'}">${net>=0?'+':''}${ff(net)}</span></div>
        <div class="day-div"></div>
        <div class="day-row"><span>${T('Số đơn giao','Orders delivered')}</span><span>${modal.n}${modal.n?` <small>(${T('TB','avg')} ${fm(Math.round(earned/modal.n))})</small>`:''}</span></div>
        ${modal.best?`<div class="day-row"><span>${T('Đơn cao nhất','Best order')}</span><span style="color:var(--gold)">${ff(modal.best)}</span></div>`:''}
        <div class="day-row"><span>${T('Sự cố gặp phải','Mishaps')}</span><span style="color:${modal.mishap?'var(--red)':'var(--gr)'}">${modal.mishap||T('Không','None')}</span></div>
        <div class="day-row"><span>${T('Đánh giá · Độ bền xe','Rating · Bike condition')}</span><span>${modal.stars.toFixed(1)}★ · ${Math.round(modal.hp)}%</span></div>
        ${modal.prev!==null?`<div class="day-row"><span>${T('So với hôm qua','Vs. yesterday')}</span><span style="color:${net>=modal.prev?'var(--gr)':'var(--red)'}">${net>=modal.prev?'+':'-'}${ff(Math.abs(net-modal.prev))}</span></div>`:''}
      </div>
      <div class="interest">${ic('bank',20)} ${T(`LÃI TIẾT KIỆM ${(C.dailyInterest*100).toFixed(1).replace(/\.0$/,'')}%:`,`SAVINGS INTEREST ${(C.dailyInterest*100).toFixed(1).replace(/\.0$/,'')}%:`)} +${ff(interest)}<small>${T('Tiết kiệm:','Savings:')} ${ff(g.savings)}</small></div>
      ${(modal.inv&&modal.inv.length)?`<div class="day-sec"><div class="m-h" style="color:var(--cy)">${ic('chart',20)} ${T('ĐẦU TƯ HÔM NAY','INVESTMENTS TODAY')}</div>${modal.inv.map(r=>`<div class="day-row"><span>${ic(r.ic,20)} ${r.n} <small>${r.pct>=0?'+':''}${r.pct.toFixed(1)}%</small></span><span style="color:${r.delta>=0?'var(--gr)':'var(--red)'}">${r.delta>=0?'+':'-'}${ff(Math.abs(r.delta))}</span></div><div class="day-sub"><span>${T('Giá trị','Value')} ${fm(r.val)}</span><span style="color:${r.pl>=0?'var(--gr)':'var(--red)'}">${r.pl>=0?T('Lãi tổng','Total gain'):T('Lỗ tổng','Total loss')} ${fm(Math.abs(r.pl))}</span></div>`).join('')}</div>`:''}
      ${(modal.lot&&modal.lot.n>0)?`<div class="day-sec"><div class="m-h" style="color:var(--gold)">${ic('ticket',20)} ${T('XỔ SỐ TỐI NAY',"TONIGHT'S DRAW")}</div><div class="day-row"><span>${modal.lot.n} ${T('tờ vé','tickets')} <small>(-${fm(modal.lot.cost)})</small></span><span style="color:${modal.lot.prize>0?'var(--gr)':'var(--dim)'}">${modal.lot.prize>0?T('TRÚNG +','WON +')+fm(modal.lot.prize):T('không trúng','no win')}</span></div>${modal.lot.best>=1e7?`<div class="day-sub"><span style="color:var(--gold)">${T('ĐỘC ĐẮC! Bạn không tin vào mắt mình.','JACKPOT! You cannot believe your eyes.')}</span></div>`:modal.lot.best>=1e6?`<div class="day-sub"><span style="color:var(--gold)">${T('Trúng giải lớn, may mắn thật.','Big prize, what luck.')}</span></div>`:''}</div>`:''}
      ${(modal.ms||[]).map(m=>`<div class="interest">${ic('trophy',20)} ${T(`MỐC ${fm(m.at)}: thưởng +${ff(m.reward)}`,`MILESTONE ${fm(m.at)}: bonus +${ff(m.reward)}`)}</div>`).join('')}
      <button class="btn b-gr blk" onclick="confirmDayEnd()">${day<C.daysPerMonth?T('NGÀY ','DAY ')+(day+1):T('KẾT THÁNG','END MONTH')}</button>
    </div></div>`;
  }
  if(type==='monthEnd'){
    const{month,earned,bonus,del,bills}=modal;const net=earned+bonus-bills;
    const billRows=C.monthly.map(b=>`<div class="month-row"><span>${b.n}</span><span style="color:var(--red)">-${ff(b.c)}</span></div>`).join('')+UPGS.filter(u=>u.fee&&g.upgrades[u.id]).map(u=>`<div class="month-row"><span>${T(`Phí ${u.name}`,`${u.name} fee`)}</span><span style="color:var(--red)">-${ff(u.fee)}</span></div>`).join('');
    const bl=del>=480?T('(KIM CƯƠNG)','(DIAMOND)'):del>=360?T('(VÀNG)','(GOLD)'):del>=240?T('(BẠC)','(SILVER)'):'';
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--gold)">${ic('cal',28)} ${T(`THÁNG ${month} KẾT THÚC`,`MONTH ${month} COMPLETE`)}</div>
      <div class="lbl" style="margin-bottom:8px">${T(`${del} đơn ${bl}`,`${del} orders ${bl}`)}</div>
      <div class="m-h" style="color:var(--gr)">${T('THU NHẬP','INCOME')}</div>
      <div class="month-row"><span>${T('Giao hàng','Deliveries')}</span><span style="color:var(--gr)">+${ff(earned)}</span></div>
      ${bonus?`<div class="month-row"><span>${T('Thưởng hệ thống','System bonus')} ${bl} + ${T('đánh giá','rating')} ${modal.stars.toFixed(1)}★</span><span style="color:var(--gr)">+${ff(bonus)}</span></div>`:''}
      <div class="m-h" style="color:var(--red)">${T('CHI PHÍ','EXPENSES')}</div>
      ${billRows}
      <div class="bar" style="margin:14px 4px"><i class="${net>=0?'gr':'red'}" style="width:100%"></i></div>
      <div class="month-row" style="color:var(--tx)"><span>${T('KẾT QUẢ','RESULT')}</span><span style="color:${net>=0?'var(--gr)':'var(--red)'}">${net>=0?'+':''}${ff(net)}</span></div>
      <div class="lbl" style="margin:8px 0 14px">${T('Tiền mặt sau:','Cash after:')} ${ff(g.cash+bonus-bills)}${g.cash+bonus-bills<0&&g.savings>0?'<br>'+T('Thiếu sẽ tự rút từ tiết kiệm.','Any shortfall is taken from savings.'):''}</div>
      <button class="btn b-gr blk" onclick="confirmMonthEnd()">${month<C.maxMonths?T('THÁNG ','MONTH ')+(month+1):T('KẾT THÚC GAME','END GAME')}</button>
    </div></div>`;
  }
  return'';
}

// END
function finRows(){
  const f=g.fin,r=(n,v,c)=>`<div class="month-row"><span>${n}</span><span style="color:var(--${c})">${c==='gr'?'+':'-'}${ff(v)}</span></div>`;
  return`<div class="sec-t" style="margin-top:12px">${T('TIỀN ĐI ĐÂU?','WHERE DID IT GO?')}</div>`+r(T('Thu từ giao hàng','Delivery income'),f.earn,'gr')+r(T('Xăng','Fuel'),f.fuel,'red')+r(T('Sửa xe','Repairs'),f.repair,'red')+r(T('Nâng cấp','Upgrades'),f.upg,'red')+r(T('Tai nạn & phạt','Accidents & fines'),f.accident,'red')+r(T('Hóa đơn tháng','Monthly bills'),f.bills,'red')+(f.life?r(T('Gia đình & đời sống','Family & life'),f.life,'red'):'')+(f.loan?r(T('Lãi vay','Loan interest'),f.loan,'red'):'');
}
function rEnd(win){
  const m=g.month,lack=Math.max(0,C.winTarget-g.savings+g.debt);
  if(win)return`<div class="end">
    ${ic('trophy',88)}
    <h1 style="color:var(--gold);font-family:var(--f-tx);font-size:44px">${T('CHIẾN THẮNG!','VICTORY!')}</h1>
    <div class="lbl">${T(`${esc(pname())} đã đạt mục tiêu 100 triệu`,`${esc(pname())} reached the 100 million goal`)}</div>
    <div class="end-t" style="color:var(--gold)">${endingInfo(true).t}</div><div class="lbl">${endingInfo(true).l}</div>
    <div class="pxf end-stats">
      <div class="month-row"><span>${T('Tiết kiệm','Savings')}</span><span style="color:var(--gold)">${ff(g.savings)}</span></div>
      <div class="month-row"><span>${T('Mức khắc nghiệt','Difficulty')}</span><span style="color:${HARDS[g.hard].c}">${HARDS[g.hard].n}</span></div>
      <div class="month-row"><span>${T('Số tháng','Months')}</span><span>${m}/24</span></div>
      <div class="month-row"><span>${T('Tổng đơn','Total orders')}</span><span>${g.totalDelivered}</span></div>
      <div class="month-row"><span>${T('Đánh giá','Rating')}</span><span>${g.stars.toFixed(1)}/5.0</span></div>
      ${finRows()}
    </div>
    <button class="btn b-gr" onclick="resetGame()">${T('CHƠI LẠI','PLAY AGAIN')}</button>
  </div>`;
  return`<div class="end">
    ${ic('skull',88)}
    <h1 style="color:var(--red);font-family:var(--f-tx);font-size:44px">${T('THẤT BẠI','GAME OVER')}</h1>
    <div class="lbl">${g.endWhy==='debt'?T('Nợ nần chồng chất, chủ nợ siết hết!','Crushed by debt, the lenders took everything!'):g.month>C.maxMonths?(g.debt>0?T('Hết 24 tháng, còn nợ!','24 months are up, and you still owe!'):T('Hết 24 tháng!','24 months are up!')):T('Hết tiền!','Out of money!')}</div>
    <div class="end-t" style="color:var(--red)">${endingInfo(false).t}</div><div class="lbl">${endingInfo(false).l}</div>
    <div class="pxf end-stats">
      <div class="month-row"><span>${T('Mức khắc nghiệt','Difficulty')}</span><span style="color:${HARDS[g.hard].c}">${HARDS[g.hard].n}</span></div>
      ${g.debt>0?`<div class="month-row"><span>${T('Còn nợ','Debt left')}</span><span style="color:var(--red)">${ff(g.debt)}</span></div>`:''}
      <div class="month-row"><span>${T('Đã tiết kiệm','Saved')}</span><span>${ff(g.savings)}</span></div>
      <div class="month-row"><span>${T('Còn thiếu','Still short')}</span><span style="color:var(--red)">${ff(lack)}</span></div>
      <div class="month-row"><span>${T('Tổng đơn','Total orders')}</span><span>${g.totalDelivered}</span></div>
      ${finRows()}
    </div>
    <button class="btn b-gr" onclick="resetGame()">${T('THỬ LẠI','TRY AGAIN')}</button>
  </div>`;
}

// INIT
init();render();getSample();
try{if(sessionStorage.getItem('btd_resume')){sessionStorage.removeItem('btd_resume');if(hasSave())startGame(false)}}catch(e){}   // language switch: carry on with the running game
