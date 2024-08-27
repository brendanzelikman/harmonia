import { GiNotebook } from "react-icons/gi";
import { NavbarTooltipButton } from "../../components";
import classNames from "classnames";
import { useDiary } from "types/Diary/DiaryTypes";

export function NavbarDiaryButton() {
  const { isOpen, toggle } = useDiary();
  return (
    <NavbarTooltipButton
      className={classNames(
        "cursor-pointer",
        isOpen ? "text-indigo-400" : "text-slate-50"
      )}
      label={isOpen ? "Close Project Diary" : "Open Project Diary"}
      onClick={toggle}
    >
      <GiNotebook />
    </NavbarTooltipButton>
  );
}
