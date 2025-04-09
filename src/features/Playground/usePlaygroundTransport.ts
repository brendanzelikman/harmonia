import { useToggle } from "hooks/useToggle";
import { useEffect } from "react";
import { getContext } from "tone";
import { useStore, useDispatch } from "hooks/useStore";
import { selectProjectId } from "types/Meta/MetaSelectors";
import {
  LOAD_TRANSPORT,
  loadTransport,
  unloadTransport,
} from "types/Transport/TransportThunks";

export function usePlaygroundTransport() {
  const dispatch = useDispatch();
  const projectId = useStore(selectProjectId);
  const transport = useToggle(LOAD_TRANSPORT);

  // Load the transport or add an event listener if the context is not running
  useEffect(() => {
    const load = () => dispatch(loadTransport());
    if (getContext().state === "running") {
      load();
    } else {
      window.addEventListener("mousedown", load, { once: true });
    }
    return unloadTransport;
  }, [projectId]);

  return transport.isOpen;
}
