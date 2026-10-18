"""State validation tests. Run: python3 tests/test_state.py"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]; warns=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:warns.append(m.text) if m.type=='warning' else None)
    pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload(); pg.evaluate("startGame(true)")
    ok('fresh state is valid',pg.evaluate("stateProblems(g)")==[])
    ok('every new offer is valid (3000)',pg.evaluate("(()=>{for(let i=0;i<3000;i++){if(!offerOk(genOffer(i%2==0)))return false}return true})()"))
    for name,patch,field in [('NaN cash',"g.cash=NaN","cash"),('fuel 140',"g.fuel=140","fuel"),('negative savings',"g.savings=-5","savings"),
        ('month 99',"g.month=99","month"),('stars 0',"g.stars=0","stars"),('upgrades array',"g.upgrades=[]","upgrades"),('bad drive',"g.drive=7","drive"),('log not array',"g.log=null","log")]:
        pg.evaluate("startGame(true)"); pg.evaluate(patch)
        ok(f'detects: {name}',field in pg.evaluate("stateProblems(g)"))
        pg.evaluate("repairState(g)"); ok(f'repairs: {name}',pg.evaluate("stateProblems(g)")==[])
    # save() never writes a broken state
    pg.evaluate("startGame(true)"); pg.evaluate("g.fuel=250;g.stamina=-40;g.offers=null;save()")
    sv=pg.evaluate("JSON.parse(localStorage.getItem('btd_v2'))")
    ok('save() writes a repaired state',sv['fuel']==100 and sv['stamina']==0 and len(sv['offers'])>=3)
    ok('a warning was logged',any('repaired state' in w for w in warns))
    ok('no page errors',not errs,str(errs)); b.close()
for r in res: print(*r)
print(sum(r[0]=='PASS' for r in res),'/',len(res))
