import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function TrackShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-4"
      shortcuts={[
        <Shortcut shortcut="⇧ + P" description="Create Pattern Track" />,
        <Shortcut shortcut="⇧ + S" description="Create Scale Track" />,
        <Shortcut shortcut="⌘ + ⇧ + S" description="Insert Scale Track" />,
        <Shortcut shortcut="," description="Collapse/Expand Track" />,
        <Shortcut shortcut="⌘ + ," description="Collapse/Expand Parents" />,
        <Shortcut
          shortcut="⌘ + ⇧ + ,"
          description="Collapse/Expand Children"
        />,
        <Shortcut shortcut="Up Arrow" description="Select Previous Track" />,
        <Shortcut shortcut="Down Arrow" description="Select Next Track" />,
        <Shortcut shortcut="⌘ + Delete" description="Delete Selected Track" />,
        <Shortcut shortcut="C" description="Toggle Motif Type" />,
        <Shortcut shortcut="+" description="Create New Motif" />,
        <Shortcut shortcut="⌘ + E" description="Toggle Motif Editor" />,
      ]}
    />
  );
}
