import { isArray, union, without } from "lodash";
import { getSubdivisionTicks, getTickColumns } from "utils/durations";
import { Tick, Update } from "types/units";
import { setEditorAction } from "types/Editor/EditorSlice";
import {
  getPatternName,
  getPatternBlockDuration,
} from "types/Pattern/PatternFunctions";
import { getPatternChordNotes } from "types/Pattern/PatternUtils";
import { getPatternChordWithNewNotes } from "types/Pattern/PatternUtils";
import {
  PatternId,
  isPatternRest,
  isPatternMidiChord,
  PatternStream,
} from "types/Pattern/PatternTypes";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";
import {
  initializePortal,
  PortalId,
  Portal,
  PortaledClipId,
} from "types/Portal/PortalTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { ScaleId } from "types/Scale/ScaleTypes";
import { isPatternTrack } from "types/Track/TrackTypes";
import {
  updateMediaSelection,
  updateClipboard,
  updateMediaDraft,
} from "types/Timeline/TimelineSlice";
import {
  addClips,
  updateClips,
  removeClips,
  addClip,
} from "types/Clip/ClipSlice";
import {
  Clip,
  initializeClip,
  initializePatternClip,
  ClipId,
  isPatternClip,
  isPoseClip,
  isScaleClip,
} from "types/Clip/ClipTypes";
import { getTransport } from "tone";
import {
  selectClipDurations,
  selectClipDuration,
  selectClipById,
  selectClipIds,
  selectClipMap,
} from "types/Clip/ClipSelectors";
import {
  selectCustomPatterns,
  selectPatternById,
  selectPatternMap,
} from "types/Pattern/PatternSelectors";
import { selectPortalIds, selectPortals } from "types/Portal/PortalSelectors";
import {
  selectCustomScales,
  selectScaleById,
} from "types/Scale/ScaleSelectors";
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
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackMap,
  selectTrackById,
  selectOrderedTrackIds,
} from "types/Track/TrackSelectors";
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
import { createUndoType, Payload, unpackUndoType } from "lib/redux";
import {
  addPortals,
  removePortals,
  updatePortals,
} from "types/Portal/PortalSlice";
import { PoseId } from "types/Pose/PoseTypes";
import { copyPattern, createPattern } from "types/Pattern/PatternThunks";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { copyPose } from "types/Pose/PoseThunks";
import { copyScale } from "types/Scale/ScaleThunks";
import { isHotkeyPressed } from "react-hotkeys-hook";

/** Create a list of media and add it to the slice and hierarchy. */
export const createMedia =
  (payload: CreateMediaPayload): Thunk<NewMediaPayload> =>
  (dispatch) => {
    const undoType = unpackUndoType(payload, "createMedia");
    const { data } = payload;
    // Initialize the media
    const clips = (data.clips || []).map(initializeClip);
    const portals = (data.portals || []).map(initializePortal);

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
    const selection = selectMediaSelection(project);
    const oldClipIds = without(selection?.clipIds, ...(data.clipIds ?? []));
    dispatch(updateMediaSelection({ data: { clipIds: oldClipIds } }));

    // Delete the media from the slices and hierarchy
    dispatch(removeClips({ ...payload, data: data.clipIds ?? [] }));
    dispatch(removePortals({ ...payload, data: data.portalIds ?? [] }));
  };

/** Add all media to the selection. */
export const addAllMediaToSelection = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clipIds = selectClipIds(project);
  const portalIds = selectPortalIds(project);
  dispatch(updateMediaSelection({ data: { clipIds, portalIds } }));
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
  const noMedia = { clipIds: [], poseIds: [], portalIds: [] };

  // Do nothing if there are no tracks
  const trackIds = selectOrderedTrackIds(project);
  if (!trackIds?.length) return noMedia;

  // Do nothing if no track is selected
  const selectedTrackId = selectSelectedTrackId(project);
  if (!selectedTrackId) return noMedia;

  // Get the media from the clipboard
  const clipboard = selectClipboard(project);
  const media = union<MediaElement>(clipboard.clips, clipboard.portals);
  if (!media?.length) return noMedia;

  // Get the offseted media
  const offsetedMedia = getOffsettedMedia(
    media,
    getTransport().ticks,
    selectedTrackId,
    trackIds
  );

  // Make sure all of the media is valid
  const trackMap = selectTrackMap(project);
  const validMedia = getValidMedia(offsetedMedia, trackMap);
  if (validMedia.length !== offsetedMedia.length) return noMedia;

  // Prepare the new media
  const clips = getClipsFromMedia(validMedia);
  const portals = getPortalsFromMedia(validMedia);

  // Create the new media
  const newMedia = dispatch(createMedia({ data: { clips, portals } }));
  dispatch(updateMediaSelection(newMedia));
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

/** Set the selected pattern by updating the media draft. */
export const setSelectedPattern =
  (payload: Payload<PatternId>): Thunk =>
  (dispatch, getProject) => {
    const undoType = unpackUndoType(payload, "setSelectedPattern");
    const patternId = payload.data;
    // Idle the editor if selecting a preset pattern
    const project = getProject();
    const customPatterns = selectCustomPatterns(project);
    const isCustom = customPatterns.some((p) => p.id === patternId);
    if (!isCustom) {
      dispatch(setEditorAction({ data: undefined, undoType }));
    } else {
      dispatch(setEditorAction({ data: "addingNotes", undoType }));
    }

    // Update the media draft
    dispatch(
      updateMediaDraft({ data: { patternClip: { patternId } }, undoType })
    );
  };

/** Set the selected pose by updating the media draft. */
export const setSelectedPose =
  (payload: Payload<PoseId>): Thunk =>
  (dispatch) => {
    const data = { poseClip: { poseId: payload.data } };
    const undoType = unpackUndoType(payload, "setSelectedPose");
    dispatch(updateMediaDraft({ data, undoType }));
  };

/** Set the selected scale by updating the media draft. */
export const setSelectedScale =
  (payload: Payload<ScaleId>): Thunk =>
  (dispatch, getProject) => {
    const scaleId = payload.data;
    const undoType = unpackUndoType(payload, "setSelectedScale");

    // Idle the editor if selecting a preset pattern
    const project = getProject();
    const customScales = selectCustomScales(project);
    const isCustom = customScales.some((s) => s.id === scaleId);
    if (!isCustom) {
      dispatch(setEditorAction({ data: undefined, undoType }));
    } else {
      dispatch(setEditorAction({ data: "addingNotes", undoType }));
    }

    // Update the media draft
    dispatch(updateMediaDraft({ data: { scaleClip: { scaleId } }, undoType }));
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
      patternNames.push(getPatternName(pattern));

      // Get the clip stream
      const duration = selectClipDuration(project, clip.id);
      let totalDuration = 0;

      // Make sure the duration of the new stream is the same as the clip duration
      const stream = [...pattern.stream].reduce((streamAcc, block) => {
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
    const stream = totalStream.filter((b) => isArray(b) && !!b.length);
    const pattern = { stream, name };
    const patternId = dispatch(createPattern({ data: pattern }));
    const undoType = createUndoType("mergeSelectedMedia", patternId);
    dispatch(
      updateMediaDraft({ data: { patternClip: { patternId } }, undoType })
    );

    // Create a new clip
    const { trackId, tick } = sortedClips[0];
    const clip = initializePatternClip({
      trackId,
      patternId,
      tick,
    });
    dispatch(removeClips({ data: patternClips.map((c) => c.id), undoType }));
    dispatch(addClip({ data: clip, undoType }));
  };

/** The handler for when a media clip is dragged. */
export const onMediaDragEnd =
  (item: any, monitor: any): Thunk =>
  (dispatch, getProject) => {
    const undoType = createUndoType("onMediaDragEnd", item);
    const project = getProject();
    const clipMap = selectClipMap(project);
    const orderedTrackIds = selectOrderedTrackIds(project);
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
    ) as PortaledClipId[];

    // Get the list of portals as is
    const portals = selectedPortals;

    // Prepare the new media
    const newClips: Update<Clip>[] = [];
    const newPortals: Update<Portal>[] = [];

    // Iterate over the targeted clips
    for (const id of clipIds) {
      const clip = clipMap[id];
      if (clip === undefined) continue;
      let originalClip = clip as Clip;
      // If the clip is a chunk, get the original one
      if (id.includes("-chunk-")) {
        const originalId = getOriginalIdFromPortaledClip(id);
        const realClip = selectClipById(project, originalId);
        if (!realClip) continue;
        originalClip = realClip;
      }

      // Get the new track and make sure the clip is going into a pattern track
      const trackIndex = orderedTrackIds.indexOf(clip.trackId);
      const newIndex = trackIndex + rowOffset;
      const trackId = orderedTrackIds[newIndex];
      const newTrack = selectTrackById(project, trackId);
      if (trackIndex < 0) return;
      if (isPatternClip(clip) && !isPatternTrack(newTrack)) return;

      // Push the new clip
      newClips.push({ ...originalClip, trackId, tick: clip.tick + tickOffset });
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
      const cloning = !isHotkeyPressed("tilde");
      const copiedClips = cloning
        ? newClips
        : (newClips.map((clip) => {
            if (isPatternClip(clip)) {
              const pattern = selectPatternById(project, clip.patternId);
              const newPatternId = dispatch(copyPattern({ data: pattern }));
              return { ...clip, patternId: newPatternId };
            } else if (isPoseClip(clip)) {
              const pose = selectPoseById(project, clip.poseId);
              const newPoseId = dispatch(copyPose(pose));
              return { ...clip, poseId: newPoseId };
            } else if (isScaleClip(clip)) {
              const scale = selectScaleById(project, clip.scaleId);
              const newScaleId = dispatch(copyScale(scale));
              return { ...clip, scaleId: newScaleId };
            } else {
              return clip;
            }
          }) as Clip[]);
      const mediaIds = dispatch(
        createMedia({
          data: { clips: copiedClips, portals: newPortals },
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
