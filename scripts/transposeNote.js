// Level 1 = Convert tree to scales
// (e.g. C E G B => C E G = [[0, 4, 7, 11], [0, 4, 7])
// Level 2 = Autobind note to tree
// Level 3 = Transpose note with pose

var pitchClasses = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  "E#": 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

// Convert a pitch class string ("C#") to a MIDInumber (1)
function convertPitchClassToNumber(pitchClass) {
  var value = pitchClasses[pitchClass];
  if (value === undefined) return -1;
  return value;
}

// Convert a MIDI number (60) to a pitch class string ("C")
function convertNumberToPitchClass(pitchClass) {
  for (var i = 0; i < Object.keys(pitchClasses).length; i++) {
    var key = Object.keys(pitchClasses)[i];
    if (pitchClasses[key] === pitchClass) {
      return key;
    }
  }
}

// Return a boolean indicating if a scale is an array of numbers
function guardScale(scale) {
  if (!Array.isArray(scale)) return false;
  for (let i = 0; i < scale.length; i++) {
    var note = scale[i];
    if (typeof note !== "number") return false;
  }
  return true;
}

// Check that all scales (arrays of numbers) are not larger than the largest size
function guardScales(scales) {
  var maxSize = Infinity;
  var totalCollection = [];
  var length = scales.length;
  for (let i = 0; i < length; i++) {
    var scale = scales[i];
    var scaleLength = scale.length;
    if (!guardScale(scale)) {
      return false; // Invalid scale found
    }
    // On the first scale, just add all notes to the collection
    if (i === 0) {
      for (var j = 0; j < scaleLength; j++) {
        var note = scale[j];
        totalCollection.push(note);
      }
      maxSize = scaleLength;
    } else {
      // Check that the scale is not larger than the parent
      if (scaleLength > maxSize) {
        return false; // Larger scale found
      }

      // Make sure each note is present in the parent
      for (var j = 0; j < scaleLength; j++) {
        var found = false;
        for (var k = 0; k < totalCollection.length; k++) {
          if (totalCollection[k] % 12 === scale[j] % 12) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }

      // Update the max size of the scale
      maxSize = scaleLength;
    }
  }
  return true;
}

// Function to convert a tree string of any size to an array of scales using regex
// A tree is a list of scales separated by arrows ("=>")
// A scale is a list of pitch classes separated by commas or spaces
// Example input 1: "C, D, E, F"
// Example output 1: [[0, 2, 4, 5]]
// Example input 2: "C, E, G, B => C E G"
// Example output 2: [[0, 4, 7, 11], [0, 4, 7]]
function convertTreeToMidiNotes(input) {
  if (!input.length) return [];

  // Split the input into scales using the arrow "=>" as a delimiter
  var scales = input.split("=>").map((scale) => scale.trim());

  // Map each scale to an array of pitch class numbers
  var notes = scales.map((scale) => {
    // Split the scale by commas or spaces and convert each pitch class to a number
    return scale
      .split(/[, ]+/)
      .map((note) => convertPitchClassToNumber(note.trim()));
  });

  return notes;
}

var treeString = "C E G B => C E G";
var notes = convertTreeToMidiNotes(treeString);
var guard = guardScales(notes);
console.log("--- Notes ---");
console.log(notes);
console.log("--- Tree? ---");
console.log(guard);

// Convert MIDI notes to scale notes
function convertMidiNotesToScaleNotes(scales) {}

// Function to transpose a MIDI note based on the current tree and pose
function transposeNote(midi, treeString, poseString) {}
