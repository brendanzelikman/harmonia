import { resolvePatternNoteToMidi } from "types/Pattern/PatternResolvers";
import { PatternNote, PatternStream } from "types/Pattern/PatternTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { resolveScaleNoteToMidi } from "types/Scale/ScaleResolvers";
import { NestedNote } from "types/Scale/ScaleTypes";
import { mod } from "utils/math";
import { MidiValue, getMidiOctaveDistance } from "utils/midi";
import {
  selectTrackScale,
  selectTrackMidiScale,
  selectScaleTrackByScaleId,
  selectTrackScaleChain,
  selectTrackMidiScaleMap,
  selectScaleTrackChainIds,
  selectScaleTrackById,
  selectTrackById,
} from "./TrackSelectors";
import { TrackId } from "./TrackTypes";
import { getPatternBlockWithNewNotes } from "types/Pattern/PatternUtils";
import { range } from "utils/array";

/** Convert a midi into a nested note */
export const convertMidiToNestedNote =
  (midi: MidiValue, parent?: TrackId): Thunk<NestedNote> =>
  (dispatch, getProject) => {
    const parentScale = parent
      ? selectTrackScale(getProject(), parent)
      : undefined;
    const parentMidi = selectTrackMidiScale(getProject(), parent);
    const degree = parentMidi.findIndex((s) => s % 12 === midi % 12);
    const octave = getMidiOctaveDistance(parentMidi[degree], midi);
    const note: NestedNote = { degree, offset: { octave } };
    if (parentScale) return { ...note, scaleId: parentScale.id };
    return note;
  };

/** Get the degree of the pattern note in the given track's scale.  */
export const getDegreeOfNoteInTrack =
  (trackId?: TrackId, patternNote?: PatternNote): Thunk<number> =>
  (dispatch, getProject) => {
    if (!trackId || !patternNote) return -1;
    const project = getProject();
    const trackMidiScale = selectTrackMidiScale(project, trackId);
    const isNested = !("MIDI" in patternNote);

    // Get the MIDI of the note, realizing if necessary
    let MIDI: number;
    if (!isNested) MIDI = patternNote.MIDI;
    else {
      // Chain the note through its scales
      const track = selectScaleTrackByScaleId(project, patternNote?.scaleId);
      const chain = track?.id ? selectTrackScaleChain(project, track?.id) : [];
      MIDI = resolveScaleNoteToMidi(patternNote, chain);
    }

    // Index the MIDI scale and return the degree
    if (MIDI < 0) return -1;
    return trackMidiScale.findIndex((s) => s % 12 === MIDI % 12);
  };

export const autoBindStreamToTrack =
  (trackId?: TrackId, stream: PatternStream = []): Thunk<PatternStream> =>
  (dispatch) => {
    return stream.map((b) =>
      getPatternBlockWithNewNotes(b, (n) =>
        n.map((n) => dispatch(autoBindNoteToTrack(trackId, n)))
      )
    );
  };

/** Get the best matching note based on the given track. */
export const autoBindNoteToTrack =
  (trackId?: TrackId, note?: PatternNote): Thunk<PatternNote> =>
  (dispatch, getProject) => {
    if (!note) throw new Error("Note is required for autoBindNoteToTrack");
    if (!trackId) return note;
    const project = getProject();
    const trackScaleMap = selectTrackMidiScaleMap(project);
    const chainIds = selectScaleTrackChainIds(project, trackId);
    const scales = selectTrackScaleChain(project, trackId);
    const midi = resolvePatternNoteToMidi(note, scales);
    const idCount = chainIds.length;
    if (!idCount) return note;

    const track = selectScaleTrackById(project, chainIds[0]);
    const trackScaleId = track?.scaleId;
    const tonicScale = selectTrackMidiScale(project, trackId);
    const chromaticScale = range(tonicScale[0], tonicScale[0] + 12);

    // Get the current track and scale
    for (let i = idCount - 1; i >= 0; i--) {
      const trackId = chainIds[i];
      const track = selectScaleTrackById(project, trackId);
      const scaleId = track?.scaleId;
      const scale = trackScaleMap[trackId] ?? [];
      const scaleNote: PatternNote = { ...note, scaleId };

      // Check for an exact match with the current scale
      const degree = dispatch(getDegreeOfNoteInTrack(trackId, note));
      if (degree > -1) {
        const octave = getMidiOctaveDistance(scale[degree], midi);
        note = { ...scaleNote, degree, offset: { octave } };
        if ("MIDI" in note) delete note.MIDI;
        return note;
      }

      // Otherwise, check parent scales for neighbors, preferring deep matches first
      const parentIds = chainIds.slice(0, i).toReversed();
      const trackIds: (TrackId | "T")[] = [...parentIds, "T"];

      // Iterate over all scale offsets
      for (let i = 0; i < trackIds.length; i++) {
        const id = trackIds[i];
        const parentTrack =
          id !== "T" ? selectTrackById(project, id) : undefined;
        const parentScaleId = id === "T" ? "chromatic" : parentTrack?.scaleId;
        if (!parentScaleId) continue;

        // Check the parent scale (or chromatic scale at the end)
        const parentScale = id === "T" ? chromaticScale : trackScaleMap[id];
        const parentSize = parentScale.length;
        const degree =
          id === "T"
            ? chromaticScale.findIndex((n) => n % 12 === midi % 12)
            : dispatch(getDegreeOfNoteInTrack(id, scaleNote));
        if (degree === -1) continue;

        // Check if the note can be lowered to fit in the scale
        const lower = mod(degree - 1, parentSize);
        const lowerWrap = Math.floor((degree - 1) / parentSize);
        const lowerMIDI = parentScale?.[lower] ?? 0;
        const lowerNote = { ...scaleNote, MIDI: lowerMIDI };
        const lowerDegree = dispatch(
          getDegreeOfNoteInTrack(trackId, lowerNote)
        );

        // If the lowered note exists in the current scale, add the note as an upper neighbor
        if (lowerDegree > -1) {
          const octave =
            getMidiOctaveDistance(parentScale[degree], midi) + lowerWrap;

          const offset = { [parentScaleId]: 1, octave };
          note = { ...scaleNote, degree: lowerDegree, offset };
          if ("MIDI" in note) delete note.MIDI;
          return note;
        }

        // Check if the note can be raised to fit in the scale
        const upper = mod(degree + 1, parentSize);
        const upperMIDI = parentScale?.[upper] ?? 0;
        const upperNote = { ...scaleNote, MIDI: upperMIDI };
        const upperWrap = Math.floor((degree + 1) / parentSize);
        const upperDegree = dispatch(
          getDegreeOfNoteInTrack(trackId, upperNote)
        );

        // If the raised note exists in the current scale, add the note as a lower neighbor
        if (upperDegree > -1) {
          const octave =
            getMidiOctaveDistance(parentScale[degree], midi) + upperWrap;
          const offset = { [parentScaleId]: -1, octave };
          note = { ...scaleNote, degree: upperDegree, offset };
          if ("MIDI" in note) delete note.MIDI;
          return note;
        }
      }
    }

    // If no match has been found, manually set the note as a neighbor of the tonic
    const offset = { chromatic: midi - tonicScale[0] };
    const updatedNote: PatternNote = {
      ...note,
      degree: 0,
      offset,
      scaleId: trackScaleId,
    };
    if ("MIDI" in updatedNote) delete updatedNote.MIDI;
    return updatedNote;
  };
