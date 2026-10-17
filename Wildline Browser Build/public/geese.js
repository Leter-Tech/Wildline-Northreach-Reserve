import * as T from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
export function makeGoose(asset,index,x,z,height){
 const root=new T.Group(),model=new T.Group(),rig=clone(asset.scene);root.add(model);model.add(rig);
 const mixer=new T.AnimationMixer(rig),actions={};
 for(const [key,pattern] of [['idle',/Idle/i],['walk',/Walk/i],['fly',/Fly/i]]){const clip=asset.animations.find(c=>pattern.test(c.name));if(clip)actions[key]=mixer.clipAction(clip);}
 actions.idle?.play();mixer.update(0);rig.updateMatrixWorld(true);
 let head,pelvis;rig.traverse(o=>{if(!head&&/^Head_/i.test(o.name))head=o;if(!pelvis&&/^Pelvis_/i.test(o.name))pelvis=o;});
 if(head&&pelvis){const d=head.getWorldPosition(new T.Vector3()).sub(pelvis.getWorldPosition(new T.Vector3()));rig.rotation.y-=Math.atan2(d.x,d.z);}
 rig.updateMatrixWorld(true);let box=new T.Box3().setFromObject(rig);rig.scale.multiplyScalar(.95/Math.max(.01,box.max.y-box.min.y));rig.updateMatrixWorld(true);box.setFromObject(rig);const center=box.getCenter(new T.Vector3());rig.position.add(new T.Vector3(-center.x,-box.min.y,-center.z));
 const a={root,model,mixer,actions,action:'idle',species:'goose',index,active:true,health:30,dead:false,loaded:false,collected:false,home:new T.Vector3(x,0,z),target:new T.Vector3(x,0,z),anim:{time:{value:0},stride:{value:0}},mode:'graze',timer:index,alert:0,awareness:0,alerted:false,hitCount:0,clean:false,bleed:0,death:0,flightTime:0,flightAngle:Math.atan2(z+310,x-70),fallSpeed:0,grounded:false};
 root.position.set(x,height(x,z)+.035,z);root.rotation.y=index*1.7;rig.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.frustumCulled=false;o.userData.animal=a;}});return a;
}
function animate(a,key,dt){if(a.action!==key){a.actions[a.action]?.fadeOut(.3);a.actions[key]?.reset().fadeIn(.3).play();a.action=key;}a.mixer.update(dt);}
export function alertFlock(animals){for(const a of animals)if(a.species==='goose'&&!a.dead&&!a.alerted){a.alerted=true;a.mode='fly';a.flightTime=0;}}
export function updateGoose(a,dt,height){
 const p=a.root.position;
 if(a.dead){
  if(a.action!=='dead'){a.mixer.stopAllAction();a.actions.idle?.reset().play();a.mixer.update(.001);if(a.actions.idle)a.actions.idle.paused=true;a.action='dead';}
  if(a.alerted&&a.flightTime>1&&!a.grounded){p.x+=Math.sin(a.root.rotation.y)*3.5*dt;p.z+=Math.cos(a.root.rotation.y)*3.5*dt;const dx=p.x-70,dz=p.z+310,d=Math.hypot(dx,dz);if(d<29){p.x=70+dx/d*29;p.z=-310+dz/d*29;}}
  a.fallSpeed+=18*dt;p.y-=a.fallSpeed*dt;a.model.rotation.z=T.MathUtils.damp(a.model.rotation.z,-Math.PI/2,5,dt);a.model.rotation.x=T.MathUtils.damp(a.model.rotation.x,0,5,dt);
  a.root.updateMatrixWorld(true);const bottom=new T.Box3().setFromObject(a.model,true).min.y,floor=height(p.x,p.z)+.04;
  if(bottom<=floor){p.y+=floor-bottom;a.fallSpeed=0;a.grounded=true;}return;
 }
 if(a.alerted){
  a.flightTime+=dt;const delay=a.index*.095,t=Math.max(0,a.flightTime-delay);if(!t){animate(a,'idle',dt);return;}
  const radius=43+a.index*2,omega=(6.5+a.index*.13)/radius;a.flightAngle+=omega*dt;
  const blend=T.MathUtils.smoothstep(t,0,7),x=T.MathUtils.lerp(a.home.x,70+Math.cos(a.flightAngle)*radius,blend),z=T.MathUtils.lerp(a.home.z,-310+Math.sin(a.flightAngle)*radius,blend);
  const dx=x-p.x,dz=z-p.z,heading=Math.atan2(dx,dz);if(Math.hypot(dx,dz)>.0001)a.root.rotation.y+=Math.atan2(Math.sin(heading-a.root.rotation.y),Math.cos(heading-a.root.rotation.y))*Math.min(1,dt*4);
  p.x=x;p.z=z;const altitude=height(x,z)+25+a.index*.65+Math.sin(t*.45+a.index)*1.6;p.y=T.MathUtils.lerp(height(x,z)+.035,altitude,T.MathUtils.smoothstep(t,0,8));
  a.model.rotation.z=T.MathUtils.damp(a.model.rotation.z,-.12-Math.sin(t*.5+a.index)*.04,3,dt);a.model.rotation.x=T.MathUtils.damp(a.model.rotation.x,t<6?-.12:0,3,dt);animate(a,'fly',dt*(.85+a.index*.035));
 }else{
  a.timer+=dt;const walking=Math.sin(a.timer*.3+a.index)>.65,angle=a.index*.8+a.timer*.08;
  if(walking){const x=a.home.x+Math.sin(angle)*1.2,z=a.home.z+Math.cos(angle)*1.2,heading=Math.atan2(x-p.x,z-p.z);a.root.rotation.y+=Math.atan2(Math.sin(heading-a.root.rotation.y),Math.cos(heading-a.root.rotation.y))*Math.min(1,dt*3);p.x=T.MathUtils.damp(p.x,x,.5,dt);p.z=T.MathUtils.damp(p.z,z,.5,dt);}
  p.y=height(p.x,p.z)+.035;animate(a,walking?'walk':'idle',dt);
 }
}
