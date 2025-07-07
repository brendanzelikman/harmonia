import {
  setTimelineType,
  clearTimelineState,
  setCellWidth,
  setSelectedTrackId,
  setTimelineState,
  updateFragment,
} from "./TimelineSlice";
import { next } from "utils/array";
import { Clip, CLIP_TYPES } from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { Project, sanitizeProject, Thunk } from "types/Project/ProjectTypes";
import {
  selectHasTracks,
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
  createNewPatternClip,
  createNewPoseClip,
  createPatternTrack,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { createTreeFromString } from "lib/prompts/tree";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { TrackId } from "types/Track/TrackTypes";
import { nanoid } from "@reduxjs/toolkit";
import { maxBy } from "lodash";
import {
  selectClipDuration,
  selectClips,
  selectPatternClips,
} from "types/Clip/ClipSelectors";
import { deleteMedia } from "types/Media/MediaThunks";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import { promptUserForProjects } from "types/Project/ProjectLoaders";
import { PatternMidiNote, PatternStream } from "types/Pattern/PatternTypes";
import {
  selectLastArrangementTick,
  selectMidiChordsByTicks,
} from "types/Arrangement/ArrangementSelectors";
import { selectTransportTimeSignature } from "types/Transport/TransportSelectors";
import { QuarterNoteTicks } from "utils/duration";
import { getPatternBlockWithNewNotes } from "types/Pattern/PatternUtils";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { autoBindNoteToTrack } from "types/Track/TrackUtils";
import { updatePattern } from "types/Pattern/PatternSlice";
import { createTrackPair } from "types/Track/TrackThunks";

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
    const hasTracks = selectHasTracks(project);
    if (!hasTracks) return;

    dispatch(setTimelineType({ data: type, undoType }));

    // Toggle the state if it is not already adding
    if (!isAdding || (isAdding && timelineType === type)) {
      dispatch(toggleTimelineState({ data: `adding-clips`, undoType }));
    }
  };

export const DEFAULT_TRACK_PROMPT = `C => C pentatonic => Cmaj => ${getInstrumentName(
  DEFAULT_INSTRUMENT_KEY
)}`;

export const growTree = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const patternTrackIds = selectPatternTrackIds(project);
  let trackId = selectSelectedTrackId(project);
  const undoType = createUndoType("toggleLivePlay", nanoid());
  const trackIds: TrackId[] = [];

  // If no track is selected, try to find one
  if (!isPatternTrackId(trackId)) {
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
    const tick = 0;

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
      createNewPatternClip({
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
  if (!trackId) return;
  dispatch(createTrackPair({ data: trackId, undoType }));
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

export const sampleProject = (): Thunk => async (dispatch, getProject) => {
  const project = getProject();
  const undoType = createUndoType("sampleProject", nanoid());
  const trackId = selectSelectedTrackId(project);
  const tick = selectCurrentTimelineTick(project);
  promptUserForProjects((file) => {
    dispatch(
      sampleProjectByFile({
        data: { file, props: { tick, trackId } },
        undoType,
      })
    );
  });
};

export const sampleProjectByFile =
  (payload: Payload<{ file: File; props?: Partial<Clip> }>): Thunk =>
  (dispatch, getProject) => {
    const { file, props } = unpackData(payload);
    const undoType = unpackUndoType(payload, "sampleProjectByFile");
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result) return;

      const present = JSON.parse(e.target.result as string);
      const project = sanitizeProject({ present });
      const projectId = selectProjectId(project);
      const stream = convertProjectToNotes(project);

      let trackId = props?.trackId;
      if (!trackId) {
        trackId = dispatch(createPatternTrack({ data: {}, undoType })).track.id;
      }
      const tick = props?.tick ?? selectCurrentTimelineTick(getProject());
      const pattern = { name: file.name, stream, projectId };
      const clip = { trackId, tick };
      const { patternId } = dispatch(
        createNewPatternClip({ data: { pattern, clip }, undoType })
      );

      // Autobind the pattern
      const boundStream = stream.map((b) =>
        getPatternBlockWithNewNotes(b, (n) =>
          n.map((n) => dispatch(autoBindNoteToTrack(trackId, n)))
        )
      );
      dispatch(
        updatePattern({
          data: { id: patternId, stream: boundStream },
          undoType,
        })
      );
    };
    reader.readAsText(file);
  };

export const convertProjectToNotes = (project: Project) => {
  const timeSignature = selectTransportTimeSignature(project);
  let startBar = 0;
  let endBar = 0;
  if (startBar > endBar) return [];
  const startTick = startBar * QuarterNoteTicks * timeSignature;
  let endTick = endBar * QuarterNoteTicks * timeSignature;
  if (endTick === 0) endTick = selectLastArrangementTick(project);

  const chordsByTicks = selectMidiChordsByTicks(project);
  const stream: PatternStream = [];

  // Create the stream
  let ticksSinceRest = 0;
  for (let i = startTick; i < endTick; i++) {
    const chordMap = chordsByTicks[i];
    const block: PatternMidiNote[] = [];
    let minDuration = Infinity;
    for (const instrumentId in chordMap) {
      const chords = chordMap[instrumentId];
      if (!chords.length) continue;
      for (const note of chords) {
        if (note.duration) {
          minDuration = Math.min(minDuration, note.duration);
        }
      }
      block.push(...chords);
    }
    if (!block?.length) {
      ticksSinceRest++;
      continue;
    } else {
      const last = stream[stream.length - 1];
      if (last) {
        stream[stream.length - 1] = getPatternBlockWithNewNotes(last, (notes) =>
          notes.map((n) => ({
            ...n,
            duration: n.duration + ticksSinceRest + 1,
          }))
        );
      }
    }
    if (ticksSinceRest > 0) stream.push({ duration: ticksSinceRest });
    stream.push(block.map((n) => ({ ...n, duration: minDuration })));
    ticksSinceRest = -minDuration;
  }
  return stream;
};
