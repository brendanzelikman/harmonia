import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function TransportShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-5"
      shortcuts={[
        <Shortcut shortcut="Space" description="Play/Pause Transport" />,
        <Shortcut shortcut="Enter" description="Stop Transport" />,
        <Shortcut
          shortcut="Left Arrow"
          description="Seek to Previous Subdivision"
        />,
        <Shortcut
          shortcut="Right Arrow"
          description="Seek to Next Subdivision"
        />,
        <Shortcut
          shortcut="⇧ + Left Arrow"
          description="Scrub to Previous Tick"
        />,
        <Shortcut
          shortcut="⇧ + Right Arrow"
          description="Scrub to Next Tick"
        />,
        <Shortcut shortcut="⌘ + ⇧ + M" description="Toggle Mute" />,
        <Shortcut shortcut="⌥ + ⇧ + R" description="Toggle Recording" />,
        <Shortcut shortcut="⌥ + ⇧ + L" description="Toggle Loop" />,
        <Shortcut shortcut="S + Click" description="Set Loop Start" />,
        <Shortcut shortcut="E + Click" description="Set Loop End" />,
      ]}
    />
  );
}
