#version 150

//precision highp float;
out vec4 fragColor;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float pos[10];
uniform int num;

const int OVERLAP = 100;
const float GAMMA = 1.8;

float map(float value, float min1, float max1, float min2, float max2) {
	return clamp(min2 + (value - min1) * (max2 - min2) / (max1 - min1), min2, max2);
}

float blend(float x) {
	return clamp(.5 * pow(2*x, 2), 0., 1.);
}

float ball(vec2 fragCoord, vec2 tPos, float r) {
    vec2 pos = fragCoord.xy/u_res.yy - vec2(0.5);
    pos.x -= ((u_res.x-u_res.y)/u_res.y)/2.0;
    return pow(max(1.0-length(pos-tPos), 0.0) , r);
//    return step(tPos, pos);
}

float ballM(vec2 fragCoord, vec2 tPos, float r) {
    vec2 pos = fragCoord.xy/u_res.xy;
    return pow(max(1.0-length(pos-tPos), 0.0) , r);
}

void main() {
//    vec2 posRel = vec2(pos[0]/u_res.x, 1 - (pos[1]/u_res.y));
//    float v = ballM(gl_FragCoord.xy, vec2(posRel.x, posRel.y), 8.);
//    v = clamp((v-0.5)*1000.0, 0.0, 1.0);
//	fragColor = vec4(v, v, v, 1.0);

    // Normalized pixel coordinates (from 0 to 1)
    vec2 position = gl_FragCoord.xy/u_res.xy;
    position.x *= u_res.x / u_res.y;
    
    // Grain
    float strength = 20.0;
    
    float x = (position.x + 4.0 ) * (position.y + 4.0 ) * (u_time * 10.0);
    vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * strength;

    float v = 0.;
    float vBot = 0.;
    for (int i = 0; i < num * 2; i+=2){
        vec2 posRel = vec2(pos[i]/u_res.x, 1 - (pos[i+1]/u_res.y));
//        vec2 center = u_res.xy * posRel;
        v += ballM(gl_FragCoord.xy, vec2(posRel.x, posRel.y), 4.);
        vBot += ballM(gl_FragCoord.xy, vec2(posRel.x, posRel.y + OVERLAP/u_res.y), 4.);
    }

    float halfway = u_res.y/2.;
    
    // calculate location in overlap
    float mask = 1. - map(gl_FragCoord.y, halfway+OVERLAP, halfway, 0., 1.);
    // get mask values
    mask = blend(mask);
    
    // calculate location in overlap
    float maskBot = 1. - map(gl_FragCoord.y, halfway-OVERLAP, halfway, 0., 1.);
    // get mask values
    maskBot = blend(maskBot);

    v = clamp((v-0.5)*1000.0, 0.0, 1.0);
    vBot = clamp((vBot-0.5)*1000.0, 0.0, 1.0);

    // make vec3 to store masked texture
    //    vec3 base = dist.rgb/30. * step(halfway-u_overlap, gl_FragCoord.y);
    vec3 base = vec3(v) * step(halfway, gl_FragCoord.y);
    //base = vec3(clamp(dist.r, 0., 10.), clamp(dist.g, 0., 10.), clamp(dist.b, 0., 10.));
//    base = vec3(4., 10., 0.);
    base = base * mask;
    // vec3 to store gamma corrected mask
    vec3 correct = vec3(pow(base.r, 1./GAMMA), pow(base.g, 1./GAMMA), pow(base.b, 1./GAMMA));
    
    // make vec3 to store masked texture
    vec3 baseBot = vec3(vBot) * (1. - step(halfway, gl_FragCoord.y));
//        vec3 baseBot = distBot.rgb/30. * (1. - step(halfway+u_overlap, gl_FragCoord.y));
    baseBot = baseBot * maskBot;
    // vec3 to store gamma corrected mask
    vec3 correctBot = vec3(pow(baseBot.r, 1./GAMMA), pow(baseBot.g, 1./GAMMA), pow(baseBot.b, 1./GAMMA));
    
    // mix between masked texture and gamma corrected based on mask value
    vec3 color = mix(correct, base, mask);
    vec3 colorBot = mix(correctBot, baseBot, maskBot);

    vec4 grainyCombine = vec4(color + colorBot, 1.) + grain*.4;

//	float v = ball(gl_FragCoord.xy, vec2(sin(u_time)*0.4, cos(u_time)*0.4), 7.0);
//    v += ball(gl_FragCoord.xy, vec2(sin(u_time*0.6)*0.2, cos(u_time)*0.3), 6.0);
//    v += ball(gl_FragCoord.xy, vec2(cos(u_time*0.8)*0.7, sin(u_time*1.1)*0.4), 5.0);
//    //v += ball(fragCoord, vec2(cos(u_time*0.2)*0.2, sin(u_time*0.9)*0.5), 8.0);
//    v += ballM(gl_FragCoord.xy, vec2(u_mouse.x/u_res.x, 1.-u_mouse.y/u_res.y), 8.0);
    
//	fragColor = vec4(v, v, v, 1.0);
    fragColor = grainyCombine;
}

#define S(a,b,t) smoothstep(a,b,t)

mat2 Rot(float a)
{
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

// Created by iq/2014
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
vec2 hash( vec2 p )
{
    p = vec2( dot(p,vec2(2127.1, 81.17)), dot(p,vec2(1269.5, 283.37)) );
	return fract(sin(p) * 43758.5453);
}

float noise( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );
	
	vec2 u = f*f*(3.0-2.0*f);

    float n = mix( mix( dot( -1.0+2.0*hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                        dot( -1.0+2.0*hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                   mix( dot( -1.0+2.0*hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                        dot( -1.0+2.0*hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
	return 0.5 + 0.5*n;
}

vec3 hsb2rgb( vec3 color ){
    float h = color[0];
    float s = color[1];
    float v = color[2];
    vec3 rgb = clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return v * mix(vec3(1.0), rgb, s);
}

// Function to generate the flowing background colors
vec3 genBack(vec2 uv) {
    float ratio = u_res.x / u_res.y;

    vec2 tuv = uv/u_res.xy;
    tuv -= .5;

    // rotate with noise
    float degree = noise(vec2(u_time*.1, tuv.x*tuv.y));

    tuv.y *= 1./ratio;
    tuv *= Rot(radians((degree-.5)*720.+180.));
    tuv.y *= ratio;
    
    // Wave warp with sin
    float frequency = 5.;
    float amplitude = 30.;
    float speed = u_time * 1.3;
    tuv.x += sin(tuv.y*frequency+speed)/amplitude;
    tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
    
//    vec3 colorYellow = vec3(.957, .804, .623);
//    vec3 colorDeepBlue = vec3(.192, .384, .933);
//    vec3 colorRed = vec3(.910, .510, .8);
//    vec3 colorBlue = vec3(0.350, .71, .953);
    
    // draw the image
    vec3 colorYellow = hsb2rgb(vec3(.678,.8,1.));
    vec3 colorDeepBlue = hsb2rgb(vec3(.8,.72,.94));
    vec3 colorRed = hsb2rgb(vec3(.53,.8,.95));
    vec3 colorBlue = hsb2rgb(vec3(.05,.83,.81));
    vec3 layer1 = mix(colorYellow, colorDeepBlue, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
    
    vec3 layer2 = mix(colorRed, colorBlue, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
    
    vec3 finalComp = mix(layer1, layer2, S(.5, -.3, tuv.y));
    
    return finalComp;
}

vec3 maskEdge( vec2 uv ) {
    vec2 tuv = uv.xy/u_res.xy;
    tuv.x *= u_res.x / u_res.y;

    // bottom-left
    vec2 bl = smoothstep(vec2(0.0), vec2(.03),tuv);
    float pct = bl.x * bl.y;

    // top-right
    vec2 tr = smoothstep(vec2(0.0), vec2(.03),1.0-tuv);
    pct *= tr.x * tr.y;

    return 1.-vec3(pct);
}

// void main() {
//     vec2 uv = gl_FragCoord.xy;
//     fragColor = vec4(genBack(uv)*maskEdge(uv), 1.);
// }