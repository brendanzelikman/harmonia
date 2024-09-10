import { Payload, unpackUndoType } from "lib/redux";
import { Motif, MotifId } from "./MotifTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { isScale, isScaleObject } from "types/Scale/ScaleTypes";
import { addScale } from "types/Scale/ScaleSlice";
import { isPattern } from "types/Pattern/PatternTypes";
import { addPattern } from "types/Pattern/PatternSlice";
import { isPose } from "types/Pose/PoseTypes";
import { addPose } from "types/Pose/PoseSlice";

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
