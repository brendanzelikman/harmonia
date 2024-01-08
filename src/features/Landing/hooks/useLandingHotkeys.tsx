import { SubscriptionStatus } from "utils/constants";
import { useSubscription } from "providers/subscription";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";

export const useLandingHotkeys = () => {
  const navigate = useNavigate();
  const { isAtLeastStatus } = useSubscription();

  // Fire the callback if the user is at least the given status
  const authCallback = useCallback(
    (callback: () => void, status: SubscriptionStatus = "prodigy") => {
      return () => {
        if (isAtLeastStatus(status)) callback();
      };
    },
    [isAtLeastStatus]
  );

  // Redirect the user to their projects
  useHotkeys(
    "shift+enter",
    authCallback(() => navigate("/projects"), "maestro"),
    [authCallback]
  );

  // Redirect the user to the demos
  useHotkeys(
    "shift+d",
    authCallback(() => navigate("/demos")),
    [authCallback]
  );

  // Redirect the user to the docs
  useHotkeys(
    "?",
    authCallback(() => navigate("/docs")),
    [authCallback]
  );

  // Redirect the user to the playground
  useHotkeys(
    "meta+shift+enter",
    authCallback(() => navigate("/playground")),
    [authCallback]
  );
};
