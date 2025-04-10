import * as _ from "utils/duration";
import { Shortcut } from "./components/ShortcutsItem";
import { ShortcutContent } from "./components/ShortcutsContent";
import { useSelect } from "hooks/useStore";
import { selectTransportBPM } from "types/Transport/TransportSelectors";

export function TickDurations() {
  const bpm = useSelect(selectTransportBPM);
  const durationShortcuts = _.STRAIGHT_DURATION_TYPES.map((type) => {
    const straightDuration = _.DURATION_TICKS[type];
    const tripletDuration = (_.DURATION_TICKS[type] * 2) / 3;
    const dottedDuration = _.DURATION_TICKS[type] * 1.5;
    return (
      <Shortcut
        key={type}
        shortcut={`${straightDuration} / ${tripletDuration} / ${dottedDuration}`}
        description={`${type} / Triplet / Dotted`}
      />
    );
  });

  return (
    <ShortcutContent
      className="text-lg space-y-8 capitalize"
      shortcuts={[
        <Shortcut
          shortcut={`${_.PPQ}`}
          description="Pulses Per Quarter Note (PPQ)"
        />,
        <Shortcut
          shortcut={String(_.secondsToTicks(1, bpm))}
          description={`1 Second (${bpm} BPM)`}
        />,
        ...durationShortcuts,
      ]}
    />
  );
}
