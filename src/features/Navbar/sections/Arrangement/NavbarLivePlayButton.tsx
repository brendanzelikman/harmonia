import classNames from "classnames";
import { useDeep, useProjectSelector } from "types/hooks";
import { NavbarTooltipButton } from "../../components";
import { GiHand } from "react-icons/gi";
import { useAuth } from "providers/auth";
import { selectIsLive } from "types/Timeline/TimelineSelectors";
import { selectClipIds } from "types/Clip/ClipSelectors";

export const NavbarLivePlayButton = () => {
  const { isAtLeastRank } = useAuth();
  const hasClips = useDeep(selectClipIds).length > 0;
  const isLive = useProjectSelector(selectIsLive);

  // Get the numerical shortcuts.
  const NumericalShortcuts = () => {
    return (
      <div className="py-2">
        <p className="font-extrabold">Live Play Shortcuts</p>
        <p className="pb-2 mb-2 font-thin text-xs">As Easy As 1-2-3</p>
        <li className="list-decimal">
          <b>
            <u>Hold to Select a Scale</u>
          </b>
        </li>
        <p>
          <span className="font-bold">Hold Q:</span>{" "}
          <span className="font-thin text-sky-300">Parent Track Scale</span>
        </p>
        <p>
          <span className="font-bold">Hold W:</span>{" "}
          <span className="font-thin text-sky-300">Child Track Scale</span>
        </p>
        <p>
          <span className="font-bold">Hold E:</span>{" "}
          <span className="font-thin text-sky-300">Grandchild Track Scale</span>
        </p>
        <p>
          <b className="font-bold">Hold R:</b>{" "}
          <span className="font-thin text-sky-300">Intrinsic Offset</span>
        </p>
        <p>
          <span className="font-bold">Hold T:</span>{" "}
          <span className="font-thin text-sky-300">Chromatic Offset</span>
        </p>
        <p>
          <span className="font-bold">Hold Y:</span>{" "}
          <span className="font-thin text-sky-300">Octave Offset</span>
        </p>
        <li className="mt-2 list-decimal">
          <b>
            <u>Press to Apply an Offset</u>
          </b>
        </li>
        <p>
          <span className="font-bold">Hold `:</span>{" "}
          <span className="font-thin text-fuchsia-300">
            Apply Negative Offset
          </span>
        </p>
        <p>
          <span className="font-bold">Hold V:</span>{" "}
          <span className="font-thin text-fuchsia-300">
            Show Voice Leadings
          </span>
        </p>
        <p>
          <span className="font-bold">Press 1-9:</span>{" "}
          <span className="font-thin text-fuchsia-300">
            Apply Offset of 1-9
          </span>
        </p>
        <p>
          <span className="font-bold">Press 0:</span>{" "}
          <span className="font-thin text-fuchsia-300">Reset Offset</span>
        </p>
        <p>
          {" "}
          <span className="font-bold">Press Z:</span>{" "}
          <span className="font-thin text-fuchsia-300">Remove Offset</span>
        </p>
        <li className="mt-2 list-decimal">
          <b>
            <u>Mute/Solo Pattern Tracks</u>
          </b>
        </li>
        <p>
          <span className="font-bold">Hold M:</span>{" "}
          <span className="font-thin text-emerald-300">Prepare to Mute</span>
        </p>
        <p>
          <span className="font-bold">Hold S:</span>{" "}
          <span className="font-thin text-emerald-300">Prepare to Solo</span>
        </p>
        <p>
          <span className="font-bold">Press M + 1-9:</span>{" "}
          <span className="font-thin text-emerald-300">Toggle Track Mute</span>
        </p>
        <p>
          <span className="font-bold">Press S + 1-9:</span>{" "}
          <span className="font-thin text-emerald-300">Toggle Track Solo</span>
        </p>
        <p>
          <span className="font-bold">Press 0:</span>{" "}
          <span className="font-thin text-emerald-300">
            Unmute/Unsolo All Tracks
          </span>
        </p>
      </div>
    );
  };

  // Get the alphabetical shortcuts.
  const AlphabeticalShortcuts = () => {
    return (
      <>
        <li className="mx-auto mb-2 font-extrabold">
          Using Alphabetical Shortcuts
        </li>
        <li>
          <b>
            <u>Chromatic Scale</u>
          </b>
        </li>
        <li>
          <b>Press Q-T:</b> <span>N-5 to N-1</span>
        </li>
        <li>
          <b>Press Y:</b> <span>N = 0</span>
        </li>
        <li>
          <b>Press U-{"["}:</b> <span>N+1 to N+5</span>
        </li>
        <li className="mt-2">
          <b>
            <u>Root Scale</u>
          </b>
        </li>
        <li>
          <b>Press A-G:</b> <span>T-5 to T-1</span>
        </li>
        <li>
          <b>Press H:</b> <span>T = 0</span>
        </li>
        <li>
          <b>Press J-{"'"}:</b> <span>N+1 to N+5</span>
        </li>
        <li className="mt-2">
          <b>
            <u>Intrinsic Scale</u>
          </b>
        </li>
        <li>
          <b>Press Z-B:</b> <span>t-5 to t-1</span>
        </li>
        <li>
          <b>Press N:</b> <span>t = 0</span>
        </li>
        <li>
          <b>Press M-{"/"}:</b> <span>t+1 to t+4</span>
        </li>
      </>
    );
  };

  // The transpose label showing the current types of poses available.
  const LivePlayButton = (
    <NavbarTooltipButton
      disabled={!hasClips}
      keepTooltipOnClick
      notClickable
      borderColor="border-fuchsia-500"
      className={`${hasClips ? `cursor-pointer` : "opacity-50"} p-1.5`}
      label={
        isLive
          ? NumericalShortcuts()
          : "Select a Pose Clip and Its Track to Go Live"
      }
    >
      <GiHand className="select-none pointer-events-none" />
    </NavbarTooltipButton>
  );

  const isDisabled = !isAtLeastRank("maestro");
  if (isDisabled) return null;

  return (
    <div
      className={classNames(
        "relative min-w-8 w-max h-9",
        "flex items-center rounded-full font-nunito font-light",
        "ring-1 select-none transition-all duration-300 cursor-",
        isLive
          ? "bg-gradient-radial ring-fuchsia-300/80 from-fuchsia-400/80 to-fuchsia-600/80"
          : "ring-fuchsia-500/50 bg-gradient-radial from-fuchsia-500/50 to-slate-950"
      )}
    >
      {LivePlayButton}
    </div>
  );
};
