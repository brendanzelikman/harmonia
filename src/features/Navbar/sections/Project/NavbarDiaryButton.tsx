import { NavbarTooltipButton } from "components/TooltipButton";
import { GiNotebook } from "react-icons/gi";
import { useDiary } from "types/Diary/DiaryTypes";

export function NavbarDiaryButton() {
  const { isOpen, toggle } = useDiary();
  return (
    <NavbarTooltipButton
      className="cursor-pointer text-slate-50"
      label={isOpen ? "Close Project Diary" : "Open Project Diary"}
      onClick={toggle}
    >
      <GiNotebook />
    </NavbarTooltipButton>
  );
}
