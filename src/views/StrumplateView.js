export class StrumplateView {
    constructor(containerEl) {
      this.containerEl = containerEl;
    }
  
    render(notes, isStrumming, callbacks) {
      this.containerEl.innerHTML = '';
  
      notes.forEach((_, index) => {
        const strip = document.createElement('div');
        strip.className = 'flex-1 bg-white/20 hover:bg-white/60 active:bg-white rounded-sm transition-colors duration-75 border-b border-white/10 last:border-0';
  
        strip.addEventListener('pointerenter', () => {
          if (isStrumming) callbacks.onNoteHover(index);
        });
  
        strip.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          callbacks.onNoteTap(index);
        });
  
        this.containerEl.appendChild(strip);
      });
    }
  }