import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { places, pearlPoints, racePoints, asset } from './data';
import type { PlaceId } from './data';

import { initialState } from './state';
import type { WorldState, WorldOptions, Command } from './state';
export function readSave(): Partial<WorldState> {try {const s=JSON.parse(localStorage.getItem('yixu-ocean-v1')||'{}');return {pearls:Array.isArray(s.pearls)?s.pearls.filter((n:unknown)=>Number.isInteger(n)&&Number(n)>=0&&Number(n)<pearlPoints.length):[],visited:Array.isArray(s.visited)?s.visited.filter((p:unknown)=>places.some(v=>v.id===p)):[],best:typeof s.best==='number'&&Number.isFinite(s.best)&&s.best>0?s.best:null};}catch{return {};}}
const clamp=THREE.MathUtils.clamp;
let seed=1409;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
export class OceanWorld {
  private host:HTMLElement;private emit:(s:WorldState)=>void;private message:(s:string)=>void;private interact:(id:PlaceId)=>void;
  state:WorldState;options:WorldOptions={paused:false,night:true,low:false,reduced:false,sound:false};
  private scene=new THREE.Scene();private camera=new THREE.PerspectiveCamera(43,1,.2,650);private renderer:THREE.WebGLRenderer;
  private composer:EffectComposer;private bloom:UnrealBloomPass;private water!:THREE.Mesh<THREE.PlaneGeometry,THREE.ShaderMaterial>;
  private orca=new THREE.Group();private model=new THREE.Group();private moon!:THREE.Mesh;private sun=new THREE.DirectionalLight(0xffe1c4,2.9);private ambient=new THREE.HemisphereLight(0xa0e8eb,0x174951,2.0);
  private frame=0;private last=0;private elapsed=0;private lastEmit=0;private disposed=false;private loaded=false;
  private keys=new Set<string>();private velocity=new THREE.Vector2();private target:THREE.Vector2|null=null;private touch=new THREE.Vector2();private touchBoost=false;private heading=0;private cameraAngle=0;private cameraZoom=1;private drag:{x:number;y:number;start:number;button:number}|null=null;
  private jump=0;private jumpCooldown=0;private sonarTime=-20;private sonar!:THREE.Mesh;private ray=new THREE.Raycaster();private pointer=new THREE.Vector2();private plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);private rayPoint=new THREE.Vector3();
  private pearls:THREE.Mesh[]=[];private rings:THREE.Group[]=[];private foliage:THREE.Group[]=[];private birds:THREE.Group[]=[];private boats:THREE.Group[]=[];private glows:THREE.Mesh[]=[];private labels:THREE.Sprite[]=[];
  private particles!:THREE.Points;private wakes:THREE.Mesh[]=[];private wakeIndex=0;private wakeClock=0;private trailData:{age:number;life:number}[]=[];
  private materials:THREE.Material[]=[];private resizeObserver:ResizeObserver;private audio:AudioContext|null=null;private oscillator:OscillatorNode|null=null;private gain:GainNode|null=null;
  constructor(host:HTMLElement,emit:(s:WorldState)=>void,message:(s:string)=>void,interact:(id:PlaceId)=>void){
    this.host=host;this.emit=emit;this.message=message;this.interact=interact;this.state={...initialState,...readSave()};seed=1409;
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.setSize(host.clientWidth,host.clientHeight);
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;
    this.renderer.domElement.setAttribute('aria-label','Playable ocean. Use WASD or arrow keys to swim; E to explore, Space to leap, Q for sonar.');this.renderer.domElement.tabIndex=0;host.appendChild(this.renderer.domElement);
    this.scene.background=new THREE.Color(0x426478);this.scene.fog=new THREE.FogExp2(0x426478,.0036);
    this.scene.add(this.ambient,this.sun);this.sun.position.set(-50,90,35);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-105,right:105,top:105,bottom:-105,near:1,far:250});this.sun.shadow.bias=-.0015;
    this.buildWater();this.buildIslands();this.buildSky();this.buildCollectibles();this.buildLife();this.buildWake();this.batchScenery();
    this.orca.position.set(0,.55,24);this.orca.add(this.model);this.scene.add(this.orca);
    new GLTFLoader().load(asset('models/orca.glb'),g=>{if(this.disposed){g.scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});return;}const box=new THREE.Box3().setFromObject(g.scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const scale=7.6/Math.max(size.x,size.y,size.z);g.scene.scale.setScalar(scale);g.scene.position.copy(center.multiplyScalar(-scale));g.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;const m=o.material as THREE.MeshStandardMaterial;m.roughness=.6;if(m.color.r<.1){m.color.set('#14252c');m.emissive.set('#071217');}}});this.model.add(g.scene);const eyePatch=new THREE.MeshStandardMaterial({color:'#f4f1db',roughness:.7});for(const x of [-.49,1.02]){const patch=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),eyePatch);patch.position.set(x,-.04,-2.32);patch.scale.set(.22,.11,.32);patch.rotation.z=x<0?.25:-.25;this.model.add(patch);}this.loaded=true;this.state.ready=true;this.emit({...this.state});},undefined,()=>{this.state.error='The orca could not load. Please reload, or open the field guide to read the portfolio.';this.emit({...this.state});});
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.bloom=new UnrealBloomPass(new THREE.Vector2(host.clientWidth,host.clientHeight),.34,.6,.82);this.composer.addPass(this.bloom);this.composer.addPass(new OutputPass());
    this.composer.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float n=fract(sin(dot(vUv*1600.,vec2(12.9898,78.233)))*43758.5453);c+=(n-.5)*.025;float v=1.-.26*pow(length((vUv-.5)*1.25),2.);gl_FragColor=vec4(c*v,1.);}`}));
    this.camera.position.set(29,40,70);this.camera.lookAt(0,0,8);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();
    window.addEventListener('keydown',this.keydown);window.addEventListener('keyup',this.keyup);window.addEventListener('blur',this.blur);document.addEventListener('visibilitychange',this.visibility);
    const c=this.renderer.domElement;c.addEventListener('pointerdown',this.pointerdown);c.addEventListener('pointermove',this.pointermove);c.addEventListener('pointerup',this.pointerup);c.addEventListener('pointercancel',this.pointercancel);c.addEventListener('wheel',this.wheel,{passive:false});c.addEventListener('contextmenu',this.contextmenu);c.addEventListener('webglcontextlost',this.contextlost);
    this.frame=requestAnimationFrame(this.tick);
  }
  private mat(color:THREE.ColorRepresentation,emissive=false){const m=new THREE.MeshStandardMaterial({color,roughness:.93,flatShading:true,...(emissive?{emissive:color,emissiveIntensity:1.4}:{})});this.materials.push(m);return m;}
  private mesh(geo:THREE.BufferGeometry,mat:THREE.Material,parent:THREE.Object3D,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  private buildWater(){
    const uniforms={time:{value:0},night:{value:1},islands:{value:places.map(p=>new THREE.Vector3(p.x,p.z,p.radius))}};
    const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec3 vWorld;uniform float time;void main(){vec3 p=position;vec4 world=modelMatrix*vec4(p,1.);world.y+=sin(world.x*.18+time*.65)*.11+cos(world.z*.22-time*.52)*.11;vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
      fragmentShader:`varying vec3 vWorld;uniform float time;uniform float night;uniform vec3 islands[6];
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){vec2 p=vWorld.xz;float d=999.;for(int i=0;i<6;i++){vec2 q=p-islands[i].xy;float a=atan(q.y,q.x);float r=islands[i].z*(.96+.045*sin(a*5.)+.045*cos(a*7.));d=min(d,length(q)-r);}
      float swell=sin(p.x*.21+time*.5)*sin(p.y*.17-time*.2);vec3 deep=mix(vec3(.045,.31,.40),vec3(.033,.17,.235),night);vec3 shallow=vec3(.13,.50,.49);vec3 c=mix(shallow,deep,smoothstep(-2.,24.,d));
      float foam=(1.-smoothstep(.1,1.5,abs(d-1.7-sin(p.x*.4+p.y*.3+time)*.35)))*.45;
      float rings=pow(.5+.5*sin(d*2.3-time*1.3),14.)*(1.-smoothstep(1.,11.,d))*smoothstep(-1.,1.,d);
      c+=vec3(.28,.55,.45)*(foam+rings*.17);c+=swell*.013;
      vec2 uv=p*.6+vec2(time*.018,0.);float h=hash(floor(uv));vec2 f=fract(uv);float sparkle=step(.987,h)*(1.-smoothstep(0.,.06,abs(f.y-.5)))*(1.-smoothstep(.05,.42,abs(f.x-.5)));c+=vec3(.5,.72,.65)*sparkle*(.45+.4*sin(time+h*30.));
      float lines=pow(.5+.5*sin(p.x*.6+p.y*.23+sin(p.y*.4)+time*.6),22.);c+=lines*.025;
      float fog=1.-exp(-.0036*.0036*pow(gl_FragCoord.z/gl_FragCoord.w,2.));c=mix(c,vec3(.259,.392,.471),clamp(fog,0.,.72));gl_FragColor=vec4(c,1.);}`});
    this.water=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800,110,110),material);this.water.rotation.x=-Math.PI/2;this.water.position.y=-.15;this.water.receiveShadow=true;this.scene.add(this.water);
  }
  private buildIslands(){
    const rock=this.mat('#324b55'),rockTop=this.mat('#3b6470'),sand=this.mat('#b8b292'),grass=this.mat('#579366'),lime=this.mat('#88ad65'),trunk=this.mat('#494849'),leaf=this.mat('#77a462'),darkLeaf=this.mat('#3c765d'),wood=this.mat('#706c64'),plaster=this.mat('#c7c9b8'),roof=this.mat('#446565'),windowMat=this.mat('#ffce82',true),pink=this.mat('#d69f9d');
    const cyl=new THREE.CylinderGeometry(1,1,1,12),box=new THREE.BoxGeometry(1,1,1),ico=new THREE.IcosahedronGeometry(1,1),cone=new THREE.ConeGeometry(1,1,8);
    const tree=(parent:THREE.Group,x:number,z:number,s:number)=>{const g=new THREE.Group();g.position.set(x,3.2,z);parent.add(g);this.mesh(cyl,trunk,g,0,s*2,0,.18,s*4,.18);for(let j=0;j<3;j++)this.mesh(cone,j%2?leaf:darkLeaf,g,0,s*(3.2+j*.9),0,s*(1.8-j*.3),s*2.4,s*(1.8-j*.3));g.rotation.z=(random()-.5)*.12;this.foliage.push(g);};
    for(const [index,p] of places.entries()){
      const island=new THREE.Group();island.position.set(p.x,0,p.z);this.scene.add(island);
      const terrain=new THREE.CylinderGeometry(p.radius,p.radius*.78,6,32,2);const pos=terrain.attributes.position;
      for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),a=Math.atan2(z,x),f=1+.055*Math.sin(a*5)+.025*Math.cos(a*7);pos.setX(i,x*f);pos.setZ(i,z*f);if(pos.getY(i)>0)pos.setY(i,3+Math.sin(x*.4)*Math.cos(z*.4)*.3);}terrain.computeVertexNormals();
      this.mesh(terrain,rock,island,0,-.9,0);this.mesh(new THREE.CylinderGeometry(p.radius*.93,p.radius,1.25,32),sand,island,0,1.72,0);this.mesh(new THREE.CylinderGeometry(p.radius*.87,p.radius*.9,.72,32),grass,island,0,2.45,0);
      for(let i=0;i<15;i++){const a=i/15*Math.PI*2,r=p.radius*(.91+random()*.2);const stone=this.mesh(ico,i%2?rock:rockTop,island,Math.sin(a)*r,.5+random(),Math.cos(a)*r,1.1+random()*1.6,1+random()*2,1+random()*1.8);stone.rotation.set(random(),random(),random());}
      for(let i=0;i<11;i++){const a=1.7+i*.37,r=p.radius*(.57+random()*.2);tree(island,Math.sin(a)*r,Math.cos(a)*r,.65+random()*.7);}
      for(let i=0;i<20;i++){const a=random()*Math.PI*2,r=random()*p.radius*.8;this.mesh(ico,i%3?lime:pink,island,Math.sin(a)*r,2.8,Math.cos(a)*r,.2+random()*.55,.22+random()*.6,.2+random()*.4);}
      // A lit dock makes every portfolio destination approachable from the sea.
      for(let j=0;j<11;j++)this.mesh(box,wood,island,0,1.25,p.radius-2+j*.85,3.1,.23,.68);
      for(const x of [-1.65,1.65])for(const z of [p.radius,p.radius+5.2]){this.mesh(cyl,wood,island,x,.2,z,.14,3,.14);this.mesh(cyl,wood,island,x,2.15,z,.09,2,.09);this.mesh(box,windowMat,island,x,3.3,z,.35,.6,.35);}
      if(p.id==='journey'){
        this.mesh(new THREE.CylinderGeometry(2.3,3.1,13,12),plaster,island,0,9,0);this.mesh(new THREE.CylinderGeometry(2.5,2.8,1.5,12),pink,island,0,9.4,0);this.mesh(cyl,roof,island,0,15.8,0,3.1,.45,3.1);this.mesh(cyl,windowMat,island,0,17,0,1.95,2.2,1.95);this.mesh(cone,roof,island,0,19,0,3.1,2.3,3.1);
        for(let j=0;j<8;j++){const a=j*Math.PI/4;this.mesh(cyl,roof,island,Math.sin(a)*2.2,17,Math.cos(a)*2.2,.13,2.2,.13);}const beam=new THREE.Mesh(new THREE.ConeGeometry(6,55,24,1,true),new THREE.MeshBasicMaterial({color:'#fff0bc',transparent:true,opacity:.055,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));beam.rotation.z=Math.PI/2;beam.position.set(26,16.7,0);const beacon=new THREE.Group();beacon.add(beam);island.add(beacon);this.boats.push(beacon);
      }else if(p.id==='papers'){
        this.mesh(cyl,plaster,island,0,4.4,0,6,3.6,5);const dome=this.mesh(new THREE.SphereGeometry(4.6,24,12,0,Math.PI*2,0,Math.PI/2),roof,island,0,6.3,0);dome.scale.z=.95;this.mesh(box,windowMat,island,0,4.7,5.05,3.5,1.4,.08);const telescope=this.mesh(cyl,plaster,island,1,10,0,.65,5,.65);telescope.rotation.z=-.7;this.mesh(cyl,wood,island,0,7.5,0,.2,3,.2);
      }else{
        const house=new THREE.Group();house.position.set(p.id==='research'?-1:0,2.75,-1);island.add(house);
        this.mesh(box,plaster,house,0,2,0,6,4,4.5);const r=this.mesh(new THREE.CylinderGeometry(1,1,1,3),p.id==='play'?pink:roof,house,0,5,0,4.6,6,3.7);r.rotation.x=-Math.PI/2;r.rotation.y=Math.PI;
        this.mesh(box,wood,house,0,1.5,2.29,1.4,3,.15);for(const x of [-1.95,1.95]){this.mesh(box,windowMat,house,x,2.3,2.31,1.15,1.35,.1);this.mesh(box,wood,house,x,2.3,2.4,.08,1.4,.1);}
        this.mesh(box,rock,house,1.8,5.8,-1,1,3,1);
        if(p.id==='research'){const dish=this.mesh(new THREE.SphereGeometry(2,16,8,0,Math.PI*2,0,.95),plaster,house,-3,7,-1);dish.rotation.z=-.6;this.mesh(cyl,wood,house,-2.5,5.5,-1,.16,3,.16);}
        if(p.id==='contact'){this.mesh(box,pink,island,4,4,5,1.4,1,1);this.mesh(cyl,wood,island,4,3.3,5,.12,2,.12);}
      }
      // Stepping stones, shore grass, and a little welcome arch.
      for(let j=0;j<6;j++)this.mesh(new THREE.CylinderGeometry(.8,.95,.17,7),sand,island,(j%2-.5)*.65,2.96,4+j*1.18);
      const sign=this.textSprite(p.name.toUpperCase(),p.color);sign.position.set(p.x,5,p.z+p.radius+6.5);this.scene.add(sign);this.labels.push(sign);
      const portal=new THREE.Mesh(new THREE.TorusGeometry(2.1,.065,8,48),this.mat(p.color,true));portal.position.set(p.x,2.25,p.z+p.radius+8);this.scene.add(portal);this.glows.push(portal);
      if(index===0){for(let i=0;i<7;i++){const a=i/7*Math.PI;this.mesh(ico,lime,island,-6+Math.sin(a)*1.6,7+Math.cos(a)*2.4,-2,1.6,.7,1.2);}}
    }
    // Off-shore sea stacks and coral islets give the horizon a silhouette.
    for(let i=0;i<45;i++){const a=random()*Math.PI*2,r=105+random()*100,x=Math.sin(a)*r,z=Math.cos(a)*r;const g=new THREE.Group();g.position.set(x,0,z);this.scene.add(g);const h=3+random()*18;this.mesh(ico,rock,g,0,h*.2,0,2+random()*5,h,2+random()*5);if(i%3===0)tree(g,0,0,.8+random());}
    // Natural stone arch beyond the archive.
    const arch=new THREE.Group();arch.position.set(90,0,-55);arch.rotation.y=-.4;this.scene.add(arch);for(const x of [-7,7])this.mesh(ico,rockTop,arch,x,5,0,3.5,9,4);const arc=this.mesh(new THREE.TorusGeometry(7,2.4,7,14,Math.PI),rockTop,arch,0,8,0);arc.rotation.z=0;
  }
  private batchScenery(){
    // Merge static scenery by material, keeping animated objects separate.
    // This reduces hundreds of terrain and building draw calls to a few dozen.
    const excluded=new Set<THREE.Object3D>([...this.foliage,...this.birds,...this.boats,...this.glows,...this.pearls,...this.rings,...this.wakes,this.water,this.sonar]);
    this.scene.updateMatrixWorld(true);
    const batches=new Map<THREE.Material,{geometry:THREE.BufferGeometry;mesh:THREE.Mesh}[]>();
    this.scene.traverse(o=>{if(!(o instanceof THREE.Mesh)||Array.isArray(o.material)||!o.castShadow)return;let parent:THREE.Object3D|null=o;while(parent){if(excluded.has(parent))return;parent=parent.parent;}const list=batches.get(o.material)||[];const geometry=o.geometry.clone().applyMatrix4(o.matrixWorld);list.push({geometry,mesh:o});batches.set(o.material,list);});
    for(const [material,items] of batches){if(items.length<2){items.forEach(i=>i.geometry.dispose());continue;}const geometries=items.map(i=>i.geometry.index?i.geometry.toNonIndexed():i.geometry);const merged=mergeGeometries(geometries);if(merged){const mesh=new THREE.Mesh(merged,material);mesh.castShadow=true;mesh.receiveShadow=true;this.scene.add(mesh);items.forEach(i=>i.mesh.removeFromParent());}geometries.forEach(g=>g.dispose());items.forEach(i=>i.geometry.dispose());}
  }
  private textSprite(text:string,color:string){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='#102d38cc';ctx.beginPath();ctx.roundRect(4,8,1016,110,35);ctx.fill();ctx.strokeStyle=color+'55';ctx.lineWidth=2;ctx.stroke();ctx.font='500 40px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,512,67);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true});const s=new THREE.Sprite(m);s.scale.set(16,2,1);return s;}
  private buildSky(){
    this.moon=this.mesh(new THREE.SphereGeometry(9,32,24),new THREE.MeshBasicMaterial({color:'#efdcd2'}),this.scene,-90,86,-165);
    const halo=new THREE.Mesh(new THREE.SphereGeometry(11,24,16),new THREE.MeshBasicMaterial({color:'#f8cfc6',transparent:true,opacity:.055,depthWrite:false}));halo.position.copy(this.moon.position);this.scene.add(halo);
    const starGeo=new THREE.BufferGeometry(),v=[];for(let i=0;i<380;i++){const a=random()*Math.PI*2,r=200+random()*70;v.push(Math.cos(a)*r,50+random()*160,Math.sin(a)*r);}starGeo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));this.scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#dfebe2',size:.42,transparent:true,opacity:.65,sizeAttenuation:true})));
    const cloudMat=new THREE.MeshBasicMaterial({color:'#80969d',transparent:true,opacity:.10,depthWrite:false});for(let i=0;i<18;i++){const cloud=this.mesh(new THREE.IcosahedronGeometry(1,1),cloudMat,this.scene,(random()-.5)*440,50+random()*20,-130-random()*80,18+random()*18,1.2+random()*3,4+random()*8);cloud.rotation.y=random();}
  }
  private buildCollectibles(){
    for(const [i,p] of pearlPoints.entries()){const pearl=this.mesh(new THREE.IcosahedronGeometry(.48,1),this.mat('#c8f5bd',true),this.scene,p[0],1.1,p[1]);pearl.visible=!this.state.pearls.includes(i);this.pearls.push(pearl);const base=this.mesh(new THREE.TorusGeometry(1.3,.025,4,32),this.mat('#77bcb7',true),this.scene,p[0],0,p[1]);base.rotation.x=Math.PI/2;}
    for(const [i,p] of racePoints.entries()){const g=new THREE.Group();g.position.set(p[0],1.9,p[1]);const next=racePoints[(i+1)%racePoints.length];g.rotation.y=Math.atan2(next[0]-p[0],next[1]-p[1]);this.mesh(new THREE.TorusGeometry(2.1,.105,8,40),this.mat('#ffd797',true),g);const label=this.textSprite(String(i+1).padStart(2,'0'),'#f8d298');label.position.set(0,3,0);label.scale.set(2.3,.75,1);g.add(label);g.visible=false;this.scene.add(g);this.rings.push(g);}
    this.sonar=new THREE.Mesh(new THREE.RingGeometry(.98,1,96),new THREE.MeshBasicMaterial({color:'#bcefb6',side:THREE.DoubleSide,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));this.sonar.rotation.x=-Math.PI/2;this.sonar.position.y=.2;this.scene.add(this.sonar);
  }
  private buildLife(){
    const fishMat=this.mat('#85bbc0'),fin=this.mat('#4c8d97');const fishGroup=new THREE.Group();this.scene.add(fishGroup);
    for(let i=0;i<65;i++){const g=new THREE.Group(),a=random()*Math.PI*2,r=19+random()*85;g.position.set(Math.cos(a)*r,-.28,Math.sin(a)*r);this.mesh(new THREE.SphereGeometry(1,7,4),fishMat,g,0,0,0,.19,.12,.62);const t=this.mesh(new THREE.ConeGeometry(.24,.45,3),fin,g,0,0,.7);t.rotation.x=Math.PI/2;g.userData={a,r,speed:.013+random()*.015};fishGroup.add(g);this.birds.push(g);}
    const kelpMat=this.mat('#568665');for(let i=0;i<55;i++){const a=random()*Math.PI*2,r=27+random()*90,x=Math.sin(a)*r,z=Math.cos(a)*r;if(places.some(p=>Math.hypot(x-p.x,z-p.z)<p.radius+6))continue;const g=new THREE.Group();g.position.set(x,-1,z);for(let j=0;j<3;j++){const leaf=this.mesh(new THREE.ConeGeometry(.5,4+random()*3,5),kelpMat,g,(j-1)*.5,1,0);leaf.rotation.z=(j-1)*.3;}this.scene.add(g);this.foliage.push(g);}
    const birdMat=this.mat('#dadace');for(let i=0;i<10;i++){const g=new THREE.Group();for(const side of [-1,1]){const wing=this.mesh(new THREE.ConeGeometry(.3,1.4,3),birdMat,g,side*.6,0,0);wing.rotation.z=side*1.25;}g.userData={a:random()*6.28,r:25+random()*80,speed:.08+random()*.1,bird:true};this.scene.add(g);this.birds.push(g);}
    const geo=new THREE.BufferGeometry(),v=[];for(let i=0;i<200;i++)v.push((random()-.5)*210,.3+random()*9,(random()-.5)*210);geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));this.particles=new THREE.Points(geo,new THREE.PointsMaterial({color:'#c9df95',size:.1,transparent:true,opacity:.7,depthWrite:false}));this.scene.add(this.particles);
    // A sailboat in the outer bay.
    const boat=new THREE.Group();boat.position.set(-26,0,52);this.mesh(new THREE.SphereGeometry(1,10,6),this.mat('#b79a7b'),boat,0,.4,0,1.3,.7,2.7);this.mesh(new THREE.CylinderGeometry(.08,.08,6,8),this.mat('#d2c4ab'),boat,0,3.3,0);const sail=this.mesh(new THREE.ConeGeometry(2.5,4.5,3),this.mat('#d9d5bd'),boat,.5,3.5,0,.6,1,.07);sail.rotation.z=-.15;this.scene.add(boat);boat.userData.boat=true;this.boats.push(boat);
  }
  private buildWake(){for(let i=0;i<85;i++){const m=new THREE.Mesh(new THREE.RingGeometry(.7,1,16,1,0,Math.PI*2),new THREE.MeshBasicMaterial({color:'#ace0d4',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.11;m.visible=false;this.scene.add(m);this.wakes.push(m);this.trailData.push({age:0,life:1});}}
  private ripple(x:number,z:number,big=false){const m=this.wakes[this.wakeIndex],d=this.trailData[this.wakeIndex];m.position.set(x,.12,z);m.scale.setScalar(big?2:.35);m.userData.big=big;m.visible=true;d.age=0;d.life=big?2.5:1.6;this.wakeIndex=(this.wakeIndex+1)%this.wakes.length;}
  private save(){try{localStorage.setItem('yixu-ocean-v1',JSON.stringify({pearls:this.state.pearls,visited:this.state.visited,best:this.state.best}));}catch{/* Storage can be unavailable in private browsers. */}}
  private keydown=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.closest('input,textarea,[role="dialog"]'))return;const k=e.key.toLowerCase();if((e.target as HTMLElement)?.closest('button')&&(k===' '||k==='enter'))return;if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d','q','e','shift','r'].includes(k))e.preventDefault();if(this.options.paused)return;this.keys.add(k);if(!e.repeat){if(k===' ')this.command('jump');if(k==='q')this.command('sonar');if(k==='r')this.command('race');if(k==='e'&&this.state.near)this.interact(this.state.near);}};
  private keyup=(e:KeyboardEvent)=>{this.keys.delete(e.key.toLowerCase());};private blur=()=>{this.keys.clear();this.touch.set(0,0);this.touchBoost=false;};private visibility=()=>{this.last=0;if(document.hidden)this.blur();};
  private contextmenu=(e:Event)=>e.preventDefault();private contextlost=(e:Event)=>{e.preventDefault();this.state.error='The ocean graphics were interrupted. Reload to return, or continue in the field guide.';this.emit({...this.state});};
  private pointerdown=(e:PointerEvent)=>{if(this.options.paused)return;this.renderer.domElement.focus({preventScroll:true});this.drag={x:e.clientX,y:e.clientY,start:performance.now(),button:e.button};this.renderer.domElement.setPointerCapture(e.pointerId);};
  private pointermove=(e:PointerEvent)=>{if(!this.drag)return;const dx=e.clientX-this.drag.x;if(this.drag.button===2||performance.now()-this.drag.start>190){this.cameraAngle-=dx*.006;this.drag.x=e.clientX;this.drag.y=e.clientY;this.drag.button=2;}};
  private pointerup=(e:PointerEvent)=>{if(this.drag&&this.drag.button!==2&&!this.options.paused){const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);if(this.ray.ray.intersectPlane(this.plane,this.rayPoint)){this.target=new THREE.Vector2(clamp(this.rayPoint.x,-115,115),clamp(this.rayPoint.z,-115,115));this.ripple(this.target.x,this.target.y,true);}}this.drag=null;};
  private pointercancel=()=>{this.drag=null;};private wheel=(e:WheelEvent)=>{e.preventDefault();this.cameraZoom=clamp(this.cameraZoom+e.deltaY*.00065,.65,1.8);};
  setTouch(x:number,z:number,boost=false){this.touch.set(x,z);this.touchBoost=boost;}
  setOptions(o:WorldOptions){const wasSound=this.options.sound;this.options=o;this.renderer.setPixelRatio(Math.min(devicePixelRatio,o.low?1:1.75));this.renderer.shadowMap.enabled=!o.low;this.bloom.enabled=!o.low;this.water.material.uniforms.night.value=o.night?1:0;this.renderer.toneMappingExposure=o.night?1.08:1.42;this.ambient.intensity=o.night?2:2.9;this.sun.intensity=o.night?2.9:3.8;this.moon.visible=o.night;if(o.paused)this.blur();if(o.sound!==wasSound)this.setSound(o.sound);this.resize();}
  private setSound(on:boolean){if(on){try{if(!this.audio){this.audio=new AudioContext();this.gain=this.audio.createGain();this.gain.gain.value=.015;this.gain.connect(this.audio.destination);this.oscillator=this.audio.createOscillator();this.oscillator.type='sine';this.oscillator.frequency.value=82.4;this.oscillator.connect(this.gain);this.oscillator.start();}void this.audio.resume();}catch{this.message('Audio is unavailable in this browser.');}}else if(this.audio)void this.audio.suspend();}
  private chime(freq=660){if(!this.audio||!this.options.sound)return;const o=this.audio.createOscillator(),g=this.audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,this.audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.6,this.audio.currentTime+.5);g.gain.setValueAtTime(.08,this.audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.audio.currentTime+.6);o.connect(g);g.connect(this.audio.destination);o.start();o.stop(this.audio.currentTime+.65);}
  command(c:Command){if(c==='home'){this.travel('home');return;}if(this.options.paused)return;if(c==='sonar'){if(this.elapsed-this.sonarTime<3)return;this.sonarTime=this.elapsed;this.sonar.position.set(this.state.x,.18,this.state.z);this.chime(440);const next=pearlPoints.map((p,i)=>({i,d:Math.hypot(p[0]-this.state.x,p[1]-this.state.z)})).filter(p=>!this.state.pearls.includes(p.i)).sort((a,b)=>a.d-b.d)[0];this.message(next?`Echo pearl detected · ${Math.round(next.d)} m away`:'Every echo found. The ocean remembers you.');}if(c==='jump'&&this.jumpCooldown<=0){this.jump=1.7;this.jumpCooldown=3;this.ripple(this.state.x,this.state.z,true);this.chime(230);}if(c==='race'){if(this.state.race>=0){this.state.race=-1;this.rings.forEach(r=>r.visible=false);this.message('Tide run ended. Your best time is kept.');return;}this.state.race=0;this.state.raceTime=0;this.state.x=racePoints[0][0]+4;this.state.z=racePoints[0][1]+7;this.velocity.set(0,0);this.target=null;this.rings.forEach(r=>r.visible=true);this.message('Tide run started! Swim through the 10 golden rings in order.');}}
  travel(id:PlaceId){const p=places.find(p=>p.id===id)!;this.state.x=p.x;this.state.z=p.z+p.radius+10;this.velocity.set(0,0);this.target=null;this.state.race=-1;this.rings.forEach(r=>r.visible=false);this.heading=0;this.ripple(this.state.x,this.state.z,true);this.message(`Arrived at ${p.name}`);}
  reset(){this.state.pearls=[];this.state.visited=[];this.state.best=null;this.pearls.forEach(p=>p.visible=true);this.save();this.travel('home');this.emit({...this.state});}
  private resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);this.composer.setSize(w,h);}
  private tick=(now:number)=>{if(this.disposed)return;this.frame=requestAnimationFrame(this.tick);const dt=this.last?Math.min((now-this.last)/1000,.05):.016;this.last=now;if(document.hidden)return;this.elapsed+=dt;const t=this.elapsed;
    if(!this.options.paused&&this.loaded){
      const v=new THREE.Vector2((this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0),(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0));v.add(this.touch);const manual=v.lengthSq()>.01;
      const ca=.45+this.cameraAngle;if(manual){this.target=null;v.rotateAround(new THREE.Vector2(),-ca);}else if(this.target){v.set(this.target.x-this.state.x,this.target.y-this.state.z);if(v.length()<1.5){this.target=null;v.set(0,0);}}
      if(v.length()>1)v.normalize();const boosting=(this.keys.has('shift')||this.touchBoost)&&this.state.energy>1&&v.length()>.1;const speed=boosting?20:10;this.state.energy=clamp(this.state.energy+(boosting?-27:19)*dt,0,100);this.velocity.lerp(v.multiplyScalar(speed),1-Math.exp(-dt*3.3));
      let nx=this.state.x+this.velocity.x*dt,nz=this.state.z+this.velocity.y*dt;
      for(const p of places){const dx=nx-p.x,dz=nz-p.z,d=Math.hypot(dx,dz),min=p.radius+1.8;if(d<min){nx=p.x+dx/Math.max(d,.01)*min;nz=p.z+dz/Math.max(d,.01)*min;this.velocity.multiplyScalar(.7);if(!manual)this.target=null;}}
      const dist=Math.hypot(nx,nz);if(dist>126){nx=nx/dist*126;nz=nz/dist*126;this.target=null;}this.state.x=nx;this.state.z=nz;this.state.speed=this.velocity.length();
      if(this.velocity.length()>.2){const aim=Math.atan2(-this.velocity.x,-this.velocity.y);const diff=Math.atan2(Math.sin(aim-this.heading),Math.cos(aim-this.heading));this.heading+=diff*Math.min(dt*6,1);this.model.rotation.z=THREE.MathUtils.lerp(this.model.rotation.z,-diff*.23,dt*4);}
      this.jumpCooldown-=dt;if(this.jump>0){this.jump-=dt;if(this.jump<=0){this.ripple(nx,nz,true);this.chime(170);}}
      this.state.near=null;for(const p of places){if(Math.hypot(nx-p.x,nz-(p.z+p.radius+7))<10){this.state.near=p.id;if(!this.state.visited.includes(p.id)){this.state.visited=[...this.state.visited,p.id];this.save();this.message(`Discovered · ${p.name}`);this.chime(700);}break;}}
      this.pearls.forEach((p,i)=>{if(p.visible&&Math.hypot(nx-p.position.x,nz-p.position.z)<2.7){p.visible=false;this.state.pearls=[...this.state.pearls,i];this.save();this.chime(880);this.message(this.state.pearls.length===pearlPoints.length?'All 18 echoes collected · Ocean Whisperer unlocked!':`Echo collected · ${this.state.pearls.length} / ${pearlPoints.length}`);this.ripple(nx,nz,true);}});
      if(this.state.race>=0){this.state.raceTime+=dt;const point=racePoints[this.state.race];if(Math.hypot(nx-point[0],nz-point[1])<3.4){this.rings[this.state.race].visible=false;this.state.race++;this.chime(550+this.state.race*70);if(this.state.race===racePoints.length){const time=this.state.raceTime;this.state.best=this.state.best===null?time:Math.min(time,this.state.best);this.state.race=-1;this.save();this.message(`Tide run complete! ${time.toFixed(1)}s · Best ${this.state.best.toFixed(1)}s`);}else this.message(`Ring ${this.state.race} / 10 · Keep going!`);}}
      if(this.velocity.length()>1.5){this.wakeClock+=dt;if(this.wakeClock>.045){this.wakeClock=0;this.ripple(nx+Math.sin(this.heading)*2,nz+Math.cos(this.heading)*2);}}
    }
    this.state.heading=this.heading;this.orca.position.set(this.state.x,1.1+Math.sin(t*1.8)*.12+(this.jump>0?Math.sin((1.7-this.jump)/1.7*Math.PI)*5.8:0),this.state.z);this.orca.rotation.y=this.heading;this.model.rotation.x=this.jump>0?-Math.cos((1.7-this.jump)/1.7*Math.PI)*.6:Math.sin(t*5)*.025*(this.state.speed/10);this.model.scale.set(1,1,1+Math.sin(t*6)*.008);
    const cangle=.45+this.cameraAngle;const distance=(this.host.clientWidth<700?60:51)*this.cameraZoom;const camTarget=new THREE.Vector3(this.state.x+Math.sin(cangle)*distance,this.options.reduced?40:distance*.77,this.state.z+Math.cos(cangle)*distance);this.camera.position.lerp(camTarget,1-Math.exp(-dt*2.5));this.camera.lookAt(this.state.x,0,this.state.z-7);
    this.water.material.uniforms.time.value=this.options.reduced?0:t;
    if(!this.options.reduced){this.foliage.forEach((g,i)=>g.rotation.z=Math.sin(t*.7+i)*.035);this.birds.forEach((g,i)=>{const d=g.userData,a=d.a+t*d.speed;g.position.x=Math.cos(a)*d.r;g.position.z=Math.sin(a)*d.r;g.rotation.y=-a;g.position.y=d.bird?17+Math.sin(t+i)*1.2:-.34;});this.boats.forEach(g=>{if(g.userData.boat){g.rotation.z=Math.sin(t)*.05;g.position.y=Math.sin(t*.7)*.17;}else g.rotation.y=t*.19;});this.pearls.forEach((p,i)=>{p.position.y=1.2+Math.sin(t*2+i)*.25;p.rotation.y=t*.6;p.rotation.z=t*.4;});this.particles.rotation.y=Math.sin(t*.015)*.03;}
    const st=t-this.sonarTime;this.sonar.scale.setScalar(Math.max(.01,st*17));(this.sonar.material as THREE.MeshBasicMaterial).opacity=st<3?(1-st/3)*.6:0;
    this.glows.forEach((g,i)=>{g.scale.setScalar(1+Math.sin(t*1.5+i)*.025);});
    this.rings.forEach((g,i)=>{g.scale.setScalar(this.state.race===i?1+Math.sin(t*3)*.08:.85);});
    this.wakes.forEach((m,i)=>{const d=this.trailData[i];if(!m.visible)return;d.age+=dt;if(d.age>d.life){m.visible=false;return;}m.scale.setScalar((m.userData.big?2:.4)+d.age*(m.userData.big?4:1.5));(m.material as THREE.MeshBasicMaterial).opacity=(1-d.age/d.life)*(m.userData.big?.3:.2);});
    if(t-this.lastEmit>.1){this.lastEmit=t;this.emit({...this.state});}this.composer.render();
  };
  dispose(){this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();window.removeEventListener('keydown',this.keydown);window.removeEventListener('keyup',this.keyup);window.removeEventListener('blur',this.blur);document.removeEventListener('visibilitychange',this.visibility);const c=this.renderer.domElement;c.removeEventListener('pointerdown',this.pointerdown);c.removeEventListener('pointermove',this.pointermove);c.removeEventListener('pointerup',this.pointerup);c.removeEventListener('pointercancel',this.pointercancel);c.removeEventListener('wheel',this.wheel);c.removeEventListener('contextmenu',this.contextmenu);c.removeEventListener('webglcontextlost',this.contextlost);this.scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points||o instanceof THREE.Sprite){if('geometry'in o)o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if('map'in m&&(m as THREE.MeshStandardMaterial).map)(m as THREE.MeshStandardMaterial).map!.dispose();m.dispose();});}});this.composer.dispose();this.renderer.dispose();this.renderer.domElement.remove();void this.audio?.close();}
}
