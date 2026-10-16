// ===== STATE SHAPE AND RUNTIME CHECKS =====
/**
 * @typedef {Object} Offer
 * @property {'food'|'goods'} type
 * @property {0|1|2} dist         near / medium / far
 * @property {boolean} rush
 * @property {'catch'|'dodge'|'route'} mg   mini-game kind
 * @property {boolean} peak
 * @property {number} base        pay in VND
 *
 * @typedef {Object} State        the one global `g` (saved as localStorage 'btd_v2')
 * @property {number} cash @property {number} savings
 * @property {number} month @property {number} day @property {number} dayTimeLeft
 * @property {number} stamina @property {number} fuel @property {number} vehicleHp   0-100
 * @property {number} stars       1-5
 * @property {number} dailyEarned @property {number} dailySpent @property {number} earned
 * @property {number} delivered @property {number} totalDelivered
 * @property {Object<string,boolean>} upgrades
 * @property {{m:string,t:string}[]} log
 * @property {'start'|'game'|'upgrade'|'profile'|'minigame'|'anim-deliver'|'anim-refuel'|'anim-sleep'|'win'|'lose'} phase
 * @property {Offer[]} offers
 * @property {number[]} ms        reached savings milestones
 * @property {0|1|2} drive        slow / normal / fast
 */
const MG_KINDS=['catch','dodge','route'];
const PHASES=['start','game','upgrade','profile','minigame','anim-deliver','anim-refuel','anim-sleep','win','lose'];
const _inR=(v,lo,hi)=>Number.isFinite(v)&&v>=lo&&v<=hi;
function offerOk(o){return !!o&&!!C.jobs[o.type]&&!!DIST[o.dist]&&Number.isFinite(o.base)&&o.base>0&&(o.mg===undefined||MG_KINDS.includes(o.mg))}
// List what is wrong with a state object (empty array = valid). Pure: does not change anything.
function stateProblems(s){
  const p=[];
  if(!s||typeof s!=='object')return['not an object'];
  if(!Number.isFinite(s.cash))p.push('cash');
  if(!_inR(s.savings,0,1e12))p.push('savings');
  if(!_inR(s.month,1,C.maxMonths))p.push('month');
  if(!_inR(s.day,1,C.daysPerMonth))p.push('day');
  if(!_inR(s.dayTimeLeft,0,C.dayDuration))p.push('dayTimeLeft');
  ['stamina','fuel','vehicleHp'].forEach(k=>{if(!_inR(s[k],0,100))p.push(k)});
  if(!_inR(s.stars,1,5))p.push('stars');
  if(![0,1,2].includes(s.drive))p.push('drive');
  ['dailyEarned','dailySpent','earned','delivered','totalDelivered'].forEach(k=>{if(!_inR(s[k],0,1e13))p.push(k)});
  if(!PHASES.includes(s.phase))p.push('phase');
  if(!s.upgrades||typeof s.upgrades!=='object'||Array.isArray(s.upgrades))p.push('upgrades');
  if(!Array.isArray(s.log))p.push('log');
  if(!Array.isArray(s.ms))p.push('ms');
  if(!Array.isArray(s.offers)||!s.offers.length||!s.offers.every(offerOk))p.push('offers');
  if(!s.fin||typeof s.fin!=='object')p.push('fin');
  return p.concat(lifeBad(s));
}
// Fix a live state in place (clamp numbers, rebuild broken containers). Returns the list of repaired fields.
function repairState(s){
  const bad=stateProblems(s);if(!bad.length||!s||typeof s!=='object')return bad;
  const cl=(v,lo,hi,d)=>Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):d;
  s.cash=cl(s.cash,-1e12,1e12,0);s.savings=cl(s.savings,0,1e12,0);
  s.month=cl(s.month,1,C.maxMonths,1);s.day=cl(s.day,1,C.daysPerMonth,1);s.dayTimeLeft=cl(s.dayTimeLeft,0,C.dayDuration,C.dayDuration);
  ['stamina','fuel','vehicleHp'].forEach(k=>s[k]=cl(s[k],0,100,100));
  s.stars=cl(s.stars,1,5,5);if(![0,1,2].includes(s.drive))s.drive=1;
  ['dailyEarned','dailySpent','earned','delivered','totalDelivered'].forEach(k=>s[k]=cl(s[k],0,1e13,0));
  if(!s.upgrades||typeof s.upgrades!=='object'||Array.isArray(s.upgrades))s.upgrades={};
  if(!Array.isArray(s.log))s.log=[];
  if(!Array.isArray(s.ms))s.ms=[];
  if(!s.fin||typeof s.fin!=='object')s.fin={earn:0,fuel:0,repair:0,accident:0,bills:0,upg:0};
  if(!Array.isArray(s.offers)||!s.offers.length||!s.offers.every(offerOk))s.offers=genOffers();
  lifeFix(s);
  return bad;
}
