import Background from "assets/images/landing-background.png";
import classNames from "classnames";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { sample } from "lodash";
import { PresetScaleList } from "presets/scales";
import React from "react";
import {
  GiBreakingChain,
  GiMusicalKeyboard,
  GiFamilyTree,
} from "react-icons/gi";
import { useProjectDispatch } from "types/hooks";
import { INSTRUMENT_KEYS } from "types/Instrument/InstrumentTypes";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import {
  createScaleTrack,
  createRandomHierarchy,
  createDrumTracks,
} from "types/Track/ScaleTrack/ScaleTrackThunks";
import { createTrackTree } from "types/Track/TrackThunks";

// The timeline starting screen
export function TimelineStart() {
  const dispatch = useProjectDispatch();
  const PatternTrack = <span className="text-emerald-400">Pattern Track</span>;
  const ScaleTrack = <span className="text-indigo-400">Scale Track</span>;
  const heldKeys = useHeldHotkeys(["alt", "d"]);
  const shouldRandomize = heldKeys.alt;
  const shouldDrum = heldKeys.d;

  const Button = (props: React.HTMLProps<HTMLButtonElement>) => (
    <button
      {...props}
      type="button"
      className={classNames(
        props.className,
        "w-80 mt-4 backdrop-blur bg-slate-900/50 group border border-slate-600 cursor-pointer hover:ring-1 hover:ring-slate-300 active:brightness-105 active:scale-105 active:ring-2 active:ring-white transition-all text-white "
      )}
    />
  );
  // Create a Scale Track button
  const ScaleTrackButton = (
    <Button
      onClick={() =>
        dispatch(
          shouldRandomize
            ? createScaleTrack({}, sample(PresetScaleList))
            : createScaleTrack()
        )
      }
    >
      <div className="flex flex-col items-center">
        <div className="size-40 mb-4 flex text-7xl total-center bg-gradient-to-b from-indigo-500/80 to-indigo-800/80 rounded-full">
          <GiBreakingChain />
        </div>
        <span className="font-bold mb-4">Create Scale Track</span>
        <span className="font-light text-base">
          Contains a {shouldRandomize ? "Random" : "New"} Scale
        </span>
        <span className="font-light text-base">Can Nest Tracks</span>
      </div>
    </Button>
  );

  // Create a Pattern Track button
  const PatternTrackButton = (
    <Button
      onClick={() =>
        dispatch(
          createPatternTrack(
            {},
            shouldRandomize ? sample(INSTRUMENT_KEYS) : undefined
          )
        )
      }
    >
      <div className="flex flex-col items-center">
        <div className="size-40 mb-4 flex text-7xl total-center bg-gradient-to-b from-emerald-500/80 to-emerald-800/80 rounded-full">
          <GiMusicalKeyboard />
        </div>
        <span className="font-bold mb-4">Create Pattern Track</span>
        <span className="font-light text-base">
          Contains a {shouldRandomize ? "Random" : "New"} Instrument
        </span>
        <span className="font-light text-base">Can Play Audio</span>
      </div>
    </Button>
  );

  // Create a Track Tree button
  const TrackTreeButton = (
    <Button
      onClick={() =>
        dispatch(
          shouldDrum
            ? createDrumTracks()
            : shouldRandomize
            ? createRandomHierarchy()
            : createTrackTree()
        )
      }
    >
      <div className="flex flex-col items-center">
        <div className="size-40 mb-4 flex text-7xl total-center bg-gradient-to-b from-indigo-800/80 to-emerald-500/80 rounded-full">
          <GiFamilyTree className="rotate-180" />
        </div>
        <span className="font-bold mb-4">
          Create {shouldDrum ? "Drum Tree" : "Track Tree"}
        </span>
        <span className="font-light text-base">
          {shouldDrum
            ? "4 Curated Drum Tracks"
            : shouldRandomize
            ? "2-4 Random Scale Tracks"
            : "Scale Track + Pattern Track"}
        </span>
        <span className="font-light text-base">
          {shouldDrum
            ? "Advanced Starting Point"
            : shouldRandomize
            ? `No Pattern Track`
            : "Suggested Starting Point"}
        </span>
      </div>
    </Button>
  );

  return (
    <div className="flex flex-col gap-4 relative size-full bg-slate-900/50 total-center transition-all">
      <img
        className="absolute size-full inset-0 opacity-50 -z-10"
        src={Background}
        alt="Background"
      />
      <h1 className="mb-4 text-4xl text-slate-50 font-bold drop-shadow-sm">
        Welcome to the Playground!
      </h1>
      <h2 className="text-2xl text-slate-300">
        The Timeline will be available once you have some tracks.
      </h2>
      <h2 className="text-2xl text-slate-300">
        To get started, create a {ScaleTrack} and/or a {PatternTrack}.
      </h2>
      <div className="mt-4 *:text-2xl flex *:gap-8">
        <div className="flex *:peer *:py-8 *:font-light *:rounded-lg">
          {ScaleTrackButton} {PatternTrackButton} {TrackTreeButton}
        </div>
      </div>
    </div>
  );
}
