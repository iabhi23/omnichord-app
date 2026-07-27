const CHORD_DATA = {};

// Base notes and standard intervals (in semitones)
const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ALIASES = { 'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#' };

const QUALITIES = {
  '': [0, 4, 7],           // Major
  'm': [0, 3, 7],          // Minor
  '7': [0, 4, 7, 10],      // Dominant 7th
  'M7': [0, 4, 7, 11],     // Major 7th
  'm7': [0, 3, 7, 10],     // Minor 7th
  'aug': [0, 4, 8],        // Augmented
  'dim': [0, 3, 6, 9]      // Diminished
};

// The 12 columns of the OM-84 in traditional Circle of Fifths layout
const COLUMNS = ['Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#'];

// Dynamically generate all 84 chords
COLUMNS.forEach(root => {
  // Convert flat aliases to sharp equivalents for math calculation
  const sharpRoot = ALIASES[root] || root;
  const rootIndex = ALL_NOTES.indexOf(sharpRoot);

  Object.keys(QUALITIES).forEach(quality => {
    const chordName = root + quality;
    const intervals = QUALITIES[quality];
    const notes = [];
    
    let currentOctave = 3; 
    let noteCounter = 0;

    // Generate exactly 12 notes to fill the strumplate strings
    while (notes.length < 12) {
      const interval = intervals[noteCounter % intervals.length];
      const absoluteSemitones = rootIndex + interval;
      
      const noteName = ALL_NOTES[absoluteSemitones % 12];
      
      // Calculate octave shifts as we step through intervals
      const octaveShift = Math.floor(absoluteSemitones / 12) + Math.floor(noteCounter / intervals.length);
      
      notes.push(`${noteName}${currentOctave + octaveShift}`);
      noteCounter++;
    }
    
    CHORD_DATA[chordName] = notes;
  });
});

export { CHORD_DATA };