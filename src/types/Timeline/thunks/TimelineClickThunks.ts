import { createUndoType, Payload, unpackUndoType } from "lib/redux";
import { without, union, some } from "lodash";
import { updateClip } from "types/Clip/ClipSlice";
import { Clip, initializeClip } from "types/Clip/ClipTypes";
import {
  getMediaStartTick,
  getMediaEndTick,
  getMediaTrackIds,
  getMediaInRange,
  getPortalsFromMedia,
  getClipsFromMedia,
} from "types/Media/MediaFunctions";
import { selectPortalsByTrackIds } from "types/Portal/PortalSelectors";
import { initializePortal, Portal } from "types/Portal/PortalTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { selectTrackIds } from "types/Track/TrackSelectors";
import { DivMouseEvent, isHoldingShift, isHoldingOption } from "utils/html";
import {
  selectTimeline,
  selectSelectedClipIds,
  selectSelectedPortalIds,
  selectSelectedPortals,
  selectSelectedClips,
  selectColumnTicks,
  selectIsAddingClips,
  selectIsAddingPortals,
  selectSelectedClipIdMap,
  selectTimelineType,
  selectPortalFragment,
} from "../TimelineSelectors";
import {
  updateMediaSelection,
  updateFragment,
  setSelectedTrackId,
} from "../TimelineSlice";
import { selectClipsByTrackIds } from "types/Clip/ClipSelectors";
import { MediaElement } from "types/Media/MediaTypes";
import {
  addClipIdsToSelection,
  clearClipIdsFromSelection,
  removeClipIdsFromSelection,
  replaceClipIdsInSelection,
  toggleClipIdInSelection,
} from "./TimelineSelectionThunks";
import { addPortal } from "types/Portal/PortalSlice";
import { TrackId } from "types/Track/TrackTypes";
import { seekTransport } from "types/Transport/TransportThunks";
import { toggleTimelineState } from "../TimelineThunks";
import { Timed } from "types/units";
import { createMedia } from "types/Media/MediaThunks";

// ------------------------------------------------------------
// Cell Functins
// ------------------------------------------------------------

/** The handler for when a timeline cell is clicked. */
export const onCellClick =
  (columnIndex: number, trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const undoType = createUndoType("onCellClick", { columnIndex, trackId });
    const project = getProject();
    const tick = selectColumnTicks(project, columnIndex - 1);

    // If no track is selected, seek the transport to the time and deselect all media
    if (trackId === undefined) {
      dispatch(seekTransport({ data: tick, undoType }));
      dispatch(updateMediaSelection({ data: { clipIds: [] }, undoType }));
      return;
    }

    const portalDraft = selectPortalFragment(project);
    const isAddingClips = selectIsAddingClips(project);
    const type = selectTimelineType(project);

    // Add clips
    if (isAddingClips) {
      dispatch(
        createMedia({
          data: { clips: [initializeClip({ trackId, tick, type })] },
          undoType,
        })
      );
      dispatch(toggleTimelineState({ data: "adding-clips", undoType }));
      return;
    }

    // Set the fragment if portaling and there's no current fragment
    const isPortaling = selectIsAddingPortals(project);
    if (isPortaling && !some(portalDraft)) {
      const portal = { tick, trackId };
      dispatch(updateFragment({ data: { portal }, undoType }));
      return;
    }

    // Create a portal if portaling and there's a current fragment
    if (isPortaling && portalDraft !== undefined) {
      const portal = initializePortal({
        ...portalDraft,
        portaledTrackId: trackId,
        portaledTick: tick,
      });
      dispatch(addPortal({ data: portal, undoType }));
      dispatch(toggleTimelineState({ data: "portaling-clips", undoType }));
    }

    // Otherwise, seek the transport, select the track, and deselect all media
    dispatch(seekTransport({ data: tick, undoType }));
    dispatch(clearClipIdsFromSelection({ undoType }));
    if (trackId) dispatch(setSelectedTrackId({ data: trackId, undoType }));
  };

// ------------------------------------------------------------
// Clip Functions
// ------------------------------------------------------------

/**
 * The handler for when a clip is clicked.
 * * If the user is eyedropping, the motif will be changed instead of the clip.
 * * If the user is adding clips to the timeline, the clip's motif will be changed.
 * * If the user is holding Alt, the clip will be added to the selection.
 * * If the user is holding Shift, a range of clips will be selected.
 * * Otherwise, the clip will be selected.
 * @param e The mouse event.
 * @param clip The clip that was clicked.
 * @param eyedropping Whether the user is eyedropping or not.
 */
export const onClipClick =
  (
    e: DivMouseEvent,
    clip: Timed<Clip>,
    options: { eyedropping: boolean } = { eyedropping: false }
  ): Thunk =>
  (dispatch, getProject) => {
    const undoType = createUndoType("onClipClick", clip, options);
    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);
    const holdingOption = isHoldingOption(nativeEvent);
    const project = getProject();
    const isAddingClips = selectIsAddingClips(project);
    const selectedClipIds = selectSelectedClipIds(project);
    const selectedClipIdMap = selectSelectedClipIdMap(project);
    const motifField = `${clip.type}Id` as keyof Clip;
    const motifId = clip[motifField];
    const id = clip.id;
    const isClipSelected = selectedClipIdMap[id];

    // If the alt key is held, toggle the clip in the selection
    if (holdingOption) {
      dispatch(toggleClipIdInSelection({ data: id, undoType }));
      return;
    }

    // Update the clip's motif if adding clips
    if (isAddingClips && motifId) {
      const data = { ...clip, [motifField]: motifId };
      dispatch(updateClip({ data, undoType }));
    }

    // Just select the clip if there are no other selected clips
    if (!selectedClipIds.length) {
      dispatch(replaceClipIdsInSelection({ data: [id], undoType }));
      return;
    }

    // Deselect the clip if it is selected
    if (isClipSelected) {
      dispatch(removeClipIdsFromSelection({ data: [id], undoType }));
      return;
    }

    // Select a range of clips if the user is holding shift
    if (holdingShift) {
      dispatch(selectRangeOfClips({ data: clip, undoType }));
      return;
    }

    // Add the clip to the selection if the user is holding option
    if (holdingOption) {
      dispatch(addClipIdsToSelection({ data: [id], undoType }));
      return;
    }

    // Otherwise, replace the selection with the clip
    dispatch(replaceClipIdsInSelection({ data: [id], undoType }));
  };

/** Select a range of clips based on the tick and track clicked. */
export const selectRangeOfClips =
  (payload: Payload<Timed<Clip>>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const clip = payload.data;
    const undoType = unpackUndoType(payload, "selectRangeOfClips");

    // Get all selected clips
    const selection = union<Timed<Clip>>(selectSelectedClips(project), [clip]);

    // Compute the start and end time of the selection
    const startTick = getMediaStartTick(selection);
    const endTick = getMediaEndTick(selection);
    const range = [startTick, endTick] as [number, number];

    // Get all clips that are in the track range
    const trackIds = selectTrackIds(project);
    const rangeTracks = getMediaTrackIds(selection, trackIds, clip.trackId);
    const clipsInTracks = selectClipsByTrackIds(project, rangeTracks);

    // Get all clips that are in the tick range
    const media = getMediaInRange(clipsInTracks, range);
    const clips = getClipsFromMedia(media);
    const clipIds = clips.map((clip) => clip.id);
    dispatch(updateMediaSelection({ data: { clipIds }, undoType }));
  };

// ------------------------------------------------------------
// Portal Functions
// ------------------------------------------------------------

/**
 * The handler for when a portal is clicked.
 * * If the user is holding Alt, the portal will be added to the selection.
 * * If the user is holding Shift, a range of portals will be selected.
 * * Otherwise, the portal will be selected.
 * @param e The mouse event.
 * @param portal The portal that was clicked.
 */

export const onPortalClick =
  (e: React.MouseEvent<HTMLDivElement>, portal: Timed<Portal>): Thunk =>
  (dispatch, getProject) => {
    const undoType = createUndoType("onPortalClick", { portal });
    const project = getProject();
    const timeline = selectTimeline(project);
    const { selection } = timeline;
    const selectedPortalIds = selectSelectedPortalIds(project);

    // Deselect the portal if it is selected
    const isSelected = selection?.portalIds?.includes(portal.id);
    if (isSelected) {
      const newIds = without(selectedPortalIds, portal.id);
      dispatch(updateMediaSelection({ data: { portalIds: newIds }, undoType }));
      return;
    }

    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);

    // Select the portal if the user is not holding shift
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        const newIds = union(selectedPortalIds, [portal.id]);
        dispatch(
          updateMediaSelection({ data: { portalIds: newIds }, undoType })
        );
      } else {
        dispatch(
          updateMediaSelection({ data: { portalIds: [portal.id] }, undoType })
        );
      }
      return;
    }

    // Just select the portal if there are no other selected portals
    if (!selectedPortalIds.length) {
      dispatch(
        updateMediaSelection({ data: { portalIds: [portal.id] }, undoType })
      );
      return;
    }

    // Select a range of portals if the user is holding shift
    const selectedPortals = selectSelectedPortals(project);
    const selectedMedia = union<Timed<MediaElement>>(selectedPortals, [portal]);

    // Compute the start and end time of the selection
    const startTick = getMediaStartTick(selectedMedia);
    const endTick = getMediaEndTick(selectedMedia);

    // Get all portals that are in the track range
    const orderedIds = selectTrackIds(project);
    const trackIds = getMediaTrackIds(
      selectedPortals,
      orderedIds,
      portal.trackId
    );
    const portals = selectPortalsByTrackIds(project, trackIds);

    // Get all portals that are in the tick range
    const media = getMediaInRange(
      portals.map((p) => ({ ...p, duration: 1 })),
      [startTick, endTick]
    );
    const mediaPortals = getPortalsFromMedia(media);
    const mediaPortalIds = mediaPortals.map((portal) => portal.id);

    // Select the clips
    dispatch(
      updateMediaSelection({ data: { portalIds: mediaPortalIds }, undoType })
    );
  };
