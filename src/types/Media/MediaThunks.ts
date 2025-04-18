import { union, without } from "lodash";
import {
  getSubdivisionTicks,
  getTickColumns,
  WholeNoteTicks,
} from "utils/duration";
import { Tick, Update } from "types/units";
import {
  getPatternBlockDuration,
  getPatternStreamDuration,
} from "types/Pattern/PatternFunctions";
import { getPatternChordNotes } from "types/Pattern/PatternUtils";
import { getPatternChordWithNewNotes } from "types/Pattern/PatternUtils";
import {
  isPatternRest,
  isPatternMidiChord,
  PatternStream,
} from "types/Pattern/PatternTypes";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";
import { initializePortal, PortalId, Portal } from "types/Portal/PortalTypes";
import { Thunk } from "types/Project/ProjectTypes";
import {
  updateMediaSelection,
  updateClipboard,
} from "types/Timeline/TimelineSlice";
import {
  addClips,
  updateClips,
  addClip,
  removeClips,
} from "types/Clip/ClipSlice";
import {
  Clip,
  initializeClip,
  initializePatternClip,
  ClipId,
  isPatternClip,
  isPoseClip,
  ClipType,
} from "types/Clip/ClipTypes";
import {
  selectClipDuration,
  selectClipIds,
  selectClipMap,
  selectClips,
  selectMotifClipMap,
} from "types/Clip/ClipSelectors";
import {
  selectPatternById,
  selectPatternMap,
} from "types/Pattern/PatternSelectors";
import { selectPortalIds, selectPortals } from "types/Portal/PortalSelectors";
import {
  selectMediaSelection,
  selectSelectedClips,
  selectSelectedPortals,
  selectSelectedPortalIds,
  selectSelectedTrackId,
  selectClipboard,
  selectSubdivisionTicks,
  selectSelectedClipIds,
  selectSelectedPatternClips,
  selectTimeline,
  selectCurrentTimelineTick,
} from "types/Timeline/TimelineSelectors";
import { selectTrackMap, selectTrackIds } from "types/Track/TrackSelectors";
import {
  getOffsettedMedia,
  getValidMedia,
  getClipsFromMedia,
  getPortalsFromMedia,
  getDuplicatedMedia,
} from "./MediaFunctions";
import {
  NewMediaPayload,
  UpdateMediaPayload,
  RemoveMediaPayload,
  MediaElement,
  CreateMediaPayload,
} from "./MediaTypes";
import { createUndoType, unpackUndoType } from "types/redux";
import {
  addPortals,
  removePortals,
  updatePortals,
} from "types/Portal/PortalSlice";
import { createPattern } from "types/Pattern/PatternThunks";
import { selectPoseById, selectPoseMap } from "types/Pose/PoseSelectors";
import { createPose } from "types/Pose/PoseThunks";
import { getClipMotifId } from "types/Clip/ClipFunctions";
import { isBounded } from "utils/math";
import { removePose } from "types/Pose/PoseSlice";
import { nanoid } from "@reduxjs/toolkit";
import { removePattern } from "types/Pattern/PatternSlice";

/** Create a list of media and add it to the slice and hierarchy. */
export const createMedia =
  (payload: CreateMediaPayload): Thunk<NewMediaPayload> =>
  (dispatch, getProject) => {
    const project = getProject();
    const undoType = unpackUndoType(payload, "createMedia");
    const { data } = payload;

    // Initialize the media
    const portals = (data.portals || []).map(initializePortal);
    let clips = (data.clips || []).map(initializeClip);

    // Create the motifs if they are not already created
    clips.forEach((clip, i) => {
      const patternMap = selectPatternMap(project);
      const poseMap = selectPoseMap(project);
      if (clip.type === "pattern" && !(clip.patternId in patternMap)) {
        clips[i] = {
          ...clip,
          patternId: dispatch(createPattern({ data: {}, undoType })).id,
        };
      } else if (clip.type === "pose" && !(clip.poseId in poseMap)) {
        clips[i] = {
          ...clip,
          poseId: dispatch(createPose({ data: {}, undoType })).id,
        };
      }
    });

    // Add the media to the respective slices and track hierarchy
    dispatch(addClips({ data: clips, undoType }));
    dispatch(addPortals({ data: portals, undoType }));

    // Return the newly created media IDs
    const clipIds: ClipId[] = clips.map((c) => c.id);
    const portalIds: PortalId[] = portals.map((p) => p.id);

    // Return the new payload
    return { ...payload, data: { clipIds, portalIds } };
  };

/** Update a list of media. */
export const updateMedia =
  (payload: UpdateMediaPayload): Thunk =>
  (dispatch) => {
    const undoType = unpackUndoType(payload, "updateMedia");
    dispatch(updateClips({ undoType, data: payload.data.clips ?? [] }));
    dispatch(updatePortals({ undoType, data: payload.data.portals ?? [] }));
  };

/** Delete a list of media from the store. */
export const deleteMedia =
  (payload: RemoveMediaPayload): Thunk =>
  (dispatch, getProject) => {
    const { data } = payload;
    const project = getProject();
    const undoType = unpackUndoType(payload, "deleteMedia");
    const selection = selectMediaSelection(project);
    const oldClipIds = without(selection?.clipIds, ...(data.clipIds ?? []));
    dispatch(updateMediaSelection({ data: { clipIds: oldClipIds }, undoType }));

    // Delete the motifs if they are the last of their kind
    const clipMap = selectClipMap(project);
    const motifClipMap = selectMotifClipMap(project);

    const clipIds = data.clipIds ?? [];
    for (const clipId of clipIds) {
      const clip = clipMap[clipId];
      if (!clip) continue;
      const motifId = getClipMotifId(clip);
      if (!motifId) continue;

      // Check for clip ids with the motif
      const motifClipIds = motifClipMap[motifId].filter(
        (n) => !(data.clipIds ?? [])?.includes(n.id)
      );
      if (!motifClipIds || motifClipIds.length > 0) continue;

      if (clip.type === "pattern") {
        dispatch(removePattern({ data: clip.patternId, undoType }));
      } else if (clip.type === "pose") {
        dispatch(removePose({ data: clip.poseId, undoType }));
      }
    }

    // Delete the media from the slices and hierarchy
    dispatch(removeClips({ ...payload, data: data.clipIds ?? [], undoType }));
    dispatch(
      removePortals({ ...payload, data: data.portalIds ?? [], undoType })
    );
  };

/** Add all media to the selection. */
export const addAllMediaToSelection = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clipIds = selectClipIds(project);
  const portalIds = selectPortalIds(project);
  dispatch(updateMediaSelection({ data: { clipIds, portalIds } }));
};

/** Filter the selection based on the given type. */
export const filterSelectionByType =
  <T extends ClipType>(type?: T): Thunk =>
  (dispatch, getProject) => {
    if (!type) return;
    const project = getProject();
    const selection = selectMediaSelection(project);
    const selectedIds = selection.clipIds ?? [];
    const clipIds = selectedIds.filter((id) => id.startsWith(type));
    dispatch(updateMediaSelection({ data: { clipIds } }));
  };

export const insertMeasure =
  (amount = WholeNoteTicks): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const tick = selectCurrentTimelineTick(project);
    const clips = selectClips(project)
      .filter((clip) => clip.tick >= tick)
      .map((clip) => ({ ...clip, tick: clip.tick + amount }));
    return dispatch(updateClips({ data: clips }));
  };

/** Copy all selected media to the clipboard. */
export const copySelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clips = selectSelectedClips(project);
  const portals = selectSelectedPortals(project);
  dispatch(updateClipboard({ clips, portals }));
};

/** Cut all selected media into the clipboard, deleting them. */
export const cutSelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();

  // Copy the media to the clipboard
  const clips = selectSelectedClips(project);
  const portals = selectSelectedPortals(project);
  dispatch(updateClipboard({ clips, portals }));

  // Delete the media
  const clipIds = selectSelectedClipIds(project);
  const portalIds = selectSelectedPortalIds(project);
  dispatch(deleteMedia({ data: { clipIds, portalIds } }));
};

/**
 * Paste all media from the clipboard to the timeline,
 * starting at the current tick from the selected track.
 */
export const pasteSelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const noMedia = { clipIds: [], portalIds: [] };

  // Do nothing if there are no tracks
  const trackIds = selectTrackIds(project);
  if (!trackIds?.length) return noMedia;

  // Do nothing if no track is selected
  const selectedTrackId = selectSelectedTrackId(project);
  if (!selectedTrackId) return noMedia;

  // Get the media from the clipboard
  const clipboard = selectClipboard(project);
  const media = union<MediaElement>(clipboard.clips, clipboard.portals);
  if (!media?.length) return noMedia;

  // Get the offseted media
  const tick = selectCurrentTimelineTick(project);
  const offseted = getOffsettedMedia(media, tick, selectedTrackId, trackIds);

  // Make sure all of the media is valid
  const trackMap = selectTrackMap(project);
  const validMedia = getValidMedia(offseted, trackMap);
  if (validMedia.length !== offseted.length) return noMedia;

  // Prepare the new media
  const clips = getClipsFromMedia(validMedia);
  const portals = getPortalsFromMedia(validMedia);

  // Create the new media
  const undoType = createUndoType("pasteSelectedMedia", nanoid());
  const newMedia = dispatch(
    createMedia({ data: { clips, portals }, undoType })
  );
  dispatch(updateMediaSelection({ data: newMedia.data, undoType }));
  return newMedia;
};

/** Duplicate all selected media. */
export const duplicateSelectedMedia =
  (): Thunk => async (dispatch, getProject) => {
    const undoType = createUndoType("duplicateSelectedMedia");
    const project = getProject();
    const clips = selectSelectedClips(project);
    const portals = selectSelectedPortals(project);

    // Duplicate the media
    const media = [...clips, ...portals];
    const duplicatedMedia = getDuplicatedMedia(media);

    // Create and select the new media
    const newClips = getClipsFromMedia(duplicatedMedia);
    const newPortals = getPortalsFromMedia(duplicatedMedia);
    const { data } = dispatch(
      createMedia({ data: { clips: newClips, portals: newPortals }, undoType })
    );
    dispatch(updateClips({ data: clips, undoType }));

    // Select the new clips
    dispatch(
      updateMediaSelection({
        data: { clipIds: data.clipIds, portalIds: data.portalIds },
        undoType,
      })
    );
  };

/** Move all selected media by the given offset. */
export const moveSelectedMedia =
  (offset: number): Thunk =>
  (dispatch, getProject) => {
    if (!offset) return;
    const project = getProject();
    const column = selectSubdivisionTicks(project);
    const portals = selectPortals(project);

    const sign = Math.sign(offset);
    const magnitude = Math.abs(offset * column);

    // Move the selected portals first
    const selectedPortals = selectSelectedPortals(project);
    const newPortals = selectedPortals.map((portal) => {
      return {
        ...portal,
        tick: portal.tick + offset,
        portaledTick: portal.portaledTick + offset,
      };
    });
    if (newPortals.some((p) => p.tick < 0 || p.portaledTick < 0)) return;

    // Then, move the media elements through any portal that they go through
    const selectedClips = selectSelectedClips(project);
    if (!selectedClips.length) return;
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
    }) as Clip[];
    if (mediaClips.some((media) => media.tick < 0)) return;

    // Update the media
    const newClips = getClipsFromMedia(mediaClips);
    dispatch(updateMedia({ data: { clips: newClips, portals: newPortals } }));
  };

/** Move all selected media to the left by one subdivision tick. */
export const moveSelectedMediaLeft =
  (amount?: Tick): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const ticks = selectSubdivisionTicks(project);
    dispatch(moveSelectedMedia(amount ? -amount : -ticks));
  };

/** Move all selected media to the right by one subdivision tick. */
export const moveSelectedMediaRight =
  (amount?: Tick): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const ticks = selectSubdivisionTicks(project);
    dispatch(moveSelectedMedia(amount ?? ticks));
  };

/** Delete all selected media. */
export const deleteSelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clipIds = selectSelectedClipIds(project);
  const portalIds = selectSelectedPortalIds(project);
  dispatch(deleteMedia({ data: { clipIds, portalIds } }));
};

/** Merge the selected media. */
export const mergeSelectedMedia =
  (options: { name?: string } = {}): Thunk =>
  async (dispatch, getProject) => {
    const project = getProject();
    const patternMap = selectPatternMap(project);
    const patternClips = selectSelectedPatternClips(project);
    const patternNames: string[] = [];

    // Iterate through all clips and merge their streams
    const sortedClips = patternClips.sort((a, b) => a.tick - b.tick);
    const totalStream = sortedClips.reduce((acc, clip) => {
      // Get the clip pattern
      const pattern = patternMap[clip.patternId];
      if (!pattern) return acc;
      patternNames.push(pattern?.name ?? "Pattern");

      // Get the clip stream
      const streamDuration = getPatternStreamDuration(pattern.stream);
      const duration = selectClipDuration(project, clip.id);
      let totalDuration = 0;

      // Make sure the duration of the new stream is the same as the clip duration
      const stream = new Array(
        Math.floor(
          ((isBounded(duration, 1) ? duration : streamDuration) /
            streamDuration) *
            pattern.stream.length
        )
      )
        .fill(0)
        .map((_, i) => pattern.stream[i % pattern.stream.length])
        .reduce((streamAcc, block) => {
          if (isPatternRest(block)) {
            totalDuration += block.duration;
            return [...streamAcc, block];
          }
          const notes = getPatternChordNotes(block);
          if (totalDuration > duration) return streamAcc;
          const blockDuration = getPatternBlockDuration(notes);

          // If the block duration is longer than the clip duration, shorten it
          if (totalDuration + blockDuration > duration) {
            // If the block is a rest, just add it to the stream
            const newDuration = duration - totalDuration;
            totalDuration += newDuration;
            if (!isPatternMidiChord(block))
              return [...streamAcc, { duration: newDuration }];

            // Otherwise, shorten all notes and add the chord to the stream
            const chord = notes.map((n) => ({
              ...n,
              duration: newDuration,
            }));
            const newChord = getPatternChordWithNewNotes(block, chord);
            return [...streamAcc, newChord];
          }

          // Otherwise, sum the duration and add the block to the stream
          totalDuration += blockDuration;
          return [...streamAcc, notes];
        }, [] as PatternStream);

      // If the stream is empty, add a rest
      if (!stream.length) {
        return [...acc, { duration }];
      }

      // Return the merged stream
      return [...acc, ...stream];
    }, [] as PatternStream);

    // Create and select a new pattern
    const name = options?.name || patternNames.join(" + ");
    const stream = totalStream.filter((b) => Array.isArray(b) && !!b.length);
    const pattern = { stream, name, trackId: sortedClips[0].trackId };
    const patternId = dispatch(createPattern({ data: pattern })).id;
    const undoType = createUndoType("mergeSelectedMedia", patternId);

    // Create a new clip
    const { trackId, tick } = sortedClips[0];
    const clip = initializePatternClip({
      trackId,
      patternId,
      tick,
    });
    dispatch(
      deleteMedia({
        data: { clipIds: patternClips.map((c) => c.id) },
        undoType,
      })
    );
    dispatch(addClip({ data: clip, undoType }));
  };

/** The handler for when a media clip is dragged. */
export const onMediaDragEnd =
  (item: any, monitor: any): Thunk =>
  (dispatch, getProject) => {
    const undoType = createUndoType("onMediaDragEnd", item);
    const project = getProject();
    const clipMap = selectClipMap(project);
    const orderedTrackIds = selectTrackIds(project);
    const { subdivision } = selectTimeline(project);
    const selectedClipIds = selectSelectedClipIds(project);
    const selectedPortals = selectSelectedPortals(project);
    const isPortal = item.portalEntry || item.portalExit;
    const itemId = isPortal ? item.id : getOriginalIdFromPortaledClip(item.id);

    // Get the value from the item
    const element: MediaElement = isPortal
      ? item.portalEntry || item.portalExit
      : clipMap[itemId];

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
    const clipIds = (
      item.id ? union([itemId, ...selectedClipIds]) : selectedClipIds
    ) as ClipId[];

    // Get the list of portals as is
    const portals = selectedPortals;

    // Prepare the new media
    const newClips: Update<Clip>[] = [];
    const newPortals: Update<Portal>[] = [];

    // Iterate over the targeted clips
    for (const id of clipIds) {
      const clip = clipMap[id];
      if (clip === undefined) continue;
      // If the clip is a chunk, get the original one

      // Get the new track and make sure the clip is going into a pattern track
      const trackIndex = orderedTrackIds.indexOf(clip.trackId);
      const newIndex = trackIndex + rowOffset;
      const trackId = orderedTrackIds[newIndex];
      if (trackIndex < 0 || !trackId) return;

      // Push the new clip
      newClips.push({ ...clip, trackId, tick: clip.tick + tickOffset });
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
      if (fromIndex < 0 || !fromId) continue;

      // Get the new exit track for the portal
      const toIndex = orderedTrackIds.indexOf(portal?.portaledTrackId);
      const newToIndex = toIndex + rowOffset;
      const toId = orderedTrackIds[newToIndex];
      if (toIndex < 0 || !toId) continue;

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
    if (newPortals.some((item) => item.tick && item.tick < 0)) return;

    // If copying, create the new media
    if (copying) {
      newClips.forEach((clip) => {
        if (isPatternClip(clip)) {
          const pattern = selectPatternById(project, clip.patternId);
          const newPatternId = dispatch(
            createPattern({ data: pattern, undoType })
          ).id;
          dispatch(
            addClip({
              data: initializeClip({ ...clip, patternId: newPatternId }),
              undoType,
            })
          );
        } else if (isPoseClip(clip)) {
          const pose = selectPoseById(project, clip.poseId);
          const newPoseId = dispatch(
            createPose({ data: { ...pose }, undoType })
          ).id;
          dispatch(
            addClip({
              data: initializeClip({ ...clip, poseId: newPoseId }),
              undoType,
            })
          );
        }
      });
      const mediaIds = dispatch(
        createMedia({
          data: { portals: newPortals },
          undoType,
        })
      );
      dispatch(updateMediaSelection({ data: mediaIds.data, undoType }));
      return;
    }

    // Otherwise, update the media
    dispatch(
      updateMedia({ data: { clips: newClips, portals: newPortals }, undoType })
    );
  };
