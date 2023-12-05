import classNames from "classnames";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";

import { BsCalculator, BsKeyboard, BsPower } from "react-icons/bs";
import { toggleLivePlay, toggleLivePlayMode } from "redux/Timeline";
import {
  useProjectDispatch,
  useProjectSelector,
  useProjectDeepSelector,
} from "redux/hooks";
import {
  selectSelectedPoseClips,
  selectLivePlaySettings,
} from "redux/selectors";

export const NavbarLivePlayButton = () => {
  const dispatch = useProjectDispatch();

  // Get the poses
  const poses = useProjectDeepSelector(selectSelectedPoseClips);
  const arePosesSelected = !!poses.length;

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
  const isHolding = Object.values(heldKeys).some((v) => v);

  // Get the numerical shortcuts.
  const NumericalShortcuts = () => {
    return (
      <>
        <li className="mx-auto mb-2 font-extrabold">Numerical Shortcuts:</li>
        <li>
          <b>Hold Q:</b> <span>Chromatic Offset</span>
        </li>
        <li>
          <b>Hold W:</b> <span>Parent Track #1 Offset</span>
        </li>
        <li>
          <b>Hold S:</b> <span>Parent Track #2 Offset</span>
        </li>
        <li>
          <b>Hold X:</b> <span>Parent Track #3 Offset</span>
        </li>
        <li>
          <b>Hold E:</b> <span>Chordal Offset</span>
        </li>
        <li className="mt-2">
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
          <b>Hold Y:</b> <span>Mute Pattern Track</span>
        </li>
        <li>
          <b>Hold U:</b> <span>Solo Pattern Track</span>
        </li>
        <li>
          <b>Press 1-9:</b> <span>Apply to Pattern Track</span>
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
        <li className="mx-auto mb-2 font-extrabold">Alphabetical Shortcuts:</li>
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
          <b>Press A-G:</b> <span>T-5 to T-1</span>
        </li>
        <li>
          <b>Press H:</b> <span>T = 0</span>
        </li>
        <li>
          <b>Press J-{"'"}:</b> <span>N+1 to N+5</span>
        </li>
        <li className="mt-2">
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
      <ul className="flex flex-col [&>li>b]:font-extrabold [&>li>span]:float-right absolute inset-0 text-sm w-64 h-fit p-3 -left-16 top-8 bg-fuchsia-500/70 backdrop-blur border-2 border-slate-300 rounded-lg transition-all transform -translate-y-2 pointer-events-none peer-hover:translate-y-0 opacity-0 peer-hover:scale-y-100 peer-hover:opacity-100 duration-300">
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
        className={`relative ${isEnabled ? "cursor-pointer" : ""}`}
        onClick={() => dispatch(toggleLivePlayMode())}
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

  // Get the power button
  const PowerButton = () => {
    return (
      <BsPower
        className={`cursor-pointer text-xl ${
          isEnabled
            ? "text-slate-200 hover:text-pink-300"
            : "pointer-events-none text-slate-300"
        }`}
        onClick={() => dispatch(toggleLivePlay())}
      />
    );
  };

  // The transpose label showing the current types of poses available.
  const TransposeLabel = () => {
    return (
      <div className={`w-full flex items-center justify-center space-x-2`}>
        <ShortcutIcon />
        <span>Live Play</span>
        <PowerButton />
      </div>
    );
  };

  const onClick = () => (!isEnabled ? dispatch(toggleLivePlay()) : null);
  const buttonClass = classNames(
    "h-9 text-sm rounded-md mx-1",
    "flex items-center font-nunito font-light",
    "px-3 ring-1 ring-slate-300/80 select-none",
    "transition-all",
    isEnabled && arePosesSelected
      ? "animate-in fade-in duration-300"
      : "duration-300",
    isEnabled && arePosesSelected
      ? "opacity-100"
      : "opacity-0 hover:opacity-100",
    isEnabled
      ? "bg-gradient-radial from-fuchsia-400/80 to-fuchsia-600/80"
      : "cursor-pointer bg-gradient-radial from-slate-500/50 to-slate-900 active:ring"
  );

  return (
    <div className={buttonClass} onClick={onClick}>
      <TransposeLabel />
    </div>
  );
};
