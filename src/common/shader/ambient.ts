var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +       // Normal
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform vec3 u_DiffuseLight;\n' +   // Diffuse light color
  'uniform vec3 u_LightDirection;\n' + // Diffuse light direction (in the world coordinate, normalized)
  'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Make the length of the normal 1.0
  '  vec3 normal = normalize(a_Normal.xyz);\n' +
     // The dot product of the light direction and the normal (the orientation of a surface)
  '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
     // Calculate the color due to diffuse reflection
  '  vec3 diffuse = u_DiffuseLight * a_Color.rgb * nDotL;\n' +
     // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
     // Add the surface colors due to diffuse reflection and ambient reflection
  '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

const ambientLight = {
  vShader: VSHADER_SOURCE,
  fShader: FSHADER_SOURCE
}

export default ambientLight;