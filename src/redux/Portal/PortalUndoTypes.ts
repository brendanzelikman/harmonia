import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getClipAsString, getClipUpdateAsString } from "types/Clip";

import { getPortalAsString, getPortalUpdateAsString } from "types/Portal";
import { getPoseAsString, getPoseUpdateAsString } from "types/Pose";
import { toString } from "utils/objects";
import * as _ from "./PortalSlice";

export const PORTAL_UNDO_TYPES: ActionGroup = {
  "portals/addPortals": (action: PayloadAction<_.AddPortalsPayload>) => {
    const { clips, poses, portals } = action.payload;
    const clipTag = toString(clips, getClipAsString);
    const poseTag = toString(poses, getPoseAsString);
    const portalTag = toString(portals, getPortalAsString);
    return `ADD_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "portals/updatePortals": (action: PayloadAction<_.UpdatePortalsPayload>) => {
    const { clips, poses, portals } = action.payload;
    const clipTag = toString(clips, getClipUpdateAsString);
    const poseTag = toString(poses, getPoseUpdateAsString);
    const portalTag = toString(portals, getPortalUpdateAsString);
    return `UPDATE_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "portals/removePortals": (action: PayloadAction<_.RemovePortalsPayload>) => {
    const { clipIds, poseIds, portalIds } = action.payload;
    const clipTag = toString(clipIds);
    const poseTag = toString(poseIds);
    const portalTag = toString(portalIds);
    return `REMOVE_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "portals/clearPortalsByTrackId": (
    action: PayloadAction<_.ClearPortalsByTrackIdPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
  "portals/removePortalsByTrackId": (
    action: PayloadAction<_.RemovePortalsByTrackIdPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload.originalId}`;
  },
};
