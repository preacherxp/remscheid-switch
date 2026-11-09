/* remscheid-switch — contemporary landmarks and everyday city life. */
(() => {
  const { PAD_Y, BW, BH, clamp, mix, smooth, rng } = CitySwitch;
  const NOON=0,GOLD=1,DUSK=2,NIGHT=3,DAWN=4;
  let M,N;
  const SKY = [
    ['#568bb4', '#7aaaca', '#a9cadd', '#d1e2e7', '#f2ebd6'],
    ['#7798b5', '#b6b0b5', '#e2b19a', '#f5bc87', '#ffe2ac'],
    ['#293d65', '#545576', '#a07686', '#da9b89', '#f4bd9d'],
    ['#080f22', '#101c34', '#1a2b43', '#2d4052', '#4b5960'],
    ['#425a7e', '#7d8fa3', '#bdadb0', '#e6c7b8', '#f5e4cd'],
  ];
  const palette=({mat,neon})=>{
    mat('WHITE_PANEL','#e5e8e1');
    mat('PANEL_D','#aebbb8');
    mat('HOTEL_PANEL','#d0d4d0');
    mat('HOTEL_BLUE','#3775a3');
    mat('BRAND_GREEN','#258e76');
    mat('FRAME','#6f8286');
    mat('WINDOW','#7395a1');
    mat('TRIM','#f1f1e6');
    mat('HILL','#63846b');
    mat('TREE','#527f5e');
    mat('TREE_D','#325c49');
    mat('TREE_L','#7c9e6e');
    mat('SLATE','#66787b');
    mat('ROOF_D','#435558');
    mat('TIMBER_D','#655443');
    mat('PLANTER','#7b8a83');
    mat('LEAF','#6c985e');
    mat('STONE','#c8c7b9');
    mat('STONE_D','#9fa9a4');
    mat('PAVE','#c8ccbf',{[NIGHT]:'#2d3e4a'});
    mat('PAVE_D','#b1b8ae',{[NIGHT]:'#233440'});
    mat('CLOUD','#f3f5ec',{[GOLD]:'#ffe3bd',[DUSK]:'#bc97ab',[NIGHT]:'#304657',[DAWN]:'#d8c8c8'});
    mat('CLOUD_SH','#d6e1de',{[GOLD]:'#e0b79e',[DUSK]:'#8e708b',[NIGHT]:'#243749',[DAWN]:'#b6abb7'});
    neon('LED_SOFT','#f7f4df','#dce9ed',.28);
    neon('OFFICE','#b9d7df','#93c9df',.12);
    neon('BRAND','#c3e8cf','#41ba91',.28);
    neon('BLUE_SIGN','#bcdef5','#65b2ee',.28);
  };
  const grade = [
    ([r, g, b]) => [r, g, b],
    ([r, g, b]) => [r * 1.02 + .03, g * .85 + .02, b * .72],
    ([r, g, b]) => [r * .57 + .035, g * .51 + .025, b * .61 + .04],
    ([r, g, b]) => [r * .22 + .025, g * .26 + .03, b * .36 + .045],
    ([r, g, b]) => [r * .73 + .04, g * .7 + .03, b * .77 + .04],
  ];
  const line = (x0, y0, x1, y1, cb) => {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      cb(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = err * 2;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  const tree = (w, cx, cy, rw, rh, r) => {
    for (let y = -rh; y <= rh; y++) {
      for (let x = -rw; x <= rw; x++) {
        const d = (x * x) / (rw * rw) + (y * y) / (rh * rh);
        if (d > 1 + (r() - 0.5) * 0.3) continue;
        const v = r();
        let m = M.TREE;
        if (y > rh * 0.2 || x > rw * 0.4) m = v < 0.7 ? M.TREE_D : M.TREE;
        else if (y < -rh * 0.25 && x < rw * 0.2) m = v < 0.55 ? M.TREE_L : M.TREE;
        else if (v < 0.3) m = M.TREE_D;
        w.px(cx + x, cy + y, m);
      }
    }
  };

  const smoothSky = (w, key, ctx) => {
    const stops = SKY[key].map(ctx.rgb);
    const end = PAD_Y + 106;
    const at = (y) => {
      const p = clamp(Math.pow(clamp(y, 0, BH) / end, 1.25)) * 3.999;
      const lo = Math.floor(p);
      return stops[lo].map((v, i) => mix(v, stops[lo + 1][i], p - lo));
    };
    for (let y = 0; y < BH; y++) {
      w.skyLo[key][y] = ctx.pack(at(y));
      w.skyHi[key][y] = ctx.pack(at(y + 4));
    }
  };

  const drawSky = (w, dt, hour) => {
    const h = hour;
    if (h < 18.4) {
      const t = clamp((h - 12) / (18.1 - 12));
      const low = smooth(15.6, 17.4, h);
      w.sun(mix(118, 8, t), mix(16, 58, t * t * t), low > 0.3 ? 6 : 5, low);
    } else if (h > 29.2) {
      const t = clamp((h - 29.2) / (36 - 29.2));
      const low = 1 - smooth(30.2, 31.8, h);
      w.sun(mix(304, 118, t), mix(82, 16, Math.sqrt(t)), low > 0.3 ? 6 : 5, low);
    }
    if (h > 18.6 && h < 29.4) w.moon(mix(96, 142, (h - 18.6) / 10.8), mix(30, 18, Math.sin(((h - 18.6) / 10.8) * Math.PI)));
    for (const c of w.strata) {
      c.x += c.v * dt;
      if (c.x > 370) c.x = -c.w - 40;
      const cx = Math.round(c.x);
      for (let i = 0; i < c.w; i++) {
        const edge = Math.min(i, c.w - i);
        const thick = Math.round(Math.min(edge * 0.12, 1.5) + Math.sin(i * 0.17 + c.w) * 0.8 + 0.5);
        for (let j = -thick; j <= 0; j++) {
          if ((i + j * 3 + c.y) % 5 === 0 && edge < 18) continue;
          w.pxSky(cx + i, c.y + j, j === 0 ? M.CLOUD_SH : M.CLOUD);
        }
      }
    }
  };

  const drawSquare = (w) => {
    // Large pale paving slabs, with a darker granite band across the pedestrian square.
    for (let y = 112; y < 150; y++) for (let x = -40; x < 360; x++) {
      const joint = y % 5 === 0 || (x + (Math.floor(y / 5) % 2) * 6) % 12 === 0;
      w.px(x, y, joint ? M.PAVE_D : M.PAVE);
    }
    w.rect(-40, 135, 400, 2, M.STONE_D);
    w.rect(-40, 137, 400, 1, M.PAVE_D);
  };

  const drawHills = (w) => {
    const r=rng(28);
    for(let x=-40;x<360;x++){
      const top=Math.round(71+Math.sin(x*.024)*10+Math.sin(x*.061)*4);
      w.rect(x,top,1,118-top,M.HILL);
      if(x%7===0)tree(w,x,top+1,5,7,r);
    }
    // Bergisches Land slate houses sit behind the contemporary campus.
    for(const [x,top] of [[-30,78],[-8,72],[175,88],[340,83]]){
      w.rect(x,top,23,34,M.SLATE);
      for(let i=0;i<23;i++)w.rect(x+i,top-Math.min(i,22-i),1,Math.min(i,22-i)+1,M.ROOF_D);
      for(const y of [top+5,top+18])for(const dx of [4,14]){
        w.rect(x+dx-1,y-1,6,9,M.TRIM);w.rect(x+dx,y,4,7,M.WINDOW);
        w.lightRect(x+dx,y+1,4,5,N.WARM_DIM,w.winGroups[(x+dx+80)%28]);
      }
    }
  };
  const drawVaillant = (w) => {
    // White horizontal bands and the glazed campus wings of the Remscheid HQ.
    for(const [x,top,width] of [[26,63,62],[88,74,80],[21,96,151]]){
      w.rect(x,top,width,113-top,M.WHITE_PANEL);
      w.rect(x+width-3,top,3,113-top,M.PANEL_D);
      for(let y=top+5;y<108;y+=12){
        w.rect(x+3,y,width-7,7,M.WINDOW);
        for(let dx=4;dx<width-8;dx+=8){
          if((dx+y)%5<3)w.lightRect(x+dx,y+1,6,5,N.OFFICE,w.winGroups[(dx+y)%28]);
          w.rect(x+dx+6,y,1,7,M.FRAME);
        }
      }
      w.rect(x,top,width,2,M.TRIM);
    }
    w.hsign(81,78,78,11,'VAILLANT',{n:N.BRAND,g:w.venueG,board:M.WHITE_PANEL,off:M.BRAND_GREEN});
    // A tiny hare emblem suggests the company mark without competing with its name.
    w.rect(70,81,1,5,M.BRAND_GREEN);w.rect(73,80,1,6,M.BRAND_GREEN);
    w.rect(69,85,7,4,M.BRAND_GREEN);w.px(75,86,M.TRIM);
    w.rect(88,98,54,2,M.FRAME);w.rect(90,100,50,13,M.WINDOW);
    w.lightRect(91,101,48,11,N.WARM,w.venueG);
    for(const x of [99,111,123,135])w.rect(x,100,1,13,M.FRAME);
    w.rect(85,113,61,2,M.STONE);w.rect(82,115,67,2,M.STONE_D);
    for(const x of [34,154]){w.rect(x,110,12,6,M.PLANTER);w.rect(x-1,108,14,3,M.LEAF);}
  };
  const drawHotel = (w) => {
    const x=218;
    w.rect(x,64,128,54,M.HOTEL_PANEL);w.rect(x+123,64,5,54,M.PANEL_D);
    w.rect(x-1,62,130,2,M.TRIM);w.rect(x,79,128,2,M.PANEL_D);
    for(const [y,height] of [[84,7],[97,7],[109,7]])for(let dx=5;dx<120;dx+=13){
      if(y===109&&dx>48&&dx<91)continue;
      w.rect(x+dx-1,y-1,8,height+2,M.PANEL_D);w.rect(x+dx,y,6,height,M.WINDOW);
      if((dx+y)%4<3)w.lightRect(x+dx+1,y+1,4,height-2,N.WARM,w.winGroups[(dx+y)%28]);
    }
    // The real hotel is Holiday Inn Express on Lenneper Straße 164.
    w.hsign(227,66,72,7,'HOLIDAY INN',{n:N.BRAND,g:w.venueG,board:M.HOTEL_PANEL,off:M.BRAND_GREEN});
    w.hsign(262,73,37,6,'EXPRESS',{n:N.BLUE_SIGN,g:w.venueG,board:M.HOTEL_PANEL,off:M.HOTEL_BLUE});
    w.rect(306,68,12,9,M.BRAND_GREEN);w.glyph('H',310,70,(x,y)=>w.tube(x,y,M.TRIM,N.LED_SOFT,w.venueG));
    w.rect(267,105,42,2,M.FRAME);w.rect(270,107,36,11,M.WINDOW);
    w.lightRect(271,108,34,9,N.WARM,w.venueG);w.rect(288,107,1,11,M.FRAME);
    for(const x of [262,313]){w.rect(x,114,6,5,M.PLANTER);w.rect(x-1,111,8,4,M.LEAF);}
    w.rect(216,118,132,2,M.STONE_D);
  };
  const build=(w,ctx)=>{
    M=ctx.M;N=ctx.N;
    for(let key=NOON;key<=DAWN;key++)smoothSky(w,key,ctx);
    w.noSignal=true;w.walkTop=118;w.roadTop=133;w.lanes=[139,148];
    w.venueG=w.addGroup(17.8,30,'room');
    w.depth=0;drawHills(w);
    w.depth=2;drawSquare(w);drawVaillant(w);drawHotel(w);
    w.rect(-40,134,400,16,M.ROAD);w.rect(-40,133,400,1,M.CURB);
    for(let x=-32;x<360;x+=18)w.rect(x,142,9,1,M.LINE);
    for(const x of [10,185,350]){w.rect(x,96,1,30,M.FRAME);w.rect(x-4,95,8,1,M.FRAME);w.lightRect(x-3,96,6,1,N.LED_SOFT,w.venueG);}
    for(const x of [12,177,207,350]){w.rect(x,108,1,16,M.TIMBER_D);tree(w,x,104,7,10,rng(x+80));w.rect(x-5,122,11,3,M.PLANTER);}
    w.rect(60,107,1,15,M.FRAME);w.rect(72,107,1,15,M.FRAME);
    w.strata=[{x:-30,y:10,w:80,v:.55},{x:200,y:23,w:64,v:.4}];
    w.cat.x=194;w.cat.y=129;
    w.cars.push({x:30,lane:0,dir:1,kind:'sedan',len:25,speed:23,color:M.CAR_W},{x:260,lane:1,dir:-1,kind:'sedan',len:27,speed:19,color:M.CAR_B});
    for(const [x,y,dir,speed,style] of [[55,125,1,5,'suit'],[135,128,-1,4,'coat'],[238,124,1,5,'shirt'],[318,128,-1,4,'coat']])w.peds.push({x,y,dir,speed,style,phase:x%3});
    w.personStyles.coat=[M.BRAND_GREEN,M.SUIT,M.HAIR];
  };
  const draw=(w,dt,hour)=>{
    drawSky(w,dt,hour);
    // Campus flags sway over a clear strip of the forecourt.
    for(const x of [60,72])for(let dx=0;dx<7;dx++){
      const sy=108+Math.round(Math.sin(w.t*1.8+dx*.6)*.7);
      w.rect(x+dx,sy,1,4,dx<2?M.TRIM:M.BRAND_GREEN);
    }
    w.drawPeople(dt,hour);w.drawCat(dt,hour);w.drawTraffic(dt);
  };
  CitySwitch.define('remscheid-switch',{
    city:'Remscheid',label:'Remscheid day and night',tube:['#75bda0','#7bbbed'],body:['#e5e9e6','#101e25'],glass:'rain',
    sky:SKY,grade,palette,build,draw,
    glyphs:{W:['#...#','#...#','#.#.#','#.#.#','.#.#.']},
    street:(M)=>[M.PAVE,M.PAVE_D,M.STONE,M.STONE_D],
    weather:(h)=>{const rain=.25*smooth(19,20,h)*(1-smooth(28.5,30,h));return{rain,wet:rain*2,glass:rain};},
    post:(w,dt)=>{w.drawBeams();w.reflect();w.drawRain(dt);},startle:(w)=>{w.cat.puff=1.4;},
  });
})();
