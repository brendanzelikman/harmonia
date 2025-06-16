import { useEffect } from "react";
import { getContext } from "tone";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { selectProjectId } from "types/Meta/MetaSelectors";
import {
  LOAD_TRANSPORT,
  loadTransport,
  unloadTransport,
} from "types/Transport/TransportLoader";
import { useToggle } from "hooks/useToggle";
import { stopRecordingTransport } from "types/Transport/TransportRecorder";

export function useTransport() {
  const dispatch = useAppDispatch();
  const projectId = useAppValue(selectProjectId);
  const transport = useToggle(LOAD_TRANSPORT, false);

  // Load the transport or add an event listener if the context is not running
  useEffect(() => {
    dispatch(stopRecordingTransport());
    const load = () => dispatch(loadTransport());
    if (getContext().state === "running") {
      load();
    } else {
      document.addEventListener("mousedown", load, { once: true });
    }
    return () => {
      unloadTransport();
    };
  }, [projectId]);

  // Return the load state of the transport
  return !!transport.isOpen;
}
