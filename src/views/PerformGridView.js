export class PerformGridView {
    constructor(containerEl, countLabelEl) {
      this.containerEl = containerEl;
      this.countLabelEl = countLabelEl;
    }
  
    render(palette, activeChord, callbacks) {
      this.countLabelEl.textContent = `Song Palette (${palette.length} Chords)`;
      this.containerEl.innerHTML = '';
  
      palette.forEach((chord) => {
        const isSelected = activeChord === chord;
        const btn = document.createElement('button');
  
        let style = 'bg-[#f4ebd8] text-[#422912] border-[#c2b293] hover:bg-[#fff9ed]';
        if (chord.includes('Min')) {
          style = 'bg-[#c5d8e1] text-[#1e323d] border-[#9cb7c4] hover:bg-[#d8e7ef]';
        } else if (chord.includes('7th')) {
          style = 'bg-[#e8c8c8] text-[#4a1c1c] border-[#d19b9b] hover:bg-[#f5d8d8]';
        }
  
        const activeStyle = isSelected
          ? 'bg-[#e08b1f] !text-white border-[#b0670d] shadow-[inset_0_3px_5px_rgba(0,0,0,0.3)] translate-y-0.5'
          : 'shadow-[0_4px_0_rgba(0,0,0,0.15)] border';
  
        btn.className = `py-6 px-2 rounded-xl text-base font-black transition-all active:scale-95 touch-none flex flex-col items-center justify-center ${style} ${activeStyle}`;
        btn.innerHTML = `<span>${chord}</span>`;
  
        // Event bindings
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          callbacks.onPressChord(chord);
        });
  
        const stop = () => callbacks.onReleaseChord();
        btn.addEventListener('pointerup', stop);
        btn.addEventListener('pointerleave', stop);
  
        this.containerEl.appendChild(btn);
      });
    }
  }