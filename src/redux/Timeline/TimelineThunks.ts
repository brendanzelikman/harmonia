import * as _ from "./TimelineSelectors";
import { Thunk } from "types/Project";
import {
  createTranspositions,
  selectTranspositionDuration,
  selectTranspositionDurations,
  selectTranspositionsByTrackIds,
  updateTranspositions,
} from "../Transposition";
import { Clip, ClipNoId } from "types/Clip";
import {
  getMediaStartTick,
  getMediaEndTick,
  getMediaTrackIds,
  getMediaInRange,
  getClipsFromMedia,
  getTranspositionsFromMedia,
} from "types/Media";
import { MouseEvent } from "react";
import {
  updateClips,
  selectClipDurations,
  selectClipsByTrackIds,
  createClips,
  exportClipsToMidi,
} from "redux/Clip";
import { Transposition, TranspositionNoId } from "types/Transposition";
import { seekTransport } from "redux/Transport";
import { selectTrackById } from "redux/Track";
import { isUndefined, union, without } from "lodash";
import { isPatternTrack } from "types/PatternTrack";
import { sliceMedia } from "redux/thunks";
import { TrackId } from "types/Track";
import { Transport } from "tone";
import { TRACK_WIDTH } from "utils/constants";
import {
  isTimelineAddingClips,
  isTimelineAddingTranspositions,
  isTimelineMergingMedia,
  isTimelinePortalingMedia,
  isTimelineSlicingMedia,
} from "types/Timeline";
import {
  setSelectedTrackId,
  setTimelineState,
  updateMediaDraft,
  updateMediaSelection,
} from "./TimelineSlice";
import {
  selectEditor,
  selectOrderedTrackIds,
  selectPortalsByTrackIds,
} from "redux/selectors";
import { hideEditor, showEditor } from "redux/Editor";
import { getTickColumns } from "utils/durations";
import { isHoldingShift, isHoldingOption } from "utils/html";
import { mod } from "utils/math";
import { Portal, initializePortal } from "types/Portal";
import { addPortals } from "redux/Portal";
import { hasKeys } from "utils/objects";

/** Toggles the timeline between adding clips and not adding clips. */
export const toggleAddingClips = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineAddingClips(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("addingClips"));
    if (editor.view) dispatch(hideEditor());
  }
};

/** Toggles the timeline between adding transpositions and not adding transpositions. */
export const toggleAddingTranspositions =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();
    const editor = selectEditor(project);
    const timeline = _.selectTimeline(project);
    if (isTimelineAddingTranspositions(timeline)) {
      dispatch(setTimelineState("idle"));
    } else {
      dispatch(setTimelineState("addingTranspositions"));
      if (editor.view) dispatch(hideEditor());
    }
  };

/** Toggles the timeline between slicing media and not slicing media. */
export const toggleSlicingMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineSlicingMedia(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("slicingMedia"));
    if (editor.view) dispatch(hideEditor());
  }
};

/** Toggles the timeline between portaling media and not portaling media. */
export const togglePortalingMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelinePortalingMedia(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("portalingMedia"));
    if (editor.view) dispatch(hideEditor());
  }
};

/** Toggles the timeline between merging media and not merging media. */
export const toggleMergingMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineMergingMedia(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("mergingMedia"));
    if (editor.view) dispatch(hideEditor());
  }
};

/**
 * The handler for when a cell is clicked.
 * * If no track is selected, seek the transport to the time and deselect all media.
 * * If the user is adding clips to the timeline, create a clip.
 * * If the user is transposing, create a transposition.
 * * Otherwise, seek the transport to the time and select the track.
 */

export const onCellClick =
  (columnIndex: number, trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const tick = _.selectColumnTicks(project, columnIndex - 1);

    // If no track is selected, seek the transport to the time and deselect all media
    if (trackId === undefined) {
      dispatch(seekTransport(tick));
      dispatch(updateMediaSelection({ clipIds: [], poseIds: [] }));
      return;
    }
    const timeline = _.selectTimeline(project);
    const { mediaDraft } = timeline;

    const track = selectTrackById(project, trackId);
    const onPatternTrack = !!track && isPatternTrack(track);

    // Try to create a clip if adding clips
    const isAdding = isTimelineAddingClips(timeline);
    if (isAdding) {
      if (!onPatternTrack) return;

      // Get the pattern ID from the draft
      const { patternId } = mediaDraft.clip;
      if (!patternId) return;

      // Create the clip
      dispatch(createClipFromMediaDraft({ patternId, trackId, tick }));
      return;
    }

    // Create a transposition if adding transpositions
    const isTransposing = isTimelineAddingTranspositions(timeline);
    if (isTransposing) {
      dispatch(createTranspositionFromMediaDraft({ tick, trackId }));
      return;
    }

    // Set the fragment if portaling and there's no current fragment
    const isPortaling = isTimelinePortalingMedia(timeline);
    if (isPortaling && !hasKeys(mediaDraft.portal)) {
      dispatch(updateMediaDraft({ portal: { tick, trackId } }));
      return;
    }

    // Create a portal if portaling and there's a current fragment
    if (isPortaling && hasKeys(mediaDraft.portal)) {
      const portal = initializePortal({
        ...mediaDraft.portal,
        portaledTrackId: trackId,
        portaledTick: tick,
      });
      dispatch(addPortals({ portals: [portal] }));
      dispatch(togglePortalingMedia());
    }

    // Otherwise, seek the transport to the time
    dispatch(seekTransport(tick));

    // Select the track if there is one
    if (trackId) dispatch(setSelectedTrackId(trackId));

    // Deselect all media
    dispatch(updateMediaSelection({ clipIds: [], poseIds: [] }));
  };

/**
 * The handler for when a clip is clicked.
 * * If the user is eyedropping, the pattern will be changed instead of the clip.
 * * If the user is adding clips to the timeline, the clip's pattern will be changed.
 * * If the user is holding Alt, the clip will be added to the selection.
 * * If the user is holding Shift, a range of clips will be selected.
 * * Otherwise, the clip will be selected.
 * @param e The mouse event.
 * @param clip The clip that was clicked.
 * @param eyedropping Whether the user is eyedropping or not.
 */
export const onClipClick =
  (e: MouseEvent<HTMLDivElement>, clip?: Clip, eyedropping = false): Thunk =>
  (dispatch, getProject) => {
    if (!clip) return;
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const { mediaSelection, mediaDraft } = timeline;
    const selectedClipIds = _.selectSelectedClipIds(project);
    const patternId = mediaDraft.clip.patternId;

    // Eyedrop the pattern if the user is eyedropping
    if (eyedropping) {
      dispatch(updateMediaDraft({ clip: { patternId } }));
      return;
    }

    // Change the pattern if the user is adding clips
    if (isTimelineAddingClips(timeline) && patternId) {
      dispatch(updateClips({ clips: [{ ...clip, patternId }] }));
      return;
    }

    // Deselect the clip if it is selected
    const isClipSelected = mediaSelection.clipIds.includes(clip.id);
    if (isClipSelected) {
      const newIds = without(selectedClipIds, clip.id);
      dispatch(updateMediaSelection({ clipIds: newIds }));
      return;
    }

    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);

    // Select the clip if the user is not holding shift
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        const newIds = union(selectedClipIds, [clip.id]);
        dispatch(updateMediaSelection({ clipIds: newIds }));
      } else {
        dispatch(updateMediaSelection({ clipIds: [clip.id] }));
      }
      return;
    }

    // Just select the clip if there are no other selected clips
    if (!selectedClipIds.length) {
      dispatch(updateMediaSelection({ clipIds: [clip.id] }));
      return;
    }

    // Select a range of clips if the user is holding shift
    const selectedClips = _.selectSelectedClips(project);
    const selectedMedia = union(selectedClips, [clip]);
    const selectedMediaIds = selectedMedia.map((item) => item.id);

    // Compute the start and end time of the selection
    const startTick = getMediaStartTick(selectedMedia);
    const durations = selectClipDurations(project, selectedMediaIds);
    const endTick = getMediaEndTick(selectedMedia, durations);

    // Get all clips that are in the track range
    const orderedIds = selectOrderedTrackIds(project);
    const trackIds = getMediaTrackIds(selectedClips, orderedIds, clip.trackId);
    const clips = selectClipsByTrackIds(project, trackIds);
    const clipIds = clips.map((clip) => clip.id);
    const clipDurations = selectClipDurations(project, clipIds);

    // Get all clips that are in the tick range
    const media = getMediaInRange(clips, clipDurations, [startTick, endTick]);
    const mediaClips = getClipsFromMedia(media);
    const mediaClipIds = mediaClips.map((clip) => clip.id);

    // Select the clips
    dispatch(updateMediaSelection({ clipIds: mediaClipIds }));
  };

/** Update the media draft and show the pattern editor when a clip is double clicked. */
export const onClipDoubleClick =
  (clip: Clip): Thunk =>
  (dispatch) => {
    dispatch(updateMediaDraft({ clip: { patternId: clip.patternId } }));
    dispatch(showEditor("patterns"));
  };

/**
 * The handler for when a transposition is clicked.
 * * If the user is adding transpositions to the timeline, add the transposition
 * * If the user is holding Alt, the transposition will be added to the selection.
 * * If the user is holding Shift, a range of transpositions will be selected.
 * * Otherwise, the transposition will be selected.
 */
export const onTranspositionClick =
  (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    transposition?: Transposition
  ): Thunk =>
  (dispatch, getProject) => {
    if (!transposition) return;
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const cellWidth = _.selectCellWidth(project);
    const selectedPoseIds = _.selectSelectedPoseIds(project);
    const selectedTranspositions = _.selectSelectedPoses(project);
    const nativeEvent = e.nativeEvent as Event;

    // Slice the transposition if slicing
    if (isTimelineSlicingMedia(timeline)) {
      const grid = e.currentTarget.offsetParent;
      if (!grid) return;
      const subdivisionTick = getTickColumns(1, timeline.subdivision);
      const tickWidth = cellWidth * subdivisionTick;
      const cursorLeft = e.clientX - TRACK_WIDTH;
      const tick = Math.round(cursorLeft / tickWidth);
      dispatch(sliceMedia(transposition, tick));
      return;
    }

    // Update the transposition if transposing
    if (isTimelineAddingTranspositions(timeline)) {
      const draft = _.selectDraftedPose(project);
      const newPose = { ...transposition, ...draft };
      dispatch(updateTranspositions({ poses: [newPose] }));
    }

    // Deselect the transposition if it is selected
    const isSelected = selectedTranspositions.some(
      (t) => t.id === transposition.id
    );
    if (isSelected) {
      const newIds = without(selectedPoseIds, transposition.id);
      dispatch(updateMediaSelection({ poseIds: newIds }));
      return;
    }

    // Select the transposition if the user is not holding shift
    const holdingShift = isHoldingShift(nativeEvent);
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        const newIds = union(selectedPoseIds, [transposition.id]);
        dispatch(updateMediaSelection({ poseIds: newIds }));
      } else {
        dispatch(updateMediaSelection({ poseIds: [transposition.id] }));
      }
      return;
    }

    // Just select the transposition if there are no other selected transpositions
    if (!selectedTranspositions.length) {
      dispatch(updateMediaSelection({ poseIds: [transposition.id] }));
      return;
    }

    // Select a range of transpositions if the user is holding shift
    const selectedMedia = union(selectedTranspositions, [transposition]);

    // Compute the start and end time of the selection
    const startTick = getMediaStartTick(selectedMedia);
    const endTick = getMediaEndTick(selectedMedia);

    // Get all transpositions that are in the track range
    const orderedIds = selectOrderedTrackIds(project);
    const trackIds = getMediaTrackIds(
      selectedTranspositions,
      orderedIds,
      transposition.trackId
    );
    const poses = selectTranspositionsByTrackIds(project, trackIds);
    const poseIds = poses.map((_) => _.id);
    const poseDurations = selectTranspositionDurations(project, poseIds);

    // Get all transpositions that are in the tick range
    const media = getMediaInRange(poses, poseDurations, [startTick, endTick]);
    const mediaPoses = getTranspositionsFromMedia(media);
    const mediaPoseIds = mediaPoses.map((_) => _.id);

    // Select the transpositions
    dispatch(updateMediaSelection({ poseIds: mediaPoseIds }));
  };

/**
 * The handler for when a portal is clicked.
 * * If the user is holding Alt, the portal will be added to the selection.
 * * If the user is holding Shift, a range of portals will be selected.
 * * Otherwise, the portal will be selected.
 * @param e The mouse event.
 * @param portal The portal that was clicked.
 */
export const onPortalClick =
  (e: MouseEvent<HTMLDivElement>, portal: Portal): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const { mediaSelection } = timeline;
    const selectedPortalIds = _.selectSelectedPortalIds(project);

    // Deselect the portal if it is selected
    const isSelected = mediaSelection.portalIds.includes(portal.id);
    if (isSelected) {
      const newIds = without(selectedPortalIds, portal.id);
      dispatch(updateMediaSelection({ portalIds: newIds }));
      return;
    }

    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);

    // Select the portal if the user is not holding shift
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        const newIds = union(selectedPortalIds, [portal.id]);
        dispatch(updateMediaSelection({ portalIds: newIds }));
      } else {
        dispatch(updateMediaSelection({ portalIds: [portal.id] }));
      }
      return;
    }

    // Just select the portal if there are no other selected portals
    if (!selectedPortalIds.length) {
      dispatch(updateMediaSelection({ portalIds: [portal.id] }));
      return;
    }

    // Select a range of portals if the user is holding shift
    const selectedPortals = _.selectSelectedPortals(project);
    const selectedMedia = union(selectedPortals, [portal]);

    // Compute the start and end time of the selection
    const startTick = getMediaStartTick(selectedMedia);
    const endTick = getMediaEndTick(
      selectedMedia,
      selectedMedia.map((_) => 1)
    );

    // Get all portals that are in the track range
    const orderedIds = selectOrderedTrackIds(project);
    const trackIds = getMediaTrackIds(
      selectedPortals,
      orderedIds,
      portal.trackId
    );
    const portals = selectPortalsByTrackIds(project, trackIds);
    const durations = portals.map((_) => 1);

    // Get all portals that are in the tick range
    const media = getMediaInRange(portals, durations, [startTick, endTick]);
    const mediaPortals = getClipsFromMedia(media);
    const mediaPortalIds = mediaPortals.map((portal) => portal.id);

    // Select the clips
    dispatch(updateMediaSelection({ portalIds: mediaPortalIds }));
  };

/** Add a clip to the currently selected track using the media draft. */
export const createClipFromMediaDraft =
  (partial?: Partial<ClipNoId>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedTrackId = _.selectSelectedTrackId(project);

    // Get the drafted clip
    const draft = { ..._.selectDraftedClip(project), ...partial };
    const clip = {
      ...draft,
      trackId: isUndefined(draft.trackId) ? selectedTrackId : draft.trackId,
      tick: isUndefined(draft.tick) ? Transport.ticks : draft.tick,
    };

    // Create the clip
    dispatch(createClips([clip]));
  };

/** Add a transposition to the currently selected track using the media draft. */
export const createTranspositionFromMediaDraft =
  (partial?: Partial<TranspositionNoId>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedTrackId = _.selectSelectedTrackId(project);

    // Get the drafted transposition
    const draft = { ..._.selectDraftedPose(project), ...partial };
    const transposition = {
      ...draft,
      tick: isUndefined(draft.tick) ? Transport.ticks : draft.tick,
      trackId: isUndefined(draft.trackId) ? selectedTrackId : draft.trackId,
      duration: isUndefined(draft.duration) ? Infinity : draft.duration,
    };

    // Create the transposition
    dispatch(createTranspositions([transposition]));
  };

/** Select the previous track in the timeline if possible. */
export const selectPreviousTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const selectedTrackId = _.selectSelectedTrackId(project);
  if (!selectedTrackId) return;

  // Get the tracks from the store
  const orderedTrackIds = selectOrderedTrackIds(project);
  const trackCount = orderedTrackIds.length;

  // Compute the new index
  const index = orderedTrackIds.indexOf(selectedTrackId);
  const previousTrackId = orderedTrackIds[mod(index - 1, trackCount)];

  // Dispatch the action
  dispatch(setSelectedTrackId(previousTrackId));
};

/** Select the next track in the timeline if possible. */
export const selectNextTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const selectedTrackId = _.selectSelectedTrackId(project);
  if (!selectedTrackId) return;

  // Get the tracks from the store
  const orderedTrackIds = selectOrderedTrackIds(project);
  const trackCount = orderedTrackIds.length;

  // Compute the new index
  const index = orderedTrackIds.indexOf(selectedTrackId);
  const nextTrackId = orderedTrackIds[mod(index + 1, trackCount)];

  // Dispatch the action
  dispatch(setSelectedTrackId(nextTrackId));
};

/** Export all selected clips to a MIDI file. */
export const exportSelectedClipsToMIDI =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();
    const selectedClipIds = _.selectSelectedClipIds(project);
    dispatch(exportClipsToMidi(selectedClipIds));
  };
