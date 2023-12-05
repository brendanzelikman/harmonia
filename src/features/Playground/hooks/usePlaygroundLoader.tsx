import { useProjectLoader } from "hooks/db/useProjectLoader";
import { useTransportLoader } from "hooks/transport/useTransportLoader";
import { useEffect } from "react";
import { dispatchCustomEvent } from "utils/html";

export interface PlaygroundLoadState {
  isPlaygroundLoaded: boolean;
  isProjectLoaded: boolean;
  isTransportLoaded: boolean;
}

export const usePlaygroundLoader = (): PlaygroundLoadState => {
  // Load the project and transport
  const isProjectLoaded = useProjectLoader();
  const isTransportLoaded = useTransportLoader();
  const isPlaygroundLoaded = !!(isProjectLoaded && isTransportLoaded);

  // Dispatch an event when the playground is loaded
  useEffect(() => {
    dispatchCustomEvent("playground-loaded", isPlaygroundLoaded);
  }, [isPlaygroundLoaded]);

  return {
    isPlaygroundLoaded,
    isProjectLoaded,
    isTransportLoaded,
  };
};
