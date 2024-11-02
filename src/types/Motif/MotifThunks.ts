import { Payload, unpackUndoType } from "lib/redux";
import { Motif, MotifId } from "./MotifTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { isScaleId, isScaleObject } from "types/Scale/ScaleTypes";
import { addScale, removeScale } from "types/Scale/ScaleSlice";
import { isPattern, isPatternId } from "types/Pattern/PatternTypes";
import { addPattern, removePattern } from "types/Pattern/PatternSlice";
import { isPose, isPoseId } from "types/Pose/PoseTypes";
import { addPose, removePose } from "types/Pose/PoseSlice";

export const addMotif =
  (payload: Payload<Motif>): Thunk<MotifId> =>
  (dispatch) => {
    const motif = payload.data;
    const undoType = unpackUndoType(payload, "addMotif");
    if (isScaleObject(motif)) {
      dispatch(addScale({ data: motif, undoType }));
    } else if (isPattern(motif)) {
      dispatch(addPattern({ data: motif, undoType }));
    } else if (isPose(motif)) {
      dispatch(addPose({ data: motif, undoType }));
    }
    return motif.id;
  };

export const removeMotif =
  (payload: Payload<MotifId>): Thunk =>
  (dispatch) => {
    const id = payload.data;
    if (isScaleId(id)) {
      dispatch(removeScale(id));
    } else if (isPatternId(id)) {
      dispatch(removePattern(id));
    } else if (isPoseId(id)) {
      dispatch(removePose(id));
    }
  };
