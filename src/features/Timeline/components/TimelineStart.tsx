import Background from "assets/images/landing-background.png";
import classNames from "classnames";
import React, { ReactNode, useEffect } from "react";
import { GiPineTree, GiCrystalWand, GiPaintBrush } from "react-icons/gi";
import { useProjectDispatch } from "types/hooks";
import { createNewTree } from "utils/tree";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";
import { CREATE_NEW_TREE_HOTKEY } from "../hooks/useTimelineHotkeys";
import { dispatchCustomEvent } from "utils/html";

// The timeline starting screen
export function TimelineStart() {
  const dispatch = useProjectDispatch();
  useEffect(() => {
    return () => {
      setTimeout(() => {
        dispatchCustomEvent("design-tree", false);
        dispatchCustomEvent("water-tree", false);
        dispatchCustomEvent("live-play", false);
      }, 50);
    };
  }, []);
  return (
    <div className="size-full flex flex-col items-center pt-24 gap-6 relative bg-slate-900/50 transition-all">
      <img
        className="absolute size-full inset-0 opacity-50 -z-10"
        src={Background}
        alt="Background"
      />
      <div className="bg-indigo-900/20 px-12 py-6 border-2 border-indigo-400/50 backdrop-blur rounded-lg">
        <h1 className="mb-4 text-4xl text-slate-50 font-bold drop-shadow-sm">
          Welcome to the Playground!
        </h1>
        <h2 className="text-2xl font-light text-slate-300">
          Create a Tree to start your Project.
        </h2>
      </div>
      <div className="mt-12 flex gap-16 px-4 *:shadow-2xl">
        <TimelineButton
          border="ring-indigo-600/80"
          className="cursor-pointer rounded-lg"
          onClick={() => dispatch(createNewTree)}
          title={
            <span className="w-full mb-1 total-center">
              Step 1: {dispatch(CREATE_NEW_TREE_HOTKEY).name}
              <span className="inline ml-1 font-light text-slate-400 capitalize">
                (I to Input, N for Default)
              </span>
            </span>
          }
          description={
            <div className="total-center p-2 max-xl:flex-wrap">
              <GiPineTree className="text-8xl shrink-0" />
              <div className="flex flex-col p-2 gap-4 w-64">
                <div>
                  <b>Trees</b> are families of Tracks with layers of Scales and
                  Samplers.
                </div>
                <div>
                  <div>Example Trees:</div>
                  1. <span className="text-sky-400">Major</span>
                  {" => "}
                  <span className="text-sky-400">Chord</span>
                  {" => "}
                  <span className="text-emerald-400">(Piano + Bass)</span>
                  <br />
                  2. <span className="text-sky-400">Dm9</span>
                  {" => "}
                  <span className="text-sky-400">Dm7</span>
                  {" => "}
                  <span className="text-sky-400">Dm</span>
                  {" => "}
                  <span className="text-emerald-400">Guitar</span>
                </div>
              </div>
            </div>
          }
        />
        <TimelineButton
          border="ring-emerald-600/80"
          className="cursor-pointer rounded-lg"
          onClick={() => dispatch(toggleLivePlay())}
          title={
            <span className="w-full mb-1 total-center">
              Step 2: Create Patterns
              <span className="inline ml-1 font-light text-slate-400 capitalize">
                (Press O to Toggle)
              </span>
            </span>
          }
          description={
            <div className="total-center p-2 max-xl:flex-wrap">
              <GiPaintBrush className="text-8xl p-3 shrink-0" />
              <div className="flex flex-col p-2 gap-4 w-64">
                <div>
                  <b>Patterns</b> are scheduled in Samplers to play notes
                  related to Scales.
                </div>
                <div>
                  Example Notes:
                  <br />
                  <span className="text-emerald-400">A</span> ={" "}
                  <span className="text-sky-400">3rd step of Chord</span>,{" "}
                  <span className="text-fuchsia-400">+1 Major step</span>
                  <br />
                  <span className="text-emerald-400">F#</span> ={" "}
                  <span className="text-sky-400">5th step of Major</span>,{" "}
                  <span className="text-fuchsia-400">-1 Chromatic</span>
                </div>
              </div>
            </div>
          }
        />
        <TimelineButton
          className="cursor-pointer rounded-lg"
          border="ring-fuchsia-600/80"
          onClick={() => dispatch(toggleLivePlay())}
          title={
            <span className="w-full mb-1 total-center">
              Step 3: Create Poses
              <span className="inline ml-1 font-light text-slate-400 capitalize">
                (Press P to Toggle)
              </span>
            </span>
          }
          description={
            <div className="total-center p-2 max-xl:flex-wrap">
              <GiCrystalWand className="text-8xl p-3 shrink-0" />
              <div className="flex flex-col p-2 gap-4 w-64">
                <div>
                  <b>Poses</b> are scheduled in Tracks to transform Scales and
                  Patterns.
                </div>
                <div>
                  Example Poses:
                  <br />
                  <span className="text-fuchsia-400">T1</span> ={" "}
                  <span className="text-emerald-400">Pattern </span>moves 1 step
                  up <span className="text-sky-400">Scale T</span>
                  <br />
                  <span className="text-fuchsia-400">r-2</span> ={" "}
                  <span className="text-sky-400">Scale </span>moves 2 rotations
                  down
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

const TimelineButton = (
  props: Partial<{
    background: string;
    border: string;
    Icon: React.FC;
    onClick: () => void;
    className: string;
    title: ReactNode;
    description: ReactNode;
  }>
) => (
  <div
    className={classNames(
      props.className,
      props.border,
      props.background ?? "bg-slate-900/60",
      "backdrop-blur-lg size-full flex flex-col gap-1 ring-2 p-2 rounded"
    )}
    onClick={props.onClick}
  >
    <div className="font-bold flex gap-2 text-base border-b border-b-white/5">
      {!!props.Icon && (
        <div
          className={classNames("inline-flex *:m-auto p-1 mb-2 rounded-full")}
        >
          <props.Icon />
        </div>
      )}
      {props.title}
    </div>{" "}
    <div className="text-sm text-slate-200">{props.description}</div>
  </div>
);
