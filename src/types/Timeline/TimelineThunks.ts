import * as _ from "./TimelineSelectors";
import { MouseEvent } from "react";
import { difference, isUndefined, union, without } from "lodash";
import { getTransport } from "tone";
import { TRACK_WIDTH } from "utils/constants";
import {
  _setSelectedClipType,
  setSelectedTrackId,
  setTimelineState,
  updateMediaDraft,
  updateMediaSelection,
} from "./TimelineSlice";
import { getTickColumns } from "utils/durations";
import { isHoldingShift, isHoldingOption, DivMouseEvent } from "utils/html";
import { mod } from "utils/math";
import { hasKeys } from "utils/objects";
import { updateClip } from "types/Clip/ClipSlice";
import {
  isClipType,
  PatternClip,
  PoseClip,
  ScaleClip,
  initializePatternClip,
  initializePoseClip,
  initializeScaleClip,
  ClipId,
} from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { initializePortal, Portal } from "types/Portal/PortalTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { TrackId, isPatternTrack } from "types/Track/TrackTypes";
import {
  isTimelineAddingPatternClips,
  isTimelineAddingPoseClips,
  isTimelineAddingScaleClips,
  isTimelineSlicingClips,
  isTimelinePortalingClips,
  isTimelineMergingClips,
} from "./TimelineFunctions";
import { _setEditorView, hideEditor } from "types/Editor/EditorSlice";
import {
  selectClipDurations,
  selectClipsByTrackIds,
} from "types/Clip/ClipSelectors";
import { selectEditor, selectEditorView } from "types/Editor/EditorSelectors";
import { selectPortalsByTrackIds } from "types/Portal/PortalSelectors";
import {
  selectOrderedTrackIds,
  selectTrackById,
  selectTrackInstrumentKey,
} from "types/Track/TrackSelectors";
import {
  getMediaStartTick,
  getMediaEndTick,
  getMediaTrackIds,
  getMediaInRange,
  getPortalsFromMedia,
  getClipsFromMedia,
} from "types/Media/MediaFunctions";
import { Motif } from "types/Motif/MotifTypes";
import { selectSelectedPatternTrack } from "./TimelineSelectors";
import { addPortal } from "types/Portal/PortalSlice";
import { createUndoType, Payload, unpackUndoType } from "lib/redux";
import { sliceClip, exportClipsToMidi } from "types/Clip/ClipThunks";
import { showEditor } from "types/Editor/EditorThunks";
import {
  setSelectedPattern,
  setSelectedPose,
  setSelectedScale,
  createMedia,
} from "types/Media/MediaThunks";
import { createPattern } from "types/Pattern/PatternThunks";
import { createPose } from "types/Pose/PoseThunks";
import { createScale } from "types/Scale/ScaleThunks";
import { deleteTrack } from "types/Track/TrackThunks";
import { seekTransport } from "types/Transport/TransportThunks";

/** Set the selected clip type. */
export const setSelectedClipType =
  (payload: Payload<ClipType>): Thunk =>
  (dispatch, getProject) => {
    const type = payload.data;
    const undoType = unpackUndoType(payload, "setSelectedClipType");
    const project = getProject();
    const selectedObject = _.selectSelectedMotif(project, type);

    // Update the current type
    dispatch(_setSelectedClipType(payload));

    // Check the timeline state for type-related actions
    const currentState = _.selectTimelineState(project);
    if (currentState !== undefined) {
      const isAdding = currentState.startsWith("adding");
      const wasOtherType = currentState !== `adding-${type}-clips`;
      const hasNoSelection = isUndefined(selectedObject);
      if (isAdding && hasNoSelection) {
        dispatch(setTimelineState({ data: "idle", undoType }));
      } else if (isAdding && wasOtherType) {
        dispatch(setTimelineState({ data: `adding-${type}-clips`, undoType }));
      }
    }

    // Switch the editor if it is open on the other type
    const view = selectEditorView(project);
    const isType = isClipType(view);
    if (isType) {
      dispatch(_setEditorView(payload));
    }
  };

/** Toggles the selected clip type between patterns and poses. */
export const toggleSelectedClipType = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const timeline = _.selectTimeline(project);

  // Toggle clip type
  if (!timeline.selectedClipType) {
    dispatch(setSelectedClipType({ data: "pattern" }));
  }
  if (timeline.selectedClipType === "pattern") {
    dispatch(setSelectedClipType({ data: "scale" }));
  } else if (timeline.selectedClipType === "scale") {
    dispatch(setSelectedClipType({ data: "pose" }));
  } else if (timeline.selectedClipType === "pose") {
    dispatch(setSelectedClipType({ data: "pattern" }));
  }
};

/** Toggles the timeline between adding clips of the selected type and not. */
export const toggleAddingClips = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const timeline = _.selectTimeline(project);
  const object = _.selectSelectedMotif(project);
  if (!object) return;

  // If the timeline is already adding clips, set it to idle
  if (
    timeline.state === "adding-pattern-clips" ||
    timeline.state === "adding-pose-clips" ||
    timeline.state === "adding-scale-clips"
  ) {
    dispatch(setTimelineState("idle"));
    return;
  }

  // Otherwise, update the timeline based on the selected type
  if (timeline.selectedClipType === "pattern") {
    dispatch(setTimelineState("adding-pattern-clips"));
  } else if (timeline.selectedClipType === "pose") {
    dispatch(setTimelineState("adding-pose-clips"));
  } else if (timeline.selectedClipType === "scale") {
    dispatch(setTimelineState("adding-scale-clips"));
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
    dispatch(setTimelineState("adding-pattern-clips"));
    if (editor.view) dispatch(hideEditor({ data: null }));
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
    dispatch(setTimelineState("adding-pose-clips"));
    if (editor.view) dispatch(hideEditor({ data: null }));
  }
};

/** Toggles the timeline between adding scale clips and not. */
export const toggleAddingScaleClips = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineAddingScaleClips(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("adding-scale-clips"));
    if (editor.view) dispatch(hideEditor({ data: null }));
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
    dispatch(setTimelineState("slicing-clips"));
    if (editor.view) dispatch(hideEditor({ data: null }));
  }
};

/** Toggles the timeline between portaling media and nots. */
export const togglePortalingMedia =
  (payload?: Payload): Thunk =>
  (dispatch, getProject) => {
    const undoType = payload?.undoType ?? "togglePortalingMedia";
    const project = getProject();
    const editor = selectEditor(project);
    const timeline = _.selectTimeline(project);
    if (isTimelinePortalingClips(timeline)) {
      dispatch(setTimelineState({ data: "idle", undoType }));
    } else {
      dispatch(updateMediaDraft({ data: { portal: {} }, undoType }));
      dispatch(setTimelineState({ data: "portaling-clips", undoType }));
      if (editor.view) dispatch(hideEditor({ data: null, undoType }));
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
    dispatch(setTimelineState("merging-clips"));
    if (editor.view) dispatch(hideEditor({ data: null }));
  }
};

/** Create a new object based on the selected type. */
export const createObject =
  <T extends ClipType>(obj?: Partial<Motif<T>>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const type = _.selectSelectedClipType(project);
    const track = selectSelectedPatternTrack(project);

    const instrumentKey = selectTrackInstrumentKey(project, track?.id);
    if (!type) return;

    const newObjectName = _.selectNewMotifName(project, type);
    const name = obj?.name ?? newObjectName;
    const patternTrackId = track?.id;
    const createObject = {
      pattern: () =>
        dispatch(
          createPattern({ data: { name, patternTrackId, instrumentKey } })
        ),
      pose: () => dispatch(createPose({ data: { name } })),
      scale: () => dispatch(createScale({ data: { name } })),
    }[type];

    createObject();
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
    const undoType = createUndoType("onCellClick", { columnIndex, trackId });

    // If no track is selected, seek the transport to the time and deselect all media
    if (trackId === undefined) {
      dispatch(seekTransport({ data: tick, undoType }));
      dispatch(updateMediaSelection({ data: { clipIds: [] }, undoType }));
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
      dispatch(
        createPatternClipFromMediaDraft({ data: { trackId, tick }, undoType })
      );
      return;
    }

    // Try to create a pose clip if adding pose clips
    const isAddingPoseClips = isTimelineAddingPoseClips(timeline);
    if (isAddingPoseClips) {
      dispatch(
        createPoseClipFromMediaDraft({ data: { tick, trackId }, undoType })
      );
      return;
    }

    // Try to create a scale clip if adding scale clips
    const isAddingScaleClips = isTimelineAddingScaleClips(timeline);
    if (isAddingScaleClips) {
      dispatch(
        createScaleClipFromMediaDraft({ data: { tick, trackId }, undoType })
      );
      return;
    }

    // Set the fragment if portaling and there's no current fragment
    const isPortaling = isTimelinePortalingClips(timeline);
    if (isPortaling && !hasKeys(mediaDraft?.portal)) {
      dispatch(
        updateMediaDraft({ data: { portal: { tick, trackId } }, undoType })
      );
      return;
    }

    // Create a portal if portaling and there's a current fragment
    const portalDraft = mediaDraft?.portal;
    if (isPortaling && portalDraft !== undefined) {
      const portal = initializePortal({
        ...portalDraft,
        portaledTrackId: trackId,
        portaledTick: tick,
      });
      dispatch(addPortal({ data: portal, undoType }));
      dispatch(togglePortalingMedia({ undoType }));
    }

    // Otherwise, seek the transport to the time
    dispatch(seekTransport({ data: tick, undoType }));

    // Select the track if there is one
    if (trackId) dispatch(setSelectedTrackId({ data: trackId, undoType }));

    // Deselect all media
    dispatch(updateMediaSelection({ data: { clipIds: [] }, undoType }));
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
  (e: DivMouseEvent, clip?: PatternClip, eyedropping = false): Thunk =>
  (dispatch, getProject) => {
    if (!clip) return;
    const undoType = createUndoType("onPatternClipClick", { clip });
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const { mediaDraft } = timeline;
    const selectedClipIds = _.selectSelectedClipIds(project);
    const patternId = mediaDraft?.patternClip?.patternId;

    // Eyedrop the pattern if the user is eyedropping
    if (eyedropping) {
      dispatch(setSelectedPattern({ data: clip.patternId, undoType }));
      dispatch(setSelectedClipType({ data: "pattern", undoType }));
      return;
    }

    // Change the pattern if the user is adding clips
    if (isTimelineAddingPatternClips(timeline) && patternId) {
      dispatch(updateClip({ data: { ...clip, patternId }, undoType }));
      return;
    }

    // Deselect the clip if it is selected
    const isClipSelected = selectedClipIds.includes(clip.id);
    if (isClipSelected) {
      const newIds = without(selectedClipIds, clip.id);
      dispatch(updateMediaSelection({ data: { clipIds: newIds }, undoType }));
      return;
    }

    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);

    // Select the clip if the user is not holding shift
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        const newIds = union(selectedClipIds, [clip.id]);
        dispatch(updateMediaSelection({ data: { clipIds: newIds }, undoType }));
      } else {
        dispatch(
          updateMediaSelection({ data: { clipIds: [clip.id] }, undoType })
        );
      }
      return;
    }

    // Just select the clip if there are no other selected clips
    if (!selectedClipIds.length) {
      dispatch(
        updateMediaSelection({ data: { clipIds: [clip.id] }, undoType })
      );
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
    dispatch(
      updateMediaSelection({ data: { clipIds: mediaClipIds }, undoType })
    );
  };

/** Update the media draft and show the pattern editor when a pattern clip is double clicked. */
export const onPatternClipDoubleClick =
  ({ patternId }: PatternClip): Thunk =>
  (dispatch) => {
    const undoType = createUndoType("onPatternClipDoubleClick", { patternId });
    dispatch(
      updateMediaDraft({ data: { patternClip: { patternId } }, undoType })
    );
    dispatch(showEditor({ data: { view: "pattern" }, undoType }));
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
    const undoType = createUndoType("onPoseClipClick", { clip });
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const cellWidth = _.selectCellWidth(project);
    const selectedClipIds = _.selectSelectedClipIds(project);
    const nativeEvent = e.nativeEvent as Event;

    if (eyedropping) {
      dispatch(setSelectedPose({ data: clip.poseId, undoType }));
      dispatch(setSelectedClipType({ data: "pose", undoType }));
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
      dispatch(sliceClip({ data: { id: clip.id, tick }, undoType }));
      return;
    }

    // Update the pose if transposing
    if (isTimelineAddingPoseClips(timeline)) {
      const draft = _.selectDraftedPoseClip(project);
      const newClip = { ...clip, ...draft };
      dispatch(updateClip({ data: newClip, undoType }));
    }

    // Deselect the pose if it is selected
    const isSelected = selectedClipIds.some((id) => id === clip.id);
    if (isSelected) {
      const newIds = without(selectedClipIds, clip.id);
      dispatch(updateMediaSelection({ data: { clipIds: newIds }, undoType }));
      return;
    }

    // Select the pose if the user is not holding shift
    const holdingShift = isHoldingShift(nativeEvent);
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        const newIds = union(selectedClipIds, [clip.id]);
        dispatch(updateMediaSelection({ data: { clipIds: newIds }, undoType }));
      } else {
        dispatch(
          updateMediaSelection({ data: { clipIds: [clip.id] }, undoType })
        );
      }
      return;
    }

    // Just select the pose if there are no other selected poses
    if (!selectedClipIds.length) {
      dispatch(
        updateMediaSelection({ data: { clipIds: [clip.id] }, undoType })
      );
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
    dispatch(
      updateMediaSelection({
        data: { clipIds: mediaClipIds },
        undoType,
      })
    );
  };

/** Update the media draft and show the pose editor when a pose clip is double clicked. */
export const onPoseClipDoubleClick =
  (clip?: PoseClip): Thunk =>
  (dispatch) => {
    if (!clip) return;
    const undoType = createUndoType("onPoseClipDoubleClick", { clip });
    dispatch(
      updateMediaDraft({
        data: { poseClip: { poseId: clip.poseId } },
        undoType,
      })
    );
    dispatch(showEditor({ data: { view: "pose" }, undoType }));
  };

/**
 * The handler for when a scale clip is clicked.
 * * If the user is adding poses to the timeline, add the pose
 * * If the user is holding Alt, the pose will be added to the selection.
 * * If the user is holding Shift, a range of poses will be selected.
 * * Otherwise, the pose will be selected.
 */
export const onScaleClipClick =
  (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    clip?: ScaleClip,
    eyedropping = false
  ): Thunk =>
  (dispatch, getProject) => {
    if (!clip) return;
    const undoType = createUndoType("onScaleClipClick", { clip });
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const cellWidth = _.selectCellWidth(project);
    const selectedClipIds = _.selectSelectedClipIds(project);
    const selectedScaleClips = _.selectSelectedScaleClips(project);
    const nativeEvent = e.nativeEvent as Event;

    if (eyedropping) {
      dispatch(setSelectedScale({ data: clip.scaleId, undoType }));
      dispatch(setSelectedClipType({ data: "scale", undoType }));
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
      dispatch(sliceClip({ data: { id: clip.id, tick }, undoType }));
      return;
    }

    // Update the clip if transposing
    if (isTimelineAddingScaleClips(timeline)) {
      const draft = _.selectDraftedScaleClip(project);
      const newClip = { ...clip, ...draft };
      dispatch(updateClip({ data: newClip, undoType }));
    }

    // Deselect the clip if it is selected
    const isSelected = selectedScaleClips.some((t) => t.id === clip.id);
    if (isSelected) {
      const newIds = without(selectedClipIds, clip.id);
      dispatch(updateMediaSelection({ data: { clipIds: newIds }, undoType }));
      return;
    }

    // Select the clip if the user is not holding shift
    const holdingShift = isHoldingShift(nativeEvent);
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        const newIds = union(selectedClipIds, [clip.id]);
        dispatch(updateMediaSelection({ data: { clipIds: newIds }, undoType }));
      } else {
        dispatch(
          updateMediaSelection({ data: { clipIds: [clip.id] }, undoType })
        );
      }
      return;
    }

    // Just select the pose if there are no other selected clips
    if (!selectedScaleClips.length) {
      dispatch(
        updateMediaSelection({ data: { clipIds: [clip.id] }, undoType })
      );
      return;
    }

    // Select a range of clips if the user is holding shift
    const selectedClips = _.selectSelectedClips(project);
    const selectedMedia = union(selectedClips, [clip]);

    // Compute the start and end time of the selection
    const startTick = getMediaStartTick(selectedMedia);
    const endTick = getMediaEndTick(selectedMedia);

    // Get all clips that are in the track range
    const orderedIds = selectOrderedTrackIds(project);
    const trackIds = getMediaTrackIds(selectedClips, orderedIds, clip.trackId);
    const clips = selectClipsByTrackIds(project, trackIds);
    const clipIds = clips.map((_) => _.id);
    const clipDurations = selectClipDurations(project, clipIds);

    // Get all clips that are in the tick range
    const media = getMediaInRange(clips, clipDurations, [startTick, endTick]);
    const mediaClips = getClipsFromMedia(media);
    const mediaPoseIds = mediaClips.map((pose) => pose.id);

    // Select the clips
    dispatch(
      updateMediaSelection({
        data: { clipIds: mediaPoseIds },
        undoType,
      })
    );
  };

/** Update the media draft and show the pose editor when a pose clip is double clicked. */
export const onScaleClipDoubleClick =
  (clip?: ScaleClip): Thunk =>
  (dispatch) => {
    if (!clip) return;
    const undoType = createUndoType("onScaleClipDoubleClick", { clip });
    dispatch(
      updateMediaDraft({
        data: { scaleClip: { scaleId: clip.scaleId } },
        undoType,
      })
    );
    dispatch(showEditor({ data: { view: "scale" }, undoType }));
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
    const undoType = createUndoType("onPortalClick", { portal });
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const { mediaSelection } = timeline;
    const selectedPortalIds = _.selectSelectedPortalIds(project);

    // Deselect the portal if it is selected
    const isSelected = mediaSelection?.portalIds?.includes(portal.id);
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
    const mediaPortals = getPortalsFromMedia(media);
    const mediaPortalIds = mediaPortals.map((portal) => portal.id);

    // Select the clips
    dispatch(
      updateMediaSelection({ data: { portalIds: mediaPortalIds }, undoType })
    );
  };

/** Add a clip to the currently selected track using the media draft. */
export const createPatternClipFromMediaDraft =
  (payload?: Payload<Partial<PatternClip>>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const data = payload?.data ?? {};
    const undoType = payload?.undoType ?? "createPatternClipFromMediaDraft";
    const selectedTrackId = _.selectSelectedTrackId(project);

    // Get the drafted clip
    const draft = { ..._.selectDraftedPatternClip(project), ...data };
    const clip = initializePatternClip({
      ...draft,
      trackId: draft.trackId ?? selectedTrackId,
      tick: draft.tick ?? getTransport().ticks,
    });

    // Create the clip
    dispatch(createMedia({ data: { clips: [clip] }, undoType }));
  };

/** Add a pose to the currently selected track using the media draft. */
export const createPoseClipFromMediaDraft =
  (payload?: Payload<Partial<PoseClip>>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const data = payload?.data;
    const undoType = payload?.undoType ?? "createPoseClipFromMediaDraft";
    const selectedTrackId = _.selectSelectedTrackId(project);

    // Get the drafted pose
    const draft = { ..._.selectDraftedPoseClip(project), ...data };
    const clip = initializePoseClip({
      ...draft,
      tick: isUndefined(draft.tick) ? getTransport().ticks : draft.tick,
      trackId: isUndefined(draft.trackId) ? selectedTrackId : draft.trackId,
    });

    // Create the pose
    dispatch(createMedia({ data: { clips: [clip] }, undoType }));
  };

/** Add a clip to the currently selected track using the media draft. */
export const createScaleClipFromMediaDraft =
  ({ data, undoType }: Payload<Partial<ScaleClip>>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedTrackId = _.selectSelectedTrackId(project);

    // Get the drafted clip
    const draft = { ..._.selectDraftedScaleClip(project), ...data };
    const clip = initializeScaleClip({
      ...draft,
      trackId: isUndefined(draft.trackId) ? selectedTrackId : draft.trackId,
      tick: isUndefined(draft.tick) ? getTransport().ticks : draft.tick,
    });

    // Create the clip
    dispatch(createMedia({ data: { clips: [clip] }, undoType }));
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
  dispatch(setSelectedTrackId({ data: previousTrackId }));
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
  dispatch(setSelectedTrackId({ data: nextTrackId }));
};

/** Export all selected clips to a MIDI file. */
export const exportSelectedClipsToMIDI =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();
    const selectedClipIds = _.selectSelectedClipIds(project);
    dispatch(exportClipsToMidi(selectedClipIds));
  };

/** Delete the selected track. */
export const deleteSelectedTrack = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const trackId = _.selectSelectedTrackId(project);
  if (!trackId) return;
  dispatch(deleteTrack({ data: trackId }));
};

export const addClipIdsToSelection =
  (payload: Payload<ClipId[]>): Thunk =>
  (dispatch, getProject) => {
    const undoType = unpackUndoType(payload, "addClipIdsToSelection");
    const project = getProject();
    const selectedClipIds = _.selectSelectedClipIds(project);
    const newIds = union(selectedClipIds, payload.data);
    dispatch(updateMediaSelection({ data: { clipIds: newIds } }));
  };

export const removeClipIdsFromSelection =
  (payload: Payload<ClipId[]>): Thunk =>
  (dispatch, getProject) => {
    const undoType = unpackUndoType(payload, "removeClipIdsFromSelection");
    const project = getProject();
    const selectedClipIds = _.selectSelectedClipIds(project);
    const newIds = difference(selectedClipIds, payload.data);
    dispatch(updateMediaSelection({ data: { clipIds: newIds }, undoType }));
  };

export const toggleClipIdInSelection =
  (clipId: ClipId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedClipIds = _.selectSelectedClipIds(project);
    const newIds = selectedClipIds.includes(clipId)
      ? without(selectedClipIds, clipId)
      : union(selectedClipIds, [clipId]);
    dispatch(updateMediaSelection({ data: { clipIds: newIds } }));
  };
