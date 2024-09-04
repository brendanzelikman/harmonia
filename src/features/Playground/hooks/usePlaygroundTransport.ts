import { useEffect, useState } from "react";
import { useCustomEventListener } from "../../../hooks/useCustomEventListener";
import { use, useProjectDispatch } from "types/hooks";
import { selectProjectId } from "types/Meta/MetaSelectors";
import {
  START_LOADING_TRANSPORT,
  STOP_LOADING_TRANSPORT,
  loadTransport,
  unloadTransport,
} from "types/Transport/TransportThunks";

/** Load and unload the transport when the app mounts. */
export function usePlaygroundTransport() {
  const dispatch = useProjectDispatch();

  const projectId = use(selectProjectId);
  const [loaded, setLoaded] = useState(false);

  useCustomEventListener(START_LOADING_TRANSPORT, () => setLoaded(false));
  useCustomEventListener(STOP_LOADING_TRANSPORT, () => setLoaded(true));

  useEffect(() => {
    dispatch(loadTransport());
    return () => {
      dispatch(unloadTransport());
    };
  }, [projectId]);

  return loaded;
}
