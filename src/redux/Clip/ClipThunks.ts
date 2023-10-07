import {
  addMediaToSession,
  removeMediaFromSession,
  selectSessionMap,
  sliceClipInSession,
} from "redux/Session";
import { AppThunk } from "redux/store";
import {
  Clip,
  ClipId,
  ClipNoId,
  getClipStream,
  initializeClip,
  isClip,
} from "types/Clip";
import { Tick } from "types/units";
import { _sliceClip, addClips, removeClips } from "./ClipSlice";
import {
  selectClipById,
  selectClipStream,
  selectClipsByIds,
} from "./ClipSelectors";
import { removeSelectedClips, selectRoot } from "redux/Root";
import { selectPatternMap } from "redux/Pattern";
import {
  selectPatternTrackMap,
  selectPatternTrackById,
} from "redux/PatternTrack";
import { selectScaleTrackMap } from "redux/ScaleTrack";
import { selectTranspositionMap } from "redux/Transposition";
import {
  selectTransport,
  selectTrackById,
  selectOrderedTrackIds,
} from "redux/selectors";
import { Midi } from "@tonejs/midi";
import { TrackId } from "types/Track";
import { convertTicksToSeconds } from "types/Transport";
import { MIDI } from "types/midi";

/**
 * Creates a list of clips and adds them to the store.
 * @param clipNoIds The list of clips to create.
 * @returns A promise that resolves to the list of clip IDs.
 */
export const createClips =
  (clipNoIds: Partial<ClipNoId>[]): AppThunk<Promise<{ clipIds: ClipId[] }>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      // Initialize the clips
      const clips = clipNoIds.map(initializeClip);

      // Add the clips to the store
      const payload = { clips };
      dispatch(addClips(payload));
      dispatch(addMediaToSession(payload));

      // Resolve the promise with the clip IDs
      const clipIds = clips.map((clip) => clip.id);
      const promiseResult = { clipIds };
      resolve(promiseResult);
    });
  };

/**
 * Deletes a list of clips from the store.
 * @param clips The list of clips to delete.
 * @returns A promise that resolves to true if the clips were deleted.
 */
export const deleteClips =
  (clips: Clip[]): AppThunk =>
  (dispatch) => {
    return new Promise((resolve) => {
      // Resolve false if any clips are invalid
      if (clips.some((clip) => !isClip(clip))) {
        resolve(false);
      }
      // Otherwise, delete the clips and resolve true
      dispatch(removeSelectedClips(clips.map((clip) => clip.id)));
      dispatch(removeClips({ clips }));
      dispatch(removeMediaFromSession({ clips }));
      resolve(true);
    });
  };

/**
 * Slices a clip at a given tick.
 * @param clipId The ID of the clip to slice.
 * @param tick The tick to slice the clip at.
 */
export const sliceClip =
  (clipId: ClipId, tick: Tick): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the clip and stream from the store
    const oldClip = selectClipById(state, clipId);
    const stream = selectClipStream(state, clipId);
    if (!oldClip || !stream.length) return;

    // Find the tick to split the clip at
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
    dispatch(removeSelectedClips([clipId]));

    // Slice the clip
    const payload = { oldClip, firstClip, secondClip };
    dispatch(_sliceClip(payload));
    dispatch(sliceClipInSession(payload));
  };

/**
 *  Export the clips to a MIDI file.
 * @param ids The IDs of the clips to export.
 */
export const exportClipsToMidi =
  (ids: ClipId[]): AppThunk =>
  async (_dispatch, getState) => {
    const state = getState();

    // Get the clips
    const clips = selectClipsByIds(state, ids);
    if (!clips.length) return;

    // Get the dependencies
    const root = selectRoot(state);
    const patterns = selectPatternMap(state);
    const patternTracks = selectPatternTrackMap(state);
    const scaleTracks = selectScaleTrackMap(state);
    const transport = selectTransport(state);
    const sessionMap = selectSessionMap(state);
    const transpositionMap = selectTranspositionMap(state);

    // Sort the clips
    const sortedClips = clips.sort((a, b) => a.tick - b.tick);

    // Accumulate clips into tracks
    const clipsByTrack = sortedClips.reduce((acc, clip) => {
      const track = selectTrackById(state, clip.trackId);
      if (!track) return acc;
      if (!acc[track.id]) acc[track.id] = [];
      acc[track.id].push(clip);
      return acc;
    }, {} as Record<TrackId, Clip[]>);

    // Sort the trackIds descending by view order based on the track map
    const trackIds = Object.keys(clipsByTrack) as TrackId[];
    const orderedTrackIds = selectOrderedTrackIds(state);
    const clipTrackIds = orderedTrackIds.filter((id) => trackIds.includes(id));

    // Prepare a new MIDI file
    const midi = new Midi();

    // Iterate through each track
    clipTrackIds.forEach((trackId) => {
      // Get the pattern track
      const track = selectPatternTrackById(state, trackId);
      if (!track) return;

      // Create a track for each clip
      const midiTrack = midi.addTrack();
      const clips = clipsByTrack[trackId];

      // Add the notes of each clip
      clips.forEach((clip) => {
        // Get the stream of the clip
        const time = convertTicksToSeconds(transport, clip.tick);
        const stream = getClipStream(
          clip,
          patterns,
          patternTracks,
          sessionMap,
          scaleTracks,
          transpositionMap
        );

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
    a.download = `${root.projectName || "file"}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };
