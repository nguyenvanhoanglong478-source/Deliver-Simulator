import sys
import base64,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
D='data:image/png;base64,'+base64.b64encode(open('src/bike.png','rb').read()).decode()
css=open('src/style.css',encoding='utf8').read()
js=''.join(open(f,encoding='utf8').read()+'\n' for f in ['src/icons.js','src/audio.js','src/profile.js','src/logic.js','src/render.js'])
js=js.replace('__BIKE__',D)
for _k,_f in (('__MUSIC__','src/music.mp3'),('__T1__','src/track1.mp3'),('__T2__','src/track2.mp3'),('__T3__','src/track3.mp3'),('__T4__','src/track4.mp3')):
    js=js.replace(_k,'data:audio/mpeg;base64,'+base64.b64encode(open(_f,'rb').read()).decode())
fonts='https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap'
title='<title>Be The Driver</title>'
body=f'<div id="root"></div>\n<div id="toast"></div>\n<button id="pause-btn" onclick="pauseGame()" aria-label="Tạm dừng" hidden></button>\n<button id="snd-btn" onclick="openSettings()" hidden></button>\n<script>\n{js}</script>\n'
frag=f'{title}\n<link rel="stylesheet" href="{fonts}">\n<style>\n{css}</style>\n{body}'

full=f'<!DOCTYPE html>\n<html lang="vi">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n{title}\n<link rel="stylesheet" href="{fonts}">\n<style>\nhtml{{color-scheme:dark}}\n{css}</style>\n</head>\n<body>\n{body}</body>\n</html>\n'
open('index.html','w',encoding='utf8').write(full)
print('built',len(full)//1024,'KB')
