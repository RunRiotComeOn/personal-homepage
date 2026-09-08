import { Vector2 } from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
/** Edge-preserving paint pass. Low quality skips neighborhood sampling. */
export function createPainterPass(){return new ShaderPass({
 uniforms:{tDiffuse:{value:null},resolution:{value:new Vector2(1280,720)},low:{value:0}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 resolution;uniform float low;varying vec2 vUv;
 float grain(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 void main(){vec3 original=texture2D(tDiffuse,vUv).rgb;vec3 paint=original;float minimum=100.;
 if(low<.5){
  for(int q=0;q<4;q++){
   vec2 dir=vec2(q==0||q==2?-1.:1.,q<2?-1.:1.);vec3 mean=vec3(0.);vec3 second=vec3(0.);
   for(int x=0;x<3;x++)for(int y=0;y<3;y++){vec2 uv=vUv+vec2(float(x),float(y))*dir*1.12/resolution;vec3 c=texture2D(tDiffuse,uv).rgb;mean+=c;second+=c*c;}
   mean/=9.;vec3 variance=abs(second/9.-mean*mean);float v=variance.r+variance.g+variance.b;if(v<minimum){minimum=v;paint=mean;}
  }
 }
 vec3 color=mix(original,paint,.53);float lum=dot(color,vec3(.299,.587,.114));
 float paper=grain(floor(vUv*resolution*.8));float dry=sin(vUv.y*resolution.y*.8+sin(vUv.x*resolution.x*.11)*2.);
 color+=(paper-.5)*.052+dry*.006;
 color=mix(color,color*vec3(.89,.98,1.07),.23*(1.-smoothstep(.2,.6,lum)));
 float vignette=1.-.18*pow(length((vUv-.5)*1.3),2.);gl_FragColor=vec4(color*vignette,1.);
 }`});}
