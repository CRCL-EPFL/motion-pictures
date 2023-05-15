#version 150

uniform sampler2DRect tex0;
uniform int overlap;
uniform int blendExp;
uniform float gamma;
uniform vec2 u_res;

in vec2 texCoordVarying;
out vec4 outputColor;

float map(float value, float min1, float max1, float min2, float max2) {
	return clamp(min2 + (value - min1) * (max2 - min2) / (max1 - min1), min2, max2);
}

float blend(float x) {
	return clamp(.5 * pow(2*x, blendExp), 0., 1.);
}

void main() {
	vec2 pos = gl_FragCoord.xy/u_res.xy;

	float col = map(gl_FragCoord.y, u_res.y, u_res.y-overlap, 0., 1.);
	col = blend(col);

	// load in texture
	vec4 texel0 = texture(tex0, texCoordVarying);

	vec3 color = texel0.rgb * col;

	// gamma correction
	color = vec3(pow(color.r, 1./gamma), pow(color.g, 1./gamma), pow(color.b, 1./gamma));

	outputColor = vec4(color, 1.);
}