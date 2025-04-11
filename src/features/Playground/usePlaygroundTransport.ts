import { useLayoutEffect } from "react";
import { getContext } from "tone";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { selectProjectId } from "types/Meta/MetaSelectors";
import {
  LOAD_TRANSPORT,
  loadTransport,
  unloadTransport,
} from "types/Transport/TransportLoader";
import { useToggle } from "hooks/useToggle";

export function usePlaygroundTransport() {
  const dispatch = useAppDispatch();
  const projectId = useAppValue(selectProjectId);
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
