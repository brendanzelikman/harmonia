import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function PoseEditorShortcuts() {
  return (
    <ShortcutContent
      className="space-y-1"
      shortcuts={[
        <Shortcut shortcut="A" description="Add New Vector" />,
        <Shortcut
          shortcut="Delete"
          description="Delete Selected or Last Vector"
        />,
        <Shortcut shortcut="⇧ + Delete" description="Clear Stream" />,
        <Shortcut shortcut="R" description="Repeat Stream" />,
        <Shortcut shortcut="1" description="Add Whole Note Vector" />,
        <Shortcut shortcut="2" description="Add Half Note Vector" />,
        <Shortcut shortcut="3" description="Add Quarter Note Vector" />,
        <Shortcut shortcut="4" description="Add Eighth Note Vector" />,
        <Shortcut shortcut="5" description="Add 16th Note Vector" />,
        <Shortcut shortcut="6" description="Add 32nd Note Vector" />,
        <Shortcut shortcut="7" description="Add 64th Note Vector" />,
        <Shortcut shortcut="0" description="Clear Selected Offset" />,
        <Shortcut
          shortcut="Up Arrow"
          description="Increment Selected Offset"
        />,
        <Shortcut
          shortcut="Down Arrow"
          description="Decrement Selected Offset"
        />,
        <Shortcut
          shortcut="Left Arrow"
          description="Select Previous Vector ID"
        />,
        <Shortcut shortcut="Right Arrow" description="Select Next Vector ID" />,
        <Shortcut shortcut="," description="Switch Edit State" />,
      ]}
    />
  );
}
