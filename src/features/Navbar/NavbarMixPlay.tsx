import { useAppValue } from "hooks/useRedux";
import { GiJackPlug, GiJoystick } from "react-icons/gi";
import {
  selectPatternTracks,
  selectTrackInstrumentMap,
  selectTrackLabelMap,
} from "types/Track/TrackSelectors";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { getKeyCode, useHeldKeys } from "hooks/useHeldkeys";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import {
  NavbarHotkeyInstruction,
  NavbarHotkeyKey,
  NavbarPatternDescription,
} from "./components/NavbarHotkeys";
import {
  NavbarActionButton,
  NavbarActionButtonOption,
} from "./components/NavbarAction";
import { useMemo } from "react";

const numericalKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const NavbarMixPlay = () => {
  const holding = useHeldKeys(["m", "s"]);
  const hasTracks = useAppValue(selectHasTracks);
  const patternTracks = useAppValue(selectPatternTracks);
  const instruments = useAppValue(selectTrackInstrumentMap);
  const labels = useAppValue(selectTrackLabelMap);

  // Get the values of the held keys
  const m = holding.KeyM;
  const s = holding.KeyS;
  const M = NavbarHotkeyKey("Hold M: ", m);
  const S = NavbarHotkeyKey("Hold S: ", s);
  const isMixing = m || s;

  const getKeycodeLabel = (keycode: string) => {
    if (!isMixing) return "No Effect Available";
    const number = parseInt(keycode);
    const track = patternTracks.at(number - 1);
    if (!track) return "No Sampler Available";
    const instrument = instruments[track.id];
    if (!instrument) return "No Track Instrument";
    const { mute, solo } = instrument;
    let action = "";
    if (m) {
      action += mute ? "Unmute" : "Mute";
    }
    if (m && s) action += "/";
    if (s) {
      action += solo ? "Unsolo" : "Solo";
    }
    const label = labels[track?.id];
    const name = getInstrumentName(instrument.key);
    return `${action} Sampler ${label} (${name})`;
  };

  const zeroLabel = useMemo(() => {
    if (!isMixing) return "No Effect Available";
    const action = m && s ? "Unmute/Unsolo" : m ? "Unmute" : "Unsolo";
    return `${action} All Tracks`;
  }, [m, s, isMixing]);

  return (
    <NavbarActionButton
      title="Gesture - Dynamics"
      subtitle="Apply Mute and Solo to Samplers"
      subtitleClass="text-amber-400"
      Icon={<GiJackPlug className="text-2xl" />}
      background="bg-radial from-amber-900/80 to-amber-500/80"
      borderColor="border-amber-500"
      minWidth="min-w-72"
    >
      <NavbarActionButtonOption
        title="Select Effect"
        Icon={<GiJackPlug className="ml-auto text-2xl" />}
        subtitle={
          <ul>
            <li>
              {M}
              <span className="text-sky-400">Toggle Mute</span>
            </li>
            <li>
              {S}
              <span className="text-sky-400">Toggle Solo</span>
            </li>
          </ul>
        }
        stripe="border-b-sky-500"
        readOnly
      />
      <NavbarActionButtonOption
        title="Mix Samplers"
        Icon={<GiJoystick className="ml-auto text-2xl" />}
        subtitle={
          <ul>
            {numericalKeys.map((keycode) => (
              <li key={keycode}>
                <NavbarHotkeyInstruction label={`Press ${keycode}:`} />{" "}
                <NavbarPatternDescription
                  active={(key) => holding[getKeyCode(key)]}
                  keycodes={[keycode]}
                  required={["q", "w", "e", "r", "t", "y"]}
                  label={getKeycodeLabel(keycode)}
                />
              </li>
            ))}
            <li>
              Press 0: <span className="text-emerald-300">{zeroLabel}</span>
            </li>
          </ul>
        }
        stripe="border-b-emerald-500"
        readOnly={!hasTracks}
      />
    </NavbarActionButton>
  );
};
