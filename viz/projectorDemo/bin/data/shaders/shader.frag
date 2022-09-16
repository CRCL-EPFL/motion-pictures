#version 150

//precision highp float;
out vec4 outputColor;
uniform vec2 u_res;
uniform float u_time;

float random1f(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    uv = uv * 2.0 - 1.0;
    uv.y /= u_res.x / u_res.y;

    vec2 A=vec2(-.5,-.2);
    vec2 B=vec2(.5,-.2);
    vec2 C=vec2(0,.5);
    vec2 D=vec2(.5,-.8);
    vec2 E=vec2(.9,.79);
    
    float k1=.7;// size
    float k2=3.;// shape
    
    // warp domains
    vec2 uvA=uv*vec2(.6,.8);
    uvA.x+=sin(uv.y*5.+ u_time)*.1;
    vec2 uvB=uv*vec2(.2,.4);
    uvB.x+=sin(uv.y*4.+ u_time)*.1;
    vec2 uvC=uv*vec2(.6,.8);
    uvC.y+=sin(uv.x*4.+ u_time)*.1;
    vec2 uvD=uv*vec2(.2,.8);
    uvD.y+=sin(uv.x*4.+ u_time)*.1;
    vec2 uvE=uv*vec2(-1.1,.9);
    uvE.x+=sin(uv.y*4.+ u_time)*.1;
    
    // create shaped gradient
    float dA=max(0.,1.-pow(distance(uvA,A)/k1,k2));
    float dB=max(0.,1.-pow(distance(uvB,B)/k1,k2));
    float dC=max(0.,1.-pow(distance(uvC,C)/k1,k2));
    float dD=max(0.,1.-pow(distance(uvD,D)/k1,k2));
    float dE=max(0.,1.-pow(distance(uvE,E)/k1,k2));
    
     // smooth in, out
    dA=smoothstep(0.,1.,dA);
    dB=smoothstep(0.,1.,dB);
    dC=smoothstep(0.,1.,dC);
    dD=smoothstep(0.,1.,dD);
    dE=smoothstep(0.,1.,dE);
    
    // define colors
    
    vec3 blue=vec3(93.,134.,185.)/255.;
    vec3 pink=vec3(255.,122.,114.)/255.;
    vec3 green=vec3(44.,162.,148.)/255.;
    vec3 white=vec3(230.,230.,230.)/255.;
    vec3 orange=vec3(230.,155.,120.)/255.;
    
    vec3 vanta=vec3(-25,-25,-25)/255.;
    
    // lay in color blobs
    vec3 color=white;
    color=mix(color,blue,dA);
    color=mix(color,white,dC);
    color=mix(color,pink,dB);
    color=mix(color,green,dD);
    color=mix(color,orange,dE);
    
    // add noise
    color+=vec3(
        random1f(uv),
        random1f(uv+1.),
        random1f(uv+2.)
    )*.1;
    
    outputColor = vec4(color, 1.0);
}