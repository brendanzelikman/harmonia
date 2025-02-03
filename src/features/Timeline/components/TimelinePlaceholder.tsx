import Background from "assets/images/landing-background.png";
import { useTransportTick } from "hooks/useTransportTick";
import { omit } from "lodash";
import Tree from "react-d3-tree";
import { selectTrackJsonAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { selectSelectedTrackId } from "types/Timeline/TimelineSelectors";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";

// The timeline placeholder for performance mode
export function TimelinePlaceholder() {
  const { tick } = useTransportTick();
  const dispatch = useProjectDispatch();
  const json = useDeep((_) => selectTrackJsonAtTick(_, tick));
  const selectedTrackId = use(selectSelectedTrackId);
  return (
    <div className="flex flex-col relative size-full total-center">
      <img
        src={Background}
        className="absolute inset-0 opacity-50 -z-20 h-screen object-cover"
      />
      <Tree
        data={json}
        orientation="vertical"
        separation={{ siblings: 2, nonSiblings: 1 }}
        translate={{ x: window.innerWidth / 2, y: 50 }}
        svgClassName="bg-slate-50/5 backdrop-blur-sm"
        rootNodeClassName="*:fill-zinc-800 *:stroke-zinc-800"
        branchNodeClassName="*:fill-indigo-400 *:stroke-indigo-400"
        leafNodeClassName="*:fill-emerald-400 *:stroke-emerald-400"
        renderCustomNodeElement={(rd3tProps) => {
          const { nodeDatum, toggleNode, onNodeClick } = rd3tProps;
          const root = rd3tProps.hierarchyPointNode.parent === null;
          const isPT = !nodeDatum.children;
          const attributes = Object.entries(
            omit(nodeDatum.attributes ?? {}, "meta")
          );
          const meta = nodeDatum.attributes?.meta as any;
          const trackId = meta?.trackId;
          const isSelected = trackId && trackId === selectedTrackId;
          return (
            <>
              <circle
                r={20}
                style={isSelected ? { stroke: "white", strokeWidth: 1 } : {}}
                onClick={toggleNode}
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
                  onClick={onNodeClick}
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
