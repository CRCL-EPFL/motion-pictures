float roundLookingBlob(vec2 fragCoord, vec2 tPos, float r) {
    vec2 pos = fragCoord.xy/iResolution.yy - vec2(0.5);
    pos.x -= ((iResolution.x-iResolution.y)/iResolution.y)/2.0;
    return pow(max(1.0-length(pos-tPos), 0.0) , r);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	float v = roundLookingBlob(fragCoord,vec2(sin(iTime)*0.4, cos(iTime)*0.4), 7.0);
    v += roundLookingBlob(fragCoord,vec2(sin(iTime*0.6)*0.2, cos(iTime)*0.3), 6.0);
    v += roundLookingBlob(fragCoord,vec2(cos(iTime*0.8)*0.7, sin(iTime*1.1)*0.4), 5.0);
    //v += roundLookingBlob(fragCoord,vec2(cos(iTime*0.2)*0.2, sin(iTime*0.9)*0.5), 8.0);
    v += roundLookingBlob(fragCoord,vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y), 8.0);
    v = clamp((v-0.5)*1000.0, 0.0, 1.0);
	fragColor = vec4(v, v, v, 1.0);
}