#version 150

#define S(a,b,t) smoothstep(a,b,t)

//precision highp float;
out vec4 fragColor;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float pos[10];
uniform int num;

const int OVERLAP = 660;
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

    vec3 back = vec3(.3, .3, .3);

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
        v += ballM(gl_FragCoord.xy, vec2(posRel.x, posRel.y), 8.);
        vBot += ballM(gl_FragCoord.xy, vec2(posRel.x, posRel.y - (OVERLAP/2.)/u_res.y), 8.);
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

    back = back*(mask+maskBot);
    back = vec3(pow(back.r, 1./(GAMMA+.4)), pow(back.g, 1./(GAMMA+.4)), pow(back.b, 1./(GAMMA+.4)));
    
    // mix between masked texture and gamma corrected based on mask value
    vec3 color = mix(correct, base, mask);
    vec3 colorBot = mix(correctBot, baseBot, maskBot);

//    vec4 grainyCombine = vec4(color + colorBot + back, 1.) + grain*.4;
    vec4 grainyCombine = vec4(color + colorBot, 1.) + grain*.4;

//	float v = ball(gl_FragCoord.xy, vec2(sin(u_time)*0.4, cos(u_time)*0.4), 7.0);
//    v += ball(gl_FragCoord.xy, vec2(sin(u_time*0.6)*0.2, cos(u_time)*0.3), 6.0);
//    v += ball(gl_FragCoord.xy, vec2(cos(u_time*0.8)*0.7, sin(u_time*1.1)*0.4), 5.0);
//    //v += ball(fragCoord, vec2(cos(u_time*0.2)*0.2, sin(u_time*0.9)*0.5), 8.0);
//    v += ballM(gl_FragCoord.xy, vec2(u_mouse.x/u_res.x, 1.-u_mouse.y/u_res.y), 8.0);
    
//	fragColor = vec4(v, v, v, 1.0);
    fragColor = grainyCombine;
//    fragColor = vec4(base, 1.);
//    fragColor = vec4(color+colorBot, 1.);
//    fragColor = vec4(mask, mask, mask, 1.);
//    fragColor = vec4(maskBot, maskBot, maskBot, 1.);
//    fragColor = vec4(mask+maskBot,mask+maskBot,mask+maskBot, 1.);
}