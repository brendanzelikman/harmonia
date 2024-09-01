import {
  _setTimelineType,
  clearTimelineState,
  setTimelineState,
  updateMediaDraft,
} from "./TimelineSlice";
import { mod } from "utils/math";
import { isClipType, CLIP_TYPES } from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { _setEditorView, hideEditor } from "types/Editor/EditorSlice";
import { selectEditor, selectEditorView } from "types/Editor/EditorSelectors";
import { selectTrackInstrumentKey } from "types/Track/TrackSelectors";
import { Motif } from "types/Motif/MotifTypes";
import {
  selectNewMotifName,
  selectTimelineType,
  selectSelectedMotif,
  selectSelectedPatternTrack,
  selectTimeline,
  selectTimelineState,
} from "./TimelineSelectors";
import { Payload, unpackUndoType } from "lib/redux";
import { createPattern } from "types/Pattern/PatternThunks";
import { createPose } from "types/Pose/PoseThunks";
import { createScale } from "types/Scale/ScaleThunks";
import { TimelineState } from "./TimelineTypes";

/** Set the selected clip type. */
export const setTimelineType =
  (payload: Payload<ClipType>): Thunk =>
  (dispatch, getProject) => {
    const type = payload.data;
    const undoType = unpackUndoType(payload, "setTimelineType");
    const project = getProject();
    const state = selectTimelineState(project);
    const view = selectEditorView(project);
    const motif = selectSelectedMotif(project, type);

    // Update the timeline type and editor view if it is open
    dispatch(_setTimelineType(payload));
    if (isClipType(view)) dispatch(_setEditorView(payload));

    // Idle the user if they are adding clips without a motif
    if (state === "adding-clips" && !motif) {
      dispatch(clearTimelineState({ undoType }));
    }
  };

/** Toggles the timeline type according to the order of the constant. */
export const toggleTimelineType = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const timeline = selectTimeline(project);
  const index = timeline.type ? CLIP_TYPES.indexOf(timeline.type) : -1;
  const newIndex = mod(index + 1, CLIP_TYPES.length);
  dispatch(setTimelineType({ data: CLIP_TYPES[newIndex] }));
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
    const motif = selectSelectedMotif(project);

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

    // Make sure the user has a motif if adding clips
    if (incomingState === "adding-clips" && !motif) return;

    // Update the timeline state
    dispatch(setTimelineState({ data: incomingState, undoType }));
  };

/** Create a new object based on the selected type. */
export const createTypedMotif =
  <T extends ClipType>(obj?: Partial<Motif<T>>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const type = selectTimelineType(project);
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
