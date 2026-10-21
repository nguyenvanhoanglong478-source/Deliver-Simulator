"""English mode: no Vietnamese text leaks, no page errors. Run: python3 tests/test_lang.py"""
import os,random,re
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
VI=re.compile('[ạảãàáâấầẩẫậăắằẳẵặẹẻẽèéêếềểễệỉĩìíịọỏõòóôốồổỗộơớờởỡợụủũùúưứừửữựỳỷỹýỵđĐ]',re.I)
leaks={};errs=[];steps=0
with sync_playwright() as p:
    b=p.chromium.launch()
    for seed in range(2):
        random.seed(seed); pg=b.new_page(viewport={'width':420,'height':800})
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1');localStorage.setItem('btd_lang','en')"); pg.reload()
        def scan(tag):
            t=pg.evaluate("document.body.innerText")
            for l in t.split('\n'):
                if VI.search(l.replace('đ','')): leaks.setdefault(l.strip()[:100],tag)
        scan('start'); pg.evaluate("startGame(true)")
        for step in range(120):
            btns=[x for x in pg.query_selector_all('button:not([disabled])') if x.is_visible()]
            if btns:
                try: random.choice(btns).click(timeout=400,force=True)
                except Exception: pass
            pg.wait_for_timeout(random.choice([0,30,120,500])); steps+=1
            if step%2==0: scan(f's{seed}:{step}')
            if seed==0 and step%40==0:
                pg.evaluate("window.__x=1")
        # force-open every modal type once
        for js in ["openSettings()","lifeOpen&&lifeOpen()","bjOpen&&bjOpen()","triggerDayEnd&&triggerDayEnd()","triggerMonthEnd&&triggerMonthEnd()"]:
            try: pg.evaluate(js); pg.wait_for_timeout(150); scan(js)
            except Exception: pass
        pg.close()
    b.close()
for l,t in list(leaks.items())[:60]: print('LEAK',t,'|',l)
print('steps',steps,'leaks',len(leaks),'errors',errs[:3])
# language switch keeps the running game; title follows language; blocked mid-order
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); res=[]
    pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload()
    res.append(('default is Vietnamese',pg.evaluate("LANG")=='vi' and pg.title()=='Một ngày làm shipper'))
    pg.evaluate("startGame(true);g.cash=777000;save()")
    with pg.expect_navigation(): pg.evaluate("setLang('en')")
    pg.wait_for_timeout(600)
    res.append(('English keeps the running game',pg.evaluate("[LANG,g.phase,g.cash].join()")=='en,game,777000' and pg.title()=='Shipper Simulator'))
    pg.evaluate("doDelivery(0)"); pg.wait_for_timeout(300); pg.evaluate("setLang('vi')"); pg.wait_for_timeout(300)
    res.append(('switch blocked mid-order',pg.evaluate("LANG")=='en'))
    b.close()
for n,c in res: print('PASS' if c else 'FAIL',n)
