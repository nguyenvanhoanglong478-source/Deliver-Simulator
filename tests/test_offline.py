"""Packaging tests: assets load from files (not base64), fonts bundled, service worker caches the game for offline use.
Run: python3 tests/test_offline.py"""
import os,threading,http.server,socketserver,functools
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),".."))
from playwright.sync_api import sync_playwright
res=[]
def ok(n,c,x=''): res.append(('PASS' if c else 'FAIL',n,x))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
H=functools.partial(Q,directory=ROOT)
srv=socketserver.TCPServer(('127.0.0.1',0),H); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
U=f"http://127.0.0.1:{port}/index.html"
html=open(os.path.join(ROOT,'index.html'),encoding='utf8').read()
ok('index.html is small (no embedded music)',len(html)<800_000,str(len(html)//1024)+' KB')
ok('no base64 audio in index.html','data:audio' not in html)
ok('no Google Fonts link','fonts.googleapis.com' not in html)
for f in ['src/music.mp3','src/track1.mp3','src/fonts/vt323-latin-400-normal.woff2','src/fonts/vt323-vietnamese-400-normal.woff2','src/fonts/press-start-2p-latin-400-normal.woff2','sw.js','manifest.webmanifest','src/icon-192.png','src/icon-512.png']:
    ok('file exists: '+f,os.path.exists(os.path.join(ROOT,f)))
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(); pg=ctx.new_page(); errs=[]; bad=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('response',lambda r:bad.append(r.url) if r.status>=400 else None)
    pg.goto(U); pg.wait_for_timeout(2500)
    ok('local fonts loaded',pg.evaluate("[...document.fonts].filter(f=>f.status==='loaded').length")>=2)
    ok('Vietnamese glyphs use VT323',pg.evaluate("document.fonts.check('20px VT323','Mô phỏng tài xế')"))
    ok('service worker registered',pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!r)"))
    pg.wait_for_function("navigator.serviceWorker.controller||true"); pg.reload(); pg.wait_for_timeout(1500)
    ok('page controlled by the service worker',pg.evaluate("!!navigator.serviceWorker.controller"))
    keys=pg.evaluate("caches.keys().then(async ks=>{const c=await caches.open(ks[0]);return (await c.keys()).map(r=>new URL(r.url).pathname)})")
    ok('shell + fonts precached',any(k.endswith('index.html') or k=='/' for k in keys) and any('vt323-latin' in k for k in keys),str(len(keys)))
    # a new release must show up on the next reload (page is network-first, not stuck on the cached copy)
    idx=os.path.join(ROOT,'index.html'); orig=open(idx,encoding='utf8').read()
    try:
        open(idx,'w',encoding='utf8').write(orig+'<!--NEWRELEASE-->'); pg.reload(); pg.wait_for_timeout(800)
        ok('new index.html is served after one reload',pg.evaluate("fetch('index.html').then(r=>r.text()).then(t=>t.includes('NEWRELEASE'))"))
    finally: open(idx,'w',encoding='utf8').write(orig)
    pg.reload(); pg.wait_for_timeout(800)
    srv.shutdown()   # take the server away: the game must still load from the cache
    pg.reload(); pg.wait_for_timeout(1500)
    ok('loads with the server stopped (offline)',pg.locator('text=BẮT ĐẦU!').count()==1)
    ok('no failed requests',not bad,str(bad[:3])); ok('no page errors',not errs,str(errs))
    b.close()
for r in res: print(*r)
print(sum(r[0]=='PASS' for r in res),'/',len(res))
