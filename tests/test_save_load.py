"""Browser test (Playwright). Run: python3 tests/test_save_load.py
Needs: pip install playwright && playwright install chromium"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
import json
res=[];errs=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(); pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)))
    U=URL
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload()
    def cont(): 
        pg.reload(); pg.click('text=TIẾP TỤC'); 
    pg.evaluate("startGame(true)")
    # 1 upgrade then reload
    pg.evaluate("g.cash=9e6;goUpgrade();buyUpgrade('tank')")
    ok('save taken while in shop',json.loads(pg.evaluate("localStorage.getItem('btd_v2')"))['phase']=='upgrade')
    cont(); ok('continue after upgrade keeps cash/upgrade',pg.evaluate("g.cash==9e6-2e6&&g.upgrades.tank===true&&g.phase=='game'"))
    # 2 profile
    pg.evaluate("goProfile()"); pg.fill('#prof-name','Marcus'); pg.evaluate("toggleHobby('game')")
    cont(); ok('continue after editing profile keeps name+hobby',pg.evaluate("g.profile.name=='Marcus'&&g.profile.hobbies[0]=='game'&&g.cash==7e6"))
    # 3 mid-day clock
    pg.evaluate("g.dayTimeLeft=92;"); pg.wait_for_timeout(2300)
    saved=json.loads(pg.evaluate("localStorage.getItem('btd_v2')"))['dayTimeLeft']
    ok('mid-day periodic save',saved==90,str(saved))
    cont(); ok('clock resumes from saved time',pg.evaluate("g.dayTimeLeft")<=90 and pg.evaluate("g.dayTimeLeft")>=85)
    # 4 sleeping
    pg.evaluate("g.stamina=20;render();doSleep()"); pg.wait_for_timeout(2300)
    pg.evaluate("window.dispatchEvent(new Event('pagehide'))")
    sv=json.loads(pg.evaluate("localStorage.getItem('btd_v2')")); ok('sleep progress saved',sv['stamina']>=24 and sv['phase']=='anim-sleep',str(sv['stamina']))
    cont(); ok('reload mid-sleep resumes on main screen',pg.evaluate("g.phase=='game'&&g.activeAnim===null&&g.stamina>=24"))
    # 5 mid-delivery must not persist half-state
    pg.evaluate("g.stamina=100;g.fuel=100;save()")
    pg.evaluate("doDelivery('goods')"); pg.evaluate("window.dispatchEvent(new Event('pagehide'))")
    sv=json.loads(pg.evaluate("localStorage.getItem('btd_v2')")); ok('mid-delivery state not written',sv['stamina']==100 and sv['fuel']==100)
    pg.evaluate("clearTmrs();mgData=null;g.phase='game';g.stamina=100;g.fuel=100;render()")
    # 6 pending day end must not persist applied interest
    pg.evaluate("g.savings=2e6;save();doEndDay()"); pg.evaluate("window.dispatchEvent(new Event('pagehide'))")
    sv=json.loads(pg.evaluate("localStorage.getItem('btd_v2')")); ok('pending day-end does not persist interest',sv['savings']==2e6,str(sv['savings']))
    pg.evaluate("confirmDayEnd()"); sv=json.loads(pg.evaluate("localStorage.getItem('btd_v2')")); ok('confirming day end saves next day',sv['day']==2 and sv['savings']==2e6+2000)
    # 7 refuel modal open: saved state has not charged money
    pg.evaluate("g.fuel=30;save();doRefuel()");
    pg.evaluate("document.getElementById('rf-slider').value=80;document.getElementById('rf-slider').dispatchEvent(new Event('input'));rfConfirm()")
    pg.evaluate("window.dispatchEvent(new Event('pagehide'))")
    sv=json.loads(pg.evaluate("localStorage.getItem('btd_v2')")); ok('mid-refuel: money not charged in save',sv['fuel']==30 and sv['cash']==pg.evaluate("g.cash")+75000,str((sv['fuel'],sv['cash'])))
    pg.wait_for_function("g.phase==='game'",timeout=6000)
    sv=json.loads(pg.evaluate("localStorage.getItem('btd_v2')")); ok('refuel finished: fuel+cash saved',sv['fuel']==80 and sv['cash']==pg.evaluate("g.cash"))
    # 8 legacy / bad saves (set phase=start first so the page's own pagehide save cannot overwrite the fixture)
    pg.evaluate("g.phase='start';localStorage.setItem('btd_v2','{broken')"); pg.reload()
    ok('corrupt save: no crash, no Continue button',pg.locator('text=TIẾP TỤC').count()==0 and pg.locator('text=BẮT ĐẦU!').count()==1)
    pg.click('text=BẮT ĐẦU!'); ok('can still start new game after corrupt save',pg.evaluate("g.phase=='game'"))
    pg.evaluate("g.phase='start';localStorage.setItem('btd_v2',JSON.stringify({cash:'x',phase:'game'}))"); pg.reload()
    ok('invalid fields are ignored',pg.locator('text=TIẾP TỤC').count()==0)
    pg.evaluate("g.phase='start';localStorage.setItem('btd_v2',JSON.stringify({cash:5e6,savings:0,month:2,day:3,stamina:180,fuel:500,vehicleHp:-5,dayTimeLeft:0,phase:'upgrade',upgrades:null,log:null,stars:4.2,delivered:3,totalDelivered:9}))"); pg.reload()
    pg.click('text=TIẾP TỤC'); ok('old-style save (upgrade phase, out-of-range values) is repaired',pg.evaluate("g.phase=='game'&&g.stamina==100&&g.fuel==100&&g.vehicleHp==0&&g.dayTimeLeft>=1&&Array.isArray(g.log)&&typeof g.upgrades=='object'"))
    pg.evaluate("g.phase='start';localStorage.setItem('btd_v2',JSON.stringify({cash:5e6,savings:0,month:2,day:3,stamina:50,fuel:50,vehicleHp:50,phase:'win'}))"); pg.reload()
    ok('ended-game save offers no Continue',pg.locator('text=TIẾP TỤC').count()==0)
    # 9 new game overwrites old save immediately
    pg.evaluate("g.phase='start';localStorage.setItem('btd_v2',JSON.stringify({cash:5e6,savings:7e6,month:9,day:3,stamina:50,fuel:50,vehicleHp:50,phase:'game'}))"); pg.reload()
    pg.click('text=BẮT ĐẦU MỚI'); sv=json.loads(pg.evaluate("localStorage.getItem('btd_v2')")); ok('new game replaces the old save at once',sv['month']==1 and sv['savings']==0 and sv['fuel']==100)
    # 10 storage failure
    pg.evaluate("Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})"); pg.evaluate("g.cash+=1;save();save()")
    ok('storage failure: warning toast, no crash',pg.inner_text('#toast').startswith('KHÔNG LƯU')); 
    print('errors',errs or 'none'); b.close()
for r in res: print(*r)
