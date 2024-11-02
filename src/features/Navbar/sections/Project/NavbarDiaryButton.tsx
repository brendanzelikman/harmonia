import { NavbarTooltipButton } from "components/TooltipButton";
import { GiNotebook } from "react-icons/gi";
import { useDiary } from "types/Diary/DiaryTypes";

export function NavbarDiaryButton() {
  const { isOpen, toggle } = useDiary();
  return (
    <NavbarTooltipButton
      className="bg-gradient-radial from-indigo-500/5 via-indigo-500/20 to-indigo-500/80 cursor-pointer text-slate-50 size-9 border border-slate-500"
      borderColor="border-indigo-500"
      label={
        <>
          {isOpen ? "Close" : "Equip"} Diary{" "}
          <span className="font-light text-slate-400">(Write Notes)</span>
        </>
      }
      onClick={toggle}
    >
      <GiNotebook />
    </NavbarTooltipButton>
  );
}
