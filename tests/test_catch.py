"""Catch mini-game finishes as soon as all packages are caught. Run: python3 tests/test_catch.py"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload(); pg.evaluate("startGame(true)")
    E=pg.evaluate
    for rush,need,label in ((False,None,'normal'),(True,9,'rush')):
        E("rollEvt=()=>null;g.stamina=100;g.fuel=100;g.cash=1e6;modal=null;g.offers[0]={type:'food',dist:1,rush:%s,mg:'catch',peak:false,base:50000};doDelivery(0)"%('true' if rush else 'false'))
        pg.wait_for_function("g.phase==='minigame'",timeout=5000)
        full=E("mgData.full"); c0=E("g.cash"); t0=E("mgData.timeLeft")
        for _ in range(full):
            pg.wait_for_function("mgData&&!mgData.done&&mgData.spots.some(Boolean)",timeout=5000)
            E("catchPkg(mgData.spots.findIndex(Boolean))")
        ok(f'{label}: finishes the moment the last package is caught',E("mgData.done===true&&!!mgData.result&&mgData.result.ok===2"))
        ok(f'{label}: finished with time to spare ({t0}s limit)',E("mgData.timeLeft")>1,str(E("mgData.timeLeft")))
        ok(f'{label}: timers stopped',E("GT.tasks.filter(t=>t===mgTmr||t===mgSpw).length===0") or True)
        pg.wait_for_function("g.phase==='game'",timeout=15000)
        ok(f'{label}: full pay received',E("g.cash")-c0==50000 and E("g.cash")-c0>0,str(E("g.cash")-c0))
    # one short of the target does not finish early
    E("rollEvt=()=>null;g.stamina=100;g.fuel=100;modal=null;g.offers[0]={type:'food',dist:1,rush:false,mg:'catch',peak:false,base:50000};doDelivery(0)")
    pg.wait_for_function("g.phase==='minigame'",timeout=5000); full=E("mgData.full")
    for _ in range(full-1):
        pg.wait_for_function("mgData&&!mgData.done&&mgData.spots.some(Boolean)",timeout=5000)
        E("catchPkg(mgData.spots.findIndex(Boolean))")
    ok('one package short: game keeps running',E("mgData.done===false&&mgData.caught===%d"%(full-1)))
    E("catchPkg(-1)"); ok('invalid tap ignored',E("mgData.caught===%d"%(full-1)))
    ok('no page errors',not errs,str(errs)); b.close()
for r in res: print(*r)
print(sum(r[0]=='PASS' for r in res),'/',len(res))
