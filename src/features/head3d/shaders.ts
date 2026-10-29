/**
 * Shaders des glyphes de la tête 3D.
 * - uBuild : hauteur de la « tête d'impression » (les points au-dessus sont masqués) ;
 * - uBurst : explosion radiale ;
 * - uMode 2 / uGo : chaque glyphe rejoint une cible à l'écran (aTg) pour construire du texte.
 */
export const VERTEX_SHADER = /* glsl */ `
attribute float aCh, aTi, aLu, aRn;
attribute vec2 aTg;
uniform float uMode, uGo, uT, uTS;
uniform vec4 uRect, uBox;
uniform float uScale, uSize, uBuild, uTex, uTime, uBurst;
varying float vK, vR2, vCh, vTi, vB, vF;
varying vec3 vN;

void main() {
  vec3 p = position;
  vR2 = aRn;
  vK = 0.;
  vF = 1. - clamp(abs(p.y - uBuild) / .08, 0., 1.);
  float hide = step(uBuild, p.y);
  p += normal * vF * .05 * sin(aRn * 40. + uTime * 9.);

  vec3 rd = normalize(vec3(sin(aRn * 91.7), cos(aRn * 57.3) * .6 + .25, sin(aRn * 23.1 + 1.)));
  float bk = uBurst * (.55 + aRn * .9);
  p += (normal * 1.1 + rd * 1.6) * bk * bk * 2.2 + vec3(0., -bk * .3, 0.);
  float sa = bk * 2.4 * (aRn - .5);
  p.xz = mat2(cos(sa), -sin(sa), sin(sa), cos(sa)) * p.xz;

  vec4 mv = modelViewMatrix * vec4(p, 1.);
  if (uMode > .5) {
    vec2 sp = uRect.xy + aTg * uRect.zw;
    float asp = uBox.z / uBox.w;
    vec3 tv = vec3(((sp.x - uBox.x) / uBox.z * 2. - 1.) * 4.6 * uT * asp, (1. - (sp.y - uBox.y) / uBox.w * 2.) * 4.6 * uT, -4.6);
    float c2 = step(1.5, uMode);
    float dl = mix(aRn * .4, .1 + aTg.y * .6 + aRn * .06, c2);
    float kk = smoothstep(dl, dl + mix(.6, .22, c2), uGo);
    mv.xyz = mix(mv.xyz, tv, kk) + vec3(sin(aRn * 50.) * .5, .3, 1.6) * sin(kk * 3.14159);
    vK = kk;
  }
  gl_Position = projectionMatrix * mv;

  vec3 n = normalize(normalMatrix * normal);
  vN = n;
  float sh = clamp(dot(n, normalize(vec3(-.35, .45, 1.))), 0., 1.);
  float tl = mix(.6, .35 + .65 * aLu, uTex);
  vB = (.12 + .88 * sh) * tl;
  vCh = aCh;
  vTi = aTi;
  gl_PointSize = hide > .5 ? 0. : uSize * uScale / -mv.z * (1. + vF * .6);
  gl_PointSize = mix(gl_PointSize, uTS, vK);
  if (uMode > 1.5 && vK > .985 && aTg.y < (uGo - .36) / .6) gl_PointSize = 0.;
}`;

export const FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uAtlas;
uniform float uFade;
uniform vec3 uBase, uMint, uPink, uDim;
varying float vK, vR2, vCh, vTi, vB, vF;
varying vec3 vN;

void main() {
  vec2 c = vec2(mod(vCh, 16.), floor(vCh / 16.));
  vec2 q = gl_PointCoord;
  vec2 uv = vec2((c.x + q.x) / 16., 1. - (c.y + q.y) / 8.);
  float a = texture2D(uAtlas, uv).a;
  if (a < .45) discard;
  if (vN.z < -.05 && vF < .5 && vK < .25) discard;
  if (vR2 > uFade) discard;
  vec3 col = mix(uDim, uBase, smoothstep(.05, .85, vB));
  if (vTi > .5 && vTi < 1.5 && vB > .35) col = uMint;
  if (vTi > 1.5 && vB > .35) col = uPink;
  col = mix(col, uMint, vF);
  col = mix(col, uMint, smoothstep(.6, 1., vK));
  gl_FragColor = vec4(col, 1.);
}`;
