import { Rank } from "utils/rank";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { useAuth } from "providers/auth";

export const useLandingHotkeys = (ref: React.RefObject<HTMLElement>) => {
  const navigate = useNavigate();
  const { isAtLeastRank } = useAuth();

  // Fire the callback if the user is at least the given status
  const authCallback = useCallback(
    (callback: () => void, status: Rank = "prodigy") => {
      return () => {
        if (isAtLeastRank(status)) callback();
      };
    },
    [isAtLeastRank]
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

  // Scroll the page up
  useHotkeys("up", () => {
    if (!ref.current) return;
    ref.current.scrollTo({
      top: ref.current.scrollTop - window.innerHeight,
      behavior: "smooth",
    });
  });

  // Scroll the page down
  useHotkeys("down", () => {
    if (!ref.current) return;
    ref.current.scrollTo({
      top: ref.current.scrollTop + window.innerHeight,
      behavior: "smooth",
    });
  });
};
