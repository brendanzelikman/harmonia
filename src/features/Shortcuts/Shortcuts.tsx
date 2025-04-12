import { Dialog } from "@headlessui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GlobalShortcuts } from "./ShortcutsGlobal";
import classNames from "classnames";
import { TransportShortcuts } from "./ShortcutsTransport";
import { ToolShortcuts } from "./ShortcutsTool";
import { TrackShortcuts } from "./ShortcutsTrack";
import { BsXCircle } from "react-icons/bs";
import { TickDurations } from "./ShortcutsTick";
import { useToggle } from "hooks/useToggle";
import { ClipShortcuts } from "./ShortcutsClip";

export const SHORTCUT_TYPES = [
  "Navigating Project",
  "Controlling Playback",
  "Creating Motifs",
  "Selecting Tracks",
  "Selecting Clips",
  "Tick Durations",
] as const;
export type ShortcutType = (typeof SHORTCUT_TYPES)[number];

export default function Shortcuts() {
  const diary = useToggle("diary");
  const showingDiary = diary.isOpen;

  const shortcuts = useToggle("shortcuts");
  const [type, setType] = useState<ShortcutType>("Navigating Project");

  // Close the diary if it's open
  useEffect(() => {
    if (showingDiary) shortcuts.close();
  }, [showingDiary]);

  // Render a topic header and its entries' links
  const renderShortcutTypeButton = useCallback(
    (shortcutType: ShortcutType) => {
      const isOpen = type === shortcutType;
      return (
        <button
          key={shortcutType}
          className={classNames(
            "text-3xl text-left font-light text-shadow cursor-pointer select-none",
            "pl-6 py-4 border-l-2 whitespace-nowrap focus:outline-none",
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
    },
    [type]
  );

  // Get the corresponding content
  const ShortcutContent = useMemo(() => {
    if (type === "Navigating Project") return <GlobalShortcuts />;
    if (type === "Controlling Playback") return <TransportShortcuts />;
    if (type === "Selecting Clips") return <ClipShortcuts />;
    if (type === "Selecting Tracks") return <TrackShortcuts />;
    if (type === "Creating Motifs") return <ToolShortcuts />;
    if (type === "Tick Durations") return <TickDurations />;
    return null;
  }, [type]);

  return (
    <Dialog
      open={shortcuts.isOpen}
      as="div"
      className="relative"
      onClose={shortcuts.close}
    >
      <div className="fixed flex justify-center inset-0 p-2 z-[180] bg-slate-800/80 text-slate-300 backdrop-blur animate-in fade-in overflow-scroll">
        <div className="w-full h-full flex justify-center flex-1 gap-8">
          <div className="flex flex-col w-[28rem] p-8 gap-2">
            <span className="text-4xl font-semibold border-b   border-b-slate-400/50 p-4 mt-8 mb-6">
              Website Shortcuts
            </span>
            {SHORTCUT_TYPES.map(renderShortcutTypeButton)}
          </div>
          <div className="p-8 my-8 flex items-stretch">{ShortcutContent}</div>
        </div>
        <button
          className="ml-auto mb-auto mt-2 mr-2 text-3xl flex items-center gap-2 hover:text-slate-200/50 outline-none focus:outline-none transition-all duration-200"
          onClick={shortcuts.toggle}
        >
          <BsXCircle />
        </button>
      </div>
    </Dialog>
  );
}
