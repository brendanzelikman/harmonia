import {
  Menu,
  MenuButton,
  MenuItems,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Transition,
} from "@headlessui/react";
import {
  BsArrowsCollapse,
  BsArrowsExpand,
  BsCopy,
  BsEraser,
  BsEraserFill,
  BsThreeDots,
  BsTrash,
} from "react-icons/bs";
import { Fragment, ReactNode, useState } from "react";
import { cancelEvent } from "utils/html";
import {
  GiPaintBrush,
  GiCrystalWand,
  GiTronArrow,
  Gi3DStairs,
} from "react-icons/gi";
import { SiMidi } from "react-icons/si";
import { getTransport } from "tone";
import { addClip } from "types/Clip/ClipSlice";
import { exportTrackToMIDI } from "types/Clip/ClipThunks";
import {
  initializePatternClip,
  initializePoseClip,
} from "types/Clip/ClipTypes";
import { createPattern } from "types/Pattern/PatternThunks";
import { createPose, inputPoseVector } from "types/Pose/PoseThunks";
import {
  insertScaleTrack,
  collapseTracks,
  collapseTrackParents,
  duplicateTrack,
  deleteTrack,
  clearTrack,
  collapseTrackChildren,
} from "types/Track/TrackThunks";
import { TrackDropdownButton } from "./TrackDropdownButton";
import { Track } from "types/Track/TrackTypes";
import { useDeep, useProjectDispatch } from "types/hooks";
import {
  selectTrackChain,
  selectTrackDescendants,
} from "types/Track/TrackSelectors";

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
  const [index, setIndex] = useState(0);

  const chain = useDeep((_) => selectTrackChain(_, trackId));
  const isParentCollapsed =
    chain.length && chain.some((track) => track?.collapsed);

  const descendants = useDeep((_) => selectTrackDescendants(_, trackId));
  const isDescendantCollapsed =
    descendants.length && descendants.some((track) => track?.collapsed);

  const mini = track.collapsed;
  const isOtherCollapsed =
    track.type === "scale" ? isDescendantCollapsed : isParentCollapsed;

  // const channel = track.port ? track.port - PLUGIN_STARTING_PORT : 0;
  return (
    <Menu
      as="div"
      className="relative inline-block focus:ring-0 active:ring-0 focus:border-0 active:border-0"
    >
      {({ open }) => (
        <>
          <div className="w-full" onClick={cancelEvent}>
            <MenuButton
              aria-label="Track Dropdown Menu"
              className={`w-full h-full rounded ${
                open ? "text-indigo-400" : "text-white"
              } outline-none`}
            >
              <BsThreeDots className="text-xl" />
            </MenuButton>
          </div>
          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute top-0 -right-[13.5rem] w-48 bg-zinc-900/95 border border-slate-600 backdrop-blur rounded py-2 select-none focus:outline-none">
              <TabGroup
                defaultIndex={index}
                onChange={(index) => setIndex(index)}
              >
                <TabList className="flex justify-evenly pb-1">
                  <Tab className="data-[selected]:text-indigo-400 size-full">
                    Track
                  </Tab>
                  <Tab className="data-[selected]:text-indigo-400 size-full">
                    Media
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <TrackDropdownButton
                      content="Update Vector"
                      icon={<GiTronArrow className="-rotate-90" />}
                      onClick={() => dispatch(inputPoseVector(trackId))}
                    />
                    <TrackDropdownButton
                      content="Insert Parent"
                      icon={<Gi3DStairs />}
                      onClick={() => dispatch(insertScaleTrack(trackId))}
                    />
                    <TrackDropdownButton
                      content={`${mini ? "Enlarge" : "Minify"} Track`}
                      icon={mini ? <BsArrowsExpand /> : <BsArrowsCollapse />}
                      onClick={() =>
                        dispatch(collapseTracks({ data: [trackId] }, !mini))
                      }
                    />
                    <TrackDropdownButton
                      content={`Export Track`}
                      icon={<SiMidi />}
                      onClick={() => dispatch(exportTrackToMIDI(trackId))}
                    />
                    <TrackDropdownButton
                      content="Duplicate Track"
                      icon={<BsCopy />}
                      onClick={() => dispatch(duplicateTrack(trackId))}
                    />
                    <TrackDropdownButton
                      content="Delete Track"
                      icon={<BsTrash />}
                      onClick={() => dispatch(deleteTrack({ data: trackId }))}
                    />
                  </TabPanel>
                  <TabPanel>
                    {/* <TrackDropdownButton
                      content={`${isOtherCollapsed ? "Enlarge " : "Minify"} ${
                        track.type === "scale" ? "Children" : "Parents"
                      }`}
                      icon={<BsArrowsCollapse />}
                      onClick={() =>
                        dispatch(
                          track.type === "scale"
                            ? collapseTrackChildren(trackId, !isOtherCollapsed)
                            : collapseTrackParents(trackId, !isOtherCollapsed)
                        )
                      }
                    /> */}
                    {isPT && (
                      <TrackDropdownButton
                        content="Create Pattern Clip"
                        icon={<GiPaintBrush className="-rotate-90" />}
                        onClick={() =>
                          dispatch(
                            addClip({
                              data: initializePatternClip({
                                trackId,
                                patternId: dispatch(
                                  createPattern({ data: { trackId } })
                                ),
                                tick: getTransport().ticks,
                              }),
                            })
                          )
                        }
                      />
                    )}
                    <TrackDropdownButton
                      content="Create Pose Clip"
                      icon={<GiCrystalWand />}
                      onClick={() =>
                        dispatch(
                          addClip({
                            data: initializePoseClip({
                              trackId,
                              poseId: dispatch(
                                createPose({ data: { trackId } })
                              ),
                              tick: getTransport().ticks,
                            }),
                          })
                        )
                      }
                    />
                    {isPT && (
                      <TrackDropdownButton
                        content="Erase Pattern Clips"
                        icon={<BsEraser />}
                        onClick={() => dispatch(clearTrack(trackId, "pattern"))}
                      />
                    )}
                    <TrackDropdownButton
                      content="Erase Pose Clips"
                      icon={<BsEraser />}
                      onClick={() => dispatch(clearTrack(trackId, "pose"))}
                    />
                    <TrackDropdownButton
                      content="Erase All Media"
                      icon={<BsEraserFill />}
                      onClick={() => dispatch(clearTrack(trackId))}
                    />
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </MenuItems>
          </Transition>
        </>
      )}
    </Menu>
  );
};
