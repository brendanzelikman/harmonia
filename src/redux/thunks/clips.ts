import { inRange, union } from "lodash";
import { selectClipStream } from "redux/selectors";
import * as Selectors from "redux/selectors";
import * as Clips from "redux/slices/clips";
import * as Transfroms from "redux/slices/transforms";
import * as ClipMap from "redux/slices/maps/clipMap";
import { addPattern } from "redux/slices/patterns";
import {
  deselectClip,
  selectClips,
  selectTransforms,
  setClipboard,
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
} from "types/clips";
import { MIDI } from "types/midi";
import MidiWriter from "midi-writer-js";
import {
  PatternStream,
  initializePattern,
  PatternId,
  getStreamTicks,
} from "types/patterns";
import { TrackId } from "types/tracks";
import { Transform, TransformId } from "types/transform";
import { Tick } from "types/units";
import {
  createClipsAndTransforms,
  deleteClipsAndTransforms,
} from "redux/slices/clips";
import { Row } from "components/timeline";
import { subdivisionToTicks } from "appUtil";

export type RepeatOptions = {
  repeatCount?: number;
  repeatTransforms?: boolean;
  repeatWithTranspose?: boolean;
};
export const repeatClips =
  (
    clipIds: ClipId[],
    options?: RepeatOptions
  ): AppThunk<Promise<{ clipIds: ClipId[]; transformIds: TransformId[] }>> =>
  async (dispatch, getState) => {
    const state = getState();
    const root = Selectors.selectRoot(state);
    const { toolkit } = root;
    const repeatCount = options?.repeatCount || toolkit?.repeatCount;
    const repeatTransforms =
      options?.repeatTransforms || toolkit?.repeatTransforms;
    const repeatWithTranspose =
      options?.repeatWithTranspose || toolkit?.repeatWithTranspose;
    const { chromaticTranspose, scalarTranspose, chordalTranspose } = toolkit;

    const clips = Selectors.selectClipsByIds(state, clipIds);
    const clipTicks = clips.map((clip) =>
      Selectors.selectClipTicks(state, clip?.id)
    );
    const startTick = Math.min(...clips.map((clip) => clip.tick));
    const endTick = Math.max(
      ...clips.map((clip, i) => clip.tick + clipTicks[i])
    );
    const totalTicks = endTick - startTick;

    let newClips: Clip[] = [];
    let newTransforms: Transform[] = [];

    for (let i = 1; i <= repeatCount; i++) {
      // Move the clips
      const movedClips = clips.map((clip) => ({
        ...clip,
        tick: clip.tick + i * totalTicks,
      }));
      newClips = [...newClips, ...movedClips];

      // Move the transforms
      if (repeatTransforms) {
        clips.forEach((clip, j) => {
          const clipTransforms = Selectors.selectClipTransforms(state, clip.id);
          const currentTransforms = clipTransforms.filter((t: Transform) =>
            inRange(t.tick, clip.tick, clip.tick + clipTicks[j])
          );
          if (currentTransforms.length) {
            const movedTransforms = currentTransforms.map((t: Transform) => ({
              ...t,
              tick: t.tick + i * totalTicks,
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
    return dispatch(createClipsAndTransforms(newClips, newTransforms));
  };

export const mergeClips =
  (clipIds: ClipId[]): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const root = Selectors.selectRoot(state);
    const { toolkit } = root;
    const { mergeName, mergeTransforms } = toolkit;
    const clips = Selectors.selectClipsByIds(state, clipIds).filter(
      Boolean
    ) as Clip[];
    if (!clips || !clips.length) return;
    const sortedClips = clips.sort((a, b) => a.tick - b.tick);
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
        const ticks = getClipTicks(clip, pattern);
        oldTransforms = union(
          oldTransforms,
          transforms.filter((t) =>
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
      Clips.createClip({
        patternId: newPattern.id,
        trackId: sortedClips[0].trackId,
        tick: sortedClips[0].tick,
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
      duration: getStreamTicks(pattern.stream),
    };
    dispatch(Clips.createClip(clip));
  };

export const sliceClip =
  (clipId: ClipId, tick: Tick): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the clip from the store
    const clip = Selectors.selectClip(state, clipId);
    if (!clip) return;

    const stream = selectClipStream(state, clipId);

    const splitTick = tick - clip.tick;
    if (tick === clip.tick || splitTick === stream.length) return;

    // Create two new clips pivoting at the tick
    const firstClip = initializeClip({
      ...clip,
      duration: splitTick,
    });
    const secondClip = initializeClip({
      ...clip,
      tick,
      offset: clip.offset + splitTick,
      duration: stream.length - splitTick,
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

    const scaleTrackIds = Selectors.selectScaleTrackIds(state);
    const trackMap = Selectors.selectTrackMap(state);

    // Sort the clips
    const sortedClips = clips.sort((a, b) => a.tick - b.tick);
    const startTick = sortedClips[0].tick;

    // Read through clips
    const tracks: MidiWriter.Track[] = [];

    // Accumulate clips into tracks
    const clipsByTrack = sortedClips.reduce((acc, clip) => {
      const track = Selectors.selectTrack(state, clip.trackId);
      if (!track) return acc;
      if (!acc[track.id]) acc[track.id] = [];
      acc[track.id].push(clip);
      return acc;
    }, {} as Record<TrackId, Clip[]>);

    // Sort the trackIds descending by view order
    const trackIds = Object.keys(clipsByTrack).sort((a, b) => {
      // Get the pattern tracks of the clips
      const trackA = Selectors.selectPatternTrack(state, a);
      const trackB = Selectors.selectPatternTrack(state, b);
      if (!trackA || !trackB) return 0;
      // Get the scale tracks for each pattern track
      const scaleTrackA = Selectors.selectScaleTrack(
        state,
        trackA.scaleTrackId
      );
      const scaleTrackB = Selectors.selectScaleTrack(
        state,
        trackB.scaleTrackId
      );
      if (!scaleTrackA || !scaleTrackB) return 0;
      // Get the index of each scale track
      const indexA = scaleTrackIds.indexOf(scaleTrackA.id);
      const indexB = scaleTrackIds.indexOf(scaleTrackB.id);
      const diff = indexA - indexB;
      // If the scale tracks are the same, sort by pattern track index
      if (diff === 0) {
        // Get the pattern track ids from the track map
        const patterns = trackMap.byId[scaleTrackA.id];
        const keys = patterns.patternTrackIds;
        const trackIndexA = keys.indexOf(a);
        const trackIndexB = keys.indexOf(b);

        return trackIndexA - trackIndexB;
      }
      // Otherwise, return by scale track index
      return diff;
    });

    // Create a track for each clip
    trackIds.forEach((trackId, index) => {
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
      const clips = clipsByTrack[trackId];
      let lastTick = startTick;
      let wait: MidiWriter.Duration[] = [];

      clips.forEach((clip) => {
        const pattern = Selectors.selectPattern(state, clip.patternId);
        if (!pattern) return;
        const scale = Selectors.selectClipScale(state, clip.id);
        const transforms = Selectors.selectClipTransforms(state, clip.id);
        const stream = getClipStream(clip, pattern, scale, transforms, []);

        // Add stream
        const offset = clip.tick - lastTick;
        if (offset > 0) {
          wait.push(...new Array(offset).fill("16" as MidiWriter.Duration));
        }
        lastTick = clip.tick;

        for (let i = 0; i < stream.length; i++) {
          const chord = stream[i];
          if (!chord.length) continue;

          // Compute duration
          const duration = `${16 / chord[0].duration}` as MidiWriter.Duration;
          lastTick += chord[0].duration;

          if (MIDI.isRest(chord[0])) {
            wait.push(duration);
            continue;
          }

          // Compute pitch array
          const pitch = MIDI.isRest(chord[0])
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
          if (!MIDI.isRest(chord[0]) && wait.length) wait.clear();
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

export const exportSelectedClipsToMidi =
  (options = { name: "" }): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { selectedClipIds } = Selectors.selectRoot(state);
    return dispatch(exportClipsToMidi(selectedClipIds, options));
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
    dispatch(selectClips(newClipIds));
  };

// Select all clips and transforms
export const selectAllClipsAndTransforms =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const clipIds = Selectors.selectClipIds(state);
    const transformIds = Selectors.selectTransformIds(state);
    if (clipIds) dispatch(selectClips(clipIds));
    if (transformIds) dispatch(selectTransforms(transformIds));
  };

// Delete all selected clips and transforms
export const deleteSelectedClipsAndTransforms =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const { selectedClipIds, selectedTransformIds } =
      Selectors.selectRoot(state);
    dispatch(deleteClipsAndTransforms(selectedClipIds, selectedTransformIds));
  };

export const copySelectedClipsAndTransforms =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const clips = Selectors.selectSelectedClips(state);
    const transforms = Selectors.selectSelectedTransforms(state);
    dispatch(setClipboard({ clips, transforms }));
  };

export const cutSelectedClipsAndTransforms =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const clips = Selectors.selectSelectedClips(state);
    const transforms = Selectors.selectSelectedTransforms(state);
    dispatch(setClipboard({ clips, transforms }));
    const clipIds = clips.map((c) => c.id);
    const transformIds = transforms.map((t) => t.id);
    dispatch(deleteClipsAndTransforms(clipIds, transformIds));
  };

export const pasteSelectedClipsAndTransforms =
  (
    rows: Row[]
  ): AppThunk<Promise<{ clipIds: ClipId[]; transformIds: TransformId[] }>> =>
  (dispatch, getState) => {
    const emptyPromise = Promise.resolve({ clipIds: [], transformIds: [] });

    if (!rows?.length) return emptyPromise;

    const state = getState();
    const { clipboard, selectedTrackId } = Selectors.selectRoot(state);
    if (!selectedTrackId) return emptyPromise;

    const { tick } = Selectors.selectTransport(state);
    const trackIds = rows.map((row) => row.trackId).filter(Boolean);

    // Get clips and transforms from the clipboard
    const clipboardClips = [...clipboard?.clips] ?? [];
    const clipboardTransforms = [...clipboard?.transforms] ?? [];

    // Get the earliest start tick
    const firstClip = clipboardClips.length
      ? clipboardClips.sort((a, b) => a.tick - b.tick)?.[0]
      : undefined;
    const firstTransform = clipboardTransforms.length
      ? clipboardTransforms.sort((a, b) => a.tick - b.tick)?.[0]
      : undefined;

    const t1 = firstClip?.tick;
    const t2 = firstTransform?.tick;
    const startTick = t1 && t2 ? Math.min(t1, t2) : t1 ?? t2;

    if (!firstClip && !firstTransform) return emptyPromise;
    if (startTick === undefined) return emptyPromise;

    // Compute the offset between the clipboard and the current tick
    const offset = tick - startTick;

    // Find the original track index of the first clip or transform
    const originalIndex =
      rows
        .filter((r) =>
          [...clipboardClips, ...clipboardTransforms].some(
            (c) => c.trackId === r.trackId
          )
        )
        .sort((a, b) => a.index - b.index)?.[0]?.index ?? -1;
    if (originalIndex === -1) return emptyPromise;

    // Find the selected track index
    const selectedIndex = trackIds.indexOf(selectedTrackId);
    if (selectedIndex === -1) return emptyPromise;

    // Compute the offset between the selected track and the original track
    const rowOffset = selectedIndex - originalIndex;

    let newClips: Clip[] = [];
    let newTransforms: Transform[] = [];

    // Create new clips
    for (const clip of clipboardClips) {
      // Find the new track index
      const thisIndex = trackIds.indexOf(clip.trackId);
      if (thisIndex === -1) return emptyPromise;

      // Find the new track
      const newIndex = thisIndex + rowOffset;
      const newTrack = rows[newIndex];
      if (!newTrack || newTrack.type !== "patternTrack") return emptyPromise;

      // Create a new clip with the new track id and time
      const trackId = newTrack.trackId;
      if (!trackId) return emptyPromise;
      newClips.push({
        ...clip,
        tick: clip.tick + offset,
        trackId,
      });
    }

    // Create new transforms
    for (const transform of clipboardTransforms) {
      // Find the new track index
      const thisIndex = trackIds.indexOf(transform.trackId);
      if (thisIndex === -1) return emptyPromise;

      // Find the new track
      const newIndex = thisIndex + rowOffset;
      const newTrack = rows[newIndex];

      // Create a new transform with the new track id and time
      const trackId = newTrack.trackId;
      if (!trackId) return emptyPromise;
      newTransforms.push({
        ...transform,
        tick: transform.tick + offset,
        trackId,
      });
    }

    // Create the clips and transforms
    return dispatch(createClipsAndTransforms(newClips, newTransforms));
  };

export const duplicateSelectedClipsAndTransforms =
  (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const { selectedClipIds, selectedTransformIds } =
      Selectors.selectRoot(state);
    if (!selectedClipIds.length && !selectedTransformIds.length) return;
    const selectedClips = Selectors.selectSelectedClips(state);
    const selectedTransforms = Selectors.selectSelectedTransforms(state);
    const selectedClipTicks = selectedClips.map((clip) =>
      Selectors.selectClipTicks(state, clip.id)
    );
    const transport = Selectors.selectTransport(state);
    const gridTicks = subdivisionToTicks(transport.subdivision);
    // Get the start time of the earliest clip or transform
    const startTick = Math.min(
      ...selectedClips.map((clip) => clip.tick),
      ...selectedTransforms.map((transform) => transform.tick)
    );
    // Get the end time of the latest clip or transform
    const endTick = Math.max(
      ...selectedClips.map((clip, i) => clip.tick + selectedClipTicks[i]),
      ...selectedTransforms.map((transform) => transform.tick + gridTicks)
    );
    // Calculate the offset between the start and end times
    const offset = endTick - startTick;

    // Create new clips and transforms with the new times
    const newClips = selectedClips.map((clip) => ({
      ...clip,
      tick: clip.tick + offset,
    }));
    const newTransforms = selectedTransforms.map((transform) => ({
      ...transform,
      tick: transform.tick + offset,
    }));
    const { clipIds, transformIds } = await dispatch(
      createClipsAndTransforms(newClips, newTransforms)
    );

    // Select the new clips and transforms
    if (clipIds) dispatch(selectClips(clipIds));
    if (transformIds) dispatch(selectTransforms(transformIds));

    return { clipIds, transformIds };
  };
