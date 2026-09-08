/**
 * Swimming is a travelling dorsoventral wave, not a rigid object rotation.
 * Model coordinates: the nose is -Z, tail flukes are +Z. All values are metres.
 * The same deformation is evaluated for positions and surface tangents.
 */
export type SwimPose = {phase:number;speed:number;turn:number;breach:number};
export function deformOrca(x:number,y:number,z:number,pose:SwimPose):[number,number,number]{
 const speed=Math.min(1,Math.max(0,pose.speed/20));
 const tail=Math.min(1,Math.max(0,(z+.8)/4.6));
 const envelope=tail*tail;
 const wave=Math.sin(pose.phase-z*.7);
 const amplitude=.17+speed*.62;
 const bend=amplitude*envelope*wave;
 // Pitch the flukes in opposition to the peduncle's stroke for lift.
 const fluke=Math.min(1,Math.max(0,(z-2.25)/1.1));
 const flap=Math.cos(pose.phase-z*.48)*(.10+speed*.24)*fluke;
 const outY=y+bend+(z-2.25)*flap*fluke;
 // An independently controlled lateral bend follows steering.
 const outX=x+Math.max(-1,Math.min(1,pose.turn))*.46*envelope;
 // Pectoral fins make a small, distinct balancing stroke; the head remains steady.
 const fin=Math.max(0,Math.abs(x)-.72)*Math.max(0,1-Math.abs(z+.8)/1.6);
 const roll=Math.sin(pose.phase*.6+x*1.4)*(.045+speed*.07)*fin;
 return [outX,outY+roll,z+Math.sin(pose.phase-z*.7+Math.PI/2)*envelope*.045*(1-pose.breach*.5)];
}
