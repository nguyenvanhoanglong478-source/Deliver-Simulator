"""Game clock (src/loop.js) tests: one loop, pause freezes everything. Run: python3 tests/test_loop.py"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':360,'height':640}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload(); pg.evaluate("startGame(true)")
    # scheduler basics
    pg.evaluate("window.__n=0;window.__a=0;const t=every(100,()=>__n++);after(350,()=>__a++);window.__t=t")
    pg.wait_for_timeout(900); n=pg.evaluate("__n"); ok('every() fires repeatedly',6<=n<=16,str(n)); ok('after() fires once',pg.evaluate("__a")==1)
    pg.evaluate("stopT(__t)"); n0=pg.evaluate("__n"); pg.wait_for_timeout(400); ok('stopT() stops it',pg.evaluate("__n")==n0)
    # pause freezes the clock and every task
    pg.evaluate("window.__n=0;window.__t=every(100,()=>__n++)"); pg.wait_for_timeout(300)
    pg.keyboard.press('p'); g0=pg.evaluate("gnow()"); n0=pg.evaluate("__n"); pg.wait_for_timeout(1500)
    ok('game time frozen while paused',pg.evaluate("gnow()")==g0); ok('tasks frozen while paused',pg.evaluate("__n")==n0)
    pg.keyboard.press('p'); pg.wait_for_timeout(500); ok('time and tasks resume',pg.evaluate("gnow()")>g0 and pg.evaluate("__n")>n0)
    pg.evaluate("stopT(__t)")
    # pause during the sleep animation (light overlay, no re-render)
    pg.evaluate("g.stamina=10;doSleep()"); pg.wait_for_timeout(1300)
    pg.keyboard.press('p'); s0=pg.evaluate("g.stamina"); ov=pg.evaluate("!document.getElementById('pause-ov').hidden"); pg.wait_for_timeout(2500)
    ok('sleep: overlay shown, stamina frozen',ov and pg.evaluate("g.stamina")==s0,f"{s0}->{pg.evaluate('g.stamina')}")
    pg.click("#pause-ov >> text=TIẾP TỤC"); pg.wait_for_timeout(1300); ok('sleep: resumes',pg.evaluate("g.stamina")>s0)
    pg.evaluate("stopSleep()")
    # pause during the delivery animation
    pg.evaluate("g.stamina=100;g.fuel=100;g.offers[0]={type:'food',dist:2,rush:false,mg:'catch',peak:false,base:50000};g.cash=1e6;render();afterMinigame(50000,C.jobs.food,null)")
    ok('delivery animation running',pg.evaluate("g.phase")=='anim-deliver')
    pg.wait_for_timeout(500); pg.keyboard.press('p'); c0=pg.evaluate("g.cash"); pg.wait_for_timeout(6000)
    ok('delivery frozen while paused (no payout, same phase)',pg.evaluate("g.phase")=='anim-deliver' and pg.evaluate("g.cash")==c0)
    pg.keyboard.press('p'); pg.wait_for_function("g.phase==='game'",timeout=15000); ok('delivery completes after resume',pg.evaluate("g.cash")>=c0)
    # refuel gauge frozen
    pg.evaluate("modal=null;g.fuel=20;g.cash=5e6;render();doRefuel()"); pg.evaluate("rfSlide(100);rfConfirm()"); pg.wait_for_timeout(900)
    pg.keyboard.press('p'); f0=pg.evaluate("document.getElementById('fuel-pct').textContent"); pg.wait_for_timeout(2500)
    ok('refuel gauge frozen',pg.evaluate("document.getElementById('fuel-pct').textContent")==f0 and pg.evaluate("g.phase")=='anim-refuel')
    pg.keyboard.press('p'); pg.wait_for_function("g.phase==='game'",timeout=9000); ok('refuel completes, fuel 100',pg.evaluate("g.fuel")==100)
    # hidden tab pauses (also in animations)
    pg.evaluate("g.stamina=10;doSleep()"); pg.wait_for_timeout(300)
    pg.evaluate("Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))")
    ok('hidden tab pauses an animation',pg.evaluate("GT.paused"))
    pg.evaluate("Object.defineProperty(document,'hidden',{value:false,configurable:true})"); pg.keyboard.press('p'); pg.evaluate("stopSleep()")
    ok('no page errors',not errs,str(errs)); b.close()
for r in res: print(*r)
print(sum(r[0]=='PASS' for r in res),'/',len(res))
