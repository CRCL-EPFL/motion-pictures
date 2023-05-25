#version 150

uniform vec2 res;
uniform float time;
uniform float pos[10];
uniform float hues[10];
uniform int num;
uniform float moveFrame[10];
uniform float disFrame[10];
uniform float directions[10];
uniform int priorities[10];
// layout: [x, y, state, opacity, direction, color]
// uniform float data[60];

out vec4 fragColor;

// conversion function
#define rgb(r, g, b) vec3(r / 255.0, g / 255.0, b / 255.0)

#define TAU 6.283185
#define PI 3.14159265
#define GOLD  0.618033988749895
#define S(a,b,t) smoothstep(a,b,t)
// define 0 to 1 sin fx
#define FLUX (sin(time)/2. + .5)

// NOISE

#define SPEED 1.2
#define INTENSITY 0.4
// What gray level noise should tend to.
#define MEAN 0.0
// Controls the contrast/variance of noise.
#define VARIANCE 0.9

// NOISE FUNCTIONS

vec3 channel_mix(vec3 a, vec3 b, vec3 w) {
    return vec3(mix(a.r, b.r, w.r), mix(a.g, b.g, w.g), mix(a.b, b.b, w.b));
}

float gaussian(float z, float u, float o) {
    return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
}

vec3 madd(vec3 a, vec3 b, float w) {
    return a + a * b * w;
}

vec3 screen(vec3 a, vec3 b, float w) {
    return mix(a, vec3(1.0) - (vec3(1.0) - a) * (vec3(1.0) - b), w);
}

vec3 soft_light(vec3 a, vec3 b, float w) {
    return mix(a, pow(a, pow(vec3(2.0), 2.0 * (vec3(0.5) - b))), w);
}

// Set static background color to draw over
vec3 color = rgb(0.0, 0.0, 0.0);

// Helper for the background flow gradient

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

float map(float value, float min1, float max1, float min2, float max2){
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float meta(float d1, float d2){
    float k = 1.5;
    return -log(exp(-k * d1) + exp(-k * d2)) / k;
}

vec3 genColor( int i, float dist ){
    float h = hues[i];
    h += GOLD;
    h = mod(h, 1.);
    
    // Use dist to decrease saturation the closer to center it is
    float smoothDist = map(abs(dist), 0., 100., .2, 1.);
//    float s = .6;
    float s = smoothDist * .6;
    float v = .99;
    vec3 rgb = clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return v * mix(vec3(1.0), rgb, s);
}

// Signed distance for rounded box
float sdRoundBox( vec2 p, vec2 b, float r )
{
    vec2 q = abs(p)-b+r;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r;
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

// TODO: Replace with matrix operation for more efficiency
vec2 rotate(vec2 pivot, vec2 uv, float angle){
    angle = angle - (PI/2);
    
    float s = sin(angle);
    float c = cos(angle);
    
    // subtract x and y of pos from the pixel coordinates to get origin
    uv[0] -= pivot[0];
    uv[1] -= pivot[1];
    
    // rotate
    float xnew = uv[0] * c - uv[1] * s;
    float ynew = uv[0] * s + uv[1] * c;
    
    // add them back
    uv[0] = xnew + pivot[0];
    uv[1] = ynew + pivot[1];
    
    return uv - pivot;
}

vec4 multiMix(vec4[20] colors, float sum, bool multi){
    // calc weights
    vec3 outColor = color;
    
    float outOpacity = 1.;
    // basically by itself
    if (sum < 1.){
        outOpacity = sum;
    }
    
    for (int i = 0; i < num * 2; i+=2){
        // if there are multiple colors overlapping here
//        float weight = colorsUn[i].a / sumUn;
//        if (multi){
//           weight = colors[i].a / sum;
//        }
//        float thresh = (step > .7) ?
        float weight = colors[i].a / sum;
        // If there are multiple colors, only show this color if it's above threshold
        weight = multi ? (step(.8, colors[i].a) * colors[i].a) : colors[i].a;
        outColor.r += colors[i].r * weight;
//        outColor.g = .0;
//        outColor.b = .0;
        outColor.g += colors[i].g * weight;
        outColor.b += colors[i].b * weight;
    }
    
    return vec4(outColor, outOpacity);
}

/**
 * Draw a circle at vec2 `pos` with radius `rad` and
 * color `color`.
 */

vec4 spotlight(vec2 uv, vec2 pos, float rad, vec3 color, float angle, int index, bool demo) {
//    vec2 lcoords = rotate(pos, uv, data[index+4]);
    vec2 lcoords = rotate(pos, uv, directions[index]);
    
    // test with width factor
//    float blurLevel = (lcoords.y/rad * 0.5 + 0.5) * ((lcoords.x*wFactor)/lcoords.x);
    
    // Adjust blurLevel according to movement state
    // 0 results in a round circle
//    float blurLevel = (lcoords.y/rad * 0.5 + 0.5) * data[index+2];
    // Set to + .49 to smooth 'bottom' edge
    float blurLevel = (lcoords.y/rad * 0.5 + 0.49) * moveFrame[index];
    
    // blur is only positive, greater as it gets farther from center in direction
    // when y distance > rad, blurLevel
    blurLevel = max(1.0-blurLevel, 0.0 );
    
    // get length of vector (distance to center)
    float d = length(lcoords);
    
    // Start
    // Highest value possible is radius, meaning core is solid colored
    // Can be large negative, results in alpha of 0 'below' the halo
    // NOTE: Actually need to revisit this, can distance be negative? How is the 'bottom' becoming transparent?
    float L0 = rad * (1.0-blurLevel);
    // End
    float L1 = rad + (300. * blurLevel);
    
    // Fluctuating L1
    // Control width
//    float L1 = rad + (FLUX * 3. + 1.) * 200. * blurLevel;
    
    // points on the same y coord have the same endpoints but different distances
    float t = S(L0, L1, d);
//    float t = clamp(d-rad, 0.0, 1.0);
    float amount = 1.0 - t;
//    amount = 0.;
//    amount = step(amount, .8);
//    amount = (amount > .2) ? amount : 0.;
    
    // ADJUST STRENGTH
    // Raise amount to a power below 1. to make it stronger, raising all values below
//    amount = pow(amount, .8 + (FLUX));
   amount = pow(amount, .2);
//    amount = pow(amount, .85 + FLUX);
//    amount = pow(amount, .5 * (FLUX));
//    amount = pow(amount, .5 + FLUX / 2.);
//    amount = pow(amount, .5 + FLUX);
    
    // Modifying the strength of the spotlight by scaling amount based on original value
//    amount = amount + S(0., 1., amount);
    
    // Modifying amount to make a sharp edge
    // Not the same around core
    float denom = 2. * (2. - S(-rad, 0., lcoords.y));
    // The closer to L1 this threshold is, the thinner the edge
    float halfPoint = (L1 - L0) / 1.5;
//    float halfPoint = L1/1.5;
    // Dynamic halfPoint, where positive values progress toward L0 having no impact
    // Remember lcoords.y is negative above the core center
//    float halfPoint = (L1 - (L0 * S(rad, 0., lcoords.y))) / 1.5;
    // What if I made it larger toward the core? Would compensate for no metaball interaction possibly
//    float halfPoint = (L1 - L0) / (1.5 + (S(-rad, rad, lcoords.y) * .5 * FLUX) );
    
    // Using smoothstep() difference to make a bump for a softer edge
    float edgeAA = 4.9;
    float b = S(halfPoint, L1, d) - S(L1, L1 + edgeAA, d);
//    b = FLUX * b;
    
//    b = S(-100., FLUX * 200., lcoords.y) * b;
//    b = S((sin(time)/2.) * -200., (1. - FLUX) * 200., lcoords.y) * b;
//    b = S((sin(time)/2.) * -200., (1. - FLUX) * 200., lcoords.y) * b;
//    b = S((sin(time)/2.) * -200., 200., lcoords.y) * b;
    // Segmented
//    b = (1. - (S(-400., (sin(time)/2.) * -100., lcoords.y) - S((sin(time)/2.) * -100., 200., lcoords.y))) * b;
    // One side
    b = (sign(lcoords.x) == -1.) ? (1. - (S(-300., (sin(time)/2.) * -200., lcoords.y) - S((sin(time)/2.) * -200., 200., lcoords.y))) * b : 0.;
//    b = S(100., 400., lcoords.y) * b;
//    float x = 0. * b;
    
    // Apply edge sharpening
    // Cap amount to slightly over 1 to prevent overflow from making halo turn white
//    amount = demo ? ((amount + b > 1.0) ? 1.0 : amount + b) : amount;
    
    // Try metaball implementation
    float newD = meta(amount, b);
//    amount = newD;
    
    return vec4(color, amount);
}

vec4 edge(vec2 uv, vec2 pos, float rad, vec3 color, float angle, int index, vec4[20] calculated, bool multi, bool enable, float overlap) {
    vec2 lcoords = rotate(pos, uv, directions[index]);
    
    float blurLevel = (lcoords.y/rad * 0.5 + 0.49) * moveFrame[index];
    
    blurLevel = max(1.0-blurLevel, 0.0 );
    
    float d = length(lcoords);
    
    float L0 = rad * (1.0-blurLevel);
    // End
    float L1 = rad + (300. * blurLevel);
    float t = S(L0, L1, d);
    // float amount = 1.0 - t;
    float amount = 0.;
    
    float halfPoint = (L1 - L0) / 1.5;
    
    float edgeAA = 3.;
//    float b = S(halfPoint, L1, d) - S(L1, L1 + edgeAA, d);
   // Try scaling the overlap sharp edge so that it fades off at the ends
    float b = (S(halfPoint, L1 - edgeAA, d) - S(L1 - edgeAA, L1, d)) * pow(S(.15, 1., overlap), .5);
    
    if (multi && enable){
        amount = (amount + b > 1.0) ? 1.0 : amount + b;
    }
//    amount = (amount + b > 1.0) ? 1.0 : amount + b;
    
    return vec4(color, amount);
}

// circle outline
vec4 halo(vec2 uv, vec2 pos, float rad, vec3 color) {
    float d = length(pos - uv);
    
    float t = S(rad*.8, rad*1.5, d);
//    float t = smoothstep(rad*.8,rad*1.5, de);
    float amount = 1.0-t;
    return vec4(color, amount);
}

// Function to generate the flowing background colors
vec3 genBack(vec2 uv) {
    float ratio = res.x / res.y;

    vec2 tuv = uv/res.xy;
    tuv -= .5;

    // rotate with noise
    float degree = noise(vec2(time*.1, tuv.x*tuv.y));

    tuv.y *= 1./ratio;
    tuv *= Rot(radians((degree-.5)*720.+180.));
    tuv.y *= ratio;
    
    // Wave warp with sin
    float frequency = 5.;
    float amplitude = 30.;
    float speed = time * 1.3;
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

vec3 applyGrain(vec2 uv, vec3 color) {
    float t = time * float(SPEED);
    float seed = dot(uv, vec2(12.9898, 78.233));
    float noise = fract(sin(seed) * 43758.5453 + t);
    noise = gaussian(noise, float(MEAN), float(VARIANCE) * float(VARIANCE));
    float w = float(INTENSITY);
    
    vec3 grain = vec3(noise) * (1.0 - color.rgb);
    
    // Different applications
//    color += grain * w;
//    color = screen(color.rgb, grain, w);
    color = soft_light(color, grain, w);
    
    return color;
}

// Function to round corners of window
vec3 roundCorners(vec3 color) {
    vec2 p = (2.0*gl_FragCoord.xy-res.xy)/res.y;
    // Aspect ratio
    vec2 si = vec2(1.778,1.);
    // Radius
    float ra = .025;

    float d = sdRoundBox( p, si, ra );
    
    color = vec3(0.0) - sign(d) * vec3(color);
    
    return color;
}

void main() {
    vec2 uv = gl_FragCoord.xy;
    
    vec4 calculated[20];
    float sum;
    vec4 testUnmod[20];
    float sumUnmod;
    int numColors;
    bool meetsThresh = false;
    // tracks whether there are more than 1 color overlapping
    bool multi = false;
    
//    for (int i = 0; i < num * 6; i+=6){
    for (int i = 0; i < num * 2; i+=2){
        // this could be a lot cleaner
//        vec2 posRel = vec2(data[i]/res.x, 1 - (data[i+1]/res.y));
        vec2 posRel = vec2(pos[i]/res.x, 1 - (pos[i+1]/res.y));
        vec2 center = res.xy * posRel;
//        float radius = 0.12 * res.y;
        
//        float radius = 0.12 * res.y * 1. - data[i+3];
        float radius = 0.15 * res.y * 1. - disFrame[i];
//        float radius = 0.08 * res.y * (sin(time) + 2.);
//        vec3 col = genColor(data[i+5], length(center - uv));
        vec3 col = genColor(i, length(center - uv));
        vec4 cg = spotlight(uv, center, radius, col, 1., i, i>0);

//        vec4 ch = halo(uv, center, radius, c2);
        vec4 ch = halo(uv, vec2(center.x, center.y+1.5), radius, col);
        
        // Draw layered, works when not on GPU
        color = mix( color, cg.rgb, cg.a*(1. - disFrame[i]) );
//        color = mix(color, ch.rgb, ch.a * .6 * (1. - disFrame[i]));
        
        calculated[i] = cg;
        sum += cg.a;
        // if color w greater than 1 opacity
        if (cg.a > 0) {
            // count it
            numColors++;
            if (cg.a >= .7){
                meetsThresh = true;
            }
        }
    }
    
    // if more than one color and one of the colors is above threshold
//    if (numColors > 1 && meetsThresh){
//        multi = true;
//    }
    
    multi = (numColors > 1 && calculated[0].a > .15) ? true : false;
    
    // There is a much better way to do this but quickly getting it working:
    // For each color
    for (int i = 0; i < num * 2; i+=2){
        vec2 posRel = vec2(pos[i]/res.x, 1 - (pos[i+1]/res.y));
        vec2 center = res.xy * posRel;
        
        float radius = 0.12 * res.y * 1. - disFrame[i];
        
        vec3 col = genColor(i, length(center - uv));
        
        // Instead of multi, pass in a qualifier that is true when there are multiple colors and the current color alpha is less than something
//        vec4 cz = edge(uv, center, radius, col, 1., i, calculated, multi && calculated[i].a < .4);
//        vec4 cz = edge(uv, center, radius, col, 1., i, calculated, multi, i>0, calculated[0].a);
        // Pass in priority at same index
        vec4 cz = edge(uv, center, radius, col, 1., i, calculated, multi, priorities[i] == 1, calculated[0].a);
        // Mix in new color, transparent if not multi
//        color = mix(color, cz.rgb, multi ? cz.a : 0);
        // don't forget to link this to disFrame, but make it faster
        color = mix(color, cz.rgb, cz.a *(1. - disFrame[i]));
    }
    // Use weighted multicolor mix function
//    vec4 mixColor = multiMix(calculated, sum, multi);
    
    // APPLY GRAIN
    color = applyGrain(uv, color);
    
    // ROUND CORNERS
    color = roundCorners(color);
    
    fragColor = vec4( color, 1.0 );
//    fragColor = mixColor;
    
    // Just see the background
//    fragColor = vec4(genBack(uv), 1.);
}
