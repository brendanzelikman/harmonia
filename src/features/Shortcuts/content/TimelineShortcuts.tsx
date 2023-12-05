import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function TimelineShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut shortcut="⇧ + T" description="Scroll to Current Tick" />,
        <Shortcut shortcut="⇧ + Enter" description="Scroll to Start" />,
        <Shortcut shortcut="⌘ + Plus" description="Increase Subdivision" />,
        <Shortcut shortcut="⌘ + Minus" description="Decrease Subdivision" />,
        <Shortcut shortcut="C" description="Toggle Clip Type" />,
        <Shortcut shortcut="A" description="Start/Stop Arranging Clips" />,
        <Shortcut shortcut="Hold I + Click" description="Eyedrop a Clip" />,
        <Shortcut shortcut="⌘ + K" description="Start/Stop Slicing Clips" />,
        <Shortcut shortcut="⌘ + J" description="Start/Stop Merging Clips" />,
        <Shortcut shortcut="⌘ + P" description="Start/Stop Portaling Clips" />,
      ]}
    />
  );
}
