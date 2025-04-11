import { useTick } from "types/Transport/TransportTick";
import { createDeepSelector } from "types/redux";
import { omit } from "lodash";
import Tree from "react-d3-tree";
import { getTrackScaleChain } from "types/Arrangement/ArrangementFunctions";
import { selectProcessedArrangement } from "types/Arrangement/ArrangementSelectors";
import { getPoseOperationsAtTick } from "types/Clip/PoseClip/PoseClipFunctions";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { getPoseVectorAsString } from "types/Pose/PoseFunctions";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { selectSelectedTrackId } from "types/Timeline/TimelineSelectors";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import {
  selectTopLevelTracks,
  selectTrackLabelMap,
  selectTrackMap,
  selectTrackInstrumentMap,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { Tick } from "types/units";
import { getScaleName } from "types/Scale/ScaleFinder";
import { sumVectors } from "utils/vector";

export function TerminalGraph() {
  const tick = useTick();
  const dispatch = useAppDispatch();
  const json = useAppValue((_) => selectTrackJsonAtTick(_, tick));
  const selectedTrackId = useAppValue(selectSelectedTrackId);
  return (
    <div className="relative size-full total-center-col">
      <Tree
        data={json}
        orientation="vertical"
        separation={{ siblings: 2, nonSiblings: 1 }}
        translate={{ x: 340, y: 80 }}
        svgClassName="font-light"
        rootNodeClassName="*:fill-sky-600 *:stroke-zinc-500"
        branchNodeClassName="*:fill-indigo-400 *:stroke-indigo-400"
        leafNodeClassName="*:fill-emerald-400 *:stroke-emerald-400"
        pathClassFunc={() => "d3-path"}
        renderCustomNodeElement={(rd3tProps) => {
          const { nodeDatum } = rd3tProps;
          const root = rd3tProps.hierarchyPointNode.parent === null;
          const isPT = !nodeDatum.children;
          const attributes = Object.entries(omit(nodeDatum.attributes, "meta"));
          const meta = nodeDatum.attributes?.meta as any;
          const trackId = meta?.trackId;
          const isSelected = trackId && trackId === selectedTrackId;
          return (
            <>
              <circle
                r={20}
                style={isSelected ? { stroke: "white", strokeWidth: 2 } : {}}
                onClick={() => dispatch(setSelectedTrackId(trackId))}
              />
              <g
                className="rd3t-label"
                onClick={() => dispatch(setSelectedTrackId(trackId))}
              >
                <text
                  className="rd3t-label__title"
                  textAnchor="start"
                  style={{
                    fill: root ? "darkgray" : isPT ? "lightgreen" : "#68f",
                  }}
                  x="40"
                >
                  {nodeDatum.name}
                </text>
                <text className="rd3t-label__attributes">
                  {attributes.map(([labelKey, labelValue], i) => (
                    <tspan
                      key={`${labelKey}-${i}`}
                      fill={labelKey === "Pose" ? "#dd55ff" : "#aab"}
                      fillOpacity={0.8}
                      x="40"
                      dy="1.2em"
                    >
                      {labelValue}
                    </tspan>
                  ))}
                </text>
              </g>
            </>
          );
        }}
      />
    </div>
  );
}

export const selectTrackJsonAtTick = createDeepSelector(
  [
    selectTopLevelTracks,
    selectTrackLabelMap,
    selectTrackMap,
    selectTrackInstrumentMap,
    selectPoseMap,
    selectProcessedArrangement,
    (_, tick: Tick) => tick,
  ],
  (topLevelTracks, labelMap, trackMap, iMap, poseMap, arrangement, tick) => {
    const createTrack = (trackId: TrackId): any => {
      const track = trackMap[trackId];
      if (!track) return { name: trackId };
      const meta = { trackId };
      const name = `Track ${labelMap[trackId]}`;
      const isPT = track.type === "pattern";
      const Instrument = getInstrumentName(iMap[trackId]?.key);
      const poseClips = arrangement.trackPoseClips[trackId] ?? [];
      const vector = sumVectors(
        track.vector,
        ...getPoseOperationsAtTick(poseClips, { poseMap, tick }).map(
          (v) => v.vector
        )
      );
      const Pose = getPoseVectorAsString(vector, trackMap);
      if (isPT) return { name, attributes: { Instrument, Pose, meta } };

      const chain = getTrackScaleChain(trackId, {
        ...arrangement,
        tick,
      });
      const scale = resolveScaleChainToMidi(chain);
      const attributes = { Scale: getScaleName(scale), Pose, meta };
      return { name, attributes, children: track.trackIds.map(createTrack) };
    };
    return {
      name: "Tracks",
      id: "tracks",
      children: topLevelTracks.map((t) => createTrack(t.id)),
    };
  }
);
