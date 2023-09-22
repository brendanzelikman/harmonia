import { Row } from "features/timeline";
import {
  deleteClipsAndTranspositions,
  createClipsAndTranspositions,
} from "redux/slices/clips";
import { setSelectedClips, setSelectedTranspositions } from "redux/slices/root";
import { setClipboard } from "redux/slices/timeline";
import { AppThunk } from "redux/store";
import { ClipId, Clip } from "types";
import { TranspositionId, Transposition } from "types/transposition";
import { subdivisionToTicks } from "utils";
import { exportClipsToMidi } from "./clips";
import {
  selectClipIds,
  selectTranspositionIds,
  selectRoot,
  selectSelectedClips,
  selectSelectedTranspositions,
  selectTimeline,
  selectTransport,
  selectClipDuration,
} from "redux/selectors";

// Select all clips and transpositions
export const selectAllClipsAndTranspositions =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const clipIds = selectClipIds(state);
    const transpositionIds = selectTranspositionIds(state);
    if (clipIds) dispatch(setSelectedClips(clipIds));
    if (transpositionIds) dispatch(setSelectedTranspositions(transpositionIds));
  };

// Delete all selected clips and transpositions
export const deleteSelectedClipsAndTranspositions =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const { selectedClipIds, selectedTranspositionIds } = selectRoot(state);
    const selectedClips = selectSelectedClips(state);
    const selectedTranspositions = selectSelectedTranspositions(state);
    dispatch(
      deleteClipsAndTranspositions(selectedClips, selectedTranspositions)
    );
  };

export const copySelectedClipsAndTranspositions =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const clips = selectSelectedClips(state);
    const transpositions = selectSelectedTranspositions(state);
    dispatch(setClipboard({ clips, transpositions }));
  };

export const cutSelectedClipsAndTranspositions =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const clips = selectSelectedClips(state);
    const transpositions = selectSelectedTranspositions(state);
    dispatch(setClipboard({ clips, transpositions }));
    dispatch(deleteClipsAndTranspositions(clips, transpositions));
  };

export const pasteSelectedClipsAndTranspositions =
  (
    rows: Row[]
  ): AppThunk<
    Promise<{ clipIds: ClipId[]; transpositionIds: TranspositionId[] }>
  > =>
  (dispatch, getState) => {
    const emptyPromise = Promise.resolve({ clipIds: [], transpositionIds: [] });

    if (!rows?.length) return emptyPromise;

    const state = getState();
    const { clipboard } = selectTimeline(state);
    const { selectedTrackId } = selectRoot(state);
    if (!selectedTrackId) return emptyPromise;

    const { tick } = selectTransport(state);
    const trackIds = rows.map((row) => row.trackId).filter(Boolean);

    // Get clips and transpositions from the clipboard
    const clipboardClips = [...clipboard?.clips] ?? [];
    const clipboardTranspositions = [...clipboard?.transpositions] ?? [];

    // Get the earliest start tick
    const firstClip = clipboardClips.length
      ? clipboardClips.sort((a, b) => a.tick - b.tick)?.[0]
      : undefined;
    const firstTransposition = clipboardTranspositions.length
      ? clipboardTranspositions.sort((a, b) => a.tick - b.tick)?.[0]
      : undefined;

    const t1 = firstClip?.tick;
    const t2 = firstTransposition?.tick;
    const startTick = t1 && t2 ? Math.min(t1, t2) : t1 ?? t2;

    if (!firstClip && !firstTransposition) return emptyPromise;
    if (startTick === undefined) return emptyPromise;

    // Compute the offset between the clipboard and the current tick
    const offset = tick - startTick;

    // Find the original track index of the first clip or transposition
    const originalIndex =
      rows
        .filter((r) =>
          [...clipboardClips, ...clipboardTranspositions].some(
            (c) => c.trackId === r.trackId
          )
        )
        .sort((a, b) => a.index - b.index)?.[0]?.index ?? -1;
    if (originalIndex === -1) return emptyPromise;

    // Find the selected track index
    const selectedIndex = trackIds.indexOf(selectedTrackId);
    if (selectedIndex === -1) return emptyPromise;

    // Compute the offset between the selected track and the original track
    const rowOffset = selectedIndex - originalIndex;

    let newClips: Clip[] = [];
    let newTranspositions: Transposition[] = [];

    // Create new clips
    for (const clip of clipboardClips) {
      // Find the new track index
      const thisIndex = trackIds.indexOf(clip.trackId);
      if (thisIndex === -1) return emptyPromise;

      // Find the new track
      const newIndex = thisIndex + rowOffset;
      const newTrack = rows[newIndex];
      if (!newTrack || newTrack.type !== "patternTrack") return emptyPromise;

      // Create a new clip with the new track id and time
      const trackId = newTrack.trackId;
      if (!trackId) return emptyPromise;
      newClips.push({
        ...clip,
        tick: clip.tick + offset,
        trackId,
      });
    }

    // Create new transpositions
    for (const transposition of clipboardTranspositions) {
      // Find the new track index
      const thisIndex = trackIds.indexOf(transposition.trackId);
      if (thisIndex === -1) return emptyPromise;

      // Find the new track
      const newIndex = thisIndex + rowOffset;
      const newTrack = rows[newIndex];

      // Create a new transposition with the new track id and time
      const trackId = newTrack.trackId;
      if (!trackId) return emptyPromise;
      newTranspositions.push({
        ...transposition,
        tick: transposition.tick + offset,
        trackId,
      });
    }

    // Create the clips and transpositions
    return dispatch(createClipsAndTranspositions(newClips, newTranspositions));
  };

export const duplicateSelectedClipsAndTranspositions =
  (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const { selectedClipIds, selectedTranspositionIds } = selectRoot(state);
    if (!selectedClipIds.length && !selectedTranspositionIds.length) return;
    const selectedClips = selectSelectedClips(state);
    const selectedTranspositions = selectSelectedTranspositions(state);
    const selectedClipTicks = selectedClips.map((clip) =>
      selectClipDuration(state, clip.id)
    );
    const timeline = selectTimeline(state);
    const gridTicks = subdivisionToTicks(timeline.subdivision);
    // Get the start time of the earliest clip or transposition
    const startTick = Math.min(
      ...selectedClips.map((clip) => clip.tick),
      ...selectedTranspositions.map((transposition) => transposition.tick)
    );
    // Get the end time of the latest clip or transposition
    const endTick = Math.max(
      ...selectedClips.map((clip, i) => clip.tick + selectedClipTicks[i]),
      ...selectedTranspositions.map(
        (transposition) => transposition.tick + gridTicks
      )
    );
    // Calculate the offset between the start and end times
    const offset = endTick - startTick;

    // Create new clips and transpositions with the new times
    const newClips = selectedClips.map((clip) => ({
      ...clip,
      tick: clip.tick + offset,
    }));
    const newTranspositions = selectedTranspositions.map((transposition) => ({
      ...transposition,
      tick: transposition.tick + offset,
    }));
    const { clipIds, transpositionIds } = await dispatch(
      createClipsAndTranspositions(newClips, newTranspositions)
    );

    // Select the new clips and transpositions
    if (clipIds) dispatch(setSelectedClips(clipIds));
    if (transpositionIds) dispatch(setSelectedTranspositions(transpositionIds));

    return { clipIds, transpositionIds };
  };

export const exportSelectedClipsToMidi =
  (options = { name: "" }): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { selectedClipIds } = selectRoot(state);
    return dispatch(exportClipsToMidi(selectedClipIds, options));
  };
