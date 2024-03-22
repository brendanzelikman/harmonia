import { Dialog } from "@headlessui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useCustomEventListener } from "hooks";
import { GlobalShortcuts } from "./content/GlobalShortcuts";
import classNames from "classnames";
import { TransportShortcuts } from "./content/TransportShortcuts";
import { ArrangementShortcuts } from "./content/ArrangementShortcuts";
import { TimelineShortcuts } from "./content/TimelineShortcuts";
import { InstrumentEditorShortcuts } from "./content/InstrumentEditorShortcuts";
import { ScaleEditorShortcuts } from "./content/ScaleEditorShortcuts";
import { PatternEditorShortcuts } from "./content/PatternEditorShortcuts";
import { PoseEditorShortcuts } from "./content/PoseEditorShortcuts";
import { BsX, BsXCircle } from "react-icons/bs";
import { useProjectSelector } from "redux/hooks";
import { TickDurations } from "./content/TickDurations";

export const TOGGLE_SHORTCUTS = "TOGGLE_SHORTCUTS";

export const SHORTCUT_TYPES = [
  "Global",
  "Transport",
  "Timeline",
  "Arrangement",
  "Scale Editor",
  "Pattern Editor",
  "Pose Editor",
  "Instrument Editor",
  "Tick Durations",
] as const;
export type ShortcutType = (typeof SHORTCUT_TYPES)[number];

export function ShortcutsMenu() {
  const showingDiary = useProjectSelector((_) => _.timeline.showingDiary);
  const [show, setShow] = useState(false);
  const [type, setType] = useState<ShortcutType>("Global");

  // Close the diary if it's open
  useEffect(() => {
    if (showingDiary) setShow(false);
  }, [showingDiary]);

  // Listen for shortcut events
  const toggleShortcuts = useCallback(() => setShow((show) => !show), []);
  useCustomEventListener(TOGGLE_SHORTCUTS, () => setShow(!show));
  useHotkeys("shift+slash", toggleShortcuts);
  useHotkeys("esc", () => setShow(false));

  // Render a topic header and its entries' links
  const renderShortcutTypeButton = (shortcutType: ShortcutType) => {
    const isOpen = type === shortcutType;
    return (
      <button
        key={shortcutType}
        className={classNames(
          "text-2xl text-left text-shadow cursor-pointer select-none",
          "pl-6 py-2 border-l-2 whitespace-nowrap focus:outline-none",
          "transition-colors duration-150 ease-in-out",
          "active:text-white active:text-shadow-lg active:border-l-sky-400",
          { "text-sky-500 border-l-sky-500": isOpen },
          { "text-slate-400 hover:text-slate-200": !isOpen },
          { "border-l-slate-600/50  hover:border-l-sky-500 ": !isOpen }
        )}
        onClick={() => setType(shortcutType)}
      >
        {shortcutType}
      </button>
    );
  };

  // Get the corresponding content
  const ShortcutContent = useMemo(() => {
    if (type === "Global") return <GlobalShortcuts />;
    if (type === "Transport") return <TransportShortcuts />;
    if (type === "Timeline") return <TimelineShortcuts />;
    if (type === "Arrangement") return <ArrangementShortcuts />;
    if (type === "Instrument Editor") return <InstrumentEditorShortcuts />;
    if (type === "Scale Editor") return <ScaleEditorShortcuts />;
    if (type === "Pattern Editor") return <PatternEditorShortcuts />;
    if (type === "Pose Editor") return <PoseEditorShortcuts />;
    if (type === "Tick Durations") return <TickDurations />;
    return null;
  }, [type]);

  return (
    <Dialog
      open={show}
      as="div"
      className="relative font-nunito"
      onClose={toggleShortcuts}
    >
      <div className="fixed flex justify-center inset-0 p-2 z-50 bg-slate-800/80 text-slate-200 backdrop-blur animate-in fade-in overflow-scroll">
        <div className="w-full h-full flex justify-center flex-1 gap-8">
          <div className="flex flex-col w-[28rem] p-8 gap-2 whitespace-nowrap overflow-scroll">
            <span className="font-bold text-3xl border-b border-b-slate-400/50 p-4 mt-8 mb-4">
              Playground Shortcuts
            </span>
            {SHORTCUT_TYPES.map(renderShortcutTypeButton)}
          </div>
          <div className="p-8 my-8 flex items-stretch">{ShortcutContent}</div>
        </div>
        <button
          className="ml-auto mb-auto mt-2 mr-2 text-3xl flex items-center gap-2 hover:text-slate-200/50 outline-none focus:outline-none transition-all duration-200"
          onClick={toggleShortcuts}
        >
          <BsXCircle />
        </button>
      </div>
    </Dialog>
  );
}
