import { GiNotebook } from "react-icons/gi";
import { NavbarTooltipButton } from "../../components";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import classNames from "classnames";
import { toggleDiary } from "types/Timeline/TimelineSlice";
import { selectTimeline } from "types/Timeline/TimelineSelectors";

export function NavbarDiaryButton() {
  const dispatch = useProjectDispatch();
  const { showingDiary } = useProjectSelector(selectTimeline);
  return (
    <NavbarTooltipButton
      className={classNames(
        "cursor-pointer",
        showingDiary ? "text-indigo-400" : "text-slate-50"
      )}
      label={showingDiary ? "Close Project Diary" : "Open Project Diary"}
      onClick={() => dispatch(toggleDiary())}
    >
      <GiNotebook />
    </NavbarTooltipButton>
  );
}
