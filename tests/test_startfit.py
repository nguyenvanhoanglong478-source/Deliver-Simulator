"""Start screen must fit the window without scrolling. Run: python3 tests/test_startfit.py"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
SIZES=[(1280,587),(1366,650),(1920,880),(1920,1080),(1024,768),(1280,720),(390,844),(390,700),(360,560),(412,915),(844,390),(740,360),(768,1024)]
with sync_playwright() as p:
    b=p.chromium.launch()
    for save in (False,True):
        for w,h in SIZES:
            pg=b.new_page(viewport={'width':w,'height':h}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
            pg.goto(URL); pg.evaluate("localStorage.clear()")
            if save: pg.evaluate("localStorage.setItem('btd_tut','1');startGame(true);g.profile.name='Marcus';save()")
            pg.reload(); pg.wait_for_timeout(120)
            r=pg.evaluate("[document.documentElement.scrollHeight,innerHeight,document.documentElement.scrollWidth,innerWidth,Math.round(document.querySelector('.start-main').getBoundingClientRect().bottom)]")
            ok(f"{'saved' if save else 'new'} {w}x{h}: fits without scrolling, button visible",r[0]<=r[1]+1 and r[2]<=r[3] and r[4]<=r[1],str(r))
            ok(f"{w}x{h}: no page errors",not errs); pg.close()
    b.close()
for r in res: print(*r)
print(sum(r[0]=='PASS' for r in res),'/',len(res))
