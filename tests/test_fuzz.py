"""Random-play fuzz: click random buttons, check state stays valid. Run: python3 tests/test_fuzz.py"""
import os,random
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
bad=[];errs=[];n=0
with sync_playwright() as p:
    b=p.chromium.launch()
    for seed in range(6):
        random.seed(seed); pg=b.new_page(viewport={'width':420,'height':800})
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload()
        pg.evaluate("startGame(true)")
        for step in range(300):
            btns=pg.query_selector_all('button:not([disabled])')
            btns=[x for x in btns if x.is_visible()]
            if btns:
                try: random.choice(btns).click(timeout=500,force=True)
                except Exception: pass
            if step%5==0: pg.evaluate("GT&&0")
            pg.wait_for_timeout(random.choice([0,30,150,600]))
            pr=pg.evaluate("[...stateProblems(g),...lifeBad(g)]")
            n+=1
            if pr: bad.append((seed,step,pr)); break
        pg.close()
    b.close()
print('steps',n,'problems',bad[:5],'errors',errs[:5])
