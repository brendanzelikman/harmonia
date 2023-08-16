import { inRange, union } from "lodash";
import { selectClipStream } from "redux/selectors";
import * as Selectors from "redux/selectors";
import * as Clips from "redux/slices/clips";
import * as Transfroms from "redux/slices/transforms";
import * as ClipMap from "redux/slices/maps/clipMap";
import { addPattern } from "redux/slices/patterns";
import {
  deselectClip,
  toggleRepeatingClips,
  setActivePattern,
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
  getClipDuration,
} from "types/clips";
import { MIDI } from "types/midi";
import MidiWriter from "midi-writer-js";
import {
  PatternStream,
  initializePattern,
  PatternId,
  isRest,
} from "types/patterns";
import { TrackId } from "types/tracks";
import { Transform } from "types/transform";
import { Time } from "types/units";
import { createClipsAndTransforms } from "redux/slices/clips";

export const repeatClips =
  (clipIds: ClipId[]): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const root = Selectors.selectRoot(state);
    const { repeatCount, repeatTransforms, repeatWithTranspose } = root;
    const { chromaticTranspose, scalarTranspose, chordalTranspose } = root;

    const clips = Selectors.selectClipsByIds(state, clipIds);
    const clipDurations = clips.map((clip) =>
      Selectors.selectClipDuration(state, clip?.id)
    );
    const startTime = Math.min(...clips.map((clip) => clip.startTime));
    const lastTime = Math.max(
      ...clips.map((clip, i) => clip.startTime + clipDurations[i])
    );
    const totalDuration = lastTime - startTime;

    let newClips: Clip[] = [];
    let newTransforms: Transform[] = [];

    for (let i = 1; i <= repeatCount; i++) {
      // Move the clips
      const movedClips = clips.map((clip) => ({
        ...clip,
        startTime: clip.startTime + i * totalDuration,
      }));
      newClips = [...newClips, ...movedClips];

      // Move the transforms
      if (repeatTransforms) {
        clips.forEach((clip, j) => {
          const clipTransforms = Selectors.selectClipTransforms(state, clip.id);
          const currentTransforms = clipTransforms.filter((t: Transform) =>
            inRange(t.time, clip.startTime, clip.startTime + clipDurations[j])
          );
          if (currentTransforms.length) {
            const movedTransforms = currentTransforms.map((t: Transform) => ({
              ...t,
              time: t.time + i * totalDuration,
              chromaticTranspose: repeatWithTranspose
                ? t.chromaticTranspose + i * chromaticTranspose
                : t.chromaticTranspose,
              scalarTranspose: repeatWithTranspose
                ? t.scalarTranspose + i * scalarTranspose
                : t.scalarTranspose,
              chordalTranspose: repeatWithTranspose
                ? t.chordalTranspose + i * chordalTranspose
                : t.chordalTranspose,
            }));
            newTransforms = [...newTransforms, ...movedTransforms];
          }
        });
      }
    }
    dispatch(toggleRepeatingClips());
    dispatch(createClipsAndTransforms(newClips, newTransforms));
  };

export const mergeClips =
  (clipIds: ClipId[]): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const { mergeName, mergeTransforms } = Selectors.selectRoot(state);
    const clips = Selectors.selectClipsByIds(state, clipIds).filter(
      Boolean
    ) as Clip[];
    if (!clips || !clips.length) return;
    const sortedClips = clips.sort((a, b) => a.startTime - b.startTime);
    let oldTransforms: Transform[] = [];

    // Create a merged pattern
    const stream = sortedClips.reduce((acc, clip) => {
      const pattern = Selectors.selectPattern(state, clip.patternId);
      if (!pattern) return acc;
      const scale = Selectors.selectClipScale(state, clip.id);
      const transforms = Selectors.selectClipTransforms(state, clip.id);

      const allChords = mergeTransforms
        ? getClipStream(clip, pattern, scale, transforms, [])
        : getClipNotes(clip, pattern.stream);

      // Add any overlapping transforms if merging
      if (mergeTransforms) {
        const duration = getClipDuration(clip, pattern);
        oldTransforms = union(
          oldTransforms,
          transforms.filter((t) =>
            inRange(t.time, clip.startTime, clip.startTime + duration)
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
    dispatch(setActivePattern(newPattern.id));

    // Create a new clip
    await dispatch(
      Clips.createClip({
        patternId: newPattern.id,
        trackId: sortedClips[0].trackId,
        startTime: sortedClips[0].startTime,
      })
    );
    // Delete the old clips
    dispatch(Clips.deleteClips(clipIds));
    // Delete any merged transforms
    if (mergeTransforms && oldTransforms.length) {
      dispatch(Transfroms.deleteTransforms(oldTransforms.map((t) => t.id)));
    }
  };

export const createPatternClip =
  (trackId: TrackId, patternId: PatternId, startTime: Time): AppThunk =>
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
      startTime,
      trackId: patternTrack.id,
    };
    dispatch(Clips.createClip(clip));
  };

export const sliceClip =
  (clipId: ClipId, time: Time): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the clip from the store
    const clip = Selectors.selectClip(state, clipId);
    if (!clip) return;

    const stream = selectClipStream(state, clipId);

    const splitDuration = time - clip.startTime;
    if (time === clip.startTime || splitDuration === stream.length) return;

    // Create two new clips pivoting at the time
    const firstClip = initializeClip({
      ...clip,
      duration: splitDuration,
    });
    const secondClip = initializeClip({
      ...clip,
      startTime: time,
      offset: clip.offset + splitDuration,
      duration: stream.length - splitDuration,
    });

    // Create the new clips
    dispatch(deselectClip(clipId));
    dispatch(Clips._sliceClip({ oldClip: clip, firstClip, secondClip }));
    dispatch(
      ClipMap.sliceClipFromClipMap({
        oldClipId: clipId,
        firstClipId: firstClip.id,
        secondClipId: secondClip.id,
      })
    );
  };

export const exportClipsToMidi =
  (clipIds: ClipId[], options = { name: "" }): AppThunk =>
  async (_dispatch, getState) => {
    const state = getState();
    const clips = Selectors.selectClipsByIds(state, clipIds).filter(
      Boolean
    ) as Clip[];
    if (!clips || !clips.length) return;

    // Sort the clips
    const sortedClips = clips.sort((a, b) => a.startTime - b.startTime);
    const startTime = sortedClips[0].startTime;

    // Read through clips
    const tracks: MidiWriter.Track[] = [];

    // Make relevant track clip map
    const trackMap = sortedClips.reduce((acc, clip) => {
      const track = Selectors.selectTrack(state, clip.trackId);
      if (!track) return acc;
      if (!acc[track.id]) acc[track.id] = [];
      acc[track.id].push(clip);
      return acc;
    }, {} as Record<TrackId, Clip[]>);

    // Create a track for each clip
    Object.keys(trackMap).forEach((trackId, index) => {
      const track = Selectors.selectPatternTrack(state, trackId);
      if (!track) return;
      const midiTrack = new MidiWriter.Track();
      tracks[index] = midiTrack;
      // Set track event
      midiTrack.addEvent(
        new MidiWriter.ProgramChangeEvent({
          instrument: index + 1,
        })
      );
      // Add clips
      const clips = trackMap[trackId];
      let lastTime = startTime;
      let wait: MidiWriter.Duration[] = [];

      clips.forEach((clip) => {
        const pattern = Selectors.selectPattern(state, clip.patternId);
        if (!pattern) return;
        const scale = Selectors.selectClipScale(state, clip.id);
        const transforms = Selectors.selectClipTransforms(state, clip.id);
        const stream = getClipStream(clip, pattern, scale, transforms, []);

        // Add stream
        const offset = clip.startTime - lastTime;
        if (offset > 0) {
          wait.push(...new Array(offset).fill("16" as MidiWriter.Duration));
        }
        lastTime = clip.startTime;

        for (let i = 0; i < stream.length; i++) {
          const chord = stream[i];
          if (!chord.length) continue;

          // Compute duration
          const duration = `${16 / chord[0].duration}` as MidiWriter.Duration;
          lastTime += chord[0].duration;

          if (isRest(chord[0])) {
            wait.push(duration);
            continue;
          }

          // Compute pitch array
          const pitch = isRest(chord[0])
            ? ([] as MidiWriter.Pitch[])
            : (chord.map((n) => MIDI.toPitch(n.MIDI)) as MidiWriter.Pitch[]);

          // Create event
          const event = new MidiWriter.NoteEvent({
            pitch,
            duration,
            wait: [...wait],
          });

          // Add event
          tracks[index].addEvent(event);

          // Clear wait if not a rest
          if (!isRest(chord[0]) && wait.length) wait.clear();
        }
      });
    });
    const writer = new MidiWriter.Writer(tracks);
    const blob = new Blob([writer.buildFile()], {
      type: "audio/midi",
    });
    const url = URL.createObjectURL(blob);
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
