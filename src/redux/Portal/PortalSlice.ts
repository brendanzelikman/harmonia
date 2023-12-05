import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { union, without } from "lodash";
import {
  CreateMediaPayload,
  RemoveMediaPayload,
  UpdateMediaPayload,
} from "types/Media";
import { defaultPortalState } from "types/Portal";
import { TrackId } from "types/Track";

// ------------------------------------------------------------
// Portal Payload Types
// ------------------------------------------------------------

/** A list of portals can be added to the slice. */
export type AddPortalsPayload = CreateMediaPayload;

/** A list of portals can be updated in the slice. */
export type UpdatePortalsPayload = UpdateMediaPayload;

/** A list of portals can be removed from the slice by ID. */
export interface RemovePortalsPayload extends RemoveMediaPayload {
  callerId?: TrackId;
  tag?: string;
}

/** A list of portals can be removed from the slice when clearing a track ID. */
export type ClearPortalsByTrackIdPayload = TrackId;

/** A list of portals can be removed from the slice when removing a track ID. */
export type RemovePortalsByTrackIdPayload = {
  id: TrackId;
  ancestorId: TrackId;
};

// ------------------------------------------------------------
// Portal Slice Definition
// ------------------------------------------------------------

export const portalsSlice = createSlice({
  name: "portals",
  initialState: defaultPortalState,
  reducers: {
    addPortals: (state, action: PayloadAction<AddPortalsPayload>) => {
      const { portals } = action.payload;
      if (!portals) return;
      portals.forEach((portal) => {
        state.allIds = union(state.allIds, [portal.id]);
        state.byId[portal.id] = portal;
      });
    },
    updatePortals: (state, action: PayloadAction<UpdatePortalsPayload>) => {
      const { portals } = action.payload;
      if (!portals?.length) return;
      portals.forEach((portal) => {
        const { id, ...rest } = portal;
        if (!id) return;
        state.byId[id] = { ...state.byId[id], ...rest };
      });
    },
    removePortals: (state, action: PayloadAction<RemovePortalsPayload>) => {
      const { portalIds } = action.payload;
      if (!portalIds) return;
      portalIds.forEach((id) => {
        state.allIds = without(state.allIds, id);
        delete state.byId[id];
      });
    },
  },
});

export const { addPortals, updatePortals, removePortals } =
  portalsSlice.actions;

export default portalsSlice.reducer;
