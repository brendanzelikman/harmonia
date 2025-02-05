import {
  _setTimelineType,
  clearTimelineState,
  setSelectedTrackId,
  setTimelineState,
  updateMediaDraft,
} from "./TimelineSlice";
import { next } from "utils/array";
import { isClipType, CLIP_TYPES } from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { _setEditorView, hideEditor } from "types/Editor/EditorSlice";
import { selectEditor, selectEditorView } from "types/Editor/EditorSelectors";
import {
  selectPatternTrackIds,
  selectScaleTrackIds,
  selectTrackDescendantIds,
  selectTrackInstrumentKey,
} from "types/Track/TrackSelectors";
import { Motif } from "types/Motif/MotifTypes";
import {
  selectNewMotifName,
  selectTimelineType,
  selectSelectedPatternTrack,
  selectTimeline,
  selectIsAddingClips,
  selectSelectedTrackId,
} from "./TimelineSelectors";
import { Payload, unpackUndoType } from "lib/redux";
import { createPattern } from "types/Pattern/PatternThunks";
import { createPose } from "types/Pose/PoseThunks";
import { createScale } from "types/Scale/ScaleThunks";
import { TimelineState } from "./TimelineTypes";
import { createTrackTree } from "types/Track/TrackThunks";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";

/** Set the selected clip type. */
export const setTimelineType =
  (payload: Payload<ClipType>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const view = selectEditorView(project);

    // Update the timeline type and editor view if it is open
    dispatch(_setTimelineType(payload));
    if (isClipType(view)) dispatch(_setEditorView(payload));
  };

/** Toggles the timeline type according to the order of the constant. */
export const toggleTimelineType = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const type = selectTimelineType(project);
  const index = CLIP_TYPES.indexOf(type);
  dispatch(setTimelineType({ data: next(CLIP_TYPES, index) }));
};

/** Toggles the timeline state based on the type provided */
export const toggleTimelineState =
  (payload: Payload<TimelineState>): Thunk =>
  (dispatch, getProject) => {
    const incomingState = payload.data;
    const undoType = unpackUndoType(payload, "toggleTimelineState");
    const project = getProject();
    const editor = selectEditor(project);
    const timeline = selectTimeline(project);

    // Hide the editor if it is visible
    if (editor.view) dispatch(hideEditor({ data: null, undoType }));

    // Idle the user if the state matches
    if (timeline.state === incomingState) {
      dispatch(clearTimelineState({ undoType }));
      return;
    }

    // Clear the media draft if starting to portal clips
    if (incomingState === "portaling-clips") {
      dispatch(updateMediaDraft({ data: { portal: {} }, undoType }));
    }

    // Update the timeline state
    dispatch(setTimelineState({ data: incomingState, undoType }));
  };

export const toggleAddingState =
  (payload: Payload<ClipType>): Thunk =>
  (dispatch, getProject) => {
    const type = payload.data;
    const undoType = unpackUndoType(payload, "toggleAddingState");
    const project = getProject();
    const timelineType = selectTimelineType(project);
    const isAdding = selectIsAddingClips(project);

    // Create a new ID for the type
    dispatch(
      updateMediaDraft({
        data: { [`${type}Clip`]: { [`${type}Id`]: undefined } },
        undoType,
      })
    );

    dispatch(setTimelineType({ data: type, undoType }));

    // Toggle the state if it is not already adding
    if (!isAdding || (isAdding && timelineType === type)) {
      dispatch(toggleTimelineState({ data: `adding-clips`, undoType }));
    }
  };

/** Create a new object based on the selected type. */
export const createTypedMotif =
  <T extends ClipType>(obj?: Partial<Motif<T>>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const type =
      obj && "type" in obj && isClipType(obj)
        ? (obj.type as ClipType)
        : selectTimelineType(project);
    if (!type) return;

    // Use the given name or generate a new one
    const name = obj?.name ?? selectNewMotifName(project, type);

    // Create the object based on the type
    if (type === "pattern") {
      const track = selectSelectedPatternTrack(project);
      const patternTrackId = track?.id;
      const instrumentKey = selectTrackInstrumentKey(project, patternTrackId);
      const pattern = { name, patternTrackId, instrumentKey };
      dispatch(createPattern({ data: pattern }));
    } else if (type === "pose") {
      const pose = { name };
      dispatch(createPose({ data: pose }));
    } else if (type === "scale") {
      const scale = { name };
      dispatch(createScale({ data: scale }));
    }
  };

export const toggleLivePlay = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const patternTrackIds = selectPatternTrackIds(project);
  let trackId = selectSelectedTrackId(project);
  const undoType = "goLive";

  // If no track is selected, try to find one
  if (!trackId) {
    // If there is a pattern track, select the first one
    if (patternTrackIds.length) {
      trackId = patternTrackIds[0];
    }

    // Otherwise, create new tracks
    else {
      const scaleTrackIds = selectScaleTrackIds(project);
      const hierarchy = selectTrackDescendantIds(project, scaleTrackIds[0]);

      // If there are scale tracks, add a pattern track as a child
      if (hierarchy.length) {
        trackId = dispatch(
          createPatternTrack(
            { parentId: hierarchy.at(-1)! },
            undefined,
            undoType
          )
        ).track.id;
      }

      // Otherwise, create a new track tree
      else {
        trackId = dispatch(createTrackTree({ undoType }))?.id;
      }
    }
  }

  // Select the new track
  dispatch(setSelectedTrackId({ data: trackId, undoType }));
};
