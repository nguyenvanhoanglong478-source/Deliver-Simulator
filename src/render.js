// ===== RENDER =====
function money(n){n=Math.round(n);return(n<0?'-':'')+Math.abs(n).toLocaleString('vi-VN')+'<span class="cur">đ</span>'}
function meterColor(v,lo,mid){return v<lo?'red':v<mid?'or':'gr'}
function jobWhy(job){
  const c=jobCost(job);
  if(g.vehicleHp<=0)return'xe hỏng, cần sửa ở mục Nâng cấp';
  const lack=[];
  if(g.fuel<c.fuel)lack.push(`xăng (cần ${c.fuel}%, còn ${g.fuel}%)`);
  if(g.stamina<c.sta)lack.push(`thể lực (cần ${c.sta}, còn ${g.stamina})`);
  return lack.length?'thiếu '+lack.join(' và '):'';
}
function sceneHTML(cargo){
  return`<div class="scene"><div class="sky-far"></div><div class="sky-near"></div><div class="road"></div>
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
    ${sceneHTML('box')}
    <div class="logo"><h1>BE THE<br>DRIVER</h1><div class="tagline">Mô phỏng tài xế giao hàng</div></div>
    ${nm?`<div class="hi">Chào mừng trở lại, ${esc(nm)}!</div>`:''}
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
        ?`<button class="btn b-gr blk start-main" onclick="startGame(false)">TIẾP TỤC</button>
          <button class="btn b-dim blk" onclick="startGame(true)">BẮT ĐẦU MỚI</button>`
        :`<button class="btn b-gr blk start-main blink" onclick="startGame(false)">BẮT ĐẦU!</button>`}
    </div>
  </div>`;
}

// MAIN GAME
function rGame(){
  const pct=Math.min(100,g.savings/C.winTarget*100);
  const cashLow=g.cash<8e5,fuelLow=g.fuel<15,hpLow=g.vehicleHp<30;
  const fj=C.jobs.food,gj=C.jobs.goods;
  const cF=canDoJob(fj),cG=canDoJob(gj);
  const jc=j=>{const c=jobCost(j);return`<span>${ic('bolt',16)}${c.sta}</span><span>${ic('fuel',16)}${c.fuel}%</span>`};
  const logs=g.log.slice(0,10).map(l=>`<div class="log-i ${l.t}">${l.m}</div>`).join('')||'<div class="log-i">Chưa có hoạt động.</div>';
  return`<div>
  <div class="hud pxf">
    <button class="hud-av" onclick="goProfile()" aria-label="Mở hồ sơ tài xế">${avatarHTML(g.profile.helmet,40)}</button>
    <div class="hud-who"><div class="hud-name">${esc(pname())}</div>
      <div class="hud-stars">${starsHTML(g.stars,14)}<b>${g.stars.toFixed(1)}</b></div></div>
    <div class="tags"><span class="tag" id="day-tmr">${fmT(g.dayTimeLeft)}</span><span class="tag gr">T.${g.month}/${C.maxMonths}</span></div>
  </div>
  <div class="game-body">
  <div class="pc-col">
    <div class="stat-row">
      <div class="pxf stat${cashLow?' warn':''}"><div class="l">${ic('coin',20)}TIỀN MẶT</div><div class="v ${cashLow?'red':'gr'}">${money(g.cash)}</div></div>
      <div class="pxf stat"><div class="l">${ic('bank',20)}TIẾT KIỆM</div><div class="v gold">${money(g.savings)}</div>
        <div class="bar thin" style="margin-top:12px"><i class="gold" style="width:${pct}%"></i></div>
        <div class="sub">${pct.toFixed(1)}% / 100TR</div></div>
    </div>
    <div class="pair">
      <div class="pxf meter"><div class="meter-top"><span>${ic('bolt',20)}THỂ LỰC</span><b>${g.stamina}</b></div>
        <div class="bar"><i class="${meterColor(g.stamina,25,50)}" style="width:${g.stamina}%"></i></div></div>
      <div class="pxf meter"><div class="meter-top"><span>${ic('fuel',20)}XĂNG</span><b>${g.fuel}%</b></div>
        <div class="bar"><i class="${meterColor(g.fuel,15,40)}" style="width:${g.fuel/fuelMax()*100}%"></i></div></div>
    </div>
    <div class="pxf meter"><div class="meter-top"><span>${ic('gear',20)}ĐỘ BỀN XE</span><b${hpLow?' style="color:var(--red)"':''}>${g.vehicleHp}%</b></div>
      <div class="bar"><i class="${g.vehicleHp>=60?'gr':g.vehicleHp>=30?'or':'red'}" style="width:${g.vehicleHp}%"></i></div></div>
    <div class="pxf strip">
      <span>${ic('cal',20)}NGÀY ${g.day}/${C.daysPerMonth}</span>
      <span>${ic('box',20)}${g.delivered} ĐƠN</span>
      ${g.rainToday?`<span class="rain-tag">${ic('cloud',20)}MƯA</span>`:''}
    </div>
    ${g.reviews[0]?`<div class="pxf2 review show static" style="display:block;cursor:pointer" onclick="goProfile()"><div class="lbl" style="margin-bottom:8px">ĐÁNH GIÁ MỚI NHẤT</div>${reviewHTML(g.reviews[0])}</div>`:''}
  </div>
  <div class="pc-col">
    <div>
      <div class="sec-t">${ic('box',22)}NHẬN ĐƠN</div>
      <div class="job-grid">
        <button class="btn b-gr job" ${cF?'':'disabled'} onclick="doDelivery('food')">${ic('bowl',36)}<div class="nm">${fj.name}</div><div class="er">${fj.earn}</div><div class="co">${jc(fj)}</div></button>
        <button class="btn b-cy job" ${cG?'':'disabled'} onclick="doDelivery('goods')">${ic('box',36)}<div class="nm">${gj.name}</div><div class="er">${gj.earn}</div><div class="co">${jc(gj)}</div></button>
      </div>
      ${(!cF||!cG)?`<div class="job-why">${ic('warn',18)}<div>${[!cF?`${fj.name}: ${jobWhy(fj)}`:'',!cG?`${gj.name}: ${jobWhy(gj)}`:''].filter(Boolean).join('<br>')}</div></div>`:''}
    </div>
    <div>
      <div class="sec-t">HÀNH ĐỘNG</div>
      <div class="util-grid">
        <button class="btn b-dim util" onclick="doRefuel()">${ic('fuel',28)}<span class="lb">NẠP XĂNG</span><span class="sb" style="color:var(--or)">${Math.round(C.fuelCost/fuelMax()).toLocaleString('vi-VN')}đ/%</span></button>
        <button class="btn b-dim util" onclick="doSleep()">${ic('moon',28)}<span class="lb">NGỦ NGHỈ</span><span class="sb" style="color:var(--cy)">+${C.sleepRate}/giây</span></button>
        <button class="btn b-pu util" onclick="goUpgrade()">${ic('gear',28)}<span class="lb">NÂNG CẤP</span><span class="sb">xe & phụ tùng</span></button>
      </div>
      <button class="btn b-cy blk endday" onclick="doEndDay()">${ic('flag',24)}KẾT THÚC NGÀY ${g.day}</button>
    </div>
    <div>
      <div class="sec-t">${ic('bank',22)}TIẾT KIỆM</div>
      <div class="save-grid">
        <button class="btn b-gold sm" onclick="doSave(5e5)" ${g.cash<5e5?'disabled':''}>GỬI 500K</button>
        <button class="btn b-gold sm" onclick="doSave(1e6)" ${g.cash<1e6?'disabled':''}>GỬI 1TR</button>
        <button class="btn b-gold sm" onclick="doSave(5e6)" ${g.cash<5e6?'disabled':''}>GỬI 5TR</button>
        <button class="btn b-gold sm" onclick="doSave('all')" ${g.cash<=5e5?'disabled':''}>GỬI TẤT CẢ</button>
        <button class="btn b-red sm" onclick="doWd(1e6)" ${g.savings<1e6?'disabled':''}>RÚT 1TR</button>
        <button class="btn b-red sm" onclick="doWd('all')" ${!g.savings?'disabled':''}>RÚT HẾT</button>
      </div>
      <div class="lbl save-note">"Gửi tất cả" giữ lại 500K tiền mặt.</div>
    </div>
    <div>
      <div class="sec-t">NHẬT KÝ</div>
      <div class="log">${logs}</div>
    </div>
  </div>
  </div></div>`;
}

// MINI-GAME
function rMG(){
  if(!mgData)return'';
  if(mgData.result){
    const{ok,earn}=mgData.result;
    const msgs=['THẤT BẠI','GIAO TRỄ','XUẤT SẮC!'],cols=['var(--red)','var(--or)','var(--gr)'];
    return`<div class="mg"><div class="pxf mg-res">
      <h2 style="color:${cols[ok]};font-size:40px">${msgs[ok]}</h2>
      <p>Bắt được ${mgData.caught}/${C.mgFull} gói hàng<br>${earn>0?'+'+ff(earn):'Không có thu nhập'}</p>
      <p class="blink">Đang giao hàng...</p></div></div>`;
  }
  const cells=Array.from({length:9},(_,i)=>`<button class="mg-cell" id="mgc-${i}" data-s="e" disabled onclick="catchPkg(${i})" aria-label="Bắt gói hàng"></button>`).join('');
  return`<div class="mg">
    <div class="mg-hdr"><span class="mg-timer" id="mg-timer">${Math.ceil(mgData.timeLeft)}s</span><span class="lbl">BẮT GÓI HÀNG!</span><span class="mg-score" id="mg-score">0/${C.mgFull}</span></div>
    <div class="bar"><i id="mg-bar" class="gr" style="width:0%"></i></div>
    <div class="mg-grid" id="mg-grid">${cells}</div>
    <div class="mg-hint">Chạm vào gói hàng trước khi biến mất!</div>
    <div class="mg-hint" style="color:var(--or)">Cần ${C.mgFull} gói để nhận đủ tiền</div>
  </div>`;
}

// DELIVERY / REFUEL / SLEEP SCREENS
function rDeliverAnim(){
  if(!g.activeAnim)return'';
  const{job}=g.activeAnim;
  return`<div class="anim">
    <div class="anim-t">${job.name}</div>
    ${sceneHTML(job.id==='food'?'bowl':'box')}
    <div id="anim-status" class="anim-status">ĐANG GIAO HÀNG...</div>
    <div id="anim-earn-val" class="anim-earn" style="display:none"></div>
    <div id="rv" class="review pxf2"></div>
  </div>`;
}
function rRefuelAnim(){
  if(!g.activeAnim)return'';
  const{timeLeft,startFuel,targetFuel}=g.activeAnim;
  return`<div class="anim">
    <div class="anim-t">ĐANG ĐỔ XĂNG</div>
    <div class="pump">${ic('fuel',96)}</div>
    <div class="tank"><div id="fuel-fill" class="tank-fill" style="height:${startFuel||g.fuel}%"></div></div>
    <div id="fuel-txt" class="refuel-txt">${timeLeft}s còn lại · ${startFuel||g.fuel}%</div>
    <div class="lbl">Mục tiêu: ${targetFuel||100}%</div>
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
      const owned=g.upgrades[u.id];
      const btn=owned&&!u.rep
        ?`<div class="owned">${ic('check',18)}ĐÃ CÓ</div>`
        :`<button class="btn b-pu" onclick="buyUpgrade('${u.id}')" ${g.cash<u.cost||(u.rep&&g.vehicleHp>=100)?'disabled':''}>${u.rep&&g.vehicleHp>=100?'XE ĐẦY':ff(u.cost)}</button>`;
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
  const revs=g.reviews.length?g.reviews.map(r=>`<div class="pxf2 rev">
      <div class="rev-top"><span class="rev-who">${esc(r.who)}</span>${starsFixed(r.stars,16)}</div>
      <div class="rev-txt">${esc(r.text)}</div>
      <div class="rev-who" style="margin-top:8px">${ic(r.job==='food'?'bowl':'box',16)} Ngày ${r.day}, tháng ${r.month}</div></div>`).join('')
    :`<div class="pxf empty">Chưa có đánh giá nào. Hãy giao đơn đầu tiên!</div>`;
  return`<div class="prof">
    <div class="shop-hdr"><button class="btn b-dim sm" onclick="goGame()">${ic('back',20)}VỀ</button><span class="shop-title">HỒ SƠ TÀI XẾ</span><span style="width:76px"></span></div>
    <div class="pxf prof-top"><div class="avatar">${avatarHTML(p.helmet,96)}</div>
      <div class="prof-info"><div class="prof-name">${esc(pname())}</div>
        <div class="prof-avg">${starsHTML(g.stars,20)}<b>${g.stars.toFixed(1)}</b></div>
        <div class="lbl">${g.reviews.length} đánh giá gần đây</div></div></div>
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
      </div>
      <div class="interest">${ic('bank',20)} LÃI TIẾT KIỆM ${(C.dailyInterest*100).toFixed(1).replace(/\.0$/,'')}%: +${ff(interest)}<small>Tiết kiệm: ${ff(g.savings)}</small></div>
      <button class="btn b-gr blk" onclick="confirmDayEnd()">${day<C.daysPerMonth?'NGÀY '+(day+1):'KẾT THÁNG'}</button>
    </div></div>`;
  }
  if(type==='monthEnd'){
    const{month,earned,bonus,del}=modal;const net=earned+bonus-BILLS;
    const billRows=C.monthly.map(b=>`<div class="month-row"><span>${b.n}</span><span style="color:var(--red)">-${ff(b.c)}</span></div>`).join('');
    const bl=del>=150?'(KIM CƯƠNG)':del>=100?'(VÀNG)':del>=50?'(BẠC)':'';
    return`<div class="overlay"><div class="pxf2 modal">
      <div class="m-title" style="color:var(--gold)">${ic('cal',28)} THÁNG ${month} KẾT THÚC</div>
      <div class="lbl" style="margin-bottom:8px">${del} đơn ${bl}</div>
      <div class="m-h" style="color:var(--gr)">THU NHẬP</div>
      <div class="month-row"><span>Giao hàng</span><span style="color:var(--gr)">+${ff(earned)}</span></div>
      ${bonus?`<div class="month-row"><span>Thưởng Be ${bl}</span><span style="color:var(--gr)">+${ff(bonus)}</span></div>`:''}
      <div class="m-h" style="color:var(--red)">CHI PHÍ</div>
      ${billRows}
      <div class="bar" style="margin:14px 4px"><i class="${net>=0?'gr':'red'}" style="width:100%"></i></div>
      <div class="month-row" style="color:var(--tx)"><span>KẾT QUẢ</span><span style="color:${net>=0?'var(--gr)':'var(--red)'}">${net>=0?'+':''}${ff(net)}</span></div>
      <div class="lbl" style="margin:8px 0 14px">Tiền mặt sau: ${ff(g.cash+bonus-BILLS)}${g.cash+bonus-BILLS<0&&g.savings>0?'<br>Thiếu sẽ tự rút từ tiết kiệm.':''}</div>
      <button class="btn b-gr blk" onclick="confirmMonthEnd()">${month<C.maxMonths?'THÁNG '+(month+1):'KẾT THÚC GAME'}</button>
    </div></div>`;
  }
  return'';
}

// END
function rEnd(win){
  const m=g.month,lack=Math.max(0,C.winTarget-g.savings);
  if(win)return`<div class="end">
    ${ic('trophy',88)}
    <h1 style="color:var(--gold);font-family:var(--f-tx);font-size:44px">CHIẾN THẮNG!</h1>
    <div class="lbl">${esc(pname())} đã đạt mục tiêu 100 triệu</div>
    <div class="pxf end-stats">
      <div class="month-row"><span>Tiết kiệm</span><span style="color:var(--gold)">${ff(g.savings)}</span></div>
      <div class="month-row"><span>Số tháng</span><span>${m}/24</span></div>
      <div class="month-row"><span>Tổng đơn</span><span>${g.totalDelivered}</span></div>
      <div class="month-row"><span>Đánh giá</span><span>${g.stars.toFixed(1)}/5.0</span></div>
    </div>
    <button class="btn b-gr" onclick="resetGame()">CHƠI LẠI</button>
  </div>`;
  return`<div class="end">
    ${ic('skull',88)}
    <h1 style="color:var(--red);font-family:var(--f-tx);font-size:44px">THẤT BẠI</h1>
    <div class="lbl">${g.month>C.maxMonths?'Hết 24 tháng!':'Hết tiền!'}</div>
    <div class="pxf end-stats">
      <div class="month-row"><span>Đã tiết kiệm</span><span>${ff(g.savings)}</span></div>
      <div class="month-row"><span>Còn thiếu</span><span style="color:var(--red)">${ff(lack)}</span></div>
      <div class="month-row"><span>Tổng đơn</span><span>${g.totalDelivered}</span></div>
    </div>
    <button class="btn b-gr" onclick="resetGame()">THỬ LẠI</button>
  </div>`;
}

// INIT
init();render();getSample();
