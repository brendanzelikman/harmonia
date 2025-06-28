import classNames from "classnames";
import { useAppDispatch, useAppValue } from "hooks/useRedux";
import { GiJackPlug } from "react-icons/gi";
import { selectSomeTrackId } from "types/Timeline/TimelineSelectors";
import {
  selectPatternTracks,
  selectTrackInstrumentMap,
  selectTrackLabelMap,
} from "types/Track/TrackSelectors";
import { TooltipButton } from "components/TooltipButton";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { getKeyCode, useHeldKeys } from "hooks/useHeldkeys";
import { growTree } from "types/Timeline/TimelineThunks";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { selectHasGame } from "types/Game/GameSelectors";
import {
  NavbarHotkeyInstruction,
  NavbarHotkeyKey,
  NavbarInstructionDescription,
  NavbarPatternBox,
  NavbarPatternDescription,
  NavbarScaleBox,
  NavbarScaleDescription,
} from "./components/NavbarHotkeys";

const numericalKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export const NavbarMixPlay = () => {
  const dispatch = useAppDispatch();
  const holding = useHeldKeys(["m", "s"]);

  const hasTracks = useAppValue(selectHasTracks);
  const hasGame = useAppValue(selectHasGame);
  const patternTracks = useAppValue(selectPatternTracks);
  const selectedTrackId = useAppValue(selectSomeTrackId);
  const instruments = useAppValue(selectTrackInstrumentMap);
  const labels = useAppValue(selectTrackLabelMap);

  // Get the values of the held keys
  const isNumerical = numericalKeys.some((key) => holding[getKeyCode(key)]);
  const m = holding.KeyM;
  const s = holding.KeyS;
  const M = NavbarHotkeyKey("M", m);
  const S = NavbarHotkeyKey("S", s);
  const isMixing = m || s;

  const working = !hasGame && isMixing;
  const isActive = working || hasTracks;

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

  const getZeroLabel = () => {
    if (!isMixing) return "No Effect Available";
    const action = m && s ? "Unmute/Unsolo" : m ? "Unmute" : "Unsolo";
    return `${action} All Tracks`;
  };

  const Number = NavbarHotkeyKey("Press Number", isNumerical, true);

  return (
    <TooltipButton
      direction="vertical"
      active={hasTracks && working}
      freezeInside={working}
      hideRing
      activeLabel={
        <div className="h-[68px] total-center-col">
          <div className="text-base font-light">Mixing Samplers</div>
          <div className="text-slate-400 text-sm">
            (Hold {M}/{S} + {Number})
          </div>
        </div>
      }
      keepTooltipOnClick
      notClickable
      marginLeft={-50}
      onClick={() => !hasTracks && dispatch(growTree())}
      marginTop={0}
      width={350}
      backgroundColor="bg-radial from-slate-900 to-zinc-900"
      borderColor={`border-2 border-amber-500`}
      rounding="rounded-lg"
      className={classNames(
        "shrink-0 relative rounded-full select-none cursor-pointer",
        "flex total-center hover:text-amber-300 p-1 bg-amber-600/60 border border-amber-500 font-light",
        working ? "text-amber-200" : "text-amber-100"
      )}
      label={
        <div className="text-white animate-in fade-in duration-300">
          <div
            data-indent={hasTracks || working}
            className="text-xl data-[indent=true]:pt-2 font-light"
          >
            Mix Sampler Audio
          </div>
          <div
            data-active={isActive}
            className="text-base data-[active=false]:text-sm data-[active=true]:mb-4 text-amber-300/80"
          >
            {!isActive ? (
              hasTracks ? (
                "Select Track, Pattern, or Pose"
              ) : (
                "Create Tree to Unlock Keyboard Gestures"
              )
            ) : (
              <div>(Hold M/S + Press Number)</div>
            )}
          </div>
          {isActive && (
            <div className="flex flex-col w-full gap-2 mt-1.5">
              <NavbarScaleBox>Select Effect</NavbarScaleBox>
              <div className="p-1">
                <p>
                  <NavbarHotkeyInstruction active={m} label="Hold M:" />{" "}
                  <NavbarScaleDescription active={m} label="Toggle Mute" />
                </p>
                <p>
                  <NavbarHotkeyInstruction active={s} label="Hold S:" />{" "}
                  <NavbarScaleDescription active={s} label="Toggle Solo" />
                </p>
              </div>
              <div>
                <NavbarPatternBox>Mix Samplers</NavbarPatternBox>
                <div className="p-1">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
                    (keycode) => (
                      <p
                        key={keycode}
                        className={`${
                          !selectedTrackId ? "opacity-50" : "opacity-100"
                        } normal-case`}
                      >
                        <NavbarInstructionDescription
                          active={(key) => holding[getKeyCode(key)]}
                          keycodes={[keycode]}
                          required={["q", "w", "e", "r", "t", "y"]}
                          label={`Press ${keycode}:`}
                        />{" "}
                        <NavbarPatternDescription
                          active={(key) => holding[getKeyCode(key)]}
                          keycodes={[keycode]}
                          required={["q", "w", "e", "r", "t", "y"]}
                          label={getKeycodeLabel(keycode)}
                        />
                      </p>
                    )
                  )}
                  <p>
                    <NavbarInstructionDescription
                      active={(key) => holding[getKeyCode(key)]}
                      keycodes={["0"]}
                      label="Press 0:"
                    />{" "}
                    <NavbarPatternDescription
                      active={(key) => holding[getKeyCode(key)]}
                      keycodes={["0"]}
                      label={getZeroLabel()}
                    />
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      }
    >
      <GiJackPlug className="text-2xl" />
    </TooltipButton>
  );
};
