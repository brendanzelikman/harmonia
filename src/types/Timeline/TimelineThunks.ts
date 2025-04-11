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
  selectTrackIds,
} from "types/Track/TrackSelectors";
import {
  selectTimelineType,
  selectIsAddingClips,
  selectSelectedTrackId,
  selectCellWidth,
  selectSelectedPatternClips,
  selectIsTrackSelected,
  selectTimelineState,
  selectCurrentTimelineTick,
} from "./TimelineSelectors";
import {
  createUndoType,
  Payload,
  unpackData,
  unpackUndoType,
} from "types/redux";
import { randomizePattern } from "types/Pattern/PatternThunks";
import { TimelineState } from "./TimelineTypes";
import { DEFAULT_CELL_WIDTH } from "utils/constants";
import {
  createCourtesyPatternClip,
  createNewPoseClip,
  createPatternTrack,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { createTreeFromString } from "lib/prompts/tree";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { walkPatternClip } from "types/Arrangement/ArrangementThunks";
import { TrackId } from "types/Track/TrackTypes";
import { nanoid } from "@reduxjs/toolkit";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { maxBy } from "lodash";
import {
  selectClipDuration,
  selectClips,
  selectPatternClips,
} from "types/Clip/ClipSelectors";
import { deleteMedia } from "types/Media/MediaThunks";
import { getTransport } from "tone";

export const toggleCellWidth = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const cellWidth = selectCellWidth(project);
  const onBase = cellWidth === DEFAULT_CELL_WIDTH;
  dispatch(setCellWidth(onBase ? DEFAULT_CELL_WIDTH * 2 : DEFAULT_CELL_WIDTH));
};

/* Toggles the selected track ID. If the track id is already selected, it will be set to null. */
export const toggleSelectedTrackId =
  (payload: Payload<TrackId>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const trackId = payload.data;
    const undoType = unpackUndoType(payload, "toggleSelectedTrackId");
    const selectedTrackId = selectSelectedTrackId(project);
    if (selectedTrackId === trackId) {
      dispatch(setSelectedTrackId({ data: null, undoType }));
    } else {
      dispatch(setSelectedTrackId({ data: trackId, undoType }));
    }
  };

/** Toggles the first track. */
export const toggleTrackByIndex =
  (i: number): Thunk =>
  (dispatch, getProject) => {
    dispatch(toggleSelectedTrackId({ data: selectTrackIds(getProject())[i] }));
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
    const oldState = selectTimelineState(project);

    // Clear the media draft if starting to portal clips
    if (incomingState === "portaling-clips") {
      dispatch(updateFragment({ data: {}, undoType }));
    }

    // Idle the user if the state matches
    if (oldState === incomingState) {
      dispatch(clearTimelineState({ undoType }));
      return;
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

export const DEFAULT_TRACK_PROMPT = `C => Cmaj => ${getInstrumentName(
  DEFAULT_INSTRUMENT_KEY
)}`;

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
        const tracks = dispatch(
          createTreeFromString({
            data: DEFAULT_TRACK_PROMPT,
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
  const selectedClips = selectPatternClips(getProject()).filter(
    (c) => c.trackId === trackId
  );
  const patternClip = maxBy(selectedClips, (clip) => clip.tick);

  // If no clip is selected, create a new clip and pose.
  if (!patternClip) {
    const timelineTick = selectCurrentTimelineTick(getProject());
    const transportTick = getTransport().ticks;
    const tick = timelineTick ?? transportTick;

    // Delete any patterns at the current tick in the track
    if (trackId) {
      const clips = selectClips(getProject());
      for (const clip of clips) {
        if (clip.trackId === trackId && clip.tick === tick) {
          dispatch(deleteMedia({ data: { clipIds: [clip.id] }, undoType }));
        }
      }
    }

    const { patternId } = dispatch(
      createCourtesyPatternClip({
        data: { clip: { trackId, tick } },
        undoType,
      })
    );
    dispatch(randomizePattern({ data: { id: patternId, trackId }, undoType }));
    dispatch(
      createNewPoseClip({
        data: { clip: { trackId, tick } },
        undoType,
      })
    );
    return;
  }

  // If a clip is selected, duplicate it and pose the copy
  const duration = selectClipDuration(project, patternClip.id);
  const tick = patternClip.tick + duration;
  const clips = selectClips(getProject());
  for (const clip of clips) {
    if (clip.trackId === trackId && clip.tick === tick) {
      dispatch(deleteMedia({ data: { clipIds: [clip.id] }, undoType }));
    }
  }

  const originalPattern = selectPatternById(project, patternClip.patternId);
  const { clipId } = dispatch(
    createCourtesyPatternClip({
      data: { pattern: originalPattern, clip: { trackId, tick } },
      undoType,
    })
  );
  dispatch(
    walkPatternClip({
      data: {
        id: `${clipId}-chunk-1`,
        options: { keys: trackIds, direction: "up" },
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

    // Idle the editor of editing
    const state = selectTimelineState(project);
    if (state === "editing-tracks" && isSelected) {
      dispatch(clearTimelineState({ undoType }));
    } else if (state === "editing-tracks") {
      dispatch(setSelectedTrackId({ data: id, undoType }));
    } else {
      dispatch(setTimelineState({ data: "editing-tracks", undoType }));
      dispatch(setSelectedTrackId({ data: id, undoType }));
    }
  };
