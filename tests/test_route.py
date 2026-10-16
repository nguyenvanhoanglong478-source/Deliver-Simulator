"""Route Rush (memorise the turns, steer through junctions) + compact layout tests. Run: python3 tests/test_route.py"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
START="g.stamina=100;g.fuel=100;g.offers[0]={type:'goods',dist:1,rush:false,mg:'route',peak:false,base:80000};doDelivery(0)"
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':360,'height':640}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload(); pg.evaluate("startGame(true)")
    ok('turn sequences always mixed (1000)',pg.evaluate("(()=>{for(let i=0;i<1000;i++){const t=genTurns();if(t.length!==RT_N||new Set(t).size<2)return false}return true})()"))
    pg.evaluate(START); pg.wait_for_function("g.phase==='minigame'",timeout=5000)
    ok('starts in preview with all 5 turns shown',pg.evaluate("mgData.rtPhase==='preview'")and pg.evaluate("[...document.querySelectorAll('.rt-slot')].every(e=>'◀▲▶'.includes(e.textContent))"))
    pg.evaluate("rtMove(0)"); ok('input ignored during preview',pg.evaluate("mgData.idx")==0 and pg.evaluate("mgData.mistakes")==0)
    t0=pg.evaluate("mgData.timeLeft"); pg.wait_for_timeout(1200); ok('clock not running in preview',pg.evaluate("mgData.timeLeft")==t0)
    pg.wait_for_function("mgData.rtPhase==='drive'",timeout=5000)
    ok('turns hidden without GPS in drive',pg.evaluate("[...document.querySelectorAll('.rt-slot')].filter(e=>e.textContent==='?').length")>=4)
    # right turn advances
    pg.evaluate("rtMove(mgData.turns[mgData.idx])"); ok('correct turn advances',pg.evaluate("mgData.idx")==1 and pg.evaluate("mgData.mistakes")==0)
    # wrong turn costs 2 s
    tl=pg.evaluate("mgData.timeLeft"); pg.evaluate("rtMove(mgData.turns[mgData.idx]===0?1:0)"); pg.wait_for_timeout(120)
    ok('wrong turn: mistake + 2 s, same junction',pg.evaluate("mgData.mistakes")==1 and pg.evaluate("mgData.idx")==1 and tl-pg.evaluate("mgData.timeLeft")>1.8,f"{tl}->{pg.evaluate('mgData.timeLeft')}")
    # missing a junction counts as a mistake
    m0=pg.evaluate("mgData.mistakes"); pg.wait_for_timeout(2500); ok('missed junction counts as mistake',pg.evaluate("mgData.mistakes")>m0)
    # finish
    pg.evaluate("while(mgData&&!mgData.done&&mgData.idx<RT_N)rtMove(mgData.turns[mgData.idx])")
    pg.wait_for_function("mgData.result",timeout=4000)
    ok('finishing gives a result (>=1 star)',pg.evaluate("mgData.result.ok")>=1)
    pg.wait_for_function("g.phase==='game'",timeout=15000)
    ok('order delivered',pg.evaluate("g.delivered>=1"))
    # perfect run = full pay
    pg.evaluate("modal=null;"+START); pg.wait_for_function("g.phase==='minigame'",timeout=5000)
    pg.wait_for_function("mgData.rtPhase==='drive'",timeout=5000)
    pg.evaluate("while(mgData&&!mgData.done&&mgData.idx<RT_N)rtMove(mgData.turns[mgData.idx])")
    pg.wait_for_function("mgData.result",timeout=4000); ok('perfect run: full pay',pg.evaluate("mgData.result.ok")==2)
    pg.wait_for_function("g.phase==='game'",timeout=15000)
    # timeout with little progress = fail
    pg.evaluate("modal=null;"+START); pg.wait_for_function("g.phase==='minigame'",timeout=5000)
    pg.wait_for_function("mgData.rtPhase==='drive'",timeout=5000)
    pg.evaluate("mgData.startTs-=100000"); pg.wait_for_function("mgData.result",timeout=4000)
    ok('timeout with no progress fails',pg.evaluate("mgData.result.ok")==0)
    pg.wait_for_function("g.phase==='game'",timeout=15000)
    # GPS shows next 3
    pg.evaluate("g.upgrades={gps:true};modal=null;"+START); pg.wait_for_function("g.phase==='minigame'",timeout=5000)
    pg.wait_for_function("mgData.rtPhase==='drive'",timeout=5000)
    ok('GPS keeps the next 3 turns visible',pg.evaluate("[...document.querySelectorAll('.rt-slot')].filter(e=>e.textContent!=='?').length")==3)
    # pause freezes everything
    pg.keyboard.press('p'); tl=pg.evaluate("mgData.timeLeft"); mi=pg.evaluate("mgData.mistakes"); pg.wait_for_timeout(3000)
    ok('paused: timer and junction frozen',abs(pg.evaluate("mgData.timeLeft")-tl)<.1 and pg.evaluate("mgData.mistakes")==mi)
    pg.keyboard.press('p'); pg.wait_for_timeout(300); ok('resume: no instant miss',pg.evaluate("mgData.mistakes")==mi)
    pg.keyboard.press('ArrowUp'); ok('keyboard works',pg.evaluate("mgData.idx+mgData.mistakes")>=mi+0 and pg.evaluate("mgData.mistakes+mgData.idx")>=1)
    # layout
    pg.evaluate("stopT(mgTmr);mgData=null;modal=null"); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload(); pg.evaluate("startGame(true)")
    ok('main screen compact (<1560px, incl. life meters)',pg.evaluate("document.documentElement.scrollHeight")<1560,str(pg.evaluate("document.documentElement.scrollHeight")))
    ok('meters 3 per row',pg.evaluate("new Set([...document.querySelectorAll('.meters .meter')].map(e=>Math.round(e.getBoundingClientRect().top))).size")==1)
    pg.evaluate("g.cash=9e6;g.phase='upgrade';render()")
    ok('shop buttons inside screen',pg.evaluate("[...document.querySelectorAll('.upg-act .btn')].filter(b=>b.getBoundingClientRect().right>innerWidth).length")==0)
    ok('no horizontal scroll',pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    ok('no page errors',not errs,str(errs)); b.close()
for r in res: print(*r)
print(sum(r[0]=='PASS' for r in res),'/',len(res))
