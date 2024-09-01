import { Payload, unpackUndoType } from "lib/redux";
import { isUndefined } from "lodash";
import { getTransport } from "tone";
import {
  PatternClip,
  initializePatternClip,
  PoseClip,
  initializePoseClip,
  ScaleClip,
  initializeScaleClip,
  initializeClip,
  IClip,
  ClipType,
} from "types/Clip/ClipTypes";
import { createMedia } from "types/Media/MediaThunks";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectSelectedTrackId,
  selectDraftedPatternClip,
  selectDraftedPoseClip,
  selectDraftedScaleClip,
  selectDraftedClip,
} from "../TimelineSelectors";

export const createClipFromMediaDraft =
  <T extends ClipType>(payload: Payload<Partial<IClip<T>>>): Thunk =>
  (dispatch, getProject) => {
    const undoType = unpackUndoType(payload, "createClipFromMediaDraft");
    const project = getProject();
    const selectedTrackId = selectSelectedTrackId(project);
    const draft = { ...selectDraftedClip(project), ...(payload?.data ?? {}) };
    const clip = initializeClip({
      ...draft,
      trackId: draft.trackId ?? selectedTrackId,
      tick: draft.tick ?? getTransport().ticks,
    });
    dispatch(createMedia({ data: { clips: [clip] }, undoType }));
  };

/** Add a clip to the currently selected track using the media draft. */
export const createPatternClipFromMediaDraft =
  (payload?: Payload<Partial<PatternClip>>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const data = payload?.data ?? {};
    const undoType = payload?.undoType ?? "createPatternClipFromMediaDraft";
    const selectedTrackId = selectSelectedTrackId(project);

    // Get the drafted clip
    const draft = { ...selectDraftedPatternClip(project), ...data };
    const clip = initializePatternClip({
      ...draft,
      trackId: draft.trackId ?? selectedTrackId,
      tick: draft.tick ?? getTransport().ticks,
    });

    // Create the clip
    dispatch(createMedia({ data: { clips: [clip] }, undoType }));
  };

/** Add a pose to the currently selected track using the media draft. */
export const createPoseClipFromMediaDraft =
  (payload?: Payload<Partial<PoseClip>>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const data = payload?.data;
    const undoType = payload?.undoType ?? "createPoseClipFromMediaDraft";
    const selectedTrackId = selectSelectedTrackId(project);

    // Get the drafted pose
    const draft = { ...selectDraftedPoseClip(project), ...data };
    const clip = initializePoseClip({
      ...draft,
      tick: isUndefined(draft.tick) ? getTransport().ticks : draft.tick,
      trackId: isUndefined(draft.trackId) ? selectedTrackId : draft.trackId,
    });

    // Create the pose
    dispatch(createMedia({ data: { clips: [clip] }, undoType }));
  };

/** Add a clip to the currently selected track using the media draft. */
export const createScaleClipFromMediaDraft =
  ({ data, undoType }: Payload<Partial<ScaleClip>>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedTrackId = selectSelectedTrackId(project);

    // Get the drafted clip
    const draft = { ...selectDraftedScaleClip(project), ...data };
    const clip = initializeScaleClip({
      ...draft,
      trackId: isUndefined(draft.trackId) ? selectedTrackId : draft.trackId,
      tick: isUndefined(draft.tick) ? getTransport().ticks : draft.tick,
    });

    // Create the clip
    dispatch(createMedia({ data: { clips: [clip] }, undoType }));
  };
