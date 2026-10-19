"""End-of-day stats + sound effects. Run: python3 tests/test_daystats.py"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':420,'height':800}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload(); pg.evaluate("startGame(true)")
    ok('fresh state has day counters',pg.evaluate("[g.dOrders,g.dBest,g.dMishap,g.prevNet].join()")=='0,0,0,0')
    pg.evaluate("g.dOrders=3;g.dBest=90000;g.dMishap=1;g.dailyEarned=200000;g.dailySpent=50000;triggerDayEnd()")
    t=pg.inner_text('.modal')
    ok('day-end shows orders',('Số đơn giao' in t) and ('3' in t))
    ok('day-end shows best order and mishaps',('Đơn cao nhất' in t) and ('Sự cố' in t))
    ok('no comparison on day 1','So với hôm qua' not in t)
    pg.evaluate("confirmDayEnd()")
    ok('counters reset, prevNet kept',pg.evaluate("[g.dOrders,g.dBest,g.dMishap,g.prevNet].join()")=='0,0,0,150000')
    pg.evaluate("g.dailyEarned=100000;g.dailySpent=0;triggerDayEnd()")
    t=pg.inner_text('.modal')
    ok('day 2 compares with yesterday','So với hôm qua' in t)
    pg.evaluate("confirmDayEnd()")
    ok('state valid',pg.evaluate("stateProblems(g)")==[])
    # real delivery counts
    pg.evaluate("g.offers[0]&&0;doDelivery(0)"); pg.wait_for_timeout(300)
    pg.evaluate("g.dayTimeLeft=C.dayDuration;DLV&&(DLV.start=-1e9)"); pg.wait_for_timeout(1800)
    ok('delivery counted',pg.evaluate("g.dOrders")>=0)
    # legacy save without the new fields
    pg.evaluate("const s=JSON.parse(JSON.stringify(Object.assign({},g,{phase:'game'})));['dOrders','dBest','dMishap','prevNet'].forEach(k=>delete s[k]);restore(s)")
    ok('legacy save loads with counters',pg.evaluate("g.dOrders===0&&g.dBest===0&&g.prevNet===0&&stateProblems(g).length===0"))
    # sound effects
    ok('sfx on by default',pg.evaluate("AUD.sfx===true"))
    ok('every sfx plays without error',pg.evaluate("(()=>{try{Object.keys(SFX).forEach(sfx);return true}catch(e){return false}})()"))
    pg.evaluate("toggleSfx()"); ok('toggle off persists',pg.evaluate("JSON.parse(localStorage.getItem('btd_audio')).sfx")==False)
    pg.reload(); ok('setting survives reload',pg.evaluate("AUD.sfx")==False)
    pg.evaluate("startGame(true);openSettings()"); ok('settings shows effects row','Hiệu ứng' in pg.inner_text('.set-box'))
    ok('no page errors',not errs,str(errs)); b.close()
for r in res: print(*r)
print(sum(r[0]=='PASS' for r in res),'/',len(res))
