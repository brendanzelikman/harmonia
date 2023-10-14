import { AppThunk } from "redux/store";
import { selectClipIds, selectOrderedTrackIds } from "redux/selectors";
import { exportClipsToMidi } from "redux/Clip";
import { mod } from "utils";
import {
  selectSelectedClipIds,
  selectSelectedTrackId,
  setSelectedTrackId,
} from "redux/Timeline";
import { loadStateFromString } from "redux/util";

/**
 * Select the previous track in the timeline if possible.
 */
export const selectPreviousTrack = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const selectedTrackId = selectSelectedTrackId(state);
  if (!selectedTrackId) return;

  // Get the tracks from the store
  const orderedTrackIds = selectOrderedTrackIds(state);
  const trackCount = orderedTrackIds.length;

  // Compute the new index
  const index = orderedTrackIds.indexOf(selectedTrackId);
  const previousTrackId = orderedTrackIds[mod(index - 1, trackCount)];

  // Dispatch the action
  dispatch(setSelectedTrackId(previousTrackId));
};

/**
 * Select the next track in the timeline if possible.
 */
export const selectNextTrack = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const selectedTrackId = selectSelectedTrackId(state);
  if (!selectedTrackId) return;

  // Get the tracks from the store
  const orderedTrackIds = selectOrderedTrackIds(state);
  const trackCount = orderedTrackIds.length;

  // Compute the new index
  const index = orderedTrackIds.indexOf(selectedTrackId);
  const nextTrackId = orderedTrackIds[mod(index + 1, trackCount)];

  // Dispatch the action
  dispatch(setSelectedTrackId(nextTrackId));
};

/**
 * Export all selected clips to a MIDI file.
 * @param options The options for the MIDI file.
 */
export const exportSelectedClipsToMIDI =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const selectedClipIds = selectSelectedClipIds(state);
    dispatch(exportClipsToMidi(selectedClipIds));
  };

/**
 * Save the current state to a MIDI file based on all clips.
 */
export const saveStateToMIDI = (): AppThunk => (dispatch, getState) => {
  try {
    const state = getState();
    const clipIds = selectClipIds(state);
    return dispatch(exportClipsToMidi(clipIds));
  } catch (e) {
    console.log(e);
  }
};

/**
 * Load the demo project.
 */
export const loadDemo = (): AppThunk => () => {
  fetch(window.location.origin + "/harmonia/demos/demo.ham").then((res) => {
    res.text().then(loadStateFromString);
  });
};
