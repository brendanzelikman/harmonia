import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function MediaShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-3"
      shortcuts={[
        <Shortcut shortcut="A" description="Start/Stop Arranging Clips" />,
        <Shortcut shortcut="P" description="Start/Stop Arranging Portals" />,
        <Shortcut shortcut="K" description="Start/Stop Slicing Clips" />,
        <Shortcut shortcut="I + Click" description="Eyedrop a Clip" />,
        <Shortcut shortcut="⌘ + A" description="Select All Media" />,
        <Shortcut shortcut="Esc" description="Clear Media Selection" />,
        <Shortcut
          shortcut="Left Arrow"
          description="Move Selected Media Left"
        />,
        <Shortcut
          shortcut="Right Arrow"
          description="Move Selected Media Right"
        />,
        <Shortcut shortcut="⌘ + C" description="Copy Selected Media" />,
        <Shortcut shortcut="⌘ + X" description="Cut Selected Media" />,
        <Shortcut shortcut="⌘ + V" description="Paste Selected Media" />,
        <Shortcut shortcut="⌘ + D" description="Duplicate Selected Media" />,
        <Shortcut shortcut="Delete" description="Delete Selected Media" />,
      ]}
    />
  );
}
