// ===== GAME CLOCK: one loop drives every timer in the game =====
// All game timing (day clock, mini-games, animations, delays) runs on this clock, so pausing is a single switch:
// while GT.paused the clock does not advance and nothing scheduled with every()/after() fires.
// Only real UI niceties (toast, AI request timeout) still use the browser timers.
const GT={t:0,last:0,paused:false,tasks:[],id:null};
function gnow(){return GT.t}                 // game time in ms (excludes paused time)
function loopTick(){
  const n=Date.now(),dt=Math.min(250,n-GT.last);GT.last=n;   // a long freeze (hidden tab) never turns into a burst of catch-up
  if(GT.paused)return;
  GT.t+=dt;
  for(const k of GT.tasks.slice()){
    if(k.dead||GT.t<k.at)continue;
    if(k.every){k.at+=k.every;if(k.at<GT.t)k.at=GT.t}else k.dead=true;
    try{k.fn()}catch(e){console.error(e)}
  }
  if(GT.tasks.some(k=>k.dead))GT.tasks=GT.tasks.filter(k=>!k.dead);
}
function loopStart(){if(!GT.id){GT.last=Date.now();GT.id=setInterval(loopTick,25)}}
function every(ms,fn){const k={at:GT.t+ms,every:ms,fn,dead:false};GT.tasks.push(k);loopStart();return k}
function after(ms,fn){const k={at:GT.t+ms,fn,dead:false};GT.tasks.push(k);loopStart();return k}
function stopT(k){if(k)k.dead=true}
function stopAllT(){GT.tasks.forEach(k=>k.dead=true);GT.tasks=[]}
function setPaused(p){
  GT.paused=!!p;GT.last=Date.now();
  document.body.classList.toggle('paused',!!p);
  document.querySelectorAll('svg').forEach(s=>{try{p?s.pauseAnimations():s.unpauseAnimations()}catch(e){}});
}
