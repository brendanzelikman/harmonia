import { useToggle } from "hooks/useToggle";
import { useLayoutEffect } from "react";
import { getContext } from "tone";
import { useSelect, useDispatch } from "hooks/useStore";
import { selectProjectId } from "types/Meta/MetaSelectors";
import {
  LOAD_TRANSPORT,
  loadTransport,
  unloadTransport,
} from "types/Transport/TransportThunks";

export function usePlaygroundTransport() {
  const dispatch = useDispatch();
  const projectId = useSelect(selectProjectId);
  const transport = useToggle(LOAD_TRANSPORT);

  // Load the transport or add an event listener if the context is not running
  useLayoutEffect(() => {
    const load = () => dispatch(loadTransport());
    if (getContext().state === "running") {
      load();
    } else {
      document.addEventListener("mousedown", load, { once: true });
    }
    return unloadTransport;
  }, [projectId]);

  return transport.isOpen;
}
