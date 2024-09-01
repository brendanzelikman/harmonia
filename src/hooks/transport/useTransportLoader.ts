import { useEffect, useState } from "react";
import { useEventListener } from "../window/useCustomEventListener";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import { selectProjectId } from "types/Meta/MetaSelectors";
import {
  START_LOADING_TRANSPORT,
  STOP_LOADING_TRANSPORT,
  loadTransport,
  unloadTransport,
} from "types/Transport/TransportThunks";

/** Load and unload the transport when the app mounts. */
export function useTransportLoader() {
  const dispatch = useProjectDispatch();
  const projectId = useProjectSelector(selectProjectId);
  const [loaded, setLoaded] = useState(false);

  useEventListener(START_LOADING_TRANSPORT, () => setLoaded(false));
  useEventListener(STOP_LOADING_TRANSPORT, () => setLoaded(true));

  useEffect(() => {
    dispatch(loadTransport());
    return () => {
      dispatch(unloadTransport());
    };
  }, [projectId]);

  return loaded;
}
