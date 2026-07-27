import './style.css';
import { audioModel } from './models/AudioModel.js';

// Application State
let activeChord = null;
let isStrumming = false;
let lastStrummedIndex = null;
let customPalette = new Set(); // Stores our selected chords

// Unlock audio context cleanly on first interaction
const unlockAudio = async () => {
  await audioModel.ensureContextActive();
  document.removeEventListener('pointerdown', unlockAudio);
};
document.addEventListener('pointerdown', unlockAudio);

// DOM Elements
const setupView = document.getElementById('setup-view');
const playView = document.getElementById('play-view');
const btnBuild = document.getElementById('btn-build');
const btnFull = document.getElementById('btn-full');
const btnEdit = document.getElementById('btn-edit');
const setupMatrix = document.getElementById('setup-matrix');
const playMatrix = document.getElementById('play-matrix');
const appInstructions = document.getElementById('app-instructions');

// --- 1. CONFIGURATION MODE LOGIC (Selecting Chords) ---
const setupButtons = setupMatrix.querySelectorAll('.chord-button');

setupButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const chordName = btn.dataset.chord;

    if (customPalette.has(chordName)) {
      customPalette.delete(chordName);
      btn.classList.remove('selected-for-palette');
    } else {
      customPalette.add(chordName);
      btn.classList.add('selected-for-palette');
    }
    
    // Enable "Play Selected Palette" button only if at least 1 chord is selected
    btnBuild.disabled = customPalette.size === 0; 
  });
});

// --- 2. TRANSITION: SETUP -> PLAY CUSTOM PALETTE ---
btnBuild.addEventListener('click', () => {
  if (customPalette.size === 0) return;

  setupView.classList.add('hidden');
  playView.classList.remove('hidden');
  appInstructions.textContent = "Custom Palette Active. Tap a chord to latch, swipe to play.";

  playMatrix.innerHTML = '';

  // Generate buttons only for the selected chords
  customPalette.forEach(chordName => {
    const originalBtn = document.querySelector(`#setup-matrix .chord-button[data-chord="${chordName}"]`);
    
    const newBtn = document.createElement('button');
    newBtn.className = 'chord-button play-button';
    newBtn.dataset.chord = chordName;
    newBtn.textContent = originalBtn ? originalBtn.textContent : chordName;
    
    playMatrix.appendChild(newBtn);
  });

  attachPlayListeners();
});

// --- 3. TRANSITION: FULL OMNICHORD INSTANTLY ---
btnFull.addEventListener('click', () => {
  customPalette.clear();
  setupButtons.forEach(btn => {
    customPalette.add(btn.dataset.chord);
  });

  setupView.classList.add('hidden');
  playView.classList.remove('hidden');
  appInstructions.textContent = "Full Omnichord Active. Tap a chord to latch, swipe to play.";

  playMatrix.innerHTML = '';

  // Populate play matrix with all 84 chords
  customPalette.forEach(chordName => {
    const originalBtn = document.querySelector(`#setup-matrix .chord-button[data-chord="${chordName}"]`);
    
    const newBtn = document.createElement('button');
    newBtn.className = 'chord-button play-button';
    newBtn.dataset.chord = chordName;
    newBtn.textContent = originalBtn ? originalBtn.textContent : chordName;
    
    playMatrix.appendChild(newBtn);
  });

  attachPlayListeners();
});

// --- 4. TRANSITION: PLAY -> SETUP (Edit Palette) ---
btnEdit.addEventListener('click', () => {
  audioModel.stopChordDrone();
  activeChord = null;
  
  playView.classList.add('hidden');
  setupView.classList.remove('hidden');
  appInstructions.textContent = "Select your chords to build a custom palette, or play instantly.";
});

// --- 5. PLAYING LOGIC ---
function attachPlayListeners() {
  const playButtons = playMatrix.querySelectorAll('.chord-button');
  
  playButtons.forEach(button => {
    button.addEventListener('pointerdown', async (e) => {
      e.preventDefault();
      await audioModel.ensureContextActive();
      
      const chordName = button.dataset.chord;

      if (activeChord === chordName) {
        audioModel.stopChordDrone();
        button.classList.remove('active');
        activeChord = null;
      } else {
        audioModel.stopChordDrone();
        playButtons.forEach(btn => btn.classList.remove('active'));
        audioModel.startChordDrone(chordName);
        button.classList.add('active');
        activeChord = chordName;
      }
    });
  });
}

// --- 6. STRUMPLATE LOGIC ---
const strumplate = document.querySelector('.strumplate');

strumplate.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  isStrumming = true;
  handleStrum(e);
});

window.addEventListener('pointerup', () => {
  isStrumming = false;
  lastStrummedIndex = null;
});

strumplate.addEventListener('pointermove', (e) => {
  if (!isStrumming) return;
  e.preventDefault();
  handleStrum(e);
});

function handleStrum(e) {
  if (!activeChord) return;

  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  if (!clientX || !clientY) return;

  const elementAtPointer = document.elementFromPoint(clientX, clientY);
  
  if (elementAtPointer && elementAtPointer.classList.contains('strum-string')) {
    const noteIndex = elementAtPointer.dataset.index;

    if (noteIndex !== lastStrummedIndex) {
      audioModel.playStrumNote(activeChord, noteIndex);
      lastStrummedIndex = noteIndex;

      elementAtPointer.classList.add('playing');
      setTimeout(() => elementAtPointer.classList.remove('playing'), 150);
    }
  }
}
// --- THEME TOGGLE LOGIC ---
const btnThemeToggle = document.getElementById('btn-theme-toggle');

btnThemeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'light') {
    document.documentElement.removeAttribute('data-theme');
    btnThemeToggle.textContent = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    btnThemeToggle.textContent = '☀️';
  }
});