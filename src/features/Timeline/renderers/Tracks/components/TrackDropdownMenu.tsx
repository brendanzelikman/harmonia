import {
  Menu,
  MenuButton,
  MenuItems,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  BsArrowsCollapse,
  BsArrowsExpand,
  BsCopy,
  BsEraser,
  BsEraserFill,
  BsGearFill,
  BsMagnetFill,
  BsThreeDots,
  BsTrash,
} from "react-icons/bs";
import { ReactNode } from "react";
import { cancelEvent } from "utils/html";
import {
  GiAudioCassette,
  GiFamilyTree,
  GiPineTree,
  GiCrystalWand,
} from "react-icons/gi";
import { SiMidi } from "react-icons/si";
import { exportTrackToMIDI } from "types/Clip/ClipThunks";
import { inputPoseVector } from "types/Pose/PoseThunks";
import {
  insertScaleTrack,
  collapseTracks,
  duplicateTrack,
  deleteTrack,
  clearTrack,
  quantizeTrackClips,
  popTrack,
  selectTrackClips,
  collapseTrackDescendants,
} from "types/Track/TrackThunks";
import { TrackDropdownButton } from "./TrackDropdownButton";
import { Track } from "types/Track/TrackTypes";
import { useDeep, useProjectDispatch } from "types/hooks";
import classNames from "classnames";
import {
  selectTrackChildren,
  selectTrackInstrumentKey,
} from "types/Track/TrackSelectors";
import { some } from "lodash";
import { INSTRUMENT_KEYS } from "types/Instrument/InstrumentTypes";
import { CiRuler } from "react-icons/ci";
import { promptUserForSample } from "types/Track/PatternTrack/PatternTrackThunks";

export const TrackDropdownMenu = (props: {
  track: Track;
  className?: string;
  content?: string;
  children?: ReactNode;
}) => {
  const dispatch = useProjectDispatch();
  const { track } = props;
  const trackId = track.id;
  const isPT = track.type === "pattern";
  const mini = track.collapsed;
  const hasMini = useDeep((_) => selectTrackChildren(_, trackId)).some(
    (child) => child.collapsed
  );
  const isParent = !!track.trackIds.length;
  const key = useDeep((_) => selectTrackInstrumentKey(_, track.id));
  const isSampled = isPT && key && !INSTRUMENT_KEYS.includes(key);
  const status = isParent ? "Tree" : "Track";

  // const channel = track.port ? track.port - PLUGIN_STARTING_PORT : 0;
  return (
    <Menu
      as="div"
      onSelect={(e) => e.currentTarget.blur()}
      className="relative inline-block focus:border-0 active:border-0"
    >
      {({ open }) => (
        <>
          <div className="w-full" onClick={cancelEvent}>
            <MenuButton
              aria-label="Track Dropdown Menu"
              className={`w-full h-full rounded select-none ${
                open ? "text-indigo-400" : "text-white"
              } outline-none`}
            >
              <BsThreeDots className="text-xl" />
            </MenuButton>
          </div>
          <MenuItems
            className="absolute top-0 -right-[14rem] w-52 bg-zinc-900/95 border border-slate-600 backdrop-blur rounded py-2 select-none focus:outline-none animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <TabGroup>
              <TabList className="flex pb-1 justify-evenly border-b border-b-indigo-500/50">
                <Tab className="data-[selected]:text-indigo-400 outline-none">
                  Track
                </Tab>
                <Tab className="data-[selected]:text-indigo-400 outline-none">
                  Clips
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <TrackDropdownButton
                    divideStart
                    content="Edit Base Pose"
                    icon={
                      <GiCrystalWand
                        className={classNames("-rotate-90", {
                          "fill-fuchsia-300": some(track.vector),
                        })}
                      />
                    }
                    onClick={() => dispatch(inputPoseVector(trackId))}
                  />
                  {isPT && (
                    <TrackDropdownButton
                      content="Upload Audio File"
                      icon={
                        <GiAudioCassette
                          className={isSampled ? "fill-emerald-300" : ""}
                        />
                      }
                      onClick={() =>
                        dispatch(promptUserForSample({ data: { track } }))
                      }
                    />
                  )}
                  <TrackDropdownButton
                    content="Insert Parent Scale"
                    divideEnd={!track?.parentId && !isPT}
                    icon={<CiRuler className="scale-110" />}
                    onClick={() => dispatch(insertScaleTrack(trackId))}
                  />
                  {track?.parentId && (
                    <TrackDropdownButton
                      content="Move to New Tree"
                      icon={<GiPineTree />}
                      onClick={() => dispatch(popTrack(trackId))}
                    />
                  )}

                  <TrackDropdownButton
                    divideStart={isPT || !!track?.parentId}
                    content={`${mini ? "Enlarge" : "Minify"} Track`}
                    icon={mini ? <BsArrowsExpand /> : <BsArrowsCollapse />}
                    onClick={() =>
                      dispatch(
                        collapseTracks({
                          data: { trackIds: [trackId], value: !mini },
                        })
                      )
                    }
                  />
                  {isParent && (
                    <TrackDropdownButton
                      divideEnd={!isPT}
                      content={`${hasMini ? "Enlarge" : "Minify"} Tree`}
                      icon={hasMini ? <BsArrowsExpand /> : <BsArrowsCollapse />}
                      onClick={() =>
                        dispatch(collapseTrackDescendants(trackId, !hasMini))
                      }
                    />
                  )}
                  <TrackDropdownButton
                    content={`Export to MIDI`}
                    icon={<SiMidi />}
                    onClick={() => dispatch(exportTrackToMIDI(trackId))}
                  />
                  <TrackDropdownButton
                    content={`Duplicate ${status}`}
                    icon={<BsCopy />}
                    onClick={() => dispatch(duplicateTrack({ data: track }))}
                  />
                  <TrackDropdownButton
                    content={`Delete ${status}`}
                    icon={<BsTrash />}
                    onClick={() => dispatch(deleteTrack({ data: trackId }))}
                  />
                </TabPanel>
                <TabPanel>
                  <TrackDropdownButton
                    content="Select Clips"
                    icon={<BsGearFill />}
                    onClick={() => dispatch(selectTrackClips(trackId))}
                  />
                  <TrackDropdownButton
                    divideEnd
                    content="Quantize Clips"
                    icon={<BsMagnetFill />}
                    onClick={() => dispatch(quantizeTrackClips(trackId))}
                  />
                  <TrackDropdownButton
                    content="Erase Pattern Clips"
                    icon={<BsEraser />}
                    onClick={() =>
                      dispatch(
                        clearTrack({ data: { trackId, type: "pattern" } })
                      )
                    }
                  />
                  <TrackDropdownButton
                    content="Erase Pose Clips"
                    icon={<BsEraser />}
                    onClick={() =>
                      dispatch(clearTrack({ data: { trackId, type: "pose" } }))
                    }
                  />

                  <TrackDropdownButton
                    content="Erase Track Clips"
                    icon={<BsEraserFill />}
                    onClick={() => dispatch(clearTrack({ data: { trackId } }))}
                  />
                  {!isPT && (
                    <>
                      <TrackDropdownButton
                        divideStart
                        content="Clear Pattern Clips"
                        icon={<GiFamilyTree />}
                        onClick={() =>
                          dispatch(
                            clearTrack({
                              data: { trackId, type: "pattern", cascade: true },
                            })
                          )
                        }
                      />
                      <TrackDropdownButton
                        content="Clear Pose Clips"
                        icon={<GiFamilyTree />}
                        onClick={() =>
                          dispatch(
                            clearTrack({
                              data: { trackId, type: "pose", cascade: true },
                            })
                          )
                        }
                      />
                      <TrackDropdownButton
                        content="Clear All Clips"
                        icon={<BsEraserFill />}
                        onClick={() =>
                          dispatch(
                            clearTrack({ data: { trackId, cascade: true } })
                          )
                        }
                      />
                    </>
                  )}
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </MenuItems>
        </>
      )}
    </Menu>
  );
};
