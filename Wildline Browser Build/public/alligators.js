import * as T from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {PONDS} from './core.js';
export function makeAlligator(asset,index,x,z,height,species='alligator'){
 const root=new T.Group(),model=new T.Group(),rig=clone(asset.scene);root.add(model);model.add(rig);
 const mixer=new T.AnimationMixer(rig),idle=mixer.clipAction(asset.animations.find(c=>/Idle/i.test(c.name))||new T.AnimationClip('Rest',1,[])),run=mixer.clipAction(asset.animations.find(c=>/Trot|Run|WalkFast/i.test(c.name))||asset.animations.find(c=>/walk/i.test(c.name))||asset.animations[0]||new T.AnimationClip('Walk',1,[]));idle.play();mixer.update(0);rig.updateMatrixWorld(true);
 let head,hips;rig.traverse(o=>{if(/(^Head_|Bip01_Head_)/i.test(o.name))head=o;if(/(^Hips_|^Pelvis_|Bip01_Pelvis_)/i.test(o.name))hips=o;});
 if(head&&hips){const d=head.getWorldPosition(new T.Vector3()).sub(hips.getWorldPosition(new T.Vector3()));rig.rotation.y-=Math.atan2(d.x,d.z);}
 rig.updateMatrixWorld(true);let box=new T.Box3().setFromObject(rig);rig.scale.multiplyScalar((species==='rabbit'?.65:species==='deer'?2.2:species==='boar'?1.85:species==='bear'?2.7:species==='rhino'?3.5:species==='lion'?2.2:2.8)/Math.max(.01,box.max.z-box.min.z));rig.updateMatrixWorld(true);box.setFromObject(rig);const center=box.getCenter(new T.Vector3());rig.position.add(new T.Vector3(-center.x,-box.min.y,-center.z));
 const a={root,model,mixer,idle,run,index,species,active:true,health:100,dead:false,loaded:false,collected:false,home:new T.Vector3(x,0,z),target:new T.Vector3(x,0,z),anim:{time:{value:0},stride:{value:0}},mode:'graze',timer:index*2,alert:0,awareness:0,alerted:false,hitCount:0,clean:false,bleed:0,attack:0,death:0,rushTime:0,rushX:0,rushZ:0,combatTime:0,healthVisible:0};
 root.position.set(x,height(x,z)+.035,z);root.rotation.y=index*1.3;rig.traverse(o=>{if(o.isMesh){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();o.castShadow=o.receiveShadow=true;o.frustumCulled=false;o.userData.animal=a;}});return a;
}
// Keep bank-side charges moving around water rather than into its collision boundary.
export function steerAlligator(a,dir,target){
 for(const p of PONDS){const radial=new T.Vector3(a.root.position.x-p.x,0,a.root.position.z-p.z),d=radial.length(),ahead=Math.max(0,Math.min(10,-radial.dot(dir)));
  if(d<p.r+13&&radial.clone().addScaledVector(dir,ahead).length()<p.r+2){radial.normalize();const side=Math.sign(radial.x*(target.z-p.z)-radial.z*(target.x-p.x))||1;dir.set(-radial.z*side,0,radial.x*side).addScaledVector(radial,d<p.r+4?.6:.15).normalize();}
 }
}
