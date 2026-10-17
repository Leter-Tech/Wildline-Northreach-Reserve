import * as T from 'three';
import {makeWolf} from './night.js';
import {steerAlligator} from './alligators.js';
export const GRAND_QUOTAS={goose:20,boar:25,rabbit:30,wolf:25,deer:15,alligator:8,rhino:6,lion:6,bear:5};
const NAMES={goose:'Flying geese',boar:'Wild boars',rabbit:'Rabbits',wolf:'Wolves',deer:'Deer',alligator:'Alligators',rhino:'Rhinos',lion:'Lionesses',bear:'Bears'};
export function createGrandHunt(c){
 const {s,world,scene,height,camera}=c;let herd=[],selected=null;
 const active=()=>c.mission().species==='grand',state=()=>s.grand;
 const panel=document.createElement('aside');panel.id='grandTracker';panel.className='hidden';panel.innerHTML='<p>FINAL EXPEDITION</p><h3>The Grand Hunt</h3><div class="grand-total"></div><div class="grand-list"></div><small>NO TIME LIMIT · NO COLLECTION</small>';document.getElementById('hud').appendChild(panel);
 for(const [species,quota]of Object.entries(GRAND_QUOTAS)){const row=document.createElement('div');row.dataset.species=species;row.innerHTML='<span>'+NAMES[species]+'</span><b>0 / '+quota+'</b><i><em></em></i>';panel.querySelector('.grand-list').appendChild(row);}
 function tally(){const b=state();if(!b)return;panel.querySelector('.grand-total').textContent=Object.values(b.counts).reduce((a,v)=>a+v,0)+' / 140';for(const [species,q]of Object.entries(GRAND_QUOTAS)){const row=panel.querySelector('[data-species="'+species+'"]'),n=b.counts[species]||0;row.querySelector('b').textContent=n+' / '+q;row.querySelector('em').style.width=n/q*100+'%';row.classList.toggle('done',n>=q);}}
 function add(r){if(r.species==='goose'&&!r.dead&&r.flightLane!=='pondLR'){const offset=44+(r.id%4)*5;r.x=-65-.98*offset;r.z=-96+.199*offset+(r.id%3)*2;r.dx=.98;r.dz=-.199;r.y=Math.max(height(r.x,r.z)+.7,world.tower.userData.eyePosition.y-.8);r.heading=Math.atan2(r.dx,r.dz);r.age=0;r.flightLane='pondLR';}const a=r.species==='wolf'?makeWolf(world.assets.nightWolf,r.id,r.x,r.z,height):c.makeAnimal(r.species,r.id,r.x,r.z);
  a.grandExtra=true;a.ambush=false;a.active=true;a.health=r.dead?0:1;a.dead=r.dead;a.alerted=false;a.record=r;a.root.position.set(r.x,r.y,r.z);a.root.rotation.y=r.heading||0;a.death=r.death||0;
  if(a.mixer){a.mixer.stopAllAction();if(a.species==='goose')a.actions.fly?.play();else a.run?.play();if(a.dead)a.mixer.stopAllAction();}
  scene.add(a.root);c.animals().push(a);herd.push(a);if(r.settled){a.model.rotation.z=-Math.PI/2;if(a.species==='wolf')a.model.quaternion.setFromAxisAngle(new T.Vector3(0,0,1),-Math.PI/2).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/2));a.root.updateMatrixWorld(true);}return a;
 }
 function setup(){for(const a of herd){a.root.removeFromParent();const i=c.animals().indexOf(a);if(i>=0)c.animals().splice(i,1);}herd=[];selected=null;panel.classList.add('hidden');if(!active())return;
  s.grand??={stage:'tower',counts:Object.fromEntries(Object.keys(GRAND_QUOTAS).map(k=>[k,0])),records:[],next:0,delay:2,finish:0};
  for(const r of state().records)add(r);tally();
 }
 function spawn(){const b=state(),living=herd.filter(a=>!a.dead),eligible=Object.keys(GRAND_QUOTAS).filter(k=>(b.counts[k]||0)+living.filter(a=>a.species===k).length<GRAND_QUOTAS[k]);if(!eligible.length||living.length>=10)return;
  b.queue=(b.queue||[]).filter(k=>eligible.includes(k));if(!b.queue.length){b.queue=[...eligible];for(let i=b.queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b.queue[i],b.queue[j]]=[b.queue[j],b.queue[i]];}}const species=b.queue.shift(),remaining=GRAND_QUOTAS[species]-(b.counts[species]||0)-living.filter(a=>a.species===species).length,n=Math.min(remaining,10-living.length,2+Math.floor(Math.random()*3)),angle=Math.random()*Math.PI*2,dx=Math.sin(angle),dz=Math.cos(angle),tx=world.tower.position.x,tz=world.tower.position.z;
  for(let i=0;i<n;i++){const offset=15+Math.random()*22+i*2,x=tx+dx*65-dz*offset,z=tz+dz*65+dx*offset,id=b.next++;add({id,species,x,z,y:height(x,z)+(species==='goose'?20+Math.random()*7:.04),dx:-dx,dz:-dz,heading:angle+Math.PI,age:0,dead:false,death:0,settled:false});b.records.push(herd[herd.length-1].record);}
 }
 function kill(a){if(!a.grandExtra)return false;const b=state();if(a.dead)return true;a.dead=true;a.health=0;a.record.dead=true;a.mixer?.stopAllAction();a.anim.stride.value=0;b.counts[a.species]++;s.kills++;if(a.clean)s.clean++;selected=null;tally();c.checkpoint();return true;}
 function tick(dt){panel.classList.toggle('hidden',!active()||state()?.stage!=='hunt'||s.mode!=='playing');if(!active()||state().stage!=='hunt')return;const b=state();
  b.delay-=dt;if(b.delay<=0){spawn();b.delay=4+Math.random()*3;}
  for(const a of [...herd]){const r=a.record,p=a.root.position;
   if(a.dead){if(!r.settled){r.death=Math.min(1,(r.death||0)+dt*1.8);a.model.rotation.z=-Math.PI/2*T.MathUtils.smoothstep(r.death,0,1);if(a.species==='wolf')a.model.quaternion.setFromAxisAngle(new T.Vector3(0,0,1),a.model.rotation.z).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/2));if(a.species==='goose'){r.fall=(r.fall||0)+18*dt;p.y-=r.fall*dt;}else p.y=height(p.x,p.z);a.root.updateMatrixWorld(true);const bottom=new T.Box3().setFromObject(a.root,true).min.y,floor=height(p.x,p.z)+.04;if(a.species!=='goose'||bottom<=floor){p.y+=floor-bottom;if(r.death===1)r.settled=true;}}}
   else{r.age+=dt;const dir=new T.Vector3(r.dx,0,r.dz),speed=a.species==='goose'?5:a.species==='rabbit'?1.6:a.species==='wolf'?2.2:1.6;
    if(a.species!=='goose'){steerAlligator(a,dir,p.clone().addScaledVector(dir,25));const moved=c.move(p,dir.x*speed*dt,dir.z*speed*dt,.4);if(moved<speed*dt*.3)c.move(p,-dir.z*speed*dt,dir.x*speed*dt,.4);p.y=height(p.x,p.z)+.04;}else{p.addScaledVector(dir,speed*dt);p.y=Math.max(height(p.x,p.z)+.7,world.tower.userData.eyePosition.y-.8+Math.sin(r.age*.6+r.id)*.2);}
    a.root.rotation.y=Math.atan2(dir.x,dir.z);a.anim.time.value=r.age*6;a.anim.stride.value=.55;if(a.mixer)a.mixer.update(dt*(a.species==='goose'?1:.65));
    if(p.distanceTo(world.tower.position)>115||r.age>95||a.species==='goose'&&r.age>24){a.root.removeFromParent();herd.splice(herd.indexOf(a),1);c.animals().splice(c.animals().indexOf(a),1);b.records.splice(b.records.indexOf(r),1);if(selected===a)selected=null;continue;}
   }
   r.x=p.x;r.y=p.y;r.z=p.z;r.heading=a.root.rotation.y;
  }
  if(Object.entries(GRAND_QUOTAS).every(([k,q])=>b.counts[k]>=q)&&herd.every(a=>!a.dead||a.record.settled)){b.finish+=dt;if(b.finish>1.2){b.stage='complete';panel.classList.add('hidden');c.complete();}}
 }
 function interaction(){if(!active()||s.driving)return null;if(state().stage==='tower'&&s.position.distanceTo(world.tower.position)<7)return{type:'grandClimb',title:'Climb for the Grand Hunt',sub:'E · take your position'};if(this.onTower)return{type:'grandWatch',title:'Watch the migrating herds',sub:'SHIFT · scope · Left click · shoot · R · reload'};return null;}
 function act(a){if(!active()||!a.type.startsWith('grand'))return false;if(a.type==='grandClimb'){state().stage='hunt';c.stopInput();s.velocity.set(0,0,0);c.checkpoint();}return true;}
 function target(){if(selected&&!selected.dead&&herd.includes(selected))return selected;selected=herd.find(a=>!a.dead)||null;return selected;}
 function objective(){if(!active())return null;return{target:state().stage==='tower'?world.tower.position:target()?.root.position||world.tower.position,stage:'FINAL EXPEDITION',text:state().stage==='tower'?'Climb the watchtower':'Fulfil the reserve quotas',sub:state().stage==='tower'?'E · climb · Daytime hunt':'Watch every direction · One shot each · No collection'};}
 return{setup,tick,kill,interaction,act,objective,get target(){return active()?target():null;},get onTower(){return active()&&state()?.stage==='hunt';},get active(){return active();},get hideMarker(){return active()&&state()?.stage!=='tower'&&!target();},get canShoot(){return !active()||state()?.stage==='hunt';},camera(){if(this.onTower){s.position.copy(world.tower.userData.eyePosition);s.velocity.set(0,0,0);camera.position.copy(s.position);}}};
}
