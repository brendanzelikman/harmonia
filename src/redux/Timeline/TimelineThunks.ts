import * as _ from "./TimelineSelectors";
import { Thunk } from "types/Project";
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
import { selectTrackById } from "redux/Track";
import { union, without } from "lodash";
import { isPatternTrack } from "types/PatternTrack";
import { updateMedia, createMedia, sliceMedia } from "redux/thunks";
import { TrackId } from "types/Track";
import { Transport } from "tone";
import { TRACK_WIDTH } from "utils/constants";
import {
  isTimelineAddingClips,
  isTimelineAddingTranspositions,
  isTimelineMergingMedia,
  isTimelineSlicingMedia,
} from "types/Timeline";
import {
  setSelectedTrackId,
  setTimelineState,
  updateMediaDraft,
  updateMediaSelection,
} from "./TimelineSlice";
import { selectEditor, selectOrderedTrackIds } from "redux/selectors";
import { hideEditor } from "redux/Editor";
import { getSubdivisionTicks, getTickColumns } from "utils/durations";
import { isHoldingShift, isHoldingOption } from "utils/html";
import { mod } from "utils/math";

/** Toggles the timeline between adding clips and not adding clips. */
export const toggleAddingClips = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineAddingClips(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("addingClips"));
    if (editor.view) dispatch(hideEditor());
  }
};

/** Toggles the timeline between adding transpositions and not adding transpositions. */
export const toggleAddingTranspositions =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();
    const editor = selectEditor(project);
    const timeline = _.selectTimeline(project);
    if (isTimelineAddingTranspositions(timeline)) {
      dispatch(setTimelineState("idle"));
    } else {
      dispatch(setTimelineState("addingTranspositions"));
      if (editor.view) dispatch(hideEditor());
    }
  };

/** Toggles the timeline between slicing media and not slicing media. */
export const toggleSlicingMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineSlicingMedia(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("slicingMedia"));
    if (editor.view) dispatch(hideEditor());
  }
};

/** Toggles the timeline between merging media and not merging media. */
export const toggleMergingMedia = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const editor = selectEditor(project);
  const timeline = _.selectTimeline(project);
  if (isTimelineMergingMedia(timeline)) {
    dispatch(setTimelineState("idle"));
  } else {
    dispatch(setTimelineState("mergingMedia"));
    if (editor.view) dispatch(hideEditor());
  }
};

/**
 * The handler for when a cell is clicked.
 * * If no track is selected, seek the transport to the time and deselect all media.
 * * If the user is adding clips to the timeline, create a clip.
 * * If the user is transposing, create a transposition.
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
      dispatch(updateMediaSelection({ clipIds: [], transpositionIds: [] }));
      return;
    }
    const timeline = _.selectTimeline(project);
    const { mediaDraft } = timeline;

    const track = selectTrackById(project, trackId);
    const onPatternTrack = !!track && isPatternTrack(track);

    // Try to create a clip if adding clips
    if (isTimelineAddingClips(timeline)) {
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
    if (isTimelineAddingTranspositions(timeline)) {
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
  (e: MouseEvent<HTMLDivElement>, clip?: Clip, eyedropping = false): Thunk =>
  (dispatch, getProject) => {
    if (!clip) return;
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const { mediaSelection, mediaDraft } = timeline;
    const selectedClipIds = _.selectSelectedClipIds(project);
    const patternId = mediaDraft.clip.patternId;

    // Eyedrop the pattern if the user is eyedropping
    if (eyedropping) {
      dispatch(updateMediaDraft({ clip: { patternId } }));
      return;
    }

    // Change the pattern if the user is adding clips
    if (isTimelineAddingClips(timeline) && patternId) {
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
    const mediaClips = getMediaClips(media);
    const mediaClipIds = mediaClips.map((clip) => clip.id);

    // Select the clips
    dispatch(updateMediaSelection({ clipIds: mediaClipIds }));
  };

/**
 * The handler for when a transposition is clicked.
 * * If the user is adding transpositions to the timeline, add the transposition
 * * If the user is holding Alt, the transposition will be added to the selection.
 * * If the user is holding Shift, a range of transpositions will be selected.
 * * Otherwise, the transposition will be selected.
 */

export const onTranspositionClick =
  (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    transposition?: Transposition
  ): Thunk =>
  (dispatch, getProject) => {
    if (!transposition) return;
    const project = getProject();
    const timeline = _.selectTimeline(project);
    const cellWidth = _.selectCellWidth(project);
    const selectedTranspositionIds = _.selectSelectedTranspositionIds(project);
    const selectedTranspositions = _.selectSelectedTranspositions(project);
    const nativeEvent = e.nativeEvent as Event;

    // Slice the transposition if slicing
    if (isTimelineSlicingMedia(timeline)) {
      const grid = e.currentTarget.offsetParent;
      if (!grid) return;
      const subdivisionTick = getTickColumns(1, timeline.subdivision);
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
    const orderedIds = selectOrderedTrackIds(project);
    const trackIds = getMediaTrackIds(
      selectedTranspositions,
      orderedIds,
      transposition.trackId
    );
    const poses = selectTranspositionsByTrackIds(project, trackIds);
    const poseDurations = poses.map((pose) => pose.duration ?? Infinity);

    // Get all transpositions that are in the tick range
    const media = getMediaInRange(poses, poseDurations, [startTick, endTick]);
    const mediaPoses = getMediaTranspositions(media);
    const mediaPoseIds = mediaPoses.map((_) => _.id);

    // Select the transpositions
    dispatch(updateMediaSelection({ transpositionIds: mediaPoseIds }));
  };

/** The handler for when a clip is dragged. */
export const onClipDragEnd =
  (item: any, monitor: any): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const orderedTrackIds = selectOrderedTrackIds(project);
    const { subdivision } = _.selectTimeline(project);
    const selectedClips = _.selectSelectedClips(project);
    const selectedTranspositions = _.selectSelectedTranspositions(project);

    // Find the corresponding clip
    const clip = item.clip;

    // Compute the offset of the drag
    const rowIndex = orderedTrackIds.indexOf(clip.trackId);
    if (rowIndex === -1) return;
    const rowOffset = item.hoveringRow - rowIndex;
    const clipCol = getTickColumns(clip.tick, subdivision);
    const colOffset = item.hoveringColumn - clipCol - 1;
    const tickOffset = colOffset * getSubdivisionTicks(subdivision);

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
      const newTrack = selectTrackById(project, newTrackId);
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
    const mediaIds = dispatch(createMedia(payload));

    dispatch(updateMediaSelection(mediaIds));
  };

/** The handler for when a transposition is dragged. */
export const onTranspositionDragEnd =
  (item: any, monitor: any): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const orderedTrackIds = selectOrderedTrackIds(project);
    const { subdivision } = _.selectTimeline(project);
    const selectedClips = _.selectSelectedClips(project);
    const selectedTranspositions = _.selectSelectedTranspositions(project);

    // Find the corresponding transposition
    const transposition = item.transposition;

    // Compute the offset of the drag
    const rowIndex = orderedTrackIds.indexOf(transposition.trackId);
    if (rowIndex === -1) return;
    const rowOffset = item.hoveringRow - rowIndex;
    const columns = getTickColumns(transposition.tick, subdivision);
    const colOffset = item.hoveringColumn - columns - 1;
    const tickOffset = colOffset * getSubdivisionTicks(subdivision);

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
      const newTrack = selectTrackById(project, newTrackId);
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
    const mediaIds = dispatch(createMedia(payload));
    dispatch(updateMediaSelection(mediaIds));
  };

/** Add a clip to the currently selected track using the media draft. */
export const addClipToTimeline = (): Thunk => (dispatch, getProject) => {
  const project = getProject();

  // Get the selected track ID
  const selectedTrackId = _.selectSelectedTrackId(project);
  if (!selectedTrackId) return;

  // Get the drafted clip
  const draftedClip = _.selectDraftedClip(project);
  const clip = {
    ...draftedClip,
    tick: Transport.ticks,
  };

  // Create the clip
  dispatch(createClips([clip]));
};

/** Add a transposition to the currently selected track using the media draft. */
export const addTranspositionToTimeline =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();

    // Get the selected track ID
    const selectedTrackId = _.selectSelectedTrackId(project);
    if (!selectedTrackId) return;

    // Get the drafted transposition
    const draftedTransposition = _.selectDraftedTransposition(project);
    const transposition = {
      ...draftedTransposition,
      tick: Transport.ticks,
    };

    // Create the transposition
    dispatch(createTranspositions([transposition]));
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
  dispatch(setSelectedTrackId(previousTrackId));
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
  dispatch(setSelectedTrackId(nextTrackId));
};

/** Export all selected clips to a MIDI file. */
export const exportSelectedClipsToMIDI =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();
    const selectedClipIds = _.selectSelectedClipIds(project);
    dispatch(exportClipsToMidi(selectedClipIds));
  };
