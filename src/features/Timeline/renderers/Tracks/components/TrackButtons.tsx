import classNames from "classnames";
import { TooltipButton } from "components/TooltipButton";
import { memo } from "react";
import { CiRuler } from "react-icons/ci";
import { GiDominoMask, GiMusicalKeyboard } from "react-icons/gi";
import { toggleTrackEditor } from "types/Timeline/TimelineThunks";
import { useSelect, useDispatch } from "hooks/useStore";
import {
  selectIsEditingTrack,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import { PatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import { createScaleTrack } from "types/Track/ScaleTrack/ScaleTrackThunks";
import { ScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import {
  selectPatternTrackById,
  selectTrackInstrument,
} from "types/Track/TrackSelectors";
import {
  toggleTrackMute,
  toggleTrackSolo,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { cancelEvent } from "utils/html";
import { promptUserForScale } from "types/Track/ScaleTrack/ScaleTrackRegex";

export const ScaleTrackButtons = memo((props: { trackId: ScaleTrackId }) => {
  const { trackId } = props;
  const dispatch = useDispatch();
  return (
    <div
      className="grid grid-cols-3 -mr-1 self-end shrink-0 gap-x-1 mt-2 relative"
      draggable
      onDragStart={cancelEvent}
    >
      <TooltipButton
        className={`text-sm size-6 border rounded-full border-sky-500 active:bg-sky-500 select-none`}
        label="Change Scale"
        onClick={(e) => {
          cancelEvent(e);
          dispatch(promptUserForScale(trackId));
        }}
      >
        <GiDominoMask className="text-xl" />
      </TooltipButton>
      <TooltipButton
        className={`text-xl size-6 flex items-center justify-center border rounded-full border-indigo-400 active:bg-indigo-500 select-none`}
        label="Nest Scale"
        onClick={(e) => {
          cancelEvent(e);
          dispatch(
            createScaleTrack({ data: { track: { parentId: trackId } } })
          );
        }}
      >
        <CiRuler className="text-4xl" />
      </TooltipButton>
      <TooltipButton
        className={`text-xl size-6 border rounded-full border-emerald-500 active:bg-emerald-500 select-none`}
        label="Nest Sampler"
        onClick={(e) => {
          cancelEvent(e);
          dispatch(
            createPatternTrack({ data: { track: { parentId: trackId } } })
          );
        }}
      >
        <GiMusicalKeyboard className="rotate-90 text-lg" />
      </TooltipButton>
    </div>
  );
});

export const PatternTrackButtons = memo(
  (props: { trackId: PatternTrackId; collapsed?: boolean }) => {
    const { trackId } = props;
    const dispatch = useDispatch();
    const track = useSelect((_) => selectPatternTrackById(_, trackId));
    const isTrackSelected = useSelect(selectSelectedTrackId) === trackId;
    const isInstrumentEditorOpen = useSelect((_) =>
      selectIsEditingTrack(_, trackId)
    );
    const instrument = useSelect((_) => selectTrackInstrument(_, trackId));
    const onInstrumentEditor = isInstrumentEditorOpen && isTrackSelected;
    const mute = instrument?.mute;
    const solo = instrument?.solo;

    // Return smaller buttons if the track is collapsed
    if (!!props.collapsed) {
      return (
        !!track.collapsed && (
          <div className="text-xs flex gap-1 -mt-1 -mr-0.5">
            <span className={mute ? "text-rose-400" : "text-slate-200"}>M</span>
            <span>•</span>
            <span className={solo ? "text-yellow-400" : "text-slate-200"}>
              S
            </span>
          </div>
        )
      );
    }

    return (
      <div
        className="grid grid-cols-3 self-end mb-1 shrink-0 gap-1 pl-3 pb-1 mt-3 mr-0.5"
        draggable
        onDragStart={cancelEvent}
      >
        <TooltipButton
          className={classNames(
            onInstrumentEditor ? "bg-orange-400" : "bg-transparent",
            `text-lg size-6 border rounded-full border-orange-400 active:bg-orange-400 select-none`
          )}
          label={onInstrumentEditor ? "Close" : "Change Sampler"}
          onClick={(e) => {
            cancelEvent(e);
            dispatch(toggleTrackEditor({ data: trackId }));
          }}
        >
          <GiMusicalKeyboard className="pointer-events-none" />
        </TooltipButton>
        <TooltipButton
          label={mute ? "Unmute Sampler" : "Mute Sampler"}
          className={classNames(
            "size-6 rounded-full text-center border border-red-400",
            { "bg-red-400/60 text-white": mute },
            { "bg-emerald-600/20": !mute }
          )}
          onClick={(e) => dispatch(toggleTrackMute(e.nativeEvent, trackId))}
        >
          <span className="text-sm">M</span>
        </TooltipButton>
        <TooltipButton
          label={solo ? "Unsolo Sampler" : "Solo Sampler"}
          className={classNames(
            "size-6 rounded-full text-center border border-amber-400",
            { "bg-amber-400/60 text-white": solo },
            { "bg-emerald-600/20": !solo }
          )}
          onClick={(e) => {
            cancelEvent(e);
            dispatch(toggleTrackSolo(e.nativeEvent, trackId));
          }}
        >
          <span className="text-sm">S</span>
        </TooltipButton>
      </div>
    );
  }
);
