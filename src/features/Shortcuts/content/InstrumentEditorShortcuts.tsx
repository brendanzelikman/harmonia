import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function InstrumentEditorShortcuts() {
  return (
    <ShortcutContent
      className="space-y-1"
      shortcuts={[
        <Shortcut shortcut="R" description="Add Reverb" />,
        <Shortcut shortcut="C" description="Add Chorus" />,
        <Shortcut shortcut="P" description="Add Phaser" />,
        <Shortcut shortcut="T" description="Add Tremolo" />,
        <Shortcut shortcut="V" description="Add Vibrato" />,
        <Shortcut shortcut="F" description="Add Filter" />,
        <Shortcut shortcut="E" description="Add Equalizer" />,
        <Shortcut shortcut="D" description="Add Distortion" />,
        <Shortcut shortcut="B" description="Add Bitcrusher" />,
        <Shortcut shortcut="⇧ + F" description="Add Feedback Delay" />,
        <Shortcut shortcut="⇧ + P" description="Add Ping Pong Delay" />,
        <Shortcut shortcut="⇧ + C" description="Add Compressor" />,
        <Shortcut shortcut="L" description="Add Limiter" />,
        <Shortcut shortcut="G" description="Add Gain" />,
        <Shortcut shortcut="W" description="Add Warp" />,
        <Shortcut shortcut="Delete" description="Delete Last Effect" />,
        <Shortcut shortcut="⇧ + Delete" description="Delete All Effects" />,
      ]}
    />
  );
}
