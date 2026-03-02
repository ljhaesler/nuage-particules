const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let particles = [];
let audioData = [];
let imageData;
let w;
let h;
let yRatio;
let xRatio;
let audioAnalyserNode;
let img;

function loadImg() {
  img = new Image();
  img.onload = function () {
    w = img.width;
    h = img.height;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.drawImage(img, 0, 0);

    createParticles();
    setupAudio();
    loop();
  };
  img.src = "assets/images/flowers.jpg";
}

function setupAudio() {
  const audioElement = new Audio("/assets/audio/music.mp3");
  const audioContext = new AudioContext();

  audioAnalyserNode = audioContext.createAnalyser();
  const audioSourceNode = audioContext.createMediaElementSource(audioElement);

  audioSourceNode.connect(audioAnalyserNode);
  audioAnalyserNode.connect(audioContext.destination);

  audioAnalyserNode.fftSize = 2048;
  bufferLength = audioAnalyserNode.frequencyBinCount;
  audioData = new Uint8Array(bufferLength);

  document.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    audioElement.play();
  });

  yRatio = h / bufferLength;
  xRatio = w / bufferLength;
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const pixelLocation = (i) => [i % w, Math.floor(i / w)];

function createParticles() {
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const red = imageData.data[i];
    const green = imageData.data[i + 1];
    const blue = imageData.data[i + 2];

    if (red >= 50 && blue <= 100 && green <= 30) {
      if (rand(0, 1000) <= config.density * 1000) {
        particles.push({
          x: pixelLocation(Math.floor(i / 4))[0],
          y: pixelLocation(Math.floor(i / 4))[1],
          r: rand(config.radiusMin, config.radiusMax),
          color: `rgba(${red}, ${green}, ${blue}, ${config.pAlpha}`,
        });

        imageData.data[i] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function update() {
  audioAnalyserNode.getByteTimeDomainData(audioData);

  for (const p of particles) {
    p.x += (audioData[Math.floor(p.y / yRatio)] - 128) * config.xSpeed;
    p.y += (audioData[Math.floor(p.x / xRatio)] - 128) * config.ySpeed;
  }
}

function draw() {
  for (const p of particles) {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.r, p.r);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadImg();
