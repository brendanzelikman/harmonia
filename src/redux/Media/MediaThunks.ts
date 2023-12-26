import * as Patterns from "redux/Pattern";
import * as Clips from "redux/Clip";
import * as Timeline from "redux/Timeline";
import { Thunk } from "types/Project";
import { getClipboardMedia } from "types/Timeline";
import * as _ from "types/Media";
import { isArray, unionBy, without } from "lodash";
import {
  ClipUpdate,
  initializeClip,
  isPatternClip,
  isPoseClip,
  Clip,
  ClipNoId,
  PatternClipId,
  PoseClipId,
  isPatternClipId,
  isPoseClipId,
  initializePatternClip,
} from "types/Clip";
import { selectSubdivisionTicks } from "redux/Timeline";
import {
  selectTrackIds,
  selectTrackMap,
  selectPatternClipStream,
  selectPortals,
  selectTrackById,
  selectPortalIds,
  selectPatternClipStreamMap,
} from "redux/selectors";
import { Transport } from "tone";
import {
  PatternId,
  PatternMidiChord,
  PatternMidiStream,
  PatternStream,
  getPatternBlockDuration,
  getPatternChordNotes,
  getPatternMidiChordNotes,
  getPatternName,
  isPatternMidiChord,
  isPatternRest,
  updatePatternChordNotes,
} from "types/Pattern";
import { setEditorAction } from "redux/Editor";
import {
  PortalNoId,
  PortalUpdate,
  initializePortal,
  getOriginalIdFromPortaledClip,
} from "types/Portal";
import { Portals } from "redux/slices";
import { getSubdivisionTicks, getTickColumns } from "utils/durations";
import { isPatternTrack } from "types/Track";

/** Create a list of media and add it to the slice and hierarchy. */
export const createMedia =
  (update: {
    clips?: ClipNoId[];
    portals?: PortalNoId[];
  }): Thunk<_.NewMediaPayload> =>
  (dispatch) => {
    // Initialize the media
    const clips = (update.clips || []).map(initializeClip);
    const portals = (update.portals || []).map(initializePortal);
    const payload = { clips, portals };

    // Add the media to the respective slices and track hierarchy
    dispatch(Clips.addClips(payload));
    dispatch(Portals.addPortals(payload));

    // Return the newly created media IDs
    const clipIds = clips.map((c) => c.id);
    const portalIds = portals.map((p) => p.id);
    return { clipIds, portalIds };
  };

/** Update a list of media. */
export const updateMedia =
  (payload: _.UpdateMediaPayload): Thunk =>
  (dispatch) => {
    dispatch(Clips.updateClips(payload));
    dispatch(Portals.updatePortals(payload));
  };

/** Delete a list of media from the store. */
export const deleteMedia =
  (payload: _.RemoveMediaPayload): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const mediaSelection = Timeline.selectMediaSelection(project);
    const oldClipIds = payload.clipIds ?? [];

    // Remove the media from the media selection
    const oldPatternClipIds = mediaSelection.patternClipIds;
    const oldPoseClipIds = mediaSelection.poseClipIds;
    const patternClipIds = without(
      oldPatternClipIds,
      ...oldClipIds
    ) as PatternClipId[];
    const poseClipIds = without(oldPoseClipIds, ...oldClipIds) as PoseClipId[];
    dispatch(Timeline.updateMediaSelection({ patternClipIds, poseClipIds }));

    // Delete the media from the slices and hierarchy
    dispatch(Clips.removeClips(payload));
    dispatch(Portals.removePortals(payload));
  };

/** Add all media to the selection. */
export const addAllMediaToSelection = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clips = Clips.selectClips(project);
  const patternClipIds = clips.filter(isPatternClip).map((clip) => clip.id);
  const poseClipIds = clips.filter(isPoseClip).map((clip) => clip.id);
  const portalIds = selectPortalIds(project);
  dispatch(
    Timeline.updateMediaSelection({ patternClipIds, poseClipIds, portalIds })
  );
};

/** Copy all selected media to the clipboard. */
export const copySelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const clips = Timeline.selectSelectedPatternClips(project);
  const portals = Timeline.selectSelectedPortals(project);
  dispatch(Timeline.updateMediaClipboard({ clips, portals }));
};

/** Cut all selected media into the clipboard, deleting them. */
export const cutSelectedMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();

  // Copy the media to the clipboard
  const clips = Timeline.selectSelectedPatternClips(project);
  const portals = Timeline.selectSelectedPortals(project);
  dispatch(Timeline.updateMediaClipboard({ clips, portals }));

  // Delete the media
  const clipIds = Timeline.selectSelectedPatternClipIds(project);
  const portalIds = Timeline.selectSelectedPortalIds(project);
  dispatch(deleteMedia({ clipIds, portalIds }));
};

/**
 * Paste all media from the clipboard to the timeline,
 * starting at the current tick from the selected track.
 */
export const pasteSelectedMedia =
  (): Thunk<_.NewMediaPayload> => (dispatch, getProject) => {
    const project = getProject();
    const noMedia = { clipIds: [], poseIds: [], portalIds: [] };

    // Do nothing if there are no tracks
    const trackIds = selectTrackIds(project);
    if (!trackIds?.length) return noMedia;

    // Do nothing if no track is selected
    const selectedTrackId = Timeline.selectSelectedTrackId(project);
    if (!selectedTrackId) return noMedia;

    // Get the media from the clipboard
    const clipboard = Timeline.selectMediaClipboard(project);
    const media = getClipboardMedia(clipboard);
    if (!media?.length) return noMedia;

    // Get the offseted media
    const offsetedMedia = _.getOffsettedMedia(
      media,
      Transport.ticks,
      selectedTrackId,
      trackIds
    );

    // Make sure all of the media is valid
    const trackMap = selectTrackMap(project);
    const validMedia = _.getValidMedia(offsetedMedia, trackMap);
    if (validMedia.length !== offsetedMedia.length) return noMedia;

    // Prepare the new media
    const clips = _.getClipsFromMedia(validMedia);
    const portals = _.getPortalsFromMedia(validMedia);

    // Create the new media
    const newMedia = dispatch(createMedia({ clips, portals }));
    dispatch(Timeline.updateMediaSelection(newMedia));
    return newMedia;
  };

/** Duplicate all selected media. */
export const duplicateSelectedMedia =
  (): Thunk => async (dispatch, getProject) => {
    const project = getProject();
    const mediaSelection = Timeline.selectMediaSelection(project);
    const { patternClipIds, poseClipIds } = mediaSelection;
    if (!patternClipIds.length && !poseClipIds.length) return;

    // Get the selected clips and their durations
    const patternClips = Timeline.selectSelectedClips(project);
    const poseClips = Timeline.selectSelectedPoseClips(project);
    const clips = [...patternClips, ...poseClips];
    const clipIds = [...patternClipIds, ...poseClipIds];
    const clipDurations = Clips.selectClipDurations(project, clipIds);

    // Get the selected portals
    const portals = Timeline.selectSelectedPortals(project);
    const portalDurations = portals.map((_) => 1);

    // Duplicate the media
    const media = [...clips, ...portals];
    const duplicatedMedia = _.getDuplicatedMedia(media, [
      ...clipDurations,
      ...portalDurations,
    ]);

    // Create and select the new media
    const newClips = _.getClipsFromMedia(duplicatedMedia);
    const newPortals = _.getPortalsFromMedia(duplicatedMedia);
    const mediaIds = dispatch(
      createMedia({ clips: newClips, portals: newPortals })
    );
    const newPatternClipIds = (mediaIds.clipIds ?? []).filter(isPatternClipId);
    const newPoseClipIds = (mediaIds.clipIds ?? []).filter(isPoseClipId);

    dispatch(
      Timeline.updateMediaSelection({
        patternClipIds: newPatternClipIds,
        poseClipIds: newPoseClipIds,
        portalIds: mediaIds.portalIds,
      })
    );
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

    // Then, move the media elements through any portal that they go through
    const selectedClips = Timeline.selectSelectedClips(project);
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
    const newClips = _.getClipsFromMedia(mediaClips);
    dispatch(updateMedia({ clips: newClips, portals: newPortals }));
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
  const portalIds = Timeline.selectSelectedPortalIds(project);
  dispatch(deleteMedia({ clipIds, portalIds }));
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
    dispatch(Timeline.updateMediaDraft({ patternClip: { patternId } }));
  };

/** Set the selected pose by updating the media draft. */
export const setSelectedPose =
  (poseId: PatternId): Thunk =>
  (dispatch) => {
    dispatch(Timeline.updateMediaDraft({ poseClip: { poseId } }));
  };

/** Merge the selected media. */
export const mergeSelectedMedia =
  (options: { name?: string } = {}): Thunk =>
  async (dispatch, getProject) => {
    const project = getProject();
    const patternMap = Patterns.selectPatternMap(project);
    const patternClips = Timeline.selectSelectedPatternClips(project);
    const patternNames: string[] = [];

    // Iterate through all clips and merge their streams
    const sortedClips = patternClips.sort((a, b) => a.tick - b.tick);
    const totalStream = sortedClips.reduce((acc, clip) => {
      // Get the clip pattern
      const pattern = patternMap[clip.patternId];
      if (!pattern) return acc;
      patternNames.push(getPatternName(pattern));

      // Get the clip stream
      const duration = Clips.selectClipDuration(project, clip.id);
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
          const newChord = updatePatternChordNotes(block, chord);
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
    const patternId = dispatch(Patterns.createPattern(pattern));
    Timeline.updateMediaDraft({ patternClip: { patternId } });

    // Create a new clip
    const { trackId, tick } = sortedClips[0];
    const clip = initializePatternClip({ trackId, patternId, tick });
    dispatch(Clips._mergeClips({ oldClips: patternClips, newClip: clip }));
  };

/** The handler for when a media clip is dragged. */
export const onMediaDragEnd =
  (item: any, monitor: any): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const orderedTrackIds = selectTrackIds(project);
    const { subdivision } = Timeline.selectTimeline(project);
    const selectedClips = Timeline.selectSelectedClips(project);
    const selectedPortals = Timeline.selectSelectedPortals(project);

    // Get the value from the item
    const element: _.MediaElement =
      item.clip || item.portalEntry || item.portalExit;

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
          getOriginalIdFromPortaledClip(clip.id)
        )
      : selectedClips;

    // Get the list of portals as is
    const portals = selectedPortals;

    // Prepare the new media
    const newClips: ClipUpdate[] = [];
    const newPortals: PortalUpdate[] = [];

    // Iterate over the targeted clips
    for (const clip of clips) {
      let originalClip = clip;
      // If the clip is a chunk, get the original one
      if (clip.id.includes("-chunk-")) {
        const originalId = getOriginalIdFromPortaledClip(clip.id);
        const realClip = Clips.selectClipById(project, originalId);
        if (!realClip) return;
        originalClip = realClip;
      }

      // Get the new track and make sure the clip is going into a pattern track
      const trackIndex = orderedTrackIds.indexOf(clip?.trackId);
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
    if (newPortals.some((item) => item.tick && item.tick < 0)) return;

    // If not copying, update the media
    if (!copying) {
      dispatch(updateMedia({ clips: newClips, portals: newPortals }));
      return;
    }

    // Otherwise, create the new media
    const mediaIds = dispatch(
      createMedia({
        clips: newClips as ClipNoId[],
        portals: newPortals as PortalNoId[],
      })
    );
    dispatch(Timeline.updateMediaSelection(mediaIds));
  };
