import { useAuth } from "providers/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dispatchCustomEvent } from "utils/html";
import { usePlaygroundProject } from "./usePlaygroundProject";
import { usePlaygroundTransport } from "./usePlaygroundTransport";

export interface PlaygroundLoadState {
  isPlaygroundLoaded: boolean;
  isProjectLoaded: boolean;
  isTransportLoaded: boolean;
}

export const usePlaygroundLoader = (): PlaygroundLoadState => {
  const navigate = useNavigate();
  const { canPlay } = useAuth();

  // Load the project and transport
  const isProjectLoaded = usePlaygroundProject();
  const isTransportLoaded = usePlaygroundTransport();
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
