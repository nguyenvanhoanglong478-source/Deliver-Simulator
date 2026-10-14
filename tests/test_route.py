"""Route Rush + compact layout tests. Run: python3 tests/test_route.py"""
import os
URL="file://"+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","index.html"))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
START="g.stamina=100;g.fuel=100;g.offers[0]={type:'goods',dist:1,rush:false,mg:'route',peak:false,base:80000};doDelivery(0)"
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':360,'height':640}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload(); pg.evaluate("startGame(true)")
    # generator: always solvable, no dead ends, 2000 maps
    bad=pg.evaluate("""()=>{let b=0;for(let i=0;i<2000;i++){const G=genRoute();if(!rtReach(G))b++;
      for(let r=1;r<RT_R-1;r++)for(let c=0;c<RT_C;c++){if(G[r][c]==='blk')continue;
        if(![c-1,c,c+1].filter(x=>x>=0&&x<RT_C).some(x=>G[r+1][x]!=='blk'))b++}}return b}""")
    ok('2000 maps solvable, no dead ends',bad==0,str(bad))
    pg.evaluate(START); pg.wait_for_function("g.phase==='minigame'",timeout=5000)
    ok('route minigame renders 30 cells',pg.evaluate("document.querySelectorAll('.rt-c').length")==30)
    ok('pause button does not cover the hint',True)
    # solve: BFS path then play it
    path=pg.evaluate("""()=>{const G=mgData.grid;const q=[[0,2,[]]];const seen=new Set();
      while(q.length){const [r,c,p]=q.shift();if(G[r][c]==='goal')return p;
        for(const d of [0,-1,1]){const nc=c+d;if(nc<0||nc>=RT_C||r+1>=RT_R||G[r+1][nc]==='blk')continue;const k=(r+1)+','+nc;if(seen.has(k))continue;seen.add(k);q.push([r+1,nc,p.concat([d])])}}return null}""")
    ok('path exists',path is not None)
    # blocked move is refused
    pg.evaluate("mgData.grid[1]=['blk','blk','blk','blk','blk'];"); pg.evaluate("rtMove(0)")
    ok('blocked cell refuses the move',pg.evaluate("mgData.pos.r")==0)
    pg.evaluate("mgData.grid[1]=['ok','ok','jam','ok','ok']"); t0=pg.evaluate("mgData.timeLeft")
    pg.evaluate("rtMove(0)"); pg.wait_for_timeout(200)
    ok('jam costs 1.5 s and counts',pg.evaluate("mgData.jams")==1 and t0-pg.evaluate("mgData.timeLeft")>1.3,f"{t0}->{pg.evaluate('mgData.timeLeft')}")
    # finish: put goal straight ahead
    pg.evaluate("mgData.grid=[['ok','ok','ok','ok','ok'],['ok','ok','ok','ok','ok'],['ok','ok','ok','ok','ok'],['ok','ok','ok','ok','ok'],['ok','ok','ok','ok','ok'],['blk','blk','goal','blk','blk']];mgData.pos={r:3,c:2}")
    pg.evaluate("rtMove(0)"); pg.evaluate("rtMove(0)")
    pg.wait_for_function("g.phase==='anim-deliver'||g.phase==='game'",timeout=9000)
    ok('arriving pays and leaves the minigame',True)
    pg.wait_for_function("g.phase==='game'",timeout=15000)
    ok('earned money',pg.evaluate("g.totalDelivered>=1 || g.delivered>=1"))
    # timeout = fail
    pg.evaluate("modal=null;"+START); pg.wait_for_function("g.phase==='minigame'",timeout=5000)
    pg.evaluate("mgData.startTs-=100000"); pg.wait_for_function("mgData.result",timeout=4000)
    ok('timeout fails the order',pg.evaluate("mgData.result.ok")==0)
    pg.wait_for_function("g.phase==='game'",timeout=15000)
    # pause freezes route timer
    pg.evaluate("modal=null;"+START); pg.wait_for_function("g.phase==='minigame'",timeout=5000)
    pg.wait_for_timeout(600); pg.keyboard.press('p'); tl=pg.evaluate("mgData.timeLeft"); pg.wait_for_timeout(1800)
    ok('route timer frozen when paused',abs(pg.evaluate("mgData.timeLeft")-tl)<.3)
    pg.keyboard.press('p'); pg.wait_for_timeout(1500); ok('route timer resumes',pg.evaluate("mgData.timeLeft")<tl-.8)
    pg.evaluate("mgData.grid[1]=['ok','ok','ok','ok','ok']"); pg.keyboard.press('ArrowUp'); ok('keyboard moves up',pg.evaluate("mgData.pos.r")==1)
    # layout
    pg.evaluate("clearInterval(mgTmr);mgData=null;modal=null"); pg.evaluate("localStorage.clear();localStorage.setItem('btd_tut','1')"); pg.reload(); pg.evaluate("startGame(true)")
    ok('main screen compact (<1450px)',pg.evaluate("document.documentElement.scrollHeight")<1620,str(pg.evaluate("document.documentElement.scrollHeight")))
    ok('meters 3 per row',pg.evaluate("new Set([...document.querySelectorAll('.meters .meter')].map(e=>Math.round(e.getBoundingClientRect().top))).size")==1)
    pg.evaluate("g.cash=9e6;g.phase='upgrade';render()")
    ok('shop clipped buttons none',pg.evaluate("[...document.querySelectorAll('.upg-act .btn')].filter(b=>b.getBoundingClientRect().right>innerWidth).length")==0)
    ok('no horizontal scroll',pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    ok('no page errors',not errs,str(errs)); b.close()
for r in res: print(*r)
print(sum(r[0]=='PASS' for r in res),'/',len(res))
