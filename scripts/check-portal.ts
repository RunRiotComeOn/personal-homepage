import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { prepareSeagull, animateSeagull } from '../src/ocean/wildlife';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OceanWorld, readSave } from '../src/ocean/world';
import { initialState } from '../src/ocean/state';
import { echoRewards, cleanIndices, portalCrossed } from '../src/ocean/progression';
import { createPortal, BeyondWorld } from '../src/ocean/beyond';
import { StorybookArt } from '../src/ocean/art';
import { beyondPlaces, factPoints, oceanGate, returnGate } from '../src/ocean/data';
assert.equal(echoRewards(5).compass,false);assert.equal(echoRewards(6).compass,true);
assert.equal(echoRewards(11).endurance,false);assert.equal(echoRewards(12).endurance,true);
assert.equal(echoRewards(17).portal,false);assert.equal(echoRewards(18).portal,true);
assert.deepEqual(cleanIndices([0,0,1,17,18,-1,'2',null],18),[0,1,17]);
for(const gate of [oceanGate,returnGate]){
 const world=(x:number,z:number)=>({x:gate.x+Math.cos(gate.rotation)*x+Math.sin(gate.rotation)*z,z:gate.z-Math.sin(gate.rotation)*x+Math.cos(gate.rotation)*z});
 assert(portalCrossed(world(0,.3),world(0,-.3),gate));
 assert(portalCrossed(world(0,-.3),world(0,.3),gate));
 assert(!portalCrossed(world(8,.3),world(8,-.3),gate),'Walking beside an arch must not teleport');
 assert(!portalCrossed(world(0,5),world(0,4),gate),'Approaching the arch must not teleport early');
 const mesh=createPortal(gate);mesh.geometry.computeBoundingBox();assert(mesh.geometry.boundingBox!.min.y<0,'Portal must reach below water');assert(mesh.material.transparent);assert.equal(mesh.material.depthWrite,false);
}
assert.equal(beyondPlaces.length,2);
for(const p of factPoints)for(const island of beyondPlaces)assert(Math.hypot(p[0]-island.x,p[1]-island.z)>island.radius+2,'All story cards must be reachable outside collision boundaries');
const art=new StorybookArt({paper:new THREE.Texture(),leaves:new THREE.Texture()});const beyond=new BeyondWorld(art,()=>{});assert.equal(beyond.root.visible,false);beyond.root.visible=true;beyond.update(.1,false,[1,3]);assert.equal(beyond.facts[1].visible,false);assert.equal(beyond.facts[0].visible,true);
let meshes=0;beyond.root.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;for(const n of o.geometry.attributes.position.array)assert(Number.isFinite(n));}});assert(meshes>10);
const bytes=readFileSync('public/models/arctic-wolf.glb');const wolf=await new GLTFLoader().register(()=>({name:'HEADLESS_TEST_TEXTURE',loadTexture:()=>Promise.resolve(new THREE.Texture())})).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const run=wolf.animations.find(a=>/run/i.test(a.name));assert(run&&run.duration>0);assert(run.tracks.length>5,'Wolf must use a real skeletal animation');
const mixer=new THREE.AnimationMixer(wolf.scene);mixer.clipAction(run).play();mixer.update(.1);const transforms=()=>{const values:number[]=[];wolf.scene.traverse(o=>values.push(...o.position.toArray(),...o.quaternion.toArray()));return values;};const before=transforms();mixer.update(.2);assert.notDeepEqual(transforms(),before,'Run must move the rig');
const gullBytes=readFileSync('public/models/seagull.glb');const gull=await new GLTFLoader().parseAsync(gullBytes.buffer.slice(gullBytes.byteOffset,gullBytes.byteOffset+gullBytes.byteLength),'');
prepareSeagull(gull.scene,new THREE.Texture());const gullA=cloneSkeleton(gull.scene),gullB=cloneSkeleton(gull.scene);
const wingA=gullA.getObjectByName('WINGLEFT')!,wingB=gullB.getObjectByName('WINGLEFT')!;assert(wingA&&wingB&&wingA!==wingB,'Every gull must have its own wing rig');
const resting=wingB.quaternion.toArray();animateSeagull(gullA,1.1,0);assert.notDeepEqual(wingA.quaternion.toArray(),resting);assert.deepEqual(wingB.quaternion.toArray(),resting,'Animating one gull must not deform the rest of the flock');
let skinCount=0;gullA.traverse(o=>{if(o instanceof THREE.SkinnedMesh){skinCount++;assert(o.geometry.attributes.uv,'Community gull texture must have UVs');assert(o.skeleton.bones.includes(wingA as THREE.Bone),'Cloned skin must bind to its own animated wing');}});assert(skinCount>0);
assert(Math.abs(new THREE.Box3().setFromObject(gullB).getSize(new THREE.Vector3()).x-4.6)<.01,'Gull wingspan must use game world scale');
for(const file of ['src/App.tsx','src/ocean/data.ts'])assert(!/\p{Script=Han}/u.test(readFileSync(file,'utf8')),'No Chinese UI text');
// Exercise actual map switching and reset methods without constructing a WebGL renderer.
let saved='';Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>saved,setItem:(_key:string,value:string)=>{saved=value;}}});
const harness=Object.create(OceanWorld.prototype);
Object.assign(harness,{state:{...initialState,pearls:[],facts:[],visited:[]},original:new THREE.Group(),beyond:{root:new THREE.Group()},water:{material:{uniforms:{islands:{value:[]}}}},rings:[],wakes:[],pearls:[],velocity:new THREE.Vector2(),keys:new Set(),touch:new THREE.Vector2(),camera:new THREE.PerspectiveCamera(),message:()=>{},emit:()=>{},blur:()=>{},ripple:()=>{}});
harness.travel('arctic');assert.equal(harness.state.realm,'ocean','Locked bonus island cannot bypass the portal');
harness.state.pearls=Array.from({length:18},(_,i)=>i);harness.switchRealm('beyond');assert.equal(harness.original.visible,false);assert.equal(harness.beyond.root.visible,true);assert.equal(harness.water.material.uniforms.islands.value[0].x,-35);harness.travel('facts');assert.equal(harness.state.x,40);
harness.state.facts=[0,1];harness.state.wolfSeen=true;harness.save();assert.deepEqual(readSave().facts,[0,1]);assert.equal(readSave().wolfSeen,true);
harness.switchRealm('ocean');assert.equal(harness.original.visible,true);assert.equal(harness.beyond.root.visible,false);assert.equal(harness.state.facts.length,2,'Return trip preserves story progress');harness.reset();assert.equal(harness.state.realm,'ocean');assert.equal(harness.state.pearls.length,0);assert.equal(harness.state.facts.length,0);assert.equal(harness.state.wolfSeen,false);assert.deepEqual(readSave().pearls,[]);
for(const [width,height] of [[1440,900],[390,844]]){
 harness.host={clientWidth:width};harness.camera=new THREE.PerspectiveCamera(43,width/height,.2,650);harness.command('gate');harness.camera.updateMatrixWorld(true);
 for(const x of [-9,0,9])for(const y of [0,18]){const point=new THREE.Vector3(oceanGate.x+Math.cos(oceanGate.rotation)*x,y,oceanGate.z-Math.sin(oceanGate.rotation)*x).project(harness.camera);assert(Math.abs(point.x)<1&&Math.abs(point.y)<1,'Arch and label must fit in the arrival camera on desktop and mobile');}
 assert.equal(harness.state.realm,'ocean','Finding an arch must not bypass unlocking');
}
console.log(JSON.stringify({checks:'reward thresholds, save sanitization, two-way portal crossing, reachable story cards, valid second-map geometry, real wolf Run animation, English UI',wolfAnimations:wolf.animations.length,newMapMeshes:meshes}));
beyond.dispose();art.dispose();
