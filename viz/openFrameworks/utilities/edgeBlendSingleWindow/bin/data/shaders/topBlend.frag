#version 150

uniform sampler2DRect tex0;
uniform int overlap;
uniform int blendExp;
uniform float gamma;
uniform vec2 u_res;
uniform float a;

in vec2 texCoordVarying;
out vec4 outputColor;

float map(float value, float min1, float max1, float min2, float max2) {
	return clamp(min2 + (value - min1) * (max2 - min2) / (max1 - min1), min2, max2);
}

float blend(float x) {
	return clamp(a * pow(2*x, blendExp), 0., 1.);
}

void main() {
	vec2 pos = gl_FragCoord.xy/u_res.xy;

	// calculate location in overlap
	float mask = map(gl_FragCoord.y, u_res.y, u_res.y-overlap, 0., 1.);
	// get mask values
	mask = blend(mask);

	// load in texture
//	vec4 texel0 = texture(tex0, texCoordVarying);
//	vec4 texel0 = vec4(1., 0., 0., 1.);
//	vec4 texel0 = vec4(.0, .0, .0, 1.);
	vec4 texel0 = vec4(.3, .3, .3, 1.);

	// make vec3 to store masked texture
	vec3 base = texel0.rgb * mask;
	// vec3 to store gamma corrected mask
	vec3 correct = vec3(pow(base.r, 1./gamma), pow(base.g, 1./gamma), pow(base.b, 1./gamma));

	// mix between masked texture and gamma corrected based on mask value
	vec3 color = mix(correct, base, mask);

	outputColor = vec4(color, 1.);
}