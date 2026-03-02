import { gsap } from 'gsap';

// --- Particle system for fireworks ---
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Math.random() * 2 + 1;
    this.velocity = {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10
    };
    this.friction = 0.96;
    this.gravity = 0.08;
    this.opacity = 1;
    this.decay = Math.random() * 0.015 + 0.005;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', `, ${this.opacity})`);
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
  }

  update() {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.opacity -= this.decay;
    this.draw();
  }
}

function createFirework(x, y) {
  const colors = ['rgb(255, 105, 180)', 'rgb(255, 215, 0)', 'rgb(255, 69, 0)', 'rgb(255, 255, 255)', 'rgb(0, 255, 255)'];
  const particleCount = 150;
  for (let i = 0; i < particleCount; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, color));
  }
}

function animateParticles() {
  requestAnimationFrame(animateParticles);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle, index) => {
    if (particle.opacity <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });

  // Random glowing embers at bottom
  if (Math.random() < 0.1 && document.getElementById('bg-scene2').style.opacity > 0) {
    particles.push(new Particle(Math.random() * canvas.width, canvas.height + 10, 'rgb(255, 69, 0)'));
  }
}

animateParticles();

// Continuous random fireworks
let fireworksInterval;
function startFireworks() {
  createFirework(canvas.width / 2, canvas.height / 3); // Initial center pop

  fireworksInterval = setInterval(() => {
    createFirework(
      Math.random() * canvas.width,
      (Math.random() * window.innerHeight * 0.6)
    );
  }, 1200);
}


// --- Interactions & Animations ---

const blowBtn = document.getElementById('blow-btn');
const flames = document.querySelectorAll('.flame');
const scene1 = document.getElementById('scene1');
const scene2 = document.getElementById('scene2');
const bgScene1 = document.getElementById('bg-scene1');
const bgScene2 = document.getElementById('bg-scene2');
const giftBox = document.querySelector('.gift-box');
const messageCard = document.querySelector('.message-card');

blowBtn.addEventListener('click', () => {
  // 1. Blow out flames
  flames.forEach(flame => {
    flame.classList.add('blown-out');
  });

  // 2. Hide button and fade out candles
  gsap.to('#blow-btn', { opacity: 0, scale: 0.8, duration: 0.5, ease: "power2.in" });

  const tl = gsap.timeline();

  // Fade out Scene 1 Container
  tl.to(scene1, {
    opacity: 0,
    duration: 1.5,
    delay: 0.8,
    onComplete: () => {
      scene1.classList.add('hidden');
    }
  });

  // 3. Transition Backgrounds
  tl.to(bgScene1, { opacity: 0, duration: 2 }, "-=1");
  tl.to(bgScene2, {
    opacity: 1,
    duration: 2,
    onStart: () => {
      bgScene2.classList.remove('hidden');
      startFireworks();
    }
  }, "-=1.5");

  // 4. Show Scene 2, Bounce in Gift Box
  tl.call(() => {
    scene2.classList.remove('hidden');
  });

  // Spring gift box from bottom up into frame
  tl.to(giftBox, {
    y: -100, // Move up slightly from bottom
    duration: 2,
    ease: "elastic.out(1, 0.5)"
  });

  // 5. Open gift lid
  tl.to('.gift-lid', {
    y: -60,
    rotation: 12,
    duration: 0.8,
    ease: "power2.out"
  }, "+=0.3");

  // Move lid away and adjust gift body
  tl.to('.gift-lid', {
    y: 200,
    opacity: 0,
    duration: 1,
    ease: "power2.in"
  });

  // Move gift body down slightly to give room to message
  tl.to('.gift-container', {
    y: 100,
    scale: 0.8,
    opacity: 0.4,
    duration: 1.5,
    ease: "power2.inOut"
  }, "-=0.5");

  // 6. Reveal soft frosted-glass message card
  tl.call(() => {
    messageCard.classList.remove('hidden');
  });

  tl.to(messageCard, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 2,
    ease: "back.out(1.2)"
  }, "-=1");
});
