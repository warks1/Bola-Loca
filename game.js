
(()=>{'use strict';
const $=id=>document.getElementById(id);
if(!window.THREE){alert('No se pudo cargar Three.js. Conecta el dispositivo a Internet y vuelve a abrir la beta.');return}
const screens=['menu','modes','characters','pets','worlds','pass','missions','achievements','shop','profile','ranking','settings','pause','over'].map($);
let scene,camera,renderer,clock,worldGroup,roadGroup,runnerGroup,petGroup,bossGroup,ambientLight,keyLight,rimLight;
let state='menu',paused=false,mode='runner',score=0,coinsRun=0,level=1,combo=1,comboT=0,mult=1,multT=0,shield=0,timeLeft=90,spawnT=0,spawnI=0;
let objects=[],items=[],particles=[],boss=null,shopTab='characters',musicTimer=null,musicStep=0;
const pointer={down:false,sx:0,sy:0};
const player={x:0,targetX:0,z:0,jump:0,vy:0,run:0,distance:0};
const defaultSave={coins:900,gems:20,best:0,xp:0,totalGames:0,totalCoins:0,bosses:0,character:'nova',pet:'orb',world:'space',ownedCharacters:['nova','ninja'],ownedPets:['orb'],ownedWorlds:['space'],claimedPass:[],claimedAchievements:[],daily:0,music:true,sfx:true,vib:true,low:false,sensitivity:52,missions:{coins:0,jumps:0,boss:0,games:0,score:0}};
const save=Object.assign({},defaultSave,JSON.parse(localStorage.getItem('cb121')||'null')||{});
save.missions=Object.assign({},defaultSave.missions,save.missions||{});

const palette=['#2fe8ff','#8757ff','#ff4d7a','#ffb52f','#42e57b','#7fd6ff','#f58cff','#d8e4ff'];
const families=[
['Héroes','🦸','hero'],['Fútbol','⚽','football'],['Criaturas','✨','creature'],['Guerreros energía','💥','energy'],
['Ninjas','🥷','ninja'],['Robots','🤖','robot'],['Piratas','🏴‍☠️','pirate'],['Magos','🧙','mage'],
['Samuráis','🗡️','samurai'],['Dragones','🐉','dragon'],['Exploradores','🧑‍🚀','space'],['Deportistas','🏅','sport']
];
const names=['Solar','Nocturno','Voltio','Cobalto','Cometa','Titanio','Fénix','Centella','Nébula','Ónix','Aurora','Zenit','Prisma','Vector','Eclipse','Runa','Bruma','Atlas','Lumen','Cosmos'];
const characters=[];
let ci=0;
for(const [family,icon,style] of families){for(let i=0;i<19;i++){characters.push({id:`c_${ci}_${i}`,name:`${names[(i+ci)%names.length]} ${family}`,icon,price:i===0&&ci===0?0:280+i*25+ci*15,color:palette[(i+ci)%palette.length],accent:palette[(i+ci+3)%palette.length],family,style})}ci++}
characters.unshift({id:'nova',name:'Nova',icon:'🧑‍🚀',price:0,color:'#2fe8ff',accent:'#8b5cff',family:'Exploradores',style:'space'});
characters.unshift({id:'ninja',name:'Ninja Umbral',icon:'🥷',price:0,color:'#151821',accent:'#ff315d',family:'Ninjas',style:'ninja'});

const petFamilies=[['Dragones','🐲'],['Robots','🤖'],['Bosque','🦊'],['Marinas','🐙'],['Voladoras','🦅'],['Espíritus','👻'],['Elementales','🔥'],['Cósmicas','🪐'],['Mágicas','🦄'],['Mini monstruos','👾']];
const petNames=['Chispa','Nube','Píxel','Mochi','Bruma','Turbo','Lumi','Roco','Kira','Nexo','Mimo','Tiko','Zuri','Pipo','Runa','Mika','Orbi','Bola'];
const pets=[{id:'orb',name:'Orbe',icon:'🔮',price:0,color:'#a44dff'}];
let pi=0;for(const [family,icon] of petFamilies){for(let i=0;i<18;i++){pets.push({id:`p_${pi}_${i}`,name:`${petNames[i]} ${family}`,icon,price:220+i*22+pi*18,color:palette[(i+pi+2)%palette.length],family})}pi++}

const worlds=[
{id:'space',name:'Espacio',icon:'🌌',price:0,bg:0x050817,fog:0x111936,ground:0x0d1530,accent:0x2fe8ff},
{id:'volcano',name:'Volcán',icon:'🌋',price:350,bg:0x1b0503,fog:0x4a1208,ground:0x240b05,accent:0xff4d1f},
{id:'ice',name:'Hielo',icon:'❄️',price:400,bg:0x071628,fog:0x2c6480,ground:0x163545,accent:0x8feaff},
{id:'jungle',name:'Selva',icon:'🌴',price:500,bg:0x03170d,fog:0x1c5030,ground:0x0b2817,accent:0x4cff7a},
{id:'cyber',name:'Cyber',icon:'🏙️',price:650,bg:0x0d061b,fog:0x43135b,ground:0x110921,accent:0xff39e7}
];
const achievements=[
{id:'first',name:'Primer paso',desc:'Juega una partida',reward:50,test:()=>save.totalGames>=1},
{id:'coins',name:'Coleccionista',desc:'Consigue 100 monedas',reward:75,test:()=>save.totalCoins>=100},
{id:'boss',name:'Cazador 3D',desc:'Derrota un jefe',reward:100,test:()=>save.bosses>=1},
{id:'score',name:'Imparable',desc:'Alcanza 5.000 puntos',reward:150,test:()=>save.best>=5000}
];

function persist(){localStorage.setItem('cb121',JSON.stringify(save))}
function show(el){screens.forEach(s=>s.classList.add('hidden'));el.classList.remove('hidden')}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('show'),1000)}
function char(){return characters.find(v=>v.id===save.character)||characters[0]}
function pet(){return pets.find(v=>v.id===save.pet)||pets[0]}
function world(){return worlds.find(v=>v.id===save.world)||worlds[0]}
function playerLevel(){return Math.floor(save.xp/500)+1}
function seasonLevel(){return Math.floor(save.xp/400)+1}
function beep(f=440,d=.06,type='sine',vol=.03){if(!save.sfx&&!save.music)return;try{let A=beep.ctx||(beep.ctx=new (AudioContext||webkitAudioContext)()),o=A.createOscillator(),g=A.createGain();o.type=type;o.frequency.value=f;g.gain.value=vol;o.connect(g);g.connect(A.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d);o.stop(A.currentTime+d)}catch(e){}}
function startMusic(){if(!save.music||musicTimer)return;const arr=[220,330,440,330,262,392,494,392];musicTimer=setInterval(()=>{if(state==='play'&&!paused&&save.music)beep(arr[musicStep++%arr.length],.14,'triangle',.015)},280)}
function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}}

function init3D(){
 scene=new THREE.Scene();clock=new THREE.Clock();camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,200);
 camera.position.set(0,4.5,8.5);camera.lookAt(0,1,-8);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,save.low?1:2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
 $('game').appendChild(renderer.domElement);
 worldGroup=new THREE.Group();roadGroup=new THREE.Group();scene.add(worldGroup,roadGroup);
 ambientLight=new THREE.HemisphereLight(0xbfdfff,0x18121f,1.4);scene.add(ambientLight);
 keyLight=new THREE.DirectionalLight(0xffffff,2.4);keyLight.position.set(5,9,7);keyLight.castShadow=true;keyLight.shadow.mapSize.set(2048,2048);keyLight.shadow.camera.left=-12;keyLight.shadow.camera.right=12;keyLight.shadow.camera.top=15;keyLight.shadow.camera.bottom=-10;scene.add(keyLight);
 rimLight=new THREE.PointLight(0x31eaff,20,25);rimLight.position.set(-4,4,2);scene.add(rimLight);
 rebuildWorld();rebuildRunner();addEventListener('resize',onResize);renderer.domElement.addEventListener('pointerdown',onDown,{passive:false});renderer.domElement.addEventListener('pointermove',onMove,{passive:false});renderer.domElement.addEventListener('pointerup',onUp,{passive:false});
 animate();
}
function onResize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,save.low?1:2));renderer.setSize(innerWidth,innerHeight)}
function material(color,metal=.15,rough=.45,emissive=0x000000,ei=0){return new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough,emissive,emissiveIntensity:ei})}
function meshBox(sx,sy,sz,mat){let m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);m.castShadow=true;m.receiveShadow=true;return m}
function meshSphere(r,mat,seg=24){let m=new THREE.Mesh(new THREE.SphereGeometry(r,seg,seg),mat);m.castShadow=true;m.receiveShadow=true;return m}
function clearGroup(g){while(g.children.length){let o=g.children.pop();o.traverse?.(n=>{n.geometry?.dispose?.();if(n.material){Array.isArray(n.material)?n.material.forEach(m=>m.dispose()):n.material.dispose()}})}}
function rebuildWorld(){
 clearGroup(worldGroup);clearGroup(roadGroup);
 const w=world();
 scene.background=new THREE.Color(w.bg);
 scene.fog=new THREE.Fog(w.fog,25,105);

 // Long road so the player really travels through 3D space.
 const ground=meshBox(12,.5,4200,material(w.ground,.12,.82));
 ground.position.set(0,-.25,-2090);
 roadGroup.add(ground);

 // Lane markers rendered with InstancedMesh for high performance.
 const markerGeo=new THREE.BoxGeometry(.08,.028,1.35);
 const markerMat=material(w.accent,.65,.22,w.accent,1.8);
 const markerCount=1400;
 const markers=new THREE.InstancedMesh(markerGeo,markerMat,markerCount);
 markers.castShadow=false;markers.receiveShadow=true;
 const dummy=new THREE.Object3D();
 let mi=0;
 for(let z=16;z>-2080;z-=3){
  for(const x of [-1.8,1.8]){
   dummy.position.set(x,.02,z);dummy.updateMatrix();markers.setMatrixAt(mi++,dummy.matrix);
  }
 }
 markers.count=mi;roadGroup.add(markers);

 // Side lights and luminous tops.
 const postGeo=new THREE.BoxGeometry(.18,1.8,.18);
 const postMat=material(w.accent,.55,.25,w.accent,1.2);
 const orbGeo=new THREE.SphereGeometry(.22,14,14);
 const orbMat=material(0xffffff,.25,.16,w.accent,2.3);
 const count=540;
 const posts=new THREE.InstancedMesh(postGeo,postMat,count);
 const orbs=new THREE.InstancedMesh(orbGeo,orbMat,count);
 let ii=0;
 for(let z=14;z>-2080;z-=8){
  for(const x of [-5.2,5.2]){
   dummy.position.set(x,.9,z);dummy.updateMatrix();posts.setMatrixAt(ii,dummy.matrix);
   dummy.position.set(x,1.9,z);dummy.updateMatrix();orbs.setMatrixAt(ii,dummy.matrix);
   ii++;
  }
 }
 posts.count=ii;orbs.count=ii;roadGroup.add(posts,orbs);

 // High-definition scenery distributed along the route.
 for(let i=0;i<190;i++){
  const height=1.2+Math.random()*5;
  const prop=meshBox(
   1+Math.random()*2.4,
   height,
   1+Math.random()*2.4,
   material(i%3===0?w.accent:0x1d2745,.2,.72,i%3===0?w.accent:0x000000,i%3===0?.28:0)
  );
  prop.position.set((Math.random()<.5?-1:1)*(6+Math.random()*10),height/2,-10-Math.random()*2050);
  prop.rotation.y=Math.random()*Math.PI;
  worldGroup.add(prop);
 }
}
function createRunnerModel(){
 let c=char(),g=new THREE.Group(),bodyMat=material(c.color,.2,.35),accentMat=material(c.accent,.25,.3,c.accent,.25),dark=material(0x11131a,.15,.5);
 const body=meshBox(.75,1.15,.48,bodyMat);body.position.y=1.4;g.add(body);
 const head=meshSphere(.38,accentMat,28);head.position.y=2.25;g.add(head);
 const armL=meshBox(.22,.92,.22,bodyMat);armL.position.set(-.55,1.4,0);g.add(armL);
 const armR=armL.clone();armR.position.x=.55;g.add(armR);
 const legL=meshBox(.28,1,.3,accentMat);legL.position.set(-.22,.45,0);g.add(legL);
 const legR=legL.clone();legR.position.x=.22;g.add(legR);
 if(c.style==='hero'){let cape=meshBox(.85,1.25,.07,accentMat);cape.position.set(0,1.45,.31);cape.rotation.x=.12;g.add(cape)}
 if(c.style==='football'){let stripe=meshBox(.5,.12,.05,accentMat);stripe.position.set(0,1.45,-.27);g.add(stripe)}
 if(c.style==='ninja'){let mask=meshBox(.68,.16,.08,dark);mask.position.set(0,2.25,-.31);g.add(mask)}
 if(c.style==='robot'){let eye1=meshBox(.12,.12,.05,material(0xffffff,.1,.2,c.accent,2));eye1.position.set(-.13,2.27,-.36);g.add(eye1);let eye2=eye1.clone();eye2.position.x=.13;g.add(eye2)}
 if(c.style==='mage'){let hat=new THREE.Mesh(new THREE.ConeGeometry(.48,.95,24),accentMat);hat.position.y=2.9;hat.castShadow=true;g.add(hat)}
 if(c.style==='dragon'||c.style==='creature'){let wingMat=accentMat;for(const sx of [-1,1]){let wing=meshBox(.65,.12,.9,wingMat);wing.position.set(sx*.62,1.55,.25);wing.rotation.z=sx*.45;g.add(wing)}}
 g.userData={armL,armR,legL,legR,body,head};return g;
}
function createPetModel(){
 let p=pet(),g=new THREE.Group(),m=material(p.color,.15,.35,p.color,.15);let body=meshSphere(.3,m);g.add(body);let head=meshSphere(.22,m);head.position.y=.35;g.add(head);for(const sx of [-1,1]){let ear=meshBox(.1,.2,.1,m);ear.position.set(sx*.16,.62,0);g.add(ear);let leg=meshBox(.1,.25,.12,m);leg.position.set(sx*.18,-.28,0);g.add(leg)}return g;
}
function rebuildRunner(){if(runnerGroup)scene.remove(runnerGroup);if(petGroup)scene.remove(petGroup);runnerGroup=createRunnerModel();petGroup=createPetModel();scene.add(runnerGroup,petGroup);runnerGroup.position.set(0,0,0);petGroup.position.set(.9,.8,.4)}
function createObstacle(type,x,z){
 let g=new THREE.Group(),mat;
 if(type==='rock'){mat=material(0x5b6070,.1,.9);for(let i=0;i<4;i++){let s=meshSphere(.35+Math.random()*.25,mat,16);s.position.set((Math.random()-.5)*.4,(Math.random()-.2)*.35,(Math.random()-.5)*.4);s.scale.set(1,.7+Math.random()*.5,1);g.add(s)}}
 if(type==='crate'){mat=material(0x7b421d,.1,.65);let b=meshBox(1.1,1.1,1.1,mat);g.add(b);let band=meshBox(1.15,.12,1.15,material(0xe9b24b,.25,.35));g.add(band)}
 if(type==='drone'){mat=material(0x69788e,.6,.25);let b=meshBox(.9,.4,.75,mat);g.add(b);for(const sx of [-1,1]){let wing=meshBox(.8,.08,.25,material(0x298dff,.5,.2,0x298dff,1));wing.position.x=sx*.75;g.add(wing)}let eye=meshSphere(.12,material(0xff224d,.2,.15,0xff224d,2));eye.position.set(0,0,-.45);g.add(eye)}
 if(type==='laser'){let base=meshBox(1.5,.45,.45,material(0x202536,.4,.3));g.add(base);let beam=meshBox(1.35,.08,.08,material(0xff1f93,.3,.15,0xff1f93,3));beam.position.set(0,.15,-.28);g.add(beam)}
 if(type==='meteor'){
  const core=material(0x5b3440,.18,.8,0xff3b12,.35);
  for(let i=0;i<6;i++){
   const rock=meshSphere(.28+Math.random()*.32,core,18);
   rock.position.set((Math.random()-.5)*.65,(Math.random()-.25)*.55,(Math.random()-.5)*.65);
   rock.scale.set(1,.7+Math.random()*.5,1);
   g.add(rock);
  }
  const glow=meshSphere(.18,material(0xffd06a,.15,.2,0xff4a13,3),18);
  glow.position.set(0,.08,-.35);g.add(glow);
 }
 g.position.set(x,.6,z);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});scene.add(g);objects.push({type,mesh:g,x,z,w:type==='laser'?1.4:.8,h:type==='drone'?1.4:1});return g;
}
function createItem(type,x,z){
 let mat=type==='coin'?material(0xffc51f,.8,.2,0xffc51f,1.4):type==='shield'?material(0x21ff78,.35,.2,0x21ff78,1.2):material(0xa04cff,.4,.2,0xa04cff,1.2);
 let g=new THREE.Mesh(new THREE.TorusGeometry(.28,.09,14,28),mat);g.position.set(x,.8,z);g.castShadow=true;scene.add(g);items.push({type,mesh:g,x,z});return g;
}
function createBoss(){bossGroup=new THREE.Group();let mat=material(0x9c1234,.35,.3),acc=material(world().accent,.5,.2,world().accent,1.4);let body=meshBox(2.5,3.2,2.1,mat);body.position.y=1.6;bossGroup.add(body);let head=meshSphere(.9,acc,32);head.position.y=3.7;bossGroup.add(head);for(const sx of [-1,1]){let arm=meshBox(.55,2.5,.55,mat);arm.position.set(sx*1.6,1.7,0);bossGroup.add(arm)}bossGroup.position.set(0,0,player.z-32);scene.add(bossGroup);boss={mesh:bossGroup,hp:20,max:20};toast('JEFE 3D')}
function start(m){mode=m;state='play';paused=false;score=0;coinsRun=0;level=1;combo=1;comboT=0;mult=1;multT=0;shield=0;timeLeft=90;spawnT=0;spawnI=500;objects.forEach(o=>scene.remove(o.mesh));items.forEach(i=>scene.remove(i.mesh));objects=[];items=[];if(bossGroup){scene.remove(bossGroup);bossGroup=null;boss=null}player.x=player.targetX=0;player.z=0;player.distance=0;player.jump=0;player.vy=0;player.run=0;screens.forEach(s=>s.classList.add('hidden'));$('hud').classList.remove('hidden');$('power').classList.remove('hidden');startMusic();if(m==='boss')createBoss();toast('AVANCE 3D REAL')}
function home(){state='menu';paused=false;stopMusic();$('hud').classList.add('hidden');$('power').classList.add('hidden');$('bossbar').classList.add('hidden');renderAll();show($('menu'))}
function finish(){if(state!=='play')return;state='over';stopMusic();save.best=Math.max(save.best,Math.floor(score));save.coins+=coinsRun;save.totalCoins+=coinsRun;save.totalGames++;save.xp+=Math.floor(score/9)+coinsRun*3;save.missions.games++;save.missions.coins+=coinsRun;save.missions.score=Math.max(save.missions.score,Math.floor(score));persist();$('hud').classList.add('hidden');$('power').classList.add('hidden');$('bossbar').classList.add('hidden');$('result').textContent=`Puntos ${Math.floor(score)} · Monedas +${coinsRun} · Nivel ${level} · Récord ${save.best}`;show($('over'))}
function updateHud(){$('score').textContent=Math.floor(score);$('coins').textContent=coinsRun;$('level').textContent=level;$('combo').textContent='x'+combo;$('power').textContent='x'+mult+(shield?' · 🛡️':'')+(mode==='timed'?' · '+Math.ceil(timeLeft):'');if(boss){$('bossbar').classList.remove('hidden');$('bossName').textContent='TITÁN 3D';$('bossHp').style.width=(boss.hp/boss.max*100)+'%'}else $('bossbar').classList.add('hidden')}
function update(dt){
 if(state!=='play'||paused)return;

 const forwardSpeed=7.5+level*.38;
 player.z-=forwardSpeed*dt;
 player.distance+=forwardSpeed*dt;
 score+=dt*12*mult*combo;
 player.run+=dt*(9+level*.08);
 player.x+=(player.targetX-player.x)*Math.min(1,dt*8*save.sensitivity/52);

 if(player.jump>0||player.vy>0){
  player.vy-=dt*2.4;
  player.jump+=player.vy*dt;
  if(player.jump<=0){player.jump=0;player.vy=0}
 }

 if(mode==='timed'){
  timeLeft-=dt;
  if(timeLeft<=0){finish();return}
 }

 const nl=1+Math.floor(score/500);
 if(nl>level){
  level=nl;toast('NIVEL '+level);
  if(mode==='runner'&&level%5===0&&!boss)createBoss();
 }

 if(comboT>0&&(comboT-=dt)<=0)combo=1;
 if(multT>0&&(multT-=dt)<=0)mult=1;
 if(shield>0)shield-=dt;

 // Objects stay in world coordinates. The player runs toward them.
 for(const o of objects){
  o.z=o.mesh.position.z;
  o.mesh.rotation.y+=dt*(o.type==='meteor'?2.1:.9);
  if(o.type==='meteor')o.mesh.rotation.x+=dt*1.35;
 }
 for(const it of items){
  it.z=it.mesh.position.z;
  it.mesh.rotation.y+=dt*2.5;
  it.mesh.position.y=.8+Math.sin(performance.now()*.004+it.x)*.12;
 }
 if(boss){
  boss.mesh.rotation.y=Math.sin(performance.now()*.001)*.18;
  boss.mesh.position.x=Math.sin(performance.now()*.0015)*1.8;
 }

 spawnT-=dt;
 spawnI-=dt;
 if(spawnT<=0&&!boss){
  const obstacleTypes=['rock','crate','drone','laser','meteor'];
  createObstacle(
   obstacleTypes[Math.floor(Math.random()*obstacleTypes.length)],
   (Math.random()*2-1)*3.8,
   player.z-42-Math.random()*10
  );
  if(level>8&&Math.random()<.34){
   createObstacle(
    obstacleTypes[Math.floor(Math.random()*obstacleTypes.length)],
    (Math.random()*2-1)*3.8,
    player.z-48-Math.random()*9
   );
  }
  spawnT=Math.max(.35,1.08-level*.02);
 }
 if(spawnI<=0){
  createItem(
   Math.random()<.72?'coin':Math.random()<.55?'shield':'mult',
   (Math.random()*2-1)*3.7,
   player.z-34-Math.random()*10
  );
  spawnI=.78;
 }

 // Collision is now based on the player's real Z position.
 for(let i=objects.length-1;i>=0;i--){
  const o=objects[i];
  if(o.z>player.z+12){
   scene.remove(o.mesh);objects.splice(i,1);continue;
  }
  if(
   Math.abs(player.x-o.mesh.position.x)<o.w &&
   Math.abs(player.z-o.z)<.9 &&
   player.jump<o.h*.65
  ){
   if(shield){
    shield=0;scene.remove(o.mesh);objects.splice(i,1);toast('ESCUDO');
   }else{
    finish();return;
   }
  }
 }

 for(let i=items.length-1;i>=0;i--){
  const it=items[i];
  if(it.z>player.z+12){
   scene.remove(it.mesh);items.splice(i,1);continue;
  }
  if(Math.abs(player.x-it.mesh.position.x)<.6&&Math.abs(player.z-it.z)<.9){
   scene.remove(it.mesh);items.splice(i,1);
   combo=Math.min(8,combo+1);comboT=2.2;
   if(it.type==='coin'){coinsRun++;score+=25*mult;beep(720,.04)}
   else if(it.type==='shield'){shield=9;toast('ESCUDO')}
   else{mult=[2,3,5][Math.floor(Math.random()*3)];multT=7;toast('x'+mult)}
  }
 }

 if(boss&&Math.abs(player.z-boss.mesh.position.z)<2.2&&Math.abs(player.x-boss.mesh.position.x)<1.7&&player.jump<1.1){
  if(shield){shield=0;boss.mesh.position.z=player.z-28;toast('GOLPE BLOQUEADO')}
  else{finish();return}
 }

 // Character and pet travel through the actual 3D world.
 runnerGroup.position.set(player.x,player.jump,player.z);
 runnerGroup.rotation.z=(player.targetX-player.x)*-.08;
 petGroup.position.set(
  player.x+.85+Math.cos(performance.now()*.002)*.15,
  .85+player.jump+Math.sin(performance.now()*.004)*.12,
  player.z+.45
 );

 const u=runnerGroup.userData,a=Math.sin(player.run)*.78;
 u.armL.rotation.x=a;u.armR.rotation.x=-a;
 u.legL.rotation.x=-a;u.legR.rotation.x=a;
 u.body.position.y=1.4+Math.abs(Math.sin(player.run))*.07;
 u.head.position.y=2.25+Math.abs(Math.sin(player.run))*.07;

 // Third-person chase camera follows the forward movement.
 const desiredCameraZ=player.z+8.7;
 camera.position.x+=(player.x*.2-camera.position.x)*dt*4;
 camera.position.y=4.5+Math.sin(performance.now()*.004)*.05;
 camera.position.z+=(desiredCameraZ-camera.position.z)*Math.min(1,dt*7);
 camera.lookAt(player.x*.09,1.2,player.z-9);

 keyLight.position.set(player.x+5,player.jump+9,player.z+7);
 rimLight.position.set(player.x-4,player.jump+4,player.z+2);

 updateHud();
}
function animate(){requestAnimationFrame(animate);let dt=Math.min(clock.getDelta(),.033);update(dt);renderer.render(scene,camera)}
function onDown(e){if(state!=='play'||paused)return;pointer.down=true;pointer.sx=e.clientX;pointer.sy=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId);onMove(e);e.preventDefault()}
function onMove(e){if(!pointer.down||state!=='play'||paused)return;let r=renderer.domElement.getBoundingClientRect(),nx=((e.clientX-r.left)/r.width)*2-1;player.targetX=Math.max(-4,Math.min(4,nx*4.4));e.preventDefault()}
function onUp(e){if(!pointer.down)return;let dy=e.clientY-pointer.sy;if(dy<-45&&player.jump===0){player.vy=5.2;save.missions.jumps++;beep(430,.05)}pointer.down=false;renderer.domElement.releasePointerCapture?.(e.pointerId)}

function renderAll(){
 $('characterCount').textContent=`${characters.length} personajes originales disponibles`;
 $('characterGrid').innerHTML=characters.map(v=>{let own=save.ownedCharacters.includes(v.id),active=save.character===v.id;return `<button class="itemCard ${active?'active':''} ${own?'':'locked'}" data-char="${v.id}"><div class="itemIcon">${v.icon}</div>${v.name}<small>${v.family}<br>${own?'EQUIPAR':v.price+' monedas'}</small></button>`}).join('');
 document.querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>{let v=characters.find(x=>x.id===b.dataset.char);if(save.ownedCharacters.includes(v.id)){save.character=v.id;persist();rebuildRunner();renderAll();toast('Personaje equipado')}else toast('Cómpralo en la tienda')});
 $('petCount').textContent=`${pets.length} mascotas originales disponibles`;
 $('petGrid').innerHTML=pets.map(v=>{let own=save.ownedPets.includes(v.id),active=save.pet===v.id;return `<button class="itemCard ${active?'active':''} ${own?'':'locked'}" data-pet="${v.id}"><div class="itemIcon">${v.icon}</div>${v.name}<small>${v.family||''}<br>${own?'EQUIPAR':v.price+' monedas'}</small></button>`}).join('');
 document.querySelectorAll('[data-pet]').forEach(b=>b.onclick=()=>{let v=pets.find(x=>x.id===b.dataset.pet);if(save.ownedPets.includes(v.id)){save.pet=v.id;persist();rebuildRunner();renderAll();toast('Mascota equipada')}else toast('Cómprala en la tienda')});
 $('worldGrid').innerHTML=worlds.map(v=>{let own=save.ownedWorlds.includes(v.id),active=save.world===v.id;return `<button class="itemCard ${active?'active':''} ${own?'':'locked'}" data-world="${v.id}"><div class="itemIcon">${v.icon}</div>${v.name}<small>${own?'SELECCIONAR':v.price+' monedas'}</small></button>`}).join('');
 document.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>{let v=worlds.find(x=>x.id===b.dataset.world);if(save.ownedWorlds.includes(v.id)){save.world=v.id;persist();rebuildWorld();renderAll();toast('Mundo seleccionado')}else toast('Cómpralo en la tienda')});
 let sx=save.xp%400;$('passInfo').innerHTML=`<div class="box"><b>Nivel de temporada ${seasonLevel()}</b><small> · ${sx}/400 XP</small><div class="progress"><i style="width:${sx/4}%"></i></div></div>`;
 $('passRewards').innerHTML=Array.from({length:6},(_,i)=>i+1).map(n=>{let ok=save.xp>=n*400,cl=save.claimedPass.includes(n);return `<div class="box"><b>Nivel ${n+1}: ${n%3===0?'5 gemas':'100 monedas'}</b><button class="btn ${ok&&!cl?'gold':'secondary'} claimPass" data-pass="${n}" ${!ok||cl?'disabled':''}>${cl?'RECOGIDO':ok?'RECOGER':'BLOQUEADO'}</button></div>`}).join('');
 document.querySelectorAll('.claimPass').forEach(b=>b.onclick=()=>{let n=+b.dataset.pass;if(save.xp>=n*400&&!save.claimedPass.includes(n)){save.claimedPass.push(n);n%3===0?save.gems+=5:save.coins+=100;persist();renderAll();toast('Recompensa recogida')}});
 $('missionList').innerHTML=`<div class="box"><b>Recoge 50 monedas</b><small> · ${Math.min(save.missions.coins,50)}/50</small></div><div class="box"><b>Salta 20 veces</b><small> · ${Math.min(save.missions.jumps,20)}/20</small></div><div class="box"><b>Juega 3 partidas</b><small> · ${Math.min(save.missions.games,3)}/3</small></div>`;
 $('achievementList').innerHTML=achievements.map(a=>{let ok=a.test(),cl=save.claimedAchievements.includes(a.id);return `<div class="box"><b>${ok?'✅':'🔒'} ${a.name}</b><small> · ${a.desc}</small><button class="btn ${ok&&!cl?'gold':'secondary'} claimAch" data-ach="${a.id}" ${!ok||cl?'disabled':''}>${cl?'RECOGIDO':ok?'RECOGER '+a.reward:'BLOQUEADO'}</button></div>`}).join('');
 document.querySelectorAll('.claimAch').forEach(b=>b.onclick=()=>{let a=achievements.find(v=>v.id===b.dataset.ach);if(a.test()&&!save.claimedAchievements.includes(a.id)){save.claimedAchievements.push(a.id);save.coins+=a.reward;persist();renderAll();toast('Logro reclamado')}});
 $('wallet').textContent=`Monedas: ${save.coins} · Gemas: ${save.gems}`;renderShop();
 $('profileStats').innerHTML=`<div class="statCard"><b>${playerLevel()}</b>Nivel</div><div class="statCard"><b>${save.best}</b>Récord</div><div class="statCard"><b>${save.totalGames}</b>Partidas</div><div class="statCard"><b>${save.bosses}</b>Jefes</div>`;
 $('profileInfo').innerHTML=`<div class="box"><b>Personaje</b><small> · ${char().icon} ${char().name}</small></div><div class="box"><b>Mascota</b><small> · ${pet().icon} ${pet().name}</small></div><div class="box"><b>Mundo</b><small> · ${world().icon} ${world().name}</small></div>`;
 $('rankList').innerHTML=[['Nova3D',18500],['Astro',15200],['Luna',12800],['Tú',save.best],['Bolt',7600]].sort((a,b)=>b[1]-a[1]).map((r,i)=>`<div class="rankrow"><span>${i+1}. ${r[0]}</span><b>${r[1]}</b></div>`).join('');
 $('musicToggle').checked=save.music;$('sfxToggle').checked=save.sfx;$('vibToggle').checked=save.vib;$('lowToggle').checked=save.low;$('sensRange').value=save.sensitivity;
 let today=Math.floor(Date.now()/86400000),claimed=save.daily===today;$('dailyBtn').textContent=claimed?'PREMIO YA RECOGIDO':'🎁 RECOGER 100 MONEDAS';$('dailyBtn').disabled=claimed;
}
function renderShop(){document.querySelectorAll('.shopTab').forEach(t=>t.classList.toggle('active',t.dataset.shop===shopTab));let list=shopTab==='characters'?characters.filter(v=>!save.ownedCharacters.includes(v.id)):shopTab==='pets'?pets.filter(v=>!save.ownedPets.includes(v.id)):worlds.filter(v=>!save.ownedWorlds.includes(v.id));$('shopList').innerHTML=list.map(v=>`<button class="btn secondary buyItem" data-id="${v.id}">${v.icon} ${v.name} · ${v.price} monedas</button>`).join('')||'<div class="box">Todo comprado.</div>';document.querySelectorAll('.buyItem').forEach(b=>b.onclick=()=>{let arr=shopTab==='characters'?characters:shopTab==='pets'?pets:worlds,v=arr.find(x=>x.id===b.dataset.id);if(save.coins<v.price){toast('Faltan monedas');return}save.coins-=v.price;(shopTab==='characters'?save.ownedCharacters:shopTab==='pets'?save.ownedPets:save.ownedWorlds).push(v.id);persist();renderAll();toast('Comprado')})}

$('playBtn').onclick=()=>show($('modes'));$('charactersBtn').onclick=()=>{renderAll();show($('characters'))};$('petsBtn').onclick=()=>{renderAll();show($('pets'))};$('worldsBtn').onclick=()=>{renderAll();show($('worlds'))};$('passBtn').onclick=()=>{renderAll();show($('pass'))};$('missionsBtn').onclick=()=>{renderAll();show($('missions'))};$('achievementsBtn').onclick=()=>{renderAll();show($('achievements'))};$('shopBtn').onclick=()=>{renderAll();show($('shop'))};$('profileBtn').onclick=()=>{renderAll();show($('profile'))};$('rankingBtn').onclick=()=>{renderAll();show($('ranking'))};$('settingsBtn').onclick=()=>{renderAll();show($('settings'))};
document.querySelectorAll('.startMode').forEach(b=>b.onclick=()=>start(b.dataset.mode));document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>show($('menu')));document.querySelectorAll('.shopTab').forEach(b=>b.onclick=()=>{shopTab=b.dataset.shop;renderShop()});
$('pauseBtn').onclick=e=>{e.preventDefault();e.stopPropagation();if(state!=='play')return;paused=true;state='pause';show($('pause'))};$('resumeBtn').onclick=()=>{paused=false;state='play';screens.forEach(s=>s.classList.add('hidden'))};$('quitBtn').onclick=home;$('homeBtn').onclick=home;$('retryBtn').onclick=()=>start(mode);
$('dailyBtn').onclick=()=>{let t=Math.floor(Date.now()/86400000);if(save.daily!==t){save.daily=t;save.coins+=100;persist();renderAll();toast('+100 monedas')}};
$('musicToggle').onchange=e=>{save.music=e.target.checked;save.music?startMusic():stopMusic();persist()};$('sfxToggle').onchange=e=>{save.sfx=e.target.checked;persist()};$('vibToggle').onchange=e=>{save.vib=e.target.checked;persist()};$('lowToggle').onchange=e=>{save.low=e.target.checked;persist();onResize()};$('sensRange').oninput=e=>{save.sensitivity=+e.target.value;persist()};
init3D();renderAll();home();
})();
