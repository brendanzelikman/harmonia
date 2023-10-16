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
  mod,
} from "utils";
import {
  selectCellWidth,
  selectDraftedClip,
  selectDraftedTransposition,
  selectSelectedClipIds,
  selectSelectedClips,
  selectSelectedTrackId,
  selectSelectedTranspositionIds,
  selectSelectedTranspositions,
  selectTickFromColumn,
  selectTimeline,
} from "./TimelineSelectors";
import { MouseEvent } from "react";
import {
  updateClips,
  selectClipDurations,
  selectClipsByTrackIds,
  createClips,
  exportClipsToMidi,
} from "redux/Clip";
import { Transposition } from "types/Transposition";
import { seekTransport } from "redux/Transport";
import { selectOrderedTrackIds, selectTrackById } from "redux/Track";
import { union, without } from "lodash";
import { isPatternTrack } from "types/PatternTrack";
import { updateMedia, createMedia, sliceMedia } from "redux/thunks";
import { TrackId } from "types/Track";
import { Transport } from "tone";
import { TRACK_WIDTH } from "utils/constants";
import {
  isAddingClips,
  isAddingTranspositions,
  isMergingMedia,
  isSlicingMedia,
} from "types/Timeline";
import {
  setSelectedTrackId,
  setTimelineState,
  updateMediaDraft,
  updateMediaSelection,
} from "./TimelineSlice";
import { selectEditor } from "redux/selectors";
import { hideEditor } from "redux/Editor";

/**
 * Toggles the timeline between adding clips and not adding clips.
 */
export const toggleAddingClips = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const editor = selectEditor(state);
  const timeline = selectTimeline(state);
  if (isAddingClips(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("addingClips"));
    if (editor.show) dispatch(hideEditor());
  }
};

/**
 * Toggles the timeline between adding transpositions and not adding transpositions.
 */
export const toggleAddingTranspositions =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const editor = selectEditor(state);
    const timeline = selectTimeline(state);
    if (isAddingTranspositions(timeline)) {
      dispatch(setTimelineState("idle"));
    } else {
      dispatch(setTimelineState("addingTranspositions"));
      if (editor.show) dispatch(hideEditor());
    }
  };

/**
 * Toggles the timeline between slicing media and not slicing media.
 */
export const toggleSlicingMedia = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const editor = selectEditor(state);
  const timeline = selectTimeline(state);
  if (isSlicingMedia(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("slicingMedia"));
    if (editor.show) dispatch(hideEditor());
  }
};

/**
 * Toggles the timeline between merging media and not merging media.
 */
export const toggleMergingMedia = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const editor = selectEditor(state);
  const timeline = selectTimeline(state);
  if (isMergingMedia(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("mergingMedia"));
    if (editor.show) dispatch(hideEditor());
  }
};

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
      dispatch(updateMediaSelection({ clipIds: [], transpositionIds: [] }));
      return;
    }
    const timeline = selectTimeline(state);
    const { mediaDraft } = timeline;

    const track = selectTrackById(state, trackId);
    const onPatternTrack = !!track && isPatternTrack(track);

    // Try to create a clip if adding clips
    if (isAddingClips(timeline)) {
      if (!onPatternTrack) return;

      // Get the pattern ID from the draft
      const { patternId } = mediaDraft.clip;
      if (!patternId) return;

      // Create the clip
      const clip = { ...mediaDraft.clip, patternId, trackId, tick };
      dispatch(createClips([clip]));
      return;
    }

    // Create a transposition if adding transpositions
    if (isAddingTranspositions(timeline)) {
      // Create the transposition
      const transposition = { ...mediaDraft.transposition, trackId, tick };
      dispatch(createTranspositions([transposition]));
      return;
    }

    // Otherwise, seek the transport to the time
    dispatch(seekTransport(tick));

    // Select the track if there is one
    if (trackId) dispatch(setSelectedTrackId(trackId));

    // Deselect all media
    dispatch(updateMediaSelection({ clipIds: [], transpositionIds: [] }));
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
  (e: MouseEvent<HTMLDivElement>, clip?: Clip, eyedropping = false): AppThunk =>
  (dispatch, getState) => {
    if (!clip) return;
    const state = getState();
    const timeline = selectTimeline(state);
    const { mediaSelection, mediaDraft } = timeline;
    const selectedClipIds = selectSelectedClipIds(state);
    const patternId = mediaDraft.clip.patternId;

    // Eyedrop the pattern if the user is eyedropping
    if (eyedropping) {
      dispatch(updateMediaDraft({ clip: { patternId } }));
      return;
    }

    // Change the pattern if the user is adding clips
    if (isAddingClips(timeline) && patternId) {
      dispatch(updateClips({ clips: [{ ...clip, patternId }] }));
      return;
    }

    // Deselect the clip if it is selected
    const isClipSelected = mediaSelection.clipIds.includes(clip.id);
    if (isClipSelected) {
      dispatch(
        updateMediaSelection({ clipIds: without(selectedClipIds, clip.id) })
      );
      return;
    }

    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);

    // Select the clip if the user is not holding shift
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        dispatch(
          updateMediaSelection({ clipIds: union(selectedClipIds, [clip.id]) })
        );
      } else {
        dispatch(updateMediaSelection({ clipIds: [clip.id] }));
      }
      return;
    }

    // Just select the clip if there are no other selected clips
    if (!mediaSelection.clipIds) {
      dispatch(updateMediaSelection({ clipIds: [clip.id] }));
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
    dispatch(updateMediaSelection({ clipIds: rangeClipIds }));
  };

/**
 * The handler for when a transposition is clicked.
 * @param e The mouse event.
 * @param transposition The transposition that was clicked.
 */

export const onTranspositionClick =
  (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    transposition?: Transposition
  ): AppThunk =>
  (dispatch, getState) => {
    if (!transposition) return;
    const state = getState();
    const timeline = selectTimeline(state);
    const cellWidth = selectCellWidth(state);
    const selectedTranspositionIds = selectSelectedTranspositionIds(state);
    const selectedTranspositions = selectSelectedTranspositions(state);
    const nativeEvent = e.nativeEvent as Event;

    // Slice the transposition if slicing
    if (isSlicingMedia(timeline)) {
      const grid = e.currentTarget.offsetParent;
      if (!grid) return;
      const subdivisionTick = ticksToColumns(1, timeline.subdivision);
      const tickWidth = cellWidth * subdivisionTick;
      const cursorLeft = e.clientX - TRACK_WIDTH;
      const tick = Math.round(cursorLeft / tickWidth);
      dispatch(sliceMedia(transposition, tick));
      return;
    }

    // Deselect the transposition if it is selected
    const isSelected = selectedTranspositions.some(
      (t) => t.id === transposition.id
    );
    if (isSelected) {
      dispatch(
        updateMediaSelection({
          transpositionIds: without(selectedTranspositionIds, transposition.id),
        })
      );
      return;
    }

    // Select the transposition if the user is not holding shift
    const holdingShift = isHoldingShift(nativeEvent);
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        dispatch(
          updateMediaSelection({
            transpositionIds: union(selectedTranspositionIds, [
              transposition.id,
            ]),
          })
        );
      } else {
        dispatch(
          updateMediaSelection({ transpositionIds: [transposition.id] })
        );
      }
      return;
    }

    // Just select the transposition if there are no other selected transpositions
    if (selectedTranspositions.length === 0) {
      dispatch(updateMediaSelection({ transpositionIds: [transposition.id] }));
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
    dispatch(updateMediaSelection({ transpositionIds: rangeTranspositionIds }));
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

    const payload = { clips: newClips, transpositions: newTranspositions };

    // If not copying, update the media
    if (!copying) {
      dispatch(updateMedia(payload));
      return;
    }

    // Otherwise, create the new media
    dispatch(createMedia(payload)).then((ids) =>
      dispatch(updateMediaSelection(ids))
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

    const payload = { clips: newClips, transpositions: newTranspositions };

    // If not copying, update the media
    if (!copying) {
      dispatch(updateMedia(payload));
      return;
    }

    // Otherwise, create the new media
    dispatch(createMedia(payload)).then((ids) =>
      dispatch(updateMediaSelection(ids))
    );
  };

/**
 * Add a clip to the currently selected track
 * using any properties from the drafted clip.
 */
export const addClipToTimeline = (): AppThunk => (dispatch, getState) => {
  const state = getState();

  // Get the selected track ID
  const selectedTrackId = selectSelectedTrackId(state);
  if (!selectedTrackId) return;

  // Get the drafted clip
  const draftedClip = selectDraftedClip(state);
  const clip = {
    ...draftedClip,
    tick: Transport.ticks,
  };

  // Create the clip
  dispatch(createClips([clip]));
};

/**
 * Add a transposition to the currently selected track
 * using any properties from the drafted transposition.
 */
export const addTranspositionToTimeline =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();

    // Get the selected track ID
    const selectedTrackId = selectSelectedTrackId(state);
    if (!selectedTrackId) return;

    // Get the drafted transposition
    const draftedTransposition = selectDraftedTransposition(state);
    const transposition = {
      ...draftedTransposition,
      tick: Transport.ticks,
    };

    // Create the transposition
    dispatch(createTranspositions([transposition]));
  };

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
