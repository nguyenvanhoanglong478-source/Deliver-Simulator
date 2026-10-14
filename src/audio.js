// ===== AUDIO: background music on the start screen + a settings dialog =====
const MUSIC_SRC="__MUSIC__";
const AUD={on:true,vol:.5,el:null,fade:null};
try{const a=JSON.parse(localStorage.getItem('btd_audio')||'null');if(a){AUD.on=a.on!==false;AUD.vol=Math.min(1,Math.max(0,Number.isFinite(a.vol)?a.vol:.5))}}catch(e){}
function audSave(){try{localStorage.setItem('btd_audio',JSON.stringify({on:AUD.on,vol:AUD.vol}))}catch(e){}}
function audEl(){
  if(!AUD.el){const a=new Audio(MUSIC_SRC);a.loop=true;a.preload='auto';a.volume=AUD.vol;AUD.el=a}
  return AUD.el;
}
function musicWanted(){return AUD.on&&g.phase==='start'&&document.visibilityState!=='hidden'}
// Idempotent: start/stop the track so it matches the current screen. Browsers block sound until the first tap, so a refused play() is retried on the next gesture.
function musicSync(){
  const want=musicWanted();
  if(want){
    clearInterval(AUD.fade);AUD.fade=null;
    const a=audEl();a.volume=AUD.vol;
    if(a.paused){const p=a.play();if(p&&p.catch)p.catch(()=>{})}
  }else if(AUD.el&&!AUD.el.paused&&!AUD.fade){
    const a=AUD.el;
    if(document.visibilityState==='hidden'){a.pause();return}
    AUD.fade=setInterval(()=>{
      a.volume=Math.max(0,a.volume-.08);
      if(a.volume<=.01){clearInterval(AUD.fade);AUD.fade=null;a.pause();a.volume=AUD.vol}
    },60);
  }
}
['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,()=>{if(musicWanted()&&(!AUD.el||AUD.el.paused))musicSync()},{passive:true}));
document.addEventListener('visibilitychange',musicSync);

function openSettings(){if(modal&&modal.type!=='settings')return;modal={type:'settings'};render()}
function closeSettings(){if(modal&&modal.type==='settings'){modal=null;render()}}
function toggleMusic(){AUD.on=!AUD.on;audSave();musicSync();render()}
function setVolume(v){
  AUD.vol=Math.min(1,Math.max(0,(parseInt(v)||0)/100));audSave();
  if(AUD.el&&!AUD.fade)AUD.el.volume=AUD.vol;
  const l=document.getElementById('vol-lbl');if(l)l.textContent=Math.round(AUD.vol*100)+'%';
}
// the floating button is outside #root, so it survives re-renders; shown only on calm screens
function sndBtnSync(){
  const b=document.getElementById('snd-btn');if(!b||!g)return;
  const show=['start','game','upgrade','profile'].includes(g.phase);
  b.hidden=!show;
  b.innerHTML=ic(AUD.on&&AUD.vol>0?'sound':'mute',24);
  b.setAttribute('aria-label','Cài đặt âm thanh');
}
