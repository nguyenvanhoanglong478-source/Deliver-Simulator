// ===== AUDIO: background music on the start screen + a settings dialog =====
const START_SRC="__MUSIC__";
const TRACKS=[
  {n:'Waiting Time',src:"__T1__"},
  {n:'8-Bit Retro',src:"__T2__"},
  {n:'Game 8-Bit On',src:"__T3__"},
  {n:'I Love My 8-Bit Game Console',src:"__T4__"},
];
const AUD={on:true,vol:.5,track:0,el:null,key:null,fade:null,sfx:true};
try{const a=JSON.parse(localStorage.getItem('btd_audio')||'null');if(a){AUD.on=a.on!==false;AUD.vol=Math.min(1,Math.max(0,Number.isFinite(a.vol)?a.vol:.5));AUD.track=Number.isInteger(a.track)&&a.track>=0&&a.track<TRACKS.length?a.track:0;AUD.sfx=a.sfx!==false}}catch(e){}
function audSave(){try{localStorage.setItem('btd_audio',JSON.stringify({on:AUD.on,vol:AUD.vol,track:AUD.track,sfx:AUD.sfx}))}catch(e){}}
// What should be playing for the current screen: one fixed loop on the start screen, the playlist during a run, nothing after it ends.
function musicTarget(){
  if(!AUD.on||document.visibilityState==='hidden')return null;
  const p=g.phase;
  if(p==='start')return{key:'start',src:START_SRC,loop:true};
  if(p==='win'||p==='lose')return null;
  return{key:'t'+AUD.track,src:TRACKS[AUD.track].src,loop:false};
}
function fadeOut(){
  const a=AUD.el;if(!a||AUD.fade)return;
  AUD.fade=setInterval(()=>{
    a.volume=Math.max(0,a.volume-.1);
    if(a.volume<=.01){clearInterval(AUD.fade);AUD.fade=null;a.pause();AUD.el=null;AUD.key=null;musicSync()}
  },50);
}
// Idempotent: make the audio element match the screen. Browsers block sound until the first tap, so a refused play() is retried on the next gesture.
function musicSync(){
  const t=musicTarget();
  if(AUD.fade){if(t&&t.key===AUD.key){clearInterval(AUD.fade);AUD.fade=null;AUD.el.volume=AUD.vol}else return}
  if(!t){
    if(AUD.el&&!AUD.el.paused){if(document.visibilityState==='hidden')AUD.el.pause();else fadeOut()}
    return;
  }
  if(AUD.el&&AUD.key!==t.key){if(!AUD.el.paused){fadeOut();return}AUD.el=null;AUD.key=null}
  if(!AUD.el){const a=new Audio(t.src);a.loop=t.loop;a.preload='auto';a.onended=musicEnded;AUD.el=a;AUD.key=t.key}
  AUD.el.volume=AUD.vol;
  if(AUD.el.paused){const p=AUD.el.play();if(p&&p.catch)p.catch(()=>{})}
}
function musicEnded(){if(AUD.key&&AUD.key[0]==='t')skipTrack(1)}   // playlist: the next song starts by itself, and it wraps around
['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,()=>{if(musicTarget()&&(!AUD.el||AUD.el.paused))musicSync()},{passive:true}));
document.addEventListener('visibilitychange',musicSync);

// ---- sound effects: tiny synthesized beeps (no files), follow the volume slider and their own switch
let _ac=null;
const SFX={
  coin:[[988,.07,'square'],[1319,.16,'square',.07]],
  buy:[[523,.07,'square'],[659,.07,'square',.07],[784,.14,'square',.14]],
  bad:[[196,.14,'sawtooth'],[147,.22,'sawtooth',.12]],
  card:[[1800,.03,'triangle'],[1200,.04,'triangle',.03]],
  win:[[523,.1,'square'],[659,.1,'square',.1],[784,.1,'square',.2],[1047,.3,'square',.3]],
  lose:[[392,.15,'triangle'],[330,.15,'triangle',.15],[262,.4,'triangle',.3]],
  push:[[440,.08,'triangle'],[440,.08,'triangle',.1]],
  day:[[659,.1,'triangle'],[523,.1,'triangle',.1],[392,.25,'triangle',.2]],
  tick:[[660,.025,'square']]
};
function sfx(n){
  if(!AUD.sfx||AUD.vol<=0||!SFX[n])return;
  try{
    _ac=_ac||new (window.AudioContext||window.webkitAudioContext)();
    if(_ac.state==='suspended')_ac.resume();
    const t0=_ac.currentTime,base=n==='tick'?.05:.16;
    SFX[n].forEach(([f,d,w,at=0])=>{
      const o=_ac.createOscillator(),v=_ac.createGain();
      o.type=w;o.frequency.value=f;
      v.gain.setValueAtTime(base*AUD.vol,t0+at);v.gain.exponentialRampToValueAtTime(.0001,t0+at+d);
      o.connect(v);v.connect(_ac.destination);o.start(t0+at);o.stop(t0+at+d+.02);
    });
  }catch(e){}
}
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&!b.disabled)sfx('tick')},{passive:true});
function toggleSfx(){AUD.sfx=!AUD.sfx;audSave();if(AUD.sfx)sfx('coin');render()}

function openSettings(){if(modal&&modal.type!=='settings'&&modal.type!=='pause')return;const fp=modal&&modal.type==='pause';modal={type:'settings',from:fp?'pause':null};render()}
function closeSettings(){if(modal&&modal.type==='settings'){modal=modal.from==='pause'?{type:'pause'}:null;render()}}
function toggleMusic(){AUD.on=!AUD.on;audSave();musicSync();render()}
function skipTrack(d){
  AUD.track=(AUD.track+d+TRACKS.length)%TRACKS.length;audSave();
  if(AUD.el&&AUD.key&&AUD.key[0]==='t'){clearInterval(AUD.fade);AUD.fade=null;AUD.el.onended=null;AUD.el.pause();AUD.el=null;AUD.key=null}
  musicSync();
  if(modal&&modal.type==='settings')render();
}
function setVolume(v){
  AUD.vol=Math.min(1,Math.max(0,(parseInt(v)||0)/100));audSave();
  if(AUD.el&&!AUD.fade)AUD.el.volume=AUD.vol;
  const l=document.getElementById('vol-lbl');if(l)l.textContent=Math.round(AUD.vol*100)+'%';
}
// the floating button is outside #root, so it survives re-renders; shown only on calm screens
function sndBtnSync(){
  const b=document.getElementById('snd-btn');if(!b||!g)return;
  const show=true;   // always visible
  b.hidden=!show;
  b.innerHTML=ic(AUD.on&&AUD.vol>0?'sound':'mute',24);
  b.setAttribute('aria-label','Cài đặt âm thanh');
  pauseBtnSync();
}
