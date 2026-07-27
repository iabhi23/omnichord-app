export class BuilderModalView {
    constructor(modalEl, gridEl) {
      this.modalEl = modalEl;
      this.gridEl = gridEl;
    }
  
    show() {
      this.modalEl.classList.remove('hidden');
    }
  
    hide() {
      this.modalEl.classList.add('hidden');
    }
  
    render(allChords, palette, onToggleChord) {
      this.gridEl.innerHTML = '';
  
      allChords.forEach((chord) => {
        const inPalette = palette.includes(chord);
        const btn = document.createElement('button');
  
        let style = 'bg-[#f4ebd8] text-[#422912] border-[#c2b293]';
        if (chord.includes('Min')) {
          style = 'bg-[#c5d8e1] text-[#1e323d] border-[#9cb7c4]';
        } else if (chord.includes('7th')) {
          style = 'bg-[#e8c8c8] text-[#4a1c1c] border-[#d19b9b]';
        }
  
        btn.className = `py-3 px-1 rounded-lg text-xs font-black transition-all border relative ${style} ${
          inPalette ? 'ring-2 ring-[#e08b1f] ring-offset-2 scale-105 shadow-md' : 'opacity-50 hover:opacity-80'
        }`;
        btn.innerHTML = `${chord} ${inPalette ? '<span class="ml-1 text-[#e08b1f]">✓</span>' : ''}`;
  
        btn.addEventListener('click', () => onToggleChord(chord));
  
        this.gridEl.appendChild(btn);
      });
    }
  }