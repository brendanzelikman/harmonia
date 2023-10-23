import {
  BsVolumeUpFill,
  BsVolumeDownFill,
  BsVolumeOffFill,
  BsHeadphones,
} from "react-icons/bs";
import { PatternTrackProps } from "../PatternTrack";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";

interface PatternTrackStylesProps extends PatternTrackProps {
  isDragging: boolean;
  draggingVolume: boolean;
  draggingPan: boolean;
}

export const usePatternTrackStyles = (props: PatternTrackStylesProps) => {
  const isSmall = props.cell.height < 100;

  // Outer track
  const opacity = props.isDragging ? "opacity-50" : "opacity-100";
  const padding = "w-full h-full p-2 bg-teal-600";
  const text = `text-white ${isSmall ? "text-xs" : "text-sm"}`;
  const outerBorder = "border-b border-b-slate-300";

  // Inner track
  const gradient = "bg-gradient-to-r from-sky-700/80 to-emerald-700/50";
  const innerTrack = "w-full h-full items-center flex";
  const innerBorder = `rounded border-2 ${
    props.isSelected
      ? props.onInstrumentEditor
        ? "border-orange-400"
        : "border-blue-400"
      : "border-emerald-950"
  }`;

  // Audio sliders
  const sliderHeight = props.cell.height - 55;

  // Volume slider
  const volumeSliderTop =
    -sliderHeight * (props.volumePercent / 100) + sliderHeight + 15;
  const volumeIconClass = `${
    props.draggingVolume ? "text-emerald-400" : "text-white"
  } transition-colors duration-200`;
  const VolumeIcon =
    props.volume > -20 ? (
      <BsVolumeUpFill className={volumeIconClass} />
    ) : props.volume > -40 ? (
      <BsVolumeDownFill className={volumeIconClass} />
    ) : (
      <BsVolumeOffFill className={volumeIconClass} />
    );

  // Pan slider
  const panSliderTop =
    -sliderHeight * (props.panRightPercent / 100) + sliderHeight + 15;
  const panIconClass = `${
    props.draggingPan ? "text-teal-400" : "text-white"
  } transition-colors duration-200`;
  const PanIcon = <BsHeadphones className={panIconClass} />;

  // Audio buttons
  const audioButton = `w-6 h-6 rounded-full text-center`;
  const heldKeys = useHeldHotkeys(["y", "u"]);
  const isHoldingY = heldKeys.y;
  const isHoldingU = heldKeys.u;

  // Mute button
  const muteBorder = `border-2 border-rose-500/80`;
  const muteColor = props.mute
    ? "bg-rose-500 text-white"
    : isHoldingY
    ? "bg-rose-400/40 text-shadow"
    : "bg-emerald-600/20";

  // Solo button
  const soloBorder = `border-2 border-yellow-400/80`;
  const soloColor = props.solo
    ? "bg-yellow-400 text-white"
    : isHoldingU
    ? "bg-yellow-400/30 text-shadow"
    : "bg-emerald-600/20";

  // Collapsed mute button
  const collapsedMuteColor = props.mute
    ? "text-rose-400 font-bold"
    : isHoldingY
    ? "text-white font-semibold"
    : "text-slate-200 font-normal";
  const collapsedMuteShadow = isHoldingY ? "text-shadow-lg" : "";
  const collapsedMuteButton = `${collapsedMuteColor} ${collapsedMuteShadow}`;

  // Collapsed solo button
  const collapsedSoloColor = props.solo
    ? "text-yellow-400 font-bold"
    : isHoldingU
    ? "text-white font-semibold"
    : "text-slate-200 font-normal";
  const collapsedSoloShadow = isHoldingU ? "text-shadow-lg" : "";
  const collapsedSoloButton = `${collapsedSoloColor} ${collapsedSoloShadow}`;

  // Instrument editor button
  const instrumentButton = `px-2 border border-orange-400 ${
    props.onInstrumentEditor
      ? "bg-gradient-to-r from-orange-500 to-orange-500/50 background-pulse"
      : ""
  } `;

  return {
    opacity,
    padding,
    text,
    outerBorder,
    gradient,
    innerTrack,
    innerBorder,
    volumeSliderTop,
    panSliderTop,
    VolumeIcon,
    PanIcon,
    audioButton,
    muteBorder,
    muteColor,
    soloBorder,
    soloColor,
    collapsedMuteButton,
    collapsedSoloButton,
    instrumentButton,
  };
};
