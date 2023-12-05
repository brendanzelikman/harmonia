import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function ScaleEditorShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut shortcut="A" description="Start/Stop Adding Notes" />,
        <Shortcut shortcut="Delete" description="Start/Stop Removing Notes" />,
        <Shortcut shortcut="⇧ + Delete" description="Clear All Notes" />,
        <Shortcut shortcut="⇧ + Space" description="Play Scale" />,
        <Shortcut shortcut="⇧ + T" description="Transpose Scale" />,
        <Shortcut shortcut="⇧ + R" description="Rotate Scale" />,
        <Shortcut shortcut="Up Arrow" description="Transpose 1 Step Up" />,
        <Shortcut shortcut="Down Arrow" description="Transpose 1 Step Down" />,
        <Shortcut shortcut="Left Arrow" description="Rotate 1 Step Down" />,
        <Shortcut shortcut="Right Arrow" description="Rotate 1 Step Up" />,
      ]}
    />
  );
}
