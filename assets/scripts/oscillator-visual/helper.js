const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let particles = [];
let audioData = [];
let audioAnalyserNode;
let yRatio;
let xRatio;
let bufferLength;
const w = window.innerWidth;
const h = window.innerHeight;

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setupAudio() {
  const audioContext = new AudioContext();

  audioAnalyserNode = audioContext.createAnalyser();

  const gainNode = audioContext.createGain();

  const oscillatorNodeTriangle = audioContext.createOscillator();
  const oscillatorNodeSquare = audioContext.createOscillator();
  const oscillatorNodeSine = audioContext.createOscillator();

  oscillatorNodeTriangle.type = "triangle";
  oscillatorNodeSquare.type = "square";
  oscillatorNodeSine.type = "sine";

  oscillatorNodeTriangle.frequency.value = config.triangleWave;
  oscillatorNodeSquare.frequency.value = config.squareWave;
  oscillatorNodeSine.frequency.value = config.sineWave;

  oscillatorNodeTriangle.start();
  oscillatorNodeSquare.start();
  oscillatorNodeSine.start();

  oscillatorNodeSquare.connect(gainNode);
  oscillatorNodeTriangle.connect(gainNode);
  oscillatorNodeSine.connect(gainNode);

  gainNode.connect(audioAnalyserNode);
  audioAnalyserNode.connect(audioContext.destination);

  audioAnalyserNode.fftSize = config.fftSize;
  bufferLength = audioAnalyserNode.frequencyBinCount;
  audioData = new Float32Array(bufferLength);

  xRatio = window.innerWidth / bufferLength;
  yRatio = window.innerHeight / bufferLength;
  document.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    } else {
      audioContext.suspend();
    }
  });
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

function createParticles() {
  particles = [];
  const count = Math.floor(
    window.innerWidth * window.innerHeight * config.density,
  );

  for (let i = 0; i < count; i++) {
    particles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      vx: 0,
      vy: 0,
      r: rand(config.radiusMin, config.radiusMax),
      phase: rand(0, config.maxPhase),
      color: `rgba(${config.maxColorSat * rand(0, 1)},
      ${config.maxColorSat * rand(0, 1)},
      ${config.maxColorSat * rand(0, 1)}, 
      ${config.pAlpha})`,
    });
  }
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function update() {
  audioAnalyserNode.getFloatTimeDomainData(audioData);
  for (const p of particles) {
    p.y += audioData[(p.x / xRatio) | 0];
    p.x += audioData[(p.y / yRatio) | 0];

    if (p.x <= 0 || isNaN(p.x)) p.x = rand(5, w - 5);
    if (p.x >= w || isNaN(p.x)) p.x = rand(5, w - 5);
    if (p.y <= 0 || isNaN(p.y)) p.y = rand(5, h - 5);
    if (p.y >= h || isNaN(p.y)) p.y = rand(5, h - 5);
  }
}

function draw() {
  // for (0,0,0,1), the canvas will be set to black on every draw() call
  // for (0,0,0,0.1), the canvas will be set to 90% transparent black on every draw() call
  // this has the effect of adding a layer of 90% transparent black ontop of the already drawn circles.
  // after around 10 iterations of draw with an alpha of 0.1, a circle becomes nearly 100% transparent
  // we could define a trailLength, equal to the number of frames a trail will exist for.
  // => rgba(0,0,0, 1 / trailLength)
  // even so, the trails will never fully disappear
  // there isn't really a way of fully removing these trails
  // outside of generating a 'pair' particle to draw a fully black trail behind it's partner
  ctx.fillStyle = `rgba(0,0,0,${1 / config.trailLength})`;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  for (const p of particles) {
    // simply draws a circle of p.r at (p.x;p.y) for each p in particles
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.r, p.r);
  }
}
