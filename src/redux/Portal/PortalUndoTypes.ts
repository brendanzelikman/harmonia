import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getClipUpdateAsString, getClipAsString } from "types/Clip";

import { getPortalAsString, getPortalUpdateAsString } from "types/Portal";
import { toString } from "utils/objects";
import * as _ from "./PortalSlice";

export const PORTAL_UNDO_TYPES: ActionGroup = {
  "portals/addPortals": (action: PayloadAction<_.AddPortalsPayload>) => {
    const { clips, portals } = action.payload;
    const clipTag = toString(clips, getClipAsString);
    const portalTag = toString(portals, getPortalAsString);
    return `ADD_MEDIA:${clipTag},${portalTag}`;
  },
  "portals/updatePortals": (action: PayloadAction<_.UpdatePortalsPayload>) => {
    const { clips, portals } = action.payload;
    const clipTag = toString(clips, getClipUpdateAsString);
    const portalTag = toString(portals, getPortalUpdateAsString);
    return `UPDATE_MEDIA:${clipTag},${portalTag}`;
  },
  "portals/removePortals": (action: PayloadAction<_.RemovePortalsPayload>) => {
    const { clipIds, portalIds, callerId, tag } = action.payload;
    const clipTag = toString(clipIds);
    const portalTag = toString(portalIds);

    if (callerId && tag === "REMOVE") return `REMOVE_TRACK:${callerId}`;
    if (callerId && tag === "CLEAR") return `CLEAR_TRACK:${callerId}`;

    return `REMOVE_MEDIA:${clipTag},${portalTag}`;
  },
  "portals/clearPortalsByTrackId": (
    action: PayloadAction<_.ClearPortalsByTrackIdPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
  "portals/removePortalsByTrackId": (
    action: PayloadAction<_.RemovePortalsByTrackIdPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload.ancestorId}`;
  },
};
