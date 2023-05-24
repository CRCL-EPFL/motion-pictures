#version 150

//precision highp float;
out vec4 fragColor;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

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

void main() {
    vec2 uv = gl_FragCoord.xy;
    fragColor = vec4(genBack(uv)*maskEdge(uv), 1.);
}