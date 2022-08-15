// vertex shader

#version 150

uniform mat4 modelViewProjectionMatrix;
in vec4 position;

uniform float mouseRange;
uniform vec2 mousePos;
uniform vec4 mouseColor;

void main(){
    vec4 pos = position;
    
    // Direction vector from mouse pos to vert pos
    vec2 dir = pos.xy - mousePos;
    
    // Distance between mouse position and vert pos
    float dist = distance(pos.xy, mousePos);
    
    if (dist > 0.0 && dist < mouseRange){
        float distNorm = dist / mouseRange;
        distNorm = 1.0 - distNorm;
        dir *= distNorm;
        pos.x += dir.x;
        pos.y += dir.y;
    }
    
    gl_Position = modelViewProjectionMatrix * pos;
}
