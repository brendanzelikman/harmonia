import { AppThunk } from "redux/store";
import { getClipboardMedia } from "types/Timeline";
import {
  getOffsetedMedia,
  getValidMedia,
  getMediaClips,
  getMediaTranspositions,
  getDuplicatedMedia,
  getMediaDuration,
} from "types/Media";
import { inRange, union } from "lodash";
import {
  Transposition,
  TranspositionId,
  TranspositionOffsetRecord,
  initializeTransposition,
  isTransposition,
} from "types/Transposition";
import {
  Clip,
  ClipId,
  ClipNoId,
  getClipDuration,
  getClipNotes,
  getClipStream,
  initializeClip,
  isClip,
} from "types/Clip";
import * as Patterns from "redux/Pattern";
import * as Clips from "redux/Clip";
import * as Transpositions from "redux/Transposition";
import * as Session from "redux/Session";
import * as Root from "redux/Root";
import { selectSubdivisionTicks, setClipboard } from "redux/Timeline";
import {
  selectTransport,
  selectOrderedTrackIds,
  selectTimeline,
  selectTrackMap,
  selectPatternTrackMap,
  selectScaleTrackMap,
  selectClipDuration,
  selectScaleMap,
} from "redux/selectors";

import { PatternStream } from "types/Pattern";
import { Transport } from "tone";

/**
 * Creates a list of media and adds them to the store.
 * @param partialClips The list of clips to create.
 * @param partialTranspositions The list of transpositions to create.
 * @returns A promise that resolves to the list of clip IDs and transposition IDs.
 */
export const createMedia =
  (
    partialClips: Partial<ClipNoId>[],
    partialTranspositions: Partial<Transposition>[]
  ): AppThunk<
    Promise<{
      clipIds: ClipId[];
      transpositionIds: TranspositionId[];
    }>
  > =>
  (dispatch) => {
    return new Promise((resolve) => {
      // Initialize the media
      const clips = partialClips.map(initializeClip);
      const transpositions = partialTranspositions.map(initializeTransposition);

      // Add the media to the store
      const payload = { clips, transpositions };
      dispatch(Clips.addClips(payload));
      dispatch(Transpositions.addTranspositions(payload));
      dispatch(Session.addMediaToSession(payload));

      // Resolve the promise with the clip IDs and transposition IDs
      const clipIds = clips.map((c) => c.id);
      const transpositionIds = transpositions.map((t) => t.id);
      const promiseResult = { clipIds, transpositionIds };
      resolve(promiseResult);
    });
  };

/**
 * Updates a list of media in the store.
 * @param clips The list of clips to update.
 * @param transpositions The list of transpositions to update.
 * @returns A promise that resolves to the list of clip IDs and transposition IDs.
 */
export const updateMedia =
  (
    clips: Partial<Clip>[],
    transpositions: Partial<Transposition>[]
  ): AppThunk<
    Promise<{
      clipIds: ClipId[];
      transpositionIds: TranspositionId[];
    }>
  > =>
  (dispatch) => {
    return new Promise((resolve) => {
      // Update the media in the store
      const payload = { clips, transpositions };
      dispatch(Clips.updateClips(payload));
      dispatch(Transpositions.updateTranspositions(payload));

      // Resolve the promise with the clip IDs and transposition IDs
      const clipIds = clips?.map((clip) => clip.id!) || [];
      const transpositionIds =
        transpositions?.map((transposition) => transposition.id!) || [];
      const promiseResult = { clipIds, transpositionIds };
      resolve(promiseResult);
    });
  };

/**
 * Deletes a list of media from the store.
 * @param clips The list of clips to delete.
 * @param transpositions The list of transpositions to delete.
 * @returns A promise that resolves to true if the media were deleted.
 */
export const deleteMedia =
  (clips: Clip[], transpositions: Transposition[]): AppThunk =>
  (dispatch) => {
    return new Promise((resolve) => {
      // Resolve to false if any clips or transpositions are invalid
      if (clips.some((clip) => !isClip(clip))) resolve(false);
      if (transpositions.some((t) => !isTransposition(t))) resolve(false);

      // Deselect the media
      dispatch(Root.removeSelectedClips(clips.map((clip) => clip.id)));
      dispatch(
        Root.removeSelectedTranspositions(transpositions.map((t) => t.id))
      );

      // Delete the media
      dispatch(Clips.removeClips({ clips, transpositions }));
      dispatch(Transpositions.removeTranspositions({ transpositions }));
      dispatch(
        Session.removeMediaFromSession({
          clips,
          transpositions,
        })
      );

      // Resolve to promise
      resolve(true);
    });
  };

/**
 * Select all media.
 */
export const selectAllMedia = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const clipIds = Clips.selectClipIds(state);
  const transpositionIds = Transpositions.selectTranspositionIds(state);
  dispatch(Root.setSelectedClips(clipIds));
  dispatch(Root.setSelectedTranspositions(transpositionIds));
};

/**
 * Copy all selected media to the clipboard.
 */
export const copySelectedMedia = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const clips = Root.selectSelectedClips(state);
  const transpositions = Root.selectSelectedTranspositions(state);
  dispatch(setClipboard({ clips, transpositions }));
};

/**
 * Cut all selected media into the clipboard, deleting them.
 */
export const cutSelectedMedia = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const clips = Root.selectSelectedClips(state);
  const transpositions = Root.selectSelectedTranspositions(state);
  dispatch(setClipboard({ clips, transpositions }));
  dispatch(deleteMedia(clips, transpositions));
};

/**
 * Paste all media from the clipboard to the timeline, starting at the current tick from the selected track.
 * @returns A Promise resolving to the pasted clip and transposition IDs.
 */
export const pasteSelectedMedia =
  (): AppThunk<
    Promise<{
      clipIds: ClipId[];
      transpositionIds: TranspositionId[];
    }>
  > =>
  (dispatch, getState) => {
    const state = getState();
    const emptyPromise = Promise.resolve({ clipIds: [], transpositionIds: [] });

    // Do nothing if there are no tracks
    const trackIds = selectOrderedTrackIds(state);
    if (!trackIds?.length) return emptyPromise;

    // Do nothing if no track is selected
    const { selectedTrackId } = Root.selectRoot(state);
    if (!selectedTrackId) return emptyPromise;

    // Get the media from the clipboard
    const { clipboard } = selectTimeline(state);
    const media = getClipboardMedia(clipboard);
    if (!media?.length) return emptyPromise;

    // Get the offseted media
    const offsetedMedia = getOffsetedMedia(
      media,
      Transport.ticks,
      selectedTrackId,
      trackIds
    );

    // Make sure all of the media is valid
    const trackMap = selectTrackMap(state);
    const validMedia = getValidMedia(offsetedMedia, trackMap);
    if (validMedia.length !== offsetedMedia.length) return emptyPromise;

    // Create the media
    const newClips = getMediaClips(validMedia);
    const newTranspositions = getMediaTranspositions(validMedia);
    dispatch(createMedia(newClips, newTranspositions));

    // Select the new media
    const clipIds = newClips.map((clip) => clip.id);
    const transpositionIds = newTranspositions.map((t) => t.id);
    dispatch(Root.setSelectedClips(clipIds));
    dispatch(Root.setSelectedTranspositions(transpositionIds));

    // Resolve the promise with the clip IDs and transposition IDs
    return Promise.resolve({ clipIds, transpositionIds });
  };

/**
 * Duplicate all selected media.
 */
export const duplicateSelectedMedia =
  (): AppThunk => async (dispatch, getState) => {
    const state = getState();

    const { selectedClipIds, selectedTranspositionIds } =
      Root.selectRoot(state);
    if (!selectedClipIds.length && !selectedTranspositionIds.length) return;

    // Get the selected clips and their durations
    const clips = Root.selectSelectedClips(state);
    const clipDurations = clips.map((clip) =>
      Clips.selectClipDuration(state, clip.id)
    );

    // Get the selected transpositions and their durations
    const transpositions = Root.selectSelectedTranspositions(state);
    const transpositionDurations = transpositions.map(
      (transposition) => transposition.duration || 1
    );

    // Get the corresponding media and their durations
    const media = [...clips, ...transpositions];
    const mediaDurations = [...clipDurations, ...transpositionDurations];

    // Duplicate the media
    const duplicatedMedia = getDuplicatedMedia(media, mediaDurations);

    // Create the media
    const duplicatedClips = getMediaClips(duplicatedMedia);
    const duplicatedTranspositions = getMediaTranspositions(duplicatedMedia);
    const newMedia = await dispatch(
      createMedia(duplicatedClips, duplicatedTranspositions)
    );

    // Select the new media
    dispatch(Root.setSelectedClips(newMedia.clipIds));
    dispatch(Root.setSelectedTranspositions(newMedia.transpositionIds));

    // Return the clip IDs and transposition IDs
    return newMedia;
  };

/**
 * Move all selected media by the given offset.
 */
export const moveSelectedMedia =
  (offset: number): AppThunk =>
  (dispatch, getState) => {
    if (!offset) return;
    const state = getState();
    const selectedMedia = Root.selectSelectedMedia(state);

    // Move the media and make sure it's valid
    const newMedia = selectedMedia.map((media) => ({
      ...media,
      tick: media.tick + offset,
    }));
    if (newMedia.some((media) => media.tick < 0)) return;

    // Update the media
    const newClips = getMediaClips(newMedia);
    const newTranspositions = getMediaTranspositions(newMedia);
    dispatch(updateMedia(newClips, newTranspositions));
  };

/**
 * Move all selected media to the left by one subdivision tick.
 */
export const moveSelectedMediaLeft = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const ticks = selectSubdivisionTicks(state);
  dispatch(moveSelectedMedia(-ticks));
};

/**
 * Move all selected media to the right by one subdivision tick.
 */
export const moveSelectedMediaRight = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const ticks = selectSubdivisionTicks(state);
  dispatch(moveSelectedMedia(ticks));
};

/**
 * Delete all selected media.
 */
export const deleteSelectedMedia = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const clips = Root.selectSelectedClips(state);
  const transpositions = Root.selectSelectedTranspositions(state);
  dispatch(deleteMedia(clips, transpositions));
};

/**
 * Merge the selected clips (and transpositions if specified).
 * * If merging transpositions, any overlapping transpositions will be merged.
 * * If a merge name is specified, the new pattern will be named accordingly.
 * @param clips The clips to merge.
 */
export const mergeClips =
  (clips: Clip[]): AppThunk =>
  async (dispatch, getState) => {
    if (!clips || !clips.length) return;
    const state = getState();
    const sessionMap = Session.selectSessionMap(state);
    const patternMap = Patterns.selectPatternMap(state);
    const transpositionMap = Transpositions.selectTranspositionMap(state);
    const patternTrackMap = selectPatternTrackMap(state);
    const scaleMap = selectScaleMap(state);
    const scaleTrackMap = selectScaleTrackMap(state);

    // Get the info from the toolkit
    const root = Root.selectRoot(state);
    const selectedTranspositions = Root.selectSelectedTranspositions(state);
    const { toolkit } = root;
    const { mergeName, mergeTranspositions } = toolkit;
    const sortedClips = clips.sort((a, b) => a.tick - b.tick);
    let oldTranspositions: Transposition[] = [];

    // Create a merged pattern by reducing the sorted
    const stream = sortedClips.reduce((acc, clip) => {
      // Get the clip pattern
      const pattern = Patterns.selectPatternById(state, clip.patternId);
      if (!pattern) return acc;

      // Get all chords from the clip, transposing if specified
      const allChords = mergeTranspositions
        ? getClipStream(
            clip,
            patternMap,
            patternTrackMap,
            scaleMap,
            scaleTrackMap,
            transpositionMap,
            sessionMap
          )
        : getClipNotes(clip, pattern.stream);

      // Add any overlapping transpositions if merging
      if (mergeTranspositions) {
        const ticks = getClipDuration(clip, pattern);
        oldTranspositions = union(
          oldTranspositions,
          selectedTranspositions.filter((t) =>
            inRange(t.tick, clip.tick, clip.tick + ticks)
          )
        );
      }

      // Filter out any empty chords
      const chords = allChords.filter((chord) => !!chord.length);

      // Return the merged chords
      return [...acc, ...chords];
    }, [] as PatternStream);

    // Create and select a new pattern
    const patternIds = await dispatch(
      Patterns.createPattern({
        stream,
        name: !!mergeName.length ? mergeName : "New Pattern",
      })
    );
    if (!patternIds?.length) return;
    const patternId = patternIds[0];
    dispatch(Root.setSelectedPattern(patternId));

    // Create a new clip
    const { trackId, tick } = sortedClips[0];
    await dispatch(Clips.createClips([{ trackId, patternId, tick }]));

    // Delete the old clips
    dispatch(Clips.deleteClips(clips));

    // Delete any merged transpositions if merging
    if (mergeTranspositions && oldTranspositions.length) {
      dispatch(Transpositions.deleteTranspositions(oldTranspositions));
    }
  };

export const repeatClips =
  (
    clips: Clip[]
  ): AppThunk<
    Promise<{
      clipIds: ClipId[];
      transpositionIds: TranspositionId[];
    }>
  > =>
  async (dispatch, getState) => {
    const state = getState();

    // Unpack the toolkit
    const root = Root.selectRoot(state);
    const { toolkit } = root;
    const { repeatCount } = toolkit;
    const { repeatTranspositions, repeatWithTransposition } = toolkit;

    // Get the total duration of the selection
    const durations = clips.map((clip) => selectClipDuration(state, clip.id));
    const duration = getMediaDuration(clips, durations);

    // Get the clip transpositions ahead of time
    const clipTranspositions = clips.map((clip) =>
      Clips.selectClipTranspositions(state, clip.id)
    );

    // Initialize the loop variables
    const newClips: Clip[] = [];
    const newTranspositions: Transposition[] = [];

    // Iterate through the repeat count
    for (let i = 1; i <= repeatCount; i++) {
      // Move the clips
      const movedClips = clips.map((clip) => ({
        ...clip,
        tick: clip.tick + i * duration,
      }));
      newClips.push(...movedClips);

      // Move the transpositions
      if (!repeatTranspositions) continue;
      clips.forEach((clip, j) => {
        // Get the current transpositions of each clip
        const transpositions = clipTranspositions[j];
        const currentTranspositions = transpositions.filter(
          (t) =>
            t.tick <= clip.tick &&
            clip.tick <= t.tick + (t.duration || 1) &&
            t.tick + (t.duration || 1) <= clip.tick + durations[j]
        );
        // Iterate over the current transpositions
        const movedTranspositions = currentTranspositions.map((t) => {
          // Get the new offset record
          const offsets = Object.keys(t.offsets).reduce((acc, key) => {
            acc[key] = t.offsets[key];
            if (repeatWithTransposition) acc[key] += t.offsets[key];
            return acc;
          }, {} as TranspositionOffsetRecord);

          // Return the new transposition
          return { ...t, tick: t.tick + i * duration, offsets };
        });

        // Add the moved transpositions to the list
        if (!movedTranspositions.length) return;
        newTranspositions.push(...movedTranspositions);
      });
    }
    // Create the media
    return dispatch(createMedia(newClips, newTranspositions));
  };
