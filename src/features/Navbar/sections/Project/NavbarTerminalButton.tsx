import { NavbarTooltipButton } from "components/TooltipButton";
import { FaTerminal } from "react-icons/fa";
import { useTerminal } from "types/Project/ProjectTypes";

export function NavbarTerminalButton() {
  const { isOpen, toggle } = useTerminal();
  return (
    <NavbarTooltipButton
      className="bg-gradient-radial p-2 from-slate-200/5 to-slate-950/90 cursor-pointer text-slate-50 size-9 border border-slate-500"
      borderColor="border-slate-400"
      label={
        <>
          {isOpen ? "Close" : "Open"} Terminal{" "}
          <span className="font-light text-slate-400">(Edit File)</span>
        </>
      }
      onClick={toggle}
    >
      <FaTerminal />
    </NavbarTooltipButton>
  );
}
