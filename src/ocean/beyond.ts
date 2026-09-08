import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { StorybookArt } from './art';
import { asset, beyondPlaces, factPoints, returnGate } from './data';

/** A filled arch-shaped membrane, including the water-level opening. */
export function createPortal(gate:{x:number;z:number;rotation:number}) {
 const shape=new THREE.Shape();shape.moveTo(-4.3,-.8);shape.lineTo(4.3,-.8);shape.lineTo(4.3,7);
 shape.bezierCurveTo(4.3,10.2,2.5,12.4,0,12.4);shape.bezierCurveTo(-2.5,12.4,-4.3,10.2,-4.3,7);shape.lineTo(-4.3,-.8);
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
  uniforms:{time:{value:0},active:{value:0}},
  vertexShader:'varying vec2 pos; void main(){pos=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 pos;uniform float time;uniform float active;
   void main(){float ripple=sin(pos.y*2.-time*2.2+sin(pos.x*1.8+time)*1.5);float mist=sin(pos.x*3.+pos.y*.9-time)*.5+.5;
   vec3 color=mix(vec3(.63,.25,.95),vec3(.67,.28,1.),active);color+=vec3(.17,.16,.24)*(ripple*.5+.5);
   float edge=smoothstep(3.5,4.3,abs(pos.x));gl_FragColor=vec4(color*(1.+active*.65),mix(.48,.65,active)+mist*.12+edge*.14);}`});
 const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape,48),material);mesh.position.set(gate.x,0,gate.z);mesh.rotation.y=gate.rotation;mesh.name='violet-portal-membrane';return mesh;
}

export class BeyondWorld {
 root=new THREE.Group();gate=createPortal(returnGate);facts:THREE.Group[]=[];
 private mixer:THREE.AnimationMixer|null=null;private wolf=new THREE.Group();private snow:THREE.Points;
 private disposed=false;private time=0;private wolfBase=0;
 private message:(s:string)=>void;
 constructor(art:StorybookArt,message:(s:string)=>void){
  this.message=message;
  this.root.name='beyond-the-veil';this.root.visible=false;
  const ice=new THREE.Group();ice.position.set(-35,0,-24);this.root.add(ice);art.terrain(ice,23,0,true);art.dock(ice,23);
  // Layered ice ridges behind an open running circuit.
  for(let i=0;i<7;i++){const x=-13+i*4;art.rock(ice,x,3.8,-15-Math.sin(i)*1.2,3.1,4+i%3,3.4,'#ceeef9');art.rock(ice,x,6.5+i%3,-15-Math.sin(i)*1.2,2.4,2,2.8,'#f2fcff');}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;art.rock(ice,Math.sin(a)*26,-.1,Math.cos(a)*26,1.8,.5,2.4,'#ceeef9');}
  const factsIsland=new THREE.Group();factsIsland.position.set(40,0,14);this.root.add(factsIsland);art.terrain(factsIsland,17,1);art.dock(factsIsland,17);art.cottage(factsIsland,'home');
  for(let i=0;i<7;i++){const a=1.8+i*.6;art.willow(factsIsland,Math.sin(a)*12,Math.cos(a)*12,.7);}
  for(let i=0;i<22;i++){const a=i*.7;const x=Math.sin(a)*10,z=Math.cos(a)*10;art.beam(factsIsland,new THREE.Vector3(x,2.7,z),new THREE.Vector3(x,3.3,z),.025,'#84aa65');art.mesh(new THREE.SphereGeometry(.2,8,6),art.paint(i%2?'#ffd29c':'#e8b5d4'),factsIsland,x,3.4,z);}
  for(const [i,p] of factPoints.entries()){
   const g=new THREE.Group();g.position.set(p[0],1.9,p[1]);
   const card=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.7,.13),new THREE.MeshStandardMaterial({color:'#fff0d2',emissive:'#b48b47',emissiveIntensity:.4,roughness:.5}));g.add(card);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(1.7,.055,8,40),new THREE.MeshBasicMaterial({color:'#f9cd83'}));g.add(ring);
   g.name=`story-card-${i+1}`;this.facts.push(g);this.root.add(g);
  }
  const arch=new THREE.Group();arch.position.set(returnGate.x,0,returnGate.z);this.root.add(arch);
  for(const x of [-7,7])art.rock(arch,x,4.4,0,3.1,7.6,3.4,'#789bb6');
  for(let i=0;i<16;i++){const a=i/15*Math.PI;art.rock(arch,Math.cos(a)*7,7+Math.sin(a)*7,0,1.2,1.6,2.1,'#acc3d6');}
  this.gate.material.uniforms.active.value=1;this.root.add(this.gate);
  const snowPositions=[];for(let i=0;i<260;i++)snowPositions.push(-35+(Math.random()-.5)*56,3+Math.random()*22,-24+(Math.random()-.5)*56);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(snowPositions,3));this.snow=new THREE.Points(geometry,new THREE.PointsMaterial({color:'#ffffff',size:.17,transparent:true,opacity:.82,depthWrite:false}));this.root.add(this.snow);
  this.root.add(this.wolf);art.merge(this.root,new Set([this.wolf,this.snow,this.gate,...this.facts]));
 }
 loadWolf(){
  new GLTFLoader().load(asset('models/arctic-wolf.glb'),g=>{
   if(this.disposed){g.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});return;}
   const box=new THREE.Box3().setFromObject(g.scene),size=box.getSize(new THREE.Vector3());const scale=5.5/Math.max(size.x,size.y,size.z);g.scene.scale.setScalar(scale);this.wolfBase=-box.min.y*scale;g.scene.position.y=this.wolfBase;
   g.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.frustumCulled=false;const mats=Array.isArray(o.material)?o.material:[o.material];for(const mat of mats){if(mat instanceof THREE.MeshStandardMaterial){mat.color.lerp(new THREE.Color('#e5edf2'),.55);mat.roughness=.9;mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat fur=dot(diffuseColor.rgb,vec3(.299,.587,.114)); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.82,.90,.96),smoothstep(.12,.55,fur)*.82);');};}}}});
   this.wolf.add(g.scene);this.mixer=new THREE.AnimationMixer(g.scene);const run=g.animations.find(a=>/\|Run$/.test(a.name));
   if(run)this.mixer.clipAction(run).play();else this.message('The wolf animation could not load. Please reload to try again.');
  },undefined,()=>this.message('The arctic wolf could not load. Reload to try again.'));
 }
 update(dt:number,reduced:boolean,found:number[]){
  if(!this.root.visible)return;this.time+=dt;this.mixer?.update(dt);
  const a=this.time*.32,x=Math.cos(a)*12,z=Math.sin(a)*8;
  this.wolf.position.set(-35+x,2.7+Math.sin(x*.34)*Math.cos(z*.31)*.38,-24+z);this.wolf.rotation.y=Math.atan2(-12*Math.sin(a),8*Math.cos(a));
  const positions=this.snow.geometry.attributes.position;
  if(!reduced){for(let i=0;i<positions.count;i++){let y=positions.getY(i)-dt*2.2;if(y<2.8)y=25;positions.setY(i,y);}positions.needsUpdate=true;}
  this.facts.forEach((g,i)=>{g.visible=!found.includes(i);g.position.y=1.9+(reduced?0:Math.sin(this.time*1.6+i)*.2);g.rotation.y=reduced?0:this.time*.35;});
  this.gate.material.uniforms.time.value=reduced?0:this.time;
 }
 dispose(){this.disposed=true;this.mixer?.stopAllAction();}
}
export { beyondPlaces };
