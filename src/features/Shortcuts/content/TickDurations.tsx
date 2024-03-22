import * as _ from "utils/durations";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";

export function TickDurations() {
  const durationShortcuts = _.STRAIGHT_DURATION_TYPES.map((type) => {
    const straightDuration = _.DURATION_TICKS[type];
    const tripletDuration = _.DURATION_TICKS[type] * 1.5;
    const dottedDuration = _.DURATION_TICKS[type] / 1.5;
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
        ...durationShortcuts,
      ]}
    />
  );
}
