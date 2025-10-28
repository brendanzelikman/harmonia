import QtQuick 2.2
import QtQuick.Controls 2.15
import QtQuick.Layouts 2.15

import MuseScore 3.0
import Muse.UiComponents 1.0

// Adapted from Mirror Intervals plugin
MuseScore {
    menuPath: "Harmonia Plugin";
    title: "Harmonia"
    description: "Transposes a selection of notes using a family of scales"
    pluginType: "dialog"
    categoryCode: "composing-arranging-tools"

    width: 600
    height:400

    onRun: {
        if (!curScore) {
            error("No score open.\nThis plugin requires an open score to run.\n")
            quit()
        }
        if (curScore.metaTag("scales")){
            inputScales(curScore.metaTag("scales"));
        }
        if (curScore.metaTag("pose")){
            inputPose(curScore.metaTag("pose"));
        }
        if (curScore.metaTag("multiplier")){
            inputMultiplier(curScore.metaTag("multiplier"));
        }
        if (curScore.metaTag("counter")){
            inputCounter(curScore.metaTag("counter"));
        }
        initializeKeys();
    }


    property var scaleMap: {

        // basic scales
        "chromatic": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        "chromatic scale": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        "major": [0, 2, 4, 5, 7, 9, 11],
        "major scale": [0, 2, 4, 5, 7, 9, 11],
        "minor": [0, 2, 3, 5, 7, 8, 10],
        "minor scale": [0, 2, 3, 5, 7, 8, 10],
        "harmonic minor": [0, 2, 3, 5, 7, 8, 11],
        "melodic minor": [0, 2, 3, 5, 7, 9, 11],
        "blues": [0, 3, 5, 6, 7, 10],

        // modes
        "lydian": [0, 2, 4, 6, 7, 9, 11],
        "ionian": [0, 2, 4, 5, 7, 9, 11],
        "mixolydian": [0, 2, 4, 5, 7, 9, 10],
        "dorian": [0, 2, 3, 5, 7, 9, 10],
        "aeolian": [0, 2, 3, 5, 7, 8, 10],
        "phrygian": [0, 1, 3, 5, 7, 8, 10],
        "locrian": [0, 1, 3, 5, 6, 8, 10],

        // pentatonic
        "pentatonic": [0, 2, 4, 7, 9],
        "major pentatonic": [0, 2, 4, 7, 9],
        "minor pentatonic": [0, 3, 5, 7, 10],
        "mixolydian pentatonic": [0, 4, 5, 7, 10],
        "ryukyu": [0, 4, 5, 7, 11],
        "in": [0, 1, 5, 7, 8],
        "yo": [0, 2, 5, 7, 8],
        "insen": [0, 1, 5, 7, 10],
        "hirajoshi": [0, 2, 3, 7, 8],
        "iwato": [0, 1, 5, 6, 10],

        // octatonic
        "bebop major": [0, 2, 4, 5, 7, 8, 9, 11],
        "bebop minor": [0, 2, 3, 4, 5, 7, 9, 10],
        "bebop harmonic minor": [0, 2, 3, 5, 7, 8, 10, 11],
        "bebop melodic minor": [0, 2, 3, 5, 7, 8, 9, 11],
        "bebop dominant": [0, 2, 4, 5, 7, 9, 10, 11],
        "whole-half": [0, 2, 3, 5, 6, 8, 9, 11],
        "half-whole": [0, 1, 3, 4, 6, 7, 9, 10],
        
        // triads
        "maj": [0, 4, 7],
        "major chord": [0, 4, 7],
        "min": [0, 3, 7],
        "minor chord": [0, 3, 7],
        "dim": [0, 3, 6],
        "o": [0, 3, 6],
        "aug": [0, 4, 8],
        "+": [0, 4, 8],
        "sus2": [0, 2, 7],
        "sus4": [0, 5, 7],

        // sixths
        "6": [0, 4, 7, 9],
        "maj6": [0, 4, 7, 9],
        "min6": [0, 3, 7, 9],
        "minb6": [0, 3, 7, 8],

        // sevenths
        "dim7": [0, 3, 6, 9],
        "o7": [0, 3, 6, 9],
        "aug7": [0, 4, 8, 10],
        "+7": [0, 4, 8, 10],
        "m7b5": [0, 3, 6, 10],
        "half-diminished": [0, 3, 6, 10],
        "half diminished": [0, 3, 6, 10],

        // major extensions
        "maj7": [0, 4, 7, 11],
        "maj9": [0, 2, 4, 7, 11],
        "maj11": [0, 2, 4, 5, 7, 11],
        "maj#11": [0, 2, 4, 6, 7, 11],
        "maj13": [0, 2, 4, 5, 7, 9, 11],
        "maj13#11": [0, 2, 4, 6, 7, 9, 11],

        // minor extensions
        "min7": [0, 3, 7, 10],
        "min9": [0, 2, 3, 7, 10],
        "min11": [0, 2, 3, 5, 7, 10],
        "min13": [0, 2, 3, 5, 7, 8, 10],

        // dominant extensions
        "7": [0, 4, 7, 10],
        "9": [0, 2, 4, 7, 10],
        "b9": [0, 1, 4, 7, 10],
        "#9": [0, 3, 4, 7, 10],
        "11": [0, 2, 4, 5, 7, 10],
        "13": [0, 2, 4, 5, 7, 9, 10]
    }

    function getCanonicalScale(notes){
        return notes.map((n) => mod(n, 12)).join(",");
    }
    
    property var chromaticKey: ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"];

    property var cMajorKey: ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    property var dFlatMajorKey: ["C","Db","Eb","E","F","Gb","G","Ab","A","Bb","Cb"];
    property var dMajorKey: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    property var eFlatMajorKey: ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    property var eMajorKey: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    property var fMajorKey: ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"];
    property var fSharpMajorKey: ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"];
    property var gMajorKey: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    property var aFlatMajorKey: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
    property var aMajorKey: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    property var bFlatMajorKey: ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    property var bMajorKey: ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"];
    property var majorKeys: [
        cMajorKey,
        dFlatMajorKey,
        dMajorKey,
        eFlatMajorKey,
        eMajorKey,
        fMajorKey,
        fSharpMajorKey,
        gMajorKey,
        aFlatMajorKey,
        aMajorKey,
        bFlatMajorKey,
        bMajorKey
    ];

    property var cMinorKey: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
    property var cSharpMinorKey: ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"];
    property var dMinorKey: ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"];
    property var eFlatMinorKey: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"];
    property var eMinorKey: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    property var fMinorKey: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
    property var fSharpMinorKey: ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"];
    property var gMinorKey: ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    property var gSharpMinorKey: ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"];
    property var aMinorKey: ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"];
    property var bFlatMinorKey: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"];
    property var bMinorKey: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    property var minorKeys: [
        cMinorKey,
        cSharpMinorKey,
        dMinorKey,
        eFlatMinorKey,
        eMinorKey,
        fMinorKey,
        fSharpMinorKey,
        gMinorKey,
        gSharpMinorKey,
        aMinorKey,
        bFlatMinorKey,
        bMinorKey
    ];
    
    property var pitchClassNeighbors: {
        "C": ["Cb", "C#"],
        "D": ["Db", "D#"],
        "E": ["Eb", "E#"],
        "F": ["Fb", "F#"],
        "G": ["Gb", "G#"],
        "A": ["Ab", "A#"],
        "B": ["Bb", "B#"],
        "C#": ["C", "C##"],
        "D#": ["D", "D##"],
        "E#": ["E", "E##"],
        "F#": ["F", "F##"],
        "G#": ["G", "G##"],
        "A#": ["A", "A##"],
        "B#": ["B", "B##"],
        "Cb": ["Cbb", "C"],
        "Db": ["Dbb", "D"],
        "Eb": ["Ebb", "E"],
        "Fb": ["Fbb", "F"],
        "Gb": ["Gbb", "G"],
        "Ab": ["Abb", "A"],
        "Bb": ["Bbb", "B"],
        "C##": ["C#", "D#"],
        "D##": ["D#", "E#"],
        "E##": ["E#", "F##"],
        "F##": ["F#", "G#"],
        "G##": ["G#", "A#"],
        "A##": ["A#", "B#"],
        "B##": ["B#", "C##"],
        "Cbb": ["Bbb", "Cb"],
        "Db": ["Cb", "Db"],
        "Ebb": ["Db", "Eb"],
        "Fbb": ["Ebb", "Fb"],
        "Gbb": ["Fb", "Gb"],
        "Abb": ["Gb", "Ab"],
        "Bbb": ["Ab", "Bb"],
    };
    function getPitchClassUpperNeighbor(pc){
        var neighbors = pitchClassNeighbors[pc];
        if (!neighbors) return pc;
        return neighbors[1];
    }
    function getPitchClassLowerNeighbor(pc){
        var neighbors = pitchClassNeighbors[pc];
        if (!neighbors) return pc;
        return neighbors[0];
    }

    function createScalesInAllKeys(scaleId){
        var scale = scaleMap[scaleId];
        if (!scale) return new Array(12).fill([]);
        return new Array(12).fill(0).map((_,i) => scale.map((pc) => pc + i));
    }
    function alterKey(key, steps, ...degrees){
        var alteredKey = key.slice();
        for (var i = 0; i < degrees.length; i++){
            var degree = degrees[i];
            var newKey = key.slice();
            var lastStep = mod(degree - steps, 12);
            var lastKey = key[lastStep];
            var thisStep = mod(degree, 12);
            newKey[thisStep] = steps > 0
            ? getPitchClassUpperNeighbor(lastKey)
            : getPitchClassLowerNeighbor(lastKey);
            alteredKey = newKey;
        }
        return alteredKey;
    }
    function raiseKeys(keys, ...degrees){
        return keys.map((key, i) => alterKey(key, 1, ...degrees.map((d) => d + i)));
    }
    function lowerKeys(keys, ...degrees){
        return keys.map((key, i) => alterKey(key, -1, ...degrees.map((d) => d + i)));
    }

    property var majorKey: [createScalesInAllKeys("major"), majorKeys];
    property var minorKey: [createScalesInAllKeys("minor"), minorKeys];
    property var lydianKey: [createScalesInAllKeys("lydian"), raiseKeys(majorKeys, 6)];
    property var mixolydianKey: [createScalesInAllKeys("mixolydian"), majorKeys];
    property var dorianKey: [createScalesInAllKeys("dorian"), raiseKeys(minorKeys, 8)];
    property var phrygianKey: [createScalesInAllKeys("phrygian"), lowerKeys(minorKeys, 1)];
    property var locrianKey: [createScalesInAllKeys("locrian"), lowerKeys(phrygianKey[1], 6)];
    property var scaleKeysets: [
        majorKey, 
        minorKey,
        lydianKey,
        mixolydianKey,
        dorianKey,
        phrygianKey,
        locrianKey
    ];

    property var scaleKeyMap: {};

    function getSelection() {
        var cursor = curScore.newCursor()
        cursor.rewind(1)
        if (!cursor.segment) {
            return null
        }
        var selection = {
            cursor: cursor,
            startTick: cursor.tick,
            endTick: null,
            startStaff: cursor.staffIdx,
            endStaff: null,
            startTrack: null,
            endTrack: null
        }
        cursor.rewind(2)
        selection.endStaff = cursor.staffIdx + 1
        if (cursor.tick === 0) {
            selection.endTick = curScore.lastSegment.tick + 1
        } else {
            selection.endTick = cursor.tick
        }
        selection.startTrack = selection.startStaff * 4
        selection.endTrack = selection.endStaff * 4
        return selection
    }
    function applyTransformation(){
        var selection = getSelection()
        if (!selection) {
            error("No selection made.\nPlease select some notes to transform.\n")
            quit();
        }
        curScore.startCmd()
        mapOverSelection(selection, filterNotes, transposeChord)
        curScore.endCmd()
    }
    function mapOverSelection(selection, filter, process) {
        selection.cursor.rewind(1)
        for (
            var segment = selection.cursor.segment;
            segment && segment.tick < selection.endTick;
            segment = segment.next
            ) {
            for (var track = selection.startTrack; track < selection.endTrack; track++) {
                var element = segment.elementAt(track)
                if (!element) continue;
                if (!filter(element)) continue;
                if (track == selection.startTrack && counter !== 0){ noteTotal++; }
                process(element, track);
            }
        }
        noteTotal = 0;
    }
    function filterNotes(element){
        return element.type === Element.CHORD
    }


    property var pose: {};
    property var multiplier: 1;
    property var counter: 0;
    property var noteTotal: 0;

    function inputCounter(text){
        var value = parseInt(text);
        if (isNaN(value)){
            counter = 0;
        } else {
            counter = value;
        }
        return counter;
    }

    function inputMultiplier(text){
        var value = parseFloat(text);
        if (isNaN(value)){
            multiplier = 1;
        } else {
            multiplier = value;
        }
        return multiplier;
    }

    function inputPose(text){
        var result = {};
        var trimmed = text.trim();
        var parts = trimmed.split("+");
        for (var i = 0; i < parts.length; i++){
            var part = parts[i].trim();
            if (part.length === 0) continue;

            // Get the first letter as the key
            var letter = part.charAt(0);

            // Get the number
            if (part.length === 1){
                result[letter] = 1;
            } else {
                var number = parseInt(part.substring(1).trim());
                if (isNaN(number)) continue;
                if (result[letter] === undefined){
                    result[letter] = number;
                } else {
                    result[letter] += number;
                }
            }
        }
        pose = result;
        return pose;
    }

    property var rootScale: [];

    function getScala(multiplier = 1){
        var result = {};
        var keys = Object.keys(pose);
        for (var i = 0; i < keys.length; i++){
            var key = keys[i];
            if (key === "t" || key === "y") continue;
            result[key] = pose[key] * multiplier;
        }
        return result;
    }
    function getChroma(multiplier = 1){
        var result = 0;
        if (pose["t"] !== undefined) result += pose["t"] * multiplier;
        if (pose["y"] !== undefined) result += pose["y"] * 12 * multiplier;
        return result;
    }

    function transposeChord(chord, track){
        for (var i = 0; i < chord.notes.length; i++){
            var note = chord.notes[i];
            if (scales.length === 0) continue;

            // Bind the MIDI note to the current scales
            var scaleNote = bindNote(note.pitch);

            // // Extract transpositions from the vector
            var mult = multiplier;
            if (counter !== 0){
                mult = multiplier * Math.ceil(noteTotal / counter);
            }
            var scala = getScala(mult);
            var chroma = getChroma(mult);

            // // Apply scalar transpositions to the note
            var newOffset = sumVectors(scaleNote.offset, scala);
            var posedNote = {id: scaleNote.id, degree: scaleNote.degree, offset: newOffset};
            var newNote = resolveNote(posedNote);
            newNote += chroma;

            // Update the note properties
            note.pitch = newNote;
            var key = getScaleKey(rootScale);
            note.tpc1 = getMidiTpc(newNote, key);
            note.tpc2 = getMidiTpc(newNote, key);
        }
    }

    function bindNote(midi){
        var size = scales.length;

        // Handle chromatic notes in no scale
        if (size === 0){
            var degree = midi % 12;
            var octave = getOctaveDistance(chromaticNotes[0], midi);
            var offset = {};
            if (octave !== 0) offset["y"] = octave;
            return {id: "t", degree, offset};
        }

        var midiChain = resolveScales();
        var tonicScale = midiChain.length ? midiChain[midiChain.length-1] : chromaticNotes;
        var tonicNote = tonicScale.length ? tonicScale[0] : chromaticNotes[0];
        var chromaticScale = createChromaticNotes(tonicNote);

        for (var i = size - 1; i >= 0; i--){
            var scale = midiChain[i];
            var scaleSize = scale.length;
            if (scaleSize === 0) continue;
            var id = scales[i].id;
            var degree = getDegree(midi, scale);
            
            // Check for an exact match with the current scale
            if (degree > -1){
                var octave = getOctaveDistance(scale[degree], midi);
                var offset = {};
                if (octave !== 0) offset["y"] = octave;
                return {id, degree, offset};
            }

            // Check parent scales for neighbors, preferring deep matches
            var parentIds = [];
            var parentScales = [];
            for (var j = i - 1; j >= 0; j--){
                parentIds.push(scales[j].id);
                parentScales.push(midiChain[j]);
            }
            parentIds.push("t");
            var parentCount = i;
            for (var j = 0; j < parentCount + 1; j++){
                var parentScale = chromaticScale;
                var parentId = "t";
                var parentSize = 12;
                if (j < parentCount){
                    parentId = parentIds[j];
                    parentScale = parentScales[j];
                    parentSize = parentScale.length;
                }
                var degree = getDegree(midi, parentScale);
                if (degree < 0) continue;

                // Check if the note can be lowered to fit the scale
                var lower = mod(degree - 1, parentSize);
                var lowerMidi = parentScale[lower];
                var lowerWrap = floor(degree - 1, parentSize);
                var lowerDegree = getDegree(lowerMidi, scale);

                // If the lowered note exists in the current scale,
                // add the note as an upper neighbor
                if (lowerDegree > -1){
                    var octave = getOctaveDistance(parentScale[degree], midi) + lowerWrap;
                    var offset = {};
                    if (octave !== 0) offset["y"] = octave;
                    offset[parentId] = 1;
                    return {id, degree: lowerDegree, offset};
                }

                // Check if the note can be raised to fit the scale
                var upper = mod(degree + 1, parentSize);
                var upperMidi = parentScale[upper];
                var upperWrap = floor(degree + 1, parentSize);
                var upperDegree = getDegree(upperMidi, scale);

                // If the raised note exists in the current scale,
                // add the note as a lower neighbor
                if (upperDegree > -1){
                    var octave = getOctaveDistance(parentScale[degree], midi) + upperWrap;
                    var offset = {};
                    if (octave !== 0) offset["y"] = octave;
                    offset[parentId] = -1;
                    return {id, degree: upperDegree, offset};
                }
            }
        }

        // If no match has been found, set as a neighbor of the tonic
        var dist = midi - tonicNote;
        var offset = {};
        if (dist !== 0) offset["t"] = dist;
        return {id: scales[size-1].id, degree: 0, offset};
    }

    property var tpcMap: {
        "Fbb": -1,
        "Cbb": 0,
        "Gbb": 1,
        "Dbb": 2,
        "Abb": 3,
        "Ebb": 4,
        "Bbb": 5,
        "Fb": 6,
        "Cb": 7,
        "Gb": 8,
        "Db": 9,
        "Ab": 10,
        "Eb": 11,
        "Bb": 12,
        "F": 13,
        "C": 14,
        "G": 15,
        "D": 16,
        "A": 17,
        "E": 18,
        "B": 19,
        "F#": 20,
        "C#": 21,
        "G#": 22,
        "D#": 23,
        "A#": 24,
        "E#": 25,
        "B#": 26,
        "F##": 27,
        "C##": 28,
        "G##": 29,
        "D##": 30,
        "A##": 31,
        "E##": 32,
        "B##": 33
    }

    function mod(a, b){
        return ((a % b) + b) % b;
    }
    function floor(a, b){
        return Math.floor(a / b);
    }
    function sumVectors(a,b){
        var result = {};
        for (var key in a){
            result[key] = a[key];
        }
        for (var key in b){
            if (key in result){
                result[key] += b[key];
            } else {
                result[key] = b[key];
            }
        }
        return result;
    }
    function numToLetter(num){
        var letterIndex = num % 26;
        if (letterIndex >= 19) letterIndex += 1; // Skip 't'
        if (letterIndex >= 24) letterIndex += 1; // Skip 'y'
        return String.fromCharCode(97 + letterIndex);
    }
    property var chromaticNotes: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];

    function createChromaticNotes(tonic){
        var notes = [];
        for (var i = tonic; i < tonic + 12; i++){
            notes.push(i);
        }
        return notes;
    }
    function getOctave(note){
        return floor((note - 12), 12);
    }

    function getOctaveDistance(note1, note2){
        return getOctave(note2) - getOctave(note1);
    }

    function getChain(id){
        var chain = [];
        for (var i = 0; i < scales.length; i++){
            if (id >= scales[i].id){
                chain.push(scales[i]);
            }
        }
        return chain;
    }

    function unpackScaleNote(scaleNote){
        var degree = scaleNote.degree;
        var offset = scaleNote.offset;
        var base = chromaticNotes[degree % 12];
        var wrap = Math.floor(degree / 12);
        if (wrap > 0) base += wrap * 12;
        if (offset["t"]) base += offset["t"];
        if (offset["y"]) base += offset["y"] * 12;
        return base;
    }
    function unpackScale(scale){
        if (!scale) return [];
        return scale.notes.map((n) => unpackScaleNote(n));
    }


    // Transpose a note along a scale
    function transposeScaleNote(note, scale){
        var modulus = scale.notes.length;
        if (modulus === 0) return note;

        // Find the new degree and octave
        var degreeOffset = 0;
        if (note.offset[scale.id]){
            degreeOffset = note.offset[scale.id];
        }
        var shouldOffset = degreeOffset !== 0;
        var newDegree = note.degree + degreeOffset;
        var newOctave = floor(newDegree, modulus);

        // Get the new note from the parent scale
        var parentNote = scale.notes[mod(newDegree, modulus)];

        // Create new offsets for the note
        var newOffset = note.offset;
        if (shouldOffset) delete newOffset[scale.id];

        // Inherit the parent's offsets
        var parentOffset = parentNote.offset;
        newOffset = sumVectors(newOffset, parentOffset);

        // Apply the octave to the note
        var octaveOffset = {};
        if (newOctave !== 0) octaveOffset["y"] = newOctave;
        newOffset = sumVectors(newOffset, octaveOffset);

        // Return the new note
        return {id: parentNote.id, degree: parentNote.degree, offset: newOffset};
    }

    // Transpose a scale through a parent scale
    function transposeScale(scale, parent){
        var notes = [];
        var size = scale.notes.length;
        for (var i = 0; i < size; i++){
            notes.push(transposeScaleNote(scale.notes[i], parent));
        }
        return {id: scale.id, notes};
    }

    function resolveNote(note){
        var chain = getChain(note.id);
        var count = chain.length;
        var chainedNote = note;
        for (var i = count - 1; i >= 0; i--){
            chainedNote = transposeScaleNote(chainedNote, chain[i]);
        }
        return unpackScaleNote(chainedNote);
    }

    function resolveToScale(chain){
        var count = chain.length;
        var defaultScale = [];
        if (count === 0) return defaultScale;
        if (count === 1) return unpackScale(chain[0]);
        
        // Get the last scale in the chain
        var currentScales = chain;
        var currentScale = currentScales.pop();
        
        // Transpose up along the scales
        while (currentScales.length > 0){
            var parentScale = currentScales.pop();
            currentScale = transposeScale(currentScale, parentScale);
        }

        return unpackScale(currentScale);
    }

    function resolveScales(){
        var size = scales.length;
        var midiScales = [];
        for (var i = 0; i < size; i++){
            var chain = [];
            for (var j = 0; j <= i; j++){
                chain.push(scales[j]);
            }
            midiScales.push(resolveToScale(chain));
        }
        return midiScales;
    }
    
    function initializeKeys(){
        scaleKeyMap = {};
        // Initialize key map
        for (var i = 0; i < scaleKeysets.length; i++){
            var keyset = scaleKeysets[i];
            var keyScales = keyset[0];
            var keys = keyset[1];
            for (var j = 0; j < 12; j++){
                var notes = keyScales[j];
                var canon = getCanonicalScale(notes);
                scaleKeyMap[canon] = keys[j];
            }
        }
    }

    function getScaleKey(scale){
        if (!scale) return chromaticKey;
        var canon = getCanonicalScale(scale);
        if (!scaleKeyMap) return chromaticKey;
        var scaleKey = scaleKeyMap[canon];
        if (!scaleKey) return chromaticKey;
        return scaleKey;
    }

    property var pcs: [
        ["B#","C","Dbb"],
        ["B##", "C#", "Db"],
        ["C##", "D", "Ebb"],
        ["D#","Eb","Fbb"],
        ["D##", "E", "Fb"],
        ["E#","F","Gbb"],
        ["E##", "F#", "Gb"],
        ["F##", "G", "Abb"],
        ["G#","Ab"],
        ["G##", "A", "Bbb"],
        ["A#","Bb","Cbb"],
        ["A##", "B", "Cb"]
    ]
    function getMidiPitchClass(midi, key){
        var pc = key[mod(midi, 12)];
        if (!pc) return "C";
        return pc;
    }
    function getMidiTpc(midi, key){
        var pc = getMidiPitchClass(midi, key);
        return tpcMap[pc];
    }
    function getDegree(midi, scale){
        var size = scale.length;
        var base = midi % 12;
        for (var i = 0; i < size; i++){
            if (scale[i] % 12 === base) return i;
        }
        return -1;
    }
    function pitchClassToNumber(pc){
        for (var i = 0; i < pcs.length; i++){
            for (var j = 0; j < pcs[i].length; j++){
                if (pcs[i][j] === pc){
                    return i;
                }
            }
        }
        return -1;
    }

    property var scales: [];

    function sortScale(notes){
        var result = [];
        var size = notes.length;
        for (var i = 0; i < size; i++){
            var note = notes[i];
            var prev = i > 0 ? notes[i - 1] : -1;
            if (i > 0 && note <= prev){
                var newNote = note;
                while (newNote <= prev){
                    newNote += 12;
                }
                result.push(newNote);
            } else {
                result.push(note);
            }
        }
        return result;
    }

    function inputScale(text){
        var exactMatch = scaleMap[text];

        // Try to find an exact match
        if (exactMatch){
            var scale = [];
            for (var i = 0; i < exactMatch.length; i++){
                scale.push(exactMatch[i] + 60);
            }
            return scale;
        }

        var textLength = text.length;

        // Try to find an exact match with a prefixed root note
        for (var scaleName in scaleMap){
            var nameLength = scaleName.length;
            if (textLength <= nameLength) continue;

            // Check if scale ends with the name
            if (text.substring(textLength - nameLength, textLength) === scaleName) {
                var substring = text.substring(0, textLength - nameLength).trim();
                var number = pitchClassToNumber(substring);
                if (number === -1) continue;
                return scaleMap[scaleName].map((n) => n + number + 60);
            }
        }

        // Try to split the scale by comma
        var notes = [];
        var onTonic = true;
        var parts = text.split(",");
        for (var i = 0; i < parts.length; i++){
            var part = parts[i].trim();
            var number = parseInt(part);
            if (isNaN(number)) number = pitchClassToNumber(part);
            if (isNaN(number) || number < 0) continue;
            if (onTonic){
                notes.push(number + 60);
                onTonic = false;
            } else {
                var last = notes[notes.length - 1];
                var dist = mod(number - (last % 12), 12);
                notes.push(last + dist);
            }
        }
        return notes;
    }

    function inputScales(text){

        // Get the MIDI notes
        var newScales = [];
        if (text.trim() === "") return newScales;
        var parts = text.split("=>");

        for (var i = 0; i < parts.length; i++){
            var part = parts[i].trim();
            if (!part.length) continue;
            var scale = inputScale(part);
            if (!scale.length) continue;
            newScales.push(sortScale(scale));
        }

        // Bind the scales
        var count = newScales.length;
        var chain = [];
        for (var i = 0; i < count; i++){

            // Get the current scale
            var scale = newScales[i];
            var length = scale.length;

            // Get the parent or chromatic scale
            var parent = i > 0 ? newScales[i - 1] : chromaticNotes;

            // Iterate over each note
            var newNotes = [];
            for (var j = 0; j < length; j++){
                var midi = scale[j];

                // Find the degree in the parent scale
                var degree = getDegree(midi, parent);
                if (degree === -1) continue;

                // Get the octave distance
                var octave = getOctaveDistance(parent[degree], midi);
                var offset = {};
                if (octave !== 0) offset["y"] = octave;

                // Add a scale id
                var id = numToLetter(i);
                newNotes.push({id, degree, offset});
            }

            // Add the scale to the chain
            chain.push({id: numToLetter(i), notes: newNotes});
        }
        scales = chain;
        if (chain.length) rootScale = unpackScale(chain[0]);
    }

    Item {
        anchors.fill: parent
        GridLayout {
            columns: 1
            anchors.fill: parent
            anchors.margins: 10
            rowSpacing: 1
            RowLayout {
                id: scalesRowLayout
                spacing: 20
                Label {
                    text: "Scales"
                }
                TextArea {
                    id: scalesTextArea
                    height: Math.max(scalesTextArea.implicitHeight, view.height)
                    textFormat: TextEdit.PlainText
                    Layout.fillWidth: true
                    selectByMouse: true
                    Component.onCompleted: {
                        if (curScore.metaTag("scales")){
                            scalesTextArea.text = curScore.metaTag("scales");
                        } else {
                            scalesTextArea.text = ""
                        }
                    }
                    onTextChanged: {
                        curScore.setMetaTag("scales", text);
                        inputScales(text);
                    }
                }
            }
            RowLayout {
                anchors.top: scalesRowLayout.bottom
                anchors.topMargin: 10
                Text {
                    id: scalesExplanation
                    text: "Scales are hierarchical families of notes separated by '=>'.\nEnter each scale by name ('C maj7'), by pitch class (C, E, G), or by number (0, 4, 7)."
                    wrapMode: Text.WordWrap
                    width: root.width
                    Layout.fillWidth: true
                }
            }
            RowLayout {
                id: poseRowLayout
                spacing: 20
                Label {
                    text: "Offsets"
                }
                TextArea {
                    id: offsets
                    width: parent.width
                    height: Math.max(offsets.implicitHeight, view.height)
                    anchors.margins: 2
                    Layout.fillWidth: true
                    textFormat: TextEdit.PlainText
                    selectByMouse: true
                    Component.onCompleted: {
                        if (curScore.metaTag("pose")){
                            offsets.text = curScore.metaTag("pose");
                        } else {
                            offsets.text = ""
                        }
                    }
                    onTextChanged: {
                        inputPose(text);
                        curScore.setMetaTag("pose", text);
                    }
                }
            }
            RowLayout {
                anchors.top: poseRowLayout.bottom
                anchors.topMargin: 10
                Text {
                    id: poseExplanation
                    text: "Offsets are combinations of letters and numbers separated by '+' (e.g. a4 + b-2).\nEach letter is a scale (a-z, \ t=chromatic, y=octave), and each number is an offset."
                    wrapMode: Text.WordWrap
                    width: root.width
                    Layout.fillWidth: true
                }
            }
            RowLayout {
                id: mcRowLayout
                spacing: 20
                RowLayout {
                    spacing: 10
                    Label {
                        text: "Multiplier"
                    }
                    TextArea {
                        id: multiplierTextArea
                        anchors.margins: 2
                        textFormat: TextEdit.PlainText
                        selectByMouse: true
                        Component.onCompleted: {
                            if (curScore.metaTag("multiplier")){
                                multiplierTextArea.text = curScore.metaTag("multiplier");
                            } else {
                                multiplierTextArea.text = ""
                            }
                        }
                        onTextChanged: {
                            inputMultiplier(text);
                            curScore.setMetaTag("multiplier", text);
                        }
                    }
                }
                RowLayout {
                    spacing: 10
                    Label {
                        text: "Counter"
                    }
                    TextArea {
                        id: counterTextArea
                        anchors.margins: 2
                        textFormat: TextEdit.PlainText
                        selectByMouse: true
                        Component.onCompleted: {
                            if (curScore.metaTag("counter")){
                                counterTextArea.text = curScore.metaTag("counter");
                            } else {
                                counterTextArea.text = ""
                            }
                        }
                        onTextChanged: {
                            inputCounter(text);
                            curScore.setMetaTag("counter", text);
                        }
                    }
                }
            }
            RowLayout {
                anchors.top: mcRowLayout.bottom
                anchors.topMargin: 10
                Text {
                    id: mcExplanation
                    text: "The multiplier scales the offsets applied to each note (equal to 1 by default).\nThe counter stacks the multiplier every N notes (disabled by default, useful for sequences)."
                    wrapMode: Text.WordWrap
                    width: root.width
                    Layout.fillWidth: true
                }
            }
            RowLayout {
                spacing: 20
                Button {
                    id: applyButton
                    text: qsTranslate("PrefsDialogBase", "Apply")
                    onClicked: {
                        applyTransformation()
                        quit()
                    }
                }
                Button {
                    id: cancelButton
                    text: qsTranslate("PrefsDialogBase", "Cancel")
                    onClicked: {
                        quit()
                    }
                }
            }
        }
    }
    function error(errorMessage) {
        errorDialog.text = qsTr(errorMessage);
        errorDialog.open();
    }
    
    MessageDialog {
        id: errorDialog
        title: "Error"
        text: ""
        onAccepted: {
            errorDialog.close()
        }
    }
}