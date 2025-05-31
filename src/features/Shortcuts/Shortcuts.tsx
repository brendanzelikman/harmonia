import { Dialog } from "@headlessui/react";
import { useCallback, useEffect, useState } from "react";
import { GlobalShortcuts } from "./ShortcutsGlobal";
import classNames from "classnames";
import { TransportShortcuts } from "./ShortcutsTransport";
import { ToolShortcuts } from "./ShortcutsMotif";
import { TrackShortcuts } from "./ShortcutsTrack";
import { BsXCircle } from "react-icons/bs";
import { useToggle } from "hooks/useToggle";
import { ClipShortcuts } from "./ShortcutsClip";

export const SHORTCUT_TITLE = "Keyboard Shortcuts";

export const SHORTCUTS = [
  { title: "Project Controls", component: <GlobalShortcuts /> },
  { title: "Playback Controls", component: <TransportShortcuts /> },
  { title: "Track Controls", component: <TrackShortcuts /> },
  { title: "Motif Controls", component: <ToolShortcuts /> },
  { title: "Clip Controls", component: <ClipShortcuts /> },
] as const;
export type ShortcutType = (typeof SHORTCUTS)[number]["title"];

export default function Shortcuts() {
  const shortcuts = useToggle("shortcuts");
  const [type, setType] = useState<ShortcutType>(SHORTCUTS[0].title);

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

  return (
    <Dialog
      open={shortcuts.isOpen}
      as="div"
      className="relative"
      onClose={shortcuts.close}
    >
      <div className="fixed flex justify-center inset-0 p-2 z-[180] bg-slate-800/80 text-slate-300 backdrop-blur animate-in fade-in overflow-scroll">
        <div className="w-full h-full flex justify-center flex-1 gap-8">
          <div className="flex flex-col p-8 gap-2">
            <span className="text-4xl font-semibold border-b border-b-slate-400/50 p-4 mt-8 mb-6">
              {SHORTCUT_TITLE}
            </span>
            {SHORTCUTS.map((s) => s.title).map(renderShortcutTypeButton)}
          </div>
          <div className="p-8 my-8 flex items-stretch">
            {SHORTCUTS.find((s) => s.title === type)?.component ?? null}
          </div>
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
