import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { places, asset } from './data';

// Quaternius Dolphin, CC0: https://poly.pizza/m/3LzFgI3GLO
export class DolphinVisitor {
 readonly root=new THREE.Group();
 private body=new THREE.Group();
 private mixer:THREE.AnimationMixer|null=null;
 private disposed=false;
 private wait=8;
 private age=-1;
 private start=new THREE.Vector2();
 private direction=new THREE.Vector2();
 private previousHeight=-3;
 constructor(){
  this.root.visible=false;this.root.add(this.body);
  new GLTFLoader().load(asset('models/dolphin.glb'),g=>{
   if(this.disposed){this.release(g.scene);return;}
   const box=new THREE.Box3().setFromObject(g.scene),size=box.getSize(new THREE.Vector3());
   const scale=3.8/Math.max(size.x,size.y,size.z);
   const center=box.getCenter(new THREE.Vector3());
   g.scene.scale.setScalar(scale);g.scene.position.copy(center).multiplyScalar(-scale);
   g.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.frustumCulled=false;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof THREE.MeshStandardMaterial){m.flatShading=false;m.roughness=.48;m.metalness=0;}}});
   this.body.add(g.scene);this.mixer=new THREE.AnimationMixer(g.scene);
   const swim=g.animations.find(a=>/swim/i.test(a.name));if(swim)this.mixer.clipAction(swim).play();
  },undefined,()=>{this.root.visible=false;});
 }
 update(dt:number,x:number,z:number,active:boolean,paused:boolean,ripple:(x:number,z:number)=>void){
  if(!active){this.root.visible=false;this.age=-1;this.wait=Math.max(this.wait,8);return;}
  if(paused||!this.mixer)return;
  if(this.age<0){
   this.wait-=dt;if(this.wait>0)return;
   // Test the entire flight corridor, including the entry and exit, against land.
   let found=false;
   for(let attempt=0;attempt<24;attempt++){
    const a=Math.random()*Math.PI*2,r=12+Math.random()*12,h=a+Math.PI/2;
    this.start.set(x+Math.cos(a)*r,z+Math.sin(a)*r);
    this.direction.set(Math.sin(h),Math.cos(h));
    found=Array.from({length:13},(_,i)=>i/12).every(u=>{
     const px=this.start.x+this.direction.x*18*u,pz=this.start.y+this.direction.y*18*u;
     return Math.hypot(px,pz)<118&&places.every(p=>Math.hypot(px-p.x,pz-p.z)>p.radius+7);
    });
    if(found)break;
   }
   if(!found){this.wait=5;return;}
   this.age=0;this.previousHeight=-3;this.root.visible=true;
   this.root.rotation.y=Math.atan2(this.direction.x,this.direction.y);
  }
  this.age+=dt;this.mixer.update(dt);
  const u=Math.min(1,this.age/3.2),height=-3+7*Math.sin(Math.PI*u);
  const px=this.start.x+18*u*this.direction.x,pz=this.start.y+18*u*this.direction.y;
  this.root.position.set(px,height,pz);
  // The model faces +Z. Pitch follows the tangent through ascent and descent.
  this.body.rotation.x=-Math.atan2(7*Math.PI*Math.cos(Math.PI*u),18);
  if((this.previousHeight<0&&height>=0)||(this.previousHeight>=0&&height<0))ripple(px,pz);
  this.previousHeight=height;
  if(u===1){this.root.visible=false;this.age=-1;this.wait=18+Math.random()*18;}
 }
 private release(root:THREE.Object3D){root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}
 dispose(){this.disposed=true;this.mixer?.stopAllAction();if(this.mixer)this.mixer.uncacheRoot(this.mixer.getRoot());}
}
