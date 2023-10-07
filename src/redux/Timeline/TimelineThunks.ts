import {
  addSelectedClips,
  addSelectedTranspositions,
  removeSelectedClips,
  removeSelectedTranspositions,
  selectRoot,
  selectSelectedClips,
  selectSelectedPattern,
  selectSelectedTrack,
  selectSelectedTranspositions,
  setSelectedClips,
  setSelectedPattern,
  setSelectedTranspositions,
} from "../Root";
import { AppThunk } from "redux/store";
import {
  createTranspositions,
  selectTranspositionsByTrackIds,
} from "../Transposition";
import { Clip } from "types/Clip";
import {
  getMediaStartTick,
  getMediaEndTick,
  getMediaTrackIds,
  getMediaInRange,
  getMediaClips,
  getMediaTranspositions,
} from "types/Media";
import { isHoldingShift, isHoldingOption } from "utils";
import { selectTimeline } from "./TimelineSelectors";
import { MouseEvent } from "react";
import {
  updateClips,
  selectClipDurations,
  selectClipsByTrackIds,
  exportClipsToMidi,
  createClips,
} from "redux/Clip";
import { Transposition } from "types/Transposition";
import { selectTransport } from "redux/Transport";
import { selectOrderedTrackIds } from "redux/Track";
import { union } from "lodash";
import { isPatternTrack } from "types/PatternTrack";
import { isPattern } from "types/Pattern";

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
  (e: MouseEvent, clip: Clip, eyedropping = false): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { selectedPatternId, selectedClipIds } = selectRoot(state);
    const timeline = selectTimeline(state);

    // Eyedrop the pattern if the user is eyedropping
    if (eyedropping) {
      dispatch(setSelectedPattern(clip.patternId));
      return;
    }

    // Change the pattern if the user is adding a clip
    if (timeline.state === "adding" && selectedPatternId) {
      dispatch(
        updateClips({
          clips: [{ ...clip, patternId: selectedPatternId }],
        })
      );
    }

    // Deselect the clip if it is selected
    const isClipSelected = selectedClipIds.includes(clip.id);
    if (isClipSelected) {
      dispatch(removeSelectedClips([clip.id]));
      return;
    }

    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);

    // Select the clip if the user is not holding shift
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        dispatch(addSelectedClips([clip.id]));
      } else {
        dispatch(setSelectedClips([clip.id]));
      }
      return;
    }

    // Just select the clip if there are no other selected clips
    if (selectedClipIds.length === 0) {
      dispatch(setSelectedClips([clip.id]));
      return;
    }

    // Select a range of clips if the user is holding shift
    const selectedClips = selectSelectedClips(state);
    const selectedMedia = union(selectedClips, [clip]);
    const selectedMediaIds = selectedMedia.map((item) => item.id);
    // Compute the start and end time of the selection
    const startTick = getMediaStartTick(selectedMedia);
    const durations = selectClipDurations(state, selectedMediaIds);
    const endTick = getMediaEndTick(selectedMedia, durations);

    // Get all clips that are in the track range
    const orderedIds = selectOrderedTrackIds(state);
    const trackIds = getMediaTrackIds(selectedClips, orderedIds, clip.trackId);
    const trackClips = selectClipsByTrackIds(state, trackIds);
    const trackClipIds = trackClips.map((clip) => clip.id);
    const trackClipDurations = selectClipDurations(state, trackClipIds);

    // Get all clips that are in the tick range
    const rangeMedia = getMediaInRange(
      trackClips,
      startTick,
      endTick,
      trackClipDurations
    );
    const rangeClips = getMediaClips(rangeMedia);
    const rangeClipIds = rangeClips.map((clip) => clip.id);

    // Select the clips
    dispatch(setSelectedClips(rangeClipIds));
  };

/**
 * The handler for when a transposition is clicked.
 * @param e The mouse event.
 * @param transposition The transposition that was clicked.
 */

export const onTranspositionClick =
  (e: MouseEvent, transposition: Transposition): AppThunk =>
  (dispatch, getState) => {
    if (!transposition) return;
    const state = getState();
    const selectedTranspositions = selectSelectedTranspositions(state);
    const nativeEvent = e.nativeEvent as Event;

    // Deselect the transposition if it is selected
    const isSelected = selectedTranspositions.some(
      (t) => t.id === transposition.id
    );
    if (isSelected) {
      dispatch(removeSelectedTranspositions([transposition.id]));
      return;
    }

    // Select the transposition if the user is not holding shift
    const holdingShift = isHoldingShift(nativeEvent);
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        dispatch(addSelectedTranspositions([transposition.id]));
      } else {
        dispatch(setSelectedTranspositions([transposition.id]));
      }
      return;
    }

    // Just select the transposition if there are no other selected transpositions
    if (selectedTranspositions.length === 0) {
      dispatch(setSelectedTranspositions([transposition.id]));
      return;
    }

    // Select a range of transpositions if the user is holding shift
    const selectedMedia = [...selectedTranspositions, transposition];

    // Compute the start and end time of the selection
    const startTick = getMediaStartTick(selectedMedia);
    const endTick = getMediaEndTick(selectedMedia);

    // Get all transpositions that are in the track range
    const orderedIds = selectOrderedTrackIds(state);
    const trackIds = getMediaTrackIds(
      selectedTranspositions,
      orderedIds,
      transposition.trackId
    );
    const trackTranspositions = selectTranspositionsByTrackIds(state, trackIds);

    // Get all transpositions that are in the tick range
    const rangeMedia = getMediaInRange(trackTranspositions, startTick, endTick);
    const rangeTranspositions = getMediaTranspositions(rangeMedia);
    const rangeTranspositionIds = rangeTranspositions.map((t) => t.id);

    // Select the transpositions
    dispatch(setSelectedTranspositions(rangeTranspositionIds));
  };

/**
 * Add a transposition to the timeline at the current tick
 * using the transposition offsets and duration from the toolkit.
 */
export const addTranspositionToTimeline =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const { toolkit, selectedTrackId } = selectRoot(state);
    const { tick } = selectTransport(state);
    const { transpositionOffsets, transpositionDuration } = toolkit;
    if (!selectedTrackId) return;
    const transposition = {
      trackId: selectedTrackId,
      offsets: transpositionOffsets,
      duration: transpositionDuration || undefined,
      tick,
    };
    dispatch(createTranspositions([transposition]));
  };

/**
 * Add a `Clip` of the currently selected pattern to the timeline at the current tick.
 */
export const addPatternToTimeline = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const { tick } = selectTransport(state);
  const pattern = selectSelectedPattern(state);
  const track = selectSelectedTrack(state);
  if (!isPattern(pattern) || !isPatternTrack(track)) return;
  dispatch(createClips([{ patternId: pattern.id, trackId: track.id, tick }]));
};

/**
 * Export all selected clips to a MIDI file.
 * @param options The options for the MIDI file.
 */
export const exportSelectedClipsToMIDI =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const { selectedClipIds } = selectRoot(state);
    dispatch(exportClipsToMidi(selectedClipIds));
  };
