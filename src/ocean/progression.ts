export const ECHO_GOAL = 18;
export const echoRewards = (count: number) => ({ compass: count >= 6, endurance: count >= 12, portal: count >= ECHO_GOAL });
export function portalCrossed(previous: {x:number;z:number}, current: {x:number;z:number}, gate: {x:number;z:number;rotation:number}) {
 const local=(p:{x:number;z:number})=>({x:Math.cos(gate.rotation)*(p.x-gate.x)-Math.sin(gate.rotation)*(p.z-gate.z),z:Math.sin(gate.rotation)*(p.x-gate.x)+Math.cos(gate.rotation)*(p.z-gate.z)});
 const a=local(previous),b=local(current);
 return Math.abs(b.x)<4.2 && Math.abs(b.z)<1.2 && (a.z*b.z<=0 || Math.abs(b.z)<.45);
}
export function cleanIndices(value:unknown,limit:number):number[]{return Array.isArray(value)?[...new Set(value.filter((n):n is number=>Number.isInteger(n)&&n>=0&&n<limit))]:[];}
