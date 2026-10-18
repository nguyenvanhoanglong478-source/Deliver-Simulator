// ===== AUDIO: background music on the start screen + a settings dialog =====
const START_SRC="__MUSIC__";
const TRACKS=[
  {n:'Waiting Time',src:"__T1__"},
  {n:'8-Bit Retro',src:"__T2__"},
  {n:'Game 8-Bit On',src:"__T3__"},
  {n:'I Love My 8-Bit Game Console',src:"__T4__"},
];
const AUD={on:true,vol:.5,track:0,el:null,key:null,fade:null};
try{const a=JSON.parse(localStorage.getItem('btd_audio')||'null');if(a){AUD.on=a.on!==false;AUD.vol=Math.min(1,Math.max(0,Number.isFinite(a.vol)?a.vol:.5));AUD.track=Number.isInteger(a.track)&&a.track>=0&&a.track<TRACKS.length?a.track:0}}catch(e){}
function audSave(){try{localStorage.setItem('btd_audio',JSON.stringify({on:AUD.on,vol:AUD.vol,track:AUD.track}))}catch(e){}}
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
  const show=['start','game','upgrade','profile'].includes(g.phase)&&!DLV;
  b.hidden=!show;
  b.innerHTML=ic(AUD.on&&AUD.vol>0?'sound':'mute',24);
  b.setAttribute('aria-label','Cài đặt âm thanh');
  pauseBtnSync();
}
