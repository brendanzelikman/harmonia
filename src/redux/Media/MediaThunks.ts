import * as Patterns from "redux/Pattern";
import * as Clips from "redux/Clip";
import * as Poses from "redux/Transposition";
import * as Hierarchy from "redux/TrackHierarchy";
import * as Timeline from "redux/Timeline";
import { Thunk } from "types/Project";
import { getClipboardMedia } from "types/Timeline";
import {
  getOffsettedMedia,
  getValidMedia,
  getMediaClips,
  getMediaTranspositions,
  getDuplicatedMedia,
  getMediaDuration,
  Media,
  UpdateMediaPayload,
  RemoveMediaPayload,
  NewMediaPayload,
} from "types/Media";
import { without } from "lodash";
import { Transposition, initializeTransposition } from "types/Transposition";
import { Clip, initializeClip } from "types/Clip";
import { selectSubdivisionTicks } from "redux/Timeline";
import {
  selectOrderedTrackIds,
  selectTrackMap,
  selectClipDuration,
  selectClipStream,
} from "redux/selectors";
import { Transport } from "tone";
import { Tick } from "types/units";
import {
  PatternId,
  PatternMidiStream,
  PatternStream,
  getPatternBlockDuration,
  getPatternName,
  isPatternRest,
} from "types/Pattern";
import { setEditorAction } from "redux/Editor";

/** Create a list of media and add it to the slice and hierarchy. */
export const createMedia =
  (update: UpdateMediaPayload): Thunk<NewMediaPayload> =>
  (dispatch) => {
    // Initialize the media
    const clips = (update.clips || []).map(initializeClip);
    const poses = (update.transpositions || []).map(initializeTransposition);
    const payload = { clips, transpositions: poses };

    // Add the media to the respective slices and track hierarchy
    dispatch(Clips.addClips(payload));
    dispatch(Poses.addTranspositions(payload));
    dispatch(Hierarchy.addMediaToHierarchy(payload));

    // Return the newly created clip IDs and transposition IDs
    const clipIds = clips.map((c) => c.id);
    const poseIds = poses.map((t) => t.id);
    const promiseResult = { clipIds, transpositionIds: poseIds };
    return promiseResult;
  };

/** Update a list of media. */
export const updateMedia =
  (payload: UpdateMediaPayload): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const clipMap = Clips.selectClipMap(project);
    const poseMap = Poses.selectTranspositionMap(project);

    // Update the media in the respective slices
    dispatch(Clips.updateClips(payload));
    dispatch(Poses.updateTranspositions(payload));

    // Check if any of the media were moved to a different track
    const { clips, transpositions: poses } = payload;
    const movedClips = clips?.filter(
      ({ id, trackId }) => !!trackId && trackId !== clipMap[id]?.trackId
    );
    const movedPoses = poses?.filter(
      ({ id, trackId }) => !!trackId && trackId !== poseMap[id]?.trackId
    );

    // Update the media in the track hierarchy
    Hierarchy.updateMediaInHierarchy({
      clips: movedClips,
      transpositions: movedPoses,
    });
  };

/** Delete a list of media from the store. */
export const deleteMedia =
  (payload: RemoveMediaPayload): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const mediaSelection = Timeline.selectMediaSelection(project);
    const { clipIds, transpositionIds } = payload;

    // Remove the media from the media selection
    dispatch(
      Timeline.updateMediaSelection({
        clipIds: without(mediaSelection.clipIds, ...clipIds),
        transpositionIds: without(
          mediaSelection.transpositionIds,
          ...transpositionIds
        ),
      })
    );

    // Delete the media from the slices and hierarchy
    dispatch(Clips.removeClips(payload));
    dispatch(Poses.removeTranspositions(payload));
    dispatch(Hierarchy.removeMediaFromHierarchy(payload));
  };

/** Add all media to the selection. */
export const addAllMediaToSelection = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clipIds = Clips.selectClipIds(project);
  const transpositionIds = Poses.selectTranspositionIds(project);
  dispatch(Timeline.updateMediaSelection({ clipIds, transpositionIds }));
};

/** Copy all selected media to the clipboard. */
export const copySelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clips = Timeline.selectSelectedClips(project);
  const transpositions = Timeline.selectSelectedTranspositions(project);
  dispatch(Timeline.updateMediaClipboard({ clips, transpositions }));
};

/** Cut all selected media into the clipboard, deleting them. */
export const cutSelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();

  // Copy the media to the clipboard
  const clips = Timeline.selectSelectedClips(project);
  const transpositions = Timeline.selectSelectedTranspositions(project);
  dispatch(Timeline.updateMediaClipboard({ clips, transpositions }));

  // Delete the media
  const clipIds = Timeline.selectSelectedClipIds(project);
  const transpositionIds = Timeline.selectSelectedTranspositionIds(project);
  dispatch(deleteMedia({ clipIds, transpositionIds }));
};

/**
 * Paste all media from the clipboard to the timeline,
 * starting at the current tick from the selected track.
 */
export const pasteSelectedMedia =
  (): Thunk<NewMediaPayload> => (dispatch, getProject) => {
    const project = getProject();
    const noMedia = { clipIds: [], transpositionIds: [] };

    // Do nothing if there are no tracks
    const trackIds = selectOrderedTrackIds(project);
    if (!trackIds?.length) return noMedia;

    // Do nothing if no track is selected
    const selectedTrackId = Timeline.selectSelectedTrackId(project);
    if (!selectedTrackId) return noMedia;

    // Get the media from the clipboard
    const clipboard = Timeline.selectMediaClipboard(project);
    const media = getClipboardMedia(clipboard);
    if (!media?.length) return noMedia;

    // Get the offseted media
    const offsetedMedia = getOffsettedMedia(
      media,
      Transport.ticks,
      selectedTrackId,
      trackIds
    );

    // Make sure all of the media is valid
    const trackMap = selectTrackMap(project);
    const validMedia = getValidMedia(offsetedMedia, trackMap);
    if (validMedia.length !== offsetedMedia.length) return noMedia;

    // Create the media
    const newClips = getMediaClips(validMedia);
    const newTranspositions = getMediaTranspositions(validMedia);
    const payload = { clips: newClips, transpositions: newTranspositions };
    const newMedia = dispatch(createMedia(payload));
    dispatch(Timeline.updateMediaSelection(newMedia));
    return newMedia;
  };

/** Duplicate all selected media. */
export const duplicateSelectedMedia =
  (): Thunk => async (dispatch, getProject) => {
    const project = getProject();
    const mediaSelection = Timeline.selectMediaSelection(project);
    const { clipIds, transpositionIds } = mediaSelection;
    if (!clipIds.length && !transpositionIds.length) return;

    // Get the selected clips and their durations
    const clips = Timeline.selectSelectedClips(project);
    const clipDurations = Clips.selectClipDurations(project, clipIds);

    // Get the selected transpositions and their durations
    const poses = Timeline.selectSelectedTranspositions(project);
    const poseDurations = Poses.selectTranspositionDurations(
      project,
      transpositionIds
    );

    // Duplicate the media
    const media = [...clips, ...poses];
    const mediaDurations = [...clipDurations, ...poseDurations];
    const duplicatedMedia = getDuplicatedMedia(media, mediaDurations);

    // Create and select the new media
    const newClips = getMediaClips(duplicatedMedia);
    const newPoses = getMediaTranspositions(duplicatedMedia);
    const payload = { clips: newClips, transpositions: newPoses };
    const mediaIds = dispatch(createMedia(payload));
    dispatch(Timeline.updateMediaSelection(mediaIds));
  };

/** Move all selected media by the given offset. */
export const moveSelectedMedia =
  (offset: number): Thunk =>
  (dispatch, getProject) => {
    if (!offset) return;
    const project = getProject();
    const selectedMedia = Timeline.selectSelectedMedia(project);

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

/** Move all selected media to the left by one subdivision tick. */
export const moveSelectedMediaLeft = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const ticks = selectSubdivisionTicks(project);
  dispatch(moveSelectedMedia(-ticks));
};

/** Move all selected media to the right by one subdivision tick. */
export const moveSelectedMediaRight = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const ticks = selectSubdivisionTicks(project);
  dispatch(moveSelectedMedia(ticks));
};

/** Delete all selected media. */
export const deleteSelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clipIds = Timeline.selectSelectedClipIds(project);
  const transpositionIds = Timeline.selectSelectedTranspositionIds(project);
  dispatch(deleteMedia({ clipIds, transpositionIds }));
};

/** Set the selected pattern by updating the media draft. */
export const setSelectedPattern =
  (patternId: PatternId): Thunk =>
  (dispatch, getProject) => {
    // Idle the editor if selecting a preset pattern
    const project = getProject();
    const customPatterns = Patterns.selectCustomPatterns(project);
    const isCustom = customPatterns.some((p) => p.id === patternId);
    if (!isCustom) {
      dispatch(setEditorAction(undefined));
    } else {
      dispatch(setEditorAction("addingNotes"));
    }

    // Update the media draft
    dispatch(Timeline.updateMediaDraft({ clip: { patternId } }));
  };

/** Slice the media at a given tick. */
export const sliceMedia =
  (media?: Media, tick: Tick = 0): Thunk =>
  (dispatch, getProject) => {
    if (!media || tick < 0) return;
    const project = getProject();
    const mediaSelection = Timeline.selectMediaSelection(project);
    const { clipIds, transpositionIds } = mediaSelection;

    // Get the media from the store
    const oldClip = Clips.selectClipById(project, media.id);
    const oldTransposition = Poses.selectTranspositionById(project, media.id);
    if (!oldClip && !oldTransposition) return;
    const oldMedia = (oldClip || oldTransposition) as Media;
    const isClip = !!oldClip;

    // Get the duration of the media
    const duration = getMediaDuration(
      [oldMedia],
      isClip
        ? [selectClipDuration(project, oldMedia.id)]
        : [Poses.selectTranspositionDuration(project, oldMedia.id)]
    );

    // Find the tick to split the clip at
    const splitTick = tick - oldMedia.tick;
    if (tick === oldMedia.tick || splitTick === duration) return;
    if (splitTick < 0 || (isClip && splitTick > media.tick + duration)) return;

    // Create the first item lasting until the split tick.
    const firstMedia: Media = isClip
      ? initializeClip({ ...oldClip, duration: splitTick })
      : initializeTransposition({ ...oldTransposition, duration: splitTick });

    // Create the second item lasting from the split tick until the end.
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

    // Deselect the media item if it was selected
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
      dispatch(Poses._sliceTransposition(transpositionPayload));
    }

    // Slice the media in the hierarchy
    const hierarchyPayload = {
      oldId: oldMedia.id,
      newIds: [firstMedia.id, secondMedia.id],
    };
    dispatch(Hierarchy.sliceMediaInHierarchy(hierarchyPayload));
  };

/** Merge the selected media. */
export const mergeSelectedMedia =
  (options: { name?: string } = {}): Thunk =>
  async (dispatch, getProject) => {
    const project = getProject();
    const patternMap = Patterns.selectPatternMap(project);
    const clips = Timeline.selectSelectedClips(project);
    const poses = Timeline.selectSelectedTranspositions(project);
    const patternNames: string[] = [];

    // Iterate through all clips and merge their streams
    const sortedClips = clips.sort((a, b) => a.tick - b.tick);
    const stream = sortedClips.reduce((acc, clip) => {
      // Get the clip pattern
      const pattern = patternMap[clip.patternId];
      if (!pattern) return acc;
      patternNames.push(getPatternName(pattern));

      // Get the clip stream
      const duration = selectClipDuration(project, clip.id);
      let stream = selectClipStream(project, clip.id);

      // Make sure the duration of the new stream is the same as the clip duration
      let totalDuration = 0;
      stream = stream.reduce((acc, block) => {
        if (totalDuration > duration) return acc;
        const blockDuration = getPatternBlockDuration(block);

        // If the block duration is longer than the clip duration, shorten it
        if (totalDuration + blockDuration > duration) {
          // If the block is a rest, just add it to the stream
          const newDuration = duration - totalDuration;
          if (isPatternRest(block)) return [...acc, { duration: newDuration }];

          // Otherwise, shorten all notes and add the chord to the stream
          const chord = block.map((n) => ({ ...n, duration: newDuration }));
          totalDuration += newDuration;
          return [...acc, chord];
        }

        // Otherwise, sum the duration and add the block to the stream
        totalDuration += blockDuration;
        return [...acc, block];
      }, [] as PatternMidiStream);

      // If the stream is empty, add a rest
      if (!stream.length) {
        stream = [{ duration }];
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
    dispatch(Clips.createClips([clip]));

    // Delete the old media
    const clipIds = clips.map((clip) => clip.id);
    const transpositionIds = poses.map((pose) => pose.id);
    dispatch(deleteMedia({ clipIds, transpositionIds }));
  };
