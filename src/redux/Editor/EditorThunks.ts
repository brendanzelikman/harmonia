import {
  selectEditor,
  selectSelectedTrackId,
  selectTrackById,
} from "redux/selectors";
import { AppThunk } from "redux/store";
import { isScaleTrack } from "types/ScaleTrack";
import { TrackId } from "types/Track";
import { hideEditor, showEditor } from "./EditorSlice";
import { isPatternTrack } from "types/PatternTrack";
import { isEditorOn } from "types/Editor";

/**
 * Toggle the scale editor of a track.
 * @param trackId The track ID.
 */
export const toggleTrackScaleEditor =
  (trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const track = selectTrackById(state, trackId);
    if (!track || !isScaleTrack(track)) return;
    const selectedTrackId = selectSelectedTrackId(state);
    const editor = selectEditor(state);
    const onScale = isEditorOn(editor, "scale");
    const onEditor = trackId === selectedTrackId && onScale;
    if (onEditor) {
      dispatch(hideEditor());
    } else {
      dispatch(showEditor({ id: "scale", trackId }));
    }
  };

/**
 * Toggle the instrument editor of a track.
 * @param trackId The track ID.
 */
export const toggleTrackInstrumentEditor =
  (trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const track = selectTrackById(state, trackId);
    if (!track || !isPatternTrack(track)) return;
    const selectedTrackId = selectSelectedTrackId(state);
    const editor = selectEditor(state);
    const onInstrument = isEditorOn(editor, "instrument");
    const onEditor = trackId === selectedTrackId && onInstrument;
    if (onEditor) {
      dispatch(hideEditor());
    } else {
      dispatch(showEditor({ id: "instrument", trackId }));
    }
  };
