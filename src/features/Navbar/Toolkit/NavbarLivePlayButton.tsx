import classNames from "classnames";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { BsCalculator, BsKeyboard } from "react-icons/bs";
import { toggleLivePlay, toggleLivePlayMode } from "redux/Timeline";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectLivePlaySettings } from "redux/selectors";
import { NavbarTooltipButton } from "../components";
import { GiMagicPalm } from "react-icons/gi";
import { cancelEvent } from "utils/html";
import { useSubscription } from "providers/subscription";

export const NavbarLivePlayButton = () => {
  const dispatch = useProjectDispatch();
  const { isAtLeastStatus } = useSubscription();

  // Get the pose mode
  const livePlay = useProjectSelector(selectLivePlaySettings);
  const poseMode = livePlay.mode;
  const isEnabled = livePlay.enabled;
  const isNumerical = poseMode === "numerical";

  const heldKeys = useHeldHotkeys([
    "q",
    "w",
    "e",
    "s",
    "x",
    "shift",
    "`",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "-",
    "=",
    "y",
    "u",
    "i",
    "o",
    "p",
    "[",
    "]",
    "a",
    "s",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    ";",
    "'",
    "z",
    "x",
    "c",
    "v",
    "b",
    "n",
    "m",
    ",",
    ".",
    "/",
  ]);
  const isHolding = Object.values(heldKeys).some((v) => !!v);

  // Get the numerical shortcuts.
  const NumericalShortcuts = () => {
    return (
      <>
        <li className="mx-auto mb-2 font-extrabold">
          Using Numerical Shortcuts
        </li>
        <li>
          <b>
            <u>Select Scale</u>
          </b>
        </li>
        <li>
          <b>Hold Q:</b> <span>Chromatic Scale</span>
        </li>
        <li>
          <b>Hold W:</b> <span>Root Track Scale</span>
        </li>
        <li>
          <b>Hold S:</b> <span>Child Track Scale</span>
        </li>
        <li>
          <b>Hold X:</b> <span>Grandchild Track Scale</span>
        </li>
        <li>
          <b>Hold E:</b> <span>Intrinsic Scale</span>
        </li>
        <li className="mt-2">
          <b>
            <u>Apply Offset</u>
          </b>
        </li>
        <li>
          <b>Hold Shift:</b> <span>Add 12 to Offset</span>
        </li>
        <li>
          <b>Hold `:</b> <span>Apply Negative Offset</span>
        </li>
        <li>
          <b>Press 1-9:</b> <span>Apply Offset of 1-9</span>
        </li>
        <li>
          <b>Press 0:</b> <span>Reset Offset</span>
        </li>
        <li className="mt-2">
          <b>
            <u>Mix Tracks</u>
          </b>
        </li>
        <li>
          <b>Hold Y:</b> <span>Mute Target</span>
        </li>
        <li>
          <b>Hold U:</b> <span>Solo Target</span>
        </li>
        <li>
          <b>Press 1-9:</b> <span>Target Pattern Track</span>
        </li>
        <li>
          <b>Press 0:</b> <span>Unmute/Unsolo All Tracks</span>
        </li>
      </>
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

  // Get the current shortcut menu
  const ShortcutMenu = () => {
    return (
      <ul className="flex flex-col [&>li>b]:font-extrabold [&>li>span]:float-right absolute inset-0 text-sm w-64 h-fit p-3 -left-16 top-8 bg-fuchsia-500/70 backdrop-blur border border-slate-300 rounded-lg transition-all transform -translate-y-2 pointer-events-none peer-hover:translate-y-0 opacity-0 peer-hover:scale-y-100 peer-hover:delay-200 peer-hover:opacity-100 duration-300">
        {isNumerical ? <NumericalShortcuts /> : <AlphabeticalShortcuts />}
      </ul>
    );
  };

  // Get the current shortcut icon
  const ShortcutIcon = () => {
    const iconClass = `peer text-xl ${
      isHolding ? "text-white" : "text-slate-300/80"
    } ${isEnabled ? "hover:text-rose-200" : ""}`;
    return (
      <div
        className={`relative z-[60] text-left ${
          isEnabled ? "cursor-pointer" : ""
        }`}
        onClick={(e) => {
          cancelEvent(e);
          dispatch(toggleLivePlayMode());
        }}
      >
        {isNumerical ? (
          <BsCalculator className={iconClass} />
        ) : (
          <BsKeyboard className={iconClass} />
        )}
        {isEnabled && <ShortcutMenu />}
      </div>
    );
  };

  // The transpose label showing the current types of poses available.
  const LivePlayButton = () => {
    return (
      <NavbarTooltipButton
        className={`w-full flex items-center justify-center space-x-2 border-0 cursor-pointer text-xl ${
          isEnabled ? "px-3 text-slate-200" : "px-2 text-slate-300"
        }`}
        label={isEnabled ? "Disable Live Play" : "Enable Live Play"}
        onClick={() => dispatch(toggleLivePlay())}
      >
        <GiMagicPalm />
        {isEnabled && (
          <div className={classNames("text-sm font-light")}>Live Play</div>
        )}
        {isEnabled && <ShortcutIcon />}
      </NavbarTooltipButton>
    );
  };
  if (!isAtLeastStatus("maestro")) return null;

  return (
    <div
      className={classNames(
        "relative min-w-8 w-max h-9",
        "flex items-center rounded-full font-nunito font-light",
        "ring-1 select-none transition-all duration-300",
        isEnabled ? "ring-fuchsia-200/80" : "ring-slate-500/80",
        isEnabled
          ? "bg-gradient-radial from-fuchsia-400/80 to-fuchsia-600/80"
          : "cursor-pointer bg-gradient-radial from-slate-500 to-slate-800 active:ring-4"
      )}
    >
      {LivePlayButton()}
    </div>
  );
};
