import * as Patterns from "redux/Pattern";
import * as Clips from "redux/Clip";
import * as Transpositions from "redux/Transposition";
import * as Hierarchy from "redux/TrackHierarchy";
import * as Timeline from "redux/Timeline";
import { AppThunk } from "redux/store";
import { getClipboardMedia } from "types/Timeline";
import {
  getOffsetedMedia,
  getValidMedia,
  getMediaClips,
  getMediaTranspositions,
  getDuplicatedMedia,
  getMediaDuration,
  Media,
  PartialMediaPayload,
  MediaPromise,
} from "types/Media";
import { without } from "lodash";
import {
  Transposition,
  initializeTransposition,
  isTransposition,
} from "types/Transposition";
import { Clip, getClipStream, initializeClip, isClip } from "types/Clip";

import { selectSubdivisionTicks } from "redux/Timeline";
import {
  selectOrderedTrackIds,
  selectTrackMap,
  selectPatternTrackMap,
  selectScaleTrackMap,
  selectClipDuration,
  selectScaleMap,
} from "redux/selectors";

import { Transport } from "tone";
import { Tick } from "types/units";
import { PatternChord, PatternStream } from "types/Pattern";
import { MIDI } from "types/midi";

/**
 * Creates a list of media and adds them to the store.
 * @param partialClips The list of clips to create.
 * @param partialTranspositions The list of transpositions to create.
 * @returns A promise that resolves to the list of clip IDs and transposition IDs.
 */
export const createMedia =
  ({
    clips: partialClips,
    transpositions: partialTranspositions,
  }: PartialMediaPayload): AppThunk<Promise<MediaPromise>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      // Initialize the media
      const clips = (partialClips || []).map(initializeClip);
      const transpositions = (partialTranspositions || []).map(
        initializeTransposition
      );

      // Add the media to the store
      const payload = { clips, transpositions };
      dispatch(Clips.addClips(payload));
      dispatch(Transpositions.addTranspositions(payload));
      dispatch(Hierarchy.addMediaToHierarchy(payload));

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
  (payload: PartialMediaPayload): AppThunk<Promise<MediaPromise>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      // Update the media in the store
      dispatch(Clips.updateClips(payload));
      dispatch(Transpositions.updateTranspositions(payload));

      // Resolve the promise with the clip IDs and transposition IDs
      const clips = payload.clips || [];
      const transpositions = payload.transpositions || [];
      const clipIds = clips.map((clip) => clip.id!);
      const transpositionIds = transpositions.map((t) => t.id!);
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
  (dispatch, getState) => {
    const state = getState();
    const mediaSelection = Timeline.selectMediaSelection(state);
    return new Promise((resolve) => {
      // Resolve to false if any clips or transpositions are invalid
      if (clips.some((clip) => !isClip(clip))) resolve(false);
      if (transpositions.some((t) => !isTransposition(t))) resolve(false);

      // Deselect the media
      dispatch(
        Timeline.updateMediaSelection({
          clipIds: without(
            mediaSelection.clipIds,
            ...clips.map((clip) => clip.id)
          ),
          transpositionIds: without(
            mediaSelection.transpositionIds,
            ...transpositions.map((t) => t.id)
          ),
        })
      );

      // Delete the media
      dispatch(Clips.removeClips({ clips, transpositions }));
      dispatch(Transpositions.removeTranspositions({ transpositions }));
      dispatch(
        Hierarchy.removeMediaFromHierarchy({
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
  dispatch(Timeline.updateMediaSelection({ clipIds, transpositionIds }));
};

/**
 * Copy all selected media to the clipboard.
 */
export const copySelectedMedia = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const clips = Timeline.selectSelectedClips(state);
  const transpositions = Timeline.selectSelectedTranspositions(state);
  dispatch(Timeline.updateMediaClipboard({ clips, transpositions }));
};

/**
 * Cut all selected media into the clipboard, deleting them.
 */
export const cutSelectedMedia = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const clips = Timeline.selectSelectedClips(state);
  const transpositions = Timeline.selectSelectedTranspositions(state);
  dispatch(Timeline.updateMediaClipboard({ clips, transpositions }));
  dispatch(deleteMedia(clips, transpositions));
};

/**
 * Paste all media from the clipboard to the timeline, starting at the current tick from the selected track.
 * @returns A Promise resolving to the pasted clip and transposition IDs.
 */
export const pasteSelectedMedia = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const emptyPromise = Promise.resolve({ clipIds: [], transpositionIds: [] });

  // Do nothing if there are no tracks
  const trackIds = selectOrderedTrackIds(state);
  if (!trackIds?.length) return emptyPromise;

  // Do nothing if no track is selected
  const selectedTrackId = Timeline.selectSelectedTrackId(state);
  if (!selectedTrackId) return emptyPromise;

  // Get the media from the clipboard
  const clipboard = Timeline.selectMediaClipboard(state);
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
  const payload = { clips: newClips, transpositions: newTranspositions };
  return dispatch(createMedia(payload)).then((ids) =>
    dispatch(Timeline.updateMediaSelection(ids))
  );
};

/**
 * Duplicate all selected media.
 */
export const duplicateSelectedMedia =
  (): AppThunk => async (dispatch, getState) => {
    const state = getState();

    const { clipIds, transpositionIds } = Timeline.selectMediaSelection(state);
    if (!clipIds.length && !transpositionIds.length) return;

    // Get the selected clips and their durations
    const clips = Timeline.selectSelectedClips(state);
    const clipDurations = clips.map((clip) =>
      Clips.selectClipDuration(state, clip.id)
    );

    // Get the selected transpositions and their durations
    const transpositions = Timeline.selectSelectedTranspositions(state);
    const transpositionDurations = transpositions.map(
      (transposition) => transposition.duration || 1
    );

    // Get the corresponding media and their durations
    const media = [...clips, ...transpositions];
    const mediaDurations = [...clipDurations, ...transpositionDurations];

    // Duplicate the media
    const duplicatedMedia = getDuplicatedMedia(media, mediaDurations);

    // Create and select the new media
    const duplicatedClips = getMediaClips(duplicatedMedia);
    const duplicatedTranspositions = getMediaTranspositions(duplicatedMedia);
    const payload = {
      clips: duplicatedClips,
      transpositions: duplicatedTranspositions,
    };
    dispatch(createMedia(payload)).then((ids) =>
      dispatch(Timeline.updateMediaSelection(ids))
    );
  };

/**
 * Move all selected media by the given offset.
 */
export const moveSelectedMedia =
  (offset: number): AppThunk =>
  (dispatch, getState) => {
    if (!offset) return;
    const state = getState();
    const selectedMedia = Timeline.selectSelectedMedia(state);

    // Move the media and make sure it's valid
    const newMedia = selectedMedia.map((media) => ({
      ...media,
      tick: media.tick + offset,
    }));
    if (newMedia.some((media) => media.tick < 0)) return;

    // Update the media
    const newClips = getMediaClips(newMedia);
    const newTranspositions = getMediaTranspositions(newMedia);
    const payload = { clips: newClips, transpositions: newTranspositions };
    dispatch(updateMedia(payload));
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
  const clips = Timeline.selectSelectedClips(state);
  const transpositions = Timeline.selectSelectedTranspositions(state);
  dispatch(deleteMedia(clips, transpositions));
};

/**
 * Slice the media at a given tick.
 * @param id The ID of the media to slice.
 * @param tick The tick to slice the media at.
 */
export const sliceMedia =
  (media?: Media, tick: Tick = 0): AppThunk =>
  (dispatch, getState) => {
    if (!media || tick < 0) return;
    const state = getState();
    const { clipIds, transpositionIds } = Timeline.selectMediaSelection(state);

    // Get the clip and stream from the store
    const oldClip = Clips.selectClipById(state, media.id);
    const oldTransposition = Transpositions.selectTranspositionById(
      state,
      media.id
    );
    if (!oldClip && !oldTransposition) return;
    const oldMedia = (oldClip || oldTransposition) as Media;
    const isClip = !!oldClip;

    const duration = getMediaDuration(
      [oldMedia],
      isClip ? [selectClipDuration(state, oldMedia.id)] : []
    );

    // Find the tick to split the clip at
    const splitTick = tick - oldMedia.tick;
    if (tick === oldMedia.tick || splitTick === duration) return;
    if (splitTick < 0 || (isClip && splitTick > media.tick + duration)) return;

    // Create two new items pivoting at the tick
    const firstMedia: Media = isClip
      ? initializeClip({
          ...oldClip,
          duration: splitTick,
        })
      : initializeTransposition({
          ...oldTransposition,
          duration: splitTick,
        });

    const secondMedia: Media = isClip
      ? initializeClip({
          ...oldClip,
          tick,
          offset: oldClip.offset + splitTick,
          duration: duration - splitTick,
        })
      : initializeTransposition({
          ...oldTransposition,
          tick,
          duration: !!oldMedia.duration ? duration - splitTick : 0,
        });

    // Deselect the media item
    if (isClip) {
      dispatch(
        Timeline.updateMediaSelection({
          clipIds: without(clipIds, oldMedia.id),
        })
      );
    } else {
      dispatch(
        Timeline.updateMediaSelection({
          transpositionIds: without(transpositionIds, oldMedia.id),
        })
      );
    }

    // Slice the media in its corresponding slice
    if (isClip) {
      if (!oldClip) return;
      const clipPayload = {
        oldClip,
        firstClip: firstMedia as Clip,
        secondClip: secondMedia as Clip,
      };
      dispatch(Clips._sliceClip(clipPayload));
    } else {
      if (!oldTransposition) return;
      const transpositionPayload = {
        oldTransposition,
        firstTransposition: firstMedia as Transposition,
        secondTransposition: secondMedia as Transposition,
      };
      dispatch(Transpositions._sliceTransposition(transpositionPayload));
    }

    // Slice the media in the hierarchy
    const hierarchyPayload = {
      oldId: oldMedia.id,
      newIds: [firstMedia.id, secondMedia.id],
    };
    dispatch(Hierarchy.sliceMediaInHierarchy(hierarchyPayload));
  };

/**
 * Merge the selected media.
 */
export const mergeSelectedMedia =
  (options: { name?: string } = {}): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const selectedMedia = Timeline.selectSelectedMedia(state);
    if (!selectedMedia.length) return;
    const trackNodeMap = Hierarchy.selectTrackNodeMap(state);
    const patternMap = Patterns.selectPatternMap(state);
    const transpositionMap = Transpositions.selectTranspositionMap(state);
    const patternTrackMap = selectPatternTrackMap(state);
    const scaleMap = selectScaleMap(state);
    const scaleTrackMap = selectScaleTrackMap(state);

    // Get the info from the toolkit
    const selectedClips = Timeline.selectSelectedClips(state);
    const selectedTranspositions = Timeline.selectSelectedTranspositions(state);

    const patternNames: string[] = [];

    // Iterate through all clips and merge their streams
    const sortedClips = selectedClips.sort((a, b) => a.tick - b.tick);
    const stream = sortedClips.reduce((acc, clip) => {
      // Get the clip pattern
      const pattern = patternMap[clip.patternId];
      if (!pattern) return acc;
      patternNames.push(pattern.name);

      // Get the clip stream
      const duration = selectClipDuration(state, clip.id);
      let stream = getClipStream({
        clip,
        patternMap,
        patternTrackMap,
        scaleMap,
        scaleTrackMap,
        transpositionMap,
        trackNodeMap,
      });

      // Make sure the duration of the new stream is the same as the clip duration
      let totalDuration = 0;
      stream = stream.reduce((acc, chord) => {
        if (totalDuration > duration) return acc;
        const root = chord[0];
        if (!root) return acc;
        const chordDuration = root.duration;
        if (totalDuration + chordDuration > duration) {
          const newDuration = duration - totalDuration;
          const newChord = chord.map((n) => ({
            ...n,
            duration: newDuration,
          }));
          totalDuration += newDuration;
          return [...acc, newChord];
        }
        totalDuration += chordDuration;
        return [...acc, chord];
      }, [] as PatternStream);

      if (!stream.length) {
        const rest: PatternChord = [{ duration, MIDI: MIDI.Rest, velocity: 0 }];
        stream = [rest];
      }

      // Return the merged stream
      return [...acc, ...stream];
    }, [] as PatternStream);

    // Create and select a new pattern
    const name = options?.name || patternNames.join(" + ");
    const pattern = { stream, name };
    const patternId = await dispatch(Patterns.createPattern(pattern));
    Timeline.updateMediaDraft({ clip: { patternId } });

    // Create a new clip
    const { trackId, tick } = sortedClips[0];
    const clip = { trackId, patternId, tick };
    await dispatch(Clips.createClips([clip]));

    // Delete the old media
    dispatch(deleteMedia(selectedClips, selectedTranspositions));
  };
