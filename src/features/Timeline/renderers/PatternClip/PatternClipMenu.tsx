import { useHeldKeys } from "hooks/useHeldkeys";

export const PatternClipMenu = (props: { left: number; top: number }) => {
  const { left, top } = props;
  const heldKeys = useHeldKeys(["alt", "shift"]);
  const holdingAlt = heldKeys["AltLeft"];
  const holdingShift = heldKeys["ShiftLeft"];
  const hide = holdingAlt || holdingShift;
  if (hide) return null;
  return (
    <div
      style={{ left, top }}
      className="absolute z-[31] text-xs flex flex-col gap-0.5 *:border-b font-light animate-in fade-in whitespace-nowrap w-48 p-[3px] px-1 rounded bg-slate-900/90 backdrop-blur text-emerald-300/80"
    >
      <div className="text-emerald-300/80">Left Click to Edit Pattern</div>
      <div className="text-cyan-300/80">Right Click to Edit Clips</div>
      <div className="text-indigo-300/90">Option + Click to Select Clips</div>
      <div className="text-violet-300/90">Shift + Click to Select Range</div>
      <div className="text-slate-200/90">Escape to Close Menus</div>
    </div>
  );
};
