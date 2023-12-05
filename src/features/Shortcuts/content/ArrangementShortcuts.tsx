import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function ArrangementShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-5"
      shortcuts={[
        <Shortcut shortcut="Up Arrow" description="Select Previous Track" />,
        <Shortcut shortcut="Down Arrow" description="Select Next Track" />,
        <Shortcut shortcut="⌘ + A" description="Select All Media" />,
        <Shortcut shortcut="Esc" description="Clear Selection" />,
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
