/**
 * PRESS UNDER PRESSURE - GAME ENGINE
 * Handles procedural challenge generation, deterministic validation,
 * 25-second total countdown loop, SVG ring rendering, and DOM updates.
 */

(function () {
  'use strict';

  // Game Constants
  const TOTAL_ROUNDS = 8;
  const TOTAL_TIME_SECONDS = 25.0;
  const RING_CIRCUMFERENCE = 2 * Math.PI * 140; // r = 140 -> 879.64

  // State
  let gameState = 'START'; // 'START' | 'PLAYING' | 'FAIL' | 'SUCCESS'
  let currentRoundIndex = 0;
  let rounds = [];
  let currentTaps = 0;
  let timeRemaining = TOTAL_TIME_SECONDS;
  let lastTimestamp = 0;
  let lastTick = -1;
  let timerAnimationId = null;
  let stats = {
    totalTapsGiven: 0,
    startTime: 0,
    endTime: 0,
    failedReason: '',
    failedRound: 1,
  };

  // DOM Elements
  const timerDisplay = document.getElementById('timer-display');
  const roundPips = document.getElementById('round-pips');
  const roundNumberEl = document.getElementById('round-number');
  const challengeBtn = document.getElementById('challenge-button');
  const challengePill = document.getElementById('challenge-pill');
  const instructionText = document.getElementById('instruction-text');
  const symbolStage = document.getElementById('symbol-stage');
  const tapTally = document.getElementById('tap-tally');
  const tapDotsContainer = document.getElementById('tap-dots');
  const ringProgress = document.getElementById('ring-progress');
  const countdownSvg = document.getElementById('countdown-svg');
  const confirmBtn = document.getElementById('confirm-btn');
  const resetTapsBtn = document.getElementById('reset-taps-btn');
  const muteBtn = document.getElementById('mute-btn');
  const helpBtn = document.getElementById('help-btn');

  // Modals
  const startModal = document.getElementById('start-modal');
  const failModal = document.getElementById('fail-modal');
  const successModal = document.getElementById('success-modal');
  const tutorialModal = document.getElementById('tutorial-modal');

  const startBtn = document.getElementById('start-btn');
  const retryBtn = document.getElementById('retry-btn');
  const playAgainBtn = document.getElementById('play-again-btn');
  const closeTutorialBtn = document.getElementById('close-tutorial-btn');

  // Stats DOM
  const failRoundEl = document.getElementById('fail-round');
  const failReasonEl = document.getElementById('fail-reason');
  const failTimeEl = document.getElementById('fail-time');
  const successTimeEl = document.getElementById('success-time');
  const successRankEl = document.getElementById('success-rank');

  // ==========================================================================
  // CHALLENGE GENERATOR & RULE ENGINE
  // ==========================================================================

  // SVG Shape Helpers
  function createSvgShape(type, colorClass) {
    if (type === 'triangle') {
      return `<svg class="shape-svg ${colorClass}" viewBox="0 0 24 24"><polygon points="12,2 22,20 2,20"/></svg>`;
    } else if (type === 'square') {
      return `<svg class="shape-svg ${colorClass}" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;
    } else if (type === 'diamond') {
      return `<svg class="shape-svg ${colorClass}" viewBox="0 0 24 24"><polygon points="12,2 22,12 12,22 2,12"/></svg>`;
    } else if (type === 'pentagon') {
      return `<svg class="shape-svg ${colorClass}" viewBox="0 0 24 24"><polygon points="12,2 22,9 18,21 6,21 2,9"/></svg>`;
    } else if (type === 'circle') {
      return `<svg class="shape-svg ${colorClass}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>`;
    } else if (type === 'star-5') {
      return `<svg class="shape-svg ${colorClass}" viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`;
    } else if (type === 'star-4') {
      return `<svg class="shape-svg ${colorClass}" viewBox="0 0 24 24"><polygon points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10"/></svg>`;
    } else if (type === 'star-hollow') {
      return `<svg class="shape-svg hollow" viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`;
    }
    return '';
  }

  // Generate 8 diverse rounds for an attempt
  function generateRounds() {
    const roundList = [];
    const colors = ['mint', 'coral', 'violet'];

    // Planned families:
    // 1. Star Counting
    // 2. Sharp-Edge / Vertex Counting
    // 3. Color Filter
    // 4. Rat Override
    // 5. Moon Override
    // 6. Entity / Symbol Match
    // 7. Odd/Even Logic
    // 8. Negative Shape Selection

    // Round 1: Gentle introduction - Star Counting (5-pointed stars)
    (function () {
      const starCount = Math.floor(Math.random() * 3) + 2; // 2 to 4
      const sparkleCount = Math.floor(Math.random() * 2) + 1;
      const circleCount = Math.floor(Math.random() * 2) + 1;

      const items = [];
      for (let i = 0; i < starCount; i++) items.push({ html: createSvgShape('star-5', 'gold'), type: 'star-5' });
      for (let i = 0; i < sparkleCount; i++) items.push({ html: createSvgShape('star-4', 'mint'), type: 'star-4' });
      for (let i = 0; i < circleCount; i++) items.push({ html: createSvgShape('circle', 'violet'), type: 'circle' });
      shuffleArray(items);

      roundList.push({
        pillText: 'STAR RECOGNITION',
        pillClass: '',
        instruction: 'Tap once for each 5-pointed star (★)',
        items: items,
        expectedTaps: starCount,
        ruleType: 'stars',
      });
    })();

    // Round 2: Color Filter (Mint or Coral)
    (function () {
      const targetColor = Math.random() > 0.5 ? 'mint' : 'coral';
      const otherColor = targetColor === 'mint' ? 'coral' : 'mint';
      const targetCount = Math.floor(Math.random() * 3) + 1; // 1 to 3
      const otherCount = Math.floor(Math.random() * 3) + 1;

      const items = [];
      const shapes = ['circle', 'triangle', 'square'];
      for (let i = 0; i < targetCount; i++) {
        items.push({ html: createSvgShape(shapes[i % shapes.length], targetColor), color: targetColor });
      }
      for (let i = 0; i < otherCount; i++) {
        items.push({ html: createSvgShape(shapes[(i + 1) % shapes.length], otherColor), color: otherColor });
      }
      shuffleArray(items);

      roundList.push({
        pillText: 'COLOR SPECTROMETRY',
        pillClass: '',
        instruction: `Tap once for each <span style="color:var(--${targetColor}-primary);">${targetColor.toUpperCase()}</span> shape`,
        items: items,
        expectedTaps: targetCount,
        ruleType: 'color',
      });
    })();

    // Round 3: RAT OVERRIDE (Critical Test!)
    (function () {
      const normalStars = Math.floor(Math.random() * 3) + 2;
      const items = [];
      for (let i = 0; i < normalStars; i++) items.push({ html: createSvgShape('star-5', 'gold') });
      items.push({ html: '<span style="font-size:1.85rem;">🐀</span>', isRat: true });
      shuffleArray(items);

      roundList.push({
        pillText: '⚠️ RAT PROTOCOL',
        pillClass: 'override-rat',
        instruction: 'RAT DETECTED! Evacuate: tap 0 times and confirm immediately!',
        items: items,
        expectedTaps: 0,
        isOverride: true,
        overrideType: 'rat',
      });
    })();

    // Round 4: Sharp-Edge / Vertex Counting
    (function () {
      // Triangles have 3 edges, squares have 4 edges, circles have 0
      const challengeSubtype = Math.random() > 0.5 ? 'shapes_with_corners' : 'exact_vertices';
      
      if (challengeSubtype === 'shapes_with_corners') {
        const sharpCount = Math.floor(Math.random() * 3) + 2; // 2 to 4
        const smoothCount = Math.floor(Math.random() * 2) + 1;
        const items = [];
        for (let i = 0; i < sharpCount; i++) {
          const shape = i % 2 === 0 ? 'triangle' : 'square';
          items.push({ html: createSvgShape(shape, colors[i % colors.length]) });
        }
        for (let i = 0; i < smoothCount; i++) {
          items.push({ html: createSvgShape('circle', 'violet') });
        }
        shuffleArray(items);

        roundList.push({
          pillText: 'GEOMETRY ANALYSIS',
          pillClass: '',
          instruction: 'Tap for each shape with SHARP corners (ignore circles)',
          items: items,
          expectedTaps: sharpCount,
          ruleType: 'sharp_edges',
        });
      } else {
        // Count triangles (3 corners each)
        const triangleCount = Math.floor(Math.random() * 3) + 1; // 1 to 3
        const squareCount = Math.floor(Math.random() * 2) + 1;
        const items = [];
        for (let i = 0; i < triangleCount; i++) items.push({ html: createSvgShape('triangle', 'mint') });
        for (let i = 0; i < squareCount; i++) items.push({ html: createSvgShape('square', 'coral') });
        shuffleArray(items);

        roundList.push({
          pillText: 'VERTEX SCAN',
          pillClass: '',
          instruction: 'Tap once for each TRIANGLE (3 vertices)',
          items: items,
          expectedTaps: triangleCount,
          ruleType: 'triangles',
        });
      }
    })();

    // Round 5: Symbol / Entity Match (Robots vs Sparks vs Keys)
    (function () {
      const symbols = ['🤖', '⚡', '🔑', '💎'];
      const targetSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const targetCount = Math.floor(Math.random() * 3) + 1; // 1 to 3
      const fillerSymbols = symbols.filter(s => s !== targetSymbol);

      const items = [];
      for (let i = 0; i < targetCount; i++) items.push({ html: `<span>${targetSymbol}</span>` });
      for (let i = 0; i < 3; i++) {
        const filler = fillerSymbols[i % fillerSymbols.length];
        items.push({ html: `<span>${filler}</span>` });
      }
      shuffleArray(items);

      roundList.push({
        pillText: 'ENTITY VERIFICATION',
        pillClass: '',
        instruction: `Tap once for each ${targetSymbol} icon`,
        items: items,
        expectedTaps: targetCount,
        ruleType: 'symbol',
      });
    })();

    // Round 6: MOON OVERRIDE (Lunar Protocol)
    (function () {
      const items = [];
      const triangles = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < triangles; i++) items.push({ html: createSvgShape('triangle', 'coral') });
      items.push({ html: '<span style="font-size:1.85rem;">🌙</span>', isMoon: true });
      shuffleArray(items);

      roundList.push({
        pillText: '🌙 LUNAR ANOMALY',
        pillClass: 'override-moon',
        instruction: 'MOON OVERRIDE ACTIVE: Gravitational flux. Tap exactly 3 times!',
        items: items,
        expectedTaps: 3,
        isOverride: true,
        overrideType: 'moon',
      });
    })();

    // Round 7: Odd / Even Parity Logic
    (function () {
      const circleCount = Math.floor(Math.random() * 4) + 1; // 1 to 4
      const isEven = circleCount % 2 === 0;
      const expectedTaps = isEven ? 2 : 1;

      const items = [];
      for (let i = 0; i < circleCount; i++) items.push({ html: createSvgShape('circle', 'mint') });
      items.push({ html: createSvgShape('square', 'violet') });
      shuffleArray(items);

      roundList.push({
        pillText: 'PARITY LOGIC',
        pillClass: '',
        instruction: 'If circles are EVEN tap 2. If ODD tap 1.',
        items: items,
        expectedTaps: expectedTaps,
        ruleType: 'parity',
      });
    })();

    // Round 8: Grand Finale - Negative Selection or Mixed Sparkles
    (function () {
      const hollowCount = Math.floor(Math.random() * 2) + 1;
      const solidStarCount = Math.floor(Math.random() * 3) + 2; // 2 to 4
      const items = [];
      for (let i = 0; i < hollowCount; i++) items.push({ html: createSvgShape('star-hollow', '') });
      for (let i = 0; i < solidStarCount; i++) items.push({ html: createSvgShape('star-5', 'mint') });
      shuffleArray(items);

      roundList.push({
        pillText: 'FINAL AUTHENTICATION',
        pillClass: '',
        instruction: 'Tap for SOLID stars (★). DO NOT count hollow stars (☆)',
        items: items,
        expectedTaps: solidStarCount,
        ruleType: 'solid_stars',
      });
    })();

    return roundList;
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // ==========================================================================
  // GAME LIFECYCLE & STATE MACHINE
  // ==========================================================================

  function startGame() {
    hideAllModals();
    gameState = 'PLAYING';
    currentRoundIndex = 0;
    currentTaps = 0;
    timeRemaining = TOTAL_TIME_SECONDS;
    lastTick = -1;
    rounds = generateRounds();

    stats.totalTapsGiven = 0;
    stats.startTime = performance.now();
    stats.failedReason = '';

    renderPips();
    loadRound(currentRoundIndex);

    lastTimestamp = performance.now();
    cancelAnimationFrame(timerAnimationId);
    timerAnimationId = requestAnimationFrame(gameLoop);

    if (window.soundFx) {
      window.soundFx.init();
      window.soundFx.playRoundPass();
    }
  }

  function gameLoop(timestamp) {
    if (gameState !== 'PLAYING') return;

    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    timeRemaining -= delta;

    if (timeRemaining <= 0) {
      timeRemaining = 0;
      updateTimerUI();
      handleTimeExpired();
      return;
    }

    updateTimerUI();
    timerAnimationId = requestAnimationFrame(gameLoop);
  }

  function updateTimerUI() {
    const formatted = Math.max(0, timeRemaining).toFixed(2);
    timerDisplay.textContent = `${formatted}s`;

    // Ring progress calculation (0 to 1)
    const progress = Math.max(0, timeRemaining / TOTAL_TIME_SECONDS);
    const offset = RING_CIRCUMFERENCE * (1 - progress);
    ringProgress.style.strokeDashoffset = offset;

    // Visual warnings under 7 seconds
    if (timeRemaining <= 7.0) {
      timerDisplay.classList.add('warning');
      countdownSvg.classList.add('warning');
      ringProgress.classList.add('warning');
      ringProgress.classList.remove('mint');

      // Metronome tick sound on whole second boundaries
      const currentInt = Math.ceil(timeRemaining);
      if (lastTick === -1 || lastTick !== currentInt) {
        lastTick = currentInt;
        if (window.soundFx) window.soundFx.playTick();
      }
    } else {
      timerDisplay.classList.remove('warning');
      countdownSvg.classList.remove('warning');
      ringProgress.classList.remove('warning');
      if (progress > 0.5) {
        ringProgress.classList.add('mint');
      } else {
        ringProgress.classList.remove('mint');
      }
    }
  }

  function loadRound(index) {
    const round = rounds[index];
    currentTaps = 0;
    updateTapDisplay();

    // Round Pills
    roundNumberEl.textContent = `${index + 1} / ${TOTAL_ROUNDS}`;
    renderPips();

    // Set Challenge Information inside the large circular button
    challengePill.textContent = round.pillText;
    challengePill.className = `challenge-pill ${round.pillClass || ''}`;
    instructionText.innerHTML = round.instruction;

    // Render Stage Symbols
    symbolStage.innerHTML = '';
    round.items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'stage-item';
      el.style.animationDelay = `${idx * 0.04}s`;
      el.innerHTML = item.html;
      symbolStage.appendChild(el);
    });

    // Override Alert Sound
    if (round.isOverride && window.soundFx) {
      window.soundFx.playOverrideAlert();
    }
  }

  function renderPips() {
    roundPips.innerHTML = '';
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const pip = document.createElement('div');
      pip.className = 'round-pip';
      if (i < currentRoundIndex) {
        pip.classList.add('completed');
      } else if (i === currentRoundIndex) {
        pip.classList.add('current');
      }
      roundPips.appendChild(pip);
    }
  }

  // ==========================================================================
  // TAP & SUBMIT HANDLERS
  // ==========================================================================

  function handleButtonTap(e) {
    if (gameState !== 'PLAYING') return;

    currentTaps++;
    stats.totalTapsGiven++;

    if (window.soundFx) {
      window.soundFx.playTap();
    }

    // Button visual compression and ripple
    challengeBtn.classList.add('pressed');
    setTimeout(() => challengeBtn.classList.remove('pressed'), 80);

    createRipple(e);
    updateTapDisplay();
  }

  function createRipple(e) {
    const rect = challengeBtn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    let x, y;
    if (e && e.clientX && e.clientY) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      // Center if triggered via keyboard
      x = rect.width / 2;
      y = rect.height / 2;
    }

    const size = Math.max(rect.width, rect.height) * 0.8;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;

    challengeBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 450);
  }

  function updateTapDisplay() {
    tapTally.textContent = `Taps: ${currentTaps}`;

    // Render stealth dots (player sees their tap tally, but NEVER the required answer)
    tapDotsContainer.innerHTML = '';
    for (let i = 0; i < currentTaps; i++) {
      const dot = document.createElement('div');
      dot.className = 'tap-dot';
      tapDotsContainer.appendChild(dot);
    }
  }

  function handleResetTaps() {
    if (gameState !== 'PLAYING') return;
    if (currentTaps > 0) {
      currentTaps = 0;
      updateTapDisplay();
      if (window.soundFx) window.soundFx.playTap();
    }
  }

  function handleConfirm() {
    if (gameState !== 'PLAYING') return;

    if (window.soundFx) {
      window.soundFx.playConfirm();
    }

    const currentRound = rounds[currentRoundIndex];
    const isCorrect = currentTaps === currentRound.expectedTaps;

    if (!isCorrect) {
      handleFailure('TAP MISCALCULATION', `Incorrect tap count on Round ${currentRoundIndex + 1}.`);
      return;
    }

    // Correct! Proceed to next round or victory
    currentRoundIndex++;

    if (currentRoundIndex >= TOTAL_ROUNDS) {
      handleSuccess();
    } else {
      if (window.soundFx) {
        window.soundFx.playRoundPass();
      }
      loadRound(currentRoundIndex);
    }
  }

  // ==========================================================================
  // GAME OVER & SUCCESS
  // ==========================================================================

  function handleTimeExpired() {
    handleFailure('TIME EXPIRED', 'Human reaction latency exceeded 25 seconds threshold.');
  }

  function handleFailure(title, description) {
    gameState = 'FAIL';
    cancelAnimationFrame(timerAnimationId);

    if (window.soundFx) {
      window.soundFx.playFailure();
    }

    failRoundEl.textContent = `Round ${currentRoundIndex + 1} / ${TOTAL_ROUNDS}`;
    failReasonEl.textContent = description;
    failTimeEl.textContent = `${(TOTAL_TIME_SECONDS - timeRemaining).toFixed(2)}s`;

    failModal.classList.remove('hidden');
  }

  function handleSuccess() {
    gameState = 'SUCCESS';
    cancelAnimationFrame(timerAnimationId);

    if (window.soundFx) {
      window.soundFx.playVictory();
    }

    const timeSpent = (TOTAL_TIME_SECONDS - timeRemaining).toFixed(2);
    successTimeEl.textContent = `${timeSpent}s`;

    // Calculate Reflex Rank
    let rank = 'Cyber Champion';
    if (timeSpent < 12) rank = 'Tachyon Reflexes ⚡';
    else if (timeSpent < 16) rank = 'Diamond Fingers 💎';
    else if (timeSpent < 21) rank = 'Certified Organic Human 🧠';
    else rank = 'Just in the Nick of Time ⏱️';

    successRankEl.textContent = rank;
    successModal.classList.remove('hidden');
  }

  function hideAllModals() {
    startModal.classList.add('hidden');
    failModal.classList.add('hidden');
    successModal.classList.add('hidden');
    tutorialModal.classList.add('hidden');
  }

  // ==========================================================================
  // EVENT LISTENERS & KEYBOARD BINDINGS
  // ==========================================================================

  // Button Taps
  challengeBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handleButtonTap(e);
  });

  confirmBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleConfirm();
  });

  resetTapsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleResetTaps();
  });

  // Modal Buttons
  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', startGame);
  playAgainBtn.addEventListener('click', startGame);

  helpBtn.addEventListener('click', () => {
    tutorialModal.classList.remove('hidden');
  });

  closeTutorialBtn.addEventListener('click', () => {
    tutorialModal.classList.add('hidden');
  });

  // Sound Toggle
  function updateMuteButtonUI() {
    const isMuted = window.soundFx.isMuted();
    muteBtn.innerHTML = isMuted ? '🔇' : '🔊';
    muteBtn.title = isMuted ? 'Unmute (M)' : 'Mute (M)';
  }

  muteBtn.addEventListener('click', () => {
    window.soundFx.toggleMute();
    updateMuteButtonUI();
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Space to tap button
    if (e.code === 'Space') {
      // Don't trigger if a button modal has focus
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
        document.activeElement.blur();
      }
      e.preventDefault();
      if (gameState === 'PLAYING') {
        handleButtonTap(null);
      } else if (gameState === 'START') {
        startGame();
      }
    }

    // Enter to confirm
    if (e.code === 'Enter') {
      e.preventDefault();
      if (gameState === 'PLAYING') {
        handleConfirm();
      } else if (gameState === 'FAIL' || gameState === 'SUCCESS') {
        startGame();
      }
    }

    // Backspace to reset current taps
    if (e.code === 'Backspace') {
      e.preventDefault();
      handleResetTaps();
    }

    // R to restart anytime
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      startGame();
    }

    // M to toggle mute
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      window.soundFx.toggleMute();
      updateMuteButtonUI();
    }

    // Escape to close tutorial
    if (e.code === 'Escape') {
      if (!tutorialModal.classList.contains('hidden')) {
        tutorialModal.classList.add('hidden');
      }
    }
  });

  // Init SVG Ring attributes
  ringProgress.style.strokeDasharray = RING_CIRCUMFERENCE;
  ringProgress.style.strokeDashoffset = 0;

  // Initialize Mute UI
  updateMuteButtonUI();
})();
