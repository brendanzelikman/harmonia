import { inRange, union } from "lodash";
import * as Selectors from "redux/selectors";
import * as Clips from "redux/slices/clips";
import * as Transpositions from "redux/slices/transpositions";
import { addPattern } from "redux/slices/patterns";
import {
  deselectClip,
  setSelectedClips,
  setSelectedPattern,
} from "redux/slices/root";
import { AppThunk } from "redux/store";
import {
  ClipNoId,
  defaultClip,
  ClipId,
  initializeClip,
  Clip,
  getClipStream,
  getClipNotes,
  getClipTicks,
} from "types/clip";
import { MIDI } from "types/midi";
import { Midi } from "@tonejs/midi";
import { PatternStream, initializePattern, PatternId } from "types/pattern";
import { TrackId } from "types/tracks";
import {
  Transposition,
  TranspositionId,
  getChordalTranspose,
  getChromaticTranspose,
  getScalarTranspose,
} from "types/transposition";
import { Tick } from "types/units";
import { createClipsAndTranspositions } from "redux/slices/clips";
import { Row } from "features/timeline";
import { convertTicksToSeconds } from "redux/slices/transport";
import { sliceClipInSession } from "redux/slices/sessionMap";

export type RepeatOptions = {
  repeatCount?: number;
  repeatTranspositions?: boolean;
  repeatWithTransposition?: boolean;
};
export const repeatClips =
  (
    clips: Clip[],
    options?: RepeatOptions
  ): AppThunk<
    Promise<{ clipIds: ClipId[]; transpositionIds: TranspositionId[] }>
  > =>
  async (dispatch, getState) => {
    const state = getState();
    const root = Selectors.selectRoot(state);
    const { toolkit } = root;
    const repeatCount = options?.repeatCount || toolkit?.repeatCount;
    const repeatTranspositions =
      options?.repeatTranspositions || toolkit?.repeatTranspositions;
    const repeatWithTransposition =
      options?.repeatWithTransposition || toolkit?.repeatWithTransposition;
    const { transpositionOffsets } = toolkit;
    const toolkitChromatic = getChromaticTranspose(transpositionOffsets);
    const toolkitScalar = getScalarTranspose(transpositionOffsets);
    const toolkitChordal = getChordalTranspose(transpositionOffsets);

    const clipTicks = clips.map((clip) =>
      Selectors.selectClipDuration(state, clip?.id)
    );
    const startTick = Math.min(...clips.map((clip) => clip.tick));
    const endTick = Math.max(
      ...clips.map((clip, i) => clip.tick + clipTicks[i])
    );
    const totalTicks = endTick - startTick;

    let newClips: Clip[] = [];
    let newTranspositions: Transposition[] = [];

    const clipTranspositions = clips.map((clip) =>
      Selectors.selectClipTranspositions(state, clip.id)
    );

    for (let i = 1; i <= repeatCount; i++) {
      // Move the clips
      const movedClips = clips.map((clip) => ({
        ...clip,
        tick: clip.tick + i * totalTicks,
      }));
      newClips = [...newClips, ...movedClips];

      // Move the transpositions
      if (repeatTranspositions) {
        clips.forEach((clip, j) => {
          const transpositions = clipTranspositions[j];
          const currentTranspositions = transpositions.filter((t) =>
            inRange(t.tick, clip.tick, clip.tick + clipTicks[j])
          );
          if (currentTranspositions.length) {
            const movedTranspositions = currentTranspositions.map((t) => {
              const tChromatic = getChromaticTranspose(t);
              const tScalar = getScalarTranspose(t);
              const tChordal = getChordalTranspose(t);
              return {
                ...t,
                tick: t.tick + i * totalTicks,
                chromaticTransposition: repeatWithTransposition
                  ? tChromatic + i * toolkitChromatic
                  : tChromatic,
                scalarTransposition: repeatWithTransposition
                  ? tScalar + i * toolkitScalar
                  : tScalar,
                chordalTransposition: repeatWithTransposition
                  ? tChordal + i * toolkitChordal
                  : tChordal,
              };
            });
            newTranspositions = [...newTranspositions, ...movedTranspositions];
          }
        });
      }
    }
    return dispatch(createClipsAndTranspositions(newClips, newTranspositions));
  };

export const mergeClips =
  (clips: Clip[]): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const sessionMap = Selectors.selectSessionMap(state);
    const patterns = Selectors.selectPatternMap(state);
    const transpositions = Selectors.selectTranspositionMap(state);
    const patternTracks = Selectors.selectPatternTrackMap(state);
    const scaleTracks = Selectors.selectScaleTrackMap(state);
    const root = Selectors.selectRoot(state);
    const { toolkit } = root;
    const { mergeName, mergeTranspositions } = toolkit;
    const selectedTranspositions =
      Selectors.selectSelectedTranspositions(state);
    if (!clips || !clips.length) return;
    const sortedClips = clips.sort((a, b) => a.tick - b.tick);
    let oldTranspositions: Transposition[] = [];

    // Create a merged pattern
    const stream = sortedClips.reduce((acc, clip) => {
      const pattern = Selectors.selectPattern(state, clip.patternId);
      if (!pattern) return acc;

      const allChords = mergeTranspositions
        ? getClipStream(clip, {
            patterns,
            patternTracks,
            scaleTracks,
            transpositions,
            sessionMap,
          })
        : getClipNotes(clip, pattern.stream);

      // Add any overlapping transpositions if merging
      if (mergeTranspositions) {
        const ticks = getClipTicks(clip, pattern);
        oldTranspositions = union(
          oldTranspositions,
          selectedTranspositions.filter((t) =>
            inRange(t.tick, clip.tick, clip.tick + ticks)
          )
        );
      }

      const chords = allChords.filter((chord) => !!chord.length);
      return [...acc, ...chords];
    }, [] as PatternStream);

    const newPattern = initializePattern({
      stream,
      name: !!mergeName.length ? mergeName : "New Pattern",
    });
    dispatch(addPattern(newPattern));
    dispatch(setSelectedPattern(newPattern.id));

    // Create a new clip
    await dispatch(
      Clips.createClips([
        {
          patternId: newPattern.id,
          trackId: sortedClips[0].trackId,
          tick: sortedClips[0].tick,
        },
      ])
    );
    // Delete the old clips
    dispatch(Clips.deleteClips(clips));
    // Delete any merged transpositions
    if (mergeTranspositions && oldTranspositions.length) {
      dispatch(Transpositions.deleteTranspositions(oldTranspositions));
    }
  };

export const createPatternClip =
  (trackId: TrackId, patternId: PatternId, tick: Tick): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the pattern track from the store
    const patternTrack = Selectors.selectPatternTrack(state, trackId);
    if (!patternTrack) return;

    // Get the pattern from the store
    const pattern = Selectors.selectPattern(state, patternId);
    if (!pattern) return;

    // Create a new clip
    const clip: ClipNoId = {
      ...defaultClip,
      patternId: pattern.id,
      tick,
      trackId: patternTrack.id,
    };
    dispatch(Clips.createClips([clip]));
  };

export const sliceClip =
  (clipId: ClipId, tick: Tick): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the clip from the store
    const oldClip = Selectors.selectClip(state, clipId);
    if (!oldClip) return;

    const stream = Selectors.selectClipStream(state, clipId);

    const splitTick = tick - oldClip.tick;
    if (tick === oldClip.tick || splitTick === stream.length) return;

    // Create two new clips pivoting at the tick
    const firstClip = initializeClip({
      ...oldClip,
      duration: splitTick,
    });
    const secondClip = initializeClip({
      ...oldClip,
      tick,
      offset: oldClip.offset + splitTick,
      duration: stream.length - splitTick,
    });

    // Deselect the clip
    dispatch(deselectClip(clipId));

    // Slice the clip
    const payload = { oldClip, firstClip, secondClip };
    dispatch(Clips._sliceClip(payload));
    dispatch(sliceClipInSession(payload));
  };

export const exportClipsToMidi =
  (ids: ClipId[], options = { name: "" }): AppThunk =>
  async (_dispatch, getState) => {
    // Get the clips from the state
    const state = getState();
    const patterns = Selectors.selectPatternMap(state);
    const patternTracks = Selectors.selectPatternTrackMap(state);
    const scaleTracks = Selectors.selectScaleTrackMap(state);
    const transport = Selectors.selectTransport(state);
    const sessionMap = Selectors.selectSessionMap(state);
    const scaleTrackIds = Selectors.selectScaleTrackIds(state);
    const clipsByIds = Selectors.selectClipsByIds(state, ids);
    const clips = clipsByIds.filter(Boolean) as Clip[];
    if (!clips || !clips.length) return;

    // Sort the clips
    const sortedClips = clips.sort((a, b) => a.tick - b.tick);

    // Accumulate clips into tracks
    const clipsByTrack = sortedClips.reduce((acc, clip) => {
      const track = Selectors.selectTrack(state, clip.trackId);
      if (!track) return acc;
      if (!acc[track.id]) acc[track.id] = [];
      acc[track.id].push(clip);
      return acc;
    }, {} as Record<TrackId, Clip[]>);

    // Sort the trackIds descending by view order based on the track map
    const trackIds = Object.keys(clipsByTrack).sort((a, b) => {
      // Get the pattern tracks of the clips
      const trackA = Selectors.selectPatternTrack(state, a);
      const trackB = Selectors.selectPatternTrack(state, b);
      if (!trackA || !trackB) return 0;
      // Get the scale tracks for each pattern track
      const scaleTrackA = Selectors.selectScaleTrack(state, trackA.parentId);
      const scaleTrackB = Selectors.selectScaleTrack(state, trackB.parentId);
      if (!scaleTrackA || !scaleTrackB) return 0;
      // Get the index of each scale track
      const indexA = scaleTrackIds.indexOf(scaleTrackA.id);
      const indexB = scaleTrackIds.indexOf(scaleTrackB.id);
      const diff = indexA - indexB;
      // If the scale tracks are the same, sort by pattern track index
      if (diff === 0) {
        // Get the pattern track ids from the track map
        const patterns = sessionMap.byId[scaleTrackA.id].trackIds;
        const keys = patterns;
        const trackIndexA = keys.indexOf(a);
        const trackIndexB = keys.indexOf(b);

        return trackIndexA - trackIndexB;
      }
      // Otherwise, return by scale track index
      return diff;
    });

    // Prepare a new MIDI file
    const midi = new Midi();
    const transpositions = Selectors.selectTranspositionMap(state);

    // Iterate through each track
    trackIds.forEach((trackId, index) => {
      const track = Selectors.selectPatternTrack(state, trackId);
      if (!track) return;

      // Create a track for each clip
      const midiTrack = midi.addTrack();
      const clips = clipsByTrack[trackId];

      // Add the notes of each clip
      clips.forEach((clip) => {
        // Get the stream of the clip
        const time = convertTicksToSeconds(transport, clip.tick);
        const stream = getClipStream(clip, {
          patterns,
          patternTracks,
          scaleTracks,
          transpositions,
          sessionMap,
        });

        // Iterate through each chord
        for (let i = 0; i < stream.length; i++) {
          const chord = stream[i];
          // Skip if the chord is a rest
          if (!chord.length || MIDI.isRest(chord)) continue;

          // Get the duration of the chord in seconds
          const firstNote = chord[0];
          const duration = convertTicksToSeconds(transport, firstNote.duration);

          // Add each note to the MIDI track
          for (const note of chord) {
            midiTrack.addNote({
              midi: note.MIDI,
              velocity: note.velocity ?? MIDI.DefaultVelocity,
              time: time + convertTicksToSeconds(transport, i),
              duration,
            });
          }
        }
      });
    });

    // Create a MIDI blob
    const blob = new Blob([midi.toArray()], {
      type: "audio/midi",
    });
    const url = URL.createObjectURL(blob);

    // Download the MIDI file
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.name || "file"}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

// Export the state to a MIDI file
export const saveStateToMIDI: AppThunk = (dispatch, getState) => {
  try {
    const state = getState();
    const clips = Selectors.selectClipIds(state);
    const { projectName } = Selectors.selectRoot(state);
    return dispatch(exportClipsToMidi(clips, { name: projectName }));
  } catch (e) {
    console.log(e);
  }
};

// Select range of clips
export const selectRangeOfClips =
  (clip: Clip, rows: Row[]): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { selectedClipIds } = Selectors.selectRoot(state);

    const clipPattern = Selectors.selectPattern(state, clip.patternId);
    if (!clipPattern) return;
    const lastId = selectedClipIds.at(-1);
    if (!lastId) return;
    const lastClip = Selectors.selectClip(state, lastId);
    if (!lastClip) return;

    // Get the start and end index of the selection
    const startIndex = rows.findIndex(
      (row) => row.trackId === lastClip?.trackId
    );
    const targetIndex = rows.findIndex((row) => row.trackId === clip.trackId);

    // Get the trackIds of the selection
    const trackIds = rows
      .slice(
        Math.min(startIndex, targetIndex),
        Math.max(startIndex, targetIndex) + 1
      )
      .map((row) => row.trackId)
      .filter(Boolean) as TrackId[];

    // Get the clips of the selection
    const clips = Selectors.selectClipsByTrackIds(state, trackIds);

    // Compute the start and end time of the selection
    const startTick = lastClip.tick || 0;
    const ticks = getClipTicks(clip, clipPattern);
    const endTick = clip.tick + ticks;

    // Get the durations of all clips
    const clipTicks = clips.reduce((acc, clip) => {
      const pattern = Selectors.selectPattern(state, clip.patternId);
      if (!pattern) return acc;
      return { ...acc, [clip.id]: getClipTicks(clip, pattern) };
    }, {} as Record<ClipId, number>);

    // Get the clips that are in the selection
    const newClips = clips.filter((c) => {
      const ticks = clipTicks[c.id];
      return c.tick >= startTick && c.tick + ticks <= endTick;
    });
    const newClipIds = newClips.map((clip) => clip.id);

    // Select the clips
    dispatch(setSelectedClips(newClipIds));
  };
