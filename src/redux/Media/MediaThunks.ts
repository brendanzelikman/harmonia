import * as Patterns from "redux/Pattern";
import * as Clips from "redux/Clip";
import * as Poses from "redux/Pose";
import * as Hierarchy from "redux/TrackHierarchy";
import * as Timeline from "redux/Timeline";
import { Thunk } from "types/Project";
import { getClipboardMedia } from "types/Timeline";
import {
  getOffsettedMedia,
  getValidMedia,
  getClipsFromMedia,
  getPosesFromMedia,
  getDuplicatedMedia,
  getMediaDuration,
  MediaClip,
  UpdateMediaPayload,
  RemoveMediaPayload,
  NewMediaPayload,
  getPortalsFromMedia,
  MediaElement,
} from "types/Media";
import { isNumber, union, unionBy, without } from "lodash";
import { Pose, PoseUpdate, initializePose } from "types/Pose";
import { Clip, ClipUpdate, initializeClip } from "types/Clip";
import { selectSubdivisionTicks } from "redux/Timeline";
import {
  selectOrderedTrackIds,
  selectTrackMap,
  selectClipDuration,
  selectClipStream,
  selectPortals,
  selectTrackById,
  selectPortalIds,
} from "redux/selectors";
import { Transport } from "tone";
import { Tick } from "types/units";
import {
  PatternId,
  PatternMidiStream,
  PatternStream,
  getPatternBlockDuration,
  getPatternName,
  getPatternStreamDuration,
  isPatternRest,
  isPatternStream,
} from "types/Pattern";
import { setEditorAction } from "redux/Editor";
import {
  PortalUpdate,
  initializePortal,
  parsePortalChunkId,
} from "types/Portal";
import { Portals } from "redux/slices";
import { getSubdivisionTicks, getTickColumns } from "utils/durations";

/** Create a list of media and add it to the slice and hierarchy. */
export const createMedia =
  (update: UpdateMediaPayload): Thunk<NewMediaPayload> =>
  (dispatch) => {
    // Initialize the media
    const clips = (update.clips || []).map(initializeClip);
    const poses = (update.poses || []).map(initializePose);
    const portals = (update.portals || []).map(initializePortal);
    const payload = { clips, poses, portals };

    // Add the media to the respective slices and track hierarchy
    dispatch(Clips.addClips(payload));
    dispatch(Poses.addPoses(payload));
    dispatch(Portals.addPortals(payload));
    dispatch(Hierarchy.addMediaToHierarchy(payload));

    // Return the newly created media IDs
    const clipIds = clips.map((c) => c.id);
    const poseIds = poses.map((t) => t.id);
    const portalIds = portals.map((p) => p.id);
    return { clipIds, poseIds, portalIds };
  };

/** Update a list of media. */
export const updateMedia =
  (payload: UpdateMediaPayload): Thunk =>
  (dispatch) => {
    // Update the media in the respective slices
    dispatch(Clips.updateClips(payload));
    dispatch(Poses.updatePoses(payload));
    dispatch(Portals.updatePortals(payload));

    // Update the media in the track hierarchy
    dispatch(Hierarchy.updateMediaInHierarchy(payload));
  };

/** Delete a list of media from the store. */
export const deleteMedia =
  (payload: RemoveMediaPayload): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const mediaSelection = Timeline.selectMediaSelection(project);
    const oldClipIds = payload.clipIds;
    const oldPoseIds = payload.poseIds;

    // Remove the media from the media selection
    const clipIds = without(mediaSelection.clipIds, ...oldClipIds);
    const poseIds = without(mediaSelection.poseIds, ...oldPoseIds);
    dispatch(Timeline.updateMediaSelection({ clipIds, poseIds }));

    // Delete the media from the slices and hierarchy
    dispatch(Clips.removeClips(payload));
    dispatch(Poses.removePoses(payload));
    dispatch(Portals.removePortals(payload));
    dispatch(Hierarchy.removeMediaFromHierarchy(payload));
  };

/** Add all media to the selection. */
export const addAllMediaToSelection = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clipIds = Clips.selectClipIds(project);
  const poseIds = Poses.selectPoseIds(project);
  const portalIds = selectPortalIds(project);
  dispatch(Timeline.updateMediaSelection({ clipIds, poseIds, portalIds }));
};

/** Copy all selected media to the clipboard. */
export const copySelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clips = Timeline.selectSelectedClips(project);
  const poses = Timeline.selectSelectedPoses(project);
  const portals = Timeline.selectSelectedPortals(project);
  dispatch(Timeline.updateMediaClipboard({ clips, poses, portals }));
};

/** Cut all selected media into the clipboard, deleting them. */
export const cutSelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();

  // Copy the media to the clipboard
  const clips = Timeline.selectSelectedClips(project);
  const poses = Timeline.selectSelectedPoses(project);
  const portals = Timeline.selectSelectedPortals(project);
  dispatch(Timeline.updateMediaClipboard({ clips, poses, portals }));

  // Delete the media
  const clipIds = Timeline.selectSelectedClipIds(project);
  const poseIds = Timeline.selectSelectedPoseIds(project);
  const portalIds = Timeline.selectSelectedPortalIds(project);
  dispatch(deleteMedia({ clipIds, poseIds, portalIds }));
};

/**
 * Paste all media from the clipboard to the timeline,
 * starting at the current tick from the selected track.
 */
export const pasteSelectedMedia =
  (): Thunk<NewMediaPayload> => (dispatch, getProject) => {
    const project = getProject();
    const noMedia = { clipIds: [], poseIds: [], portalIds: [] };

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

    // Prepare the new media
    const clips = getClipsFromMedia(validMedia);
    const poses = getPosesFromMedia(validMedia);
    const portals = getPortalsFromMedia(validMedia);

    // Create the new media
    const newMedia = dispatch(createMedia({ clips, poses, portals }));
    dispatch(Timeline.updateMediaSelection(newMedia));
    return newMedia;
  };

/** Duplicate all selected media. */
export const duplicateSelectedMedia =
  (): Thunk => async (dispatch, getProject) => {
    const project = getProject();
    const mediaSelection = Timeline.selectMediaSelection(project);
    const { clipIds, poseIds } = mediaSelection;
    if (!clipIds.length && !poseIds.length) return;

    // Get the selected clips and their durations
    const clips = Timeline.selectSelectedClips(project);
    const clipDurations = Clips.selectClipDurations(project, clipIds);

    // Get the selected poses and their durations
    const poses = Timeline.selectSelectedPoses(project);
    const poseDurations = Poses.selectPoseDurations(project, poseIds);

    // Get the selected portals
    const portals = Timeline.selectSelectedPortals(project);
    const portalDurations = portals.map((_) => 1);

    // Duplicate the media
    const media = [...clips, ...poses, ...portals];
    const duplicatedMedia = getDuplicatedMedia(media, [
      ...clipDurations,
      ...poseDurations,
      ...portalDurations,
    ]);

    // Create and select the new media
    const newClips = getClipsFromMedia(duplicatedMedia);
    const newPoses = getPosesFromMedia(duplicatedMedia);
    const newPortals = getPortalsFromMedia(duplicatedMedia);
    const mediaIds = dispatch(
      createMedia({
        clips: newClips,
        poses: newPoses,
        portals: newPortals,
      })
    );
    dispatch(Timeline.updateMediaSelection(mediaIds));
  };

/** Move all selected media by the given offset. */
export const moveSelectedMedia =
  (offset: number): Thunk =>
  (dispatch, getProject) => {
    if (!offset) return;
    const project = getProject();
    const column = Timeline.selectSubdivisionTicks(project);
    const portals = selectPortals(project);

    const sign = Math.sign(offset);
    const magnitude = Math.abs(offset * column);

    // Move the selected portals first
    const selectedPortals = Timeline.selectSelectedPortals(project);
    const newPortals = selectedPortals.map((portal) => {
      return {
        ...portal,
        tick: portal.tick + offset,
        portaledTick: portal.portaledTick + offset,
      };
    });
    if (newPortals.some((p) => p.tick < 0 || p.portaledTick < 0)) return;

    // Move the media elements through any portal that they go through
    const selectedClips = Timeline.selectSelectedMediaClips(project);
    const mediaClips = selectedClips.map((media) => {
      for (let i = 0; i < magnitude; i++) {
        // If the media is moving right, check if it goes through a portal
        if (sign > 0) {
          const portal = portals.find(
            (p) => p.trackId === media.trackId && p.tick === media.tick
          );
          // If no portal is found, move the media
          if (!portal) {
            return { ...media, tick: media.tick + offset };
          }
          // Otherwise, move the media through the portal
          return {
            ...media,
            trackId: portal.portaledTrackId,
            tick: portal.portaledTick,
          };
        }
      }

      // If the media is moving left, check if it comes back through a portal
      if (sign < 0) {
        const portal = portals.find(
          (p) =>
            p.portaledTrackId === media.trackId && p.portaledTick === media.tick
        );
        // If no portal is found, move the media
        if (!portal) {
          return { ...media, tick: media.tick + offset };
        }
        // Otherwise, move the media back from the portal
        return { ...media, trackId: portal.trackId, tick: portal.tick };
      }
    }) as MediaClip[];
    if (mediaClips.some((media) => media.tick < 0)) return;

    // Update the media
    const newClips = getClipsFromMedia(mediaClips);
    const newPoses = getPosesFromMedia(mediaClips);
    dispatch(
      updateMedia({
        clips: newClips,
        poses: newPoses,
        portals: newPortals,
      })
    );
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
  const poseIds = Timeline.selectSelectedPoseIds(project);
  const portalIds = Timeline.selectSelectedPortalIds(project);
  dispatch(deleteMedia({ clipIds, poseIds, portalIds }));
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
  (media?: MediaClip, tick: Tick = 0): Thunk =>
  (dispatch, getProject) => {
    if (!media || tick < 0) return;
    const project = getProject();
    const mediaSelection = Timeline.selectMediaSelection(project);
    const { clipIds, poseIds } = mediaSelection;

    // Get the media from the store
    const oldClip = Clips.selectClipById(project, media.id);
    const oldPose = Poses.selectPoseById(project, media.id);
    if (!oldClip && !oldPose) return;
    const oldMedia = (oldClip || oldPose) as MediaClip;
    const isClip = !!oldClip;

    // Get the duration of the media
    const duration = getMediaDuration(
      [oldMedia],
      isClip
        ? [selectClipDuration(project, oldMedia.id)]
        : [Poses.selectPoseDuration(project, oldMedia.id)]
    );

    // Find the tick to split the clip at
    const splitTick = tick - oldMedia.tick;
    if (tick === oldMedia.tick || splitTick === duration) return;
    if (splitTick < 0 || (isClip && splitTick > media.tick + duration)) return;

    // Create the first item lasting until the split tick.
    const firstMedia: MediaClip = isClip
      ? initializeClip({ ...oldClip, duration: splitTick })
      : initializePose({ ...oldPose, duration: splitTick });

    // Create the second item lasting from the split tick until the end.
    const secondMedia: MediaClip = isClip
      ? initializeClip({
          ...oldClip,
          tick,
          offset: oldClip.offset + splitTick,
          duration: duration - splitTick,
        })
      : initializePose({
          ...oldPose,
          tick,
          duration: isNumber(oldMedia.duration)
            ? duration - splitTick
            : Infinity,
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
          poseIds: without(poseIds, oldMedia.id),
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
      if (!oldPose) return;
      const posePayload = {
        oldPose,
        firstPose: firstMedia as Pose,
        secondPose: secondMedia as Pose,
      };
      dispatch(Poses._slicePose(posePayload));
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
    const poses = Timeline.selectSelectedPoses(project);
    const patternNames: string[] = [];

    // Iterate through all clips and merge their streams
    const sortedClips = clips.sort((a, b) => a.tick - b.tick);
    const totalStream = sortedClips.reduce((acc, clip) => {
      // Get the clip pattern
      const pattern = patternMap[clip.patternId];
      if (!pattern) return acc;
      patternNames.push(getPatternName(pattern));

      // Get the clip stream
      const duration = selectClipDuration(project, clip.id);
      let totalDuration = 0;

      // Make sure the duration of the new stream is the same as the clip duration
      const stream = selectClipStream(project, clip.id).reduce(
        (streamAcc, block) => {
          if (totalDuration > duration) return streamAcc;
          const blockDuration = getPatternBlockDuration(block);

          // If the block duration is longer than the clip duration, shorten it
          if (totalDuration + blockDuration > duration) {
            // If the block is a rest, just add it to the stream
            const newDuration = duration - totalDuration;
            totalDuration += newDuration;
            if (isPatternRest(block))
              return [...streamAcc, { duration: newDuration }];

            // Otherwise, shorten all notes and add the chord to the stream
            const chord = block.map((n) => ({ ...n, duration: newDuration }));
            return [...streamAcc, chord];
          }

          // Otherwise, sum the duration and add the block to the stream
          totalDuration += blockDuration;
          return [...streamAcc, block];
        },
        [] as PatternMidiStream
      );

      // If the stream is empty, add a rest
      if (!stream.length) {
        return [...acc, { duration }];
      }

      // Return the merged stream
      return [...acc, ...stream];
    }, [] as PatternStream);

    // Create and select a new pattern
    const name = options?.name || patternNames.join(" + ");
    const stream = totalStream.filter((b) => isPatternRest(b) || b.length);
    const pattern = { stream, name };
    const patternId = dispatch(Patterns.createPattern(pattern));
    Timeline.updateMediaDraft({ clip: { patternId } });

    // Create a new clip
    const { trackId, tick } = sortedClips[0];
    const clip = { trackId, patternId, tick };
    dispatch(Clips.createClips([clip]));

    // Delete the old media
    const clipIds = clips.map((clip) => clip.id);
    const poseIds = poses.map((pose) => pose.id);
    dispatch(deleteMedia({ clipIds, poseIds, portalIds: [] }));
  };

/** The handler for when a media clip is dragged. */
export const onMediaDragEnd =
  (item: any, monitor: any): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const orderedTrackIds = selectOrderedTrackIds(project);
    const { subdivision } = Timeline.selectTimeline(project);
    const selectedClips = Timeline.selectSelectedClips(project);
    const selectedPoses = Timeline.selectSelectedPoses(project);
    const selectedPortals = Timeline.selectSelectedPortals(project);

    // Get the value from the item
    const element: MediaElement =
      item.clip || item.pose || item.portalEntry || item.portalExit;

    // Compute the offset of the drag from the element's trackId
    const rowIndex = orderedTrackIds.indexOf(element.trackId);
    if (rowIndex === -1) return;
    const rowOffset = item.hoveringRow - rowIndex;
    const columns = getTickColumns(element.tick, subdivision);
    const colOffset = item.hoveringColumn - columns - 1;
    const tickOffset = colOffset * getSubdivisionTicks(subdivision);

    // Get the drop result
    const dropResult = monitor.getDropResult();
    const copying = dropResult?.dropEffect === "copy";

    // Get the list of clips by merging the chunk with the selection
    const clips = item.clip
      ? unionBy([item.clip, ...selectedClips], (clip) =>
          parsePortalChunkId(clip.id)
        )
      : selectedClips;

    // Get the list of poses by merging the chunk with the selection
    const poses = item.pose
      ? unionBy([item.pose, ...selectedPoses], (pose) =>
          parsePortalChunkId(pose.id)
        )
      : selectedPoses;

    // Get the list of portals as is
    const portals = selectedPortals;

    // Prepare the new media
    const newClips: ClipUpdate[] = [];
    const newPoses: PoseUpdate[] = [];
    const newPortals: PortalUpdate[] = [];

    // Iterate over the targeted clips
    for (const clip of clips) {
      let originalClip = clip;
      // If the clip is a chunk, get the original one
      if (clip.id.includes("-chunk-")) {
        const originalId = parsePortalChunkId(clip.id);
        const realClip = Clips.selectClipById(project, originalId);
        if (!realClip) return;
        originalClip = realClip;
      }

      // Get the new track and make sure the clip is going into a pattern track
      const trackIndex = orderedTrackIds.indexOf(clip?.trackId);
      const newIndex = trackIndex + rowOffset;
      const trackId = orderedTrackIds[newIndex];
      const newTrack = selectTrackById(project, trackId);
      if (trackIndex < 0 || newTrack?.type !== "patternTrack") return;

      // Push the new clip
      newClips.push({
        ...originalClip,
        trackId,
        tick: clip.tick + tickOffset,
      });
    }

    // Iterate over the targeted poses
    for (const pose of poses) {
      // Get the new track
      const trackIndex = orderedTrackIds.indexOf(pose?.trackId);
      const newIndex = trackIndex + rowOffset;
      const trackId = orderedTrackIds[newIndex];
      if (trackIndex < 0 || !trackId) return;

      // If the pose is a chunk, get the original one
      const poseId = pose.id;
      if (poseId.includes("-chunk-")) {
        const originalId = parsePortalChunkId(poseId);
        const realPose = Poses.selectPoseById(project, originalId);
        if (!realPose) return;
        newPoses.push({
          ...realPose,
          trackId,
          tick: pose.tick + tickOffset,
        });
      }
      // Otherwise, push the pose as is
      else {
        newPoses.push({ ...pose, trackId, tick: pose.tick + tickOffset });
      }
    }
    // Move the portal entry fragment, if any
    if (item.portalEntry) {
      const index = orderedTrackIds.indexOf(item.portalEntry.trackId);
      const newIndex = index + rowOffset;
      const trackId = orderedTrackIds[newIndex];
      if (index < 0 || !trackId) return;

      // Push the new portal fragment
      newPortals.push({
        id: item.portalEntry.id,
        trackId,
        tick: item.portalEntry.tick + tickOffset,
      });
    }

    // Move the portal exit fragment, if any
    if (item.portalExit) {
      const index = orderedTrackIds.indexOf(item.portalExit.trackId);
      const newIndex = index + rowOffset;
      const trackId = orderedTrackIds[newIndex];
      if (index < 0 || !trackId) return;

      // Push the new portal fragment
      newPortals.push({
        id: item.portalExit.id,
        portaledTrackId: trackId,
        portaledTick: item.portalExit.tick + tickOffset,
      });
    }

    // Iterate over the targeted portals
    for (const portal of portals) {
      // Get the new entry track for the portal
      const fromIndex = orderedTrackIds.indexOf(portal?.trackId);
      const newFromIndex = fromIndex + rowOffset;
      const fromId = orderedTrackIds[newFromIndex];
      if (fromIndex < 0 || !fromId) return;

      // Get the new exit track for the portal
      const toIndex = orderedTrackIds.indexOf(portal?.portaledTrackId);
      const newToIndex = toIndex + rowOffset;
      const toId = orderedTrackIds[newToIndex];
      if (toIndex < 0 || !toId) return;

      // Push the portal as is
      newPortals.push({
        ...portal,
        trackId: fromId,
        tick: portal.tick + tickOffset,
        portaledTrackId: toId,
        portaledTick: portal.portaledTick + tickOffset,
      });
    }

    // Make sure the entire operation is valid
    if (newClips.some((item) => item.tick && item.tick < 0)) return;
    if (newPoses.some((item) => item.tick && item.tick < 0)) return;
    if (newPortals.some((item) => item.tick && item.tick < 0)) return;

    const payload = { clips: newClips, poses: newPoses, portals: newPortals };

    // If not copying, update the media
    if (!copying) {
      dispatch(updateMedia(payload));
      return;
    }

    // Otherwise, create the new media
    const mediaIds = dispatch(createMedia(payload));
    dispatch(Timeline.updateMediaSelection(mediaIds));
  };
