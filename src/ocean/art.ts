import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { asset } from './data';

const paperUrl=asset('art/gouache-paper.png');
const leavesUrl=asset('art/willow-foliage.png');
export type PaintClock={value:number};
export class StorybookArt {
 readonly time:PaintClock={value:0};
 readonly materials=new Set<THREE.Material>();
 readonly textures=new Set<THREE.Texture>();
 private paper:THREE.Texture;private leaves:THREE.Texture;
 private cache=new Map<string,THREE.MeshStandardMaterial>();
 private seed=92815;
 readonly animated:THREE.Object3D[]=[];
 constructor(textures?:{paper:THREE.Texture;leaves:THREE.Texture}){
  const loader=new THREE.TextureLoader();this.paper=textures?.paper??loader.load(paperUrl);this.paper.wrapS=this.paper.wrapT=THREE.RepeatWrapping;this.paper.colorSpace=THREE.SRGBColorSpace;this.paper.repeat.set(2,2);this.paper.anisotropy=4;
  this.leaves=textures?.leaves??loader.load(leavesUrl);this.leaves.colorSpace=THREE.SRGBColorSpace;this.leaves.anisotropy=4;
  this.textures.add(this.paper);this.textures.add(this.leaves);
 }
 random(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/4294967296;}
 paint(color:string,emissive=false){
  const key=color+(emissive?'e':'');const old=this.cache.get(key);if(old)return old;
  const m=new THREE.MeshStandardMaterial({color,roughness:.96,metalness:0,map:emissive?null:this.paper,bumpMap:emissive?null:this.paper,bumpScale:.065,...(emissive?{emissive:color,emissiveIntensity:.8}:{})});
  // Graphic bands of shadow and broken pigment, attached to the model, not the screen.
  m.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 paintPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\npaintPosition=position;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 paintPosition;
float paintHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}`).replace('#include <color_fragment>',`#include <color_fragment>
float grain=paintHash(floor(paintPosition*85.));
float stroke=sin(paintPosition.y*31.+sin(paintPosition.x*18.)*2.+sin(paintPosition.z*11.));
diffuseColor.rgb*=.84+.22*grain+.055*stroke;
`);};
  m.customProgramCacheKey=()=>emissive?'storybook-emissive-v2':'storybook-pigment-v2';this.cache.set(key,m);this.materials.add(m);return m;
 }
 mesh(g:THREE.BufferGeometry,m:THREE.Material,parent:THREE.Object3D,x=0,y=0,z=0,sx=1,sy=1,sz=1){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 box(parent:THREE.Object3D,color:string,x:number,y:number,z:number,sx:number,sy:number,sz:number){return this.mesh(new THREE.BoxGeometry(1,1,1),this.paint(color),parent,x,y,z,sx,sy,sz);}
 beam(parent:THREE.Object3D,a:THREE.Vector3,b:THREE.Vector3,r:number,color='#584f58'){const v=b.clone().sub(a);const mesh=this.mesh(new THREE.CylinderGeometry(r*.8,r,v.length(),9),this.paint(color),parent);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return mesh;}
 rock(parent:THREE.Object3D,x:number,y:number,z:number,sx:number,sy:number,sz:number,color='#3c536d'){
  let geo:THREE.BufferGeometry=new THREE.IcosahedronGeometry(1,3);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const a=p.getX(i),b=p.getY(i),c=p.getZ(i);const strata=Math.sin(b*15+a*3)*.045;const f=1+Math.sin(a*5+c*3)*Math.cos(b*7-c*2)*.075+strata;p.setXYZ(i,a*f,b*(1+strata),c*f);}
  // Weld shared vertices before calculating smooth normals.
  geo.deleteAttribute('normal');const smooth=mergeVertices(geo,.0001);geo.dispose();geo=smooth;geo.computeVertexNormals();const o=this.mesh(geo,this.paint(color),parent,x,y,z,sx,sy,sz);o.rotation.y=this.random()*6.28;return o;
 }
 terrain(parent:THREE.Object3D,r:number,index:number){
  const segments=112,rings=14,verts:number[]=[],indices:number[]=[],uvs:number[]=[],colors:number[]=[];
  const sand=new THREE.Color('#eedca4'),grass=new THREE.Color('#8dc85d'),cliff=new THREE.Color('#6b95ac');
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){
   const a=i/segments*Math.PI*2,f=j/rings,outline=.94+.055*Math.sin(a*3+index)+.035*Math.sin(a*7-index*.6);
   const rr=r*f*outline;const x=Math.sin(a)*rr,z=Math.cos(a)*rr;
   let y=2.7+Math.sin(x*.34)*Math.cos(z*.31)*.38;
   if(f>.75)y=2.6-(f-.75)*15+Math.sin(a*11)*.20;
   verts.push(x,y,z);uvs.push(x/8,z/8);const col=f>.87?cliff.clone().lerp(sand,(1-f)*5):grass.clone().lerp(sand,Math.max(0,(f-.68)*4));col.multiplyScalar(.91+.09*Math.sin(x*2+z));colors.push(col.r,col.g,col.b);
   if(j<rings&&i<segments){const n=j*(segments+1)+i;indices.push(n,n+1,n+segments+1,n+1,n+segments+2,n+segments+1);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
  const source=this.paint('#e1ecd9');const mat=source.clone();mat.onBeforeCompile=source.onBeforeCompile;mat.customProgramCacheKey=source.customProgramCacheKey;mat.vertexColors=true;mat.side=THREE.DoubleSide;this.materials.add(mat);const o=this.mesh(geo,mat,parent);o.name='organic-island-terrain';
  for(let i=0;i<29;i++){const a=i/29*6.28,outline=.94+.055*Math.sin(a*3+index)+.035*Math.sin(a*7-index*.6),rr=r*outline*.94;this.rock(parent,Math.sin(a)*rr,-.2+this.random()*.7,Math.cos(a)*rr,1+this.random()*1.3,.6+this.random()*1.3,1+this.random()*1.4,i%4===0?'#607f91':'#35526b');}
 }
 private leafMaterial:THREE.MeshStandardMaterial|null=null;
 willow(parent:THREE.Object3D,x:number,z:number,s=1){
  const tree=new THREE.Group();tree.position.set(x,2.6,z);tree.scale.setScalar(s);parent.add(tree);
  this.beam(tree,new THREE.Vector3(0,0,0),new THREE.Vector3(.2,6.5,-.2),.25);
  if(!this.leafMaterial){const m=new THREE.MeshStandardMaterial({map:this.leaves,alphaTest:.38,side:THREE.DoubleSide,roughness:1,color:'#c4f69f',bumpMap:this.leaves,bumpScale:.035});
   m.onBeforeCompile=shader=>{shader.uniforms.windTime=this.time;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float windTime;').replace('#include <begin_vertex>',`#include <begin_vertex>
float windWeight=1.-uv.y;
transformed.x+=sin(windTime*.85+position.x*.43+position.z*.7)*windWeight*.22;
transformed.z+=cos(windTime*.7+position.y*.41)*windWeight*.10;`);};m.customProgramCacheKey=()=> 'willow-wind-v2';this.materials.add(m);this.leafMaterial=m;
  }
  for(let k=0;k<7;k++){const a=k/7*6.28,ex=Math.sin(a)*(2+this.random()),ez=Math.cos(a)*(2+this.random()),ey=5.8+this.random()*1.6;
   this.beam(tree,new THREE.Vector3(.1,3.8,0),new THREE.Vector3(ex,ey,ez),.11);
   for(let j=0;j<2;j++){const card=this.mesh(new THREE.PlaneGeometry(4.4,5.9,6,12),this.leafMaterial,tree,ex,ey-.7,ez);card.rotation.y=a+j*Math.PI/2;card.rotation.z=(this.random()-.5)*.15;card.castShadow=false;card.receiveShadow=true;}
  }
 }
 cottage(parent:THREE.Object3D,kind:string){
  const house=new THREE.Group();house.position.set(kind==='research'?-1:0,2.6,-1);parent.add(house);
  // Stone plinth, with offset individual masonry courses.
  this.box(house,'#5d6674',0,.25,0,6.7,.65,5.1);
  for(let row=0;row<3;row++)for(let i=0;i<10;i++){const x=-3+i*.67+(row%2)*.3;this.box(house,row%2?'#737d89':'#626e7e',x,.15+row*.18,2.6,.61,.15,.23);}
  this.box(house,'#c0cdb6',0,2.3,0,6,4,4.5);
  // A proper gable prism, not an upside-down triangular cylinder.
  const shape=new THREE.Shape();shape.moveTo(-3,4.3);shape.lineTo(0,6.65);shape.lineTo(3,4.3);shape.closePath();const gable=new THREE.ExtrudeGeometry(shape,{depth:4.5,bevelEnabled:false,steps:1});gable.translate(0,0,-2.25);this.mesh(gable,this.paint('#c0cdb6'),house);
  const roofColor=kind==='play'?'#967386':kind==='contact'?'#687aa0':'#486e8f';
  // Curving overlapping shingles, each with thickness and staggered seams.
  for(const side of [-1,1])for(let row=0;row<10;row++)for(let col=0;col<12;col++){
   const x=side*(.16+row*.35),z=-2.8+col*.49+(row%2)*.15;
   const y=6.9-Math.abs(x)*.72+.055*Math.pow(Math.abs(x),2);
   const tile=this.box(house,(row+col)%5===0?'#7791a1':roofColor,x,y,z,.45,.105,.59);tile.rotation.z=side*(-.59+Math.abs(x)*.035);
  }
  for(const z of [-2.82,2.98])for(const side of [-1,1])this.beam(house,new THREE.Vector3(0,6.95,z),new THREE.Vector3(side*3.55,4.7,z),.10,'#536b80');
  for(let i=0;i<14;i++){const cap=this.mesh(new THREE.CylinderGeometry(.18,.18,.46,12,1,false,0,Math.PI),this.paint('#8092a0'),house,0,6.95,-2.8+i*.44);cap.rotation.x=Math.PI/2;}
  // Timber structure, framed entry and plank door.
  for(const x of [-2.9,2.9])this.box(house,'#555661',x,2.3,2.3,.18,4,.18);
  this.box(house,'#555661',0,4.14,2.32,6,.18,.16);
  this.box(house,'#384957',0,1.7,2.32,1.7,3,.18);
  for(let i=0;i<6;i++)this.box(house,'#8e837d',-.62+i*.25,1.64,2.43,.21,2.7,.08);
  for(const x of [-.86,.86])this.box(house,'#c6c5b5',x,1.77,2.48,.16,3.2,.18);
  this.box(house,'#c6c5b5',0,3.37,2.48,1.9,.17,.18);
  this.mesh(new THREE.SphereGeometry(.065,12,8),this.paint('#d6c186'),house,.42,1.5,2.53);
  for(let i=0;i<3;i++)this.box(house,'#839091',0,.04+i*.12,3.1-i*.24,2.2,.16,1-i*.12);
  for(const x of [-1.92,1.92]){
   this.box(house,'#394555',x,2.45,2.34,1.42,1.8,.16);
   this.mesh(new THREE.BoxGeometry(1.19,1.5,.08),this.paint('#eecaa3',true),house,x,2.45,2.44);
   for(const dx of [-.69,0,.69])this.box(house,'#59616b',x+dx,2.45,2.54,.075,1.83,.09);
   for(const dy of [-.88,0,.88])this.box(house,'#59616b',x,2.45+dy,2.54,1.46,.075,.10);
   for(const sign of [-1,1]){const shutter=this.box(house,'#7b8c86',x+sign*.94,2.45,2.49,.42,1.8,.1);shutter.rotation.y=sign*.3;for(let j=0;j<7;j++)this.box(house,'#9da89a',x+sign*.94,1.72+j*.23,2.58,.38,.065,.09);}
   this.box(house,'#8f746d',x,1.4,2.64,1.6,.32,.45);
   for(let j=0;j<7;j++){this.beam(house,new THREE.Vector3(x-.6+j*.2,1.5,2.65),new THREE.Vector3(x-.6+j*.2,1.95+this.random()*.25,2.65),.025,'#8faf65');this.mesh(new THREE.SphereGeometry(.10,8,6),this.paint(j%2?'#deb5c9':'#adc77c'),house,x-.6+j*.2,1.93+this.random()*.2,2.65);}
  }
  // Chimney courses and cowl.
  this.box(house,'#646c7a',1.85,6.2,-1,1,3.4,.85);
  for(let j=0;j<10;j++){this.box(house,j%2?'#898791':'#757985',1.85,4.7+j*.3,-.56,1.06,.24,.14);this.box(house,'#606776',2.4,4.7+j*.3,-1,.12,.24,.92);}
  this.box(house,'#a0a7a3',1.85,7.95,-1,1.32,.18,1.12);
  // Small circular attic window with radial mullions.
  const round=this.mesh(new THREE.CircleGeometry(.39,32),this.paint('#eac59e',true),house,0,5.23,2.29);round.receiveShadow=false;
  this.mesh(new THREE.TorusGeometry(.43,.055,8,32),this.paint('#65727e'),house,0,5.23,2.33);
  this.box(house,'#64717d',0,5.23,2.39,.06,.8,.08);this.box(house,'#64717d',0,5.23,2.39,.8,.06,.08);
  if(kind==='research'){
   this.beam(house,new THREE.Vector3(-2.3,4.4,-1.2),new THREE.Vector3(-2.3,7.6,-1.2),.11,'#949eaa');
   const bowl=this.mesh(new THREE.SphereGeometry(1.6,32,16,0,6.28,0,1.05),this.paint('#a7b5bd'),house,-2.3,7.1,-1.2);bowl.rotation.z=-.55;bowl.material.side=THREE.DoubleSide;
   this.beam(house,new THREE.Vector3(-2.3,7.3,-1.2),new THREE.Vector3(-3.4,9,-1.2),.045,'#59687a');
  }
  return house;
 }
 dock(parent:THREE.Object3D,r:number){
  for(let j=0;j<15;j++){const z=r-3+j*.64;this.box(parent,j%3?'#878981':'#a0a398',0,.91,z,3.1,.2,.56);for(const x of [-1.2,1.2]){this.mesh(new THREE.SphereGeometry(.035,6,4),this.paint('#4d5965'),parent,x,1.03,z);}}
  for(const x of [-1.55,1.55]){
   for(let j=0;j<4;j++){const z=r-2+j*2.6;this.beam(parent,new THREE.Vector3(x,-2,z),new THREE.Vector3(x,1.65,z),.14,'#656c77');this.mesh(new THREE.CylinderGeometry(.18,.18,.12,12),this.paint('#a8aaa0'),parent,x,1.7,z);
    if(j<3){const pts=[new THREE.Vector3(x,1.5,z),new THREE.Vector3(x,1.14,z+1.3),new THREE.Vector3(x,1.5,z+2.6)];this.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.035,5,false),this.paint('#bab59c'),parent);}}
   this.lantern(parent,x,2.1,r+5.8);
  }
 }
 lantern(parent:THREE.Object3D,x:number,y:number,z:number){
  this.beam(parent,new THREE.Vector3(x,.5,z),new THREE.Vector3(x,y+1,z),.06,'#536270');
  this.mesh(new THREE.CylinderGeometry(.2,.25,.48,6),this.paint('#f1cca6',true),parent,x,y+.3,z);
  for(const dy of [0,.57])this.mesh(new THREE.CylinderGeometry(.29,.29,.07,6),this.paint('#505b6c'),parent,x,y+dy,z);
  this.mesh(new THREE.ConeGeometry(.33,.22,6),this.paint('#505b6c'),parent,x,y+.71,z);
 }
 lighthouse(parent:THREE.Object3D){
  const body=this.mesh(new THREE.CylinderGeometry(2.15,3,12.6,48,12),this.paint('#bcc6bb'),parent,0,8.7,0);body.name='masonry-lighthouse';
  for(let j=0;j<15;j++){const y=2.8+j*.8,r=3-(y-2.4)/12.6*.85;const line=this.mesh(new THREE.TorusGeometry(r,.025,5,64),this.paint('#82919b'),parent,0,y,0);line.rotation.x=Math.PI/2;}
  for(let floor=0;floor<3;floor++)for(let j=0;j<4;j++){const a=j*Math.PI/2+.22*floor,r=2.9-floor*.2;const win=this.mesh(new THREE.PlaneGeometry(.65,1.2),this.paint('#e9c9a2',true),parent,Math.sin(a)*r,5+floor*3,Math.cos(a)*r);win.rotation.y=a;}
  for(const y of [14.8,15.3])this.mesh(new THREE.CylinderGeometry(3.35,3.35,.16,48),this.paint('#758b9c'),parent,0,y,0);
  for(let i=0;i<24;i++){const a=i/24*6.28;this.beam(parent,new THREE.Vector3(Math.sin(a)*3.12,15.3,Math.cos(a)*3.12),new THREE.Vector3(Math.sin(a)*3.12,16.25,Math.cos(a)*3.12),.035,'#99a6af');}
  const rail=this.mesh(new THREE.TorusGeometry(3.12,.05,6,64),this.paint('#9cabb0'),parent,0,16.25,0);rail.rotation.x=Math.PI/2;
  this.mesh(new THREE.CylinderGeometry(1.7,1.7,2.4,32),this.paint('#e8c9a2',true),parent,0,16.6,0);
  for(let j=0;j<12;j++){const a=j/12*6.28;this.beam(parent,new THREE.Vector3(Math.sin(a)*1.8,15.3,Math.cos(a)*1.8),new THREE.Vector3(Math.sin(a)*1.8,17.9,Math.cos(a)*1.8),.075,'#506783');}
  this.mesh(new THREE.ConeGeometry(2.8,2.2,48),this.paint('#5c7799'),parent,0,19,0);this.mesh(new THREE.SphereGeometry(.17,16,8),this.paint('#d2c7a2'),parent,0,20.15,0);
 }
 observatory(parent:THREE.Object3D){
  this.mesh(new THREE.CylinderGeometry(5.5,5.7,3.6,64),this.paint('#b4c4b8'),parent,0,4.4,0);
  for(let i=0;i<12;i++){const a=i/12*6.28;this.box(parent,'#62758d',Math.sin(a)*5.5,4.1,Math.cos(a)*5.5,.3,3.2,.3);}
  this.mesh(new THREE.SphereGeometry(5.5,64,32,0,6.28,0,Math.PI/2),this.paint('#6983a4'),parent,0,6.2,0);
  for(let i=0;i<12;i++){const a=i/12*6.28,points=[];for(let j=0;j<=24;j++){const t=j/24*Math.PI/2;points.push(new THREE.Vector3(Math.sin(t)*Math.sin(a)*5.52,6.2+Math.cos(t)*5.52,Math.sin(t)*Math.cos(a)*5.52));}this.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.045,6,false),this.paint('#a4b4bf'),parent);}
  for(const x of [-3.7,-1.85,0,1.85,3.7]){const z=Math.sqrt(5.5*5.5-x*x);const w=this.mesh(new THREE.PlaneGeometry(1.1,1.5),this.paint('#e7c6a0',true),parent,x,4.35,z+.025);w.rotation.y=Math.atan2(x,z);}
  const telescope=new THREE.Group();telescope.position.set(0,11.5,0);telescope.rotation.z=-.55;parent.add(telescope);
  this.mesh(new THREE.CylinderGeometry(.65,.85,4,32),this.paint('#b6c5c4'),telescope);for(const y of [-2,1.7])this.mesh(new THREE.CylinderGeometry(.84,.84,.18,32),this.paint('#526b87'),telescope,0,y,0);
 }
 merge(root:THREE.Object3D,exclude:Set<THREE.Object3D>){
  root.updateMatrixWorld(true);const batches=new Map<THREE.Material,THREE.Mesh[]>();
  root.traverse(o=>{if(!(o instanceof THREE.Mesh)||Array.isArray(o.material))return;let p:THREE.Object3D|null=o;while(p){if(exclude.has(p))return;p=p.parent;}if(o.material.transparent)return;const list=batches.get(o.material)||[];list.push(o);batches.set(o.material,list);});
  for(const [mat,items] of batches){if(items.length<2)continue;const geometries=items.map(o=>{let g=o.geometry.clone().applyMatrix4(o.matrixWorld);if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}return g;});const merged=mergeGeometries(geometries);if(merged){const m=new THREE.Mesh(merged,mat);m.castShadow=items.some(o=>o.castShadow);m.receiveShadow=true;root.add(m);items.forEach(o=>o.removeFromParent());}geometries.forEach(g=>g.dispose());}
 }
 dispose(){this.textures.forEach(t=>t.dispose());this.materials.forEach(m=>m.dispose());}
}
