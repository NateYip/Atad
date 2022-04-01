const setupWebGL = function (canvas) {
  var context = create3DContext(canvas);
  return context;
};
/**
   * Creates a webgl3D context.
   */
const create3DContext = function (canvas) {
  const names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  let context = null;
  for (let j = 0; j < names.length; ++j) {
    try {
      context = canvas.getContext(names[j], null);
    } catch (e) { }
    if (context) {
      break;
    }
  }
  return context;
}

const WebGLUtils = {
  setupWebGL:setupWebGL,
  create3DContext:create3DContext
}

export default WebGLUtils;