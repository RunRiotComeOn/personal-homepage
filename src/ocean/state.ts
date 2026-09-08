import type { PlaceId } from './data';
export type WorldState = {realm:'ocean'|'beyond';facts:number[];wolfSeen:boolean;x:number;z:number;heading:number;speed:number;energy:number;near:PlaceId|null;pearls:number[];visited:PlaceId[];race:number;raceTime:number;best:number|null;ready:boolean;error:string|null};
export type Command = 'sonar'|'jump'|'race'|'home'|'gate'|'echo';
export type WorldOptions = {paused:boolean;night:boolean;low:boolean;reduced:boolean;sound:boolean};
export const initialState: WorldState = {realm:'ocean',facts:[],wolfSeen:false,x:0,z:24,heading:0,speed:0,energy:100,near:null,pearls:[],visited:[],race:-1,raceTime:0,best:null,ready:false,error:null};
