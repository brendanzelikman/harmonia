import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "redux/store";
import {
  Clip,
  ClipId,
  ClipNoId,
  defaultClip,
  getClipDuration,
  getClipNotes,
  getClipStream,
  initializeClip,
} from "types/clips";
import * as Selectors from "redux/selectors";
import { TrackId } from "types/tracks";
import {
  initializePattern,
  Pattern,
  PatternId,
  PatternStream,
} from "types/patterns";
import { Time } from "types/units";
import { initializeState } from "redux/util";
import {
  addClipsToClipMap,
  addClipToClipMap,
  cutClipFromClipMap,
  removeClipFromClipMap,
  removeClipsFromClipMap,
} from "./maps/clipMap";
import { deselectClip, setActivePattern, toggleRepeatingClips } from "./root";
import { selectClipStream } from "redux/selectors";
import { addPattern } from "./patterns";
import { inRange, union } from "lodash";
import { Transform, TransformNoId } from "types/transform";
import { createTransforms, deleteTransforms } from "./transforms";

const initialState = initializeState<ClipId, Clip>();

type CutClipArgs = {
  oldClip: Clip;
  firstClip: Clip;
  secondClip: Clip;
};

export const clipsSlice = createSlice({
  name: "clips",
  initialState,
  reducers: {
    addClip: (state, action: PayloadAction<Clip>) => {
      const clip = action.payload;
      state.allIds.push(clip.id);
      state.byId[clip.id] = clip;
    },
    addClips: (state, action: PayloadAction<Clip[]>) => {
      const clips = action.payload;
      clips.forEach((clip) => {
        state.allIds.push(clip.id);
        state.byId[clip.id] = clip;
      });
    },
    removeClip: (state, action: PayloadAction<ClipId>) => {
      const clipId = action.payload;
      delete state.byId[clipId];

      const index = state.allIds.findIndex((id) => id === clipId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    removeClips: (state, action: PayloadAction<ClipId[]>) => {
      const clipIds = action.payload;
      clipIds.forEach((clipId) => {
        delete state.byId[clipId];
        const index = state.allIds.findIndex((id) => id === clipId);
        if (index === -1) return;
        state.allIds.splice(index, 1);
      });
    },
    updateClip: (state, action: PayloadAction<Partial<Clip>>) => {
      const { id, ...rest } = action.payload;
      if (!id) return;
      if (!state.byId[id]) return;
      state.byId[id] = {
        ...state.byId[id],
        ...rest,
      };
    },
    updateClips: (state, action: PayloadAction<Partial<Clip>[]>) => {
      const clips = action.payload;
      clips.forEach((clip) => {
        const { id, ...rest } = clip;
        if (!id) return;
        state.byId[id] = {
          ...state.byId[id],
          ...rest,
        };
      });
    },
    cutClip: (state, action: PayloadAction<CutClipArgs>) => {
      const { oldClip, firstClip, secondClip } = action.payload;
      delete state.byId[oldClip.id];

      //  Remove the old clip
      const index = state.allIds.findIndex((id) => id === oldClip.id);
      if (index === -1) return;
      state.allIds.splice(index, 1);
      //  Add the new clips
      state.allIds.push(firstClip.id);
      state.allIds.push(secondClip.id);
      state.byId[firstClip.id] = firstClip;
      state.byId[secondClip.id] = secondClip;
    },
    removeClipsByPatternTrackId: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
      const clips = Object.values(state.byId).filter(
        (clip) => clip.trackId === trackId
      );
      clips.forEach((clip) => {
        delete state.byId[clip.id];
        const index = state.allIds.findIndex((id) => id === clip.id);
        if (index === -1) return;
        state.allIds.splice(index, 1);
      });
    },
    clearClipsByPatternTrackId: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
      const clips = Object.values(state.byId).filter(
        (clip) => clip.trackId === trackId
      );
      clips.forEach((clip) => {
        delete state.byId[clip.id];
        const index = state.allIds.findIndex((id) => id === clip.id);
        if (index === -1) return;
        state.allIds.splice(index, 1);
      });
    },
  },
});

export const {
  addClip,
  addClips,
  removeClip,
  removeClips,
  updateClip,
  updateClips,
  removeClipsByPatternTrackId,
  clearClipsByPatternTrackId,
} = clipsSlice.actions;
export const _cutClip = clipsSlice.actions.cutClip;

export const createClip =
  (clip: Partial<ClipNoId> = defaultClip): AppThunk<Promise<ClipId>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      const newClip = initializeClip({
        ...defaultClip,
        ...clip,
      });
      // Add clip to store
      dispatch(addClip(newClip));
      dispatch(
        addClipToClipMap({ trackId: newClip.trackId, clipId: newClip.id })
      );
      resolve(newClip.id);
    });
  };

export const createClips =
  (clips: Partial<ClipNoId>[]): AppThunk<Promise<ClipId>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      const initializedClips = clips.map((clip) =>
        initializeClip({ ...defaultClip, ...clip })
      );
      dispatch(addClips(initializedClips));
      const clipMapPayload = initializedClips.map((clip) => ({
        trackId: clip.trackId,
        clipId: clip.id,
      }));
      dispatch(addClipsToClipMap(clipMapPayload));

      const clipIds = initializedClips.map((clip) => clip.id);
      const promiseResult = JSON.stringify(clipIds);
      resolve(promiseResult);
    });
  };

export const deleteClip =
  (clipId: ClipId): AppThunk =>
  (dispatch) => {
    dispatch(deselectClip(clipId));
    dispatch(removeClip(clipId));
    dispatch(removeClipFromClipMap(clipId));
  };

export const deleteClips =
  (clipIds: ClipId[]): AppThunk =>
  (dispatch) => {
    clipIds.forEach((clipId) => {
      dispatch(deselectClip(clipId));
    });
    dispatch(removeClips(clipIds));
    dispatch(removeClipsFromClipMap(clipIds));
  };

export const repeatClips =
  (clipIds: ClipId[]): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const { repeatCount, repeatTransforms } = Selectors.selectRoot(state);

    const clips = Selectors.selectClipsByIds(state, clipIds);
    const clipDurations = clips.map((clip) =>
      Selectors.selectClipDuration(state, clip.id)
    );
    const startTime = Math.min(...clips.map((clip) => clip.startTime));
    const lastTime = Math.max(
      ...clips.map((clip, i) => clip.startTime + clipDurations[i])
    );
    const totalDuration = lastTime - startTime;

    for (let i = 1; i <= repeatCount; i++) {
      // Move the clips
      const movedClips = clips.map((clip) => ({
        ...clip,
        startTime: clip.startTime + i * totalDuration,
      }));
      dispatch(createClips(movedClips));

      // Move the transforms
      if (repeatTransforms) {
        clips.forEach((clip, j) => {
          const clipTransforms = Selectors.selectClipTransforms(state, clip.id);
          const currentTransforms = clipTransforms.filter((t: Transform) =>
            inRange(t.time, clip.startTime, clip.startTime + clipDurations[j])
          );
          if (currentTransforms.length) {
            const movedTransforms = currentTransforms.map((t: Transform) => ({
              ...t,
              time: t.time + i * totalDuration,
            }));
            dispatch(createTransforms(movedTransforms));
          }
        });
      }
    }
    dispatch(toggleRepeatingClips());
  };

export const mergeClips =
  (clipIds: ClipId[]): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const { mergeName, mergeTransforms } = Selectors.selectRoot(state);
    const clips = Selectors.selectClipsByIds(state, clipIds).filter(
      Boolean
    ) as Clip[];
    if (!clips || !clips.length) return;
    const sortedClips = clips.sort((a, b) => a.startTime - b.startTime);
    let oldTransforms: Transform[] = [];

    // Create a merged pattern
    const stream = sortedClips.reduce((acc, clip) => {
      const pattern = Selectors.selectPattern(state, clip.patternId);
      if (!pattern) return acc;
      const scale = Selectors.selectClipScale(state, clip.id);
      const transforms = Selectors.selectClipTransforms(state, clip.id);

      const allChords = mergeTransforms
        ? getClipStream(clip, pattern, scale, transforms, [])
        : getClipNotes(clip, pattern.stream);

      // Add any overlapping transforms if merging
      if (mergeTransforms) {
        const duration = getClipDuration(clip, pattern);
        oldTransforms = union(
          oldTransforms,
          transforms.filter((t) =>
            inRange(t.time, clip.startTime, clip.startTime + duration)
          )
        );
      }

      const chords = allChords.filter((chord) => !!chord.length);
      return [...acc, ...chords];
    }, [] as PatternStream);

    const newPattern = initializePattern({
      stream,
      name: !!mergeName.length ? mergeName : "New Pattern",
    });
    dispatch(addPattern(newPattern));
    dispatch(setActivePattern(newPattern.id));

    // Create a new clip
    await dispatch(
      createClip({
        patternId: newPattern.id,
        trackId: sortedClips[0].trackId,
        startTime: sortedClips[0].startTime,
      })
    );
    // Delete the old clips
    dispatch(deleteClips(clipIds));
    // Delete any merged transforms
    if (mergeTransforms && oldTransforms.length) {
      dispatch(deleteTransforms(oldTransforms.map((t) => t.id)));
    }
  };

export const createPatternClip =
  (trackId: TrackId, patternId: PatternId, startTime: Time): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the pattern track from the store
    const patternTrack = Selectors.selectPatternTrack(state, trackId);
    if (!patternTrack) return;

    // Get the pattern from the store
    const pattern = Selectors.selectPattern(state, patternId);
    if (!pattern) return;

    // Create a new clip
    const clip: ClipNoId = {
      ...defaultClip,
      patternId: pattern.id,
      startTime,
      trackId: patternTrack.id,
    };
    dispatch(createClip(clip));
  };

export const cutClip =
  (clipId: ClipId, time: Time): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the clip from the store
    const clip = Selectors.selectClip(state, clipId);
    if (!clip) return;

    const stream = selectClipStream(state, clipId);

    const splitDuration = time - clip.startTime;
    if (time === clip.startTime || splitDuration === stream.length) return;

    // Create two new clips pivoting at the time
    const firstClip = initializeClip({
      ...clip,
      duration: splitDuration,
    });
    const secondClip = initializeClip({
      ...clip,
      startTime: time,
      offset: clip.offset + splitDuration,
      duration: stream.length - splitDuration,
    });

    // Create the new clips
    dispatch(deselectClip(clipId));
    dispatch(_cutClip({ oldClip: clip, firstClip, secondClip }));
    dispatch(
      cutClipFromClipMap({
        oldClipId: clipId,
        firstClipId: firstClip.id,
        secondClipId: secondClip.id,
      })
    );
  };

export const copyClips =
  (clips: Clip[], time: Time): AppThunk =>
  (dispatch) => {};

export default clipsSlice.reducer;
