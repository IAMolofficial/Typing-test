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
      // Backspace handled here implicitly if value length dropped? 
      // Actually standard logic often uses 'input' event which gives the new value.
      // If user hit backspace, charIndex needs to decrement.
      // But inputField.value tracks the entire string? 
      // Standard approach: Clear input value after each char? Or keep it?
      // Keeping it is easier for mobile/updates.
      // Wait, if I handle backspace, I need to know if it WAS a backspace.
      // Input event doesn't tell key type easily.
      // Let's rely on comparisons.
    }

    // Alternative robust logic:
    // On 'input', we compare inputField.value with substring.
    // Actually, simpler logic:
    // Just handling char by char.

    // Let's use the standard "typedChar" approach but careful with backspace.
    // If inputField.value is NOT cleared, backspace removes last char.

    // New Logic for Input Handler:
    // We bind to 'input' event.
    // If inputType is deleteContentBackward -> handle backspace
    // Else -> handle typing.
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

// Prevent backspace from navigating back if needed, but input field handles it.
// Need to ensure inputField.value stays in sync with charIndex? 
// Actually, if we just let inputField grow, it's fine.
// So yes, we just let it grow.

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
  // Gross WPM = (All Typed / 5) / TimeElapsed(min)
  // TimeElapsed = maxTime - timeLeft
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
  if (timeElapsed === 0) timeElapsed = 1; // avoid div by 0 if instant

  // Final Calcs
  // Gross WPM
  let grossWPM = Math.round(((charIndex) / 5) / (maxTime / 60)); // Standardized to total time or elapsed? Usually standardized to 1 min if time up.
  // If finished early, use elapsed. If time up, use maxTime.
  let calculationTime = (timeLeft === 0) ? maxTime : (maxTime - timeLeft);

  grossWPM = Math.round(((charIndex) / 5) / (calculationTime / 60));

  // Net WPM = Gross WPM - (Uncorrected Errors / Time)
  // Here 'mistakes' tracks all errors made. Usually Net WPM penalizes uncorrected errors.
  // But my logic counts 'mistakes' as any mismatch ever made? 
  // Wait, on backspace `mistakes--` only if it was incorrect.
  // So `mistakes` currently tracks "current uncorrected errors" or "total errors ever"?
  // Code says: if incorrect -> mistakes++. If backspace on incorrect -> mistakes--.
  // So `mistakes` = "Current Incorrect Characters on screen".
  // This is correct for Net WPM calc.

  let netWPM = Math.round(grossWPM - (mistakes / (calculationTime / 60)));
  if (netWPM < 0) netWPM = 0;

  let accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100);
  if (!accuracy || accuracy === Infinity) accuracy = 0; // Handle 0 chars
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
    // Save Score
    saveScore(netWPM, accuracy, currentLevel);
  } else {
    statusEl.innerText = `FAILED! (Target: ${criteria.wpm} WPM / ${criteria.acc}%)`;
    statusEl.classList.add('failed');
  }
}

function resetGame() {
  loadParagraph();
  clearInterval(timer);
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

// Theme Colors (Cyberpunk Gaming Mode)
const themes = {
  easy: {
    primary: '#00ff9d', // Neon Green
    secondary: '#00cc7a',
    bg: 'radial-gradient(circle at center, #001a1a 0%, #000000 100%)',
    text: '#ffffff',
    glass: 'rgba(0, 255, 157, 0.05)',
    glassBorder: 'rgba(0, 255, 157, 0.3)',
    innerBg: 'rgba(0, 0, 0, 0.6)',
    criteria: { wpm: 40, acc: 92 },
    effect: 'none'
  },
  hard: {
    primary: '#ffaa00', // Neon Gold
    secondary: '#cc8800',
    bg: 'radial-gradient(circle at center, #1a1100 0%, #000000 100%)',
    text: '#ffffff',
    glass: 'rgba(255, 170, 0, 0.05)',
    glassBorder: 'rgba(255, 170, 0, 0.3)',
    innerBg: 'rgba(0, 0, 0, 0.6)',
    criteria: { wpm: 60, acc: 94 },
    effect: 'none'
  },
  extreme: {
    primary: '#ff003c', // Cyber Red
    secondary: '#cc0030',
    bg: 'radial-gradient(circle at center, #1a0006 0%, #000000 100%)',
    text: '#ffffff',
    glass: 'rgba(255, 0, 60, 0.05)',
    glassBorder: 'rgba(255, 0, 60, 0.5)',
    innerBg: 'rgba(0, 0, 0, 0.6)',
    criteria: { wpm: 80, acc: 96 },
    effect: 'embers'
  },
  expert: {
    primary: '#bc13fe', // Electric Purple
    secondary: '#8a0eb5',
    bg: 'radial-gradient(circle at center, #12001a 0%, #000000 100%)',
    text: '#ffffff',
    glass: 'rgba(188, 19, 254, 0.05)',
    glassBorder: 'rgba(188, 19, 254, 0.5)',
    innerBg: 'rgba(0, 0, 0, 0.6)',
    criteria: { wpm: 100, acc: 98 },
    effect: 'embers'
  }
};

function applyTheme(level) {
  const theme = themes[level];
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);
  document.documentElement.style.setProperty('--bg-color', '#000000');
  document.documentElement.style.setProperty('--text-color', theme.text);
  document.documentElement.style.setProperty('--glass-bg', theme.glass);
  document.documentElement.style.setProperty('--glass-border', theme.glassBorder);
  document.documentElement.style.setProperty('--inner-bg', theme.innerBg);
  document.body.style.background = theme.bg;

  // Set Effect
  currentEffect = theme.effect || 'none';
  if (currentEffect !== 'embers') {
    particlesArray = []; // Clear particles if effect off
  }
}

// Level Selector Logic
const levelBtns = document.querySelectorAll('.level-btn');
levelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Toggle Active Class
    levelBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // set Level
    currentLevel = btn.dataset.level;

    // Apply Theme
    applyTheme(currentLevel);

    // Reset
    resetGame();
  });
});

// --- Particles System ---
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
let currentEffect = 'none';

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 1; // Smaller embers
    this.speedX = Math.random() * 2 - 1; // Drift left/right
    this.speedY = Math.random() * -3 - 1; // Float UP
    this.color = color;
    this.life = 150; // Longer life
    this.opacity = 1;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY; // Move up
    this.life--;
    this.opacity = this.life / 150;
  }
  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function handleParticles() {
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();
    if (particlesArray[i].life <= 0) {
      particlesArray.splice(i, 1);
      i--;
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Continuous Spawn for Embers
  if (currentEffect === 'embers') {
    // Spawn random embers at bottom
    if (Math.random() < 0.2) { // Density control
      const color = themes[currentLevel].primary;
      const x = Math.random() * canvas.width;
      particlesArray.push(new Particle(x, canvas.height, color));
    }
  }

  handleParticles();
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Resize canvas
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// --- Sound Toggle ---
let isMuted = false;
const soundBtn = document.getElementById('sound-toggle');
soundBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  soundBtn.innerText = isMuted ? '🔇' : '🔊';
  if (isMuted && audioCtx.state === 'running') audioCtx.suspend();
  if (!isMuted && audioCtx.state === 'suspended') audioCtx.resume();
});

restartBtn.addEventListener('click', resetGame);

// Init
applyTheme(currentLevel); // Apply default theme on load
loadParagraph();
