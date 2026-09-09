import { DolphinVisitor } from './dolphins';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { prepareSeagull, animateSeagull } from './wildlife';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { places, allPlaces, beyondPlaces, funFacts, factPoints, oceanGate, returnGate, pearlPoints, racePoints, asset } from './data';
import type { PlaceId } from './data';

import { BeyondWorld, createPortal } from './beyond';
import { cleanIndices, echoRewards, portalCrossed } from './progression';
import { StorybookArt } from './art';
import { createWater } from './water';
import { createPainterPass } from './painter';
import { deformOrca } from './orcaMotion';
import { initialState } from './state';
import type { WorldState, WorldOptions, Command } from './state';
export function readSave(): Partial<WorldState> {try {const s=JSON.parse(localStorage.getItem('yixu-ocean-v1')||'{}');return {pearls:cleanIndices(s.pearls,pearlPoints.length),facts:cleanIndices(s.facts,funFacts.length),wolfSeen:s.wolfSeen===true,visited:Array.isArray(s.visited)?[...new Set(s.visited.filter((p:unknown)=>allPlaces.some(v=>v.id===p)))] as PlaceId[]:[],best:typeof s.best==='number'&&Number.isFinite(s.best)&&s.best>0?s.best:null};}catch{return {};}}
const clamp=THREE.MathUtils.clamp;
let seed=1409;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
export class OceanWorld {
  private host:HTMLElement;private emit:(s:WorldState)=>void;private message:(s:string)=>void;private interact:(id:PlaceId)=>void;
  state:WorldState;options:WorldOptions={paused:false,night:false,low:false,reduced:false,sound:false};
  private scene=new THREE.Scene();private camera=new THREE.PerspectiveCamera(43,1,.2,650);private renderer:THREE.WebGLRenderer;
  private composer:EffectComposer;private painter:ShaderPass;private bloom:UnrealBloomPass;private water!:THREE.Mesh<THREE.PlaneGeometry,THREE.ShaderMaterial>;
  private orca=new THREE.Group();private model=new THREE.Group();private moon!:THREE.Mesh;private sun=new THREE.DirectionalLight(0xffe1c4,2.9);private ambient=new THREE.HemisphereLight(0x99addb,0x193448,2.15);
  private frame=0;private last=0;private elapsed=0;private lastEmit=0;private disposed=false;private loaded=false;
  private keys=new Set<string>();private velocity=new THREE.Vector2();private target:THREE.Vector2|null=null;private touch=new THREE.Vector2();private touchBoost=false;private heading=0;private cameraAngle=0;private cameraZoom=1;private drag:{x:number;y:number;start:number;button:number}|null=null;
  private jump=0;private jumpCooldown=0;private sonarTime=-20;private sonar!:THREE.Mesh;private ray=new THREE.Raycaster();private pointer=new THREE.Vector2();private plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);private rayPoint=new THREE.Vector3();
  private pearls:THREE.Mesh[]=[];private rings:THREE.Group[]=[];private foliage:THREE.Group[]=[];private birds:THREE.Group[]=[];private boats:THREE.Group[]=[];private glows:THREE.Mesh[]=[];private labels:THREE.Sprite[]=[];
  private particles!:THREE.Points;private wakes:THREE.Mesh[]=[];private wakeIndex=0;private wakeClock=0;private trailData:{age:number;life:number}[]=[];
  private art=new StorybookArt();private swimPhase=0;private turnBend=0;private swimMeshes:{geometry:THREE.BufferGeometry;base:Float32Array}[]=[];
  private arch=new THREE.Group();private original=new THREE.Group();private beyond!:BeyondWorld;private portal=createPortal(oceanGate);private portalCooldown=0;
  private dolphins!:DolphinVisitor;
  private waterPigment:THREE.Texture|null=null;
  private materials:THREE.Material[]=[];private resizeObserver:ResizeObserver;private audio:AudioContext|null=null;private oscillator:OscillatorNode|null=null;private gain:GainNode|null=null;
  constructor(host:HTMLElement,emit:(s:WorldState)=>void,message:(s:string)=>void,interact:(id:PlaceId)=>void){
    this.host=host;this.emit=emit;this.message=message;this.interact=interact;this.state={...initialState,...readSave()};seed=1409;
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.setSize(host.clientWidth,host.clientHeight);
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.18;
    this.renderer.domElement.setAttribute('aria-label','Playable ocean. Use WASD or arrow keys to swim; E to explore, Space to leap, Q for sonar.');this.renderer.domElement.tabIndex=0;host.appendChild(this.renderer.domElement);
    this.scene.background=new THREE.Color(0x1f385c);this.scene.fog=new THREE.FogExp2(0x1f385c,.0044);
    this.scene.add(this.ambient,this.sun);this.sun.position.set(-65,85,-35);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-105,right:105,top:105,bottom:-105,near:1,far:250});this.sun.shadow.bias=-.0015;
    this.buildWater();this.buildIslands();this.buildSky();this.buildCollectibles();this.buildLife();this.buildWake();this.batchScenery();
    for(const child of [...this.scene.children])if(child!==this.water&&child!==this.sun&&child!==this.ambient)this.original.add(child);
    this.dolphins=new DolphinVisitor();this.original.add(this.dolphins.root);
    this.original.add(this.portal);this.scene.add(this.original);
    const archLabel=this.textSprite('VIOLET PORTAL','#efd4ff');archLabel.position.set(oceanGate.x,18,oceanGate.z);archLabel.scale.set(17,2.2,1);this.original.add(archLabel);
    const portalLight=new THREE.PointLight('#b46bff',32,27,1.5);portalLight.position.set(oceanGate.x,6,oceanGate.z+2);this.original.add(portalLight);
    this.scene.add(this.sonar,...this.wakes);
    this.beyond=new BeyondWorld(this.art,this.message);this.scene.add(this.beyond.root);
    for(const p of beyondPlaces){const label=this.textSprite(p.name.toUpperCase(),p.color);label.position.set(p.x,4.7,p.z+p.radius+7);this.beyond.root.add(label);}
    this.beyond.loadWolf();
    this.orca.position.set(0,.55,24);this.orca.add(this.model);this.scene.add(this.orca);
    new GLTFLoader().load(asset('models/orca.glb'),g=>{
      if(this.disposed){g.scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});return;}
      g.scene.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(g.scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const scale=7.6/Math.max(size.x,size.y,size.z);
      const normalization=new THREE.Matrix4().makeScale(scale,scale,scale).multiply(new THREE.Matrix4().makeTranslation(-center.x,-center.y,-center.z));
      g.scene.traverse(o=>{if(o instanceof THREE.Mesh){
        let geometry=o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(normalization);
        geometry.deleteAttribute('normal');const welded=mergeVertices(geometry,.0001);geometry.dispose();geometry=welded;geometry.computeVertexNormals();
        const m=(o.material as THREE.MeshStandardMaterial).clone();m.roughness=.48;m.flatShading=false;if(m.color.r<.1){m.color.set('#17273b');m.emissive.set('#070e1b');
          // Paint the eye markings on the skin itself: no raised overlay geometry.
          m.onBeforeCompile=shader=>{
            shader.vertexShader='varying vec3 vOrcaSkin;\n'+shader.vertexShader;
            shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvOrcaSkin = position;');
            shader.fragmentShader='varying vec3 vOrcaSkin;\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
              vec2 eyeUV = (vOrcaSkin.yz - vec2(-0.04, -2.32)) / vec2(0.14, 0.33);
              float eyeDistance = length(eyeUV);
              float eyeEdge = max(fwidth(eyeDistance), 0.025);
              float eyeMask = 1.0 - smoothstep(1.0-eyeEdge, 1.0+eyeEdge, eyeDistance);
              diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.88, 0.86, 0.82), eyeMask);
            `);
          };
        }else m.color.set('#e6e1d9');
        const mesh=new THREE.Mesh(geometry,m);mesh.castShadow=true;mesh.frustumCulled=false;this.model.add(mesh);
        this.swimMeshes.push({geometry,base:new Float32Array(geometry.attributes.position.array)});
      }});
      this.loaded=true;this.state.ready=true;this.emit({...this.state});
    },undefined,()=>{this.state.error='The orca could not load. Please reload, or open the field guide to read the portfolio.';this.emit({...this.state});});
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.bloom=new UnrealBloomPass(new THREE.Vector2(host.clientWidth,host.clientHeight),.34,.6,.82);this.composer.addPass(this.bloom);this.composer.addPass(new OutputPass());
    this.painter=createPainterPass();this.composer.addPass(this.painter);
    this.camera.position.set(29,40,70);this.camera.lookAt(0,0,8);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();
    window.addEventListener('keydown',this.keydown);window.addEventListener('keyup',this.keyup);window.addEventListener('blur',this.blur);document.addEventListener('visibilitychange',this.visibility);
    const c=this.renderer.domElement;c.addEventListener('pointerdown',this.pointerdown);c.addEventListener('pointermove',this.pointermove);c.addEventListener('pointerup',this.pointerup);c.addEventListener('pointercancel',this.pointercancel);c.addEventListener('wheel',this.wheel,{passive:false});c.addEventListener('contextmenu',this.contextmenu);c.addEventListener('webglcontextlost',this.contextlost);
    this.frame=requestAnimationFrame(this.tick);
  }
  private mat(color:THREE.ColorRepresentation,emissive=false){const m=new THREE.MeshStandardMaterial({color,roughness:.93,flatShading:true,...(emissive?{emissive:color,emissiveIntensity:1.4}:{})});this.materials.push(m);return m;}
  private mesh(geo:THREE.BufferGeometry,mat:THREE.Material,parent:THREE.Object3D,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  private buildWater(){const {mesh,pigment}=createWater();this.water=mesh;this.waterPigment=pigment;this.scene.add(mesh);}
  private buildIslands(){
    const art=this.art;
    for(const [index,p] of places.entries()){
      const island=new THREE.Group();island.position.set(p.x,0,p.z);island.name=p.id+'-shore';this.scene.add(island);
      art.terrain(island,p.radius,index);art.dock(island,p.radius);
      // Willow silhouettes replace the conical trees. Keep the front dock open.
      for(let i=0;i<7;i++){const angle=1.65+i*.48,r=p.radius*(.60+art.random()*.12);art.willow(island,Math.sin(angle)*r,Math.cos(angle)*r,.60+art.random()*.43);}
      if(p.id==='journey'){
        art.lighthouse(island);
        const beam=new THREE.Mesh(new THREE.ConeGeometry(7,62,32,1,true),new THREE.MeshBasicMaterial({color:'#ebc8b0',transparent:true,opacity:.045,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));beam.rotation.z=Math.PI/2;beam.position.set(29,16.6,0);const beacon=new THREE.Group();beacon.add(beam);island.add(beacon);this.boats.push(beacon);
      }else if(p.id==='papers')art.observatory(island);else art.cottage(island,p.id);
      for(let j=0;j<6;j++)art.rock(island,(j%2-.5)*.7,2.78,4+j*1.1,.68,.09,.50,'#a1b0a9');
      // Shore garden: slender grasses, blossoms, stone clusters and wooden fencing.
      for(let k=0;k<42;k++){
        const a=art.random()*6.28,r=p.radius*(.57+art.random()*.22),x=Math.sin(a)*r,z=Math.cos(a)*r;
        if(Math.abs(x)<2&&z>0)continue;
        const h=.35+art.random()*.65;
        for(let j=0;j<3;j++)art.beam(island,new THREE.Vector3(x,2.5,z),new THREE.Vector3(x+(j-1)*.2,2.5+h,z+.08),.022,k%3?'#94b75d':'#719a69');
        if(k%3===0)art.mesh(new THREE.SphereGeometry(.09,8,6),art.paint(k%2?'#dcb6c5':'#bfd898'),island,x,2.5+h,z);
      }
      if(p.id==='contact'){art.box(island,'#a88699',4,3.6,4,1.3,.85,.9);art.beam(island,new THREE.Vector3(4,2.7,4),new THREE.Vector3(4,3.6,4),.09);art.box(island,'#435979',4,3.67,4.47,.85,.08,.04);}
      const sign=this.textSprite(p.name.toUpperCase(),p.color);sign.position.set(p.x,4.7,p.z+p.radius+6.5);sign.scale.set(13.8,1.72,1);this.scene.add(sign);this.labels.push(sign);
      const portal=new THREE.Mesh(new THREE.TorusGeometry(2.1,.045,8,64),this.mat(p.color,true));portal.position.set(p.x,2.25,p.z+p.radius+8);this.scene.add(portal);this.glows.push(portal);
    }
    for(let i=0;i<30;i++){const a=art.random()*6.28,r=111+art.random()*85,h=3+art.random()*12;art.rock(this.scene,Math.sin(a)*r,h*.14,Math.cos(a)*r,2+art.random()*4,h,2+art.random()*4,i%3?'#304a68':'#476486');}
    const arch=this.arch;arch.name="violet-stone-arch";arch.position.set(oceanGate.x,0,oceanGate.z);arch.rotation.y=oceanGate.rotation;this.scene.add(arch);
    for(const x of [-7,7])art.rock(arch,x,4.4,0,3.1,7.6,3.4,'#476584');
    for(let i=0;i<16;i++){const a=i/15*Math.PI;art.rock(arch,Math.cos(a)*7,7+Math.sin(a)*7,0,1.2,1.6,2.1,'#587692');}
  }
  private batchScenery(){this.art.merge(this.scene,new Set<THREE.Object3D>([...this.foliage,...this.birds,...this.boats,...this.glows,...this.pearls,...this.rings,...this.wakes,this.water,this.sonar,this.moon,this.arch]));}
  private textSprite(text:string,color:string){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='#162c4570';ctx.beginPath();ctx.roundRect(4,8,1016,110,35);ctx.fill();ctx.strokeStyle=color+'55';ctx.lineWidth=2;ctx.stroke();ctx.font='500 40px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,512,67);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true});const s=new THREE.Sprite(m);s.scale.set(16,2,1);return s;}
  private buildSky(){
    this.moon=this.mesh(new THREE.SphereGeometry(9,32,24),new THREE.MeshBasicMaterial({color:'#efd6d9',map:new THREE.TextureLoader().load(asset('art/gouache-paper.png'))}),this.scene,-90,86,-165);
    const halo=new THREE.Mesh(new THREE.SphereGeometry(11,24,16),new THREE.MeshBasicMaterial({color:'#f8cfc6',transparent:true,opacity:.055,depthWrite:false}));halo.position.copy(this.moon.position);this.scene.add(halo);
    const starGeo=new THREE.BufferGeometry(),v=[];for(let i=0;i<380;i++){const a=random()*Math.PI*2,r=200+random()*70;v.push(Math.cos(a)*r,50+random()*160,Math.sin(a)*r);}starGeo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));this.scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#dfebe2',size:.42,transparent:true,opacity:.65,sizeAttenuation:true})));
    const cloudMat=new THREE.MeshBasicMaterial({color:'#7084ad',transparent:true,opacity:.10,depthWrite:false});for(let i=0;i<18;i++){const cloud=this.mesh(new THREE.IcosahedronGeometry(1,1),cloudMat,this.scene,(random()-.5)*440,50+random()*20,-130-random()*80,18+random()*18,1.2+random()*3,4+random()*8);cloud.rotation.y=random();}
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
    const flock:THREE.Group[]=[];
    for(let i=0;i<10;i++){const g=new THREE.Group();g.visible=false;g.userData={a:random()*6.28,r:25+random()*80,speed:.08+random()*.1,bird:true};this.scene.add(g);this.birds.push(g);flock.push(g);}
    Promise.all([new GLTFLoader().loadAsync(asset('models/seagull.glb')),new THREE.TextureLoader().loadAsync(asset('models/seagull-coat.jpg'))]).then(([model,coat])=>{
      if(this.disposed){coat.dispose();model.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});return;}
      prepareSeagull(model.scene,coat);
      flock.forEach((g,i)=>{const bird=cloneSkeleton(model.scene);g.add(bird);g.userData.rig=bird;g.visible=true;animateSeagull(bird,i*.7,i);const a=g.userData.a;g.position.set(Math.cos(a)*g.userData.r,15+i%3,Math.sin(a)*g.userData.r);g.rotation.y=-a;});
    }).catch(()=>this.message('The seagull models could not load. Reload to try again.'));
    const geo=new THREE.BufferGeometry(),v=[];for(let i=0;i<200;i++)v.push((random()-.5)*210,.3+random()*9,(random()-.5)*210);geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));this.particles=new THREE.Points(geo,new THREE.PointsMaterial({color:'#c9df95',size:.1,transparent:true,opacity:.7,depthWrite:false}));this.scene.add(this.particles);
    // A sailboat in the outer bay.
    const boat=new THREE.Group();boat.position.set(-26,0,52);this.mesh(new THREE.SphereGeometry(1,10,6),this.mat('#b79a7b'),boat,0,.4,0,1.3,.7,2.7);this.mesh(new THREE.CylinderGeometry(.08,.08,6,8),this.mat('#d2c4ab'),boat,0,3.3,0);const sail=this.mesh(new THREE.ConeGeometry(2.5,4.5,3),this.mat('#d9d5bd'),boat,.5,3.5,0,.6,1,.07);sail.rotation.z=-.15;this.scene.add(boat);boat.userData.boat=true;this.boats.push(boat);
  }
  private buildWake(){for(let i=0;i<85;i++){const m=new THREE.Mesh(new THREE.RingGeometry(.7,1,16,1,0,Math.PI*2),new THREE.MeshBasicMaterial({color:'#ace0d4',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.11;m.visible=false;this.scene.add(m);this.wakes.push(m);this.trailData.push({age:0,life:1});}}
  private ripple(x:number,z:number,big=false){const m=this.wakes[this.wakeIndex],d=this.trailData[this.wakeIndex];m.position.set(x,.12,z);m.scale.setScalar(big?2:.35);m.userData.big=big;m.visible=true;d.age=0;d.life=big?2.5:1.6;this.wakeIndex=(this.wakeIndex+1)%this.wakes.length;}
  private save(){try{localStorage.setItem('yixu-ocean-v1',JSON.stringify({pearls:this.state.pearls,visited:this.state.visited,best:this.state.best,facts:this.state.facts,wolfSeen:this.state.wolfSeen}));}catch{/* Storage can be unavailable in private browsers. */}}
  private keydown=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.closest('input,textarea,[role="dialog"]'))return;const k=e.key.toLowerCase();if((e.target as HTMLElement)?.closest('button')&&(k===' '||k==='enter'))return;if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d','q','e','shift','r'].includes(k))e.preventDefault();if(this.options.paused)return;this.keys.add(k);if(!e.repeat){if(k===' ')this.command('jump');if(k==='q')this.command('sonar');if(k==='r')this.command('race');if(k==='e'&&this.state.near)this.interact(this.state.near);}};
  private keyup=(e:KeyboardEvent)=>{this.keys.delete(e.key.toLowerCase());};private blur=()=>{this.keys.clear();this.touch.set(0,0);this.touchBoost=false;};private visibility=()=>{this.last=0;if(document.hidden)this.blur();};
  private contextmenu=(e:Event)=>e.preventDefault();private contextlost=(e:Event)=>{e.preventDefault();this.state.error='The ocean graphics were interrupted. Reload to return, or continue in the field guide.';this.emit({...this.state});};
  private pointerdown=(e:PointerEvent)=>{if(this.options.paused)return;this.renderer.domElement.focus({preventScroll:true});this.drag={x:e.clientX,y:e.clientY,start:performance.now(),button:e.button};this.renderer.domElement.setPointerCapture(e.pointerId);};
  private pointermove=(e:PointerEvent)=>{if(!this.drag)return;const dx=e.clientX-this.drag.x;if(this.drag.button===2||performance.now()-this.drag.start>190){this.cameraAngle-=dx*.006;this.drag.x=e.clientX;this.drag.y=e.clientY;this.drag.button=2;}};
  private pointerup=(e:PointerEvent)=>{if(this.drag&&this.drag.button!==2&&!this.options.paused){const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);if(this.ray.ray.intersectPlane(this.plane,this.rayPoint)){this.target=new THREE.Vector2(clamp(this.rayPoint.x,-115,115),clamp(this.rayPoint.z,-115,115));this.ripple(this.target.x,this.target.y,true);}}this.drag=null;};
  private pointercancel=()=>{this.drag=null;};private wheel=(e:WheelEvent)=>{e.preventDefault();this.cameraZoom=clamp(this.cameraZoom+e.deltaY*.00065,.65,1.8);};
  setTouch(x:number,z:number,boost=false){this.touch.set(x,z);this.touchBoost=boost;}
  setOptions(o:WorldOptions){const wasSound=this.options.sound;this.options=o;this.renderer.setPixelRatio(Math.min(devicePixelRatio,o.low?1:1.75));this.renderer.shadowMap.enabled=!o.low;this.bloom.enabled=!o.low;this.painter.uniforms.low.value=o.low?1:0;this.water.material.uniforms.night.value=o.night?1:0;this.renderer.toneMappingExposure=o.night?1.18:1.50;this.ambient.intensity=o.night?2:2.9;this.sun.intensity=o.night?2.9:3.8;this.moon.visible=o.night;const sky=o.night?0x1f385c:0xa9e4f4;(this.scene.background as THREE.Color).setHex(sky);(this.scene.fog as THREE.FogExp2).color.setHex(sky);this.ambient.color.setHex(o.night?0x99addb:0xd5f4ff);this.ambient.groundColor.setHex(o.night?0x193448:0x80b4a2);if(o.paused)this.blur();if(o.sound!==wasSound)this.setSound(o.sound);this.resize();}
  private setSound(on:boolean){if(on){try{if(!this.audio){this.audio=new AudioContext();this.gain=this.audio.createGain();this.gain.gain.value=.015;this.gain.connect(this.audio.destination);this.oscillator=this.audio.createOscillator();this.oscillator.type='sine';this.oscillator.frequency.value=82.4;this.oscillator.connect(this.gain);this.oscillator.start();}void this.audio.resume();}catch{this.message('Audio is unavailable in this browser.');}}else if(this.audio)void this.audio.suspend();}
  private chime(freq=660){if(!this.audio||!this.options.sound)return;const o=this.audio.createOscillator(),g=this.audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,this.audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.6,this.audio.currentTime+.5);g.gain.setValueAtTime(.08,this.audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.audio.currentTime+.6);o.connect(g);g.connect(this.audio.destination);o.start();o.stop(this.audio.currentTime+.65);}
  private activePlaces(){return this.state.realm==='ocean'?places:beyondPlaces;}
  private switchRealm(realm:'ocean'|'beyond'){
    this.state.realm=realm;this.original.visible=realm==='ocean';this.beyond.root.visible=realm==='beyond';
    const islands=this.activePlaces();this.water.material.uniforms.islands.value=Array.from({length:6},(_,i)=>islands[i]?new THREE.Vector3(islands[i].x,islands[i].z,islands[i].radius):new THREE.Vector3(9999,9999,1));
    const gate=realm==='ocean'?oceanGate:returnGate;
    this.state.x=gate.x+Math.sin(gate.rotation)*8;this.state.z=gate.z+Math.cos(gate.rotation)*8;
    this.state.near=null;this.state.race=-1;this.rings.forEach(r=>r.visible=false);this.velocity.set(0,0);this.state.speed=0;this.target=null;this.blur();this.portalCooldown=3;
    this.wakes.forEach(w=>w.visible=false);this.heading=0;
    this.camera.position.set(this.state.x+24,35,this.state.z+40);
    this.message(realm==='beyond'?'Beyond the Veil unlocked! Meet the wolf and find five story cards.':'Welcome back to the archipelago.');this.emit({...this.state});
  }
  command(c:Command){
    if(c==='gate'){const gate=this.state.realm==='ocean'?oceanGate:returnGate;this.state.x=gate.x+Math.sin(gate.rotation)*17;this.state.z=gate.z+Math.cos(gate.rotation)*17;
    this.cameraAngle=gate.rotation-.45;this.cameraZoom=1.1;this.heading=gate.rotation;
    const distance=(this.host.clientWidth<700?50:42)*this.cameraZoom;
    this.camera.position.set(this.state.x+Math.sin(gate.rotation)*distance,distance*.68,this.state.z+Math.cos(gate.rotation)*distance);this.camera.lookAt(this.state.x,0,this.state.z-7);this.state.near=null;this.state.speed=0;this.emit({...this.state});this.velocity.set(0,0);this.target=null;this.state.race=-1;this.rings.forEach(r=>r.visible=false);this.message(this.state.realm==='beyond'?'Swim through the violet veil to return.':echoRewards(this.state.pearls.length).portal?'The veil is open. Swim through the violet wall.':`The veil needs ${18-this.state.pearls.length} more echoes.`);return;}
    if(c==='echo'){if(this.state.realm!=='ocean')return;if(!echoRewards(this.state.pearls.length).compass){this.command('sonar');return;}const next=pearlPoints.map((p,i)=>({p,i,d:Math.hypot(p[0]-this.state.x,p[1]-this.state.z)})).filter(p=>!this.state.pearls.includes(p.i)).sort((a,b)=>a.d-b.d)[0];if(next){this.state.x=next.p[0]+4;this.state.z=next.p[1]+4;this.velocity.set(0,0);this.target=new THREE.Vector2(...next.p as [number,number]);this.message('Echo compass: following the next signal.');}else this.command('gate');return;}
if(c==='home'){this.travel('home');return;}if(this.options.paused)return;if(c==='sonar'){if(this.state.realm==='beyond'){const next=factPoints.map((p,i)=>({p,i,d:Math.hypot(p[0]-this.state.x,p[1]-this.state.z)})).filter(p=>!this.state.facts.includes(p.i)).sort((a,b)=>a.d-b.d)[0];this.sonarTime=this.elapsed;this.sonar.position.set(this.state.x,.18,this.state.z);this.message(next?`Story card ${next.i+1} · ${Math.round(next.d)} m away. Look for golden cards around Little Things Island.`:'All five stories found. Thank you for exploring my world!');return;}if(this.elapsed-this.sonarTime<3)return;this.sonarTime=this.elapsed;this.sonar.position.set(this.state.x,.18,this.state.z);this.chime(440);const next=pearlPoints.map((p,i)=>({i,d:Math.hypot(p[0]-this.state.x,p[1]-this.state.z)})).filter(p=>!this.state.pearls.includes(p.i)).sort((a,b)=>a.d-b.d)[0];this.message(next?`Echo pearl detected · ${Math.round(next.d)} m away`:'The violet portal is open! Find it in the northeast, or use Sail to the portal.');}if(c==='jump'&&this.jumpCooldown<=0){this.jump=1.7;this.jumpCooldown=3;this.ripple(this.state.x,this.state.z,true);this.chime(230);}if(c==='race'){if(this.state.realm==='beyond'){this.message('Tide racing is in the first ocean. Return through the violet portal.');return;}if(this.state.race>=0){this.state.race=-1;this.rings.forEach(r=>r.visible=false);this.message('Tide run ended. Your best time is kept.');return;}this.state.race=0;this.state.raceTime=0;this.state.x=racePoints[0][0]+4;this.state.z=racePoints[0][1]+7;this.velocity.set(0,0);this.target=null;this.rings.forEach(r=>r.visible=true);this.message('Tide run started! Swim through the 10 golden rings in order.');}}
  travel(id:PlaceId){const p=allPlaces.find(p=>p.id===id);if(!p)return;const realm=beyondPlaces.some(b=>b.id===id)?'beyond':'ocean';if(realm==='beyond'&&!echoRewards(this.state.pearls.length).portal){this.message('Collect all 18 echoes and cross the violet portal first.');return;}if(realm!==this.state.realm){if(realm==='beyond'){this.message('Enter the new map through the violet portal.');return;}this.switchRealm(realm);}this.state.x=p.x;this.state.z=p.z+p.radius+10;this.velocity.set(0,0);this.target=null;this.state.race=-1;this.rings.forEach(r=>r.visible=false);this.heading=0;this.ripple(this.state.x,this.state.z,true);this.message(`Arrived at ${p.name}`);}
  reset(){this.switchRealm('ocean');this.state.facts=[];this.state.wolfSeen=false;this.state.pearls=[];this.state.visited=[];this.state.best=null;this.pearls.forEach(p=>p.visible=true);this.save();this.travel('home');this.emit({...this.state});}
  private resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);this.composer.setSize(w,h);this.painter.uniforms.resolution.value.set(w*this.renderer.getPixelRatio(),h*this.renderer.getPixelRatio());}
  private tick=(now:number)=>{if(this.disposed)return;this.frame=requestAnimationFrame(this.tick);const dt=this.last?Math.min((now-this.last)/1000,.05):.016;this.last=now;if(document.hidden)return;this.elapsed+=dt;const t=this.elapsed;this.portalCooldown=Math.max(0,this.portalCooldown-dt);
    if(!this.options.paused&&this.loaded){
      const v=new THREE.Vector2((this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0),(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0));v.add(this.touch);const manual=v.lengthSq()>.01;
      const ca=.45+this.cameraAngle;if(manual){this.target=null;v.rotateAround(new THREE.Vector2(),-ca);}else if(this.target){v.set(this.target.x-this.state.x,this.target.y-this.state.z);if(v.length()<1.5){this.target=null;v.set(0,0);}}
      if(v.length()>1)v.normalize();const boosting=(this.keys.has('shift')||this.touchBoost)&&this.state.energy>1&&v.length()>.1;const speed=boosting?20:10;this.state.energy=clamp(this.state.energy+(boosting?(echoRewards(this.state.pearls.length).endurance?-12:-27):19)*dt,0,100);this.velocity.lerp(v.multiplyScalar(speed),1-Math.exp(-dt*3.3));
      let nx=this.state.x+this.velocity.x*dt,nz=this.state.z+this.velocity.y*dt;
      for(const p of this.activePlaces()){const dx=nx-p.x,dz=nz-p.z,d=Math.hypot(dx,dz),min=p.radius+1.8;if(d<min){nx=p.x+dx/Math.max(d,.01)*min;nz=p.z+dz/Math.max(d,.01)*min;this.velocity.multiplyScalar(.7);if(!manual)this.target=null;}}
      const dist=Math.hypot(nx,nz);if(dist>126){nx=nx/dist*126;nz=nz/dist*126;this.target=null;}const gate=this.state.realm==='ocean'?oceanGate:returnGate;
      if(this.portalCooldown<=0&&portalCrossed(this.state,{x:nx,z:nz},gate)){
        if(this.state.realm==='beyond'||echoRewards(this.state.pearls.length).portal){this.switchRealm(this.state.realm==='ocean'?'beyond':'ocean');nx=this.state.x;nz=this.state.z;}
        else {nx=this.state.x;nz=this.state.z;this.velocity.set(0,0);this.target=null;this.portalCooldown=2;this.message(`The veil is sleeping. Collect ${18-this.state.pearls.length} more echoes to open it.`);}
      }
      this.state.x=nx;this.state.z=nz;this.state.speed=this.velocity.length();
      if(this.velocity.length()>.2){const aim=Math.atan2(-this.velocity.x,-this.velocity.y);const diff=Math.atan2(Math.sin(aim-this.heading),Math.cos(aim-this.heading));this.heading+=diff*Math.min(dt*6,1);this.turnBend=THREE.MathUtils.lerp(this.turnBend,diff,dt*5);this.model.rotation.z=THREE.MathUtils.lerp(this.model.rotation.z,-diff*.23,dt*4);}
      this.jumpCooldown-=dt;if(this.jump>0){this.jump-=dt;if(this.jump<=0){this.ripple(nx,nz,true);this.chime(170);}}
      this.state.near=null;for(const p of this.activePlaces()){if(Math.hypot(nx-p.x,nz-(p.z+p.radius+7))<10){this.state.near=p.id;if(!this.state.visited.includes(p.id)){this.state.visited=[...this.state.visited,p.id];this.save();this.message(`Discovered · ${p.name}`);this.chime(700);}break;}}
      if(this.state.realm==='ocean')this.pearls.forEach((p,i)=>{if(p.visible&&Math.hypot(nx-p.position.x,nz-p.position.z)<2.7){p.visible=false;this.state.pearls=[...this.state.pearls,i];this.save();this.chime(880);this.message(this.state.pearls.length===pearlPoints.length?'18 / 18 · The violet portal is OPEN! A new world awaits in the northeast.':this.state.pearls.length===6?'6 / 18 · Echo compass unlocked! Follow the next signal from your expedition panel.':this.state.pearls.length===12?'12 / 18 · Longer glide unlocked! Six more echoes awaken the portal.':`Echo collected · ${this.state.pearls.length} / ${pearlPoints.length}`);this.ripple(nx,nz,true);}});
      if(this.state.realm==='beyond'){
        if(!this.state.wolfSeen&&Math.hypot(nx+35,nz+24)<36){this.state.wolfSeen=true;this.save();this.message('Frostfang discovered! Watch the arctic wolf run across the snow.');this.chime(600);}
        factPoints.forEach((point,i)=>{if(!this.state.facts.includes(i)&&Math.hypot(nx-point[0],nz-point[1])<3){this.state.facts=[...this.state.facts,i];this.save();this.chime(900+i*80);this.ripple(nx,nz,true);this.message(this.state.facts.length===5?'All five story cards found · Kindred Explorer unlocked! Open Fun Facts to read your collection.':`Story ${i+1}: ${funFacts[i].text}`);}});
      }
      if(this.state.race>=0){this.state.raceTime+=dt;const point=racePoints[this.state.race];if(Math.hypot(nx-point[0],nz-point[1])<3.4){this.rings[this.state.race].visible=false;this.state.race++;this.chime(550+this.state.race*70);if(this.state.race===racePoints.length){const time=this.state.raceTime;this.state.best=this.state.best===null?time:Math.min(time,this.state.best);this.state.race=-1;this.save();this.message(`Tide run complete! ${time.toFixed(1)}s · Best ${this.state.best.toFixed(1)}s`);}else this.message(`Ring ${this.state.race} / 10 · Keep going!`);}}
      if(this.velocity.length()>1.5){this.wakeClock+=dt;if(this.wakeClock>.045){this.wakeClock=0;this.ripple(nx+Math.sin(this.heading)*2,nz+Math.cos(this.heading)*2);}}
    }
    this.portal.material.uniforms.time.value=this.options.reduced?0:t;this.portal.material.uniforms.active.value=echoRewards(this.state.pearls.length).portal?1:0;
    this.dolphins.update(dt,this.state.x,this.state.z,this.state.realm==='ocean'&&!this.options.reduced,this.options.paused,(x,z)=>this.ripple(x,z,true));
    this.beyond.update(this.options.paused?0:dt,this.options.reduced,this.state.facts);
    this.state.heading=this.heading;this.orca.position.set(this.state.x,1.1+Math.sin(t*1.8)*.12+(this.jump>0?Math.sin((1.7-this.jump)/1.7*Math.PI)*5.8:0),this.state.z);this.orca.rotation.y=this.heading;this.model.rotation.x=this.jump>0?-Math.cos((1.7-this.jump)/1.7*Math.PI)*.6:Math.sin(t*5)*.025*(this.state.speed/10);this.model.scale.set(1,1,1);
    this.swimPhase+=dt*(1.5+this.state.speed*.32);
    const pose={phase:this.swimPhase,speed:this.state.speed,turn:this.turnBend,breach:this.jump>0?1:0};
    for(const {geometry,base} of this.swimMeshes){const position=geometry.attributes.position;for(let i=0;i<position.count;i++){const d=deformOrca(base[i*3],base[i*3+1],base[i*3+2],pose);position.setXYZ(i,d[0],d[1],d[2]);}position.needsUpdate=true;geometry.computeVertexNormals();}
    this.art.time.value=this.options.reduced?0:t;
    const cangle=.45+this.cameraAngle;const distance=(this.host.clientWidth<700?50:42)*this.cameraZoom;const camTarget=new THREE.Vector3(this.state.x+Math.sin(cangle)*distance,this.options.reduced?40:distance*.68,this.state.z+Math.cos(cangle)*distance);this.camera.position.lerp(camTarget,1-Math.exp(-dt*2.5));this.camera.lookAt(this.state.x,0,this.state.z-7);
    this.water.material.uniforms.time.value=this.options.reduced?0:t;
    if(!this.options.reduced){this.foliage.forEach((g,i)=>g.rotation.z=Math.sin(t*.7+i)*.035);this.birds.forEach((g,i)=>{const d=g.userData,a=d.a+t*d.speed;g.position.x=Math.cos(a)*d.r;g.position.z=Math.sin(a)*d.r;g.rotation.y=-a;g.position.y=d.bird?15+Math.sin(t*.55+i)*1.2:-.34;if(d.bird&&d.rig){animateSeagull(d.rig,t,i);g.rotation.z=-.12+Math.sin(t*.5+i)*.045;}});this.boats.forEach(g=>{if(g.userData.boat){g.rotation.z=Math.sin(t)*.05;g.position.y=Math.sin(t*.7)*.17;}else g.rotation.y=t*.19;});this.pearls.forEach((p,i)=>{p.position.y=1.2+Math.sin(t*2+i)*.25;p.rotation.y=t*.6;p.rotation.z=t*.4;});this.particles.rotation.y=Math.sin(t*.015)*.03;}
    const st=t-this.sonarTime;this.sonar.scale.setScalar(Math.max(.01,st*17));(this.sonar.material as THREE.MeshBasicMaterial).opacity=st<3?(1-st/3)*.6:0;
    this.glows.forEach((g,i)=>{g.scale.setScalar(1+Math.sin(t*1.5+i)*.025);});
    this.rings.forEach((g,i)=>{g.scale.setScalar(this.state.race===i?1+Math.sin(t*3)*.08:.85);});
    this.wakes.forEach((m,i)=>{const d=this.trailData[i];if(!m.visible)return;d.age+=dt;if(d.age>d.life){m.visible=false;return;}m.scale.setScalar((m.userData.big?2:.4)+d.age*(m.userData.big?4:1.5));(m.material as THREE.MeshBasicMaterial).opacity=(1-d.age/d.life)*(m.userData.big?.3:.2);});
    if(t-this.lastEmit>.1){this.lastEmit=t;this.emit({...this.state});}this.composer.render();
  };
  dispose(){this.dolphins.dispose();this.beyond.dispose();this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();window.removeEventListener('keydown',this.keydown);window.removeEventListener('keyup',this.keyup);window.removeEventListener('blur',this.blur);document.removeEventListener('visibilitychange',this.visibility);const c=this.renderer.domElement;c.removeEventListener('pointerdown',this.pointerdown);c.removeEventListener('pointermove',this.pointermove);c.removeEventListener('pointerup',this.pointerup);c.removeEventListener('pointercancel',this.pointercancel);c.removeEventListener('wheel',this.wheel);c.removeEventListener('contextmenu',this.contextmenu);c.removeEventListener('webglcontextlost',this.contextlost);this.scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points||o instanceof THREE.Sprite){if('geometry'in o)o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if('map'in m&&(m as THREE.MeshStandardMaterial).map)(m as THREE.MeshStandardMaterial).map!.dispose();m.dispose();});}});this.art.dispose();this.waterPigment?.dispose();this.composer.dispose();this.renderer.dispose();this.renderer.domElement.remove();void this.audio?.close();}
}
