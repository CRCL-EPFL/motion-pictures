#version 150

uniform vec2 res;
uniform float time;
uniform float pos[10];
uniform float hues[10];
uniform int num;
uniform float moveFrame[10];
uniform float disFrame[10];
uniform float directions[10];
out vec4 fragColor;

uniform int overlap;
uniform int blendExp;
uniform float gamma;
uniform float a;

#define TAU 6.283185
#define PI 3.14159265
#define GOLD  0.618033988749895
#define S(a,b,t) smoothstep(a,b,t)
// 0 to 1 sin() wave
#define FLUX (sin(time)/2. + .5)

// NOISE
#define SPEED 1.2
#define INTENSITY 0.3
// What gray level noise should tend to.
#define MEAN 0.3
// Controls the contrast/variance of noise.
#define VARIANCE 1.

// NOISE FUNCTIONS
float gaussian(float z, float u, float o) {
    return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
}

vec3 soft_light(vec3 a, vec3 b, float w) {
    return mix(a, pow(a, pow(vec3(2.0), 2.0 * (vec3(0.5) - b))), w);
}

// Set static background color to draw over
vec3 color = vec3(0.);

float map(float value, float min1, float max1, float min2, float max2){
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec3 hsv2rgb(vec3 c, float dist)
{
    float h = c.x;
    h += GOLD;
    h = mod(h, 1.);

    float smoothdist = map(abs(dist), 0., 100., .3, .8);
    c.y = smoothdist * .6;

    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// TODO: Replace with matrix operation for more efficiency
vec2 rotate(vec2 pivot, vec2 uv, float angle){
//    angle = angle - (3*PI/2);
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

/**
 * Draw a spotlight originating at vec2 `pos` with radius `rad` and
 * color `color`.
 */

vec4 spotlight(vec2 uv, vec2 pos, float rad, vec3 color, float angle, int index) {
    vec2 lcoords = rotate(pos, uv, directions[index]);

    float clampMove = clamp(moveFrame[index], 0., 1.);

    // Shrink radius based on moveFrame
    rad = (rad * map(clampMove, 0., 1., .2, 1.));
    
    // Adjust blurLevel according to movement state
    // 0 results in a round circle
    // Set to + .49 to smooth 'bottom' edge
    float blurLevel = (lcoords.y/rad * 0.5 + 0.49) * clampMove;
    
    // Blur is only positive, greater as it gets farther from center in direction
    // When y distance > rad, blurLevel
    blurLevel = max(1.0-blurLevel, 0.0 );
    
    // Scale coordinate values in either direction
    float xScale = map(moveFrame[index], 0., 1., 1., 1.5);
    float yScale = map(moveFrame[index], 0., 1., 0., rad/2.);
    // Get length of vector (distance to center)
    float d = length(vec2(lcoords.x*xScale, lcoords.y + yScale));
    
    // Start
    // Highest value possible is radius, meaning core is solid colored
    // Can be large negative, results in alpha of 0 'below' the halo
    // NOTE: Revisit this, can distance be negative? How is the 'bottom' becoming transparent?
    float L0 = rad * (1.0 - blurLevel);
    // End
    float L1 = rad + (300. * blurLevel);
    
    // Fluctuating L1
    // Control width
//    float L1 = rad + (FLUX * 3. + 1.) * 200. * blurLevel;
    
    // Points on the same y coord have the same endpoints but different distances
    // Maybe try not smoothstep?
    float t = S(L0, L1, d);
//    float t = clamp(d-rad, 0.0, 1.0);
    float amount = 1.0 - t;
//    amount = (amount > .2) ? amount : 0.;
    
    // ADJUST STRENGTH
    // Raise amount to a power below 1. to make it stronger, raising all values below
    amount = pow(amount, .5);
    
    // Modifying the strength of the spotlight by scaling amount based on original value
    amount = amount + S(0., 1., amount);
    
    // Modifying amount to make a sharp edge
    // Not the same around core
    float denom = 2. * (2. - S(-rad, 0., lcoords.y));
    // The closer to L1 this threshold is, the thinner the edge
//    float halfPoint = (L1 - L0) / 1.5;
//    float halfPoint = L1/1.5;
    // Dynamic halfPoint, where positive values progress toward L0 having no impact
    // Remember lcoords.y is negative above the core center
    float halfPoint = (L1 - (L0 * S(rad, 0., lcoords.y))) / 1.5;
    // What if I made it larger toward the core? Would compensate for no metaball interaction possibly
//    float halfPoint = (L1 - L0) / (1.5 + (S(-rad, rad, lcoords.y) * .5 * FLUX) );
    
    // Using smoothstep() difference to make a bump for a softer edge
    float edgeAA = 4.9;
    float b = S(halfPoint, L1, d) - S(L1, L1 + edgeAA, d);
    
    // Apply edge sharpening
    // Cap amount to slightly over 1 to prevent overflow from making halo turn white
//    amount = demo ? ((amount + b > 1.0) ? 1.0 : amount + b) : amount;
    
//    return vec4(color, amount);
    return vec4(color*amount, 1.);
}

// circle outline
vec4 halo(vec2 uv, vec2 pos, float rad, vec3 color) {
    float d = length(pos - uv);
    
//    float t = S(rad*.8, rad*1.5, d);
    float t = S(0, rad/3., d);
    
//    float amount = 1.0-t;
    float amount = t;
    return vec4(color, amount);
}

vec3 applyGrain(vec2 uv, vec3 color) {
    float t = time * float(SPEED);
    float seed = dot(uv, vec2(12.9898, 78.233));
    float noise = fract(sin(seed) * 43758.5453 + t);
    noise = gaussian(noise, float(MEAN), float(VARIANCE) * float(VARIANCE));
    float w = float(INTENSITY);
    
    vec3 grain = vec3(noise) * (1.0 - color);
    
    // Different applications
//    color += grain * w;
//    color = screen(color.rgb, grain, w);
    color = soft_light(color, grain, w);
    
    return color;
}

float mapClamp(float value, float min1, float max1, float min2, float max2) {
	return clamp(min2 + (value - min1) * (max2 - min2) / (max1 - min1), min2, max2);
}

float blend(float x) {
	return clamp(a * pow(2*x, blendExp), 0., 1.);
}

void main() {
    vec2 uv = gl_FragCoord.xy;

    vec3 colorBot = vec3(0.);

    float halfway = res.y/2.;
    
    // Calculate location in overlap
    float mask = 1. - mapClamp(uv.y, halfway+overlap, halfway, 0., 1.);
    // Get mask values
    mask = blend(mask);
    
    // Bottom half
    float maskBot = 1. - mapClamp(uv.y, halfway-overlap, halfway, 0., 1.);
    maskBot = blend(maskBot);
    
    for (int i = 0; i < num * 2; i+=2){
        vec2 posRel = vec2(pos[i]/res.x, 1 - (pos[i+1]/res.y));
        vec2 center = res.xy * posRel;
        
        float radius = 0.3 * res.y;
//        float radius = 0.3 * res.y * (1. - disFrame[i]);
//        vec3 col = genColor(i, length(center - uv));
        vec3 col = hsv2rgb(vec3(hues[i], .7, .99), length(center - uv));
        vec4 cg = spotlight(uv, center, radius, col, 1., i);
        vec4 ch = halo(uv, vec2(center.x, center.y+1.5), radius, col);

        float offCenter = center.y - (overlap/2.);
//        vec3 colBot = genColor(i, length(offCenter - uv));
        vec3 colBot = hsv2rgb(vec3(hues[i], .7, .99), length(center - uv));
        vec4 cgBot = spotlight(uv, vec2(center.x, offCenter), radius, col, 1., i);
        vec4 chBot = halo(uv, vec2(center.x, offCenter + 1.5), radius, colBot);
        
        // Draw layered, works when not on GPU
//        color = mix(color, cg.rgb, cg.a*(1. - disFrame[i]));
//        color = color + cg.rgb;
//        color = color + ch.rgb;
        color = color + cg.rgb*(1.-disFrame[i]);

//        colorBot = mix(colorBot, cgBot.rgb, cgBot.a *(1. - disFrame[i]));
//        colorBot = colorBot + cgBot.rgb;
//        colorBot = colorBot + chBot.rgb;
        colorBot = colorBot + cgBot.rgb*(1.-disFrame[i]);
    }

    color = color*mask;
    colorBot = colorBot*maskBot;

    // Apply gamma correction to top and bottom
    vec3 corrected = pow(color, vec3(1.0/gamma));
    vec3 correctedBot = vec3(pow(colorBot.r, 1./gamma), pow(colorBot.g, 1./gamma), pow(colorBot.b, 1./gamma));

    // Mix between masked texture and gamma corrected based on mask value
    color = mix(corrected, color, mask);
    colorBot = mix(correctedBot, colorBot, maskBot);

    color = color + colorBot;
//    color = corrected + correctedBot;
    
    // APPLY GRAIN
//    color = applyGrain(uv, color);
    
    fragColor = vec4( color, 1.0 );
//    fragColor = vec4( vec3(uv.x/res.x, uv.y/res.y, .7), 1.0 );
//    fragColor = vec4(mask+maskBot,mask+maskBot,mask+maskBot, 1.);
    
    // Just see the background
//    fragColor = vec4(genBack(uv), 1.);
}
