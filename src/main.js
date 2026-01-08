import './style.css';

const texts = {
  easy: "The library was more than just a place filled with books. It was a gateway to endless worlds, each shelf holding the stories of those who had lived, dreamed, and imagined. The scent of aged paper and ink lingered in the air, mixing with the faint aroma of coffee from the reading lounge. A student sat at a wooden table, eyes scanning the pages of an old novel, fingers absentmindedly tracing the worn cover. A historian flipped through ancient documents, carefully turning each fragile page. In the farthest corner, a child sat cross-legged on the floor, completely lost in the magic of a fairy tale. The silence of the library was not empty—it was full of whispers from the past, voices from distant lands, echoes of ideas that had shaped the world. Every visit brought new discoveries, and for those who loved the written word, there was no place more sacred than this quiet temple of knowledge.",

  hard: "The phenomenon of quantum entanglement suggests that particles can become correlated to such a degree that the quantum state of each particle cannot be described independently of the others, even when the particles are separated by a large distance. This counterintuitive behavior, famously referred to by Einstein as 'spooky action at a distance', challenged the classical understanding of physics and causality. Experiments validating Bell's inequalities have since confirmed that local realism is incompatible with the predictions of quantum mechanics. As researchers delve deeper into quantum computing and cryptography, harnessing these intricate properties could lead to technological revolutions, redefining our capabilities in computation and secure communication.",

  extreme: "In the year 2145, the XJ-900 automated terraforming unit malfunctioned at sector 7G-alpha. Error code: #0x5F32-B. The atmospheric pressure stabilized at 104.5 kPa, but the composition remained 78% N2, 20% O2, and 2% unknown volatile compounds. 'Initiating emergency protocol Omega-7,' the AI announced, its voice synthesized at 44.1 kHz. The temperature fluctuated wildly between -40°C and +85°C within minutes. Engineers scrambled to patch the firmware utilizing the legacy CLI: > sudo restart_core --force. The probability of catastrophic failure was calculated at 89.45% ± 0.05%. With only 120 seconds remaining, the lead developer, Sarah, typed the override sequence: { [email protected] #f2 }.",

  expert: "Epistemological considerations regarding the nature of consciousness often intersect with the intricate neurobiological pathways governing cognition. The juxtaposition of subjective qualia and objective neuronal firing patterns presents the 'hard problem' formulated by Chalmers. Furthermore, the idiosyncrasies of synaptic plasticity, particularly long-term potentiation (LTP) and long-term depression (LTD), underscore the malleability of the connectome. Philosophers and neuroscientists alike grapple with the implications of determinism versus free will in a system driven by stochastic biochemical processes. To elucidate the architectural underpinnings of sentience requires a synthesis of phenomenology, cybernetics, and molecular biology, transcending reductionist paradigms to embrace a holistic systems theory approach."
};

let currentLevel = 'easy';
let text = texts[currentLevel];

const quoteDisplay = document.getElementById('quote-display');
const inputField = document.getElementById('input-field');
const timerTag = document.getElementById('timer');
const currentWpmTag = document.getElementById('current-wpm');
const currentAccTag = document.getElementById('current-acc');
const resultsModal = document.getElementById('results-modal');
const finalWpmTag = document.getElementById('final-wpm');
const finalNetWpmTag = document.getElementById('final-net-wpm');
const finalAccTag = document.getElementById('final-acc');
const restartBtn = document.getElementById('restart-btn');

let timer;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = 0;
let mistakes = 0;
let isTyping = false;

function loadParagraph() {
  text = texts[currentLevel]; // Update text based on level
  quoteDisplay.innerHTML = "";
  text.split("").forEach(char => {
    let span = document.createElement("span");
    span.innerText = char;
    span.classList.add('char');
    quoteDisplay.appendChild(span);
  });
  // Highlight the first character
  quoteDisplay.querySelectorAll('span')[0].classList.add('current');

  // Focus input on load
  document.addEventListener('keydown', (e) => {
    // Don't steal focus if an overlay is open or user is typing in another input
    if (document.querySelector('.overlay.show')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    inputField.focus();
  });

  document.addEventListener('click', (e) => {
    if (document.querySelector('.overlay.show')) return;
    if (e.target.closest('.header-controls')) return; // Allow header clicks
    if (e.target.tagName === 'BUTTON') return;
    inputField.focus();
  });
}

function initTyping() {
  let characters = quoteDisplay.querySelectorAll("span");
  let typedChar = inputField.value.split("")[charIndex];

  if (charIndex < characters.length && timeLeft > 0) {
    if (!isTyping) {
      timer = setInterval(initTimer, 1000);
      isTyping = true;
    }

    if (inputField.value.length < charIndex) {
      // Backspace handled implicitly
    }
  } else if (charIndex >= characters.length) {
    // Finished text
    clearInterval(timer);
    finishTest();
  }
}

// Redefining initTyping to be robust
inputField.addEventListener("input", (e) => {
  const characters = quoteDisplay.querySelectorAll("span");

  if (!isTyping && timeLeft > 0) {
    timer = setInterval(initTimer, 1000);
    isTyping = true;
  }

  // Logic for visible textarea:
  // We treat the textarea value as the source of truth for the typed content.
  // We iterate through the textarea value and compare with reference text.

  let typedValue = inputField.value;
  charIndex = typedValue.length; // Set cursor to end of typed text

  // Reset all character states first
  characters.forEach(span => span.classList.remove("correct", "incorrect", "current"));

  mistakes = 0;

  // Compare each character
  const typeValueArr = typedValue.split('');
  typeValueArr.forEach((char, index) => {
    if (index < characters.length) {
      if (char === characters[index].innerText) {
        characters[index].classList.add("correct");
      } else {
        mistakes++;
        characters[index].classList.add("incorrect");
      }
    }
  });

  // Auto-Scroll Logic
  // Find current char
  const currentChar = characters[charIndex];
  if (currentChar) {
    // Check if it's near the bottom of view
    const box = quoteDisplay;
    const charTop = currentChar.offsetTop;
    const boxHeight = box.clientHeight;
    const boxScroll = box.scrollTop;

    // If char is below half way, scroll to keep it centered
    if ((charTop - box.offsetTop) > (boxScroll + boxHeight / 2)) {
      box.scrollTo({
        top: (charTop - box.offsetTop) - boxHeight / 2,
        behavior: 'smooth'
      });
    }
  }

  // Check bounds
  if (charIndex >= characters.length) {
    // Finished?
    clearInterval(timer);
    finishTest();
    return;
  }

  // Set Current Cursor
  if (charIndex < characters.length) {
    let currentChar = characters[charIndex];
    currentChar.classList.add("current");
    // Auto-scroll reference text to keep current char in view
    currentChar.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  updateLiveStats();
});

// Sound Effect
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playHeartbeat() {
  if (isMuted) return; // Mute check
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const t = audioCtx.currentTime;

  // Helper to create one "thump"
  function createThump(time, loud) {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(50, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);

    // Loudness: Gain > 1 for overdrive/loudness
    const volume = loud ? 2.5 : 1.5;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  // Lub (softer) - Dub (harder/louder)
  createThump(t, false);
  createThump(t + 0.15, true);
}

function initTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timerTag.innerText = `${timeLeft}s`;

    // Heartbeat Effect (Last 10 seconds)
    if (timeLeft <= 10) {
      timerTag.classList.add('heartbeat');
      playHeartbeat();
    } else {
      timerTag.classList.remove('heartbeat');
    }

    // WPM calculation every second
    updateLiveStats();
  } else {
    clearInterval(timer);
    finishTest();
  }
}

function updateLiveStats() {
  let timeElapsed = maxTime - timeLeft;
  if (timeElapsed === 0) return;

  let wpm = Math.round(((charIndex) / 5) / (timeElapsed / 60));
  wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
  currentWpmTag.innerText = wpm;

  let acc = Math.round(((charIndex - mistakes) / charIndex) * 100);
  acc = acc < 0 || !acc || acc === Infinity ? 100 : acc;
  currentAccTag.innerText = `${acc}%`;
}

function finishTest() {
  inputField.value = ""; // Clear input
  inputField.blur();

  let timeElapsed = maxTime - timeLeft;
  if (timeElapsed === 0) timeElapsed = 1;

  // Final Calcs
  let grossWPM = Math.round(((charIndex) / 5) / (maxTime / 60));
  let calculationTime = (timeLeft === 0) ? maxTime : (maxTime - timeLeft);

  grossWPM = Math.round(((charIndex) / 5) / (calculationTime / 60));

  let netWPM = Math.round(grossWPM - (mistakes / (calculationTime / 60)));
  if (netWPM < 0) netWPM = 0;

  let accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100);
  if (!accuracy || accuracy === Infinity) accuracy = 0;
  if (charIndex === 0) accuracy = 100;

  finalWpmTag.innerText = grossWPM;
  finalNetWpmTag.innerText = netWPM;
  finalAccTag.innerText = `${accuracy}%`;

  resultsModal.classList.add('show');

  // Pass/Fail Logic
  const statusEl = document.getElementById('result-status');
  const criteria = themes[currentLevel].criteria;

  statusEl.classList.remove('passed', 'failed');

  if (netWPM >= criteria.wpm && accuracy >= criteria.acc) {
    statusEl.innerText = "PASSED!";
    statusEl.classList.add('passed');
    playPassAnimation(); // Success
    // Save Score
    saveScore(netWPM, accuracy, currentLevel);
  } else {
    statusEl.innerText = `FAILED! (Target: ${criteria.wpm} WPM / ${criteria.acc}%)`;
    statusEl.classList.add('failed');
    playFailAnimation(); // Failure
  }
}

function resetGame() {
  loadParagraph();
  clearInterval(timer);
  quoteDisplay.scrollTop = 0; // Reset Scroll
  timeLeft = maxTime;
  charIndex = 0;
  mistakes = 0;
  isTyping = false;
  inputField.value = "";
  timerTag.innerText = `${maxTime}s`;
  timerTag.classList.remove('heartbeat'); // Reset animation
  currentWpmTag.innerText = 0;
  currentAccTag.innerText = "100%";
  resultsModal.classList.remove('show');

  // Clear status
  const statusEl = document.getElementById('result-status');
  if (statusEl) statusEl.innerText = "";

  // Stop any animations
  initEffects('none');
}

import './auth.js';
import { saveScore } from './leaderboard.js';

// Time Selector Logic
const timeBtns = document.querySelectorAll('.time-btn');
timeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Toggle Active Class
    timeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // set Time
    maxTime = parseInt(btn.dataset.time);
    timeLeft = maxTime;
    timerTag.innerText = `${timeLeft}s`;

    // Reset
    resetGame();
  });
});

// Theme Colors (Holotech Mode)
const themes = {
  easy: {
    primary: '#2dd4bf', // Teal
    secondary: '#f472b6',
    bg: '#0f172a',
    text: '#ffffff',
    glass: 'rgba(45, 212, 191, 0.1)',
    glassBorder: 'rgba(45, 212, 191, 0.2)',
    innerBg: 'rgba(0, 0, 0, 0.6)',
    criteria: { wpm: 40, acc: 92 },
    effect: 'none'
  },
  hard: {
    primary: '#fcd34d', // Amber
    secondary: '#fbbf24',
    bg: '#0f172a',
    text: '#ffffff',
    glass: 'rgba(251, 191, 36, 0.1)',
    glassBorder: 'rgba(251, 191, 36, 0.3)',
    innerBg: 'rgba(0, 0, 0, 0.6)',
    criteria: { wpm: 60, acc: 94 },
    effect: 'none'
  },
  extreme: {
    primary: '#f87171', // Red
    secondary: '#ef4444',
    bg: '#0f172a',
    text: '#ffffff',
    glass: 'rgba(248, 113, 113, 0.1)',
    glassBorder: 'rgba(248, 113, 113, 0.3)',
    innerBg: 'rgba(0, 0, 0, 0.6)',
    criteria: { wpm: 80, acc: 96 },
    effect: 'none'
  },
  expert: {
    primary: '#a78bfa', // Purple
    secondary: '#8b5cf6',
    bg: '#0f172a',
    text: '#ffffff',
    glass: 'rgba(167, 139, 250, 0.1)',
    glassBorder: 'rgba(167, 139, 250, 0.3)',
    innerBg: 'rgba(0, 0, 0, 0.6)',
    criteria: { wpm: 100, acc: 98 },
    effect: 'none'
  }
};

function applyTheme(level) {
  const theme = themes[level];
  document.documentElement.style.setProperty('--holo-teal', theme.primary);
  document.documentElement.style.setProperty('--holo-pink', theme.secondary);
  // Also set previous vars for compatibility
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);

  // Initialize Effect
  initEffects(theme.effect, theme.primary);
}

// Level Selector Logic
const levelBtns = document.querySelectorAll('.level-btn');
levelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Toggle Active Class
    levelBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // set Current Level
    currentLevel = btn.dataset.level;

    // Apply Theme
    applyTheme(currentLevel);

    // Reset
    resetGame();
  });
});

// --- Result Animations ---
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let effectsArray = [];
let animationFrameId;

// Pass: Confetti
class Confetti {
  constructor(color) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.size = Math.random() * 8 + 4;
    this.speedX = (Math.random() - 0.5) * 15; // Explosive
    this.speedY = (Math.random() - 0.5) * 15;
    this.color = color;
    this.gravity = 0.2;
    this.friction = 0.95;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.speedX *= this.friction;
    this.rotation += this.rotationSpeed;
    if (this.size > 0.2) this.size -= 0.05;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

// Fail: Heavy Rain
class RainDrop {
  constructor(color) {
    this.x = Math.random() * canvas.width;
    this.y = -50;
    this.size = Math.random() * 2 + 1;
    this.speedY = Math.random() * 10 + 10; // Fast
    this.color = color;
    this.length = Math.random() * 20 + 10;
  }
  update() {
    this.y += this.speedY;
  }
  draw() {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + this.length);
    ctx.stroke();
  }
}

function playPassAnimation() {
  effectsArray = [];
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const colors = ['#2dd4bf', '#f472b6', '#fbbf24', '#ffffff'];
  for (let i = 0; i < 150; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    effectsArray.push(new Confetti(color));
  }
  playResultSound(true); // Sound
  canvas.style.zIndex = 2000; // Bring to front
  animateResults();
}

function playFailAnimation() {
  effectsArray = [];
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Shake Screen
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 500);

  // Rain for 2 seconds
  const interval = setInterval(() => {
    if (effectsArray.length > 200) clearInterval(interval);
    for (let i = 0; i < 5; i++) effectsArray.push(new RainDrop('#ef4444'));
  }, 50);

  // Initial spawn to start loop
  for (let i = 0; i < 5; i++) effectsArray.push(new RainDrop('#ef4444'));

  playResultSound(false); // Sound
  canvas.style.zIndex = 2000; // Bring to front
  animateResults();
}

function animateResults() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < effectsArray.length; i++) {
    effectsArray[i].update();
    effectsArray[i].draw();

    // Cleanup
    if (effectsArray[i].size <= 0.2 || effectsArray[i].y > canvas.height) {
      effectsArray.splice(i, 1);
      i--;
    }
  }

  if (effectsArray.length > 0) {
    animationFrameId = requestAnimationFrame(animateResults);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function initEffects(effectName, color) {
  // Clear any existing
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  effectsArray = [];
  canvas.style.zIndex = -1; // Send to back
}

// Resize canvas
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// --- Sound Toggle ---
let isMuted = false;
const soundBtn = document.getElementById('sound-toggle');

// SVG Strings
const soundOnSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
const soundOffSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" x2="1" y1="1" y2="23"/></svg>`;

soundBtn.innerHTML = soundOnSVG;

function playResultSound(success) {
  if (isMuted) return;
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (success) {
    // Pass: Rising Major Arpeggio (Level Up)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);       // A4
    osc.frequency.setValueAtTime(554.37, t + 0.1); // C#5
    osc.frequency.setValueAtTime(659.25, t + 0.2); // E5
    osc.frequency.setValueAtTime(880, t + 0.3);    // A5

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.start(t);
    osc.stop(t + 0.6);
  } else {
    // Fail: Descending 'Error' Glitch
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.4); // Slide down

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.start(t);
    osc.stop(t + 0.4);
  }
}

soundBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  soundBtn.innerHTML = isMuted ? soundOffSVG : soundOnSVG;

  if (isMuted && audioCtx) {
    audioCtx.suspend();
  } else if (!isMuted && audioCtx) {
    audioCtx.resume();
  }
});

restartBtn.addEventListener('click', resetGame);

// Init
applyTheme(currentLevel); // Apply default theme on load
loadParagraph();
