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

const rand = (min, max) => Math.random() * (max - min) + min;

function flowAngle(x, y) {
  // calculate a normalized x value
  // => the x coordinate of the particle, divided by the width of the window
  // Necessarily between 0 and 1
  // convert to radians and return an angle value from Math.cos()
  // this is the flowAngle, which defines the direction the velocity will be applied to.

  // essentally, particles at the left of the window will be given a Math.cos(val -> 0) trajectory
  // and as they continue right, will approach a Math.cos(val -> 1) trajectory
  // this draws a full Math.cos() period
  // this is also by extension a sine wave

  const w = window.innerWidth;
  const h = window.innerHeight;
  const nx = x / w;
  const ny = y / h;

  // will draw one half of a cos period
  // If 2 * pi rads = 360°, then the value returned by this
  // will be the cos of an angle <= 180°
  const a = [Math.cos(nx * Math.PI * 2), Math.sin(ny * Math.PI * 2)];

  return a;
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
      vx: 0,
      vy: 0,
      r: rand(config.radiusMin, config.radiusMax),
      a: rand(0.5, 0.9),
      phase: 0,
      //phase: rand(0, Math.PI * 2),
    });
  }
  ctx.fillStyle = "#070a10";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function update() {
  for (const p of particles) {
    // first calculate the flow angle based on the x coordinate of the particle
    const ang = flowAngle(p.x, p.y);

    // this flow angle fluctuates between -1 and 1
    // this implies angle values between -180 and 180°
    // an angle value of 0 from cos would mean an x velocity of 0
    // an angle value of 0 from sin would mean a y velocity of 1
    const ax = Math.cos(ang[0]);
    const ay = Math.sin(ang[0]);

    p.vx += ax;
    p.vy += ay;

    p.vx *= config.friction;
    p.vy *= config.friction;

    p.x += p.vx;
    p.y += p.vy;

    // if a particle reaches the end of the screen
    // redraw it back at the start
    if (p.x < -5) p.x = window.innerWidth + 5;
    if (p.x > window.innerWidth + 5) p.x = -5;
    if (p.y < -5) p.y = window.innerHeight + 5;
    if (p.y > window.innerHeight + 5) p.y = -5;
  }
}

function draw() {
  ctx.fillStyle = `rgba(20,20,20,${config.fadeAlpha})`;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  for (const p of particles) {
    // simply draws a circle of p.r at (p.x;p.y) for each p in particles
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 180, ${p.a})`;
    ctx.fill();
  }
}
