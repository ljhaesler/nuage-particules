const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let particles = [];
let t = 0;

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const rand = (min, max) => Math.random() * (max - min) + min;

function flowAngle(x, y, time) {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const nx = x / w;
  const ny = y / h;

  const a =
    Math.sin((nx * 2.0 + time * 0.12) * Math.PI * 2) +
    Math.cos((ny * 1.6 - time * 0.1) * Math.PI * 2) +
    Math.sin(((nx + ny) * 1.2 + time * 0.07) * Math.PI * 2);

  return a * Math.PI;
}

function createParticles() {
  particles = [];
  const count = Math.floor(
    window.innerWidth * window.innerHeight * config.density,
  );

  for (let i = 0; i < count; i++) {
    particles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      vx: rand(-0.2, 0.2),
      vy: rand(-0.2, 0.2),
      r: rand(config.radiusMin, config.radiusMax),
      a: rand(0.08, 0.35),
      phase: rand(0, Math.PI * 2),
    });
  }
  ctx.fillStyle = "#070a10";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function update() {
  t += 0.01;

  for (const p of particles) {
    const ang = flowAngle(p.x, p.y, t + p.phase);
    const ax = Math.cos(ang) * config.flowStrength;
    const ay = Math.sin(ang) * config.flowStrength;

    const jx = Math.cos(t * 2.1 + p.phase) * config.jitter;
    const jy = Math.sin(t * 1.7 + p.phase) * config.jitter;

    p.vx += ax + jx;
    p.vy += ay + jy;

    p.vx *= config.friction;
    p.vy *= config.friction;

    const sp = Math.hypot(p.vx, p.vy);
    if (sp > config.maxSpeed) {
      p.vx = (p.vx / sp) * config.maxSpeed;
      p.vy = (p.vy / sp) * config.maxSpeed;
    }

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -5) p.x = window.innerWidth + 5;
    if (p.x > window.innerWidth + 5) p.x = -5;
    if (p.y < -5) p.y = window.innerHeight + 5;
    if (p.y > window.innerHeight + 5) p.y = -5;
  }
}

function draw() {
  ctx.fillStyle = `rgba(7,10,16,${config.fadeAlpha})`;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.fill();
  }
}
