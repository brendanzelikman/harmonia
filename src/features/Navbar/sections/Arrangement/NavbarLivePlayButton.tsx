import classNames from "classnames";
import { useDeep, useProjectDispatch, useProjectSelector } from "types/hooks";
import { NavbarTooltipButton } from "../../components";
import { GiHand } from "react-icons/gi";
import { useAuth } from "providers/auth";
import { selectIsLive } from "types/Timeline/TimelineSelectors";
import { selectPatternTrackIds } from "types/Track/TrackSelectors";
import { createTrackTree } from "types/Track/TrackThunks";
import { selectClosestPoseClipId } from "types/Arrangement/ArrangementSelectors";
import {
  initializePatternClip,
  initializePoseClip,
  PortaledPatternClipId,
} from "types/Clip/ClipTypes";
import { addClip } from "types/Clip/ClipSlice";
import { createPose } from "types/Pose/PoseThunks";
import { createPattern } from "types/Pattern/PatternThunks";
import { addClipIdsToSelection } from "types/Timeline/thunks/TimelineSelectionThunks";
import { selectPatternClipIds } from "types/Clip/ClipSelectors";
import { dispatchCustomEvent } from "utils/html";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";

export const NavbarLivePlayButton = () => {
  const dispatch = useProjectDispatch();
  const { isAtLeastRank } = useAuth();
  const trackIds = useDeep(selectPatternTrackIds);
  const hasTracks = trackIds.length > 0;

  const clipIds = useDeep(selectPatternClipIds);
  const patternClipId = clipIds.at(0);
  const poseClipId = useDeep((_) =>
    patternClipId
      ? selectClosestPoseClipId(_, `${patternClipId}-chunk-1`)
      : undefined
  );

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
  const LivePlayButton = () => (
    <NavbarTooltipButton
      keepTooltipOnClick
      borderColor="border-fuchsia-500"
      className={`cursor-pointer p-1.5`}
      onClick={() => {
        const undoType = "prepareLive";
        if (!hasTracks) {
          dispatch(createTrackTree({ undoType }));
        }
        const trackId = trackIds[0];

        const pcId =
          patternClipId === undefined
            ? dispatch(
                addClip({
                  data: initializePatternClip({
                    trackId,
                    patternId: dispatch(createPattern({ data: {}, undoType })),
                  }),
                })
              )
            : patternClipId;

        const psId =
          poseClipId === undefined
            ? dispatch(
                addClip({
                  data: initializePoseClip({
                    trackId,
                    poseId: dispatch(createPose({ data: {}, undoType })),
                  }),
                })
              )
            : poseClipId;

        dispatch(setSelectedTrackId({ data: trackId, undoType }));
        dispatch(addClipIdsToSelection({ data: [pcId, psId], undoType }));

        setTimeout(() => dispatchCustomEvent(`open_score_${pcId}-chunk-1`), 25);
        setTimeout(() => dispatchCustomEvent(`open_dropdown_${psId}`), 50);
      }}
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
      {LivePlayButton()}
    </div>
  );
};
