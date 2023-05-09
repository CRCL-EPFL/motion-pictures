#version 330

uniform vec2 u_res;
uniform bool u_mode;

out vec4 fragColor;

vec2 tile(vec2 _st, float _zoom){
    // Multiply by zoom factor and return the remainder, making the coordinate repeat 
    _st.x *= 8.*_zoom;
    _st.y *= 5.*_zoom;
    return fract(_st);
}

float box(vec2 _st, vec2 _size){
    // Calculate the size of edges for each box
    _size = vec2(0.5) - _size*0.5;
    //vec2 uv = smoothstep(_size, _size+vec2(1e-4), _st);
    //uv *= smoothstep(_size, _size+vec2(1e-4), vec2(1.)-_st);

    vec2 uv = step(vec2(2.), gl_FragCoord.xy);
    uv = step(vec2(.01), _st);
    uv *= step(.01, vec2(1.)-_st);

    return uv.x*uv.y;
}

void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 position = gl_FragCoord.xy/u_res.xy;

    vec3 color = vec3(0.0);

    // Pass coordinate to tile function
    position = tile(position, 2.);

    // Invert colors
    color = vec3(1. - box(position, vec2(.95)));

    fragColor = vec4(color, 1.0);
}
