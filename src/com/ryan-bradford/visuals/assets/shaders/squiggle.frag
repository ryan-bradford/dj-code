#define rotation(angle) mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;

float PI = 3.14159256;
float TAU = 2.0*3.14159256;

void main(){
    vec2 uv = ( gl_FragCoord.xy - 1.0* iResolution.xy ) /iResolution.y;
    uv *= rotation(PI/3.);
    vec3 col = vec3(0);
    float a = (PI/1.7)*pow((1.3-length(uv)),6.0);
    uv *= rotation(a);

    float curve = 0.1*sin((20.0 * uv.y) + 2.0*iTime);
    for(float i=-.5; i<.5; i+=0.1)
        col += .15*vec3(pow(10.0,-abs(uv.x-curve+i*.1)*5.0));
    gl_FragColor = vec4(col, 1.0);
}
