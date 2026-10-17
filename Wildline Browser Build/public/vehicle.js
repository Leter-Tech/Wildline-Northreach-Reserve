import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const TRUCK={wheelRadius:.505,track:2.16,wheelbase:4.1,halfWidth:1.28,halfLength:3.4,bed:{width:1.97,length:2.82,floor:1.14,centerZ:-1.79}};
const Y=new T.Vector3(0,1,0);

export function createTruck(textures={}){
 const root=new T.Group();root.name='Northreach long-bed utility pickup';root.rotation.order='YXZ';
 const paint=new T.MeshPhysicalMaterial({color:0x485649,metalness:.12,roughness:.86,clearcoat:0});
 if(textures.mud){paint.onBeforeCompile=shader=>{shader.uniforms.truckMud={value:textures.mud};shader.vertexShader='varying vec3 bodyPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nbodyPosition=position;');shader.fragmentShader='uniform sampler2D truckMud;varying vec3 bodyPosition;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nvec3 wear=texture2D(truckMud,bodyPosition.xz*.65+bodyPosition.xy*.5).rgb;diffuseColor.rgb*=mix(vec3(.78),vec3(1.1),wear);');};}
 const darkPaint=new T.MeshStandardMaterial({color:0x28322b,metalness:.15,roughness:.89});
 const rubber=new T.MeshStandardMaterial({color:0x151916,roughness:.94});
 const steel=new T.MeshStandardMaterial({color:0x424947,metalness:.55,roughness:.72});
 const alloy=new T.MeshStandardMaterial({color:0x9a9c94,metalness:.55,roughness:.65});
 const glass=new T.MeshPhysicalMaterial({color:0x050b0e,metalness:.08,roughness:.3,clearcoat:.3,transparent:false});
 const liner=new T.MeshStandardMaterial({color:0x202620,roughness:.94});
 const lamp=new T.MeshStandardMaterial({color:0xffebbc,emissive:0xffd789,emissiveIntensity:.6,roughness:.3});
 const rearLamp=new T.MeshStandardMaterial({color:0x911c13,emissive:0x86190e,emissiveIntensity:.5,roughness:.3});
 const mesh=(geometry,material,parent=root)=>{const m=new T.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 function panel(w,h,d,material,x,y,z,bevel=.035,parent=root){const shape=new T.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w/2,h/2);shape.lineTo(-w/2,h/2);shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:bevel>0,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:2});g.translate(0,0,-d/2);const m=mesh(g,material,parent);m.position.set(x,y,z);return m;}
 function rod(a,b,r,material,parent=root){const av=new T.Vector3(...a),bv=new T.Vector3(...b),m=mesh(new T.CylinderGeometry(r,r,av.distanceTo(bv),10),material,parent);m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(Y,bv.sub(av).normalize());return m;}
 // Ladder frame and protective underbody, inside the tire track.
 for(const x of [-.68,.68])panel(.13,.22,6.25,steel,x,.64,-.05,.02);
 for(const z of [-2.6,-1.2,.2,1.6,2.8])panel(1.5,.13,.14,steel,0,.66,z,.015);
 panel(1.55,.12,2.2,steel,0,.56,.8,.02);
 // Long, open load bed. Internal clear space is 1.97 × 2.82 metres.
 panel(2.16,.16,3.0,darkPaint,0,1.04,-1.79,.03);
 panel(1.98,.05,2.83,liner,0,1.12,-1.79,.005);
 for(let x=-.86;x<.95;x+=.13)panel(.045,.02,2.75,steel,x,1.154,-1.79,.003);
 for(const x of [-1.08,1.08]){
  panel(.1,.56,3.02,paint,x,1.43,-1.79,.025);
  panel(.13,.055,3.07,darkPaint,x,1.75,-1.79,.018);
  for(const z of [-3.1,-.5]){const eye=mesh(new T.TorusGeometry(.045,.012,6,12),steel);eye.position.set(x*.93,1.56,z);eye.rotation.y=Math.PI/2;}
 }
 panel(2.14,.56,.09,paint,0,1.43,-3.31,.025);
 panel(2.1,.52,.1,paint,0,1.4,-.26,.025);
 panel(.3,.055,.027,steel,0,1.62,-3.385,.012);
 panel(1.1,.035,.025,alloy,0,1.38,-3.39,.006);
 for(const x of [-1.05,1.05])panel(.16,.3,.09,rearLamp,x,1.35,-3.39,.025);
 // Closed cabin: opaque smoked glazing, no exposed or placeholder interior.
 panel(2.14,.58,1.64,paint,0,1.18,.58,.09);
 function quad(points,material){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,1,2,0,2,3].flatMap(i=>points[i]),3));g.computeVertexNormals();const mat=material.clone();mat.side=T.DoubleSide;return mesh(g,mat);}
 // Raked windscreen, tapered pillars and curved roof edge form a continuous cab.
 const lower=[[-1.07,1.52,-.26],[1.07,1.52,-.26],[1.07,1.52,1.37],[-1.07,1.52,1.37]],upper=[[-.94,2.34,-.16],[.94,2.34,-.16],[.94,2.34,.99],[-.94,2.34,.99]];
 for(let i=0;i<4;i++){const j=(i+1)%4;quad([lower[i],lower[j],upper[j],upper[i]],paint);rod(lower[i],upper[i],.048,paint);}
 panel(1.94,.075,1.24,paint,0,2.37,.415,.09);
 quad([[-.94,1.64,1.322],[.94,1.64,1.322],[.84,2.25,1.041],[-.84,2.25,1.041]],glass);
 quad([[-.83,1.75,-.24],[.83,1.75,-.24],[.83,2.23,-.18],[-.83,2.23,-.18]],glass);
 for(const x of [-.5,.5])rod([x,1.63,1.34],[x+.23,1.79,1.27],.012,rubber);
 for(const side of [-1,1]){
  quad([[side*1.057,1.66,-.13],[side*1.057,1.66,1.23],[side*.968,2.23,.94],[side*.968,2.23,-.09]],glass);
  panel(.025,.05,1.3,rubber,side*1.103,1.62,.48,.005);
  panel(.025,.035,.24,alloy,side*1.111,1.51,-.01,.009);
  panel(.03,.51,.018,darkPaint,side*1.102,1.21,-.205,.003);
  rod([side*1.08,1.78,1.05],[side*1.33,1.79,1.08],.025,steel);
  panel(.13,.23,.33,glass,side*1.35,1.85,1.08,.045);
  panel(.18,.12,1.57,steel,side*1.16,.77,.51,.025);
 }
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#b9b495';ctx.fillRect(0,0,512,256);ctx.fillStyle='#344535';ctx.textAlign='center';ctx.font='bold 52px Field';ctx.fillText('NORTHREACH',256,112);ctx.font='30px Field';ctx.fillText('RANGER SERVICE · 04',256,162);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;for(const side of [-1,1]){const label=mesh(new T.PlaneGeometry(.88,.3),new T.MeshStandardMaterial({map,roughness:1}));label.position.set(side*1.169,1.24,.48);label.rotation.y=side*Math.PI/2;}}
 // Hood, grille, bumpers and lamp bezels.
 panel(2.08,.53,1.79,paint,0,1.16,2.22,.09);
 const hood=panel(2.06,.075,1.77,paint,0,1.49,2.22,.045);hood.rotation.x=.035;
 panel(1.04,.32,.065,rubber,0,1.19,3.15,.02);
 for(let y=1.08;y<1.38;y+=.072)panel(1.0,.019,.03,steel,0,y,3.197,.003);
 for(const x of [-.78,.78]){panel(.47,.34,.065,steel,x,1.23,3.157,.045);panel(.36,.24,.03,lamp,x,1.25,3.202,.03);panel(.22,.07,.03,new T.MeshStandardMaterial({color:0xc38226,emissive:0x9d5b15,emissiveIntensity:.4}),x,1.025,3.2,.01);}
 for(const z of [-3.45,3.28]){panel(2.37,.2,.22,steel,0,.9,z,.04);panel(.53,.13,.027,liner,0,.87,z+Math.sign(z)*.13,.008);}
 for(const side of [-1,1])for(const z of [-2.05,2.05]){
  const arch=mesh(new T.TorusGeometry(.57,.075,8,28,Math.PI),darkPaint);arch.rotation.y=Math.PI/2;arch.position.set(side*1.2,.58,z);arch.rotation.z=0;
  panel(.09,.38,.08,rubber,side*1.06,.48,z-.56,.01);
 }
 // Functional steering knuckles and rolling wheels; tire centers are never spun around the axle.
 const wheels=[];
 for(const x of [-1.08,1.08])for(const z of [-2.05,2.05]){
  const mount=new T.Group();mount.position.set(x,.505,z);root.add(mount);const spin=new T.Group();mount.add(spin);
  const tire=mesh(new T.TorusGeometry(.37,.135,12,40),rubber,spin);tire.rotation.y=Math.PI/2;
  const inner=mesh(new T.CylinderGeometry(.365,.365,.23,32),rubber,spin);inner.rotation.z=Math.PI/2;
  const rim=mesh(new T.CylinderGeometry(.27,.27,.25,24),alloy,spin);rim.rotation.z=Math.PI/2;
  const hub=mesh(new T.CylinderGeometry(.11,.11,.29,16),steel,spin);hub.rotation.z=Math.PI/2;
  const tread=[];for(let i=0;i<40;i++)for(const side of [-1,1]){const a=i/40*Math.PI*2,g=new T.BoxGeometry(.13,.029,.058);g.rotateX(a);g.translate(side*.077,Math.cos(a)*.492,Math.sin(a)*.492);tread.push(g);}mesh(mergeGeometries(tread),rubber,spin);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,bolt=mesh(new T.CylinderGeometry(.019,.019,.31,6),steel,spin);bolt.rotation.z=Math.PI/2;bolt.position.set(0,Math.cos(a)*.17,Math.sin(a)*.17);}
  wheels.push({mount,spin,x,z,front:z>0});
 }
 root.userData.wheels=wheels;root.userData.bed=TRUCK.bed;
 return root;
}

// Four-contact suspension. The body follows the average support plane, each tire touches the actual triangle surface.
export function placeTruck(truck,heading,height,travel=0,steering=0){
 const contacts=truck.userData.wheels.map(w=>{const x=truck.position.x+Math.cos(heading)*w.x+Math.sin(heading)*w.z,z=truck.position.z-Math.sin(heading)*w.x+Math.cos(heading)*w.z;return{w,x,z,h:height(x,z)};});
 const avg=list=>list.reduce((a,b)=>a+b.h,0)/list.length;
 const front=avg(contacts.filter(c=>c.w.front)),rear=avg(contacts.filter(c=>!c.w.front)),left=avg(contacts.filter(c=>c.w.x<0)),right=avg(contacts.filter(c=>c.w.x>0));
 truck.position.y=avg(contacts);truck.rotation.set(-Math.atan2(front-rear,TRUCK.wheelbase),heading,Math.atan2(right-left,TRUCK.track),'YXZ');truck.updateMatrixWorld(true);
 for(const c of contacts){const target=new T.Vector3(c.x,c.h+TRUCK.wheelRadius,c.z);c.w.mount.position.copy(truck.worldToLocal(target));const worldRotation=new T.Quaternion().setFromAxisAngle(Y,heading+(c.w.front?steering:0));c.w.mount.quaternion.copy(truck.quaternion).invert().multiply(worldRotation);c.w.spin.rotation.x+=travel/TRUCK.wheelRadius;}
 truck.updateMatrixWorld(true);return contacts;
}

export function stowHarvest(truck,animal,index){
 if(['alligator','rhino','lion','bear'].includes(animal.species)){const root=animal.root;root.removeFromParent();root.position.set(0,0,0);root.rotation.set(0,0,0);root.scale.setScalar(1);animal.model.rotation.set(0,0,-Math.PI/2);root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(root),size=box.getSize(new T.Vector3()),scale=Math.min(1,(animal.species!=='alligator'?1.5:.8)/size.x,(TRUCK.bed.length-.15)/size.z),center=box.getCenter(new T.Vector3());root.scale.setScalar(scale);truck.add(root);root.position.set((animal.species!=='alligator'?0:(index%2-.5)*.85)-center.x*scale,TRUCK.bed.floor-box.min.y*scale+.03+(animal.species!=='alligator'?index*(size.y*scale+.05):Math.floor(index/2)*.38),TRUCK.bed.centerZ-center.z*scale);return;}

 if(animal.species==='goose'){const root=animal.root;root.removeFromParent();root.position.set(0,0,0);root.rotation.set(0,0,0);root.scale.setScalar(1);animal.model.rotation.set(0,0,-Math.PI/2);root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(root),size=box.getSize(new T.Vector3()),scale=Math.min(1,.8/size.x,.72/size.z),center=box.getCenter(new T.Vector3());root.scale.setScalar(scale);truck.add(root);root.position.set((index%2-.5)*.86-center.x*scale,TRUCK.bed.floor-box.min.y*scale+.03,TRUCK.bed.centerZ+(Math.floor(index/2)-1.5)*.77-center.z*scale);return;}

 const root=animal.root,bed=TRUCK.bed;root.removeFromParent();root.position.set(0,0,0);root.rotation.set(0,0,0);animal.model.rotation.set(0,0,-Math.PI/2);root.scale.setScalar(1);root.updateMatrixWorld(true);
 // Compute cargo bounds in truck-local coordinates, not the pitched world bounding box.
 const bounds=new T.Box3().setFromObject(animal.model,true);
 const size=bounds.getSize(new T.Vector3()),small=animal.species==='rabbit',boar=animal.species==='boar',scale=Math.min(1,(small?.7:boar?.82:bed.width-.12)/size.x,(small?.75:boar?1.23:bed.length-.1)/size.z);
 root.scale.setScalar(scale);const center=bounds.getCenter(new T.Vector3());const x=small||boar?(index%2-.5)*.9:0,z=small||boar?bed.centerZ+(Math.floor(index/2)-.5)*(boar?1.35:.95):bed.centerZ;
 truck.add(root);root.position.set(x-center.x*scale,bed.floor-bounds.min.y*scale+.025,z-center.z*scale);root.updateMatrixWorld(true);
}
