#version 330

uniform vec2 u_res;
uniform float u_time;
uniform float pos[20];

const int BALLS = 5;

// noise and rand functions stolen from stack overflow :)
float rand(float n){return fract(sin(n) * 43758.5453123);}

vec2 hash(vec2 co) {
    float m = dot(co, vec2(12.9898, 78.233));
    return fract(vec2(sin(m),cos(m))* 43758.5453) * 2. - 1.;
}

float fade(float t) { return t * t * t * (t * (t * 6. - 15.) + 10.); }

vec2 ssmooth(vec2 x) { return vec2(fade(x.x), fade(x.y)); }

// from https://www.shadertoy.com/view/ts2BRR

vec2 soften(vec2 t)
{
    vec2 t3 = t * t * t;
    vec2 t4 = t3 * t;
    vec2 t5 = t4 * t;
    return 6.0f * t5 -
           15.0f * t4 +
           10.0f * t3;
}

vec2 hash22(uvec2 p)
{
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

//float perlinNoise(vec2 uv) {
//    // Find corner coordinates
//        vec4 lwrUpr = vec4(floor(uv), ceil(uv));
//        mat4x2 crnrs = mat4x2(lwrUpr.xw, lwrUpr.zw,
//                              lwrUpr.xy, lwrUpr.zy);
//
//        // Generate gradients at each corner
//        vec2 scTime = abs(vec2(sin(u_time), cos(u_time))) + vec2(0.75);
//        mat4x2 dirs = mat4x2(hash22(uvec2(floatBitsToUint(crnrs[0]))) * scTime,
//                             hash22(uvec2(floatBitsToUint(crnrs[1]))) * scTime,
//                             hash22(uvec2(floatBitsToUint(crnrs[2]))) * scTime,
//                             hash22(uvec2(floatBitsToUint(crnrs[3]))) * scTime);
//
//        // Shift gradients into [-1...0...1]
//        dirs *= 2.0f;
//        dirs -= mat4x2(vec2(1.0f), vec2(1.0f),
//                       vec2(1.0f), vec2(1.0f));
//
//        // Normalize
//        dirs[0] = normalize(dirs[0]);
//        dirs[1] = normalize(dirs[1]);
//        dirs[2] = normalize(dirs[2]);
//        dirs[3] = normalize(dirs[3]);
//
//        // Find per-cell pixel offset
//        vec2 offs = mod(uv, 1.0f);
//
//        // Compute gradient weights for each corner; take each offset relative
//        // to corners on the square in-line
//        vec4 values = vec4(dot(dirs[0], (offs - vec2(0.0f, 1.0f))),
//                           dot(dirs[1], (offs - vec2(1.0f))),
//                           dot(dirs[2], (offs - vec2(0.0f))),
//                           dot(dirs[3], (offs - vec2(1.0f, 0.0f))));
//
//        // Return smoothly interpolated values
//        vec2 softXY = soften(offs);
//        return 5. * mix(mix(values.z,
//                       values.w, softXY.x),
//                   mix(values.x,
//                       values.y, softXY.x),
//                   softXY.y);
//}

// https://github.com/hughsk/glsl-hsv2rgb/blob/master/index.glsl
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

out vec4 fragColor;

void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 position = gl_FragCoord.xy/u_res.xy;
    position.x *= u_res.x / u_res.y;
    
    // Grain

    float strength = 16.0;
        
    float x = (position.x + 4.0 ) * (position.y + 4.0 ) * (u_time * 10.0);
    vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * strength;
    
    vec3 dist = vec3(0.0);
    for (int i = 0 ; i < BALLS ; i++) {
        vec2 bpos = vec2(perlinNoise(vec2(float(i*3218) + cos(u_time*0.1), u_time*0.1)), perlinNoise(vec2(float(i*1357) + sin(u_time*0.1), -u_time*0.1))) / 5.0;
        bpos += vec2(0.5 * u_res.x/u_res.y,0.5);
        dist += hsv2rgb(vec3(float(i) / float(BALLS), 1.0, 1.0)) * 1.0 / (pow(position.x - bpos.x, 2.0) + pow(position.y - bpos.y, 2.0));
//        dist += hsv2rgb(vec3(float(i) / float(BALLS), 1.0, 1.0));
    }
    
//    fragColor = vec4(dist/(sin(u_time) * 500. + 500.), 1.0);
    fragColor = vec4(dist/30., 1.0) + grain*.4;
}
