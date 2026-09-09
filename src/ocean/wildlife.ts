import * as THREE from 'three';

// Community rig: https://github.com/svartmc/seagull (MIT).
export function prepareSeagull(root:THREE.Object3D,coat:THREE.Texture){
 coat.colorSpace=THREE.SRGBColorSpace;coat.flipY=true;coat.anisotropy=4;
 const size=new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
 root.scale.setScalar(4.6/size.x);
 root.traverse(o=>{if(o instanceof THREE.Mesh){
  o.castShadow=true;o.frustumCulled=false;
  for(const material of Array.isArray(o.material)?o.material:[o.material])if(material instanceof THREE.MeshStandardMaterial){material.map=coat;material.flatShading=false;material.roughness=.86;material.metalness=0;material.needsUpdate=true;}
 }});
}

export function animateSeagull(root:THREE.Object3D,time:number,index:number){
 const cycle=(time+index*1.7)%8;
 const strength=cycle<3?Math.sin(Math.PI*cycle/3):0;
 const flap=Math.sin(time*6.4+index*.9)*.55*strength;
 for(const [name,side] of [['WINGLEFT',1],['WINGRIGHT',-1]] as const){
  const wing=root.getObjectByName(name),tip=root.getObjectByName(name+'END');
  if(wing)wing.rotation.z=side*(.10+flap);
  if(tip)tip.rotation.z=side*(-.10+Math.sin(time*6.4+index*.9-.65)*.28*strength);
 }
 const tail=root.getObjectByName('TAIL');if(tail)tail.rotation.x=Math.sin(time*.9+index)*.06;
}
