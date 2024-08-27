import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function PatternEditorShortcuts() {
  return (
    <ShortcutContent
      className="space-y-[3px]"
      shortcuts={[
        <Shortcut shortcut="A" description="Start/Stop Adding Notes" />,
        <Shortcut shortcut="C" description="Show/Hide Cursor" />,
        <Shortcut
          shortcut="Left/Right Arrow"
          description="Move Cursor Left/Right"
        />,
        <Shortcut
          shortcut="Up/Down Arrow"
          description="Move Pattern by Step"
        />,
        <Shortcut
          shortcut="Shift + Up/Down Arrow"
          description="Move Pattern by Octave"
        />,
        <Shortcut shortcut="X" description="Anchor Selected Note" />,
        <Shortcut shortcut="Delete" description="Start/Stop Removing Notes" />,
        <Shortcut shortcut="⇧ + Delete" description="Clear All Notes" />,
        <Shortcut shortcut="⇧ + Space" description="Play Pattern" />,
        <Shortcut shortcut="1 to 7" description="Select Note Duration" />,
        <Shortcut shortcut="0" description="Input Rest" />,
        <Shortcut shortcut="N" description="Input Note" />,
        <Shortcut shortcut="T" description="Toggle Triplet" />,
        <Shortcut shortcut="." description="Toggle Dotted" />,
        <Shortcut shortcut="R" description="Repeat Pattern" />,
        <Shortcut shortcut="," description="Continue Pattern" />,
        <Shortcut shortcut="⌘ + Plus" description="Augment Pattern" />,
        <Shortcut shortcut="⌘ + Minus" description="Diminish Pattern" />,
      ]}
    />
  );
}
