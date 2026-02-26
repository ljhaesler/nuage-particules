const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let particles = [];
let audioData = [];
let audioAnalyserNode;
let bufferLength;
let t = 0;

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setupAudio() {
  const audioElement = new Audio("./assets/audio/music.mp3");
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

const rand = (min, max) => Math.random() * (max - min) + min;

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
      color: `rgba(${255 - rand(0, config.maxColorSat)},
      ${255 - rand(0, config.maxColorSat)},
      ${255 - rand(0, config.maxColorSat)}, 
      1)`,
    });
  }
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function update() {
  let yRatio = window.innerHeight / bufferLength;
  let xRatio = window.innerWidth / bufferLength;
  audioAnalyserNode.getByteTimeDomainData(audioData);
  const audioAvg =
    audioData.reduce((acc, curr) => acc + curr, 0) / audioData.length;
  for (const p of particles) {
    const w = window.innerWidth;

    // calculate a normalized x value
    // => the x coordinate of the particle, divided by the width of the window
    // Necessarily between 0 and 1
    // convert to radians and return an angle value from Math.cos()
    // this is the flowAngle, which defines the direction the velocity will be applied to.

    // essentally, particles at the left of the window will be given a Math.cos(val -> 0) trajectory
    // and as they continue right, will approach a Math.cos(val -> 2 * pi) trajectory
    // this draws a full Math.cos() period
    // this is also by extension a sine wave
    const nx = p.x / w;

    // this flow angle fluctuates between -1 and 1

    // we need this flowAngle to define a vector -> a direction in which the particle will flow
    // ideally, this vector should be equal to the slope of a tangent line on the cos function.
    // more simply, we can just set the vector movement along x to a fixed value
    // then the vector movement along y can be defined by our ang from before.
    p.vx = (audioData[Math.floor(p.y / yRatio)] - 128) * config.xSpeed;
    p.vy = (audioData[Math.floor(p.x / xRatio)] - 128) * config.xSpeed;
    // p.vy = Math.cos(nx * Math.PI * 4 + p.phase);
    p.x += p.vx;
    p.y += p.vy;

    // if a particle reaches the end of the screen
    // redraw it back at the start
    if (p.x < 1) p.x = window.innerWidth - 1;
    if (p.x > window.innerWidth - 1) p.x = 1;
    if (p.y < 1) p.y = window.innerHeight - 1;
    if (p.y > window.innerHeight - 1) p.y = 1;
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
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
}
