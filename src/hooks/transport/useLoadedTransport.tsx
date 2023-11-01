import { useEffect, useState } from "react";
import {
  START_LOADING_TRANSPORT,
  STOP_LOADING_TRANSPORT,
  loadTransport,
} from "redux/Transport";
import { useCustomEventListener } from "../useCustomEventListener";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectProjectId } from "redux/selectors";

/** Load and unload the transport when the app mounts. */
export function useTransportLoader() {
  const dispatch = useProjectDispatch();
  const projectId = useProjectSelector(selectProjectId);
  const [loaded, setLoaded] = useState(false);

  useCustomEventListener(START_LOADING_TRANSPORT, () => setLoaded(false));
  useCustomEventListener(STOP_LOADING_TRANSPORT, () => setLoaded(true));

  useEffect(() => {
    dispatch(loadTransport());
    return () => {
      dispatch(loadTransport());
    };
  }, [projectId]);

  return loaded;
}
