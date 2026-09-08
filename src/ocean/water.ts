import * as THREE from 'three';
import { places, asset } from './data';
/** Hand-painted water: moving swells, pigment, fragmented moonlight and shore wash. */
export function createWater(){
 const pigment=new THREE.TextureLoader().load(asset('art/gouache-paper.png'));pigment.wrapS=pigment.wrapT=THREE.RepeatWrapping;pigment.colorSpace=THREE.SRGBColorSpace;pigment.anisotropy=4;
 const uniforms={time:{value:0},night:{value:0},pigment:{value:pigment},islands:{value:places.map(p=>new THREE.Vector3(p.x,p.z,p.radius))}};
 const m=new THREE.ShaderMaterial({uniforms,vertexShader:`
 varying vec3 vWorld;varying vec3 vNormal;uniform float time;
 float wave(vec2 p){return sin(dot(p,vec2(.38,.12))+time*.95)*.15+sin(dot(p,vec2(-.16,.29))-time*.72)*.12+sin(dot(p,vec2(.73,-.32))+time*1.4)*.036;}
 void main(){vec4 world=modelMatrix*vec4(position,1.);float h=wave(world.xz);world.y+=h;vWorld=world.xyz;float e=.15;vNormal=normalize(vec3(wave(world.xz-vec2(e,0))-wave(world.xz+vec2(e,0)),2.*e,wave(world.xz-vec2(0,e))-wave(world.xz+vec2(0,e))));gl_Position=projectionMatrix*viewMatrix*world;}`,
 fragmentShader:`
 uniform float time;uniform float night;uniform sampler2D pigment;uniform vec3 islands[6];varying vec3 vWorld;varying vec3 vNormal;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){return noise(p)*.55+noise(p*2.1)*.27+noise(p*4.3)*.13+noise(p*8.9)*.05;}
 void main(){
 vec2 p=vWorld.xz;float d=999.;for(int i=0;i<6;i++){vec2 q=p-islands[i].xy;float a=atan(q.x,q.y);float outline=.94+.055*sin(a*3.+float(i))+.035*sin(a*7.-float(i)*.6);d=min(d,length(q)-islands[i].z*outline);}
 vec2 drift=vec2(time*.055,-time*.035);float broad=fbm(p*.09+drift),small=fbm(p*.8-drift*.5);float brush=texture2D(pigment,p*.075+vec2(time*.003,0)).r;
 vec3 deep=mix(vec3(.055,.48,.62),vec3(.035,.11,.25),night);vec3 shallow=mix(vec3(.25,.76,.67),vec3(.12,.34,.43),night);vec3 c=mix(shallow,deep,smoothstep(-1.,30.,d));c*=.84+broad*.34;c+=vec3(.13,.21,.26)*(brush-.34)*.37;
 // Long, broken brush marks follow the swell instead of forming a uniform grid.
 float strokecoordinate=p.y*.72+p.x*.14+sin(p.x*.30+time*.35)*.65+small*.9-time*.58;
 float crest=pow(.5+.5*sin(strokecoordinate),28.)*smoothstep(.38,.68,noise(vec2(p.x*.43-time*.04,p.y*.07)));
 c+=vec3(.24,.42,.53)*crest*.24;
 // The wash advances and breaks into foam, then recedes along organic coastlines.
 float washDistance=d-1.2-sin(time*.8+fbm(p*.2)*3.)*.8;
 float edge=(1.-smoothstep(.08,.8,abs(washDistance)))*smoothstep(.16,.52,small);
 float threads=pow(.5+.5*sin(d*2.5-time*1.15+small*3.),19.)*(1.-smoothstep(1.,9.,d))*smoothstep(-1.,1.,d);
 c=mix(c,vec3(.56,.75,.71),edge*.62+threads*.20);
 // Shallow-water caustics, kept irregular and submerged in the pigment.
 float caustic=pow(1.-abs(sin(p.x*.83+sin(p.y*.6+time*.25))*cos(p.y*.88+sin(p.x*.4-time*.3))),16.);
 c+=vec3(.20,.38,.24)*caustic*(1.-smoothstep(0.,13.,d))*.27;
 // A soft Fresnel reflection and fractured pink moon path.
 vec3 viewDir=normalize(cameraPosition-vWorld);float fresnel=pow(1.-max(dot(viewDir,vNormal),0.),3.);
 vec3 moonDir=normalize(vec3(-.47,.61,-.63));vec3 halfway=normalize(moonDir+viewDir);float spec=pow(max(dot(vNormal,halfway),0.),72.);
 float glints=spec*smoothstep(.35,.7,small);c+=mix(vec3(.84,.73,.47),vec3(.82,.65,.70),night)*glints*.62;
 c=mix(c,mix(vec3(.58,.84,.91),vec3(.22,.35,.49),night),fresnel*.27);
 float fog=1.-exp(-.0044*.0044*pow(gl_FragCoord.z/gl_FragCoord.w,2.));c=mix(c,mix(vec3(.40,.76,.88),vec3(.12,.22,.36),night),clamp(fog,0.,.88));gl_FragColor=vec4(c,1.);
 }`});
 // Small enough vertices for actual swells, rather than the former 16 m grid.
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(520,520,320,320),m);mesh.rotation.x=-Math.PI/2;mesh.position.y=-.2;mesh.name='painted-tidal-ocean';return {mesh,pigment};
}
