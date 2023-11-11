import { Transition } from "@headlessui/react";

import { BsCalculator, BsKeyboard, BsPower } from "react-icons/bs";
import { toggleLivePose, toggleLivePoseMode } from "redux/Timeline";
import {
  useProjectDispatch,
  useProjectSelector,
  useProjectDeepSelector,
} from "redux/hooks";
import { selectSelectedPoses, selectLivePoseSettings } from "redux/selectors";

export const ToolkitKeypad = () => {
  const dispatch = useProjectDispatch();

  // Get the poses
  const poses = useProjectDeepSelector(selectSelectedPoses);
  const arePosesSelected = !!poses.length;

  // Get the pose mode
  const poseSettings = useProjectSelector(selectLivePoseSettings);
  const poseMode = poseSettings.mode;
  const isEnabled = poseSettings.enabled;
  const isNumerical = poseMode === "numerical";

  // Get the numerical shortcuts.
  const NumericalShortcuts = () => {
    return (
      <>
        <li className="mx-auto mb-2 font-extrabold">Numerical Shortcuts:</li>
        <li>
          <b>Hold Q:</b> <span>Offset N</span>
        </li>
        <li>
          <b>Hold W:</b> <span>Offset T#1</span>
        </li>
        <li>
          <b>Hold S:</b> <span>Offset T#2</span>
        </li>
        <li>
          <b>Hold X:</b> <span>Offset T#3</span>
        </li>
        <li>
          <b>Hold E:</b> <span>Offset t</span>
        </li>
        <li>
          <b>Hold Shift:</b> <span>Add Octave</span>
        </li>
        <li>
          <b>Hold `:</b> <span>Use Negative</span>
        </li>
        <li>
          <b>Press 1-9:</b> <span>Offset by 1-9</span>
        </li>
        <li>
          <b>Press -:</b>
          <span>Offset by 10</span>
        </li>
        <li>
          <b>Press =:</b> <span>Offset by 11</span>
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
        <li>
          <b>Press A-G:</b> <span>T-5 to T-1</span>
        </li>
        <li>
          <b>Press H:</b> <span>T = 0</span>
        </li>
        <li>
          <b>Press J-{"'"}:</b> <span>N+1 to N+5</span>
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
      <ul className="flex flex-col [&>li>b]:font-extrabold [&>li>span]:float-right absolute inset-0 text-xs w-44 h-fit p-2 -left-16 top-8 bg-fuchsia-600/90 backdrop-blur border-2 border-slate-300 rounded-lg transition-all transform -translate-y-2 pointer-events-none peer-hover:translate-y-0 opacity-0 peer-hover:scale-y-100 peer-hover:opacity-100 duration-300">
        {isNumerical ? <NumericalShortcuts /> : <AlphabeticalShortcuts />}
      </ul>
    );
  };

  // Get the current shortcut icon
  const ShortcutIcon = () => {
    const iconClass = `peer text-xl ${isEnabled ? "hover:text-rose-200" : ""}`;
    return (
      <div
        className={`relative ${isEnabled ? "cursor-pointer" : ""}`}
        onClick={() => dispatch(toggleLivePoseMode())}
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
        onClick={() => dispatch(toggleLivePose())}
      />
    );
  };

  // The transpose label showing the current types of poses available.
  const TransposeLabel = () => {
    return (
      <div className={`w-full flex items-center justify-center space-x-2`}>
        <span className="font-bold hidden xl:block whitespace-nowrap">
          Live Transposition
        </span>
        <ShortcutIcon />
        <PowerButton />
      </div>
    );
  };

  const cursor = !isEnabled ? "cursor-pointer" : "";
  const color = isEnabled
    ? "bg-fuchsia-500/90 border-fuchsia-200/80 text-white"
    : "bg-slate-500/50 border-slate-300 text-slate-300 opacity-75 hover:opacity-100";

  const onClick = () => (!isEnabled ? dispatch(toggleLivePose()) : null);

  return (
    <Transition
      show={arePosesSelected}
      enter="transition-all duration-300"
      enterFrom="opacity-0 scale-0"
      enterTo="opacity-100 scale-100"
      leave="transition-all duration-300"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-0"
      as="div"
      className={`flex h-9 items-center font-nunito font-light text-sm rounded-lg px-2 ${color} ${cursor} border-2 transition-all duration-150 select-none`}
      onClick={onClick}
    >
      <TransposeLabel />
    </Transition>
  );
};
