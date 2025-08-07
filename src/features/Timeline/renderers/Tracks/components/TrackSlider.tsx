import { InputHTMLAttributes, useCallback, useState } from "react";
import { cancelEvent } from "utils/event";
import { omit, throttle } from "lodash";
import { percentize } from "utils/math";
import classNames from "classnames";
import {
  BsVolumeUpFill,
  BsVolumeDownFill,
  BsVolumeOffFill,
  BsHeadphones,
} from "react-icons/bs";
import { updateInstrument } from "types/Instrument/InstrumentSlice";
import {
  MIN_VOLUME,
  MAX_VOLUME,
  DEFAULT_VOLUME,
  VOLUME_STEP,
  MAX_PAN,
  MIN_PAN,
  DEFAULT_PAN,
  PAN_STEP,
} from "utils/constants";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { selectCellHeight } from "types/Timeline/TimelineSelectors";
import { selectTrackInstrument } from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  height: number;
  icon: JSX.Element;
  showTooltip: boolean;
  tooltipTop: number;
  tooltipClassName: string;
  tooltipContent: string;
}
export const TrackSlider = (props: SliderProps) => {
  const { height, icon } = props;

  const padding = 50;
  const width = height - padding;
  const marginTop = 0.5 * width - 10;
  const transform = `rotate(270deg) translate(30px,0)`;

  const inputProps = omit(props, [
    "height",
    "icon",
    "showTooltip",
    "tooltipTop",
    "tooltipClassName",
    "tooltipContent",
  ]);
  return (
    <>
      <div className="flex w-8 flex-col items-center text-slate-300">
        {icon && <span className="text-sm mb-8">{icon}</span>}
        <input
          {...inputProps}
          style={{ width, marginTop, transform }}
          type="range"
          onDoubleClick={(e) => {
            props.onDoubleClick?.(e);
            cancelEvent(e);
          }}
        />
      </div>
      {props.showTooltip && (
        <div
          style={{ top: props.tooltipTop }}
          className={`${
            props.tooltipClassName ?? ""
          } absolute left-7 w-16 h-5 flex font-semibold items-center justify-center border border-slate-300 rounded text-xs`}
        >
          {props.tooltipContent}
        </div>
      )}
    </>
  );
};

export const VolumeSlider = (props: { trackId: TrackId }) => {
  const dispatch = useAppDispatch();
  const instrument = useAppValue((_) =>
    selectTrackInstrument(_, props.trackId)
  );
  const cellHeight = useAppValue(selectCellHeight);
  const [draggingVolume, setDraggingVolume] = useState(false);

  const id = instrument?.id;

  const setVolume = useCallback(
    throttle((volume: number) => {
      if (id === undefined) return;
      dispatch(updateInstrument({ data: { id, update: { volume } } }));
    }, 100),
    [id]
  );
  if (!instrument) return null;

  const volume = instrument?.volume ?? DEFAULT_VOLUME;
  const volumePercent = percentize(volume, MIN_VOLUME, MAX_VOLUME);
  const sliderHeight = cellHeight - 55;
  const sliderTop = -sliderHeight * (volumePercent / 100) + sliderHeight + 15;

  let IconType = BsVolumeOffFill;
  if (volume > -40) IconType = BsVolumeDownFill;
  if (volume > -20) IconType = BsVolumeUpFill;

  const textColor = draggingVolume ? "text-emerald-400" : "text-white";

  return (
    <div className="w-5 h-full z-[90] relative">
      <TrackSlider
        className={`h-5 accent-emerald-500`}
        value={volume}
        height={cellHeight}
        icon={<IconType className={`transition-colors ${textColor}`} />}
        min={MIN_VOLUME}
        max={MAX_VOLUME - VOLUME_STEP}
        step={VOLUME_STEP}
        onChange={(e) => setVolume(e.target.valueAsNumber)}
        onDoubleClick={() => setVolume(DEFAULT_VOLUME)}
        onMouseDown={() => setDraggingVolume(true)}
        onMouseUp={() => setDraggingVolume(false)}
        showTooltip={draggingVolume}
        tooltipTop={sliderTop}
        tooltipClassName="bg-emerald-700"
        tooltipContent={`${volume.toFixed(0)}dB`}
      />
    </div>
  );
};

export const PanSlider = (props: { trackId: TrackId }) => {
  const dispatch = useAppDispatch();
  const [draggingPan, setDraggingPan] = useState(false);
  const cellHeight = useAppValue(selectCellHeight);
  const instrument = useAppValue((_) =>
    selectTrackInstrument(_, props.trackId)
  );
  const id = instrument?.id;

  // Update the instrument's pan when the slider changes
  const onChange = useCallback(
    throttle((pan: number) => {
      if (id === undefined) return;
      dispatch(updateInstrument({ data: { id, update: { pan } } }));
    }, 100),
    [id]
  );

  if (!instrument) return null;

  const pan = instrument.pan ?? DEFAULT_PAN;
  const sliderHeight = cellHeight - 55;

  /** The Pattern Track pan slider controls the pan of the track's instrument. */
  const leftPercent = percentize(pan, MAX_PAN, MIN_PAN);
  const rightPercent = percentize(pan, MIN_PAN, MAX_PAN);
  const sliderTop = -sliderHeight * (rightPercent / 100) + sliderHeight + 15;

  // Fade to teal when dragging
  const iconClass = classNames(
    "transition-colors",
    { "text-teal-400": draggingPan },
    { "text-white": !draggingPan }
  );

  return (
    <div className="w-5 h-full z-[89] relative">
      <TrackSlider
        className={`h-5 accent-teal-400`}
        height={cellHeight}
        icon={
          <BsHeadphones
            className={iconClass}
            style={{ rotate: `${pan * -90}deg` }}
          />
        }
        value={pan}
        min={MIN_PAN}
        max={MAX_PAN}
        step={PAN_STEP}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        onDoubleClick={() => onChange(DEFAULT_PAN)}
        onMouseDown={() => setDraggingPan(true)}
        onMouseUp={() => setDraggingPan(false)}
        showTooltip={draggingPan}
        tooltipTop={sliderTop}
        tooltipClassName="bg-teal-700"
        tooltipContent={`${leftPercent}L • ${rightPercent}R`}
      />
    </div>
  );
};

export const TrackSliders = (props: { show: boolean; trackId: TrackId }) => {
  if (!props.show) return null;
  return (
    <div className="flex-shrink-0 mr-2 z-50">
      <div className="flex" draggable onDragStart={cancelEvent}>
        <VolumeSlider {...props} />
        <PanSlider {...props} />
      </div>
    </div>
  );
};
