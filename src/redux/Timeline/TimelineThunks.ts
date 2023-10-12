import {
  addSelectedClips,
  addSelectedTranspositions,
  deselectAllClips,
  deselectAllTranspositions,
  removeSelectedClips,
  removeSelectedTranspositions,
  selectRoot,
  selectSelectedClips,
  selectSelectedPattern,
  selectSelectedTrack,
  selectSelectedTranspositions,
  setSelectedClips,
  setSelectedPattern,
  setSelectedTrack,
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
import {
  isHoldingShift,
  isHoldingOption,
  subdivisionToTicks,
  ticksToColumns,
} from "utils";
import { selectTickFromColumn, selectTimeline } from "./TimelineSelectors";
import { MouseEvent } from "react";
import {
  updateClips,
  selectClipDurations,
  selectClipsByTrackIds,
  exportClipsToMidi,
  createClips,
} from "redux/Clip";
import { Transposition } from "types/Transposition";
import { seekTransport, selectTransport } from "redux/Transport";
import { selectOrderedTrackIds, selectTrackById } from "redux/Track";
import { union } from "lodash";
import { isPatternTrack } from "types/PatternTrack";
import { isPattern } from "types/Pattern";
import { updateMedia, createMedia } from "redux/thunks";
import { TrackId } from "types/Track";
import { Transport } from "tone";

/**
 * The handler for when a cell is clicked.
 * * If no track is selected, seek the transport to the time and deselect all media.
 * * If the user is adding clips to the timeline, create a clip.
 * * If the user is transposing, create a transposition.
 * * Otherwise, seek the transport to the time and select the track.
 * @param columnIndex The index of the column that was clicked.
 * @param trackId The ID of the track that was clicked.
 */

export const onCellClick =
  (columnIndex: number, trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const tick = selectTickFromColumn(state, columnIndex - 1);

    // If no track is selected, seek the transport to the time and deselect all media
    if (trackId === undefined) {
      dispatch(seekTransport(tick));
      dispatch(deselectAllClips());
      dispatch(deselectAllTranspositions());
      return;
    }
    const root = selectRoot(state);
    const timeline = selectTimeline(state);
    const { toolkit, selectedPatternId } = root;

    const track = selectTrackById(state, trackId);
    const onPatternTrack = !!track && isPatternTrack(track);
    const adding = timeline.state === "adding";

    // Create a clip if adding and on a pattern track
    if (adding && selectedPatternId && onPatternTrack) {
      const clip = { patternId: selectedPatternId, trackId, tick };
      dispatch(createClips([clip]));
      return;
    }

    // Create a transposition if transposing
    if (timeline.state === "transposing") {
      const offsets = toolkit.transpositionOffsets;
      const duration = toolkit.transpositionDuration || undefined;
      dispatch(createTranspositions([{ trackId, tick, offsets, duration }]));
      return;
    }

    // Seek the transport to the time
    dispatch(seekTransport(tick));

    // Select the track
    if (trackId) dispatch(setSelectedTrack(trackId));

    // Deselect all media
    dispatch(deselectAllClips());
    dispatch(deselectAllTranspositions());
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
  (e: MouseEvent, clip?: Clip, eyedropping = false): AppThunk =>
  (dispatch, getState) => {
    if (!clip) return;
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
  (e: MouseEvent, transposition?: Transposition): AppThunk =>
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
    const selectedMedia = union(selectedTranspositions, [transposition]);

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
    const rangeTranspositionIds = rangeTranspositions.map((_) => _.id);

    // Select the transpositions
    dispatch(setSelectedTranspositions(rangeTranspositionIds));
  };

/**
 * The handler for when a clip is dragged.
 */
export const onClipDragEnd =
  (item: any, monitor: any): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const orderedTrackIds = selectOrderedTrackIds(state);
    const { subdivision } = selectTimeline(state);
    const selectedClips = selectSelectedClips(state);
    const selectedTranspositions = selectSelectedTranspositions(state);

    // Find the corresponding clip
    const clip = item.clip;

    // Compute the offset of the drag
    const rowIndex = orderedTrackIds.indexOf(clip.trackId);
    if (rowIndex === -1) return;
    const rowOffset = item.hoveringRow - rowIndex;
    const clipCol = ticksToColumns(clip.tick, subdivision);
    const colOffset = item.hoveringColumn - clipCol - 1;
    const tickOffset = colOffset * subdivisionToTicks(subdivision);

    // Get the drop result
    const dropResult = monitor.getDropResult();
    const copying = dropResult?.dropEffect === "copy";
    // Get the selected media
    const targetedClips = clip
      ? selectedClips.includes(clip)
        ? selectedClips
        : [clip]
      : [];

    // Compute the new array of clips
    const newClips: Clip[] = [];
    const newTranspositions: Transposition[] = [];

    // Iterate over the selected clips
    for (const clip of targetedClips) {
      // Get the index of the new track
      const trackIndex = orderedTrackIds.indexOf(clip?.trackId);
      if (!clip || trackIndex === -1) return;

      // Get the new track
      const newIndex = trackIndex + rowOffset;
      const newTrackId = orderedTrackIds[newIndex];
      const newTrack = selectTrackById(state, newTrackId);
      if (!newTrack?.id || newTrack.type !== "patternTrack") return;

      // Compute the new clip
      newClips.push({
        ...clip,
        trackId: newTrack.id,
        tick: clip.tick + tickOffset,
      });
    }

    // Iterate over the selected transpositions
    for (const transposition of selectedTranspositions) {
      if (!transposition) return;

      // Get the index of the new track
      const trackIndex = orderedTrackIds.indexOf(transposition.trackId);
      if (trackIndex === -1) return;

      // Get the new track
      const newIndex = trackIndex + rowOffset;
      const newTrackId = orderedTrackIds[newIndex];

      // Compute the new transposition
      newTranspositions.push({
        ...transposition,
        trackId: newTrackId,
        tick: transposition.tick + tickOffset,
      });
    }

    // Make sure the entire operation is valid
    if (newClips.some(({ tick }) => tick < 0)) return;
    if (newTranspositions.some(({ tick }) => tick < 0)) return;

    // If not copying, update the media
    if (!copying) {
      dispatch(updateMedia(newClips, newTranspositions));
      return;
    }

    // Otherwise, create the new media
    dispatch(createMedia(newClips, newTranspositions)).then(
      ({ clipIds, transpositionIds }) => {
        if (clipIds.length) dispatch(setSelectedClips(clipIds));
        if (transpositionIds.length)
          dispatch(setSelectedTranspositions(transpositionIds));
      }
    );
  };

/**
 * The handler for when a transposition is dragged.
 * @param item
 * @param monitor
 * @returns
 */
export const onTranspositionDragEnd =
  (item: any, monitor: any): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const orderedTrackIds = selectOrderedTrackIds(state);
    const { subdivision } = selectTimeline(state);
    const selectedClips = selectSelectedClips(state);
    const selectedTranspositions = selectSelectedTranspositions(state);

    // Find the corresponding transposition
    const transposition = item.transposition;

    // Compute the offset of the drag
    const rowIndex = orderedTrackIds.indexOf(transposition.trackId);
    if (rowIndex === -1) return;
    const rowOffset = item.hoveringRow - rowIndex;
    const columns = ticksToColumns(transposition.tick, subdivision);
    const colOffset = item.hoveringColumn - columns - 1;
    const tickOffset = colOffset * subdivisionToTicks(subdivision);

    // Get the drop result
    const dropResult = monitor.getDropResult();
    const copying = dropResult?.dropEffect === "copy";

    // Compute the new array of clips
    let newClips: Clip[] = [];
    let newTranspositions: Transposition[] = [];

    // Iterate over the selected clips
    for (const clip of selectedClips) {
      // Get the index of the new track
      const trackIndex = orderedTrackIds.indexOf(clip?.trackId);
      if (!clip || trackIndex === -1) return;

      // Get the new track
      const newIndex = trackIndex + rowOffset;
      const newTrackId = orderedTrackIds[newIndex];
      const newTrack = selectTrackById(state, newTrackId);
      if (!newTrack?.id || newTrack.type !== "patternTrack") return;

      // Compute the new clip
      newClips.push({
        ...clip,
        trackId: newTrack.id,
        tick: clip.tick + tickOffset,
      });
    }

    // Iterate over the selected transpositions
    const selectedItems = selectedTranspositions.includes(transposition)
      ? selectedTranspositions
      : [transposition];

    for (const transposition of selectedItems) {
      // Get the index of the new track
      const trackIndex = orderedTrackIds.indexOf(transposition?.trackId);
      if (!transposition || trackIndex === -1) return;

      // Get the new track
      const newIndex = trackIndex + rowOffset;
      const trackId = orderedTrackIds[newIndex];
      if (!trackId) return;

      // Compute the new transposition
      newTranspositions.push({
        ...transposition,
        trackId,
        tick: transposition.tick + tickOffset,
      });
    }

    // Make sure the entire operation is valid
    if (newClips.some(({ tick }) => tick < 0)) return;
    if (newTranspositions.some(({ tick }) => tick < 0)) return;

    // If not copying, update the media
    if (!copying) {
      dispatch(updateMedia(newClips, newTranspositions));
      return;
    }

    // Otherwise, create the new media
    dispatch(createMedia(newClips, newTranspositions));
  };

/**
 * Add a transposition to the timeline at the current tick
 * using the transposition offsets and duration from the toolkit.
 */
export const addTranspositionToTimeline =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const { toolkit, selectedTrackId } = selectRoot(state);
    const { transpositionOffsets, transpositionDuration } = toolkit;
    if (!selectedTrackId) return;
    const transposition = {
      trackId: selectedTrackId,
      offsets: transpositionOffsets,
      duration: transpositionDuration || undefined,
      tick: Transport.ticks,
    };
    dispatch(createTranspositions([transposition]));
  };

/**
 * Add a `Clip` of the currently selected pattern to the timeline at the current tick.
 */
export const addPatternToTimeline = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const pattern = selectSelectedPattern(state);
  const track = selectSelectedTrack(state);
  if (!isPattern(pattern) || !isPatternTrack(track)) return;
  const clip = {
    patternId: pattern.id,
    trackId: track.id,
    tick: Transport.ticks,
  };
  dispatch(createClips([clip]));
};
