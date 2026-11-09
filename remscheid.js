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
    mat('BRAND_GREEN','#00917e');
    mat('HI_GREEN','#5fa326');
    mat('SR_BLUE','#2450b4');
    mat('SR_TEAL','#45b9b2');
    mat('SR_GLASS','#1b2634');
    mat('GREYWACKE','#8a8474');
    mat('COPPER','#9cc3a6');
    mat('SPRUCE','#2c5247');
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
    mat('CLOUD_BASE','#b3c1c6',{[GOLD]:'#c59a8d',[DUSK]:'#6c5876',[NIGHT]:'#1b2b3a',[DAWN]:'#9a95a8'});
    neon('HI_LIME','#b4e04c','#8fd62a',.3);
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
  // Upright egg-shaped crowns, widest low and tapering up, lit from the upper left:
  // the young staked trees of the campus forecourt, and beech and oak on the ridge.
  const tree = (w, cx, cy, rw, rh, r) => {
    for (let y = -rh; y <= rh; y++) {
      const t = (y + rh) / (2 * rh), u = (t - .62) / (t < .62 ? .62 : .38);
      const half = Math.round(rw * Math.sqrt(1 - u * u) + (r() - .5) * 1.2);
      for (let x = -half; x <= half; x++) {
        const v = r();
        let m = v < .25 ? M.TREE_D : M.TREE;
        if (x > half * .3 || t > .78) m = v < .7 ? M.TREE_D : M.TREE;
        else if (x < 0 && t < .5) m = v < .6 ? M.TREE_L : M.TREE;
        w.px(cx + x, cy + y, m);
      }
    }
  };
  // Spruce stands still break the beech ridge with dark tiered points.
  const spruce = (w, cx, base, h) => {
    for (let j = 0; j < h; j++) {
      const half = Math.floor((j + (j % 3)) / 3);
      w.rect(cx - half, base - h + j, half * 2 + 1, 1, M.SPRUCE);
      if (half) w.px(cx - half, base - h + j, M.TREE_D);
    }
  };
  // A logo plate: each character maps to [material, light]; lit pixels share the venue group.
  const plate = (w, rows, x, y, map) => rows.forEach((row, j) => [...row].forEach((c, i) => {
    const p = map[c];
    if (p) p[1] ? w.tube(x + i, y + j, p[0], p[1], w.venueG) : w.px(x + i, y + j, p[0]);
  }));

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

  // Looking south over the Bergisches Land: a low sun climbs from behind the Vaillant roof and
  // sets behind the hotel, the moon follows it, and flat-based Atlantic cloud decks drift in
  // from the west (right to left).
  const drawSky = (w, dt, h) => {
    if (h < 18.5) {
      const t = clamp((h - 12) / 6.3), low = smooth(15.8, 17.6, h);
      w.sun(mix(224, 300, t), mix(18, 70, t * t), low > .3 ? 6 : 5, low);
    } else if (h > 29.3) {
      const t = clamp((h - 29.3) / 6.7), low = 1 - smooth(30.4, 32, h);
      w.sun(mix(34, 224, t), mix(18, 72, (1 - t) * (1 - t)), low > .3 ? 6 : 5, low);
    }
    if (h > 18.7 && h < 29.5) {
      const u = (h - 18.7) / 10.8;
      w.moon(mix(44, 276, u), 70 - 46 * Math.sin(u * Math.PI));
    }
    for (const c of w.decks) {
      c.x -= c.v * dt;
      if (c.x < -c.w - 42) c.x = 362;
      const cx = Math.round(c.x);
      for (let i = 0; i < c.w; i++) {
        const top = Math.round(c.h * Math.sqrt(Math.sin((i / c.w) * Math.PI)) * (.55 + .45 * Math.sin(i * c.k + c.w) ** 2));
        for (let j = 0; j <= top; j++) w.pxSky(cx + i, c.y - j, j === 0 ? M.CLOUD_BASE : j * 2 <= top ? M.CLOUD_SH : M.CLOUD);
      }
    }
  };

  // Stadtwerke Remscheid eCitaro in its e-bus livery: cobalt nose and body, tinted glazing,
  // a turquoise tail and wave along the skirt. It runs in the near lane, in front of the cars.
  const paintBus = (w, dt) => {
    const b = w.bus, L = 54, y = w.lanes[1], night = w.dark > .3;
    b.x += 19 * dt;
    if (b.x > 380) b.x = -250;
    const x = Math.round(b.x);
    w.rect(x + 2, y + 1, L - 3, 1, M.ROAD_D);
    w.rect(x, y - 13, L, 12, M.SR_BLUE);
    w.rect(x + 2, y - 14, L - 5, 1, M.TRIM);
    w.rect(x, y - 13, 24, 1, M.SR_TEAL);
    for (let i = 0; i < L; i++) {
      const wy = y - 5 + Math.round(Math.sin(i * .28) * 1.6);
      w.rect(x + i, wy, 1, i < 17 ? y - 1 - wy : 1, M.SR_TEAL);
    }
    w.rect(x + 2, y - 12, L - 4, 5, M.SR_GLASS);
    w.rect(x + L - 8, y - 12, 7, 6, M.SR_GLASS);
    for (const dx of [23, 44]) { w.rect(x + dx, y - 12, 7, 11, M.SR_GLASS); w.rect(x + dx + 3, y - 11, 1, 10, M.SR_BLUE); }
    w.rect(x + 1, y - 1, L - 2, 1, M.CAR_DK);
    for (const dx of [9, 37]) { w.rect(x + dx, y - 3, 5, 4, M.TIRE); w.px(x + dx + 2, y - 1, M.STONE_D); }
    w.px(x + L - 1, y - 4, M.CAR_W); w.px(x, y - 4, M.CAR_R);
    for (let i = 0; i < 6; i++) w.pxLight(x + L - 16 + i, y - 12, N.LED);
    if (!night) return;
    for (let i = 3; i < L - 2; i++) for (const dy of [11, 10]) w.pxLight(x + i, y - dy, N.FLUO);
    for (const dy of [4, 3]) { w.pxLight(x + L - 1, y - dy, N.HEAD); w.pxLight(x, y - dy, N.TAIL); }
    w.beams.push([x + L, y, 1]);
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

  const RATHAUS = [
    '....D....',
    '....D....',
    '...DDD...',
    '...WKW...',
    '...WWW...',
    '...DDD...',
    '..DDDDD..',
    '.DDDWDDD.',
    '.DDWDWDD.',
    '.GGWCWGG.',
    '.GGWCWGG.',
    'PGGGGGGGP',
    'LGGGKGGGL',
    'LLLLLLLLL',
  ];
  const drawHills = (w) => {
    // The Rathaus tower crowns the city ridge: greywacke shaft, corner turrets with copper caps,
    // a clock under a slate hood, a white lantern and a spire. The ridge hides its lower floors.
    w.rect(194,38,7,28,M.GREYWACKE);
    for(const y of [42,48,54])w.px(197,y,M.ROOF_D);
    plate(w,RATHAUS,193,24,{D:[M.ROOF_D],W:[M.TRIM],K:[M.ROOF_D],G:[M.GREYWACKE],P:[M.COPPER],L:[M.STONE],C:[M.PAINT_K,N.WARM]});
    const r=rng(28);
    for(let x=-40;x<360;x++){
      const top=Math.round(71+Math.sin(x*.024)*10+Math.sin(x*.061)*4);
      w.rect(x,top,1,118-top,M.HILL);
      if(x%28===14)spruce(w,x,top+6,13);
      else if(x%7===0)tree(w,x,top+1,5,7,r);
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
  // Vaillant mark: a black hare's head facing forward, ears breaking through a green egg outline.
  const HARE = [
    '..K.GGG.K..',
    '..KKWWWKK..',
    '.GKKWWWKKG.',
    '.GKKWWWKKG.',
    'GWWKKWKKWWG',
    'GWWKKKKKWWG',
    'GWWKWKWKWWG',
    'GWWKKKKKWWG',
    'GWKKWKWKKWG',
    '.GWKKWKKWG.',
    '.GWWKKKWWG.',
    '..GGWWWGG..',
    '....GGG....',
  ];
  // Holiday Inn mark: a slanted white H whose bar sweeps up to the right, on a green square.
  const HI_H = [
    '............',
    '........W...',
    '.....W..W...',
    '.....W..W..W',
    '.....W..WWW.',
    '.....WWWW...',
    '...WWW.W....',
    '.WW.W..W....',
    '....W..W....',
    '....W.W.....',
    '......W.....',
    '............',
  ];
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
    // The hare in its egg leads the name on one white fascia across the top band of the middle wing.
    // At night the egg is a white lightbox with a green rim, so the black hare stays readable.
    w.rect(91,77,74,11,M.WHITE_PANEL);
    w.hsign(110,77,50,11,'VAILLANT',{font:5,n:N.BRAND,g:w.venueG,board:M.WHITE_PANEL,off:M.BRAND_GREEN});
    plate(w,HARE,96,76,{G:[M.BRAND_GREEN,N.BRAND],K:[M.PAINT_K],W:[M.TRIM,N.LED_SOFT]});
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
    // The H badge leads the name so the right curve of the window never cuts it. As on the
    // building, the badge and "Holiday Inn" are lime green, "Express" is blue, and two blue
    // light strips run down the wall at night.
    plate(w,HI_H,227,66,{'.':[M.HI_GREEN,N.HI_LIME],W:[M.TRIM,N.LED_SOFT]});
    w.hsign(242,66,51,7,'HOLIDAY INN',{n:N.HI_LIME,g:w.venueG,board:M.HOTEL_PANEL,off:M.HI_GREEN});
    for(const bx of [231,296])w.lightRect(bx,81,2,24,N.B_BLUE,w.venueG);
    w.hsign(263,73,30,6,'EXPRESS',{n:N.BLUE_SIGN,g:w.venueG,board:M.HOTEL_PANEL,off:M.HOTEL_BLUE});
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
    for(const x of [10,212,350]){w.rect(x,96,1,30,M.FRAME);w.rect(x-4,95,8,1,M.FRAME);w.lightRect(x-3,96,6,1,N.LED_SOFT,w.venueG);}
    for(const x of [12,177,203,350]){
      w.rect(x,108,1,16,M.TIMBER_D);tree(w,x,104,7,10,rng(x+80));
      for(const dx of [-2,2])w.rect(x+dx,116,1,7,M.WOOD_LT);
      w.rect(x-5,122,11,3,M.PLANTER);
    }
    w.rect(60,107,1,15,M.FRAME);w.rect(72,107,1,15,M.FRAME);
    w.decks=[{x:18,y:17,w:92,h:7,k:.13,v:2.6},{x:262,y:11,w:70,h:6,k:.17,v:2.1},{x:128,y:37,w:56,h:4,k:.21,v:1.6},{x:330,y:43,w:44,h:4,k:.24,v:1.4}];
    w.cat.x=194;w.cat.y=129;
    // Right-hand traffic: the far lane runs left; the near lane, which the bus uses, runs right.
    // ponytail: both cars share the far lane at one speed, so they never catch up; the engine's
    // random respawn offset can still drift them together over a very long session.
    w.cars.push({x:40,lane:0,dir:-1,kind:'sedan',len:25,speed:21,color:M.CAR_W},{x:270,lane:0,dir:-1,kind:'sedan',len:27,speed:21,color:M.CAR_B});
    w.bus={x:-120};
    Object.assign(w.personStyles,{coat:[M.BRAND_GREEN,M.SUIT,M.HAIR],rain:[M.BOARD_Y,M.SUIT,M.HAIR],parka:[M.SR_BLUE,M.PAINT_K,M.WOOD_DK],grey:[M.GREY_DK,M.SUIT,M.GREY]});
    for(const [x,y,dir,speed,style,nightOnly] of [[55,125,1,5,'suit'],[135,128,-1,4,'coat'],[238,124,1,5,'shirt'],[318,128,-1,4,'coat'],[96,126,1,6,'rain'],[206,127,-1,5,'parka',true],[282,126,1,4,'grey',true],[24,127,-1,6,'rain',true]])w.peds.push({x,y,dir,speed,style,nightOnly,phase:x%3});
  };
  const draw=(w,dt,hour)=>{
    drawSky(w,dt,hour);
    // Campus flags sway over a clear strip of the forecourt.
    for(const x of [60,72])for(let dx=0;dx<7;dx++){
      const sy=108+Math.round(Math.sin(w.t*1.8+dx*.6)*.7);
      w.rect(x+dx,sy,1,4,dx<2?M.TRIM:M.BRAND_GREEN);
    }
    w.drawPeople(dt,hour);w.drawCat(dt,hour);w.drawTraffic(dt);paintBus(w,dt);
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
