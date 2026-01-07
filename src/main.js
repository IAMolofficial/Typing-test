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
  document.addEventListener('keydown', () => inputField.focus());
  // Removed typingArea listener as it no longer exists
  document.addEventListener('click', () => inputField.focus());
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

function initTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timerTag.innerText = `${timeLeft}s`;

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
  currentWpmTag.innerText = 0;
  currentAccTag.innerText = "100%";
  resultsModal.classList.remove('show');
}

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

// Theme Colors (No Mercy - Dark Gaming Mode)
const themes = {
  easy: {
    primary: '#4ade80', // Bright Green
    secondary: '#22c55e',
    bg: 'radial-gradient(circle at center, #022c22 0%, #000000 100%)', // Deep Green/Black
    text: '#f0fdf4',
    glass: 'rgba(2, 44, 34, 0.7)',
    glassBorder: 'rgba(74, 222, 128, 0.2)'
  },
  hard: {
    primary: '#fb923c', // Bright Orange
    secondary: '#ea580c',
    bg: 'radial-gradient(circle at center, #431407 0%, #000000 100%)', // Deep Orange/Black
    text: '#fff7ed',
    glass: 'rgba(67, 20, 7, 0.7)',
    glassBorder: 'rgba(251, 146, 60, 0.2)'
  },
  extreme: {
    primary: '#f87171', // Bright Red
    secondary: '#dc2626',
    bg: 'radial-gradient(circle at center, #450a0a 0%, #000000 100%)', // Deep Red/Black
    text: '#fef2f2',
    glass: 'rgba(69, 10, 10, 0.7)',
    glassBorder: 'rgba(248, 113, 113, 0.2)'
  },
  expert: {
    primary: '#a78bfa', // Bright Purple
    secondary: '#7c3aed',
    bg: 'radial-gradient(circle at center, #2e1065 0%, #000000 100%)', // Deep Purple/Black
    text: '#f5f3ff',
    glass: 'rgba(46, 16, 101, 0.7)',
    glassBorder: 'rgba(167, 139, 250, 0.2)'
  }
};

function applyTheme(level) {
  const theme = themes[level];
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);
  document.documentElement.style.setProperty('--bg-color', '#000000'); // Fallback
  document.documentElement.style.setProperty('--text-color', theme.text);
  document.documentElement.style.setProperty('--glass-bg', theme.glass);
  document.documentElement.style.setProperty('--glass-border', theme.glassBorder);
  document.body.style.background = theme.bg;
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

restartBtn.addEventListener('click', resetGame);

// Init
loadParagraph();
