import { CHORD_DATA } from '../models/chordData';
import { audioModel } from '../models/AudioModel';

export class OmniController {
  constructor(performView, strumplateView, builderView, audioBtnEl) {
    this.performView = performView;
    this.strumplateView = strumplateView;
    this.builderView = builderView;
    this.audioBtnEl = audioBtnEl;

    // State
    this.palette = ['C Maj', 'A Min', 'F Maj', 'G 7th'];
    this.activeChord = 'C Maj';
    this.isAudioActive = false;
    this.isStrumming = false;

    this.initGlobalListeners();
  }

  async ensureAudio() {
    if (!this.isAudioActive) {
      await audioModel.init();
      this.isAudioActive = true;
      this.audioBtnEl.textContent = '● Sound Engine Active';
      this.audioBtnEl.className = 'text-xs px-3.5 py-1.5 rounded-full font-bold transition-all bg-emerald-500/10 text-emerald-700 border border-emerald-500/30';
    }
  }

  initGlobalListeners() {
    window.addEventListener('pointerup', () => {
      this.isStrumming = false;
    });
  }

  updateViews() {
    this.performView.render(this.palette, this.activeChord, {
      onPressChord: async (chord) => {
        await this.ensureAudio();
        this.activeChord = chord;
        audioModel.startChordDrone(chord);
        this.updateViews();
      },
      onReleaseChord: () => {
        audioModel.stopChordDrone();
      },
    });

    const currentNotes = audioModel.getChordNotes(this.activeChord);
    this.strumplateView.render(currentNotes, this.isStrumming, {
      onNoteHover: (index) => audioModel.playStrumNote(this.activeChord, index),
      onNoteTap: async (index) => {
        await this.ensureAudio();
        this.isStrumming = true;
        audioModel.playStrumNote(this.activeChord, index);
      },
    });

    this.builderView.render(Object.keys(CHORD_DATA), this.palette, (chord) => {
      if (this.palette.includes(chord)) {
        if (this.palette.length > 1) {
          this.palette = this.palette.filter((c) => c !== chord);
        }
      } else {
        this.palette.push(chord);
      }
      this.updateViews();
    });
  }

  openBuilder() {
    this.builderView.show();
  }

  closeBuilder() {
    this.builderView.hide();
  }
}