(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);

  const SKINS = [
    {id:'neon', name:'Neón', color:'#00e5ff', price:0},
    {id:'lava', name:'Lava', color:'#ff3d00', price:120},
    {id:'gold', name:'Oro', color:'#ffd54f', price:200},
    {id:'plasma', name:'Plasma', color:'#b388ff', price:250},
    {id:'forest', name:'Bosque', color:'#00e676', price:300},
  ];

  const saveKey = 'bola_loca_web_alpha_07';
  const defaultSave = {best:0, coins:0, xp:0, level:1, equipped:'neon', unlocked:['neon'], runs:0, dodgedTotal:0};
  let save = loadSave();

  let W = 0, H = 0, DPR = 1;
  let state = 'menu';
  let last = performance.now();
  let pointer = {active:false, x:0, y:0};
  let keys = new Set();
  let shake = 0;

  const game = {
    t:0, score:0, mult:1, combo:0, ai:1, speed:260, spawn:0, bonusSpawn:4,
    dodged:0, bonuses:0, coinsEarned:0, xpEarned:0, paused:false,
    player:{x:0,y:0,r:18,vx:0,vy:0,shield:0},
    obstacles:[], bonusesList:[], particles:[], stars:[]
  };

  function loadSave(){
    try { return {...defaultSave, ...JSON.parse(localStorage.getItem(saveKey)||'{}')}; } catch { return {...defaultSave}; }
  }
  function storeSave(){ localStorage.setItem(saveKey, JSON.stringify(save)); updateMenuStats(); }
  function resize(){
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.floor(W*DPR); canvas.height = Math.floor(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    if(!game.stars.length) for(let i=0;i<90;i++) game.stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+0.4,v:20+Math.random()*60});
  }
  addEventListener('resize', resize); resize();

  function show(id){ ['menu','skins','gameover'].forEach(s=>$(s).classList.toggle('visible', s===id)); }
  function hud(on){ $('hud').classList.toggle('hidden', !on); $('pauseBtn').classList.toggle('hidden', !on); }
  function toast(msg){ const el=$('toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),1600); }
  function updateMenuStats(){ $('bestMenu').textContent=save.best; $('coinsMenu').textContent=save.coins; $('levelMenu').textContent=save.level; }

  function start(){
    state='playing'; show(''); hud(true);
    Object.assign(game,{t:0,score:0,mult:1,combo:0,ai:1,speed:260,spawn:.6,bonusSpawn:3.5,dodged:0,bonuses:0,coinsEarned:0,xpEarned:0,paused:false,obstacles:[],bonusesList:[],particles:[]});
    game.player = {x:W*.25, y:H*.5, r:18, vx:0, vy:0, shield:0};
  }

  function endRun(){
    if(state!=='playing') return;
    state='gameover'; hud(false); show('gameover');
    const score = Math.floor(game.score);
    const coins = Math.floor(score/90) + game.bonuses*8 + Math.floor(game.dodged/12);
    const xp = Math.floor(score/60) + game.dodged*2;
    save.best = Math.max(save.best, score); save.coins += coins; save.xp += xp; save.runs++; save.dodgedTotal += game.dodged;
    while(save.xp >= 100 + save.level*45){ save.xp -= 100 + save.level*45; save.level++; save.coins += 50; toast('¡Nivel '+save.level+'!'); }
    storeSave();
    $('finalScore').textContent=score; $('bestScore').textContent=save.best; $('finalDodged').textContent=game.dodged; $('finalCoins').textContent=coins; $('finalXp').textContent=xp;
  }

  function director(){
    const pressure = game.t/18 + game.score/700 + game.dodged/25;
    game.ai = Math.max(1, Math.min(9, Math.floor(1+pressure)));
    game.speed = 245 + game.ai*28 + game.t*1.2;
    return Math.max(.42, 1.12 - game.ai*.055 - game.t*.003);
  }

  function spawnObstacle(){
    const types = game.ai < 3 ? ['block'] : game.ai < 6 ? ['block','bar','zig'] : ['block','bar','zig','laser'];
    const type = types[Math.floor(Math.random()*types.length)];
    let h = 34 + Math.random()*58, y = 30 + Math.random()*(H-60);
    if(Math.abs(y - game.player.y) < 70) y = game.player.y < H/2 ? game.player.y+120 : game.player.y-120;
    game.obstacles.push({type,x:W+50,y,w:type==='laser'?18:32+Math.random()*28,h,vy:type==='zig'?(Math.random()<.5?-80:80):0,rot:0,passed:false,warn:type==='laser'?0.75:0});
  }
  function spawnBonus(){
    game.bonusesList.push({x:W+40,y:45+Math.random()*(H-90),r:13,type:Math.random()<.65?'coin':'shield',phase:0});
  }

  function update(dt){
    for(const s of game.stars){ s.x -= s.v*dt*(state==='playing'?.8:.25); if(s.x<0){s.x=W;s.y=Math.random()*H;} }
    if(state!=='playing' || game.paused) return;
    game.t += dt; game.score += dt * (12 + game.ai*2) * game.mult;
    game.spawn -= dt; if(game.spawn<=0){ spawnObstacle(); game.spawn = director(); }
    game.bonusSpawn -= dt; if(game.bonusSpawn<=0){ spawnBonus(); game.bonusSpawn = 4.5 + Math.random()*3.5 - game.ai*.12; }
    const p = game.player; if(p.shield>0) p.shield-=dt;
    let targetX=p.x, targetY=p.y;
    if(pointer.active){ targetX=pointer.x; targetY=pointer.y; }
    let ax=0, ay=0; if(keys.has('ArrowUp')||keys.has('w')) ay-=1; if(keys.has('ArrowDown')||keys.has('s')) ay+=1; if(keys.has('ArrowLeft')||keys.has('a')) ax-=1; if(keys.has('ArrowRight')||keys.has('d')) ax+=1;
    if(ax||ay){ targetX=p.x+ax*140; targetY=p.y+ay*140; }
    p.vx += (targetX-p.x)*14*dt; p.vy += (targetY-p.y)*14*dt; p.vx*=Math.pow(.04,dt); p.vy*=Math.pow(.04,dt); p.x+=p.vx*dt; p.y+=p.vy*dt;
    p.x=Math.max(p.r,Math.min(W-p.r,p.x)); p.y=Math.max(p.r,Math.min(H-p.r,p.y));

    for(const o of game.obstacles){
      o.x -= game.speed*dt; o.y += o.vy*dt; if(o.y<30||o.y>H-30) o.vy*=-1; o.rot += dt*3;
      if(!o.passed && o.x+o.w < p.x-p.r){ o.passed=true; game.dodged++; game.combo++; if(game.combo%10===0) game.mult=Math.min(8,game.mult+1); burst(p.x,p.y,save.equipped,8); }
      if(o.warn>0){ o.warn-=dt; continue; }
      if(circleRect(p.x,p.y,p.r,o.x-o.w/2,o.y-o.h/2,o.w,o.h)){
        if(p.shield>0){ p.shield=0; o.x=-100; shake=.28; burst(p.x,p.y,'gold',22); }
        else { shake=.45; burst(p.x,p.y,'lava',34); endRun(); }
      }
    }
    game.obstacles = game.obstacles.filter(o=>o.x>-120);

    for(const b of game.bonusesList){
      b.x -= (game.speed*.72)*dt; b.phase += dt;
      const d = Math.hypot(b.x-p.x,b.y-p.y); if(d < b.r+p.r){
        if(b.type==='coin'){ game.coinsEarned+=5; game.score+=75*game.mult; }
        else { p.shield=5; }
        b.x=-100; game.bonuses++; burst(p.x,p.y,b.type==='coin'?'gold':'plasma',18);
      }
    }
    game.bonusesList = game.bonusesList.filter(b=>b.x>-80);
    for(const part of game.particles){ part.life-=dt; part.x+=part.vx*dt; part.y+=part.vy*dt; part.vx*=.98; part.vy*=.98; }
    game.particles = game.particles.filter(p=>p.life>0);
    if(shake>0) shake-=dt;
    updateHud();
  }

  function skinColor(id){ return (SKINS.find(s=>s.id===id)||SKINS[0]).color; }
  function burst(x,y,skin,n){ const c=skinColor(skin); for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, sp=70+Math.random()*220; game.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.35+Math.random()*.45,c}); } }
  function circleRect(cx,cy,r,rx,ry,rw,rh){ const x=Math.max(rx,Math.min(cx,rx+rw)), y=Math.max(ry,Math.min(cy,ry+rh)); return Math.hypot(cx-x,cy-y)<r; }

  function render(){
    const sx = shake>0 ? (Math.random()-.5)*shake*18 : 0, sy = shake>0 ? (Math.random()-.5)*shake*18 : 0;
    ctx.save(); ctx.clearRect(0,0,W,H); ctx.translate(sx,sy);
    const g=ctx.createRadialGradient(W*.5,H*.25,0,W*.5,H*.5,Math.max(W,H)); g.addColorStop(0,'#202064'); g.addColorStop(.55,'#080816'); g.addColorStop(1,'#020207'); ctx.fillStyle=g; ctx.fillRect(-20,-20,W+40,H+40);
    for(const s of game.stars){ ctx.globalAlpha=.35; ctx.fillStyle='#dfe7ff'; ctx.beginPath(); ctx.arc(s.x,s.y,s.s,0,Math.PI*2); ctx.fill(); }
    ctx.globalAlpha=1;
    if(state==='playing'){
      for(const b of game.bonusesList){ ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.phase*2); ctx.strokeStyle=b.type==='coin'?'#ffd54f':'#b388ff'; ctx.lineWidth=4; ctx.shadowBlur=18; ctx.shadowColor=ctx.strokeStyle; ctx.beginPath(); ctx.arc(0,0,b.r+Math.sin(b.phase*5)*2,0,Math.PI*2); ctx.stroke(); ctx.restore(); }
      for(const o of game.obstacles){ ctx.save(); ctx.translate(o.x,o.y); ctx.rotate(o.type==='bar'?o.rot:0); ctx.globalAlpha=o.warn>0 ? .35+Math.sin(performance.now()/80)*.25 : 1; ctx.fillStyle=o.type==='laser'?'#ff1744':o.type==='zig'?'#ff9100':'#ff3d71'; ctx.shadowBlur=18; ctx.shadowColor=ctx.fillStyle; roundRect(-o.w/2,-o.h/2,o.w,o.h,8); ctx.fill(); ctx.restore(); }
      const p=game.player, c=skinColor(save.equipped); ctx.shadowBlur=28; ctx.shadowColor=c; ctx.fillStyle=c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0; ctx.fillStyle='rgba(255,255,255,.88)'; ctx.beginPath(); ctx.arc(p.x-6,p.y-6,5,0,Math.PI*2); ctx.fill(); if(p.shield>0){ ctx.strokeStyle='#b388ff'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(p.x,p.y,p.r+8+Math.sin(game.t*8)*2,0,Math.PI*2); ctx.stroke(); }
      for(const part of game.particles){ ctx.globalAlpha=Math.max(0,part.life*1.8); ctx.fillStyle=part.c; ctx.beginPath(); ctx.arc(part.x,part.y,3.2,0,Math.PI*2); ctx.fill(); } ctx.globalAlpha=1;
      if(game.paused){ ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='white'; ctx.font='800 38px system-ui'; ctx.textAlign='center'; ctx.fillText('Pausa',W/2,H/2); }
    }
    ctx.restore(); requestAnimationFrame(loop);
  }
  function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function updateHud(){ $('scoreHud').textContent=Math.floor(game.score); $('multHud').textContent=game.mult; $('aiHud').textContent=game.ai; $('bestHud').textContent=save.best; }
  function loop(now){ const dt=Math.min(.033,(now-last)/1000||0); last=now; update(dt); renderFrameQueued=false; }
  let renderFrameQueued=false; function mainLoop(now){ const dt=Math.min(.033,(now-last)/1000||0); last=now; update(dt); render(); }

  function renderSkins(){
    $('skinGrid').innerHTML='';
    for(const skin of SKINS){
      const unlocked = save.unlocked.includes(skin.id), equipped = save.equipped===skin.id;
      const div=document.createElement('div'); div.className='skin'+(unlocked?'':' locked'); div.innerHTML=`<div class="skinOrb" style="color:${skin.color};background:${skin.color}"></div><b>${skin.name}</b><small>${equipped?'Equipada':unlocked?'Tocar para equipar':skin.price+' monedas'}</small>`;
      div.onclick=()=>{ if(unlocked){ save.equipped=skin.id; storeSave(); renderSkins(); toast('Skin equipada'); } else if(save.coins>=skin.price){ save.coins-=skin.price; save.unlocked.push(skin.id); save.equipped=skin.id; storeSave(); renderSkins(); toast('Skin desbloqueada'); } else toast('Faltan monedas'); };
      $('skinGrid').appendChild(div);
    }
  }

  canvas.addEventListener('pointerdown',e=>{ pointer.active=true; pointer.x=e.clientX; pointer.y=e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove',e=>{ pointer.x=e.clientX; pointer.y=e.clientY; });
  canvas.addEventListener('pointerup',()=>{ pointer.active=false; }); canvas.addEventListener('pointercancel',()=>{ pointer.active=false; });
  addEventListener('keydown',e=>{ keys.add(e.key); if(e.key===' ' && state==='playing') game.paused=!game.paused; }); addEventListener('keyup',e=>keys.delete(e.key));
  $('playBtn').onclick=start; $('retryBtn').onclick=start; $('homeBtn').onclick=()=>{state='menu';show('menu');hud(false);}; $('skinsBtn').onclick=()=>{renderSkins();show('skins');}; $('backFromSkins').onclick=()=>show('menu'); $('pauseBtn').onclick=()=>{ if(state==='playing') game.paused=!game.paused; }; $('resetBtn').onclick=()=>{ if(confirm('¿Reiniciar progreso?')){ save={...defaultSave}; storeSave(); toast('Progreso reiniciado'); }};
  updateMenuStats(); show('menu'); hud(false); requestAnimationFrame(mainLoop);
})();
