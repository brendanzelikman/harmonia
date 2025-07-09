import classNames from "classnames";
import { ContextMenu } from "components/ContextMenu";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { memo, useState } from "react";
import { blurEvent, blurOnEnter, cancelEvent } from "utils/event";
import { updateClips } from "types/Clip/ClipSlice";
import {
  PATTERN_CLIP_THEMES,
  PATTERN_CLIP_COLORS,
  DEFAULT_PATTERN_CLIP_COLOR,
} from "types/Clip/PatternClip/PatternClipThemes";
import {
  selectSelectedPatternClips,
  selectSelectedClips,
} from "types/Timeline/TimelineSelectors";
import {
  cutSelectedMedia,
  copySelectedMedia,
  pasteSelectedMedia,
  updateMedia,
  filterSelectionByType,
  insertMeasure,
  duplicateSelectedMedia,
  deleteSelectedMedia,
} from "types/Media/MediaThunks";
import {
  exportSelectedClipsToMIDI,
  exportSelectedClipsToWAV,
  replaceClipIdsInSelection,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import { selectTransportTimeSignature } from "types/Transport/TransportSelectors";
import { sanitize } from "utils/math";
import {
  MenuItems,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Menu,
} from "@headlessui/react";
import { QuarterNoteTicks } from "utils/duration";
import {
  selectPatternClipIds,
  selectPoseClipIds,
} from "types/Clip/ClipSelectors";
import {
  promptUserForMidiFile,
  updatePatternClipWithMidiNotes,
} from "lib/prompts/patternClip";

export const TimelineContextMenu = memo(() => {
  const dispatch = useAppDispatch();
  const timeSignature = useAppValue(selectTransportTimeSignature);

  // Get the currently selected objects
  const patternClips = useAppValue(selectSelectedPatternClips);
  const patternClipIds = useAppValue(selectPatternClipIds);
  const poseClipIds = useAppValue(selectPoseClipIds);
  const clips = useAppValue(selectSelectedClips);

  // Change the color of the currently selected clips
  const [color, setColor] = useState(DEFAULT_PATTERN_CLIP_COLOR);

  // Set the name and duration of the currently selected clips
  const [name, setName] = useState("");
  const [fileName, setFileName] = useState("");
  const [duration, setDuration] = useState("");
  const durationValue = sanitize(parseFloat(duration));

  const Name = (
    <div className="border rounded p-3 border-indigo-400 gap-3 flex flex-col">
      <div className="flex gap-4 items-center" onClick={cancelEvent}>
        Name:
        <input
          type="text"
          placeholder="Input Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          onKeyDown={(e) => {
            e.stopPropagation();
            blurOnEnter(e);
          }}
          className="min-w-12 max-w-36 text-xs ml-auto h-6 text-center bg-transparent text-slate-200 rounded"
        />
      </div>
      <div className="flex justify-evenly gap-2">
        <div
          className="total-center p-2 py-0 w-32 rounded border border-cyan-500 active:bg-cyan-500/50 cursor-pointer bg-slate-800/90 hover:bg-slate-600/20"
          onClick={() => {
            const value = name === "" ? undefined : name;
            dispatch(
              updateClips({
                data: clips.map(({ id }) => ({ id, name: value })),
              })
            );
          }}
        >
          Update Clips
        </div>
        <div
          className="total-center p-2 py-0 w-32 rounded border border-red-400 active:bg-red-400/50 cursor-pointer bg-slate-800/90 hover:bg-slate-600/20"
          onClick={() => {
            setName("");
            dispatch(
              updateClips({
                data: clips.map(({ id }) => ({ id, name: undefined })),
              })
            );
          }}
        >
          Reset Name
        </div>
      </div>
    </div>
  );

  const ClipDuration = (
    <div className="border rounded p-3 border-teal-400 gap-3 flex flex-col">
      <div className="flex justify-evenly items-center" onClick={cancelEvent}>
        Duration:
        <input
          type="text"
          placeholder="Input Measures"
          value={duration}
          onChange={(e) => {
            setDuration(e.target.value);
          }}
          onKeyDown={(e) => {
            blurOnEnter(e, () => {
              const isValid = durationValue || duration === "0";
              const ticks = timeSignature * QuarterNoteTicks * durationValue;
              const newClips = clips.map((clip) => ({
                ...clip,
                duration: isValid ? ticks : undefined,
              }));
              dispatch(updateMedia({ data: { clips: newClips } }));
            });
          }}
          className="min-w-12 ml-auto placeholder:font-light placeholder:text-xs max-w-36 h-6 text-center bg-transparent text-slate-200 rounded"
        />
      </div>
      <div className="flex justify-evenly gap-2">
        <div
          className="total-center p-2 py-0 w-32 rounded border border-cyan-500 cursor-pointer hover:bg-slate-600/20"
          onClick={() => {
            const isValid = durationValue || duration === "0";
            const ticks = timeSignature * QuarterNoteTicks * durationValue;
            const newClips = clips.map((clip) => ({
              ...clip,
              duration: isValid ? ticks : undefined,
            }));
            dispatch(updateMedia({ data: { clips: newClips } }));
          }}
        >
          Update Clips
        </div>
        <div
          className="total-center p-2 py-0 w-32 rounded border border-teal-500 cursor-pointer hover:bg-slate-600/20"
          onClick={() => {
            const isValid = durationValue || duration === "0";
            const ticks = timeSignature * QuarterNoteTicks * durationValue;
            if (isValid) dispatch(insertMeasure(ticks, clips));
          }}
        >
          Push Clips
        </div>
      </div>
    </div>
  );

  const ClipColor = (
    <div
      className="flex rounded p-1 gap-2 border border-slate-500 items-center"
      onClick={cancelEvent}
    >
      <div className="grow">Color:</div>
      <div className="flex rounded p-1 flex-wrap gap-2 w-40">
        {PATTERN_CLIP_COLORS.map((c) => (
          <span
            key={c}
            className={classNames(
              PATTERN_CLIP_THEMES[c].iconColor,
              c === color ? "ring-1 ring-white" : "",
              `size-4 m-1 rounded-full border cursor-pointer`
            )}
            onClick={() => {
              setColor(c);
              const newClips = patternClips.map((clip) => ({
                ...clip,
                color: c,
              }));
              dispatch(updateClips({ data: newClips }));
            }}
          />
        ))}
      </div>
    </div>
  );

  const Properties = (
    <div className="flex flex-col pt-2 gap-2 h-full *:rounded">
      {Name}
      {ClipDuration}
      {/* {ClipColor} */}
    </div>
  );

  const Selection = (
    <div className="flex flex-col pt-2 gap-2 h-full *:rounded">
      <div className="flex gap-4 flex-wrap w-80 py-3 border border-cyan-700 rounded-full justify-evenly">
        <div
          className="total-center p-2 py-0 w-32 rounded border border-emerald-500/80 active:bg-emerald-500/50 cursor-pointer hover:bg-slate-600/20"
          onClick={() =>
            dispatch(replaceClipIdsInSelection({ data: patternClipIds }))
          }
        >
          Select Patterns
        </div>
        <div
          className="total-center p-2 py-0 w-32 rounded border border-fuchsia-500/80 active:bg-fuchsia-500/50 cursor-pointer hover:bg-slate-600/20"
          onClick={() =>
            dispatch(replaceClipIdsInSelection({ data: poseClipIds }))
          }
        >
          Select Poses
        </div>
        <div
          className="total-center p-2 py-0 w-32 rounded border border-emerald-400/80 active:bg-teal-500/50 cursor-pointer hover:bg-slate-600/20"
          onClick={() => dispatch(filterSelectionByType("pattern"))}
        >
          Filter Patterns
        </div>
        <div
          className="total-center p-2 py-0 w-32 rounded border border-fuchsia-400/80 active:bg-purple-500/50 cursor-pointer hover:bg-slate-600/20"
          onClick={() => dispatch(filterSelectionByType("pose"))}
        >
          Filter Poses
        </div>
      </div>
      <div className="flex gap-y-4 flex-wrap w-80 py-3 border border-slate-400 rounded-full justify-evenly">
        <div
          className="total-center p-2 py-0 w-[81px] rounded border border-blue-400 active:bg-blue-400/50 cursor-pointer hover:bg-slate-600/20"
          onClick={() => dispatch(cutSelectedMedia())}
        >
          Cut
        </div>
        <div
          className="total-center p-2 py-0 w-[81px] rounded border border-emerald-400 active:bg-emerald-400/50 cursor-pointer hover:bg-slate-600/20"
          onClick={() => dispatch(copySelectedMedia())}
        >
          Copy
        </div>
        <div
          className="total-center p-2 py-0 w-[81px] rounded border border-orange-400 active:bg-orange-400/50 cursor-pointer hover:bg-slate-600/20"
          onClick={() => dispatch(pasteSelectedMedia())}
        >
          Paste
        </div>
        <div
          className="total-center p-2 py-0 w-32 rounded border border-violet-400 active:bg-violet-400/50 cursor-pointer hover:bg-slate-600/20"
          onClick={() => dispatch(duplicateSelectedMedia())}
        >
          Duplicate
        </div>
        <div
          className="total-center p-2 py-0 w-32 rounded border border-red-400 active:bg-red-400/50 cursor-pointer hover:bg-slate-600/20"
          onClick={() => dispatch(deleteSelectedMedia())}
        >
          Delete
        </div>
      </div>
    </div>
  );

  const [autobind, setAutobind] = useState(true);

  const File = (
    <div className="flex flex-col pt-2 gap-2 h-full *:rounded *:p-1">
      <div className="flex flex-col pt-2 gap-2 h-full *:rounded *:p-1">
        <div className="flex justify-evenly">
          <button
            data-autobind={autobind}
            className="total-center p-2 py-0 w-16 rounded border border-blue-500 data-[autobind=true]:bg-blue-500/50 cursor-pointer hover:bg-slate-600/20"
            onClick={() => setAutobind(true)}
          >
            Bind
          </button>
          <button
            data-autobind={autobind}
            className="total-center p-2 py-0 w-16 rounded border border-emerald-500 data-[autobind=false]:bg-emerald-500/50 cursor-pointer hover:bg-slate-600/20"
            onClick={() => setAutobind(false)}
          >
            Freeze
          </button>
          <div
            className="total-center p-2 py-0 w-32 rounded border border-fuchsia-500 active:bg-fuchsia-500/50 cursor-pointer hover:bg-slate-600/20"
            onClick={() =>
              dispatch(promptUserForMidiFile({ data: { autobind } }))
            }
          >
            Import from MIDI
          </div>
        </div>
        <div
          className="flex mt-2 justify-evenly items-center"
          onClick={cancelEvent}
        >
          File Name:
          <input
            type="text"
            placeholder="Input Name"
            onChange={(e) => setFileName(e.target.value)}
            value={fileName}
            onKeyDown={(e) => {
              e.stopPropagation();
              blurOnEnter(e);
            }}
            className="min-w-12 max-w-48 text-xs h-6 text-center bg-transparent text-slate-200 rounded"
          />
        </div>
        <div className="flex justify-evenly">
          <div
            className="total-center p-2 py-0 w-32 rounded border border-indigo-500 cursor-pointer hover:bg-indigo-600/20"
            onClick={() => dispatch(exportSelectedClipsToMIDI(fileName))}
          >
            Export to MIDI
          </div>
          <div
            className="total-center p-2 py-0 w-32 rounded border border-indigo-500 cursor-pointer hover:bg-indigo-600/20"
            onClick={() => dispatch(exportSelectedClipsToWAV(fileName))}
          >
            Export to WAV
          </div>
        </div>
      </div>
    </div>
  );

  // Render the context menu
  return (
    <ContextMenu
      targetId="timeline"
      options={[
        {
          onClick: () => null,
          disabled: false,
          label: (
            <Menu as="div" className="size-full relative px-2 min-w-80">
              <MenuItems static className="size-full">
                <TabGroup onClick={cancelEvent}>
                  <TabList className="flex pb-1 gap-2 justify-evenly border-b border-b-indigo-500/50">
                    <Tab
                      className="data-[selected]:text-indigo-400 outline-none cursor-pointer"
                      onFocus={blurEvent}
                    >
                      Properties
                    </Tab>
                    <Tab
                      className="data-[selected]:text-indigo-400 outline-none cursor-pointer"
                      onFocus={blurEvent}
                    >
                      Selection
                    </Tab>
                    <Tab
                      className="data-[selected]:text-indigo-400 outline-none cursor-pointer"
                      onFocus={blurEvent}
                    >
                      File
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel onFocus={blurEvent}>{Properties}</TabPanel>
                    <TabPanel onFocus={blurEvent}>{Selection}</TabPanel>
                    <TabPanel onFocus={blurEvent}>{File}</TabPanel>
                  </TabPanels>
                </TabGroup>
              </MenuItems>
            </Menu>
          ),
        },
      ]}
    />
  );
});
