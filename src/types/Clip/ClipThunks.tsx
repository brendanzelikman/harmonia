import { Tick } from "types/units";
import { selectTimedClipById } from "./ClipSelectors";
import { Thunk } from "types/Project/ProjectTypes";
import { ClipId, PortaledClipId, isPatternClip } from "./ClipTypes";
import { Payload, unpackData, unpackUndoType } from "types/redux";
import { removePatternClip, removePoseClip } from "./ClipSlice";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";
import { createMedia } from "types/Media/MediaThunks";

// ------------------------------------------------------------
// Clip Timeline Thunks
// ------------------------------------------------------------

/** Slice a clip and make sure the old ID is no longer selected. */
export const sliceClip =
  (payload: Payload<{ id: PortaledClipId | ClipId; tick: Tick }>): Thunk =>
  (dispatch, getProject) => {
    const { tick, id: _id } = unpackData(payload);
    const undoType = unpackUndoType(payload, "sliceClip");
    const id = getOriginalIdFromPortaledClip(_id);
    const clip = selectTimedClipById(getProject(), id);
    if (!clip) return;

    // Find the tick to split the clip at
    const splitTick = tick - clip.tick;
    if (tick === clip.tick || splitTick === clip.duration) return;
    if (splitTick < 0 || splitTick > clip.tick + clip.duration) return;

    // Get the two new clips
    const firstClip = { ...clip, duration: splitTick };
    const offset = (clip.offset || 0) + splitTick;
    const duration = clip.duration - splitTick;
    const secondClip = { ...clip, tick, offset, duration };

    // Slice the clip
    if (isPatternClip(clip)) {
      dispatch(removePatternClip({ data: clip.id, undoType }));
    } else {
      dispatch(removePoseClip({ data: clip.id, undoType }));
    }
    dispatch(
      createMedia({ data: { clips: [firstClip, secondClip] }, undoType })
    );
  };
