const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let particles = [];
let randomData = new Int8Array(config.randomLength);

const w = window.innerWidth;
const h = window.innerHeight;

const xRatio = w / config.randomLength;
const yRatio = h / config.randomLength;

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

function createParticles() {
  const count = Math.floor(w * h * config.density);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      color: `rgba(${config.maxColorSat * rand(0, 1)},
      ${config.maxColorSat * rand(0, 1)},
      ${config.maxColorSat * rand(0, 1)}, 
      ${config.pAlpha})`,
    });
  }
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  randomData = randomData.map(() => rand(config.randomMin, config.randomMax));
}

function update() {
  for (const p of particles) {
    p.y += randomData[Math.floor(p.x / xRatio)] * config.xSpeed;
    p.x += randomData[Math.floor(p.y / yRatio)] * config.ySpeed;
  }
}

function draw() {
  ctx.fillStyle = `rgba(0,0,0,${1 / config.trailLength})`;
  ctx.fillRect(0, 0, w, h);

  for (const p of particles) {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 1, 1);
  }
}
