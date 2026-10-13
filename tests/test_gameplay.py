"""Browser test (Playwright). Run: python3 tests/test_gameplay.py
Needs: pip install playwright && playwright install chromium"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.reload()
    pg.evaluate("startGame(true)")
    # GPS odds
    f="""(gps)=>{g.upgrades=gps?{gps:true}:{};const N=200000,c={jam:0,cnl:0};for(let i=0;i<N;i++){const e=rollEvt();if(e&&c[e.id]!==undefined)c[e.id]++}return [c.jam/N,c.cnl/N]}"""
    a=pg.evaluate(f,False); w=pg.evaluate(f,True)
    ok('no GPS: jam~5%, cancel~4%',abs(a[0]-.05)<.004 and abs(a[1]-.04)<.004,str(a))
    ok('GPS halves jam and cancel',abs(w[0]-.025)<.003 and abs(w[1]-.02)<.003,str(w))
    pg.evaluate("g.upgrades={}")
    # cancelled order pays nothing
    pg.evaluate("window.__r=rollEvt;rollEvt=()=>EVTS.find(e=>e.id==='cnl')")
    c0=pg.evaluate("g.cash"); pg.evaluate("afterMinigame(100000,C.jobs.food,null)")
    pg.wait_for_function("g.phase==='game'",timeout=9000)
    ok('cancel: no income credited',pg.evaluate("g.cash")==c0 and pg.evaluate("g.earned")==0,f"{c0}->{pg.evaluate('g.cash')}")
    ok('cancel: event modal + log',pg.evaluate("modal&&modal.type==='event'&&g.log[0].m.includes('không có thu nhập')"))
    pg.evaluate("modal=null;rollEvt=window.__r;render()")
    # normal pay
    pg.evaluate("rollEvt=()=>null"); c0=pg.evaluate("g.cash"); pg.evaluate("afterMinigame(100000,C.jobs.food,null)")
    pg.wait_for_function("g.phase==='game'",timeout=9000)
    ok('normal order pays',pg.evaluate("g.cash")==c0+100000)
    pg.evaluate("rollEvt=window.__r")
    # win by deposit
    pg.evaluate("g.savings=99.5e6;g.cash=3e6;render()"); pg.evaluate("doSave(1e6)")
    ok('win by deposit',pg.evaluate("g.phase")=='win')
    t=pg.evaluate("g.dayTimeLeft"); pg.wait_for_timeout(2200)
    ok('win stops day timer',pg.evaluate("g.dayTimeLeft")==t and pg.evaluate("g.phase")=='win')
    ok('win clears save',pg.evaluate("localStorage.getItem('btd_v2')")is None)
    ok('win screen month = current month',pg.evaluate("rEnd(true).includes('>1/24<')"))
    pg.evaluate("resetGame()"); pg.evaluate("startGame(true)")
    # win by interest at day end
    pg.evaluate("g.savings=99.95e6;doEndDay()"); ok('win by interest',pg.evaluate("g.phase")=='win')
    pg.evaluate("resetGame();startGame(true)")
    # month end: bills drawn from savings
    pg.evaluate("g.cash=1e6;g.savings=20e6;triggerMonthEnd()")
    pg.evaluate("confirmMonthEnd()")
    ok('bills covered from savings',pg.evaluate("g.cash")>=0 and pg.evaluate("g.savings")==20e6-(6.5e6-1e6) and pg.evaluate("g.month")==2,str(pg.evaluate("[g.cash,g.savings,g.month]")))
    ok('month rolled over cleanly',pg.evaluate("g.day==1&&g.delivered==0&&g.phase=='game'"))
    # lose: broke
    pg.evaluate("g.cash=0;g.savings=0;triggerMonthEnd();confirmMonthEnd()")
    ok('lose when broke',pg.evaluate("g.phase")=='lose')
    t=pg.evaluate("g.dayTimeLeft"); pg.wait_for_timeout(2200)
    ok('lose stops timer + clears save',pg.evaluate("g.dayTimeLeft")==t and pg.evaluate("localStorage.getItem('btd_v2')")is None)
    pg.evaluate("resetGame();startGame(true)")
    # lose: 24 months elapsed
    pg.evaluate("g.month=24;g.cash=50e6;g.savings=10e6;triggerMonthEnd();confirmMonthEnd()")
    ok('lose after month 24 without target',pg.evaluate("g.phase")=='lose')
    pg.evaluate("resetGame();startGame(true)")
    # repair guards
    pg.evaluate("g.cash=9e6;g.vehicleHp=100;buyUpgrade('fix_f')"); ok('repair refused at 100%',pg.evaluate("g.cash")==9e6)
    pg.evaluate("g.vehicleHp=40;buyUpgrade('fix_s')"); ok('repair works when damaged',pg.evaluate("g.vehicleHp")==70 and pg.evaluate("g.cash")==9e6-5e5)
    pg.evaluate("buyUpgrade('gps');buyUpgrade('gps')"); ok('upgrade not bought twice',pg.evaluate("g.cash")==9e6-5e5-12e5)
    print('errors',errs or 'none'); b.close()
for r in res: print(*r)
