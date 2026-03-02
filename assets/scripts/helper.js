const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let particles = [];
let audioData = [];
const w = window.innerWidth;
const h = window.innerHeight;
let audioAnalyserNode;
let bufferLength;

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setupAudio() {
  const audioElement = new Audio("./assets/audio/sad-violin.mp3");
  const audioContext = new AudioContext();

  audioAnalyserNode = audioContext.createAnalyser();
  const audioSourceNode = audioContext.createMediaElementSource(audioElement);

  audioSourceNode.connect(audioAnalyserNode);
  audioAnalyserNode.connect(audioContext.destination);

  audioAnalyserNode.fftSize = 8192;
  bufferLength = audioAnalyserNode.frequencyBinCount;
  audioData = new Uint8Array(bufferLength);

  document.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    audioElement.play();
  });
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

function createParticles() {
  particles = [];
  const count = Math.floor(
    window.innerWidth * window.innerHeight * config.density,
  );

  for (let i = 0; i < count; i++) {
    const red = 255 - rand(0, config.maxColorSat);
    const green = 255 - rand(0, config.maxColorSat);
    const blue = 255 - rand(0, config.maxColorSat);

    particles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      vx: 0,
      vy: 0,
      r: rand(config.radiusMin, config.radiusMax),
      phase: rand(0, config.maxPhase),
      red: red,
      green: green,
      blue: blue,
      color: `rgba(${red},
      ${green},
      ${blue}, 
      ${config.pAlpha})`,
    });
  }
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function update() {
  let yRatio = window.innerHeight / bufferLength;
  let xRatio = window.innerWidth / bufferLength;
  audioAnalyserNode.getByteTimeDomainData(audioData);
  for (const p of particles) {
    // const nx = p.x / w;
    // p.vx = config.xSpeed;
    // p.vy = Math.cos(nx * Math.PI + p.phase) * config.ySpeed;
    p.x += (audioData[Math.floor(p.y / yRatio)] - 128) * config.xSpeed;
    p.y += (audioData[Math.floor(p.x / xRatio)] - 128) * config.ySpeed;

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
