// ===== BLACKJACK (in the ĐỜI SỐNG hub) =====
// Standard rules: fresh shuffled 52-card deck every hand, dealer stands on all 17s, blackjack pays 3:2, double down on the
// first two cards, one split per hand (split aces get one card each). Pure chance and fair: nothing here looks at the
// player's luck, difficulty or habit meters. Each hand costs 10 s of the day and raises the gambling meter; max BJ_MAX hands a day.
const BJ_CHIPS=[5e4,1e5,2e5,5e5,1e6,2e6],BJ_TIME=10,BJ_HOOK=2,BJ_MIN=5e4;
let BJ=null;
function bjCap(){return Math.min(g.cash,Math.max(BJ_MIN,Math.floor(g.cash*.2)))}   // table limit: 20% of cash on hand
function bjCards(deck){const r=[];for(const s of[0,1,2,3])for(let k=1;k<=13;k++)r.push({k,s});for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r}
function bjVal(cards){let t=0,a=0;cards.forEach(c=>{if(c.k===1){a++;t+=11}else t+=Math.min(10,c.k)});while(t>21&&a>0){t-=10;a--}return{t,soft:a>0&&t<=21}}
function bjNat(h){return h.cards.length===2&&!h.split&&bjVal(h.cards).t===21}
function bjDraw(){return BJ.deck.pop()}
function bjOpen(){
  if(!modal||modal.type!=='hub'||g.phase!=='game')return;
  BJ={phase:'bet',bet:Math.min(1e5,Math.max(BJ_MIN,bjCap())),chase:false,msg:''};modal={type:'bj'};render();
}
function bjLeave(){
  if(!BJ||BJ.phase==='play'||BJ.phase==='dealer')return;
  if(g.bjLoss>=3)g.bjLoss=0;   // walking away resets the streak
  BJ=null;modal={type:'hub'};save();render();
}
// The table limit follows the cash on hand, so after a loss the chosen bet can exceed it: drop to the biggest chip that fits.
function bjFixBet(){
  if(!BJ)return;const cap=bjCap();
  if(BJ.bet>cap||BJ.bet<BJ_MIN){const fit=BJ_CHIPS.filter(v=>v<=cap);BJ.bet=fit.length?fit[fit.length-1]:Math.max(BJ_MIN,Math.min(cap,BJ.bet))}
}
function bjBet(v){if(BJ&&(BJ.phase==='bet'||BJ.phase==='done')&&v>=BJ_MIN&&v<=bjCap()){BJ.bet=v;render()}}
function bjCanPlay(){return g.bjToday<BJ_MAX&&g.dayTimeLeft>BJ_TIME&&g.cash>=BJ_MIN}
function bjDeal(){
  if(!BJ||BJ.phase!=='bet'&&BJ.phase!=='done')return;
  if(!bjCanPlay()){return}
  bjFixBet();const bet=BJ.bet;if(bet<BJ_MIN||g.cash<bet)return;
  sfx('card');BJ.deck=bjCards();BJ.bet=bet;BJ.chase=BJ.chase||false;
  lifeSpend(bet);g.bjToday++;g.dayTimeLeft-=BJ_TIME;g.gamble=Math.min(100,g.gamble+BJ_HOOK);
  BJ.hands=[{cards:[bjDraw()],bet,done:false}];BJ.dealer=[bjDraw()];
  BJ.hands[0].cards.push(bjDraw());BJ.dealer.push(bjDraw());
  BJ.hi=0;BJ.phase='play';BJ.res=null;BJ.msg='';
  persistNow();   // the stake is gone even if the page is reloaded mid-hand
  const pn=bjNat(BJ.hands[0]),dn=bjVal(BJ.dealer).t===21;
  if(pn||dn){BJ.hands[0].done=true;bjSettle();return}
  render();
}
function bjHand(){return BJ.hands[BJ.hi]}
function bjCanDouble(){const h=bjHand();return BJ.phase==='play'&&h.cards.length===2&&!h.aceSplit&&g.cash>=h.bet}
function bjCanSplit(){const h=bjHand();return BJ.phase==='play'&&BJ.hands.length===1&&h.cards.length===2&&Math.min(10,h.cards[0].k)===Math.min(10,h.cards[1].k)&&g.cash>=h.bet}
function bjNext(){
  while(BJ.hi<BJ.hands.length&&BJ.hands[BJ.hi].done)BJ.hi++;
  if(BJ.hi>=BJ.hands.length){bjDealer();return}
  const h=bjHand();
  if(h.cards.length===1){h.cards.push(bjDraw());if(h.aceSplit||bjVal(h.cards).t>=21)h.done=true;return bjNext()}   // second hand of a split gets its card
  render();
}
function bjHit(){
  if(!BJ||BJ.phase!=='play')return;const h=bjHand();sfx('card');h.cards.push(bjDraw());
  const v=bjVal(h.cards).t;if(v>=21)h.done=true;
  bjNext();
}
function bjStand(){if(!BJ||BJ.phase!=='play')return;bjHand().done=true;bjNext()}
function bjDouble(){
  if(!BJ||!bjCanDouble())return;const h=bjHand();
  lifeSpend(h.bet);h.bet*=2;h.doubled=true;h.cards.push(bjDraw());h.done=true;persistNow();bjNext();
}
function bjSplit(){
  if(!BJ||!bjCanSplit())return;const h=bjHand();
  lifeSpend(h.bet);
  const c2=h.cards.pop(),ace=c2.k===1;
  h.split=true;h.aceSplit=ace;
  BJ.hands.push({cards:[c2],bet:h.bet,done:false,split:true,aceSplit:ace});
  h.cards.push(bjDraw());if(ace||bjVal(h.cards).t>=21)h.done=true;
  persistNow();bjNext();
}
function bjDealer(){
  BJ.phase='dealer';BJ.hi=-1;render();
  const live=BJ.hands.some(h=>bjVal(h.cards).t<=21&&!bjNat(h));
  const step=()=>{
    if(!BJ)return;
    if(live&&bjVal(BJ.dealer).t<17){BJ.dealer.push(bjDraw());render();after(550,step)}else bjSettle();
  };
  after(500,step);
}
function bjSettle(){
  const d=bjVal(BJ.dealer).t,dn=BJ.dealer.length===2&&d===21;
  let ret=0,staked=0;const lines=[];
  BJ.hands.forEach(h=>{
    const v=bjVal(h.cards).t;staked+=h.bet;let r=0,t;
    if(bjNat(h)){if(dn){r=h.bet;t='push'}else{r=h.bet+Math.floor(h.bet*1.5);t='bj'}}
    else if(v>21){t='bust'}
    else if(dn){t='lose'}
    else if(d>21||v>d){r=h.bet*2;t='win'}
    else if(v===d){r=h.bet;t='push'}
    else t='lose';
    h.out=t;h.ret=r;ret+=r;
  });
  if(ret>0){g.cash+=ret;g.fin.life=Math.max(0,(g.fin.life||0)-ret)}
  const net=ret-staked;g.bjNet+=net;sfx(net>0?'win':net<0?'lose':'push');
  if(net<0){g.bjLoss++;if(g.bjLoss>=4){lifeGain('family',-3);addLog(T('Thua liền mấy ván, bạn về nhà muộn và cáu: -3 gia đình','Lost several hands in a row, you got home late and cranky: -3 family'),'warn')}}
  else if(net>0)g.bjLoss=0;
  BJ.res={net,ret,staked};BJ.phase='done';BJ.hi=-1;
  if(net>0)burst(18,FX_COIN);
  addLog(`Blackjack: ${net>0?T('thắng +','won +')+ff(net):net<0?T('thua ','lost ')+ff(-net):T('hòa','push')}`,net>0?'earn':net<0?'cost':'info');
  save();render();
}
function bjChase(){if(BJ&&BJ.phase==='done'){BJ.chase=true;render()}}
function bjLoan(){takeLoan('hot');if(BJ)render()}

// ---- drawing ----
const BJ_SUIT=[
 ['..XXX..','..XXX..','XXXXXXX','XXXXXXX','XX.X.XX','...X...','..XXX..'],   // club
 ['...X...','..XXX..','.XXXXX.','XXXXXXX','.XXXXX.','..XXX..','...X...'],   // diamond
 ['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...','.......'],   // heart
 ['...X...','..XXX..','.XXXXX.','XXXXXXX','XXXXXXX','...X...','..XXX..'],   // spade
];
function bjSuit(s,px){
  let r='';BJ_SUIT[s].forEach((row,y)=>{[...row].forEach((ch,x)=>{if(ch==='X')r+=`<rect x="${x}" y="${y}" width="1" height="1"/>`})});
  return`<svg class="bj-su" width="${px}" height="${px}" viewBox="0 0 7 7" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">${r}</svg>`;
}
function bjCardHTML(c,hidden){
  if(hidden)return'<div class="bj-card back"></div>';
  const lab=c.k===1?'A':c.k===11?'J':c.k===12?'Q':c.k===13?'K':String(c.k),red=c.s===1||c.s===2;
  return`<div class="bj-card${red?' red':''}"><b>${lab}</b>${bjSuit(c.s,22)}</div>`;
}
function bjHandHTML(cards,hideSecond){
  return`<div class="bj-cards">${cards.map((c,i)=>bjCardHTML(c,hideSecond&&i===1)).join('')}</div>`;
}
const BJ_OUT={bj:['BLACKJACK!','gr'],win:[T('THẮNG','WIN'),'gr'],push:[T('HÒA','PUSH'),'gold'],lose:[T('THUA','LOSE'),'red'],bust:[T('QUẮC','BUST'),'red']};
function bjHTML(){
  if(!BJ)return'';
  if(BJ.phase==='bet'||BJ.phase==='done')bjFixBet();
  const hide=BJ.phase==='play',dv=bjVal(BJ.dealer||[]);
  const left=BJ_MAX-g.bjToday;
  let h=`<div class="overlay"><div class="pxf2 modal bj">
    <div class="m-title" style="color:var(--gold)">${ic('dice',28)} ${T('SÒNG BÀI','CARD TABLE')}</div>
    <div class="hub-sum"><span>${T('Tiền mặt','Cash')} <b>${ff(g.cash)}</b></span><span>${T('Còn','Left')} <b>${left}</b>/${BJ_MAX} ${T('ván','hands')}</span><span>${T('Tổng','Total')} <b style="color:${g.bjNet>=0?'var(--gr)':'var(--red)'}">${g.bjNet>=0?'+':''}${ff(g.bjNet)}</b></span></div>
    <div class="bj-table">`;
  if(BJ.dealer){
    h+=`<div class="bj-row"><div class="bj-who">${T('NHÀ CÁI','DEALER')}${hide?'':` <b>${dv.t}</b>`}</div>${bjHandHTML(BJ.dealer,hide)}</div>`;
    h+=BJ.hands.map((x,i)=>{
      const v=bjVal(x.cards),o=x.out?BJ_OUT[x.out]:null,act=BJ.phase==='play'&&i===BJ.hi;
      return`<div class="bj-row${act?' act':''}"><div class="bj-who">${T('BẠN','YOU')}${BJ.hands.length>1?' '+(i+1):''} <b>${v.t}${v.soft?'*':''}</b> · ${T('cược','bet')} ${fm(x.bet)}${o?` <b class="${o[1]}">${o[0]}</b>`:''}</div>${bjHandHTML(x.cards,false)}</div>`;
    }).join('');
  }else h+=`<div class="bj-empty">${T('Bộ bài mới mỗi ván. Nhà cái dừng ở 17, blackjack trả 3:2.','Fresh deck every hand. Dealer stands on 17, blackjack pays 3:2.')}</div>`;
  h+='</div>';
  if(BJ.phase==='play'){
    h+=`<div class="hub-grid g2"><button class="btn b-gr sm" onclick="bjHit()">${T('RÚT THÊM','HIT')}</button><button class="btn b-or sm" onclick="bjStand()">${T('DẰN','STAND')}</button>
      ${bjCanDouble()?`<button class="btn b-cy sm" onclick="bjDouble()">${T('GẤP ĐÔI','DOUBLE')}</button>`:''}${bjCanSplit()?`<button class="btn b-pu sm" onclick="bjSplit()">${T('TÁCH ĐÔI BÀI','SPLIT')}</button>`:''}</div>`;
  }else if(BJ.phase==='dealer'){
    h+=`<div class="sub" style="text-align:center">${T('Nhà cái đang rút bài...','Dealer is drawing...')}</div>`;
  }else{
    if(BJ.phase==='done'){
      const r=BJ.res;
      h+=`<div class="bj-res ${r.net>0?'gr':r.net<0?'red':'gold'}">${r.net>0?T('Bạn thắng +','You won +')+ff(r.net):r.net<0?T('Bạn thua ','You lost ')+ff(-r.net):T('Hòa, nhận lại tiền cược','Push, bet returned')}</div>`;
    }
    const choose=BJ.phase==='done'&&g.bjLoss>=3&&!BJ.chase;
    if(choose){
      h+=`<div class="bj-warn">${T(`Bạn đã thua ${g.bjLoss} ván liên tiếp. Đứng dậy hay gỡ lại?`,`You\'ve lost ${g.bjLoss} hands in a row. Leave or chase it back?`)}</div>
        <div class="hub-grid g2"><button class="btn b-dim sm" onclick="bjLeave()">${T('THÔI, ĐỨNG DẬY','LEAVE THE TABLE')}</button><button class="btn b-red sm" onclick="bjChase()">${T('GỠ LẠI','CHASE IT BACK')}</button></div>`;
    }else{
      const cap=bjCap();
      h+=`<div class="bj-chips">${BJ_CHIPS.map(v=>`<button class="btn sm ${BJ.bet===v?'b-gold':'b-dim'}" onclick="bjBet(${v})" ${v>cap?'disabled':''}>${fm(v)}</button>`).join('')}</div>
        <div class="sub">${T(`Cược tối đa ${fm(cap)} (20% tiền mặt). Mỗi ván tốn ${BJ_TIME} giây và tăng chỉ số cờ bạc. Thắng thua do may rủi, bạn tự chịu trách nhiệm.`,`Max bet ${fm(cap)} (20% of cash). Each hand takes ${BJ_TIME} seconds and raises your gambling level. Wins and losses are down to luck, play at your own risk.`)}</div>`;
      const why=g.bjToday>=BJ_MAX?T('Hôm nay đủ ván rồi, mai chơi tiếp.','That\'s enough hands for today, play again tomorrow.'):g.dayTimeLeft<=BJ_TIME?T('Không đủ thời gian trong ngày.','Not enough time left today.'):g.cash<BJ_MIN?T('Không đủ tiền cược.','Not enough cash to bet.'):'';
      if(why)h+=`<div class="bj-warn">${why}</div>`;
      if(g.cash<BJ_MIN&&g.bjLoss>=4&&g.debt<2e7)h+=`<button class="btn b-red sm blk" onclick="bjLoan()"><span>${T('VAY NÓNG 3TR','HOT LOAN 3M')}<small>${T('lãi 15%/tháng','15%/month interest')}</small></span></button>`;
      h+=`<div class="hub-grid g2"><button class="btn b-dim sm" onclick="bjLeave()">${T('ĐỨNG DẬY','LEAVE')}</button><button class="btn b-gr sm" onclick="bjDeal()" ${bjCanPlay()&&BJ.bet<=bjCap()?'':'disabled'}>${BJ.phase==='done'?T('VÁN MỚI','NEW HAND'):T('CHIA BÀI','DEAL')} · ${fm(BJ.bet)}</button></div>`;
    }
  }
  return h+'</div></div>';
}
