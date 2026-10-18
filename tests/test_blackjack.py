"""Blackjack (life hub) tests. Run: python3 tests/test_blackjack.py"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload()
    E=pg.evaluate
    E("startGame(true)");E("window.bjReal=bjCards")
    # forced deck helper: ranks in draw order (player, dealer, player, dealer, then extra draws)
    E("window.stk=(r)=>{bjCards=()=>r.slice().reverse().map(k=>({k,s:0}))}")
    E("window.fresh=(cash)=>{modal=null;g.cash=cash||1e6;g.bjToday=0;g.bjLoss=0;g.bjNet=0;g.dayTimeLeft=300;g.gamble=0;openHub();bjOpen()}")
    def play(deck,acts,cash=1e6):
        E(f"stk({deck});fresh({cash});bjDeal()")
        for a in acts: E(a+"()")
        pg.wait_for_function("BJ&&BJ.phase==='done'",timeout=8000)
    # --- values
    ok('hand values',E("[bjVal([{k:1},{k:13}]).t,bjVal([{k:1},{k:1},{k:9}]).t,bjVal([{k:13},{k:12},{k:5}]).t,bjVal([{k:1},{k:6}]).soft,bjVal([{k:1},{k:6},{k:10}]).t]")==[21,21,25,True,17])
    # --- available from the start of the game
    E("startGame(true);openHub()"); t=pg.inner_text('.modal'); ok('hub has the casino from day 1','SÒNG BÀI' in t and E("g.day")==1 and E("g.month")==1)
    ok('enter table',E("(bjOpen(),modal.type==='bj'&&BJ.phase==='bet')")); ok('table text shows rules','3:2' in pg.inner_text('.modal') and 'tự chịu trách nhiệm' in pg.inner_text('.modal'))
    # --- deal costs
    E("stk([10,10,7,9]);fresh(1e6)"); t0=E("g.dayTimeLeft")
    E("bjDeal()")
    ok('deal: bet taken, 10s, gamble +2, hand count',E("g.cash")==9e5 and E("g.dayTimeLeft")==t0-10 and E("g.gamble")==2 and E("g.bjToday")==1 and E("BJ.phase")=='play')
    ok('stake persisted immediately (reload cannot refund)',E("JSON.parse(localStorage.getItem('btd_v2')).cash")==9e5)
    ok('dealer hole card hidden while playing',pg.locator('.bj-card.back').count()==1 and pg.locator('.bj-card').count()==4)
    E("bjStand()"); pg.wait_for_function("BJ.phase==='done'",timeout=6000)
    ok('17 vs dealer 19 loses',E("g.cash")==9e5 and E("g.bjNet")==-1e5 and E("g.bjLoss")==1 and E("g.fin.life")>=1e5)
    # --- win / push / blackjack
    play([10,10,9,7],["bjStand"]); ok('19 vs 17 wins 1:1',E("g.cash")==1.1e6 and E("g.bjNet")==1e5 and E("g.bjLoss")==0)
    play([10,10,8,8],["bjStand"]); ok('18 v 18 pushes',E("g.cash")==1e6 and E("g.bjNet")==0)
    E("stk([1,10,13,9]);fresh(1e6);bjDeal()"); ok('blackjack settles at once, pays 3:2',E("BJ.phase")=='done'and E("g.cash")==1.15e6 and E("g.bjNet")==1.5e5,str(E("[BJ.phase,g.cash]")))
    E("stk([10,1,9,13]);fresh(1e6);bjDeal()"); ok('dealer blackjack wins at once',E("BJ.phase")=='done'and E("g.cash")==9e5)
    E("stk([1,1,13,13]);fresh(1e6);bjDeal()"); ok('both blackjack push',E("g.cash")==1e6)
    # --- dealer stands on 17, hits 16
    play([10,10,9,6,10],["bjStand"]); ok('dealer hits 16 and busts, player wins',E("g.cash")==1.1e6 and E("BJ.dealer.length")==3)
    play([10,10,9,7,9],["bjStand"]); ok('dealer stands on 17 (no extra card)',E("BJ.dealer.length")==2)
    # --- bust
    play([10,10,6,7,10],["bjHit"]); ok('hit to 26 busts, loses without dealer drawing',E("BJ.hands[0].out")=='bust' and E("BJ.dealer.length")==2 and E("g.cash")==9e5)
    # --- double
    E("stk([5,10,6,8,10]);fresh(1e6);bjDeal()"); ok('double offered on first two cards',E("bjCanDouble()"))
    E("bjDouble()"); pg.wait_for_function("BJ.phase==='done'",timeout=6000)
    ok('double: stake doubled, one card, 21 beats 18',E("BJ.hands[0].bet")==2e5 and E("BJ.hands[0].cards.length")==3 and E("g.cash")==1.2e6 and E("g.bjNet")==2e5,str(E("[g.cash,g.bjNet]")))
    E("stk([5,10,6,8,10]);fresh(1.5e5);bjDeal()"); ok('cannot double without the cash',not E("bjCanDouble()") or E("g.cash")>=E("BJ.hands[0].bet"))
    # --- split
    E("stk([8,10,8,7,3,10]);fresh(1e6);bjDeal()"); ok('split offered on a pair',E("bjCanSplit()"))
    E("bjSplit()"); ok('split: two hands, extra stake taken',E("BJ.hands.length")==2 and E("g.cash")==8e5 and pg.locator('.bj-row').count()==3,str(E("[BJ.hands.length,g.cash]")))
    E("bjStand()"); E("bjStand()"); pg.wait_for_function("BJ.phase==='done'",timeout=6000)
    ok('split: 11 loses, 18 wins, net 0',E("BJ.hands.map(h=>h.out).join()")=='lose,win' and E("g.cash")==1e6 and E("g.bjNet")==0,str(E("[BJ.hands.map(h=>h.out).join(),g.cash]")))
    E("stk([1,10,1,7,9,10]);fresh(1e6);bjDeal();bjSplit()"); ok('split aces: one card each, then dealer plays',E("BJ.hands.every(h=>h.cards.length===2)") and E("BJ.phase")!='play',str(E("BJ.phase")))
    pg.wait_for_function("BJ.phase==='done'",timeout=6000); ok('split-ace 21 is not blackjack (1:1)',E("BJ.hands.every(h=>h.out!=='bj')"))
    # --- limits
    E("stk([10,10,9,7]);fresh(1e6)"); E("bjBet(5e5)"); ok('bet above 20% of cash refused',E("BJ.bet")!=5e5 and E("bjCap()")==2e5)
    E("bjBet(2e5)"); ok('bet within cap accepted',E("BJ.bet")==2e5)
    E("fresh(2e5)"); ok('cap floor 50K on small cash',E("bjCap()")==5e4)
    E("fresh(1e6);g.bjToday=5;render()"); c0=E("g.cash"); E("bjDeal()"); ok('5 hands per day max',E("g.cash")==c0 and E("BJ.phase")=='bet' and 'đủ ván' in pg.inner_text('.modal') and pg.locator('button:has-text("CHIA BÀI")').is_disabled())
    E("g.bjToday=5;g.day=1;lifeNewDay()"); ok('hands reset next day',E("g.bjToday")==0)
    E("fresh(1e6);g.dayTimeLeft=8"); E("bjDeal()"); ok('not enough day time: no hand',E("BJ.phase")=='bet')
    # --- loss streak choice
    E("g.dayTimeLeft=300")
    for i in range(3): play([10,10,6,9],["bjStand"]) if i==0 else (E("stk([10,10,6,9]);g.dayTimeLeft=300;bjDeal();bjStand()"),pg.wait_for_function("BJ.phase==='done'",timeout=6000))
    ok('3 losses -> choice appears',E("g.bjLoss")==3 and 'đứng dậy hay gỡ lại' in pg.inner_text('.modal').lower().replace('đứng dậy hay gỡ lại?','đứng dậy hay gỡ lại') and pg.locator('button:has-text("GỠ LẠI")').count()==1)
    ok('new hand not offered while choice pending',pg.locator('button:has-text("VÁN MỚI")').count()==0)
    E("bjLeave()") if False else pg.click('button:has-text("THÔI, ĐỨNG DẬY")'); ok('walking away resets streak, back to hub',E("g.bjLoss")==0 and E("modal.type")=='hub' and E("BJ")==None)
    E("bjOpen();g.bjLoss=3;g.bjToday=3;stk([10,10,6,9]);g.dayTimeLeft=300;bjDeal();bjStand()"); pg.wait_for_function("BJ.phase==='done'",timeout=6000)
    f0=E("g.family"); pg.click('button:has-text("GỠ LẠI")'); ok('chasing continues play',pg.locator('button:has-text("VÁN MỚI")').count()==1)
    E("stk([10,10,6,9]);g.dayTimeLeft=300;g.bjToday=2;bjDeal();bjStand()"); pg.wait_for_function("BJ.phase==='done'",timeout=6000)
    ok('losing while chasing hurts family (-3)',E("g.bjLoss")>=4 and E("g.family")==f0-3,str((f0,E("g.family"))))
    E("g.cash=3e4;render()"); ok('broke after a long streak: loan button offered','VAY NÓNG' in pg.inner_text('.modal'))
    # --- cannot leave mid-hand
    E("fresh(1e6);stk([10,10,6,9]);bjDeal();bjLeave()"); ok('cannot walk out mid-hand',E("modal.type")=='bj' and E("BJ.phase")=='play'); E("bjStand()"); pg.wait_for_function("BJ.phase==='done'",timeout=6000)
    # --- state validation
    E("g.bjToday=99"); ok('bjToday validated','bjToday' in E("stateProblems(g)")); E("repairState(g)"); ok('repaired',E("g.bjToday<=5&&stateProblems(g).length===0"))
    E("startGame(true)"); ok('old save without blackjack fields loads',E("(()=>{const s=Object.assign({},g);delete s.bjToday;delete s.bjLoss;delete s.bjNet;lifeFix(s);return s.bjToday===0&&s.bjNet===0})()"))
    # --- fairness: strategy 'stand on 17+' against the real deal/settle code
    edge=E("""(()=>{
      bjCards=window.bjReal;const A=window.after;window.after=(ms,f)=>f();const R=window.render;window.render=()=>{};
      let net=0,st=0;
      for(let i=0;i<12000;i++){
        modal={type:'hub'};g.cash=1e9;g.bjToday=0;g.dayTimeLeft=300;g.phase='game';bjOpen();BJ.bet=5e4;
        const c0=g.cash;bjDeal();
        let guard=0;while(BJ.phase==='play'&&guard++<30){bjVal(bjHand().cards).t<17?bjHit():bjStand()}
        net+=g.cash-c0;st+=5e4;BJ=null;
      }
      window.after=A;window.render=R;return net/st})()""")
    ok('fair odds: stand-on-17 player loses roughly 4-8%, no hidden bias',-.09<edge<-.02,str(edge))
    ok('no page errors',not errs,str(errs)); b.close()
for r in res: print(*r)
print(sum(r[0]=='PASS' for r in res),'/',len(res))
