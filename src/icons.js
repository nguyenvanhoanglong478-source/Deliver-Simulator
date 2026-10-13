const BIKE="__BIKE__";
// ===== PIXEL ART: icons, avatar, skyline (all drawn from tiny maps, no image files) =====
const ICONS={
  coin:{p:{a:'#ffd43b',b:'#b8860b',c:'#fff4a8'},m:['..bbbb..','.baaaab.','baaccaab','baacaaab','baacaaab','baaaaaab','.baaaab.','..bbbb..']},
  fuel:{p:{a:'#ff9d2e',b:'#a85a00',c:'#38d9ff'},m:['.bbbbb..','.bcccb..','.bcccb.b','.baaab.b','.baaabbb','.baaab.b','.baaab..','bbbbbbb.']},
  bolt:{p:{a:'#52ff7a'},m:['....aaa.','...aaa..','..aaa...','.aaaaaa.','...aaa..','..aaa...','.aa.....','.a......']},
  gear:{p:{a:'#c9c2f5',b:'#6c63b5'},m:['...aa...','.a.aa.a.','..aaaa..','aaab.baa','aaab.baa','..aaaa..','.a.aa.a.','...aa...']},
  star:{p:{a:'#ffd43b',b:'#b8860b'},m:['...aa...','...aa...','aaaaaaaa','.aaaaaa.','..aaaa..','..aaaa..','.aa..aa.','.a....a.']},
  starOff:{p:{a:'#3a3180'},m:['...aa...','...aa...','aaaaaaaa','.aaaaaa.','..aaaa..','..aaaa..','.aa..aa.','.a....a.']},
  moon:{p:{a:'#38d9ff',b:'#1b7f9c'},m:['...aaa..','..aaa...','.aaa....','.aaa....','.aab....','..aaa..a','...aaaa.','....aa..']},
  box:{p:{a:'#c98a4b',b:'#6b4220',c:'#f0c987'},m:['........','.bbbbbb.','baaccaab','baaccaab','baaccaab','baaccaab','.bbbbbb.','........']},
  bowl:{p:{a:'#ff4d5e',b:'#9c1f2c',c:'#f3efff'},m:['..c..c..','...c..c.','........','bbbbbbbb','baaaaaab','.baaaab.','..bbbb..','........']},
  bank:{p:{a:'#ffd43b',b:'#b8860b'},m:['...aa...','..aaaa..','.aaaaaa.','aaaaaaaa','.b.b.b.b','.b.b.b.b','.b.b.b.b','aaaaaaaa']},
  flag:{p:{a:'#ff4d5e',b:'#f3efff'},m:['aaaa....','aaaaaa..','aaaa....','b.......','b.......','b.......','b.......','bb......']},
  cal:{p:{a:'#f3efff',b:'#9a90d6',c:'#ff4d5e'},m:['.b....b.','bbbbbbbb','baaaaaab','bacaacab','baaaaaab','bacaacab','baaaaaab','bbbbbbbb']},
  cloud:{p:{a:'#9a90d6',b:'#38d9ff'},m:['..aaa...','.aaaaaa.','aaaaaaaa','aaaaaaaa','.b.b.b..','..b.b.b.','.b.b.b..','........']},
  trophy:{p:{a:'#ffd43b',b:'#b8860b'},m:['aaaaaaaa','a.aaaa.a','a.aaaa.a','.aaaaaa.','..aaaa..','...aa...','..bbbb..','.bbbbbb.']},
  user:{p:{a:'#9a90d6'},m:['..aaaa..','.aaaaaa.','.aaaaaa.','..aaaa..','.aaaaaa.','aaaaaaaa','aaaaaaaa','aaaaaaaa']},
  back:{p:{a:'#f3efff'},m:['...a....','..aa....','.aaaaaaa','aaaaaaaa','.aaaaaaa','..aa....','...a....','........']},
  check:{p:{a:'#52ff7a'},m:['........','......aa','.....aa.','a...aa..','aa.aa...','.aaa....','..a.....','........']},
  warn:{p:{a:'#ffd43b',b:'#000'},m:['...aa...','..aaaa..','..abba..','.aabbaa.','.aabbaa.','aaaaaaaa','aaabbaaa','aaaaaaaa']},
  skull:{p:{a:'#f3efff',b:'#000'},m:['.aaaaaa.','aaaaaaaa','abbaabba','abbaabba','aaaaaaaa','.aabbaa.','.a.aa.a.','.aaaaaa.']},
  wrench:{p:{a:'#c9c2f5',b:'#6c63b5'},m:['.....aa.','....aaaa','....aa.a','...aaaa.','..aaa...','.aaa....','aaa.....','aa......']},
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
