'use strict';
const $=s=>document.querySelector(s); const canvas=$('#game'),ctx=canvas.getContext('2d');
const menu=$('#menu'),hud=$('#hud'),gameOver=$('#gameOver'),modal=$('#modal'),modalContent=$('#modalContent');
const scoreEl=$('#score'),levelEl=$('#level'),prestigeEl=$('#prestige'),coinsEl=$('#coins'),multiEl=$('#multi'),nameInput=$('#playerName'),statusEl=$('#connectionStatus');
let W=0,H=0,DPR=1,state='menu',last=0,score=0,level=1,runCoins=0,totalCoins=Number(localStorage.getItem('cb_coins')||300),lives=3;
let prestige=Number(localStorage.getItem('cb_prestige')||0), highestLevel=Number(localStorage.getItem('cb_highest_level')||1), rewardedPrestige=Number(localStorage.getItem('cb_rewarded_prestige')||0);
let gameMode=localStorage.getItem('cb_mode')||'classic';
let inventory=JSON.parse(localStorage.getItem('cb_inventory')||'{"shield":1,"magnet":1,"gold":1,"slow":0,"double":0,"ghost":0,"vacuum":0,"freeze":0}');
let obstacles=[],pickups=[],particles=[],stars=[],spawnO=0,spawnP=0,spawnMeteor=0,shake=0,flash=0,power={type:'',time:0},multiplier=1,multiTime=0;
let speedRush=1,speedRushTime=0,nextRush=240,rushLabel='';
let selectedSkin=localStorage.getItem('cb_skin')||'neon'; let owned=JSON.parse(localStorage.getItem('cb_owned')||'["neon"]');
let playerName=localStorage.getItem('cb_name')||''; nameInput.value=playerName;
let missions=JSON.parse(localStorage.getItem('cb_missions')||'{"coins":25,"meteors":5,"dodged":50}');
const ball={x:0,y:0,targetX:0,targetY:0,r:22,trail:[]};
const skins=[
 {id:'neon',name:'Neón azul',cat:'Originales',price:0,c1:'#ffffff',c2:'#22d3ee',c3:'#4f46e5'},
 {id:'fire',name:'Fuego extremo',cat:'Originales',price:180,c1:'#fff7ad',c2:'#fb923c',c3:'#b91c1c'},
 {id:'gold',name:'Oro campeón',cat:'Originales',price:320,c1:'#fffbd1',c2:'#facc15',c3:'#a16207'},
 {id:'forest',name:'Bosque',cat:'Originales',price:230,c1:'#ecfccb',c2:'#22c55e',c3:'#14532d'},
 {id:'galaxy',name:'Galaxia',cat:'Originales',price:500,c1:'#f5d0fe',c2:'#a855f7',c3:'#312e81'},
 {id:'ice',name:'Hielo',cat:'Originales',price:260,c1:'#ffffff',c2:'#7dd3fc',c3:'#075985'},
 {id:'lava',name:'Lava',cat:'Originales',price:420,c1:'#fff7ed',c2:'#f97316',c3:'#7f1d1d'},
 {id:'shadow',name:'Sombra',cat:'Originales',price:550,c1:'#94a3b8',c2:'#334155',c3:'#020617'},
 {id:'football',name:'Balón clásico',cat:'Fútbol',price:420,c1:'#ffffff',c2:'#d1d5db',c3:'#111827'},
 {id:'redclub',name:'Club rojo',cat:'Fútbol',price:520,c1:'#ffffff',c2:'#ef4444',c3:'#7f1d1d'},
 {id:'blueclub',name:'Club azul',cat:'Fútbol',price:520,c1:'#ffffff',c2:'#3b82f6',c3:'#172554'},
 {id:'greenclub',name:'Club verde',cat:'Fútbol',price:520,c1:'#f0fdf4',c2:'#22c55e',c3:'#14532d'},
 {id:'yellowclub',name:'Club amarillo',cat:'Fútbol',price:520,c1:'#fff',c2:'#facc15',c3:'#854d0e'},
 {id:'royalclub',name:'Club real',cat:'Fútbol',price:700,c1:'#fff',c2:'#e5e7eb',c3:'#7c3aed'},
 {id:'nightkeeper',name:'Guardián nocturno',cat:'Héroes',price:780,c1:'#cbd5e1',c2:'#1e3a8a',c3:'#020617'},
 {id:'solarhero',name:'Héroe solar',cat:'Héroes',price:780,c1:'#fff7ad',c2:'#ef4444',c3:'#1d4ed8'},
 {id:'webhero',name:'Héroe arácnido',cat:'Héroes',price:850,c1:'#ffffff',c2:'#dc2626',c3:'#1e3a8a'},
 {id:'ironhero',name:'Armadura carmesí',cat:'Héroes',price:900,c1:'#fde68a',c2:'#dc2626',c3:'#7f1d1d'},
 {id:'stormhero',name:'Guardián del trueno',cat:'Héroes',price:950,c1:'#ffffff',c2:'#60a5fa',c3:'#312e81'},
 {id:'sparkmouse',name:'Ratón eléctrico',cat:'Criaturas',price:760,c1:'#fff7ad',c2:'#facc15',c3:'#92400e'},
 {id:'firelizard',name:'Lagarto de fuego',cat:'Criaturas',price:760,c1:'#ffedd5',c2:'#f97316',c3:'#9a3412'},
 {id:'waterbeast',name:'Bestia acuática',cat:'Criaturas',price:760,c1:'#e0f2fe',c2:'#0ea5e9',c3:'#164e63'},
 {id:'leafbeast',name:'Criatura hoja',cat:'Criaturas',price:760,c1:'#ecfccb',c2:'#65a30d',c3:'#365314'},
 {id:'psychic',name:'Criatura psíquica',cat:'Criaturas',price:980,c1:'#fae8ff',c2:'#d946ef',c3:'#581c87'},
 {id:'dragon',name:'Dragón celeste',cat:'Criaturas',price:1200,c1:'#e0f2fe',c2:'#38bdf8',c3:'#1e3a8a'},
 {id:'blaugrana',name:'Club azulgrana',cat:'Fútbol',price:850,c1:'#fbbf24',c2:'#dc2626',c3:'#1e3a8a'},
 {id:'merengue',name:'Club blanco dorado',cat:'Fútbol',price:900,c1:'#ffffff',c2:'#e5e7eb',c3:'#d4af37'},
 {id:'rojiblanco',name:'Club rojiblanco',cat:'Fútbol',price:820,c1:'#ffffff',c2:'#ef4444',c3:'#172554'},
 {id:'citizens',name:'Club celeste',cat:'Fútbol',price:800,c1:'#f8fafc',c2:'#7dd3fc',c3:'#1d4ed8'},
 {id:'aurinegro',name:'Club aurinegro',cat:'Fútbol',price:780,c1:'#fef3c7',c2:'#facc15',c3:'#111827'},
 {id:'thunderpet',name:'Mascota del trueno',cat:'Criaturas',price:980,c1:'#fff7ad',c2:'#fde047',c3:'#7c2d12'},
 {id:'embercub',name:'Cachorro de brasa',cat:'Criaturas',price:980,c1:'#ffedd5',c2:'#fb923c',c3:'#991b1b'},
 {id:'tideturtle',name:'Tortuga de marea',cat:'Criaturas',price:980,c1:'#e0f2fe',c2:'#38bdf8',c3:'#164e63'},
 {id:'vinebeast',name:'Bestia de lianas',cat:'Criaturas',price:980,c1:'#ecfccb',c2:'#84cc16',c3:'#14532d'},
 {id:'cosmicmind',name:'Mente cósmica',cat:'Criaturas',price:1250,c1:'#fae8ff',c2:'#c084fc',c3:'#4c1d95'},
 {id:'capedguardian',name:'Guardián de capa',cat:'Héroes',price:1100,c1:'#f8fafc',c2:'#2563eb',c3:'#991b1b'},
 {id:'steelavenger',name:'Vengador de acero',cat:'Héroes',price:1150,c1:'#fde68a',c2:'#dc2626',c3:'#450a0a'},
 {id:'nightweb',name:'Sombra arácnida',cat:'Héroes',price:1120,c1:'#f8fafc',c2:'#ef4444',c3:'#172554'},
 {id:'emeraldgiant',name:'Gigante esmeralda',cat:'Héroes',price:1180,c1:'#dcfce7',c2:'#22c55e',c3:'#3b0764'},
 {id:'rainbow',name:'Arcoíris dinámico',cat:'Especiales',price:1500,c1:'#ffffff',c2:'#f472b6',c3:'#4f46e5'},
 {id:'plasma',name:'Plasma vivo',cat:'Especiales',price:1650,c1:'#ecfeff',c2:'#22d3ee',c3:'#c026d3'},
 {id:'void',name:'Vacío estelar',cat:'Especiales',price:1800,c1:'#c4b5fd',c2:'#312e81',c3:'#000000'}
];
const cfg=window.CRAZY_BALL_CONFIG||{}; let supabaseClient=null,online=false,channel=null;
try{if(cfg.supabaseUrl&&cfg.supabaseAnonKey&&window.supabase){supabaseClient=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);online=true;statusEl.textContent='Online conectado';}}catch(e){console.warn(e)}
const bc='BroadcastChannel' in window?new BroadcastChannel('crazy-ball-online'):null;
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);if(state!=='play'){ball.x=ball.targetX=W/2;ball.y=ball.targetY=H*.72}if(!stars.length)for(let i=0;i<80;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.3,v:Math.random()*.6+.15})}
addEventListener('resize',resize,{passive:true});resize();
function clamp(v,a,b){return Math.max(a,Math.min(b,v))} function rnd(a,b){return Math.random()*(b-a)+a} function choice(a){return a[Math.floor(Math.random()*a.length)]} function hit(a,b,extra=0){return Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r+extra}
function safeName(){return (nameInput.value.trim()||'Jugador').replace(/[<>]/g,'').slice(0,18)}
function saveProfile(){playerName=safeName();localStorage.setItem('cb_name',playerName)}
async function start(){saveProfile();await startMusic(true);state='play';menu.classList.add('hidden');gameOver.classList.add('hidden');modal.classList.add('hidden');hud.classList.remove('hidden');score=0;level=1;runCoins=0;lives=gameMode==='survival'?1:3;obstacles=[];pickups=[];particles=[];spawnO=0;spawnP=0;spawnMeteor=55;power={type:'',time:0};multiplier=1;multiTime=0;speedRush=1;speedRushTime=0;nextRush=rnd(180,360);rushLabel='';applyStartingPower();ball.r=clamp(W*.055,19,27);ball.x=ball.targetX=W/2;ball.y=ball.targetY=H*.76;ball.trail=[];last=performance.now();updateHud()}
function end(){state='over';hud.classList.add('hidden');gameOver.classList.remove('hidden');const final=Math.floor(score);$('#finalScore').textContent=`${final} puntos · nivel ${level} · ${runCoins} monedas`;$('#rankMessage').textContent='Puntuación guardada en el ranking.';highestLevel=Math.max(highestLevel,level);localStorage.setItem('cb_highest_level',highestLevel);const newPrestige=Math.floor(highestLevel/10);if(newPrestige>rewardedPrestige){const gained=(newPrestige-rewardedPrestige)*1000;totalCoins+=gained;rewardedPrestige=newPrestige;prestige=newPrestige;localStorage.setItem('cb_rewarded_prestige',rewardedPrestige);localStorage.setItem('cb_prestige',prestige);$('#rankMessage').textContent=`¡Prestigio ${prestige}! Premio: ${gained} monedas.`}totalCoins+=runCoins;localStorage.setItem('cb_coins',totalCoins);submitScore(final,level)}
function setTarget(x,y){if(state!=='play')return;ball.targetX=clamp(x,ball.r,W-ball.r);ball.targetY=clamp(y,105,H-ball.r-10)}
// Control tactil v2: en movil la bola siempre queda por encima del dedo.
// Así permanece visible incluso durante movimientos rápidos o toques largos.
let activePointer=null;
const TOUCH_OFFSET=110;
function moveFromPointer(e){
 if(e.pointerType==='touch'){
   setTarget(e.clientX,e.clientY-TOUCH_OFFSET);
 }else{
   setTarget(e.clientX,e.clientY);
 }
}
canvas.addEventListener('pointerdown',e=>{
 if(state!=='play')return;
 activePointer=e.pointerId;
 canvas.setPointerCapture?.(e.pointerId);
 moveFromPointer(e);
 e.preventDefault();
},{passive:false});
canvas.addEventListener('pointermove',e=>{
 if(state!=='play'||activePointer!==e.pointerId)return;
 moveFromPointer(e);
 e.preventDefault();
},{passive:false});
function releasePointer(e){if(activePointer===e.pointerId)activePointer=null}
canvas.addEventListener('pointerup',releasePointer,{passive:false});
canvas.addEventListener('pointercancel',releasePointer,{passive:false});
canvas.addEventListener('lostpointercapture',releasePointer);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});
canvas.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
function spawnObstacle(){const type=choice(['rock','spike','crate','meteor','satellite','mine','laser','portal','comet']);const r=rnd(19,35)+Math.min(level*.35,10);const modeSpeed=gameMode==='survival'?1.35:gameMode==='meteor'?1.18:1;obstacles.push({x:rnd(r,W-r),y:-55,r,vy:(rnd(2.3,3.9)+level*.23)*modeSpeed,type,rot:rnd(0,7),spin:rnd(-.05,.05),phase:rnd(0,7),passed:false})}
function spawnPickup(){const roll=Math.random();let type;if(gameMode==='coins')type=roll<.72?'coin':roll<.79?'multi':roll<.86?'magnet':roll<.92?'double':roll<.96?'shield':'vacuum';else if(gameMode==='meteor')type=roll<.34?'coin':roll<.72?'multi':roll<.79?'shield':roll<.86?'magnet':roll<.92?'gold':roll<.96?'ghost':'freeze';else type=roll<.48?'coin':roll<.61?'multi':roll<.68?'shield':roll<.75?'magnet':roll<.82?'gold':roll<.88?'slow':roll<.93?'double':roll<.96?'ghost':roll<.98?'vacuum':'freeze';pickups.push({x:rnd(25,W-25),y:-35,r:type==='coin'?11:17,vy:rnd(2.2,3.3)+level*.08,type,rot:0,value:type==='multi'?choice([2,2,3,3,4,5,5,8,10,15,20]):1})}
function spawnRandomMeteor(){pickups.push({x:rnd(30,W-30),y:-40,r:20,vy:rnd(2.5,4.2)+level*.1,type:'multi',rot:rnd(0,7),value:choice([2,2,2,3,3,5,5,10,20]),meteor:true})}
function burst(x,y,color,n=18,power=4){for(let i=0;i<n;i++){const a=rnd(0,Math.PI*2),s=rnd(1,power);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(20,48),max:48,r:rnd(2,5),color})}}
function toast(txt){const t=$('#toast');t.textContent=txt;t.classList.add('show');clearTimeout(toast._id);toast._id=setTimeout(()=>t.classList.remove('show'),900)}
function activate(type,value=1){if(type==='multi'){multiplier=value;multiTime=520;toast(`METEORITO x${value}`)}else{power.type=type;power.time=type==='shield'?660:type==='gold'?540:type==='magnet'?720:type==='slow'?480:type==='double'?600:type==='ghost'?480:type==='vacuum'?660:type==='freeze'?300:420;const labels={shield:'ESCUDO',gold:'SÚPER BOLA',magnet:'IMÁN',slow:'TIEMPO LENTO',double:'MONEDAS x2',ghost:'MODO FANTASMA',vacuum:'SÚPER IMÁN',freeze:'CONGELACIÓN'};toast(labels[type]||'VENTAJA')}flash=1;burst(ball.x,ball.y,type==='gold'?'#facc15':'#67e8f9',30,7)}
function updateHud(){scoreEl.textContent=Math.floor(score);levelEl.textContent=level;prestigeEl.textContent=prestige;coinsEl.textContent=runCoins;multiEl.textContent='x'+multiplier}
function update(dt){if(state!=='play')return;const f=Math.min(2,dt/16.67);const timeFactor=(power.type==='slow'?.62:power.type==='freeze'?.18:1)*speedRush;score+=.12*f*multiplier*(gameMode==='survival'?1.35:1);const oldLevel=level;level=1+Math.floor(score/220);if(level!==oldLevel)toast(`NIVEL ${level}`);ball.x+=(ball.targetX-ball.x)*Math.min(.28*f,1);ball.y+=(ball.targetY-ball.y)*Math.min(.28*f,1);ball.trail.push({x:ball.x,y:ball.y});if(ball.trail.length>12)ball.trail.shift();spawnO-=f;spawnP-=f;spawnMeteor-=f;nextRush-=f;if(nextRush<=0&&speedRushTime<=0){speedRush=choice([1.25,1.4,1.6,1.85]);speedRushTime=rnd(150,280);rushLabel=`TURBO x${speedRush.toFixed(2)}`;toast(rushLabel);flash=.45;nextRush=rnd(300,620)}if(speedRushTime>0){speedRushTime-=f;if(speedRushTime<=0){speedRush=1;rushLabel='';toast('VELOCIDAD NORMAL')}}if(spawnO<=0){spawnObstacle();spawnO=(Math.max(12,58-level*2.6)+rnd(0,15))*(gameMode==='survival'?.72:gameMode==='meteor'?.82:1)}if(spawnP<=0){spawnPickup();spawnP=rnd(gameMode==='coins'?13:24,gameMode==='coins'?26:45)}if(spawnMeteor<=0){spawnRandomMeteor();spawnMeteor=rnd(95,180)}
 if(power.time>0){power.time-=f;if(power.time<=0)power={type:'',time:0}}if(multiTime>0){multiTime-=f;if(multiTime<=0){multiplier=1;toast('x1')}}
 for(const o of obstacles){o.y+=o.vy*f*timeFactor;o.rot+=o.spin*f;o.phase+=.04*f;if(o.type==='satellite')o.x+=Math.sin(o.phase)*1.2*f;if(o.type==='laser')o.x+=Math.sin(o.phase)*2.2*f;if(o.y>H+60){o.dead=true;if(!o.passed){o.passed=true;missions.dodged=Math.max(0,missions.dodged-1)}}if(hit(ball,o,-3)){if(power.type==='shield'||power.type==='gold'||power.type==='ghost'){o.dead=true;burst(o.x,o.y,'#fff',22,6);shake=7;score+=20*multiplier}else{lives--;o.dead=true;shake=12;flash=.7;burst(ball.x,ball.y,'#fb7185',30,7);if(lives<=0){saveMissions();end();return}}}}
 for(const p of pickups){if((power.type==='magnet'||power.type==='vacuum')&&p.type==='coin'){const dx=ball.x-p.x,dy=ball.y-p.y,d=Math.max(1,Math.hypot(dx,dy));const range=power.type==='vacuum'?420:210;if(d<range){const pull=power.type==='vacuum'?13:8;p.x+=dx/d*pull*f;p.y+=dy/d*pull*f}}p.y+=p.vy*f*timeFactor;p.rot+=.05*f;if(p.y>H+45)p.dead=true;if(hit(ball,p,2)){p.dead=true;if(p.type==='coin'){const baseCoin=Math.random()<.12?5:Math.random()<.32?2:1;const coinGain=(power.type==='double'?2:1)*baseCoin;runCoins+=coinGain;score+=12*multiplier*coinGain;missions.coins=Math.max(0,missions.coins-1);toast('+ MONEDA')}else if(p.type==='multi'){activate('multi',p.value);score+=25*p.value;missions.meteors=Math.max(0,missions.meteors-1)}else activate(p.type);burst(p.x,p.y,p.type==='coin'?'#fde047':'#86efac',20,5)}}
 obstacles=obstacles.filter(o=>!o.dead);pickups=pickups.filter(p=>!p.dead);for(const p of particles){p.x+=p.vx*f;p.y+=p.vy*f*timeFactor;p.vy+=.08*f;p.life-=f}particles=particles.filter(p=>p.life>0);shake*=.86;flash*=.88;updateHud();saveMissions(false)}
function saveMissions(force=true){if(force||Math.random()<.02)localStorage.setItem('cb_missions',JSON.stringify(missions))}
function circleGradient(x,y,r,skin){const g=ctx.createRadialGradient(x-r*.38,y-r*.5,1,x,y,r*1.05);g.addColorStop(0,'#fff');g.addColorStop(.13,skin.c1);g.addColorStop(.5,skin.c2);g.addColorStop(1,skin.c3);return g}
function roundedRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function polygon(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath()}
function drawObstacle(o){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot);ctx.shadowColor='#ff385d';ctx.shadowBlur=22;ctx.lineJoin='round';
 if(o.type==='spike'){const grad=ctx.createRadialGradient(-o.r*.25,-o.r*.3,2,0,0,o.r);grad.addColorStop(0,'#fff1f2');grad.addColorStop(.2,'#fb7185');grad.addColorStop(1,'#7f1d1d');ctx.fillStyle=grad;polygon(Array.from({length:20},(_,i)=>{const a=i*Math.PI/10,rr=i%2?o.r*.5:o.r;return[Math.cos(a)*rr,Math.sin(a)*rr]}));ctx.fill();ctx.strokeStyle='#fecdd3';ctx.lineWidth=2;ctx.stroke();}
 else if(o.type==='satellite'){ctx.shadowColor='#38bdf8';ctx.fillStyle='#94a3b8';roundedRect(-o.r*.48,-o.r*.34,o.r*.96,o.r*.68,7);ctx.fill();ctx.fillStyle='#1e293b';roundedRect(-o.r*.24,-o.r*.18,o.r*.48,o.r*.36,5);ctx.fill();for(const side of[-1,1]){ctx.save();ctx.translate(side*o.r*.82,0);ctx.fillStyle='#0ea5e9';ctx.fillRect(-o.r*.28,-o.r*.28,o.r*.56,o.r*.56);ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=1;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*o.r*.09,-o.r*.28);ctx.lineTo(i*o.r*.09,o.r*.28);ctx.stroke()}ctx.restore()}ctx.fillStyle='#f8fafc';ctx.beginPath();ctx.arc(0,-o.r*.28,o.r*.12,0,7);ctx.fill();}
 else if(o.type==='mine'){ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(0,0,o.r*.72,0,7);ctx.fill();ctx.strokeStyle='#fb7185';ctx.lineWidth=5;for(let i=0;i<10;i++){const a=i/10*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*o.r*.58,Math.sin(a)*o.r*.58);ctx.lineTo(Math.cos(a)*o.r,Math.sin(a)*o.r);ctx.stroke()}ctx.shadowBlur=30;ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(0,0,o.r*.22,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-o.r*.07,-o.r*.08,o.r*.06,0,7);ctx.fill();}
 else if(o.type==='laser'){ctx.shadowBlur=34;ctx.fillStyle='#3f0712';roundedRect(-o.r*.34,-o.r,o.r*.68,o.r*2,8);ctx.fill();const lg=ctx.createLinearGradient(-o.r*.15,0,o.r*.15,0);lg.addColorStop(0,'#be123c');lg.addColorStop(.5,'#fff');lg.addColorStop(1,'#be123c');ctx.fillStyle=lg;ctx.fillRect(-o.r*.14,-o.r,o.r*.28,o.r*2);ctx.fillStyle='#fecdd3';ctx.fillRect(-o.r*.035,-o.r,o.r*.07,o.r*2);}
 else if(o.type==='portal'){ctx.shadowColor='#c084fc';ctx.shadowBlur=30;for(let i=0;i<3;i++){ctx.strokeStyle=['#f0abfc','#a855f7','#38bdf8'][i];ctx.lineWidth=7-i*2;ctx.beginPath();ctx.ellipse(0,0,o.r*(.94-i*.18),o.r*(.52-i*.1),0,0,7);ctx.stroke()}ctx.fillStyle='rgba(15,23,42,.8)';ctx.beginPath();ctx.ellipse(0,0,o.r*.42,o.r*.18,0,0,7);ctx.fill();}
 else if(o.type==='comet'){ctx.rotate(-.35);const tail=ctx.createLinearGradient(-o.r*2,0,o.r,0);tail.addColorStop(0,'rgba(56,189,248,0)');tail.addColorStop(.55,'rgba(56,189,248,.55)');tail.addColorStop(1,'#fff');ctx.fillStyle=tail;polygon([[-o.r*2,-o.r*.36],[o.r*.2,-o.r*.65],[o.r,0],[o.r*.2,o.r*.65],[-o.r*2,o.r*.36]]);ctx.fill();ctx.fillStyle='#f8fafc';ctx.beginPath();ctx.arc(o.r*.35,0,o.r*.55,0,7);ctx.fill();ctx.fillStyle='#7dd3fc';ctx.beginPath();ctx.arc(o.r*.18,-o.r*.12,o.r*.16,0,7);ctx.fill();}
 else{const meteor=o.type==='meteor',crate=o.type==='crate';if(crate){ctx.fillStyle='#7c2d12';roundedRect(-o.r,-o.r,o.r*2,o.r*2,7);ctx.fill();ctx.strokeStyle='#f59e0b';ctx.lineWidth=4;ctx.stroke();ctx.beginPath();ctx.moveTo(-o.r*.75,-o.r*.75);ctx.lineTo(o.r*.75,o.r*.75);ctx.moveTo(o.r*.75,-o.r*.75);ctx.lineTo(-o.r*.75,o.r*.75);ctx.stroke()}else{const rg=ctx.createRadialGradient(-o.r*.3,-o.r*.35,3,0,0,o.r);rg.addColorStop(0,meteor?'#fdba74':'#cbd5e1');rg.addColorStop(.35,meteor?'#9a3412':'#64748b');rg.addColorStop(1,meteor?'#431407':'#1e293b');ctx.fillStyle=rg;polygon([[-.85,-.3],[-.5,-.88],[.12,-.98],[.78,-.6],[.98,.05],[.62,.78],[-.1,.95],[-.82,.55]].map(([x,y])=>[x*o.r,y*o.r]));ctx.fill();ctx.strokeStyle=meteor?'#fed7aa':'#cbd5e1';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='rgba(15,23,42,.45)';for(const [x,y,rr] of[[-.32,-.25,.2],[.35,.18,.15],[-.05,.48,.12]]){ctx.beginPath();ctx.arc(x*o.r,y*o.r,rr*o.r,0,7);ctx.fill()}}}
 ctx.restore()}
function drawPickup(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);const pulse=1+Math.sin(performance.now()/160+p.x)*.07;ctx.scale(pulse,pulse);if(p.type==='multi'&&p.meteor){ctx.shadowColor=p.value>=10?'#fde047':'#c084fc';ctx.shadowBlur=28;const mg=ctx.createRadialGradient(-8,-10,2,0,0,24);mg.addColorStop(0,'#fff');mg.addColorStop(.22,p.value>=10?'#fde047':'#d8b4fe');mg.addColorStop(1,p.value>=5?'#6b21a8':'#78350f');ctx.fillStyle=mg;polygon([[-20,-5],[-9,-21],[12,-17],[23,1],[11,20],[-17,15]]);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 12px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('x'+p.value,1,2)}else{const map={coin:['#facc15','€'],shield:['#22d3ee','🛡'],magnet:['#ef4444','🧲'],gold:['#fde047','★'],slow:['#a78bfa','⏱'],double:['#34d399','x2'],ghost:['#e2e8f0','👻'],vacuum:['#fb7185','◎'],freeze:['#7dd3fc','❄'],multi:['#c084fc','x'+p.value]};const c=map[p.type];ctx.shadowColor=c[0];ctx.shadowBlur=24;const pg=ctx.createRadialGradient(-p.r*.3,-p.r*.38,1,0,0,p.r);pg.addColorStop(0,'#fff');pg.addColorStop(.24,c[0]);pg.addColorStop(1,'#111827');ctx.fillStyle=pg;ctx.beginPath();ctx.arc(0,0,p.r,0,7);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff';ctx.font=`900 ${p.type==='multi'?11:14}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(c[1],0,1)}ctx.restore()}
function drawBackground(){const t=performance.now()/1000;const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#16275f');g.addColorStop(.38,'#0b1236');g.addColorStop(1,'#02030b');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);const neb=ctx.createRadialGradient(W*.25+Math.sin(t*.12)*40,H*.18,20,W*.25,H*.18,W*.65);neb.addColorStop(0,'rgba(78,70,229,.28)');neb.addColorStop(.38,'rgba(59,130,246,.09)');neb.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=neb;ctx.fillRect(0,0,W,H);const neb2=ctx.createRadialGradient(W*.8,H*.34,10,W*.8,H*.34,W*.5);neb2.addColorStop(0,'rgba(217,70,239,.16)');neb2.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=neb2;ctx.fillRect(0,0,W,H);for(const s of stars){s.y+=s.v;if(s.y>H){s.y=0;s.x=Math.random()*W}const tw=.35+Math.sin(t*2+s.x)*.25;ctx.globalAlpha=Math.max(.15,tw);ctx.fillStyle=s.s>1.5?'#bae6fd':'#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,7);ctx.fill()}ctx.globalAlpha=1;drawSkyline();drawFloor()}
function drawSkyline(){const horizon=H*.61;ctx.save();ctx.globalAlpha=.65;ctx.fillStyle='#06091a';for(let x=-20;x<W+30;x+=42){const h=30+((x*17)%75+75)%75;ctx.fillRect(x,horizon-h,35,h);ctx.fillStyle='rgba(56,189,248,.22)';for(let y=horizon-h+10;y<horizon-6;y+=12)for(let xx=x+7;xx<x+31;xx+=11)ctx.fillRect(xx,y,3,5);ctx.fillStyle='#06091a'}ctx.restore()}
function drawFloor(){const horizon=H*.61,t=performance.now()/1000;ctx.save();const fg=ctx.createLinearGradient(0,horizon,0,H);fg.addColorStop(0,'rgba(17,30,70,.18)');fg.addColorStop(.45,'rgba(5,10,30,.82)');fg.addColorStop(1,'#01030a');ctx.fillStyle=fg;ctx.fillRect(0,horizon,W,H-horizon);ctx.shadowColor='#22d3ee';ctx.shadowBlur=8;for(let i=0;i<20;i++){const frac=((i/20+t*.08)%1);const y=horizon+(H-horizon)*frac*frac;ctx.globalAlpha=.08+.28*frac;ctx.strokeStyle='#38bdf8';ctx.lineWidth=1+frac*1.5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}ctx.globalAlpha=.22;ctx.lineWidth=1.4;for(let i=-12;i<=12;i++){ctx.beginPath();ctx.moveTo(W/2+i*15,horizon);ctx.lineTo(W/2+i*95,H);ctx.stroke()}ctx.globalAlpha=.3;const glow=ctx.createLinearGradient(0,horizon,0,H);glow.addColorStop(0,'rgba(34,211,238,.28)');glow.addColorStop(1,'rgba(34,211,238,0)');ctx.fillStyle=glow;ctx.fillRect(0,horizon,W,50);ctx.restore()}
function drawBall(skin){for(let i=0;i<ball.trail.length;i++){const tr=ball.trail[i],q=i/ball.trail.length;ctx.globalAlpha=q*.28;ctx.shadowColor=skin.c2;ctx.shadowBlur=18;ctx.fillStyle=skin.c2;ctx.beginPath();ctx.arc(tr.x,tr.y,ball.r*(.18+q*.72),0,7);ctx.fill()}ctx.globalAlpha=1;ctx.save();ctx.translate(ball.x,ball.y);ctx.shadowColor=power.type==='gold'?'#fde047':skin.c2;ctx.shadowBlur=32;ctx.fillStyle=circleGradient(0,0,ball.r,skin);ctx.beginPath();ctx.arc(0,0,ball.r,0,7);ctx.fill();ctx.strokeStyle=power.type==='shield'?'#a5f3fc':power.type==='gold'?'#fef08a':'rgba(255,255,255,.92)';ctx.lineWidth=power.type?6:3;ctx.stroke();ctx.globalAlpha=.55;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-ball.r*.32,-ball.r*.4,ball.r*.22,ball.r*.12,-.55,0,7);ctx.fill();ctx.globalAlpha=1;if(['football','blaugrana','merengue','rojiblanco','citizens','aurinegro'].includes(selectedSkin)){ctx.save();ctx.rotate(performance.now()/1400);if(selectedSkin==='football'){ctx.fillStyle='#111827';for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ctx.beginPath();ctx.arc(Math.cos(a)*ball.r*.48,Math.sin(a)*ball.r*.48,ball.r*.13,0,7);ctx.fill()}ctx.beginPath();ctx.arc(0,0,ball.r*.14,0,7);ctx.fill()}else{const cols={blaugrana:['#dc2626','#1e3a8a'],merengue:['#fff','#d4af37'],rojiblanco:['#ef4444','#fff'],citizens:['#7dd3fc','#fff'],aurinegro:['#facc15','#111827']}[selectedSkin];ctx.lineWidth=ball.r*.23;for(let i=-3;i<=3;i++){ctx.strokeStyle=cols[(i+3)%2];ctx.beginPath();ctx.moveTo(i*ball.r*.32,-ball.r);ctx.lineTo(i*ball.r*.32,ball.r);ctx.stroke()}}ctx.restore()}if(['thunderpet','embercub','tideturtle','vinebeast','cosmicmind','capedguardian','steelavenger','nightweb','emeraldgiant'].includes(selectedSkin)){ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.arc(-ball.r*.28,-ball.r*.05,ball.r*.09,0,7);ctx.arc(ball.r*.28,-ball.r*.05,ball.r*.09,0,7);ctx.fill();ctx.strokeStyle=skin.c3;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,ball.r*.18,ball.r*.22,.15*Math.PI,.85*Math.PI);ctx.stroke()}if(power.type==='shield'){ctx.rotate(performance.now()/600);ctx.strokeStyle='rgba(103,232,249,.72)';ctx.lineWidth=3;ctx.setLineDash([8,7]);ctx.beginPath();ctx.arc(0,0,ball.r+13,0,7);ctx.stroke();ctx.setLineDash([])}ctx.restore()}
function draw(){ctx.clearRect(0,0,W,H);drawBackground();ctx.save();ctx.translate(rnd(-shake,shake),rnd(-shake,shake));for(const o of obstacles)drawObstacle(o);for(const p of pickups)drawPickup(p);const skin=skins.find(s=>s.id===selectedSkin)||skins[0];drawBall(skin);for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.shadowColor=p.color;ctx.shadowBlur=12;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}ctx.globalAlpha=1;ctx.restore();if(state==='play'){ctx.save();ctx.fillStyle='rgba(5,7,24,.72)';roundedRect(W/2-66,76,132,30,15);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 15px Arial';ctx.textAlign='center';ctx.fillText(`Vidas  ${'❤'.repeat(lives)}`,W/2,97);if(rushLabel){ctx.fillStyle='rgba(127,29,29,.82)';roundedRect(W/2-78,112,156,30,15);ctx.fill();ctx.fillStyle='#fecaca';ctx.fillText(rushLabel,W/2,132)}if(power.type){ctx.fillStyle='rgba(5,7,24,.8)';roundedRect(W/2-82,H-48,164,32,16);ctx.fill();ctx.fillStyle='#fde68a';ctx.fillText(`${power.type.toUpperCase()} ${Math.ceil(power.time/60)}s`,W/2,H-27)}ctx.restore()}if(flash>.02){ctx.fillStyle=`rgba(255,255,255,${flash*.35})`;ctx.fillRect(0,0,W,H)}const vign=ctx.createRadialGradient(W/2,H*.45,Math.min(W,H)*.2,W/2,H*.45,Math.max(W,H)*.78);vign.addColorStop(.65,'rgba(0,0,0,0)');vign.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=vign;ctx.fillRect(0,0,W,H)}


// Música procedural compatible con iOS: se desbloquea dentro del gesto del usuario.
let audioCtx=null,musicTimer=null,musicEnabled=localStorage.getItem('cb_music')!=='off',musicStep=0,masterGain=null;
const musicNotes=[220,277.18,329.63,440,493.88,440,329.63,277.18,196,246.94,293.66,392,440,392,293.66,246.94];
async function ensureAudio(forceSound=false){
 try{
  if(!audioCtx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('AudioContext no disponible');audioCtx=new AC();masterGain=audioCtx.createGain();masterGain.gain.value=.8;masterGain.connect(audioCtx.destination)}
  if(audioCtx.state!=='running')await audioCtx.resume();
  if(forceSound){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=660;g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.06,audioCtx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.09);o.connect(g).connect(masterGain);o.start();o.stop(audioCtx.currentTime+.1)}
  return audioCtx.state==='running';
 }catch(err){console.warn('No se pudo iniciar el audio',err);toast('TOCA 🔊 PARA ACTIVAR MÚSICA');return false}
}
function playTone(freq,when,duration=.22,volume=.045,type='sine'){
 if(!audioCtx||!masterGain||!musicEnabled||audioCtx.state!=='running')return;
 const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,when);gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(volume,when+.012);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);osc.connect(gain).connect(masterGain);osc.start(when);osc.stop(when+duration+.03)
}
function musicTick(){if(!musicEnabled||!audioCtx||audioCtx.state!=='running')return;const now=audioCtx.currentTime+.02,n=musicNotes[musicStep%musicNotes.length];playTone(n,now,.30,.04,'triangle');playTone(n*2,now,.16,.012,'sine');if(musicStep%2===0)playTone(n/2,now,.42,.025,'sine');if(musicStep%4===0){playTone(82.41,now,.18,.028,'square');playTone(123.47,now+.12,.1,.018,'triangle')}musicStep++}
async function startMusic(forceSound=false){if(!musicEnabled){updateMusicButtons();return false}const ok=await ensureAudio(forceSound);if(!ok)return false;if(!musicTimer){musicTick();musicTimer=setInterval(musicTick,280)}updateMusicButtons();return true}
function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}updateMusicButtons()}
async function toggleMusic(){musicEnabled=!musicEnabled;localStorage.setItem('cb_music',musicEnabled?'on':'off');if(musicEnabled)await startMusic(true);else stopMusic()}
function updateMusicButtons(){document.querySelectorAll('[data-music]').forEach(b=>{b.textContent=musicEnabled?'🔊 MÚSICA ON':'🔇 MÚSICA OFF';b.classList.toggle('music-on',musicEnabled)})}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else if(musicEnabled&&state==='play')startMusic(false)});
function applyStartingPower(){for(const key of ['shield','magnet','gold','slow','double','ghost','vacuum','freeze']){if(inventory[key]>0){inventory[key]--;localStorage.setItem('cb_inventory',JSON.stringify(inventory));activate(key);break}}}
function loop(now){const dt=now-last||16;last=now;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
async function submitScore(points,lvl){const row={player_name:playerName||'Jugador',score:points,level:lvl};let local=JSON.parse(localStorage.getItem('cb_scores')||'[]');local.push({...row,created_at:new Date().toISOString()});local=local.sort((a,b)=>b.score-a.score).slice(0,100);localStorage.setItem('cb_scores',JSON.stringify(local));bc?.postMessage({type:'score',row});if(online){try{await supabaseClient.from('scores').insert(row)}catch(e){console.warn(e)}}}
async function getScores(){if(online){try{const {data,error}=await supabaseClient.from('scores').select('*').order('score',{ascending:false}).limit(50);if(!error&&data)return data}catch(e){console.warn(e)}}return JSON.parse(localStorage.getItem('cb_scores')||'[]').sort((a,b)=>b.score-a.score).slice(0,50)}
async function openRanking(){const rows=await getScores();modalContent.innerHTML=`<h2>RANKING GLOBAL</h2><div>${rows.length?rows.map((r,i)=>`<div class="rank-row"><span class="rank-pos">${i+1}</span><span class="rank-name">${escapeHtml(r.player_name)}</span><span class="rank-score">${r.score}</span></div>`).join(''):'<p>Aún no hay puntuaciones.</p>'}</div>`;openModal()}
function getLocalMessages(){return JSON.parse(localStorage.getItem('cb_chat')||'[]').slice(-80)} function saveLocalMessage(m){const a=getLocalMessages();a.push(m);localStorage.setItem('cb_chat',JSON.stringify(a.slice(-80)));bc?.postMessage({type:'chat',row:m})}
async function getMessages(){if(online){try{const {data,error}=await supabaseClient.from('messages').select('*').order('created_at',{ascending:true}).limit(80);if(!error&&data)return data}catch(e){console.warn(e)}}return getLocalMessages()}
async function openChat(){saveProfile();const msgs=await getMessages();modalContent.innerHTML=`<h2>CHAT ONLINE</h2><div id="chatLog" class="chat-log"></div><div class="chat-compose"><input id="chatInput" class="input" maxlength="140" placeholder="Escribe un mensaje"><button id="sendChat" class="btn primary">Enviar</button></div>`;renderMessages(msgs);$('#sendChat').onclick=sendChat;$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendChat()});openModal();subscribeChat()}
function renderMessages(msgs){const log=$('#chatLog');if(!log)return;log.innerHTML=msgs.map(m=>`<div class="chat-row"><small>${escapeHtml(m.player_name)}</small><div>${escapeHtml(m.message)}</div></div>`).join('');log.scrollTop=log.scrollHeight}
async function sendChat(){const input=$('#chatInput'),message=(input?.value||'').trim().slice(0,140);if(!message)return;const row={player_name:playerName||'Jugador',message,created_at:new Date().toISOString()};saveLocalMessage(row);if(online){try{await supabaseClient.from('messages').insert({player_name:row.player_name,message:row.message})}catch(e){console.warn(e)}}input.value='';renderMessages(await getMessages())}
function subscribeChat(){if(!online||channel)return;channel=supabaseClient.channel('crazy-ball-chat').on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},async()=>renderMessages(await getMessages())).subscribe()}
bc?.addEventListener('message',async e=>{if(e.data?.type==='chat'&&$('#chatLog'))renderMessages(await getMessages());if(e.data?.type==='score'&&modalContent.textContent.includes('RANKING'))openRanking()});
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))} function openModal(){modal.classList.remove('hidden')} function closeModal(){modal.classList.add('hidden')}
function openSkins(){const cats=[...new Set(skins.map(s=>s.cat))];modalContent.innerHTML=`<h2>TIENDA DE SKINS</h2><p>Monedas disponibles: <b>${totalCoins}</b></p>${cats.map(cat=>`<h3>${cat}</h3><div class="skin-grid">${skins.filter(s=>s.cat===cat).map(s=>{const isOwned=owned.includes(s.id),sel=selectedSkin===s.id;return `<div class="skin-card"><div class="skin-ball" style="background:radial-gradient(circle at 30% 25%,${s.c1},${s.c2} 40%,${s.c3})"></div><b>${s.name}</b><small>${s.price?`${s.price} monedas`:'GRATIS'}</small><button class="btn ${sel?'primary':'secondary'}" data-skin="${s.id}">${sel?'EQUIPADA':isOwned?'EQUIPAR':'COMPRAR'}</button></div>`}).join('')}</div>`).join('')}`;modalContent.querySelectorAll('[data-skin]').forEach(b=>b.onclick=()=>buyOrSelect(b.dataset.skin));openModal()}
function buyOrSelect(id){const s=skins.find(x=>x.id===id);if(!owned.includes(id)){if(totalCoins<s.price){alert('No tienes suficientes monedas.');return}totalCoins-=s.price;owned.push(id);localStorage.setItem('cb_coins',totalCoins);localStorage.setItem('cb_owned',JSON.stringify(owned))}selectedSkin=id;localStorage.setItem('cb_skin',id);openSkins()}
function openMissions(){saveMissions();const allDone=missions.coins<=0&&missions.meteors<=0&&missions.dodged<=0;modalContent.innerHTML=`<h2>MISIONES</h2><div class="mission-row">🪙 Recoge 25 monedas <b>${missions.coins>0?missions.coins:'✓'}</b></div><div class="mission-row">☄️ Consigue 5 meteoritos <b>${missions.meteors>0?missions.meteors:'✓'}</b></div><div class="mission-row">🚀 Esquiva 50 objetos <b>${missions.dodged>0?missions.dodged:'✓'}</b></div>${allDone?'<button id="claimMission" class="btn primary">COBRAR 500 MONEDAS</button>':''}<p class="mission-note">El progreso se guarda automáticamente.</p>`;if(allDone)$('#claimMission').onclick=()=>{totalCoins+=500;localStorage.setItem('cb_coins',totalCoins);missions={coins:25,meteors:5,dodged:50};saveMissions();toast('+500 MONEDAS');openMissions()};openModal()}

function openModes(){const modes=[['classic','Clásico','Equilibrado: monedas, ventajas y obstáculos.'],['coins','Lluvia de monedas','Más monedas y mayor frecuencia de imanes.'],['survival','Supervivencia','Una sola vida, velocidad alta y más puntuación.'],['meteor','Tormenta de meteoritos','Muchos multiplicadores y obstáculos rápidos.']];modalContent.innerHTML=`<h2>MODOS DE JUEGO</h2>${modes.map(m=>`<button class="mode-card ${gameMode===m[0]?'selected':''}" data-mode="${m[0]}"><b>${m[1]}</b><span>${m[2]}</span></button>`).join('')}`;modalContent.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{gameMode=b.dataset.mode;localStorage.setItem('cb_mode',gameMode);openModes()});openModal()}
function openPowers(){const items=[['shield','Escudo inicial',180,'Protege del primer impacto.'],['magnet','Imán inicial',220,'Atrae monedas cercanas.'],['gold','Súper bola inicial',320,'Destruye obstáculos temporalmente.'],['slow','Tiempo lento',260,'Reduce la velocidad del escenario.'],['double','Monedas x2',300,'Duplica las monedas recogidas.'],['ghost','Modo fantasma',380,'Atraviesa obstáculos temporalmente.'],['vacuum','Súper imán',420,'Atrae monedas desde casi toda la pantalla.'],['freeze','Congelación',360,'Casi detiene el escenario durante unos segundos.']];modalContent.innerHTML=`<h2>VENTAJAS</h2><p>Monedas: <b>${totalCoins}</b></p>${items.map(i=>`<div class="power-shop"><div><b>${i[1]}</b><small>${i[3]}</small></div><button class="btn secondary" data-power="${i[0]}">${i[2]} 🪙 · Tienes ${inventory[i[0]]||0}</button></div>`).join('')}`;modalContent.querySelectorAll('[data-power]').forEach(b=>b.onclick=()=>{const it=items.find(x=>x[0]===b.dataset.power);if(totalCoins<it[2]){alert('No tienes suficientes monedas.');return}totalCoins-=it[2];inventory[it[0]]=(inventory[it[0]]||0)+1;localStorage.setItem('cb_coins',totalCoins);localStorage.setItem('cb_inventory',JSON.stringify(inventory));openPowers()});openModal()}
function openHow(){modalContent.innerHTML='<h2>CÓMO JUGAR</h2><p>Elige un modo, compra skins y ventajas, supera niveles y alcanza un prestigio cada 10 niveles. Cada nuevo prestigio concede 1000 monedas. Arrastra el dedo cerca de la bola para moverla sin que se coloque directamente bajo tu pulsación. Activa la música con el botón 🔊 tras abrir el juego. Recoge monedas, ventajas y meteoritos con multiplicadores aleatorios. Evita rocas, pinchos, satélites, minas, láseres, portales y cometas.</p>';openModal()}
$('#playBtn').onclick=start;$('#musicBtn').onclick=toggleMusic;$('#hudMusicBtn').onclick=toggleMusic;updateMusicButtons();$('#retryBtn').onclick=start;$('#homeBtn').onclick=()=>{state='menu';gameOver.classList.add('hidden');menu.classList.remove('hidden')};$('#rankingBtn').onclick=openRanking;$('#chatBtn').onclick=openChat;$('#skinsBtn').onclick=openSkins;$('#missionsBtn').onclick=openMissions;$('#modesBtn').onclick=openModes;$('#powersBtn').onclick=openPowers;$('#howBtn').onclick=openHow;$('#closeModal').onclick=closeModal;$('#pauseBtn').onclick=()=>{if(state==='play'){state='pause';modalContent.innerHTML='<h2>PAUSA</h2><button id="resume" class="btn primary">CONTINUAR</button><button id="quit" class="btn secondary">SALIR AL MENÚ</button>';openModal();$('#resume').onclick=()=>{state='play';closeModal()};$('#quit').onclick=()=>{state='menu';hud.classList.add('hidden');closeModal();menu.classList.remove('hidden')}}};


// ===== CRAZY BALL v7 EVOLUTION =====
const bgMusic=document.querySelector('#bgMusic');
let selectedTheme=localStorage.getItem('cb_theme')||'auto';
let boss=null,bossSeenLevel=0,bossBar=null;
let stats=JSON.parse(localStorage.getItem('cb_stats')||'{"games":0,"coins":0,"meteors":0,"dodged":0,"bosses":0,"bestMulti":1}');
let claimedAchievements=JSON.parse(localStorage.getItem('cb_achievements')||'[]');
const achievementDefs=[
 ['first','Primer vuelo','Juega una partida',1,'games',150,'🚀'],
 ['coin100','Coleccionista','Recoge 100 monedas',100,'coins',300,'🪙'],
 ['meteor25','Cazador de meteoritos','Recoge 25 multiplicadores',25,'meteors',400,'☄️'],
 ['dodge250','Intocable','Esquiva 250 obstáculos',250,'dodged',500,'⚡'],
 ['boss1','Cazajefes','Derrota un jefe',1,'bosses',750,'👾'],
 ['multi20','Potencia máxima','Consigue un x20',20,'bestMulti',600,'💥']
];
function saveStats(){localStorage.setItem('cb_stats',JSON.stringify(stats))}
function checkAchievements(show=true){for(const [id,name,desc,need,key,reward] of achievementDefs){if((stats[key]||0)>=need&&!claimedAchievements.includes(id)){claimedAchievements.push(id);totalCoins+=reward;localStorage.setItem('cb_coins',totalCoins);localStorage.setItem('cb_achievements',JSON.stringify(claimedAchievements));if(show)toast(`LOGRO +${reward} 🪙`)}}}
function openAchievements(){checkAchievements(false);modalContent.innerHTML=`<h2>LOGROS</h2><p>Completa objetivos y gana monedas.</p>${achievementDefs.map(([id,name,desc,need,key,reward,ico])=>{const val=Math.min(need,stats[key]||0),done=claimedAchievements.includes(id);return `<div class="achievement-row ${done?'done':''}"><div class="ico">${ico}</div><div><b>${name}</b><small>${desc}<br>${val}/${need}</small></div><strong>${done?'✓':reward+' 🪙'}</strong></div>`}).join('')}`;openModal()}
const themes=[['auto','Dinámico','Cambia con los niveles'],['space','Espacio','Nebulosas y estrellas'],['sunset','Atardecer','Cielo cálido futurista'],['iceworld','Mundo helado','Auroras y hielo'],['neoncity','Ciudad neón','Noche cibernética']];
function openThemes(){modalContent.innerHTML=`<h2>ESCENARIOS</h2><div class="theme-grid">${themes.map(t=>`<button class="theme-card ${selectedTheme===t[0]?'selected':''}" data-theme="${t[0]}"><b>${t[1]}</b><small>${t[2]}</small></button>`).join('')}</div>`;modalContent.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{selectedTheme=b.dataset.theme;localStorage.setItem('cb_theme',selectedTheme);openThemes()});openModal()}
function currentTheme(){if(selectedTheme!=='auto')return selectedTheme;return ['space','sunset','iceworld','neoncity'][Math.floor((level-1)/3)%4]}
const v64DrawBackground=drawBackground;
drawBackground=function(){const th=currentTheme(),t=performance.now()/1000;if(th==='space')return v64DrawBackground();let top='#1e1b4b',mid='#0f172a',bot='#020617',glow='#22d3ee';if(th==='sunset'){top='#7c2d12';mid='#be123c';bot='#111827';glow='#fb923c'}if(th==='iceworld'){top='#0c4a6e';mid='#164e63';bot='#082f49';glow='#a5f3fc'}if(th==='neoncity'){top='#2e1065';mid='#111827';bot='#020617';glow='#f472b6'}const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(.52,mid);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(const s of stars){s.y+=s.v*(th==='sunset'?.35:1);if(s.y>H){s.y=0;s.x=Math.random()*W}ctx.globalAlpha=.25+.45*Math.abs(Math.sin(t+s.x));ctx.fillStyle=th==='sunset'?'#fed7aa':'#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,7);ctx.fill()}ctx.globalAlpha=1;if(th==='iceworld'){for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(165,243,252,${.11+i*.04})`;ctx.lineWidth=18-i*5;ctx.beginPath();for(let x=0;x<=W;x+=20){const y=H*.18+i*38+Math.sin(x/80+t*(.35+i*.1))*28;ctx.lineTo(x,y)}ctx.stroke()}}if(th==='sunset'){ctx.fillStyle='#fde68a';ctx.shadowColor='#fb923c';ctx.shadowBlur=40;ctx.beginPath();ctx.arc(W*.76,H*.25,42,0,7);ctx.fill();ctx.shadowBlur=0}drawSkyline();drawFloor();ctx.save();ctx.globalAlpha=.18;ctx.fillStyle=glow;ctx.fillRect(0,H*.6,W,4);ctx.restore()}
function spawnBoss(){boss={x:W/2,y:-90,targetY:H*.24,r:58,hp:12+level*2,maxHp:12+level*2,phase:0,shot:0};bossSeenLevel=level;toast('⚠ JEFE FINAL');flash=.8;bossBar=document.createElement('div');bossBar.className='boss-bar';bossBar.innerHTML='<span style="width:100%"></span>';document.body.appendChild(bossBar)}
function updateBoss(f){if(!boss)return;boss.y+=(boss.targetY-boss.y)*.035*f;boss.phase+=.035*f;boss.x=W/2+Math.sin(boss.phase)*W*.28;boss.shot-=f;if(boss.shot<=0){boss.shot=Math.max(22,55-level*1.4);const a=Math.atan2(ball.y-boss.y,ball.x-boss.x);obstacles.push({x:boss.x,y:boss.y+35,r:15,vy:Math.sin(a)*5+2,vx:Math.cos(a)*5,type:'mine',rot:0,spin:.08,phase:0,passed:false,bossShot:true})}for(const p of pickups){if(p.type==='multi'&&hit(p,boss,-8)){p.dead=true;boss.hp-=Math.max(1,Math.floor(p.value/2));burst(boss.x,boss.y,'#fde047',24,7);score+=80*p.value}}if(power.type==='gold'&&hit(ball,boss,-5)){boss.hp-=.12*f;shake=4}if(hit(ball,boss,-10)&&power.type!=='shield'&&power.type!=='gold'&&power.type!=='ghost'){lives--;ball.targetY=H*.78;ball.y=H*.78;flash=.9;if(lives<=0){end();return}}if(bossBar)bossBar.firstElementChild.style.width=`${Math.max(0,boss.hp/boss.maxHp*100)}%`;if(boss.hp<=0){stats.bosses++;saveStats();checkAchievements();runCoins+=100;score+=1000;burst(boss.x,boss.y,'#fbbf24',70,10);toast('JEFE DERROTADO +100 🪙');boss=null;bossBar?.remove();bossBar=null}}
const v64SpawnObstacle=spawnObstacle;
spawnObstacle=function(){if(boss&&Math.random()<.45)return;v64SpawnObstacle();const o=obstacles[obstacles.length-1];if(o&&!('vx'in o))o.vx=0}
const v64Update=update;
update=function(dt){const beforeCoins=runCoins,beforeMeteor=missions.meteors,beforeDodge=missions.dodged;v64Update(dt);if(state!=='play')return;const f=Math.min(2,dt/16.67);for(const o of obstacles)if(o.vx)o.x+=o.vx*f*((power.type==='slow')?.62:1);if(level>=5&&level%5===0&&bossSeenLevel!==level&&!boss)spawnBoss();updateBoss(f);if(runCoins>beforeCoins)stats.coins+=runCoins-beforeCoins;if(missions.meteors<beforeMeteor){stats.meteors+=beforeMeteor-missions.meteors;stats.bestMulti=Math.max(stats.bestMulti,multiplier)}if(missions.dodged<beforeDodge)stats.dodged+=beforeDodge-missions.dodged;saveStats();checkAchievements(false)}
function drawBoss(){if(!boss)return;ctx.save();ctx.translate(boss.x,boss.y);ctx.rotate(Math.sin(boss.phase)*.18);ctx.shadowColor='#f43f5e';ctx.shadowBlur=38;const g=ctx.createRadialGradient(-18,-22,4,0,0,boss.r);g.addColorStop(0,'#fff');g.addColorStop(.2,'#fb7185');g.addColorStop(.62,'#7c3aed');g.addColorStop(1,'#111827');ctx.fillStyle=g;polygon(Array.from({length:16},(_,i)=>{const a=i*Math.PI/8,rr=i%2?boss.r*.72:boss.r;return[Math.cos(a)*rr,Math.sin(a)*rr]}));ctx.fill();ctx.strokeStyle='#fecdd3';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#020617';ctx.beginPath();ctx.arc(-18,-6,9,0,7);ctx.arc(18,-6,9,0,7);ctx.fill();ctx.fillStyle='#fef08a';ctx.beginPath();ctx.arc(-16,-8,3,0,7);ctx.arc(20,-8,3,0,7);ctx.fill();ctx.restore()}
const v64Draw=draw;
draw=function(){v64Draw();if(state==='play')drawBoss()}
const v64Start=start;
start=async function(){stats.games++;saveStats();checkAchievements();if(bgMusic&&musicEnabled){try{bgMusic.volume=.48;bgMusic.currentTime=0;await bgMusic.play()}catch(e){console.warn('audio',e)}}await v64Start();boss=null;bossSeenLevel=0;bossBar?.remove();bossBar=null}
const v64End=end;
end=function(){boss=null;bossBar?.remove();bossBar=null;checkAchievements();v64End()}
const v64ToggleMusic=toggleMusic;
toggleMusic=async function(){musicEnabled=!musicEnabled;localStorage.setItem('cb_music',musicEnabled?'on':'off');if(musicEnabled){try{bgMusic.volume=.48;await bgMusic.play()}catch(e){await startMusic(true)}}else{bgMusic?.pause();stopMusic()}updateMusicButtons()}
updateMusicButtons=function(){document.querySelectorAll('[data-music]').forEach(b=>{b.textContent=musicEnabled?'🔊 MÚSICA ON':'🔇 MÚSICA OFF';b.classList.toggle('music-on',musicEnabled)})}
$('#achievementsBtn').onclick=openAchievements;$('#themesBtn').onclick=openThemes;$('#playBtn').onclick=start;$('#retryBtn').onclick=start;$('#musicBtn').onclick=toggleMusic;$('#hudMusicBtn').onclick=toggleMusic;updateMusicButtons();

// ===== v7.1 VISUAL BOOST =====
let v71Pulse=0;
const v7DrawBackgroundRef=drawBackground;
drawBackground=function(){
  v7DrawBackgroundRef();
  const t=performance.now()/1000;
  // capas de luz ambiental y estrellas fugaces
  ctx.save();
  const glow=ctx.createRadialGradient(W*.5,H*.62,0,W*.5,H*.62,Math.max(W,H)*.62);
  glow.addColorStop(0,'rgba(83,245,255,.11)');glow.addColorStop(.42,'rgba(111,76,255,.055)');glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  for(let i=0;i<3;i++){
    const x=((t*(95+i*32)+i*W*.37)%(W+260))-130;
    const y=H*(.16+i*.14);
    const lg=ctx.createLinearGradient(x-100,y-28,x+60,y+18);
    lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.7,'rgba(160,244,255,.18)');lg.addColorStop(1,'rgba(255,255,255,.75)');
    ctx.strokeStyle=lg;ctx.lineWidth=1.5+i*.4;ctx.beginPath();ctx.moveTo(x-110,y-35);ctx.lineTo(x+55,y+15);ctx.stroke();
  }
  ctx.restore();
};
const v7DrawRef=draw;
draw=function(){
  v7DrawRef();
  if(state!=='play')return;
  const t=performance.now()/1000;
  // viñeta cinematográfica
  ctx.save();
  const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.24,W/2,H/2,Math.max(W,H)*.72);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(.72,'rgba(0,0,0,.03)');vg.addColorStop(1,'rgba(0,0,0,.34)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  // línea de energía en la base
  v71Pulse=(v71Pulse+.025)%1;
  const eg=ctx.createLinearGradient(0,0,W,0);eg.addColorStop(0,'rgba(0,0,0,0)');eg.addColorStop(v71Pulse,'rgba(96,247,255,.75)');eg.addColorStop(Math.min(1,v71Pulse+.16),'rgba(247,86,220,.55)');eg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=eg;ctx.fillRect(0,H-5,W,3);
  ctx.restore();
};
if(bgMusic){bgMusic.volume=.62;bgMusic.playbackRate=1.0}


// ===== CRAZY BALL v8 INFINITY =====
const V8_EMBLEMS={
 neon:'⚡',fire:'🔥',gold:'♛',forest:'🌿',galaxy:'✦',ice:'❄',lava:'🌋',shadow:'◐',
 football:'⬟',redclub:'R',blueclub:'B',greenclub:'G',yellowclub:'Y',royalclub:'♕',
 blaugrana:'BG',merengue:'BD',rojiblanco:'RB',citizens:'C',aurinegro:'AN',
 nightkeeper:'☾',solarhero:'S',webhero:'🕸',ironhero:'◆',stormhero:'ϟ',
 capedguardian:'G',steelavenger:'A',nightweb:'W',emeraldgiant:'拳',
 sparkmouse:'⚡',firelizard:'🔥',waterbeast:'💧',leafbeast:'🍃',psychic:'◉',dragon:'🐉',
 thunderpet:'ϟ',embercub:'♨',tideturtle:'🌊',vinebeast:'☘',cosmicmind:'✺',
 rainbow:'∞',plasma:'✹',void:'◉'
};
const V8_TRAITS={Originales:'Estela y explosión temática',Fútbol:'Emblema deportivo original',Héroes:'Símbolo heroico y aura propia',Criaturas:'Rostro o elemento de criatura',Especiales:'Efectos premium dinámicos'};
function v8Emblem(id){return V8_EMBLEMS[id]||'●'}
function drawSkinEmblem(id,r){
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`1000 ${Math.max(13,r*.72)}px Arial`;
 ctx.lineWidth=Math.max(2,r*.1);ctx.strokeStyle='rgba(0,0,0,.72)';ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=7;
 const e=v8Emblem(id);ctx.strokeText(e,0,2);ctx.fillText(e,0,2);ctx.restore();
}
const v8DrawBallBase=drawBall;
drawBall=function(skin){v8DrawBallBase(skin);ctx.save();ctx.translate(ball.x,ball.y);drawSkinEmblem(selectedSkin,ball.r);ctx.restore()}
openSkins=function(){
 const cats=[...new Set(skins.map(s=>s.cat))],pct=Math.round(owned.length/skins.length*100);
 modalContent.innerHTML=`<h2>COLECCIÓN DE SKINS</h2><p>${owned.length}/${skins.length} desbloqueadas · ${pct}% · <b>${totalCoins} 🪙</b></p>${cats.map(cat=>`<h3>${cat}</h3><div class="skin-grid">${skins.filter(s=>s.cat===cat).map(s=>{const isOwned=owned.includes(s.id),sel=selectedSkin===s.id;return `<div class="skin-card ${sel?'equipped':''}"><div class="skin-ball" data-emblem="${v8Emblem(s.id)}" style="background:radial-gradient(circle at 30% 25%,${s.c1},${s.c2} 42%,${s.c3})"></div><b>${s.name}</b><small class="skin-trait">${V8_TRAITS[s.cat]||'Aspecto exclusivo'}</small><small>${s.price?`${s.price} monedas`:'GRATIS'}</small><button class="btn ${sel?'primary':'secondary'}" data-skin="${s.id}">${sel?'EQUIPADA':isOwned?'EQUIPAR':'COMPRAR'}</button></div>`}).join('')}</div>`).join('')}`;
 modalContent.querySelectorAll('[data-skin]').forEach(b=>b.onclick=()=>buyOrSelect(b.dataset.skin));openModal();
}
function updateMenuBall(){const el=document.querySelector('#logoBall');if(!el)return;const s=skins.find(x=>x.id===selectedSkin)||skins[0];el.style.background=`radial-gradient(circle at 30% 22%,${s.c1},${s.c2} 44%,${s.c3})`;el.innerHTML=`<span class="skin-emblem">${v8Emblem(s.id)}</span>`}
const v8Buy=buyOrSelect;buyOrSelect=function(id){v8Buy(id);updateMenuBall()};updateMenuBall();

// Recompensa diaria creciente durante 7 días.
function openDaily(){
 const today=new Date().toISOString().slice(0,10),last=localStorage.getItem('cb_daily_date'),streak=Number(localStorage.getItem('cb_daily_streak')||0),claimed=last===today;
 const reward=[150,200,250,350,500,700,1000][Math.min(streak,6)];
 modalContent.innerHTML=`<h2>PREMIO DIARIO</h2><div class="daily-card"><div class="daily-reward">${claimed?'✓':reward+' 🪙'}</div><p>${claimed?'Premio recogido hoy. Regresa mañana.':`Día ${Math.min(streak+1,7)} de 7`}</p><button id="claimDaily" class="btn primary" ${claimed?'disabled':''}>${claimed?'RECOGIDO':'RECOGER'}</button></div>`;openModal();
 if(!claimed)document.querySelector('#claimDaily').onclick=()=>{totalCoins+=reward;localStorage.setItem('cb_coins',totalCoins);localStorage.setItem('cb_daily_date',today);localStorage.setItem('cb_daily_streak',String(Math.min(streak+1,7)));toast(`PREMIO +${reward} 🪙`);openDaily()};
}
const dailyBtn=document.querySelector('#dailyBtn');if(dailyBtn)dailyBtn.onclick=openDaily;

// Eventos sorpresa v8.
let v8EventTimer=360,v8EventType='',v8EventDuration=0;
const eventBanner=document.createElement('div');eventBanner.className='event-banner';document.body.appendChild(eventBanner);
function startV8Event(){
 const types=['coinrain','powerstorm','lowgravity'];v8EventType=choice(types);v8EventDuration=360;
 const labels={coinrain:'🪙 LLUVIA DE MONEDAS',powerstorm:'✨ TORMENTA DE VENTAJAS',lowgravity:'🌙 FLUJO LENTO'};eventBanner.textContent=labels[v8EventType];eventBanner.classList.add('show');setTimeout(()=>eventBanner.classList.remove('show'),2200);
}
const v8UpdateBase=update;
update=function(dt){v8UpdateBase(dt);if(state!=='play')return;const f=Math.min(2,dt/16.67);v8EventTimer-=f;if(v8EventTimer<=0&&!v8EventType){startV8Event();v8EventTimer=rnd(480,800)}if(v8EventType){v8EventDuration-=f;if(v8EventType==='coinrain'&&Math.random()<.07)pickups.push({x:rnd(20,W-20),y:-25,r:11,vy:rnd(2.8,4),type:'coin',rot:0,value:choice([1,1,2,5])});if(v8EventType==='powerstorm'&&Math.random()<.018){const type=choice(['shield','magnet','gold','double','ghost','freeze']);pickups.push({x:rnd(25,W-25),y:-30,r:17,vy:3,type,rot:0,value:1})}if(v8EventType==='lowgravity')for(const o of obstacles)o.vy*=.997;if(v8EventDuration<=0)v8EventType=''}
}
const v8StartBase=start;start=async function(){v8EventTimer=rnd(260,430);v8EventType='';v8EventDuration=0;await v8StartBase()};

// Mayor identidad visual por categoría de skin.
const v8BurstBase=burst;burst=function(x,y,color,n=12,speed=5){const s=skins.find(x=>x.id===selectedSkin);const bonus=s?.cat==='Especiales'?8:s?.cat==='Héroes'?4:0;v8BurstBase(x,y,s?.c2||color,n+bonus,speed)};

openHow=function(){modalContent.innerHTML='<h2>CÓMO JUGAR · V8</h2><p>Cada bola tiene un emblema propio que representa su skin. Las esferas de ventajas también muestran su función: imán, escudo, turbo, congelación, fantasma y multiplicadores. Recoge premios diarios, completa logros, supera jefes y aprovecha eventos sorpresa como lluvia de monedas y tormenta de ventajas.</p>';openModal()};
document.querySelector('#howBtn').onclick=openHow;

// ===== CRAZY BALL v8.1 PREMIUM ALIVE =====
const V81_SKIN_FX={
 Originales:{trail:'orb',sound:520,burst:'ring'},Fútbol:{trail:'stripes',sound:392,burst:'stars'},Héroes:{trail:'lightning',sound:659,burst:'rays'},Criaturas:{trail:'spark',sound:587,burst:'petals'},Especiales:{trail:'rainbow',sound:784,burst:'nova'}
};
let v81Weather={aurora:0,lightning:0,shipX:-200,meteorT:0},v81Invert=0,v81LowGravity=0,v81GiantMeteor=null,v81PortalHue=0,v81LastCoinCount=0,v81SpawnGlow=0;
function v81Skin(){return skins.find(s=>s.id===selectedSkin)||skins[0]}
function v81Fx(){return V81_SKIN_FX[v81Skin().cat]||V81_SKIN_FX.Originales}
function v81Tone(freq,dur=.12,vol=.045,type='sine'){
 try{if(!musicEnabled)return;ensureAudio(false).then(()=>{if(!audioCtx||audioCtx.state!=='running')return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioCtx.currentTime);g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(vol,audioCtx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);o.connect(g).connect(masterGain);o.start();o.stop(audioCtx.currentTime+dur+.02)}).catch(()=>{})}catch(e){}
}
function v81SkinBurst(x,y,intensity=1){const s=v81Skin(),fx=v81Fx();const count=fx.burst==='nova'?42:fx.burst==='rays'?30:24;v8BurstBase(x,y,s.c2,count*intensity,fx.burst==='nova'?9:6);v81Tone(fx.sound,intensity>.9?.16:.09,intensity>.9?.055:.03,fx.burst==='rays'?'sawtooth':'sine')}

// Sonido, explosión y animación propios por familia de skin.
const v81ActivateBase=activate;
activate=function(type,value=1){v81ActivateBase(type,value);v81SkinBurst(ball.x,ball.y,1.15);v81SpawnGlow=1}

// Ampliación de iconos y recompensas sorpresa.
const v81DrawPickupBase=drawPickup;
drawPickup=function(p){
 if(!['turbo','life','gift'].includes(p.type)){v81DrawPickupBase(p);return}
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);const data={turbo:['#fde047','⚡'],life:['#fb7185','♥'],gift:['#c084fc','🎁']}[p.type];ctx.shadowColor=data[0];ctx.shadowBlur=30;const g=ctx.createRadialGradient(-6,-8,1,0,0,p.r);g.addColorStop(0,'#fff');g.addColorStop(.25,data[0]);g.addColorStop(1,'#111827');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,p.r,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 15px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(data[1],0,1);ctx.restore();
}
const v81SpawnPickupBase=spawnPickup;
spawnPickup=function(){
 const r=Math.random();if(r<.035){pickups.push({x:rnd(25,W-25),y:-35,r:17,vy:rnd(2.4,3.5),type:'gift',rot:0,value:1});return}
 if(r<.065){pickups.push({x:rnd(25,W-25),y:-35,r:17,vy:rnd(2.4,3.5),type:'turbo',rot:0,value:1});return}
 if(r<.08){pickups.push({x:rnd(25,W-25),y:-35,r:17,vy:rnd(2.4,3.5),type:'life',rot:0,value:1});return}
 v81SpawnPickupBase();
}

// Fondo vivo: auroras, rayos, naves y lluvia de meteoritos.
const v81BackgroundBase=drawBackground;
drawBackground=function(){
 v81BackgroundBase();const t=performance.now()/1000;ctx.save();
 // Aurora ondulante
 ctx.globalCompositeOperation='screen';for(let k=0;k<3;k++){ctx.beginPath();for(let x=0;x<=W;x+=18){const y=H*(.13+k*.045)+Math.sin(x*.012+t*(.45+k*.12)+k)*24; x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=[`rgba(52,211,153,${.12-k*.02})`,`rgba(34,211,238,${.12-k*.02})`,`rgba(192,132,252,${.11-k*.02})`][k];ctx.lineWidth=24-k*5;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=28;ctx.stroke()}
 // Naves lejanas
 v81Weather.shipX=(v81Weather.shipX+.38)%(W+340)-170;ctx.globalAlpha=.55;ctx.fillStyle='#dbeafe';ctx.shadowColor='#38bdf8';ctx.shadowBlur=14;ctx.beginPath();ctx.ellipse(v81Weather.shipX,H*.24,18,4,0,0,7);ctx.fill();ctx.fillStyle='#f472b6';ctx.fillRect(v81Weather.shipX-25,H*.24-1,7,2);
 // Lluvia de meteoritos lejana
 for(let i=0;i<4;i++){const mx=((t*(70+i*19)+i*230)%(W+340))-170,my=((t*(35+i*11)+i*120)%(H*.52));const lg=ctx.createLinearGradient(mx-80,my-35,mx,my);lg.addColorStop(0,'rgba(251,146,60,0)');lg.addColorStop(1,'rgba(255,255,255,.85)');ctx.strokeStyle=lg;ctx.lineWidth=2+i*.35;ctx.beginPath();ctx.moveTo(mx-90,my-42);ctx.lineTo(mx,my);ctx.stroke()}
 // Rayos ocasionales
 if(Math.random()<.0018)v81Weather.lightning=1;if(v81Weather.lightning>0){ctx.globalAlpha=v81Weather.lightning;ctx.strokeStyle='#e0f2fe';ctx.lineWidth=2.5;ctx.shadowColor='#60a5fa';ctx.shadowBlur=24;let x=W*rnd(.12,.88);ctx.beginPath();ctx.moveTo(x,0);for(let y=0;y<H*.48;y+=28){x+=rnd(-22,22);ctx.lineTo(x,y)}ctx.stroke();v81Weather.lightning*=.76}
 ctx.restore();
}

// Estela y reflejos dinámicos según skin.
const v81DrawBallBase=drawBall;
drawBall=function(skin){
 const fx=v81Fx();ctx.save();if(fx.trail==='rainbow'){for(let i=0;i<ball.trail.length;i++){const tr=ball.trail[i],q=i/ball.trail.length;ctx.globalAlpha=q*.28;ctx.fillStyle=`hsl(${(performance.now()/12+i*26)%360} 95% 65%)`;ctx.beginPath();ctx.arc(tr.x,tr.y,ball.r*(.15+q*.56),0,7);ctx.fill()}}else if(fx.trail==='lightning'){ctx.strokeStyle=skin.c2;ctx.shadowColor=skin.c2;ctx.shadowBlur=16;ctx.lineWidth=3;ctx.beginPath();ball.trail.forEach((tr,i)=>i?ctx.lineTo(tr.x+rnd(-5,5),tr.y+rnd(-5,5)):ctx.moveTo(tr.x,tr.y));ctx.stroke()}ctx.restore();
 v81DrawBallBase(skin);ctx.save();ctx.translate(ball.x,ball.y);const t=performance.now()/1000;const rg=ctx.createRadialGradient(Math.sin(t)*ball.r*.2,-ball.r*.25,1,0,0,ball.r*1.15);rg.addColorStop(0,'rgba(255,255,255,.48)');rg.addColorStop(.28,'rgba(255,255,255,.06)');rg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,0,ball.r*.96,0,7);ctx.fill();if(v81SpawnGlow>.01){ctx.globalAlpha=v81SpawnGlow;ctx.strokeStyle=skin.c1;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,ball.r+28*(1-v81SpawnGlow),0,7);ctx.stroke()}ctx.restore()
}

// Eventos premium: inversión, gravedad reducida, portales y meteorito gigante.
function v81StartPremiumEvent(){
 const e=choice(['invert','gravity','portal','giant']);
 if(e==='invert'){v81Invert=300;eventBanner.textContent='↕️ CONTROLES INVERTIDOS'}
 if(e==='gravity'){v81LowGravity=360;eventBanner.textContent='🌙 GRAVEDAD REDUCIDA'}
 if(e==='portal'){v81PortalHue=420;eventBanner.textContent='🌀 PORTAL DIMENSIONAL'}
 if(e==='giant'){v81GiantMeteor={x:rnd(W*.2,W*.8),y:-120,r:72,vy:1.55};eventBanner.textContent='☄️ METEORITO GIGANTE'}
 eventBanner.classList.add('show');setTimeout(()=>eventBanner.classList.remove('show'),2300)
}
const v81SetTargetBase=setTarget;
setTarget=function(x,y){if(v81Invert>0){x=W-x;y=H-y}v81SetTargetBase(x,y)}
const v81UpdateBase2=update;
update=function(dt){
 const beforeCoins=runCoins;v81UpdateBase2(dt);if(state!=='play')return;const f=Math.min(2,dt/16.67);
 if(runCoins>beforeCoins){v81Tone(v81Fx().sound*1.5,.08,.025,'triangle');v81SkinBurst(ball.x,ball.y,.35)}
 if(v81Invert>0)v81Invert-=f;if(v81LowGravity>0){v81LowGravity-=f;for(const o of obstacles)o.vy*=.994}
 if(v81PortalHue>0)v81PortalHue-=f;
 if(Math.random()<.00055&&!v81GiantMeteor&&v8EventType==='')v81StartPremiumEvent();
 if(v81GiantMeteor){v81GiantMeteor.y+=v81GiantMeteor.vy*f*speedRush;if(v81GiantMeteor.y>H+130)v81GiantMeteor=null;else if(hit(ball,v81GiantMeteor,-18)){if(power.type==='shield'||power.type==='gold'||power.type==='ghost'){score+=500;runCoins+=25;v81SkinBurst(v81GiantMeteor.x,v81GiantMeteor.y,1.6);v81GiantMeteor=null}else{lives--;shake=18;flash=1;v81GiantMeteor=null;if(lives<=0){end();return}}}}
 for(const p of pickups){if(!p.dead&&hit(ball,p,2)){if(p.type==='life'){p.dead=true;lives=Math.min(5,lives+1);toast('VIDA EXTRA ♥');v81SkinBurst(p.x,p.y,1)}else if(p.type==='turbo'){p.dead=true;speedRush=2.05;speedRushTime=250;rushLabel='MEGA TURBO x2.05';toast(rushLabel);v81Tone(880,.2,.06,'sawtooth')}else if(p.type==='gift'){p.dead=true;const reward=choice([25,50,75,100]);runCoins+=reward;toast(`REGALO +${reward} 🪙`);v81SkinBurst(p.x,p.y,1.3)}}}
 pickups=pickups.filter(p=>!p.dead);v81SpawnGlow*=.9;
}
const v81DrawBase2=draw;
draw=function(){
 if(v81PortalHue>0)canvas.style.filter=`hue-rotate(${Math.sin(performance.now()/220)*45}deg) saturate(1.25)`;else canvas.style.filter='';
 v81DrawBase2();if(v81GiantMeteor){const o=v81GiantMeteor;ctx.save();ctx.translate(o.x,o.y);ctx.shadowColor='#fb923c';ctx.shadowBlur=50;const g=ctx.createRadialGradient(-22,-28,4,0,0,o.r);g.addColorStop(0,'#fff7ed');g.addColorStop(.18,'#fb923c');g.addColorStop(.58,'#9a3412');g.addColorStop(1,'#431407');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,o.r,0,7);ctx.fill();ctx.fillStyle='rgba(30,10,5,.45)';for(const c of[[-.3,-.2,.2],[.35,.12,.16],[-.05,.45,.13]]){ctx.beginPath();ctx.arc(c[0]*o.r,c[1]*o.r,c[2]*o.r,0,7);ctx.fill()}ctx.restore()}
}

// Cofre diario.
function openChest(){const today=new Date().toISOString().slice(0,10),key='cb_chest_'+today,opened=localStorage.getItem(key)==='1';modalContent.innerHTML=`<h2>COFRE DIARIO</h2><div class="chest-card"><div style="font-size:76px">${opened?'🔓':'🎁'}</div><p>${opened?'Cofre abierto. Vuelve mañana.':'Puede contener monedas o una ventaja.'}</p><button id="openChestNow" class="btn primary" ${opened?'disabled':''}>${opened?'ABIERTO':'ABRIR COFRE'}</button></div>`;openModal();if(!opened)$('#openChestNow').onclick=()=>{const reward=choice([100,150,200,250,400]);totalCoins+=reward;localStorage.setItem('cb_coins',totalCoins);localStorage.setItem(key,'1');toast(`COFRE +${reward} 🪙`);v81Tone(988,.25,.07,'triangle');openChest()}}

// Ruleta diaria.
function openWheel(){const today=new Date().toISOString().slice(0,10),key='cb_wheel_'+today,used=localStorage.getItem(key)==='1';modalContent.innerHTML=`<h2>RULETA DE PREMIOS</h2><div class="wheel-card"><div id="wheelDisc" class="wheel-disc">★</div><p>${used?'Ya has girado hoy.':'Un giro gratuito diario.'}</p><button id="spinWheel" class="btn primary" ${used?'disabled':''}>${used?'GIRO USADO':'GIRAR'}</button></div>`;openModal();if(!used)$('#spinWheel').onclick=()=>{const prizes=[50,100,150,200,300,500,750,1000],prize=choice(prizes),disc=$('#wheelDisc');disc.style.transform=`rotate(${1440+rnd(0,360)}deg)`;$('#spinWheel').disabled=true;setTimeout(()=>{totalCoins+=prize;localStorage.setItem('cb_coins',totalCoins);localStorage.setItem(key,'1');toast(`RULETA +${prize} 🪙`);v81Tone(1046,.3,.08,'triangle');openWheel()},2500)}}

// Desafíos diarios y semanales.
function openChallenges(){const dayKey=new Date().toISOString().slice(0,10),week=Math.ceil((Date.now()/86400000)/7);const daily=[['Recoge 30 monedas',Math.max(0,30-(30-missions.coins))],['Consigue 3 multiplicadores',Math.max(0,3-(5-missions.meteors))],['Llega al nivel 5',Math.min(highestLevel,5)]];modalContent.innerHTML=`<h2>DESAFÍOS</h2><span class="premium-tag">📅 DIARIOS Y SEMANALES</span>${daily.map((d,i)=>`<div class="challenge-row"><b>${d[0]}</b><small>Progreso: ${d[1]} / ${[30,3,5][i]}</small></div>`).join('')}<div class="challenge-row"><b>Desafío semanal: derrota 3 jefes</b><small>Premio: 1.500 monedas</small></div>`;openModal()}
$('#wheelBtn')&&($('#wheelBtn').onclick=openWheel);$('#chestBtn')&&($('#chestBtn').onclick=openChest);$('#challengesBtn')&&($('#challengesBtn').onclick=openChallenges);

const v81StartBase2=start;start=async function(){v81SpawnGlow=1;v81Invert=0;v81LowGravity=0;v81GiantMeteor=null;v81PortalHue=0;await v81StartBase2();v81Tone(v81Fx().sound,.25,.065,'triangle')}
openHow=function(){modalContent.innerHTML='<h2>CÓMO JUGAR · V8.1</h2><p>El mundo ahora está vivo: auroras, naves, meteoros y rayos animan cada escenario. Cada skin tiene su propio emblema, estela, sonido, explosión y efecto de recogida. Las esferas muestran claramente su función: 🧲 imán, 🛡 escudo, ⚡ turbo, x2–x20 multiplicadores, 🪙 monedas, 🔥 súper bola, 👻 fantasma, ❄ tiempo lento, ♥ vida y 🎁 regalo. También hay ruleta, cofre diario, desafíos y eventos sorpresa.</p>';openModal()};$('#howBtn').onclick=openHow;
