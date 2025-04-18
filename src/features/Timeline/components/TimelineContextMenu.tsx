import classNames from "classnames";
import { ContextMenu } from "components/ContextMenu";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { memo, useCallback, useState } from "react";
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
  duplicateSelectedMedia,
  deleteSelectedMedia,
  updateMedia,
  filterSelectionByType,
  insertMeasure,
} from "types/Media/MediaThunks";
import {
  exportSelectedClipsToMIDI,
  exportSelectedClipsToWAV,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import {
  selectTransportBPM,
  selectTransportTimeSignature,
} from "types/Transport/TransportSelectors";
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

export const TimelineContextMenu = memo(() => {
  const dispatch = useAppDispatch();
  const bpm = useAppValue(selectTransportBPM);
  const timeSignature = useAppValue(selectTransportTimeSignature);

  // Get the currently selected objects
  const patternClips = useAppValue(selectSelectedPatternClips);
  const clips = useAppValue(selectSelectedClips);

  // Change the color of the currently selected clips
  const [color, setColor] = useState(DEFAULT_PATTERN_CLIP_COLOR);
  const updateColor = useCallback(() => {
    const newClips = patternClips.map((clip) => ({
      ...clip,
      color,
    }));
    dispatch(updateClips({ data: newClips }));
  }, [patternClips, color]);

  // Set the name and duration of the currently selected clips
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const durationValue = sanitize(parseFloat(duration));

  const Properties = (
    <div className="flex flex-col pt-2 gap-2 h-full *:rounded *:p-1">
      <div className="flex gap-4 items-center" onClick={cancelEvent}>
        Name:
        <input
          type="text"
          placeholder="Text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={blurOnEnter}
          className="min-w-12 max-w-24 text-xs ml-auto h-6 text-center bg-transparent text-slate-200 rounded"
        />
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => {
          const value = name === "" ? undefined : name;
          dispatch(
            updateClips({ data: clips.map(({ id }) => ({ id, name: value })) })
          );
        }}
      >
        Click to Set Name
      </div>
      <div className="flex gap-4 items-center" onClick={cancelEvent}>
        Duration (Bars):{" "}
        <input
          type="text"
          placeholder="∞"
          value={duration}
          onChange={(e) => {
            setDuration(e.target.value);
          }}
          onKeyDown={blurOnEnter}
          className="min-w-12 ml-auto max-w-16 h-6 text-center bg-transparent text-slate-200 rounded"
        />
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
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
        Click to Set Duration
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => {
          const isValid = durationValue || duration === "0";
          const ticks = timeSignature * QuarterNoteTicks * durationValue;
          if (isValid) dispatch(insertMeasure(ticks));
        }}
      >
        Click to Insert Duration
      </div>
      <div
        className="flex rounded p-1 w-40 flex-wrap gap-2 items-center"
        onClick={cancelEvent}
      >
        {PATTERN_CLIP_COLORS.map((c) => (
          <span
            key={c}
            className={classNames(
              PATTERN_CLIP_THEMES[c].iconColor,
              c === color ? "ring-1 ring-white" : "",
              `size-4 m-1 rounded-full border cursor-pointer`
            )}
            onClick={(e) => {
              setColor(c);
            }}
          />
        ))}
      </div>
      <div className="flex cursor-pointer hover:bg-slate-600/20">
        <div
          className="flex cursor-pointer hover:bg-slate-600/20"
          onClick={updateColor}
        >
          Click to Set Color
        </div>
      </div>
    </div>
  );

  const Selection = (
    <div className="flex flex-col pt-2 gap-2 h-full *:rounded *:p-1">
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => dispatch(exportSelectedClipsToMIDI())}
      >
        Export to MIDI
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => dispatch(exportSelectedClipsToWAV())}
      >
        Export to WAV
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => dispatch(filterSelectionByType("pattern"))}
      >
        Filter by Patterns
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => dispatch(filterSelectionByType("pose"))}
      >
        Filter by Poses
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => dispatch(insertMeasure())}
      >
        Insert Measure
      </div>
    </div>
  );

  const Clipboard = (
    <div className="flex flex-col pt-2 gap-2 h-full *:rounded *:p-1">
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => dispatch(cutSelectedMedia())}
      >
        Cut Selection
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => dispatch(copySelectedMedia())}
      >
        Copy Selection
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => dispatch(pasteSelectedMedia())}
      >
        Paste Selection
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => dispatch(duplicateSelectedMedia())}
      >
        Duplicate Selection
      </div>
      <div
        className="flex cursor-pointer hover:bg-slate-600/20"
        onClick={() => dispatch(deleteSelectedMedia())}
      >
        Delete Selection
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
            <Menu as="div" className="size-full relative px-2 min-w-48">
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
                      Clipboard
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel onFocus={blurEvent}>{Properties}</TabPanel>
                    <TabPanel onFocus={blurEvent}>{Selection}</TabPanel>
                    <TabPanel onFocus={blurEvent}>{Clipboard}</TabPanel>
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
