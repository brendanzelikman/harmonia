import { useToggledState } from "hooks/useToggledState";
import { useEffect } from "react";
import { useDeep, useProjectDispatch } from "types/hooks";
import { selectProjectId } from "types/Meta/MetaSelectors";
import {
  LOAD_TRANSPORT_STATE,
  loadTransport,
  unloadTransport,
} from "types/Transport/TransportThunks";

export function usePlaygroundTransport() {
  const dispatch = useProjectDispatch();

  // Reload the transport when the project changes
  const projectId = useDeep(selectProjectId);
  useEffect(() => {
    dispatch(loadTransport());
    return () => dispatch(unloadTransport());
  }, [projectId]);

  // Return the load state
  const transport = useToggledState(LOAD_TRANSPORT_STATE);
  return transport.isClosed;
}
