import { useProjectLoader } from "hooks/db/useProjectLoader";
import { useTransportLoader } from "hooks/transport/useTransportLoader";
import { useSubscription } from "providers/subscription";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dispatchCustomEvent } from "utils/html";

export interface PlaygroundLoadState {
  isPlaygroundLoaded: boolean;
  isProjectLoaded: boolean;
  isTransportLoaded: boolean;
}

export const usePlaygroundLoader = (): PlaygroundLoadState => {
  const navigate = useNavigate();
  const { canPlay } = useSubscription();

  // Load the project and transport
  const isProjectLoaded = useProjectLoader();
  const isTransportLoaded = useTransportLoader();
  const isPlaygroundLoaded = !!(isProjectLoaded && isTransportLoaded);

  // Dispatch an event when the playground is loaded
  useEffect(() => {
    dispatchCustomEvent("playground-loaded", isPlaygroundLoaded);
  }, [isPlaygroundLoaded]);

  // Sign out if the user is on Electron and not Virtuoso
  useEffect(() => {
    if (!canPlay) {
      navigate("/");
    }
  }, [canPlay]);

  return {
    isPlaygroundLoaded,
    isProjectLoaded,
    isTransportLoaded,
  };
};
