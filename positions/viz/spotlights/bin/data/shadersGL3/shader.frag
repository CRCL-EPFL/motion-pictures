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

const int OVERLAP = 660;
const float GAMMA = 1.8;

// conversion function
#define rgbConv(r, g, b) vec3(r / 255.0, g / 255.0, b / 255.0)

#define TAU 6.283185
#define PI 3.14159265
#define GOLD  0.618033988749895
#define S(a,b,t) smoothstep(a,b,t)
// define 0 to 1 sin fx
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
//vec3 color = rgbConv(0.0, 0.0, 0.0);
vec3 color = vec3(0.4 ,0.27, 0.87);

float map(float value, float min1, float max1, float min2, float max2){
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
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
//    rgb = clamp(rgb*rgb*(3.0-2.0*rgb), 0., 1.);
    return v * mix(vec3(1.0), rgb, s);
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
//    float L1 = rad + (300. * blurLevel);
    
    // Fluctuating L1
    // Control width
    float L1 = rad + (FLUX * 3. + 1.) * 200. * blurLevel;
    
    // points on the same y coord have the same endpoints but different distances
    // Maybe try not smoothstep?
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
//    b = FLUX * b;
    
//    b = S(-100., FLUX * 200., lcoords.y) * b;
//    b = S((sin(time)/2.) * -200., (1. - FLUX) * 200., lcoords.y) * b;
//    b = S((sin(time)/2.) * -200., (1. - FLUX) * 200., lcoords.y) * b;
//    b = S((sin(time)/2.) * -200., 200., lcoords.y) * b;
    // Segmented
//    b = (1. - (S(-400., (sin(time)/2.) * -100., lcoords.y) - S((sin(time)/2.) * -100., 200., lcoords.y))) * b;
    // One side
//    b = (sign(lcoords.x) == -1.) ? (1. - (S(-300., (sin(time)/2.) * -200., lcoords.y) - S((sin(time)/2.) * -200., 200., lcoords.y))) * b : 0.;
//    b = S(100., 400., lcoords.y) * b;
//    float x = 0. * b;
    
    // Apply edge sharpening
    // Cap amount to slightly over 1 to prevent overflow from making halo turn white
    amount = demo ? ((amount + b > 1.0) ? 1.0 : amount + b) : amount;
    
//    return vec4(color, amount);
    return vec4(color*amount, 1.);
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
	return clamp(.5 * pow(2*x, 2), 0., 1.);
}

void main() {
    vec2 uv = gl_FragCoord.xy;

    vec3 colorBot;
    
    vec4 calculated[20];
    float sum;
    vec4 testUnmod[20];
    float sumUnmod;
    int numColors;
    bool meetsThresh = false;
    // tracks whether there are more than 1 color overlapping
    bool multi = false;

    float halfway = res.y/2.;
    
    // calculate location in overlap
    float mask = 1. - mapClamp(uv.y, halfway+OVERLAP, halfway, 0., 1.);
    // get mask values
    mask = blend(mask);
    
    // calculate location in overlap
    float maskBot = 1. - mapClamp(uv.y, halfway-OVERLAP, halfway, 0., 1.);
    // get mask values
    maskBot = blend(maskBot);
    
    for (int i = 0; i < num * 2; i+=2){
        // this could be a lot cleaner
        vec2 posRel = vec2(pos[i]/res.x, 1 - (pos[i+1]/res.y));
        vec2 center = res.xy * posRel;
//        float radius = 0.12 * res.y;
        
        float radius = 0.15 * res.y * 1. - disFrame[i];
//        float radius = 0.08 * res.y * (sin(time) + 2.);
        vec3 col = genColor(i, length(center - uv));
        vec4 cg = spotlight(uv, center, radius, col, 1., i, i>0);
        vec4 ch = halo(uv, vec2(center.x, center.y+1.5), radius, col);

        float offCenter = center.y - (OVERLAP/2.);
        vec3 colBot = genColor(i, length(offCenter - uv));
        vec4 cgBot = spotlight(uv, vec2(center.x, offCenter), radius, col, 1., i, i>0);
        vec4 chBot = halo(uv, vec2(center.x, offCenter + 1.5), radius, col);
        
        // Draw layered, works when not on GPU
        // PROBLEM SOMEWHERE WITH THE SPOTLIGHT
        color = mix( color, cg.rgb, cg.a*(1. - disFrame[i]) );
//        color = mix(color, ch.rgb, ch.a * .6 * (1. - disFrame[i]));
        colorBot = mix ( colorBot, cgBot.rgb, cgBot.a *(1. - disFrame[i]) );
        
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
    
    multi = (numColors > 1 && calculated[0].a > .15) ? true : false;
    
    // Refactor:
    // For each color
//    for (int i = 0; i < num * 2; i+=2){
//        vec2 posRel = vec2(pos[i]/res.x, 1 - (pos[i+1]/res.y));
//        vec2 center = res.xy * posRel;
//        
//        float radius = 0.12 * res.y * 1. - disFrame[i];
//        
//        vec3 col = genColor(i, length(center - uv));
//        
//        // Instead of multi, pass in a qualifier that is true when there are multiple colors and the current color alpha is less than something
////        vec4 cz = edge(uv, center, radius, col, 1., i, calculated, multi && calculated[i].a < .4);
////        vec4 cz = edge(uv, center, radius, col, 1., i, calculated, multi, i>0, calculated[0].a);
//        // Pass in priority at same index
//        vec4 cz = edge(uv, center, radius, col, 1., i, calculated, multi, priorities[i] == 1, calculated[0].a);
//        vec4 czBot = edge(uv, vec2(center.x, center.y - (OVERLAP/2.)), radius, col, 1., i, calculated, multi, priorities[i] == 1, calculated[0].a);
//        // Mix in new color, transparent if not multi
////        color = mix(color, cz.rgb, multi ? cz.a : 0);
//        // Make sure to link this to disFrame, but make it faster
//        color = mix(color, cz.rgb, cz.a *(1. - disFrame[i]));
//        colorBot = mix(colorBot, czBot.rgb, czBot.a *(1. - disFrame[i]));
//    }
    // Use weighted multicolor mix function
//    vec4 mixColor = multiMix(calculated, sum, multi);

    color = color*mask;
    colorBot = colorBot*maskBot;

    // Apply gamma  correction to top and bottom
//    vec3 corrected = vec3(pow(color.r, 1./GAMMA), pow(color.g, 1./GAMMA), pow(color.b, 1./GAMMA));
    vec3 corrected = pow(color, vec3(1.0/GAMMA));
    vec3 correctedBot = vec3(pow(colorBot.r, 1./GAMMA), pow(colorBot.g, 1./GAMMA), pow(colorBot.b, 1./GAMMA));

    // mix between masked texture and gamma corrected based on mask value
    color = mix(corrected, color, mask);
//    colorBot = mix(correctedBot, colorBot, maskBot);

    color = color + colorBot;
//    color = corrected + correctedBot;
    
    // APPLY GRAIN
    color = applyGrain(uv, color);
    
    fragColor = vec4( color, 1.0 );
//    fragColor = mixColor;
//    fragColor = vec4(mask+maskBot,mask+maskBot,mask+maskBot, 1.);
    
    // Just see the background
//    fragColor = vec4(genBack(uv), 1.);
}
