import { CHORD_DATA } from './chordData';

export class AudioModel {
  constructor() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    this.isReady = false;

    this.activeDroneNodes = [];
    this.activeDroneGain = null;
    this.activeLFOs = [];
  }

  async init() {
    if (this.isReady) return;
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);
    
    this.isReady = true;
  }

  async ensureContextActive() {
    if (!this.isReady) await this.init();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  // --- STEADY CHORD DRONE ---
  async startChordDrone(chordName) {
    await this.ensureContextActive();
    this.stopChordDrone();

    const notes = CHORD_DATA[chordName];
    if (!notes) return;

    const now = this.audioCtx.currentTime + 0.01;
    
    const droneGain = this.audioCtx.createGain();
    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.12, now + 0.06);
    droneGain.connect(this.masterGain);

    this.activeDroneNodes = [];
    this.activeLFOs = [];

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    // Opened up to 2400Hz to accommodate the higher octave
    filter.frequency.setValueAtTime(2400, now);
    filter.connect(droneGain);

    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(5.0, now);
    lfoGain.gain.setValueAtTime(4.0, now); 
    lfo.connect(lfoGain);
    lfo.start(now);
    this.activeLFOs.push(lfo);

    notes.slice(0, 3).forEach((noteName) => {
      // SHIFT UP ONE OCTAVE (* 2)
      const freq = this.noteToFreq(noteName) * 2; 

      const osc1 = this.audioCtx.createOscillator();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(freq, now);
      lfoGain.connect(osc1.detune); 

      const osc2 = this.audioCtx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 0.5, now);
      lfoGain.connect(osc2.detune);

      osc1.connect(filter);
      osc2.connect(filter);

      osc1.start(now);
      osc2.start(now);

      this.activeDroneNodes.push(osc1, osc2);
    });

    this.activeDroneGain = droneGain;
  }

  stopChordDrone() {
    if (!this.activeDroneGain) return;

    const now = this.audioCtx.currentTime;
    const fadeOut = 0.12;

    this.activeDroneGain.gain.cancelScheduledValues(now);
    this.activeDroneGain.gain.setValueAtTime(this.activeDroneGain.gain.value, now);
    this.activeDroneGain.gain.linearRampToValueAtTime(0, now + fadeOut);

    const nodesToStop = [...this.activeDroneNodes, ...this.activeLFOs];
    
    nodesToStop.forEach((node) => {
      try { node.stop(now + fadeOut + 0.02); } catch (e) {}
    });

    this.activeDroneNodes = [];
    this.activeLFOs = [];
    this.activeDroneGain = null;
  }

  // --- STRUMPLATE ---
  async playStrumNote(chordName, noteIndex) {
    await this.ensureContextActive();

    const notes = CHORD_DATA[chordName];
    if (!notes || !notes[noteIndex]) return;

    // SHIFT UP ONE OCTAVE (* 2)
    const freq = this.noteToFreq(notes[noteIndex]) * 2; 
    const now = this.audioCtx.currentTime + 0.005;
    const duration = 1.2;

    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    osc1.type = 'square';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 0.5, now);

    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(5.0, now);
    lfoGain.gain.setValueAtTime(3.0, now);
    lfo.connect(lfoGain);
    
    lfoGain.connect(osc1.detune);
    lfoGain.connect(osc2.detune);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    // Opened up to 2800Hz for sparkly harp plucks
    filter.frequency.setValueAtTime(2800, now);

    const noteGain = this.audioCtx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.25, now + 0.008);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    lfo.start(now);
    osc1.start(now);
    osc2.start(now);

    lfo.stop(now + duration + 0.05);
    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  getChordNotes(chordName) {
    return CHORD_DATA[chordName] || [];
  }

  noteToFreq(note) {
    const notesMap = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
    const match = note.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) return 440;

    const pitch = match[1];
    const octave = parseInt(match[2], 10);
    const semitonesFromC4 = notesMap[pitch] + (octave - 4) * 12;

    return 440 * Math.pow(2, (semitonesFromC4 - 9) / 12);
  }
}

export const audioModel = new AudioModel();