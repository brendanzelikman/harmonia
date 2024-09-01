import { useAuth } from "providers/auth";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function GlobalShortcuts() {
  const { isProdigy } = useAuth();
  return (
    <ShortcutContent
      className="text-lg space-y-3"
      shortcuts={[
        <Shortcut shortcut="⌘ + S" description="Save Project" />,
        <Shortcut shortcut="⌘ + O" description="Open Project" />,
        <Shortcut shortcut="⌘ + ⌥ + N" description="Open New Project" />,
        <Shortcut shortcut="⌘ + ⇧ + P" description="Go To Projects" />,
        <Shortcut shortcut="⌘ + Z" description="Undo Action" />,
        <Shortcut shortcut="⌘ + ⇧ + Z" description="Redo Action" />,
        !isProdigy ? (
          <Shortcut shortcut="⌘ + ⌥ + M" description="Export Project to MIDI" />
        ) : null,
        <Shortcut shortcut="⌘ + ⌥ + W" description="Export Project to WAV" />,
        <Shortcut shortcut="Esc" description="Close Editor" />,
        <Shortcut shortcut="⌘ + ⇧ + F" description="Toggle Fullscreen" />,
        <Shortcut shortcut="⌘ + D" description="Toggle Diary" />,
        <Shortcut shortcut="⌘ + ," description="Toggle Settings" />,
        <Shortcut shortcut="?" description="Toggle Shortcuts" />,
      ]}
    />
  );
}
