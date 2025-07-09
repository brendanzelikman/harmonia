import readline from "readline";

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function newLine() {
  console.log("");
}
function clear() {
  console.clear();
}
function header() {
  console.log("========================");
  console.log("===== Harmonia API =====");
  console.log("========================");
  newLine();
}
var tree = [];
var treeInput = "N/A";
function printTree() {
  if (!tree.length) {
    return "N/A";
  } else {
    return tree
      .map((scale, i) => {
        var label = convertNumberToLetter(i);
        var data = JSON.stringify(scale);
        return data + " (" + label + ")";
      })
      .join(" => ");
  }
}
var TREE_COMMAND = "tree";
var PATTERN_COMMAND = "pattern";
var POSE_COMMAND = "pose";
function loadScreen() {
  clear();
  header();
  console.log("Tree: " + printTree());
  console.log("Pattern: N/A");
  console.log("Pose: N/A");
  newLine();
  console.log("Commands:");
  newLine();
  console.log(TREE_COMMAND + " - Input a tree of scales");
  console.log(PATTERN_COMMAND + " - Input a pattern of notes");
  console.log(POSE_COMMAND + " - Input a transposition");
  newLine();
  prompt();
}
function prompt() {
  rl.question("What would you like to do? ", (input) => {
    if (input === TREE_COMMAND) {
      promptTree();
    } else if (input === PATTERN_COMMAND) {
      promptPattern();
    } else if (input === POSE_COMMAND) {
      promptPose();
    } else {
      loadScreen();
    }
  });
}
function promptTree() {
  console.clear();
  header();
  console.log(`A scale is a list of notes separated by commas or spaces.`);
  newLine();
  console.log(`  Example Scale: C, D, E, F, G, A, B`);
  newLine();
  console.log(`A tree is a list of scales separated by arrows ("=>").`);
  newLine();
  console.log(`  Example Tree: C, E, G, B => C E G`);
  newLine();
  rl.question("Please enter a tree: ", (input) => {
    var notes = convertInputToMidiTree(input);
    var guard = guardScales(notes);
    if (guard) {
      var scaleTree = convertMidiTreeToScaleTree(notes);
      tree = scaleTree;
      treeInput = input;
    }
    loadScreen();
  });
}
function promptPattern() {
  console.clear();
  console.log("Input a pattern!");
  rl.question("", (pattern) => {
    loadScreen();
  });
}
function promptPose() {
  console.clear();
  console.log("Input a pose!");
  rl.question("", (pose) => {
    loadScreen();
  });
}
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
// Convert an upper case letter to a number starting from 0
function convertLetterToNumber(letter) {
  if (letter.length !== 1) return -1;
  var charCode = letter.toUpperCase().charCodeAt(0);
  if (charCode < 65 || charCode > 90) return -1;
  return charCode - 65;
}
// Convert a number (0-25) to an upper case letter
function convertNumberToLetter(number) {
  if (number < 0 || number > 25) return "";
  return String.fromCharCode(number + 65);
}
// Convert a pitch class string ("C#") to a MIDInumber (1)
function convertPitchClassToNumber(pitchClass) {
  var value = pitchClasses[pitchClass];
  if (value === undefined) return -1;
  return value;
}
// Convert a MIDI number (60) to a pitch class string ("C")
function convertNumberToPitchClass(number) {
  for (var i = 0; i < Object.keys(pitchClasses).length; i++) {
    var key = Object.keys(pitchClasses)[i];
    if (pitchClasses[key] === number % 12) {
      return key;
    }
  }
}
// Return a boolean indicating if a scale is an array of numbers
function guardScale(scale) {
  if (!Array.isArray(scale)) return false;
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
function convertInputToMidiTree(input) {
  if (!input.length) return [];
  // Split the input into scales using the arrow "=>" as a delimiter
  var scales = input.split("=>").map((scale) => scale.trim());
  // Map each scale to an array of pitch class numbers
  var notes = scales.map((scale) => {
    var scaleNotes = scale.split(/[, ]+/);
    var tonic = convertPitchClassToNumber(scaleNotes[0]);
    return scaleNotes.map((note) => {
      var number = convertPitchClassToNumber(note);
      if (number < tonic) {
        number += 12;
      }
      return number;
    });
  });
  return notes;
}
// Convert MIDI notes to scale notes
function convertMidiTreeToScaleTree(tree) {
  var scaleTree = [];
  var size = tree.length;
  for (let i = size - 1; i >= 0; i--) {
    var scale = tree[i];
    var parent = i > 0 ? tree[i - 1] : null;
    if (!parent) {
      scaleTree.unshift(scale);
    } else {
      var scaleNotes = [];
      // Add the notes as scale degrees
      for (let j = 0; j < scale.length; j++) {
        var note = scale[j];
        // Find the index of the note in the parent scale
        var index = parent.indexOf(note % 12);
        if (index !== -1) {
          scaleNotes.push({ degree: index });
        }
      }
      scaleTree.unshift(scaleNotes);
    }
  }
  return scaleTree;
}
// Function to transpose a MIDI note based on the current tree and pose
function transposeNote(midi, treeString, poseString) {}
loadScreen();
