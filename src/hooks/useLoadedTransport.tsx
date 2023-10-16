import { useEffect, useState } from "react";
import {
  START_LOADING_TRANSPORT,
  STOP_LOADING_TRANSPORT,
  loadTransport,
} from "redux/Transport";
import { useCustomEventListener } from "./useCustomEventListener";
import { useAppDispatch } from "redux/hooks";

/** Load and unload the transport when the app mounts. */
export function useLoadedTransport() {
  const dispatch = useAppDispatch();
  const [loaded, setLoaded] = useState(false);

  useCustomEventListener(START_LOADING_TRANSPORT, () => setLoaded(false));
  useCustomEventListener(STOP_LOADING_TRANSPORT, () => setLoaded(true));

  useEffect(() => {
    dispatch(loadTransport());
    return () => {
      dispatch(loadTransport());
    };
  }, []);

  return loaded;
}
