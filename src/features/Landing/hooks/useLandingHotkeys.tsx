import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";

export const useLandingHotkeys = (ref: React.RefObject<HTMLElement>) => {
  const navigate = useNavigate();

  useHotkeys("enter", () => navigate("/projects"));
  useHotkeys("shift+enter", () => navigate("/playground"));

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
