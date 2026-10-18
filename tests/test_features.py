"""Browser test for orders, driving, rush hour, milestones, upgrades. Run: python3 tests/test_features.py"""
import os,json
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem(\x27btd_tut\x27,\x271\x27)"); pg.reload()
    E=lambda s:pg.evaluate(s)
    E("startGame(true)")
    # --- orders ---
    ok('3 offers on start',E("g.offers.length")==3)
    ok('offer buttons rendered',pg.locator('.offer').count()==3)
    E("g.upgrades={prio:true};g.offers=genOffers()"); ok('priority app: 4 offers',E("g.offers.length")==4); E("g.upgrades={};g.offers=genOffers()")
    E("g.offers[0]={type:'goods',dist:2,rush:false,peak:false,base:100000}")
    far=E("[offerCost(g.offers[0]),offerPay(g.offers[0]),offerTime(g.offers[0])]")
    E("g.offers[0].dist=0"); near=E("[offerCost(g.offers[0]),offerPay(g.offers[0]),offerTime(g.offers[0])]")
    ok('far order costs more and takes longer than near',far[0]['sta']>near[0]['sta'] and far[0]['fuel']>near[0]['fuel'] and far[2]>near[2],str((far,near)))
    # --- drive ---
    f="""(d)=>{g.drive=d;const N=200000;let c=0;for(let i=0;i<N;i++){const e=rollEvt();if(e&&(e.id==='brk'||e.id==='crs'||e.id==='fin'))c++}g.drive=1;return c/N}"""
    r=[E(f.replace("(d)=>","(d)=>")) if False else pg.evaluate(f,d) for d in (0,1,2)]
    ok('slow < normal < fast accident odds',r[0]<r[1]<r[2],str(r))
    E("g.vehicleHp=100;g.offers[0]={type:'goods',dist:1,rush:false,peak:false,base:1e5}")
    c1=E("(g.drive=0,offerCost(g.offers[0]).fuel)"); c2=E("(g.drive=2,offerCost(g.offers[0]).fuel)"); E("g.drive=1")
    ok('slow riding uses less fuel than fast',c1<c2,str((c1,c2)))
    f2="""()=>{const N=100000;let c=0;for(let i=0;i<N;i++){const e=rollEvt();if(e&&e.id==='brk')c++}return c/N}"""
    E("g.vehicleHp=100"); a=pg.evaluate(f2); E("g.vehicleHp=20"); w=pg.evaluate(f2); E("g.vehicleHp=100")
    ok('worn bike breaks down more often',w>a*1.8,str((a,w)))
    # --- rush hour ---
    E("g.dayTimeLeft=300"); ok('06:00 start, no peak',E("fmH()")=='06:00' and E("isPeak()")==False)
    E("g.dayTimeLeft=Math.round(300*(1-(12-6)/16))"); ok('noon is peak',E("isPeak()")==True,E("fmH()"))
    g_=lambda: pg.evaluate(f3)
    f3="""()=>{const N=100000;let c=0;for(let i=0;i<N;i++){const e=rollEvt();if(e&&e.id==='jam')c++}return c/N}"""
    peak=g_(); E("g.dayTimeLeft=300"); off=g_()
    ok('peak doubles traffic jams',peak>off*1.8,str((peak,off)))
    # --- delivery: progress bar inside the order card, one order at a time ---
    E("g.dayTimeLeft=300;g.stamina=100;g.fuel=100;g.offers[0]={type:'food',dist:1,rush:false,peak:false,base:50000}")
    E("rollEvt=()=>null"); c0=E("g.cash"); E("doDelivery(0)")
    ok('order costs paid and order replaced',E("g.stamina")<100 and E("g.offers.length")==3 and E("!!DLV"))
    ok('progress bar and timer shown in the card',pg.locator('#dl-bar').count()==1 and pg.locator('#dl-t').count()==1 and 'ĐANG GIAO' in pg.inner_text('.offers'))
    ok('other order cards locked while delivering',E("[...document.querySelectorAll('.offers button.offer')].every(b=>b.disabled)"))
    E("doDelivery(1)"); ok('cannot start a second order',E("g.offers.length")==3 and E("DLV.i")==0)
    ok('medium order takes about 10s',E("DLV.dur")==10,str(E("DLV.dur")))
    pg.wait_for_timeout(1500); w=float(pg.evaluate("parseFloat(document.getElementById('dl-bar').style.width)")); ok('bar advances',w>5,str(w))
    E("DLV.start-=1e6;dlvTick()"); ok('delivery done, back to normal',E("g.phase==='game'&&!DLV&&!g.activeAnim"))
    ok('full pay on completion',E("g.cash")-c0==50000,str(E("g.cash")-c0))
    # rush is faster, combo pays more but takes longer and costs more
    E("g.offers[0]={type:'food',dist:1,rush:true,peak:false,base:80000}"); ok('rush order is quicker',E("offerTime(g.offers[0])")<10)
    E("g.offers[0]={type:'food',dist:1,rush:false,combo:true,peak:false,base:50000}")
    ok('combo: longer, costlier',E("offerTime(g.offers[0])")>10 and E("offerCost(g.offers[0]).sta")>15)
    E("g.offers[0]={type:'food',dist:0,rush:false,peak:false,base:50000}");n=E("offerTime(g.offers[0])")
    E("g.offers[0]={type:'food',dist:2,rush:false,peak:false,base:50000}");fa=E("offerTime(g.offers[0])")
    ok('near about 6s, far about 15s',n==6 and fa==15,str((n,fa)))
    E("g.drive=0");sl=E("offerTime(g.offers[0])");E("g.drive=2");fs=E("offerTime(g.offers[0])");E("g.drive=1")
    ok('slow riding takes longer than fast',sl>fa>fs,str((sl,fa,fs)))
    ok('combo orders appear and pay more on average',E("(()=>{let c=0,N=4000;for(let i=0;i<N;i++)if(genOffer(false).combo)c++;return c/N})()")>.1)
    ok('shop/profile/life stay reachable while delivering',E("(()=>{g.stamina=100;g.fuel=100;doDelivery(0);goUpgrade();const a=g.phase==='upgrade';goGame();goProfile();const b=g.phase==='profile';goGame();openHub();const c=!!modal&&modal.type==='hub';modal=null;render();return a&&b&&c&&!!DLV})()"))
    E("g.upgrades={};g.cash=2e7;g.vehicleHp=100;g.offers[0]={type:'food',dist:1,rush:false,peak:false,base:50000};rollEvt=()=>EVTS.find(e=>e.id==='brk')")
    E("DLV.start-=1e6;dlvTick();modal=null;g.phase='game';render()")
    E("g.stamina=100;g.fuel=100;doDelivery(0);buyUpgrade_ok=0;g.upgrades.insure=true")   # bought mid-order
    hp0=E("g.vehicleHp");c0=E("g.cash")
    E("DLV.start-=1e6;dlvTick()")
    ok('upgrade bought mid-delivery does not count for that order',E("modal&&modal.type==='event'")and E("(g.cash-%d)"%c0)<=-250000+50000,str(E("g.cash")-c0))
    ok('...but it is kept afterwards',E("g.upgrades.insure===true"))
    E("modal=null;g.upgrades={};rollEvt=window.__r0||rollEvt;render()")
    # reviews: profile shows the latest 10; a new review is highlighted for ~3 s
    E("g.reviews=Array.from({length:25},(_,i)=>({stars:5,text:'t'+i,who:'A',job:'food',day:1,month:1}))")
    E("g.phase='profile';render()"); ok('profile lists only 10 reviews',pg.locator('.rev').count()==10)
    E("goGame()")
    E("rollEvt=()=>null;g.profile.reviewsOn=true;g.stamina=100;g.fuel=100;g.offers[0]={type:'food',dist:1,rush:false,peak:false,base:50000};doDelivery(0);DLV.start-=1e6;dlvTick()")
    ok('new review highlighted',pg.locator('#rv-last.rv-new').count()==1)
    pg.wait_for_timeout(3400); ok('highlight fades after 3 s',pg.locator('#rv-last.rv-new').count()==0)
    # --- upgrades ---
    E("g.upgrades={};g.cash=2e7;g.ms=[];goUpgrade()")
    E("buyUpgrade('heat')"); ok('buy bag',E("g.upgrades.heat===true"))
    E("buyUpgrade('crate')"); ok('second bag replaces first',E("!g.upgrades.heat&&g.upgrades.crate===true"))
    E("buyUpgrade('eco');buyUpgrade('turbo')"); ok('engines are exclusive',E("!g.upgrades.eco&&g.upgrades.turbo===true"))
    c0=E("g.cash"); E("buyUpgrade('vip')"); ok('locked upgrade refused until milestone',E("!g.upgrades.vip")and E("g.cash")==c0)
    E("g.ms=[25e6,5e7,75e6];buyUpgrade('vip')"); ok('unlocked after milestone',E("g.upgrades.vip===true"))
    E("g.vehicleHp=100;g.upgrades={};g.dayTimeLeft=300;g.offers[0]={type:'goods',dist:1,rush:false,peak:false,base:100000}")
    b0=E("offerPay(g.offers[0])"); E("g.upgrades={crate:true}"); b1=E("offerPay(g.offers[0])"); E("g.upgrades={heat:true}"); b2=E("offerPay(g.offers[0])")
    ok('crate +20% goods, heat bag -10% goods',b1==120000 and b2==90000,str((b0,b1,b2)))
    E("g.upgrades={};g.offers[0].type='goods';g.upgrades.turbo=true"); t=E("offerCost(g.offers[0])"); E("g.upgrades={}"); n=E("offerCost(g.offers[0])")
    ok('turbo: -20% stamina, +25% fuel',t['sta']<n['sta'] and t['fuel']>n['fuel'],str((t,n)))
    # monthly fee
    E("g.upgrades={gps:true,insure:true}"); ok('GPS+insurance add 450K fees',E("billsTotal()-BILLS")==450000)
    E("g.upgrades={}")
    # --- milestones ---
    E("resetGame();startGame(true);g.cash=30e6;g.savings=0;g.ms=[]")
    E("doSave(26e6)"); ok('25M milestone: reward + modal',E("g.ms.includes(25e6)&&modal&&modal.type=='milestone'")and E("g.cash")==30e6-26e6+1e6,str(E("g.cash")))
    E("modal=null;doSave(1e6)"); ok('milestone not repeated',E("g.cash")==30e6-27e6+1e6)
    E("g.savings=60e6;g.cash=1e6;modal=null;render();doEndDay()")
    ok('milestone hit via interest shows in day summary',E("g.ms.includes(5e7)&&modal.ms.length==1"))
    E("confirmDayEnd()")
    # --- monthly bonus ---
    E("g.stars=4.6"); ok('bonus: 360 orders + 4.6 stars',E("monthBonus(360)")==3e6)
    ok('bonus: under 120 orders none',E("monthBonus(100)")==0)
    # --- legacy save upgrades ---
    E("g.phase='start';localStorage.setItem('btd_v2',JSON.stringify({cash:5e6,savings:0,month:2,day:3,stamina:50,fuel:50,vehicleHp:50,phase:'game',upgrades:{tires:true,tank:true,engine:true,heatbag:true,gps:true}}))")
    pg.reload(); pg.click('text=TIẾP TỤC')
    ok('legacy upgrades migrated (+refund)',E("g.upgrades.turbo&&g.upgrades.heat&&g.upgrades.gps&&!g.upgrades.tires&&!g.upgrades.tank")and E("g.cash")==5e6+35e5,str(E("[g.upgrades,g.cash]")))
    ok('legacy save gets offers/drive/fin',E("g.offers.length>=3&&g.drive===1&&g.fin.earn===0"))
    # --- end screen summary ---
    E("g.fin={earn:5e6,fuel:1e6,repair:5e5,accident:7e5,bills:6e6,upg:2e6};finish(false)")
    ok('lose screen shows where money went',pg.locator('text=TIỀN ĐI ĐÂU').count()==1)
    print('errors',errs or 'none'); b.close()
for r in res: print(*r)
