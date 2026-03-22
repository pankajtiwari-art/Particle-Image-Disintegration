// Importing directly using ES Modules. No more "undefined" error.
import { Renderer, Geometry, Program, Mesh, Vec2, Vec3, Texture, GPGPU } from 'https://esm.sh/ogl';

let renderer, gl;
let time, mouse, ratio;
let points, positionB, dataB, program;
let texture;

// Configuration state
let config = {
  imageUrl: 'https://klevron.github.io/codepen/misc/myrtilles.jpg',
  particleSize: 8.0,
  showBackground: true
};

// --- UI Logic ---
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
const settingsPanel = document.getElementById('settings-panel');
const presetSelect = document.getElementById('preset-images');
const imgUrlInput = document.getElementById('img-url');
const btnLoadImg = document.getElementById('btn-load-img');
const sizeSlider = document.getElementById('particle-size');
const btnToggleBg = document.getElementById('btn-toggle-bg');

menuToggle.onclick = () => settingsPanel.classList.add('open');
menuClose.onclick = () => settingsPanel.classList.remove('open');

// Load from preset dropdown
presetSelect.onchange = (e) => {
  config.imageUrl = e.target.value;
  imgUrlInput.value = ""; // clear custom input
  loadNewImage(config.imageUrl);
};

// Load custom URL
btnLoadImg.onclick = () => {
  if(imgUrlInput.value.trim() !== "") {
    config.imageUrl = imgUrlInput.value.trim();
    presetSelect.value = ""; // Reset dropdown
    loadNewImage(config.imageUrl);
  }
};

sizeSlider.oninput = (e) => {
  config.particleSize = parseFloat(e.target.value);
  if(program) {
    program.uniforms.uSizeMult.value = config.particleSize;
  }
};

btnToggleBg.onclick = () => {
  config.showBackground = !config.showBackground;
  updateBackground();
};

function updateBackground() {
  if(config.showBackground) {
    document.body.style.background = `url("${config.imageUrl}") no-repeat center center`;
    document.body.style.backgroundSize = 'cover';
    btnToggleBg.classList.add('active');
    btnToggleBg.innerText = "Hide Background";
  } else {
    document.body.style.background = 'none';
    btnToggleBg.classList.remove('active');
    btnToggleBg.innerText = "Show Background";
  }
}

// --- WebGL Core Logic ---
function init() {
  renderer = new Renderer({ dpr: 2, alpha: true, depth: false, autoClear: true, preserveDrawingBuffer: false });
  gl = renderer.gl;
  document.body.appendChild(gl.canvas);

  time = { value: 0 };
  mouse = { value: new Vec2() };
  ratio = { value: new Vec2() };

  texture = new Texture(gl);
  
  loadNewImage(config.imageUrl);
}

function loadNewImage(src) {
  const img = new Image();
  img.crossOrigin = 'anonymous'; // Crucial for external URLs
  img.onload = () => { 
    texture.image = img; 
    updateBackground();
    if(!points) initAfterLoad(); 
    else resize(); 
  };
  img.src = src;
}

function initAfterLoad() {
  resize();
  window.addEventListener('resize', resize, false);
  
  initScene();
  initListeners();
  requestAnimationFrame(animate);
}

function resize() {
  if(!texture.image) return;
  const tR = texture.image.width / texture.image.height;
  const w = window.innerWidth, h = window.innerHeight, r = w / h;
  if (r > tR) ratio.value.set(1, h / w * tR);
  else ratio.value.set(w / h / tR, 1);
  renderer.setSize(w, h);
}

function initScene() {
  const numParticles = 256 * 256;
  const positions = new Float32Array(numParticles * 4);
  const data = new Float32Array(numParticles * 4);
  const random = new Float32Array(numParticles * 4);
  const v = new Vec3();
  
  for (let i = 0; i < numParticles; i++) {
    v.set(rnd(-1, 1), rnd(-1, 1), 0);
    positions.set([v.x, v.y, v.z, 1], i * 4);
    data.set([2, 0, 0, 1], i * 4);
    random.set([rnd(0.1, 1), rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)], i * 4);
  }

  positionB = new GPGPU(gl, { data: positions });
  dataB = new GPGPU(gl, { data: data });
  
  dataB.addPass({
    uniforms: {
      uTime: time,
      uMouse: mouse,
      tPosition: positionB.uniform
    },
    fragment: `
      precision highp float;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform sampler2D tMap;
      uniform sampler2D tPosition;
      varying vec2 vUv;
      void main() {
        vec4 position = texture2D(tPosition, vUv);
        vec4 data = texture2D(tMap, vUv);
        float toMouse = length(position.xy - uMouse);
        if (toMouse < .2) {
          data.x += abs(.2 - toMouse);
          data.x = min(data.x, 3.0);
        }
        data.x *= 0.997; 
        gl_FragColor = data;
      }
    `
  });

  const geometry = new Geometry(gl, {
    coords: { size: 2, data: positionB.coords },
    random: { size: 4, data: random }
  });

  program = new Program(gl, {
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: time,
      uRatio: ratio,
      tPosition: positionB.uniform,
      tData: dataB.uniform,
      tTexture: { value: texture },
      uSizeMult: { value: config.particleSize } 
    },
    vertex: `
      precision highp float;
      attribute vec2 coords;
      attribute vec4 random;
      uniform float uTime;
      uniform sampler2D tPosition;
      uniform sampler2D tData;
      uniform float uSizeMult;
      varying vec4 vData;
      varying vec2 vPos;
      void main() {
        vec4 position = texture2D(tPosition, coords);
        vData = texture2D(tData, coords);
        vPos = position.xy;
        gl_Position = vec4(position.xy, 0, 1);
        gl_Position.x += cos(uTime * random.z * 0.8) * random.x * 0.03 * vData.x;
        gl_Position.y += sin(uTime * random.w * 0.8) * random.x * 0.03 * vData.x;
        gl_PointSize = (cos(uTime * 2.0 * random.y) + 1.0) * vData.x * random.x * uSizeMult;
      }
    `,
    fragment: `
      precision highp float;
      uniform vec2 uRatio;
      uniform sampler2D tTexture;
      varying vec4 vData;
      varying vec2 vPos;
      void main() {
        if (step(0.5, length(gl_PointCoord.xy - 0.5)) > 0.0) discard; 
        vec2 pos = vPos;
        pos.x *= uRatio.x;
        pos.y *= uRatio.y;
        gl_FragColor = texture2D(tTexture, (pos + 1.0) / 2.0);
        gl_FragColor.a = clamp(0.0, 1.0, vData.x);
      }
    `
  });

  points = new Mesh(gl, { geometry, program, mode: gl.POINTS });
}

function animate(t) {
  requestAnimationFrame(animate);
  time.value = t * 0.001;
  dataB.render();
  renderer.render({ scene: points });
}

function initListeners() {
  const canvasEl = gl.canvas;
  const updateMouse = (e) => {
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (e.changedTouches && e.changedTouches.length) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }
    
    mouse.value.set(
      (clientX / renderer.width) * 2 - 1,
      (1.0 - clientY / renderer.height) * 2 - 1
    );
  };

  canvasEl.addEventListener('mousemove', updateMouse, false);
  canvasEl.addEventListener('touchstart', updateMouse, {passive: true});
  canvasEl.addEventListener('touchmove', updateMouse, {passive: true});
}

function rnd(min, max) {
  if (min === undefined) { min = 1; }
  if (max === undefined) { max = min; min = 0; }
  return Math.random() * (max - min) + min;
}

// Start application
init();
