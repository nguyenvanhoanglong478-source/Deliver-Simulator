"""UX tests: tutorial, end-day confirm, tab-hidden pause, mobile shop layout. Run: python3 tests/test_ux.py"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':360,'height':640}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.reload()
    pg.click("text=BẮT ĐẦU!")
    ok('tutorial opens on first start',pg.evaluate("modal&&modal.type==='tut'"))
    t=pg.evaluate("g.dayTimeLeft"); pg.wait_for_timeout(1500); ok('clock frozen during tutorial',pg.evaluate("g.dayTimeLeft")==t)
    for _ in range(4): pg.click("text=TIẾP ▶")
    pg.click("text=XONG"); ok('tutorial closes and is remembered',pg.evaluate("modal===null&&localStorage.getItem('btd_tut')==='1'"))
    pg.reload(); pg.click("text=TIẾP TỤC"); ok('no tutorial on later starts',pg.evaluate("modal===null"))
    pg.keyboard.press('p'); pg.click("text=HƯỚNG DẪN"); ok('tutorial reachable from pause',pg.evaluate("modal.type==='tut'"))
    pg.click("text=BỎ QUA"); ok('back to pause',pg.evaluate("modal.type==='pause'")); pg.click("text=TIẾP TỤC")
    # end-day confirm
    pg.click("text=KẾT THÚC NGÀY"); ok('early end-day asks first',pg.evaluate("modal.type==='confirmEnd'&&g.day===1"))
    pg.click("text=Ở LẠI"); ok('stay keeps the day',pg.evaluate("modal===null&&g.day===1"))
    pg.evaluate("g.dayTimeLeft=40"); pg.click("text=KẾT THÚC NGÀY"); ok('late end-day needs no confirm',pg.evaluate("modal&&modal.type==='dayEnd'"))
    # clock follows real time
    pg.evaluate("modal=null;startDayTimer();g.dayTimeLeft=200;render()"); pg.wait_for_timeout(3300)
    d=200-pg.evaluate("g.dayTimeLeft"); ok('clock ~1 per real second',2<=d<=4,str(d))
    # hidden tab pauses
    pg.evaluate("Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))")
    ok('hidden tab pauses',pg.evaluate("modal&&modal.type==='pause'"))
    pg.evaluate("Object.defineProperty(document,'hidden',{value:false,configurable:true});modal=null;render()")
    # shop layout on mobile: no clipped button
    pg.evaluate("g.cash=9e6;g.phase='upgrade';render()")
    bad=pg.evaluate("[...document.querySelectorAll('.upg-act .btn')].filter(b=>b.scrollWidth>b.clientWidth+1||b.getBoundingClientRect().right>innerWidth).length")
    ok('shop buttons not clipped at 360px',bad==0,str(bad))
    ok('no horizontal scroll',pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    pg.evaluate("g.phase='game';render()")
    ok('money fits on one line',pg.evaluate("[...document.querySelectorAll('.stat .v')].every(e=>e.scrollWidth<=e.clientWidth+1)"))
    ok('no page errors',not errs,str(errs)); b.close()
for r in res: print(*r)
print(sum(r[0]=='PASS' for r in res),'/',len(res))
