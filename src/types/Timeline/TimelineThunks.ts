import {
  setTimelineType,
  clearTimelineState,
  setCellWidth,
  setSelectedTrackId,
  setTimelineState,
  updateFragment,
} from "./TimelineSlice";
import { next } from "utils/array";
import { CLIP_TYPES } from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectPatternTrackIds,
  selectScaleTrackIds,
  selectTrackAncestorIds,
  selectTrackDescendantIds,
} from "types/Track/TrackSelectors";
import {
  selectTimelineType,
  selectTimeline,
  selectIsAddingClips,
  selectSelectedTrackId,
  selectCellWidth,
  selectSelectedPatternClips,
  selectIsTrackSelected,
} from "./TimelineSelectors";
import { createUndoType, Payload, unpackData, unpackUndoType } from "lib/redux";
import { randomizePattern } from "types/Pattern/PatternThunks";
import { DEFAULT_CELL_WIDTH, TimelineState } from "./TimelineTypes";
import {
  createCourtesyPatternClip,
  createCourtesyPoseClip,
  createPatternTrack,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { createTreeFromString } from "utils/tree";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { walkPatternClip } from "types/Arrangement/ArrangementThunks";
import { TrackId } from "types/Track/TrackTypes";
import { nanoid } from "@reduxjs/toolkit";
import { getTransport } from "tone";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { maxBy } from "lodash";
import { selectClipDuration } from "types/Clip/ClipSelectors";

export const toggleCellWidth = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const cellWidth = selectCellWidth(project);
  const onBase = cellWidth === DEFAULT_CELL_WIDTH;
  dispatch(setCellWidth(onBase ? DEFAULT_CELL_WIDTH * 2 : DEFAULT_CELL_WIDTH));
};

export const toggleTimelineTrackId =
  (payload: Payload<TrackId>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const trackId = payload.data;
    const undoType = unpackUndoType(payload, "toggleTimelineTrackId");
    const selectedTrackId = selectSelectedTrackId(project);
    if (selectedTrackId === trackId) {
      dispatch(setSelectedTrackId({ data: null, undoType }));
    } else {
      dispatch(setSelectedTrackId({ data: trackId, undoType }));
    }
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
    const timeline = selectTimeline(project);

    // Idle the user if the state matches
    if (timeline.state === incomingState) {
      dispatch(clearTimelineState({ undoType }));
      return;
    }

    // Clear the media draft if starting to portal clips
    if (incomingState === "portaling-clips") {
      dispatch(updateFragment({ data: { portal: {} }, undoType }));
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

    dispatch(setTimelineType({ data: type, undoType }));

    // Toggle the state if it is not already adding
    if (!isAdding || (isAdding && timelineType === type)) {
      dispatch(toggleTimelineState({ data: `adding-clips`, undoType }));
    }
  };

export const toggleLivePlay = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const patternTrackIds = selectPatternTrackIds(project);
  let trackId = selectSelectedTrackId(project);
  const undoType = createUndoType("toggleLivePlay", nanoid());
  const trackIds: TrackId[] = [];

  // If no track is selected, try to find one
  if (!trackId) {
    // If there is a pattern track, select the first one
    if (patternTrackIds.length) {
      trackId = patternTrackIds[0];
      trackIds.push(...selectTrackAncestorIds(project, trackId));
      trackIds.push(trackId);
    }

    // Otherwise, create new tracks
    else {
      const scaleTrackIds = selectScaleTrackIds(project);
      const hierarchy = selectTrackDescendantIds(project, scaleTrackIds[0]);

      // If there are scale tracks, add a pattern track as a child
      if (hierarchy.length) {
        trackId = dispatch(
          createPatternTrack({
            data: { track: { parentId: hierarchy.at(-1)! } },
            undoType,
          })
        ).track.id;
        trackIds.push(...hierarchy);
        trackIds.push(trackId);
      }

      // Otherwise, create a new track tree
      else {
        const pt = getInstrumentName(DEFAULT_INSTRUMENT_KEY);
        const tracks = dispatch(
          createTreeFromString({
            data: `C => Cmaj7 => Cmaj => ${pt}`,
            undoType,
          })
        );
        trackIds.push(...tracks.map((t) => t.id));
        trackId = tracks.at(-1)?.id;
        dispatch(setSelectedTrackId({ data: trackId, undoType }));
      }
    }
  } else {
    trackIds.push(...selectTrackAncestorIds(project, trackId));
    trackIds.push(trackId);
  }

  dispatch(setSelectedTrackId({ data: trackId, undoType }));

  // Create a pattern clip if there are none
  const selectedClips = selectSelectedPatternClips(getProject());
  const patternClip = maxBy(selectedClips, (clip) => clip.tick);

  // If no clip is selected, create a new clip and pose.
  if (!patternClip) {
    const tick = getTransport().ticks;
    const { patternId } = dispatch(
      createCourtesyPatternClip({
        data: { pattern: { trackId }, clip: { trackId, tick } },
        undoType,
      })
    );
    dispatch(randomizePattern({ data: { id: patternId }, undoType }));
    dispatch(
      createCourtesyPoseClip({
        data: { pose: { trackId }, clip: { trackId, tick } },
        undoType,
      })
    );
    return;
  }

  // If a clip is selected, duplicate it and pose the copy
  const duration = selectClipDuration(project, patternClip.id);
  const tick = patternClip.tick + duration;
  const originalPattern = selectPatternById(project, patternClip.patternId);
  const { patternId, clipId } = dispatch(
    createCourtesyPatternClip({
      data: { pattern: originalPattern, clip: { trackId, tick } },
      undoType,
    })
  );
  dispatch(randomizePattern({ data: { id: patternId }, undoType }));
  dispatch(
    createCourtesyPoseClip({
      data: { pose: { trackId }, clip: { trackId, tick } },
      undoType,
    })
  );
  dispatch(
    walkPatternClip({
      data: {
        id: `${clipId}-chunk-1`,
        options: { vectorKeys: trackIds, direction: "up" },
      },
      undoType,
    })
  );
};

/** Toggle the editor of a track. */
export const toggleTrackEditor =
  (payload: Payload<TrackId>): Thunk =>
  (dispatch, getProject) => {
    const id = unpackData(payload);
    const undoType = unpackUndoType(payload, "toggleTrackEditor");
    const project = getProject();
    const isSelected = selectIsTrackSelected(project, id);
    if (!isSelected) dispatch(setSelectedTrackId({ data: id, undoType }));
    dispatch(toggleTimelineState({ data: "editing-tracks", undoType }));
  };
