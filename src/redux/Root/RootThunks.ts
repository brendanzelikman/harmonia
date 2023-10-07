import { AppThunk } from "redux/store";
import { selectClipIds } from "redux/selectors";
import { exportClipsToMidi } from "redux/Clip";

/**
 * Save the current state to a MIDI file based on all clips.
 */
export const saveStateToMIDI: AppThunk = (dispatch, getState) => {
  try {
    const state = getState();
    const clips = selectClipIds(state);
    return dispatch(exportClipsToMidi(clips));
  } catch (e) {
    console.log(e);
  }
};
