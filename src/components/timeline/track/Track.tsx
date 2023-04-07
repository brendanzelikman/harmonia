import { isPatternTrack, isScaleTrack } from "types/tracks";
import { TrackProps } from ".";
import PatternTrack from "./PatternTrack";
import ScaleTrack from "./ScaleTrack";

export function TrackComponent(props: TrackProps) {
  const { track } = props;
  if (!track) return null;

  if (isScaleTrack(track)) {
    return <ScaleTrack {...props} />;
  }
  if (isPatternTrack(track)) {
    return <PatternTrack {...props} />;
  }
  return null;
}

export const TrackButton = (props: {
  className?: string;
  onClick?: () => void;
  children: JSX.Element;
}) => {
  return (
    <button
      className={`${
        props.className ?? ""
      } flex items-center justify-center rounded min-w-7 h-7 m-1 font-light border`}
      onClick={(e) => {
        props.onClick?.();
        e.currentTarget.blur();
      }}
    >
      {props.children}
    </button>
  );
};
