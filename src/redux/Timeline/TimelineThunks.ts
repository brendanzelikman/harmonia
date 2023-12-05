import * as _ from "./TimelineSelectors";
import { Thunk } from "types/Project";
import {
  PatternClip,
  PoseClip,
  initializePatternClip,
  initializePoseClip,
} from "types/Clip";
import {
  getMediaStartTick,
  getMediaEndTick,
  getMediaTrackIds,
  getMediaInRange,
  getPatternClipsFromMedia,
  getPoseClipsFromMedia,
  getPortalsFromMedia,
} from "types/Media";
import { MouseEvent } from "react";
import {
  updateClips,
  selectClipsByTrackIds,
  exportClipsToMidi,
} from "redux/Clip";
import { seekTransport } from "redux/Transport";
import { selectTrackById } from "redux/Track";
import { isUndefined, union, without } from "lodash";
import {
  createMedia,
  deleteTrack,
  setSelectedPattern,
  setSelectedPose,
  sliceClip,
} from "redux/thunks";
import { TrackId, isPatternTrack } from "types/Track";
import { Transport } from "tone";
import { TRACK_WIDTH } from "utils/constants";
import {
  isTimelineAddingPatternClips,
  isTimelineAddingPoseClips,
  isTimelineMergingClips,
  isTimelinePortalingClips,
  isTimelineSlicingClips,
} from "types/Timeline";
import {
  setSelectedClipType,
  setSelectedTrackId,
  setTimelineState,
  updateMediaDraft,
  updateMediaSelection,
} from "./TimelineSlice";
import {
  selectEditor,
  selectTrackIds,
  selectPortalsByTrackIds,
  selectClipDurations,
} from "redux/selectors";
import { hideEditor, showEditor } from "redux/Editor";
import { getTickColumns } from "utils/durations";
import { isHoldingShift, isHoldingOption } from "utils/html";
import { mod } from "utils/math";
import { Portal, initializePortal } from "types/Portal";
import { addPortals } from "redux/Portal";
import { hasKeys } from "utils/objects";

/** Toggles the selected clip type between patterns and poses. */
export const toggleSelectedClipType = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const timeline = _.selectTimeline(project);
  const otherType =
    timeline.selectedClipType === "pattern" ? "pose" : "pattern";
  dispatch(setSelectedClipType(otherType));

  if (isTimelineAddingPatternClips(timeline)) {
    dispatch(setTimelineState("addingPoseClips"));
  }
  if (isTimelineAddingPoseClips(timeline)) {
    dispatch(setTimelineState("addingPatternClips"));
  }
};

/** Toggles the timeline between adding clips of the selected type and not. */
export const toggleAddingClips = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const timeline = _.selectTimeline(project);

  // If the timeline is already adding clips, set it to idle
  if (timeline.state !== "idle") {
    dispatch(setTimelineState("idle"));
    return;
  }

  // Otherwise, set the timeline to adding clips
  if (timeline.selectedClipType === "pattern") {
    dispatch(setTimelineState("addingPatternClips"));
  } else if (timeline.selectedClipType === "pose") {
    dispatch(setTimelineState("addingPoseClips"));
  }
};

/** Toggles the timeline between adding pattern clips and not. */
export const toggleAddingPatternClips = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineAddingPatternClips(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("addingPatternClips"));
    if (editor.view) dispatch(hideEditor());
  }
};

/** Toggles the timeline between adding pose clips and not. */
export const toggleAddingPoseClips = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineAddingPoseClips(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("addingPoseClips"));
    if (editor.view) dispatch(hideEditor());
  }
};

/** Toggles the timeline between slicing media and not.. */
export const toggleSlicingMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineSlicingClips(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("slicingClips"));
    if (editor.view) dispatch(hideEditor());
  }
};

/** Toggles the timeline between portaling media and nots. */
export const togglePortalingMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelinePortalingClips(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("portalingClips"));
    if (editor.view) dispatch(hideEditor());
  }
};

/** Toggles the timeline between merging media and not. */
export const toggleMergingMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineMergingClips(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("mergingClips"));
    if (editor.view) dispatch(hideEditor());
  }
};

/**
 * The handler for when a cell is clicked.
 * * If no track is selected, seek the transport to the time and deselect all media.
 * * If the user is adding clips to the timeline, create a clip.
 * * If the user is transposing, create a pose.
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
      dispatch(
        updateMediaSelection({
          patternClipIds: [],
          poseClipIds: [],
          portalIds: [],
        })
      );
      return;
    }
    const timeline = _.selectTimeline(project);
    const { mediaDraft } = timeline;

    const track = selectTrackById(project, trackId);
    const onPatternTrack = !!track && isPatternTrack(track);

    // Try to create a pattern clip if adding pattern clips
    const isAddingPatternClips = isTimelineAddingPatternClips(timeline);
    if (isAddingPatternClips) {
      if (!onPatternTrack) return;

      // Get the pattern ID from the draft
      const { patternId } = mediaDraft.patternClip;
      if (!patternId) return;

      // Create the clip
      dispatch(createPatternClipFromMediaDraft({ patternId, trackId, tick }));
      return;
    }

    // Create a pose if adding poses
    const isAddingPoseClips = isTimelineAddingPoseClips(timeline);
    if (isAddingPoseClips) {
      dispatch(createPoseClipFromMediaDraft({ tick, trackId }));
      return;
    }

    // Set the fragment if portaling and there's no current fragment
    const isPortaling = isTimelinePortalingClips(timeline);
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
    dispatch(updateMediaSelection({ patternClipIds: [], poseClipIds: [] }));
  };

/**
 * The handler for when a pattern clip is clicked.
 * * If the user is eyedropping, the pattern will be changed instead of the clip.
 * * If the user is adding clips to the timeline, the clip's pattern will be changed.
 * * If the user is holding Alt, the clip will be added to the selection.
 * * If the user is holding Shift, a range of clips will be selected.
 * * Otherwise, the clip will be selected.
 * @param e The mouse event.
 * @param clip The clip that was clicked.
 * @param eyedropping Whether the user is eyedropping or not.
 */
export const onPatternClipClick =
  (
    e: MouseEvent<HTMLDivElement>,
    clip?: PatternClip,
    eyedropping = false
  ): Thunk =>
  (dispatch, getProject) => {
    if (!clip) return;
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const { mediaDraft } = timeline;
    const selectedClipIds = _.selectSelectedPatternClipIds(project);
    const patternId = mediaDraft.patternClip.patternId;

    // Eyedrop the pattern if the user is eyedropping
    if (eyedropping) {
      dispatch(setSelectedPattern(clip.patternId));
      return;
    }

    // Change the pattern if the user is adding clips
    if (isTimelineAddingPatternClips(timeline) && patternId) {
      dispatch(updateClips({ clips: [{ ...clip, patternId }] }));
      return;
    }

    // Deselect the clip if it is selected
    const isClipSelected = selectedClipIds.includes(clip.id);
    if (isClipSelected) {
      const newIds = without(selectedClipIds, clip.id);
      dispatch(updateMediaSelection({ patternClipIds: newIds }));
      return;
    }

    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);

    // Select the clip if the user is not holding shift
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        const newIds = union(selectedClipIds, [clip.id]);
        dispatch(updateMediaSelection({ patternClipIds: newIds }));
      } else {
        dispatch(updateMediaSelection({ patternClipIds: [clip.id] }));
      }
      return;
    }

    // Just select the clip if there are no other selected clips
    if (!selectedClipIds.length) {
      dispatch(updateMediaSelection({ patternClipIds: [clip.id] }));
      return;
    }

    // Select a range of clips if the user is holding shift
    const selectedClips = _.selectSelectedPatternClips(project);
    const selectedMedia = union(selectedClips, [clip]);
    const selectedMediaIds = selectedMedia.map((item) => item.id);

    // Compute the start and end time of the selection
    const startTick = getMediaStartTick(selectedMedia);
    const durations = selectClipDurations(project, selectedMediaIds);
    const endTick = getMediaEndTick(selectedMedia, durations);

    // Get all clips that are in the track range
    const orderedIds = selectTrackIds(project);
    const trackIds = getMediaTrackIds(selectedClips, orderedIds, clip.trackId);
    const clips = selectClipsByTrackIds(project, trackIds);
    const clipIds = clips.map((clip) => clip.id);
    const clipDurations = selectClipDurations(project, clipIds);

    // Get all clips that are in the tick range
    const media = getMediaInRange(clips, clipDurations, [startTick, endTick]);
    const mediaClips = getPatternClipsFromMedia(media);
    const mediaClipIds = mediaClips.map((clip) => clip.id);

    // Select the clips
    dispatch(updateMediaSelection({ patternClipIds: mediaClipIds }));
  };

/** Update the media draft and show the pattern editor when a pattern clip is double clicked. */
export const onPatternClipDoubleClick =
  (clip: PatternClip): Thunk =>
  (dispatch) => {
    dispatch(updateMediaDraft({ patternClip: { patternId: clip.patternId } }));
    dispatch(showEditor("pattern"));
  };

/**
 * The handler for when a pose is clicked.
 * * If the user is adding poses to the timeline, add the pose
 * * If the user is holding Alt, the pose will be added to the selection.
 * * If the user is holding Shift, a range of poses will be selected.
 * * Otherwise, the pose will be selected.
 */
export const onPoseClipClick =
  (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    clip?: PoseClip,
    eyedropping = false
  ): Thunk =>
  (dispatch, getProject) => {
    if (!clip) return;
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const cellWidth = _.selectCellWidth(project);
    const selectedPoseIds = _.selectSelectedPoseClipIds(project);
    const selectedPoses = _.selectSelectedPoseClips(project);
    const nativeEvent = e.nativeEvent as Event;

    if (eyedropping) {
      dispatch(setSelectedPose(clip.poseId));
      return;
    }

    // Slice the pose if slicing
    if (isTimelineSlicingClips(timeline)) {
      const grid = e.currentTarget.offsetParent;
      if (!grid) return;
      const subdivisionTick = getTickColumns(1, timeline.subdivision);
      const tickWidth = cellWidth * subdivisionTick;
      const cursorLeft = e.clientX - TRACK_WIDTH;
      const tick = Math.round(cursorLeft / tickWidth);
      dispatch(sliceClip(clip, tick));
      return;
    }

    // Update the pose if transposing
    if (isTimelineAddingPoseClips(timeline)) {
      const draft = _.selectDraftedPoseClip(project);
      const newClip = { ...clip, ...draft };
      dispatch(updateClips({ clips: [newClip] }));
    }

    // Deselect the pose if it is selected
    const isSelected = selectedPoses.some((t) => t.id === clip.id);
    if (isSelected) {
      const newIds = without(selectedPoseIds, clip.id);
      dispatch(updateMediaSelection({ poseClipIds: newIds }));
      return;
    }

    // Select the pose if the user is not holding shift
    const holdingShift = isHoldingShift(nativeEvent);
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        const newIds = union(selectedPoseIds, [clip.id]);
        dispatch(updateMediaSelection({ poseClipIds: newIds }));
      } else {
        dispatch(updateMediaSelection({ poseClipIds: [clip.id] }));
      }
      return;
    }

    // Just select the pose if there are no other selected poses
    if (!selectedPoses.length) {
      dispatch(updateMediaSelection({ poseClipIds: [clip.id] }));
      return;
    }

    // Select a range of poses if the user is holding shift
    const selectedMedia = union(selectedPoses, [clip]);

    // Compute the start and end time of the selection
    const startTick = getMediaStartTick(selectedMedia);
    const endTick = getMediaEndTick(selectedMedia);

    // Get all poses that are in the track range
    const orderedIds = selectTrackIds(project);
    const trackIds = getMediaTrackIds(selectedPoses, orderedIds, clip.trackId);
    const poses = selectClipsByTrackIds(project, trackIds);
    const poseIds = poses.map((_) => _.id);
    const poseDurations = selectClipDurations(project, poseIds);

    // Get all poses that are in the tick range
    const media = getMediaInRange(poses, poseDurations, [startTick, endTick]);
    const mediaPoses = getPoseClipsFromMedia(media);
    const mediaPoseIds = mediaPoses.map((pose) => pose.id);

    // Select the poses
    dispatch(updateMediaSelection({ poseClipIds: mediaPoseIds }));
  };

/** Update the media draft and show the pose editor when a pose clip is double clicked. */
export const onPoseClipDoubleClick =
  (clip?: PoseClip): Thunk =>
  (dispatch) => {
    if (!clip) return;
    dispatch(updateMediaDraft({ poseClip: { poseId: clip.poseId } }));
    dispatch(showEditor("pose"));
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
    const orderedIds = selectTrackIds(project);
    const trackIds = getMediaTrackIds(
      selectedPortals,
      orderedIds,
      portal.trackId
    );
    const portals = selectPortalsByTrackIds(project, trackIds);
    const durations = portals.map((_) => 1);

    // Get all portals that are in the tick range
    const media = getMediaInRange(portals, durations, [startTick, endTick]);
    const mediaPortals = getPortalsFromMedia(media);
    const mediaPortalIds = mediaPortals.map((portal) => portal.id);

    // Select the clips
    dispatch(updateMediaSelection({ portalIds: mediaPortalIds }));
  };

/** Add a clip to the currently selected track using the media draft. */
export const createPatternClipFromMediaDraft =
  (partial?: Partial<PatternClip>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedTrackId = _.selectSelectedTrackId(project);

    // Get the drafted clip
    const draft = { ..._.selectDraftedPatternClip(project), ...partial };
    const clip = initializePatternClip({
      ...draft,
      trackId: isUndefined(draft.trackId) ? selectedTrackId : draft.trackId,
      tick: isUndefined(draft.tick) ? Transport.ticks : draft.tick,
    });

    // Create the clip
    dispatch(createMedia({ clips: [clip] }));
  };

/** Add a pose to the currently selected track using the media draft. */
export const createPoseClipFromMediaDraft =
  (partial?: Partial<PoseClip>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedTrackId = _.selectSelectedTrackId(project);

    // Get the drafted pose
    const draft = { ..._.selectDraftedPoseClip(project), ...partial };
    const clip = initializePoseClip({
      ...draft,
      tick: isUndefined(draft.tick) ? Transport.ticks : draft.tick,
      trackId: isUndefined(draft.trackId) ? selectedTrackId : draft.trackId,
    });

    // Create the pose
    dispatch(createMedia({ clips: [clip] }));
  };

/** Select the previous track in the timeline if possible. */
export const selectPreviousTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const selectedTrackId = _.selectSelectedTrackId(project);
  if (!selectedTrackId) return;

  // Get the tracks from the store
  const orderedTrackIds = selectTrackIds(project);
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
  const orderedTrackIds = selectTrackIds(project);
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
    const selectedClipIds = _.selectSelectedPatternClipIds(project);
    dispatch(exportClipsToMidi(selectedClipIds));
  };

/** Delete the selected track. */
export const deleteSelectedTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const trackId = _.selectSelectedTrackId(project);
  if (!trackId) return;
  dispatch(deleteTrack(trackId));
};
