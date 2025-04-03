import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";

export const useLandingHotkeys = () => {
  const navigate = useNavigate();

  useHotkeys("enter", () => navigate("/projects"));
  useHotkeys("shift+enter", () => navigate("/playground"));
};
