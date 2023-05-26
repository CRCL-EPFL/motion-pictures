 #version 330

uniform vec2 u_res;
uniform float u_time;

uniform int u_overlap;
uniform int u_blendExp;
uniform float u_gamma;

const int BALLS = 4;

float rand(float n){return fract(sin(n) * 43758.5453123);}

vec2 hash(vec2 co) {
    float m = dot(co, vec2(12.9898, 78.233));
    return fract(vec2(sin(m),cos(m))* 43758.5453) * 2. - 1.;
}

float fade(float t) { return t * t * t * (t * (t * 6. - 15.) + 10.); }

vec2 ssmooth(vec2 x) { return vec2(fade(x.x), fade(x.y)); }

vec2 soften(vec2 t) {
    vec2 t3 = t * t * t;
    vec2 t4 = t3 * t;
    vec2 t5 = t4 * t;
    return 6.0f * t5 -
           15.0f * t4 +
           10.0f * t3;
}

vec2 hash22(uvec2 p) {
    const uint PRIME32_2 = 2246822519U, PRIME32_3 = 3266489917U;
    const uint PRIME32_4 = 668265263U, PRIME32_5 = 374761393U;
    uint h32 = p.y + PRIME32_5 + p.x*PRIME32_3;
    //h32 = PRIME32_4*((h32 << 17) | (h32 >> (32 - 17))); //Initial testing suggests this line could be omitted for extra perf
    //h32 = PRIME32_2*(h32^(h32 >> 15));
    //h32 = PRIME32_3*(h32^(h32 >> 13));
    h32 = h32^(h32 >> 16);
    uvec2 rz = uvec2(h32, h32*48271U);
    return vec2(rz.xy & uvec2(0x7fffffffU)) / float(0x7fffffff);
}

float perlinNoise(vec2 uv) {
    vec2 PT  = ceil(uv);
    vec2 pt  = fract(uv);
    vec2 mmpt= ssmooth(pt);

    vec4 grads = vec4(
        dot(hash(PT + vec2(.0, 1.)), pt-vec2(.0, 1.)),
        dot(hash(PT + vec2(1., 1.)), pt-vec2(1., 1.)),
        dot(hash(PT + vec2(.0, .0)), pt-vec2(.0, .0)),
        dot(hash(PT + vec2(1., .0)), pt-vec2(1., 0.))
    );

    return 5.*mix (mix (grads.z, grads.w, mmpt.x), mix (grads.x, grads.y, mmpt.x), mmpt.y);
}

// https://github.com/hughsk/glsl-hsv2rgb/blob/master/index.glsl
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

out vec4 fragColor;

float map(float value, float min1, float max1, float min2, float max2) {
	return clamp(min2 + (value - min1) * (max2 - min2) / (max1 - min1), min2, max2);
}

float blend(float x) {
	return clamp(.5 * pow(2*x, u_blendExp), 0., 1.);
}

void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 position = gl_FragCoord.xy/u_res.xy;
    position.x *= u_res.x / u_res.y;
    
    // Grain
    float strength = 20.0;
    
    float x = (position.x + 4.0 ) * (position.y + 4.0 ) * (u_time * 10.0);
    vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * strength;
    
    vec3 dist = vec3(0.0);
    vec3 distBot = vec3(0.0);
    for (int i = 0 ; i < BALLS ; i++) {
        vec2 bpos = vec2(perlinNoise(vec2(float(i*3218) + cos(u_time*0.1), u_time*0.1)), perlinNoise(vec2(float(i*1357) + sin(u_time*0.1), -u_time*0.1))) / 5.0;
        bpos += vec2(0.5 * u_res.x/u_res.y,0.5);
        dist += hsv2rgb(vec3(float(i) / float(BALLS), 1.0, 1.0)) * 1.0 / (pow(position.x - bpos.x, 2.0) + pow(position.y - bpos.y, 2.0));
        distBot += hsv2rgb(vec3(float(i) / float(BALLS), 1.0, 1.0)) * 1.0 / (pow(position.x - bpos.x, 2.0) + pow(position.y + u_overlap/u_res.y - bpos.y, 2.0));
//        distBot += hsv2rgb(vec3(float(i) / float(BALLS), 1.0, 1.0)) * 1.0 / (pow(position.x - bpos.x, 2.0) + pow(position.y - bpos.y, 2.0));
    }

    //dist = clamp(dist, 0., 2.);
    
    float halfway = u_res.y/2.;
    
    // calculate location in overlap
    float mask = 1. - map(gl_FragCoord.y, halfway+u_overlap, halfway, 0., 1.);
    // get mask values
    mask = blend(mask);
    
    // calculate location in overlap
    float maskBot = 1. - map(gl_FragCoord.y, halfway-u_overlap, halfway, 0., 1.);
    // get mask values
    maskBot = blend(maskBot);
    
    // make vec3 to store masked texture
    //    vec3 base = dist.rgb/30. * step(halfway-u_overlap, gl_FragCoord.y);
    vec3 base = dist.rgb/30. * step(halfway, gl_FragCoord.y);
    //base = vec3(clamp(dist.r, 0., 10.), clamp(dist.g, 0., 10.), clamp(dist.b, 0., 10.));
//    base = vec3(4., 10., 0.);
    base = base * mask;
    // vec3 to store gamma corrected mask
    vec3 correct = vec3(pow(base.r, 1./u_gamma), pow(base.g, 1./u_gamma), pow(base.b, 1./u_gamma));
    
    // make vec3 to store masked texture
    vec3 baseBot = distBot.rgb/30. * (1. - step(halfway, gl_FragCoord.y));
    //    vec3 baseBot = distBot.rgb/30. * (1. - step(halfway+u_overlap, gl_FragCoord.y));
    baseBot = baseBot * maskBot;
    // vec3 to store gamma corrected mask
    vec3 correctBot = vec3(pow(baseBot.r, 1./u_gamma), pow(baseBot.g, 1./u_gamma), pow(baseBot.b, 1./u_gamma));
    
    // mix between masked texture and gamma corrected based on mask value
    vec3 color = mix(correct, base, mask);
    vec3 colorBot = mix(correctBot, baseBot, maskBot);
    //    vec3 color = baseBot;
    //	vec3 color = base+baseBot;
    
    vec4 grainyCombine = vec4(color + colorBot, 1.) + grain*.4;
    
    vec4 wholeShader = vec4(dist/30., 1.0) + grain*.4;
    
    vec4 top = wholeShader * step(u_res.y/2. - u_overlap/2., gl_FragCoord.y);
    vec4 bot = wholeShader * (1. - step(u_res.y/2. + u_overlap/2., gl_FragCoord.y));
    
    //fragColor = top + bot;
//    fragColor = vec4(colorBot, 1.);
    fragColor = grainyCombine;
//    fragColor = vec4(base, 1.);
//    fragColor = vec4(color+colorBot, 1.);
//    fragColor = vec4(mask, mask, mask, 1.);
//    fragColor = vec4(maskBot, maskBot, maskBot, 1.);
}
