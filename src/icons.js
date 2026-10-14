const BIKE="__BIKE__";
// ===== PIXEL ART: icons, avatar, skyline (all drawn from tiny maps, no image files) =====
const ICONS={
  bowl:{p:{'a': '#ff4d5e', 'b': '#9c1f2c', 'c': '#f3efff', 'n': '#ffd43b', 'm': '#d9a21a', 'h': '#ff8a96', 't': '#7a1020', 'e': '#fff7c2', 'k': '#4a2a10'},m:[
    '....c...c..c....',
    '...c...c..c.....',
    '....c...c..c....',
    '...nmnnmnnmnn.k.',
    '..nnnmnnnmnnnk..',
    '.bbbbbbbbbbbbbk.',
    '.baaaaaaaaaaaab.',
    '.bahhaaaaaaaaab.',
    '.bahaaaaaaaaaab.',
    '.baaaaaaaaaaaab.',
    '..baaaaaaaaaab..',
    '..bbaaaaaaaabb..',
    '...bbaaaaaabb...',
    '....bbbbbbbb....',
    '...bttttttttb...',
    '....bbbbbbbb....']},
  box:{p:{'a': '#c98a4b', 'b': '#6b4220', 'c': '#f0c987', 'd': '#a56a33', 't': '#e8e0c8', 's': '#8a5a2b'},m:[
    '................',
    '..bbbbbbbbbbbb..',
    '.bccccccccccccb.',
    '.bcddddttddddcb.',
    'bbbbbbbbttbbbbbb',
    'baaaaaaattaaaaab',
    'baaaaaaattaaaaab',
    'baaaaaaattaaaaab',
    'baaaaaaaaaaaaaab',
    'baaasssaaaaaaaab',
    'baaasssaaaaaaaab',
    'baaaaaaaaaaaaaab',
    'baaaaaaaaaaaaadb',
    'baaaaaaaaaaaaddb',
    'bbbbbbbbbbbbbbbb',
    '................']},
  coin:{p:{'a': '#ffd43b', 'b': '#b8860b', 'c': '#fff4a8', 'd': '#e8a912'},m:[
    '................',
    '.....bbbbbb.....',
    '...bbaaaaaabb...',
    '..baaccaaaaaab..',
    '..bacaaaaaaaab..',
    '.baacaaddaaaaab.',
    '.baaaaddddaaaab.',
    '.baaaadaaddaaab.',
    '.baaaadaaddaaab.',
    '.baaaaddddaaaab.',
    '.baaaaaddaaaadb.',
    '..baaaaaaaaadb..',
    '..bdaaaaaaaddb..',
    '...bbddddddbb...',
    '.....bbbbbb.....',
    '................']},
  fuel:{p:{'a': '#ff9d2e', 'b': '#a85a00', 'c': '#38d9ff', 'd': '#ffc875', 'k': '#3a3180', 'h': '#ffffff'},m:[
    '................',
    '..bbbbbbbb......',
    '.baddddddab.bb..',
    '.bacchhccab.bab.',
    '.baccccccab.bab.',
    '.baccccccabbbab.',
    '.baddddddab.bab.',
    '.baaaaaaaab.bab.',
    '.baaaaaaaab.bab.',
    '.baaaaaaaab.bb..',
    '.baakkkkaab.bb..',
    '.baakkkkaab.bb..',
    '.baaaaaaaab.....',
    'bbbbbbbbbbbb....',
    'bkkkkkkkkkkb....',
    'bbbbbbbbbbbb....']},
  bolt:{p:{'a': '#52ff7a', 'b': '#0f8a2e', 'c': '#d4ffe0'},m:[
    '................',
    '.......bbbb.....',
    '......baaacb....',
    '.....baaacb.....',
    '....baaacb......',
    '...baaaacb......',
    '..baaaaaacbbb...',
    '..bbbbaaaaaacb..',
    '......baaaacb...',
    '.....baaaacb....',
    '....baaaacb.....',
    '...baaacb.......',
    '...baacb........',
    '..baacb.........',
    '..bacb..........',
    '..bbb...........']},
  gear:{p:{'a': '#c9c2f5', 'b': '#6c63b5', 'c': '#ffffff', 'd': '#9a90d6', 'k': '#1b1650'},m:[
    '................',
    '.......bb.......',
    '...bb.baab.bb...',
    '..baabbaabbaab..',
    '..baaaaaaaaaab..',
    '...baaccaaaab...',
    '.bbbaacddaaabbb.',
    '.baaaakkkkaaaab.',
    '.baaaakkkkaaaab.',
    '.bbbaadkkdaabbb.',
    '...baaddddaab...',
    '..baaaaaaaaaab..',
    '..baabbaabbaab..',
    '...bb.baab.bb...',
    '.......bb.......',
    '................']},
  star:{p:{'a': '#ffd43b', 'b': '#b8860b', 'c': '#fff4a8', 'd': '#e8a912'},m:[
    '................',
    '.......bb.......',
    '......baab......',
    '......bacab.....',
    '.....baccab.....',
    'bbbbbbaaaabbbbbb',
    'baaaaaaccaaaaaab',
    '.bdaaaaaaaaaaab.',
    '..bdaaaaaaaadb..',
    '...bdaaaaaaab...',
    '...baaaaaaaab...',
    '..baaaabbaaaab..',
    '..baaab..baaab..',
    '.baab......baab.',
    '.bbb........bbb.',
    '................']},
  starOff:{p:{'a': '#3a3180', 'b': '#241c5e', 'c': '#4b41a0'},m:[
    '................',
    '.......bb.......',
    '......baab......',
    '......bacab.....',
    '.....baccab.....',
    'bbbbbbaaaabbbbbb',
    'baaaaaaccaaaaaab',
    '.baaaaaaaaaaaab.',
    '..baaaaaaaaaab..',
    '...baaaaaaaab...',
    '...baaaaaaaab...',
    '..baaaabbaaaab..',
    '..baaab..baaab..',
    '.baab......baab.',
    '.bbb........bbb.',
    '................']},
  moon:{p:{'a': '#38d9ff', 'b': '#1b7f9c', 'c': '#d4f7ff', 'y': '#ffd43b', 'w': '#fff4a8'},m:[
    '................',
    '...bbbcbbb......',
    '..bcaaab...y....',
    '.bcaaab...ywy...',
    'bcaaab.....y....',
    'baaab...........',
    'baaab...........',
    'baaab...........',
    'baaab...........',
    'baaab...........',
    'baaaab......y...',
    '.baaaab....ywy..',
    '..baaaab....y...',
    '...bbbabbb......',
    '................',
    '................']},
  bank:{p:{'a': '#ffd43b', 'b': '#b8860b', 'c': '#fff4a8', 'd': '#e8a912', 'w': '#f3efff'},m:[
    '................',
    '.......bb.......',
    '......baab......',
    '.....baccab.....',
    '....baccaaab....',
    '...baaaaaaaab...',
    '..bbbbbbbbbbbb..',
    '...bddbddbddb...',
    '...bcabcabcab...',
    '...bcabcabcab...',
    '...bcabcabcab...',
    '...bcabcabcab...',
    '...bdabdabdab...',
    '..bbbbbbbbbbbb..',
    '.baaaaaaaaaaaab.',
    '.bbbbbbbbbbbbbb.']},
  flag:{p:{'a': '#ff4d5e', 'b': '#9c1f2c', 'c': '#ff8a96', 'w': '#f3efff', 'k': '#c9c2f5', 'p': '#6c63b5'},m:[
    '................',
    '..bb............',
    '..bwbbbbbbbbb...',
    '..bkaaaaaaaaab..',
    '..bkaccaaaaaaab.',
    '..bkacaaaaaaab..',
    '..bkaaaaaaaab...',
    '..bkaaaaaaab....',
    '..bkaaaaaab.....',
    '..bkbbbbbb......',
    '..bk............',
    '..bk............',
    '..bp............',
    '..bp............',
    '.bbpbb..........',
    '.bpppb..........']},
  cal:{p:{'a': '#f3efff', 'b': '#9a90d6', 'c': '#ff4d5e', 'd': '#6c63b5', 'e': '#d6d0f5', 'r': '#c9c2f5'},m:[
    '................',
    '..b..........b..',
    '.bbb........bbb.',
    'bbbbbbbbbbbbbbbb',
    'bcccccccccccccb.',
    'bcccccccccccccb.',
    'bbbbbbbbbbbbbbbb',
    'baaaaaaaaaaaaaab',
    'baddaddaddaddaab',
    'baaaaaaaaaaaaaab',
    'baddaddaccaddaab',
    'baaaaaaaaaaaaaab',
    'baddaddaddaaaaab',
    'baeeeeeeeeeeeeab',
    'bbbbbbbbbbbbbbbb',
    '................']},
  cloud:{p:{'a': '#9a90d6', 'b': '#6c63b5', 'c': '#c9c2f5', 'w': '#38d9ff'},m:[
    '................',
    '......bbbb......',
    '....bbccccbb....',
    '...bcccccccab...',
    '.bbbcccccccaabb.',
    'bcccccccccccaaab',
    'bccccccccccaaaab',
    'baaaaaaaaaaaaaab',
    '.bbbbbbbbbbbbbb.',
    '..w..w..w..w....',
    '..w..w..w..w....',
    '.w..w..w..w.....',
    '.w..w..w..w.....',
    '................',
    '................',
    '................']},
  trophy:{p:{'a': '#ffd43b', 'b': '#b8860b', 'c': '#fff4a8', 'd': '#e8a912', 'k': '#6b4220'},m:[
    '................',
    '..bbbbbbbbbbbb..',
    'bbbaccaaaaadabbb',
    'b.baccaaaaadab.b',
    'b.baccaaaaadab.b',
    'bb.baccaaaadab.b',
    '.bb.bacaaaadab..',
    '..bb.baaaaadab..',
    '....bbaaaaadbb..',
    '.....bbaaadbb...',
    '......bbadbb....',
    '.......bab......',
    '.......bab......',
    '....bbbbbbbbb...',
    '...bkkkkkkkkkb..',
    '...bbbbbbbbbbb..']},
  user:{p:{'a': '#9a90d6', 'b': '#6c63b5', 'c': '#c9c2f5'},m:[
    '................',
    '.....bbbbbb.....',
    '....baccaaab....',
    '....bcaaaaab....',
    '....baaaaaab....',
    '....baaaaaab....',
    '.....bbbbbb.....',
    '...bbbaaaabbb...',
    '..bccaaaaaaaab..',
    '.bcaaaaaaaaaaab.',
    '.bcaaaaaaaaaaab.',
    '.baaaaaaaaaaaab.',
    '.baaaaaaaaaaaab.',
    '.bbbbbbbbbbbbbb.',
    '................',
    '................']},
  back:{p:{'a': '#f3efff', 'b': '#9a90d6'},m:[
    '................',
    '......b.........',
    '.....bab........',
    '....baab........',
    '...baaabbbbbbbb.',
    '..baaaaaaaaaaab.',
    '.baaaaaaaaaaaab.',
    '.baaaaaaaaaaaab.',
    '..baaaaaaaaaab..',
    '...baaabbbbbbb..',
    '....baab........',
    '.....bab........',
    '......b.........',
    '................',
    '................',
    '................']},
  check:{p:{'a': '#52ff7a', 'b': '#0f8a2e'},m:[
    '................',
    '................',
    '.............bb.',
    '............baab',
    '...........baab.',
    '..........baab..',
    '.b.......baab...',
    'bab.....baab....',
    'baab...baab.....',
    '.baab.baab......',
    '..baabaab.......',
    '...baaab........',
    '....bab.........',
    '.....b..........',
    '................',
    '................']},
  warn:{p:{'a': '#ffd43b', 'b': '#7a5a00', 'k': '#1a1030', 'c': '#fff4a8'},m:[
    '................',
    '.......bb.......',
    '......baab......',
    '......baab......',
    '.....baaaab.....',
    '.....bakkab.....',
    '....baakkaab....',
    '....baakkaab....',
    '...baaakkaaab...',
    '...baaakkaaab...',
    '..baaaaaaaaaab..',
    '..baaaakkaaaab..',
    '.baaaaakkaaaaab.',
    '.baaaaaaaaaaaab.',
    'bbbbbbbbbbbbbbbb',
    '................']},
  skull:{p:{'a': '#f3efff', 'b': '#9a90d6', 'k': '#000000', 'r': '#ff4d5e'},m:[
    '................',
    '....bbbbbbbb....',
    '..bbaaaaaaaabb..',
    '.baaaaaaaaaaaab.',
    '.baaaaaaaaaaaab.',
    '.bakkkaaaakkkab.',
    '.bakkkkaakkkkab.',
    '.bakkkkaakkkkab.',
    '.baakkaaaakkaab.',
    '..baaaaakaaaab..',
    '...bbaaakaabb...',
    '....bbaaaabb....',
    '....bakabakb....',
    '....bakabakb....',
    '.....bbbbbb.....',
    '................']},
  wrench:{p:{'a': '#c9c2f5', 'b': '#6c63b5', 'c': '#ffffff'},m:[
    '................',
    '.........bbb....',
    '......bbbaaab...',
    '.....baaaaaab...',
    '.....baab.bab...',
    '.....baab.bb....',
    '......baab......',
    '.....baaab......',
    '....baaab.......',
    '...baaab........',
    '..baaab.........',
    '.baaab..........',
    'baaab...........',
    'baab............',
    '.bb.............',
    '................']},
};
function ic(name,size){
  const d=ICONS[name];if(!d)return'';size=size||24;
  const rows=d.m;let r='';
  for(let y=0;y<rows.length;y++){
    let x=0;const row=rows[y];
    while(x<row.length){
      const ch=row[x];
      if(ch==='.'){x++;continue}
      let w=1;while(x+w<row.length&&row[x+w]===ch)w++;
      r+=`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${d.p[ch]}"/>`;
      x+=w;
    }
  }
  return`<svg class="px-ic" width="${size}" height="${size}" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}
function starsHTML(avg,size){
  const n=Math.round(avg);let h='';
  for(let i=1;i<=5;i++)h+=ic(i<=n?'star':'starOff',size||16);
  return`<span class="stars" role="img" aria-label="${avg.toFixed(1)} trên 5 sao">${h}</span>`;
}
function starsFixed(n,size){
  let h='';for(let i=1;i<=5;i++)h+=ic(i<=n?'star':'starOff',size||16);
  return`<span class="stars" role="img" aria-label="${n} trên 5 sao">${h}</span>`;
}

// 12x12 driver portrait. h/H helmet, s skin, e eyes, m mouth, j/J jacket, o outline
const AV_MAP=['...oooooo...','..ohhhhhho..','.ohhhhhhhho.','.ohhhhhhhho.','.oHhhhhhhHo.','.osssssssso.','.osesssesso.','.osssssssso.','..ossmmsso..','..ojjjjjjo..','.ojjjjjjjjo.','.ojJjjjjJjo.'];
const HELMETS=['#ff4d5e','#ffd43b','#38d9ff','#52ff7a','#b983ff','#ff9d2e','#f3efff'];
function shade(hex,f){
  const n=parseInt(hex.slice(1),16);
  const c=[(n>>16)&255,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*f))));
  return'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
}
function avatarHTML(helmet,size){
  const hc=helmet||HELMETS[0];
  const pal={o:'#000',h:hc,H:shade(hc,.65),s:'#f2c28f',e:'#000',m:'#b5503c',j:'#1fae4c',J:'#14762f'};
  let r='';
  AV_MAP.forEach((row,y)=>{
    let x=0;
    while(x<row.length){
      const ch=row[x];if(ch==='.'){x++;continue}
      let w=1;while(x+w<row.length&&row[x+w]===ch)w++;
      r+=`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${pal[ch]}"/>`;x+=w;
    }
  });
  return`<svg class="px-ic" width="${size||40}" height="${size||40}" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}

// Tiling city skyline as an SVG data URI (seeded so it looks the same every load)
function skylineURI(seed,body,win,h){
  let s=seed;const rnd=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff};
  const W=480;let x=0,r='';
  while(x<W){
    const bw=Math.min(W-x,24+Math.floor(rnd()*5)*8);
    const bh=24+Math.floor(rnd()*((h-24)/8))*8;
    r+=`<rect x="${x}" y="${h-bh}" width="${bw}" height="${bh}" fill="${body}"/>`;
    for(let wy=h-bh+8;wy<h-8;wy+=16)for(let wx=x+8;wx<x+bw-8;wx+=16)
      if(rnd()>.45)r+=`<rect x="${wx}" y="${wy}" width="4" height="8" fill="${win}"/>`;
    x+=bw;
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" shape-rendering="crispEdges">${r}</svg>`;
  return'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
}
(function(){
  const rs=document.documentElement.style;
  rs.setProperty('--sky-far',skylineURI(7,'#231659','#4a3a9a',96));
  rs.setProperty('--sky-near',skylineURI(21,'#120b36','#ffd43b',72));
})();
