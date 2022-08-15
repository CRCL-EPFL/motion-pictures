// fragment shader

#version 150

#define rgb(r, g, b) vec3(r / 255.0, g / 255.0, b / 255.0)

#define TAU 6.283185

uniform vec2 res;
uniform vec2 mouse;

vec3 c1 = rgb(8.0, 63.0, 180.0);
vec3 c2 = rgb(255.0, 104.0, 90.0);

/**
 * Draw a circle at vec2 `pos` with radius `rad` and
 * color `color`.
 */
vec4 circle(vec2 uv, vec2 pos, float rad, vec3 color) {
    vec2 lcoords = pos - uv;
    
    float blurLevel = lcoords.y/rad * 0.5 + 0.5;
    blurLevel = max(1.0-blurLevel, 0.0 );
    
    float d = length(lcoords);
    
    float L0 = rad * (1.0-blurLevel);
    float L1 = rad + (mouse.y+150.0)*3.0*blurLevel;
    
    float t = smoothstep(L0, L1, d);
    
    //float t = clamp(d-rad, 0.0, 1.0);
    float amount = 1.0-t;
    
    return vec4(color, amount);
}


vec4 halo(vec2 uv, vec2 pos, float rad, vec3 color) {
    float d = length(pos - uv);
    float t = smoothstep(rad*.8,rad*1.5, d);
    float amount = 1.0-t;
    return vec4(color, amount);
}

out vec4 outputColor;

void main() {

    vec2 uv = gl_FragCoord.xy;
    vec2 center = res.xy * vec2(0.5, 0.4);
    float radius = 0.20 * res.y;

    vec4 cg = circle(uv, center, radius, c2);
    vec4 ch = halo(uv, center, radius, c2);
    
    vec3 color = c1;
    
    color = mix( color, cg.rgb, cg.a );
    color = mix( color, ch.rgb, ch.a*0.3 );
      
    
    // Blend the two
    outputColor = vec4( color, 1.0);

}
