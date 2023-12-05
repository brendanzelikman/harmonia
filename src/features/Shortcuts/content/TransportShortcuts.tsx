import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function TransportShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut shortcut="Space" description="Play/Pause Transport" />,
        <Shortcut shortcut="Enter" description="Stop Transport" />,
        <Shortcut shortcut="Left Arrow" description="Seek to Previous Tick" />,
        <Shortcut shortcut="Right Arrow" description="Seek to Next Tick" />,
        <Shortcut shortcut="⇧ + R" description="Start/Stop Recording" />,
        <Shortcut shortcut="⇧ + L" description="Start/Stop Looping" />,
        <Shortcut shortcut="S + Click" description="Set Loop Start" />,
        <Shortcut shortcut="E + Click" description="Set Loop End" />,
        <Shortcut shortcut="⌘ + ⇧ + M" description="Toggle Mute" />,
        <Shortcut shortcut="⌘ + ," description="Change Tempo/Meter" />,
      ]}
    />
  );
}
