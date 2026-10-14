"""Browser test for start-screen music and the sound settings. Run: python3 tests/test_audio.py"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=document-user-activation-required']); pg=b.new_page(viewport={'width':390,'height':800}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(600)
    E=pg.evaluate
    ok('sound button visible on start screen',E("!document.getElementById('snd-btn').hidden"))
    ok('music waits for a first tap (autoplay blocked)',E("AUD.el===null||AUD.el.paused"))
    pg.mouse.click(200,300); pg.wait_for_timeout(1000)
    ok('music plays on the start screen after a tap',E("!AUD.el.paused&&AUD.el.currentTime>0&&!AUD.el.error"))
    pg.click('#snd-btn'); ok('settings dialog opens',pg.locator('#vol-slider').count()==1)
    pg.click('text=BẬT'); pg.wait_for_timeout(900); ok('music off: paused and saved',E("AUD.el.paused&&AUD.on===false")and E("JSON.parse(localStorage.getItem('btd_audio')).on===false"))
    pg.click('text=TẮT'); pg.wait_for_timeout(300); ok('music on again',E("!AUD.el.paused&&AUD.on"))
    E("document.getElementById('vol-slider').value=30;document.getElementById('vol-slider').dispatchEvent(new Event('input'))")
    ok('volume applied live',abs(E("AUD.el.volume")-.3)<.01 and pg.inner_text('#vol-lbl')=='30%')
    pg.click('text=ĐÓNG'); ok('settings closes',E("modal===null"))
    pg.reload(); pg.wait_for_timeout(300); ok('settings persist across reload',E("AUD.on===true&&Math.abs(AUD.vol-.3)<.01"))
    pg.mouse.click(200,300); pg.wait_for_timeout(400)
    E("startGame(true)"); pg.wait_for_timeout(1500)
    ok('music stops when the game starts',E("AUD.el.paused"))
    ok('sound button still available in game',E("!document.getElementById('snd-btn').hidden"))
    E("g.offers[0]={type:'food',dist:1,rush:false,mg:'catch',peak:false,base:50000};doDelivery(0)")
    ok('sound button hidden during mini-game',E("document.getElementById('snd-btn').hidden"))
    E("clearTmrs();mgData=null;g.phase='game';render()")
    pg.click('#snd-btn'); t0=E("g.dayTimeLeft"); pg.wait_for_timeout(2300)
    ok('settings dialog pauses the day clock',E("g.dayTimeLeft")==t0)
    pg.click('text=ĐÓNG')
    E('resetGame()'); pg.wait_for_timeout(400); ok('music resumes on start screen after quitting a run',not E("AUD.el.paused"))
    print('errors',errs or 'none'); b.close()
for r in res: print(*r)
