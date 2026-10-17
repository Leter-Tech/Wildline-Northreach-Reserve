import * as T from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {makeWolf} from './night.js';
import {TRUCK} from './vehicle.js';
import {baseHeight} from './core.js';

export function createTowerJob(c){
 const {s,world,scene,height}=c,P={x:-65,z:-96,r:14},bait=new T.Vector3(-315,height(-315,-365),-365),bank=new T.Vector3(-65,height(-65,-78),-78);
 let extras=[],fish=[],group=new T.Group();scene.add(group);
 const baitRing=new T.Mesh(new T.RingGeometry(2.4,2.65,64),new T.MeshBasicMaterial({color:0xf4cf83,transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false}));baitRing.rotation.x=-Math.PI/2;baitRing.position.copy(bait);baitRing.position.y+=.12;baitRing.visible=false;scene.add(baitRing);
 const active=()=>c.mission().species==='bear',state=()=>s.towerJob;
 const waterY=baseHeight(P.x,P.z)-.72;
 const near=(p,d=4)=>Math.hypot(s.position.x-p.x,s.position.z-p.z)<d;
 const hud=document.createElement('div');hud.id='fishStock';hud.className='hidden';hud.innerHTML='<span>NIGHT WATCH · POND RESERVE</span><div class="fish-gauge"><i></i></div><b></b><strong class="wave-clock"></strong>';document.getElementById('hud').appendChild(hud);
 const rod=new T.Group(),rodSkin=clone(world.assets.rod.scene);rod.add(rodSkin);rodSkin.updateMatrixWorld(true);let rb=new T.Box3().setFromObject(rodSkin),rs=rb.getSize(new T.Vector3());if(rs.y>=rs.x&&rs.y>=rs.z)rodSkin.rotation.x=-Math.PI/2;else if(rs.x>=rs.z)rodSkin.rotation.y=Math.PI/2;rodSkin.updateMatrixWorld(true);rb.setFromObject(rodSkin);rodSkin.scale.multiplyScalar(2.1/rb.getSize(new T.Vector3()).length());rodSkin.updateMatrixWorld(true);rb.setFromObject(rodSkin);rodSkin.position.sub(rb.getCenter(new T.Vector3()));rod.position.set(.4,-.4,-1.3);rod.visible=false;c.camera.add(rod);
 const card=document.createElement('article');card.className='shop-card locked';card.id='shopRodCard';card.innerHTML='<div class="shop-image"><img alt="Fishing rod"><span class="shop-lock">LOCKED</span></div><h3>Fishing rod</h3><p></p><button>Buy · $350</button>';document.querySelector('.shop-grid').appendChild(card);card.querySelector('img').src=world.shop.rodThumbnail;
 card.querySelector('button').onclick=()=>{if(!active()||!s.active||state().rodPurchased||c.balance()<350)return;c.pay(350);state().rodPurchased=true;renderShop();c.checkpoint();};
 function renderShop(){const available=active(),b=state(),button=card.querySelector('button');card.classList.toggle('locked',!available);button.hidden=!available;button.disabled=!!b?.rodPurchased||c.balance()<350;button.textContent=b?.rodPurchased?'Packed':'Buy · $350';card.querySelector('p').textContent=available?'Fish at the marked pond bank · Hold E':'Available for the tower watch job';}
 function board(title,text){c.setAim(false);document.body.classList.remove('night-aim');c.board(title,text);}
 function bear(){return c.animals().find(a=>a.species==='bear');}
 function removeExtras(){for(const a of extras){a.root.removeFromParent();const i=c.animals().indexOf(a);if(i>=0)c.animals().splice(i,1);}extras=[];}
 function fishModel(i){const root=new T.Group(),skin=clone(world.assets['fish'+(i%3+1)].scene);root.add(skin);skin.updateMatrixWorld(true);let box=new T.Box3().setFromObject(skin),size=box.getSize(new T.Vector3());skin.scale.multiplyScalar(.9/Math.max(size.x,size.y,size.z,.01));skin.updateMatrixWorld(true);box.setFromObject(skin);skin.position.sub(box.getCenter(new T.Vector3()));skin.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.castShadow=true;}});return root;}
 function spawnFish(){fish=[];for(let i=0;i<20;i++){const root=fishModel(i),a={root,model:root,species:'fish',towerExtra:true,active:true,dead:false,collected:false,health:1,hitCount:0,index:100+i,anim:{stride:{value:0}},phase:i*2.399};root.traverse(o=>{if(o.isMesh)o.userData.animal=a;});scene.add(root);fish.push(a);}refreshFish();}
 function refreshFish(){const b=state();if(!b)return;baitRing.visible=b.stage==='bait'&&b.placed<20;for(let i=0;i<fish.length;i++){const a=fish[i],caught=b.fishKilled.includes(i);a.dead=caught;a.collected=b.collected;a.active=b.stage==='fish';a.root.removeFromParent();a.root.rotation.set(0,a.phase,0);a.root.visible=true;
  if(b.collected&&i>=b.placed){world.truck.add(a.root);a.root.position.set((i%4-1.5)*.4,TRUCK.bed.floor+.12+Math.floor(i/12)*.13,TRUCK.bed.centerZ+(Math.floor(i/4)%3-1)*.6);a.root.rotation.z=Math.PI/2;}
  else if(b.collected){group.add(a.root);const x=bait.x+Math.cos(a.phase)*(1+i%3*.32),z=bait.z+Math.sin(a.phase)*(1+i%3*.32);a.root.position.set(x,height(x,z)+.12,z);a.root.rotation.z=Math.PI/2;}
  else{scene.add(a.root);const x=P.x+Math.cos(a.phase)*(4+i%4*1.8),z=P.z+Math.sin(a.phase)*(4+i%4*1.8);a.root.position.set(x,waterY+.06,z);if(caught)a.root.rotation.z=Math.PI/2;}
 }}
 function attachFish(){for(const a of fish)if(!extras.includes(a)){extras.push(a);c.animals().push(a);}}
 function spawnPack(restoring=false){const b=state();removeExtras();if(!restoring){b.wave++;b.wolves=Array.from({length:4},(_,i)=>{const angle=(b.wave*.83+i*.55)+Math.PI*.55;return{dead:false,x:P.x+Math.cos(angle)*65,z:P.z+Math.sin(angle)*65};});}
  for(let i=0;i<b.wolves.length;i++){const r=b.wolves[i],a=makeWolf(world.assets.nightWolf,50+i,r.x,r.z,height);a.towerExtra=true;a.dead=r.dead;a.health=a.dead?0:1;a.root.visible=!a.dead;a.record=r;a.bankAngle=Math.atan2(r.x-P.x,r.z-P.z);extras.push(a);c.animals().push(a);scene.add(a.root);}
  c.audio.setCombat(true);
 }
 function setup(){removeExtras();for(const a of fish)a.root.removeFromParent();fish=[];group.clear();rod.visible=false;baitRing.visible=false;hud.classList.add('hidden');if(!active())return;
  s.towerJob??={stage:'tower',wave:0,stock:100,delay:3,dawn:0,wait:10,onTower:false,wolves:[],fishKilled:[],collected:false,placed:0,rodPurchased:false};
  const b=state();spawnFish();if(b.stage==='defend')spawnPack(true);const a=bear();a.active=b.stage==='hunt';a.root.visible=a.active;a.arrival=Infinity;refreshFish();
 }
 function interaction(){if(!active()||s.driving||s.carry)return null;const b=state();
  if(b.onTower)return b.stage==='tower'||b.stage==='defend'||b.stage==='between'||b.stage==='dawn'?{type:'towerStay',title:'Watch the pond',sub:'Hold SHIFT · aim · Left click · fire · R · reload'}:{type:'towerDown',title:'Climb down',sub:'E · descend the tower'};
  if(b.stage==='tower'&&near(world.tower.position,6))return{type:'towerUp',title:'Climb the watchtower',sub:'E · begin the night watch'};
  if(b.stage==='fish'&&b.rodPurchased&&near(bank,6))return{type:'towerCollect',title:'Fish the pond',sub:'Hold E for 5 seconds · catch and load twenty fish',hold:5};
  if(b.stage==='bait'&&near(bait))return{type:'towerBait',title:'Place fish bait',sub:'Hold E · '+b.placed+' / 20 placed',hold:.45};
  if(b.stage==='return'&&near(world.desk.position,4.8))return{type:'towerWait',title:'Watch the bait site',sub:'E · wait ten seconds'};
  return null;
 }
 function act(a){if(!active()||!a.type.startsWith('tower'))return false;const b=state();
  if(a.type==='towerUp'){b.onTower=true;b.stage='between';b.delay=3;c.stopInput();s.velocity.set(0,0,0);s.yaw=Math.atan2(world.tower.position.x-P.x,world.tower.position.z-P.z);s.pitch=-.12;board('Protect the pond.','Five packs of four wolves will approach the water. Each wolf takes one shot. Wolves feeding at the bank slowly drain the fish supply; losing it all fails the job. Clear each pack, then watch for the next after ten seconds. Your night optic is ready.');}
  if(a.type==='towerDown'){b.onTower=false;c.stopInput();s.position.set(world.tower.position.x+5,height(world.tower.position.x+5,world.tower.position.z)+1.72,world.tower.position.z);}
  if(a.type==='towerCollect'){if(!b.rodPurchased)return true;b.fishKilled=Array.from({length:20},(_,i)=>i);b.collected=true;b.stage='bait';removeExtras();refreshFish();board('Prepare the bear bait.','Twenty fish are in your truck. Drive to Briarwood Basin and hold E at the marker to place each fish. Lay all twenty, then return to the station laptop.');}
  if(a.type==='towerBait'){b.placed++;refreshFish();if(b.placed===20){b.stage='return';board('Leave the bait site.','Return to the station and press E beside the laptop to begin the ten-second wait.');}}
  if(a.type==='towerWait'){b.stage='wait';b.wait=10;c.stopInput();s.velocity.set(0,0,0);board('Watch for the bear.','Wait here for ten seconds. Then return to Briarwood Basin. The bear takes five shots within 60 metres and each charge removes 50 health. Recover it, load the truck and sell it at the station.');}
  c.checkpoint();return true;
 }
 function kill(a){if(!a.towerExtra)return false;a.dead=true;a.health=0;a.mixer?.stopAllAction();
  if(a.species==='wolf'){a.record.dead=true;a.root.visible=false;s.wolfKills++;if(extras.every(w=>w.dead)){c.audio.setCombat(false);document.getElementById('waypoint').style.display='none';}}
  else{const i=fish.indexOf(a);if(!state().fishKilled.includes(i))state().fishKilled.push(i);a.root.rotation.z=Math.PI/2;if(state().fishKilled.length===20)board('Gather the catch.','All twenty fish are down. Go to the marked bank and hold E to collect them together and load them into your truck.');}
  c.checkpoint();return true;
 }
 function tick(dt){baitRing.visible=active()&&state()?.stage==='bait'&&state()?.placed<20;hud.classList.toggle('hidden',!active()||!state()?.onTower||!['between','defend'].includes(state()?.stage));if(!active())return;const b=state(),el=document.getElementById('baitTime');
  hud.querySelector('.fish-gauge i').style.width=b.stock+'%';hud.querySelector('b').textContent=Math.ceil(b.stock)+'% REMAINING · PACK '+Math.max(1,b.wave)+' / 5';hud.querySelector('.wave-clock').textContent=b.stage==='between'?'NEXT PACK IN '+Math.ceil(b.delay)+'s':'';
  if(b.stage==='between'){b.delay=Math.max(0,b.delay-dt);if(!b.delay){b.stage='defend';spawnPack();c.checkpoint();}}
  if(b.stage==='defend'){for(const a of extras){if(a.dead)continue;const dest=new T.Vector3(P.x+Math.sin(a.bankAngle)*(P.r+.6),0,P.z+Math.cos(a.bankAngle)*(P.r+.6)),dir=dest.sub(a.root.position).setY(0),d=dir.length();if(d>1){dir.normalize();a.root.position.addScaledVector(dir,Math.min(d,4.5*dt));a.root.rotation.y=Math.atan2(dir.x,dir.z);a.run.enabled=true;a.idle.enabled=false;}else{b.stock=Math.max(0,b.stock-.24*dt);a.run.enabled=false;a.idle.enabled=true;a.idle.play();}a.root.position.y=height(a.root.position.x,a.root.position.z)+.035;a.mixer.update(dt);a.record.x=a.root.position.x;a.record.z=a.root.position.z;}
   if(b.stock<=0){c.fail('The pond is depleted.','The wolves consumed the fish supply. Protect the bank more quickly on your next watch.');return;}
   if(extras.every(a=>a.dead)){c.audio.setCombat(false);removeExtras();if(b.wave===5){b.stage='dawn';c.stopInput();board('The pond is safe.','All five packs are cleared. Wait for dawn, then climb down. Buy a fishing rod at the Equipment Shop and hold E at the marked pond bank to catch twenty fish.');}else{b.stage='between';b.delay=10;}c.checkpoint();}
  }
  if(b.stage==='dawn'){b.dawn=Math.min(12,b.dawn+dt);const t=T.MathUtils.smoothstep(b.dawn,0,12);c.lighting.dawn(t);c.audio.setDawn(t);el.classList.remove('hidden');el.textContent='DAWN · THE POND IS SAFE';if(b.dawn===12){b.stage='fish';c.lighting.set(false);c.audio.setNight(false);el.classList.add('hidden');c.checkpoint();board('Harvest twenty fish.','Press E to climb down. Buy a fishing rod at the Equipment Shop for $350, then go to the marked pond bank. Hold E for five seconds to fish and load all twenty fish into your truck.');}}
  if(b.stage==='fish'){b.swim=(b.swim||0)+dt;for(let i=0;i<fish.length;i++){const a=fish[i];if(a.dead)continue;const angle=a.phase+b.swim*.11,r=4+i%4*1.8;a.root.position.set(P.x+Math.cos(angle)*r,waterY+.06+Math.sin(b.swim*2+i)*.025,P.z+Math.sin(angle)*r);a.root.rotation.y=-angle;}}
  if(b.stage==='wait'){b.wait=Math.max(0,b.wait-dt);el.classList.remove('hidden');el.textContent='BAIT WATCH · '+Math.ceil(b.wait)+'s';if(!b.wait){b.stage='hunt';bear().active=true;bear().root.visible=true;el.classList.add('hidden');c.checkpoint();board('The bear has arrived.','Return to Briarwood Basin. Get within 60 metres, land five shots and avoid its charges. Recover the bear, load it into the truck and return to sell it.');}}
 }
 function objective(){if(!active()||state().stage==='hunt')return null;const b=state();let target=world.tower.position,text='Climb the watchtower',sub='E · climb · Night optic equipped';
  if(['defend','between'].includes(b.stage)){target=extras.find(a=>!a.dead)?.root.position||bank;text=b.stage==='between'?'Watch for the next pack':'Protect the pond';sub=b.stage==='between'?'Next pack in '+Math.ceil(b.delay)+'s':'Pack '+b.wave+' / 5 · '+Math.ceil(b.stock)+'% fish remaining';}
  if(b.stage==='dawn'){target=bank;text='Wait for morning';sub='All five packs cleared';}
  if(b.stage==='fish'){target=b.onTower?world.tower.position:!b.rodPurchased?world.shop.table.position:bank;text=b.onTower?'Climb down to the pond':!b.rodPurchased?'Buy a fishing rod':'Fish at the pond bank';sub=b.onTower?'E · descend':!b.rodPurchased?'Equipment Shop · $350':'Hold E for 5 seconds · Catch all twenty fish';}
  if(b.stage==='bait'){target=bait;text='Lay fish bait in Briarwood Basin';sub=b.placed+' / 20 · Hold E to place each fish';}
  if(['return','wait'].includes(b.stage)){target=world.desk.position;text=b.stage==='wait'?'Watch the bait site':'Return to the station laptop';sub=b.stage==='wait'?Math.ceil(b.wait)+' seconds remaining':'E · start the wait';}
  return{target,text,sub,stage:'TOWER WATCH · BEAR EXPEDITION'};
 }
 return{setup,tick,act,kill,interaction,objective,renderShop,get fishing(){return !!(active()&&state()?.stage==='fish'&&state()?.rodPurchased===true&&!state()?.onTower&&near(bank,6));},get hideMarker(){return active()&&(['between','dawn'].includes(state()?.stage)||state()?.stage==='defend'&&!extras.some(a=>!a.dead));},get stage(){return active()?state()?.stage:null;},get onTower(){return active()&&state()?.onTower;},get locked(){return active()&&(state()?.onTower||['wait','dawn'].includes(state()?.stage));},get target(){return active()?extras.find(a=>a.active&&!a.dead)||null:null;},get mapMarkers(){const o=objective();return o&&!this.hideMarker?[o.target]:[];},get canShoot(){return !active()||['defend','hunt'].includes(state()?.stage);},camera(camera){rod.visible=!!(this.fishing&&s.mode==='playing');rod.rotation.x=s.hold>0?-.1+Math.sin(s.hold*2)*.04:0;if(this.onTower){s.position.copy(world.tower.userData.eyePosition);s.velocity.set(0,0,0);camera.position.copy(s.position);}}};
}
