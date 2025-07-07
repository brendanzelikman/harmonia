import { Thunk } from "types/Project/ProjectTypes";
import { defaultGameRanks, GameAction, GameRank } from "./GameTypes";
import {
  selectPoseClipMap,
  selectPoseClipTickMap,
} from "types/Clip/ClipSelectors";
import { secondsToTicks } from "utils/duration";
import { selectTransportBPM } from "types/Transport/TransportSelectors";
import { selectPoseById, selectPoseMap } from "types/Pose/PoseSelectors";
import { selectScaleTrackChainIdsMap } from "types/Track/TrackSelectors";
import {
  selectCurrentTimelineTick,
  selectSelectedPoseClips,
} from "types/Timeline/TimelineSelectors";
import { PoseVectorId } from "types/Pose/PoseTypes";
import {
  addGameActions,
  removeGameActionsAtTick,
  updateGame,
} from "./GameSlice";
import { selectGame, selectHasGame } from "./GameSelectors";
import { PoseClipId } from "types/Clip/ClipTypes";
import { removePoseClip } from "types/Clip/ClipSlice";
import { createUndoType } from "types/redux";
import { nanoid } from "@reduxjs/toolkit";
import { updateTimelineTick } from "types/Timeline/TimelineSlice";
import { promptUserForString } from "lib/prompts/html";

export const addPosesToGame =
  ({ replace }: { replace: boolean } = { replace: false }): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedPoseClips = selectSelectedPoseClips(project);
    const chainMap = selectScaleTrackChainIdsMap(project);

    const trackId = selectedPoseClips.at(0)?.trackId;
    if (!trackId) return;

    const poseClips = selectedPoseClips.filter(
      (clip) => clip.trackId === trackId
    );

    const actions: GameAction[] = [];
    const addedIds: PoseClipId[] = [];
    for (const clip of poseClips) {
      const pose = selectPoseById(project, clip.poseId);
      if (!pose?.vector) continue;
      const tick = clip.tick;
      const poseKeys = Object.keys(pose.vector) as PoseVectorId[];
      const chain = chainMap[clip.trackId];
      const id1 = chain.at(0);
      const id2 = chain.at(1);
      const id3 = chain.at(2);
      const keyMap = {
        [id1 ?? "q"]: "q",
        [id2 ?? "w"]: "w",
        [id3 ?? "e"]: "e",
        chordal: "r",
        chromatic: "t",
        octave: "y",
      };
      const key = poseKeys.reduce((acc, poseKey) => {
        const key = keyMap[poseKey];
        if (!key) return acc;
        if (acc.length) acc += `+${key}`;
        else acc = key;
        return acc;
      }, "");

      if (!key.length) continue;
      const value = pose.vector[poseKeys[0]] ?? 0;
      const action: GameAction = { tick, key, value };
      actions.push(action);
      addedIds.push(clip.id);
    }

    if (actions.length === 0) return;
    const undoType = createUndoType(nanoid());
    for (const id of addedIds) {
      dispatch(removePoseClip({ data: id, undoType }));
    }
    dispatch(updateGame({ data: { trackId }, undoType }));
    if (replace) {
      dispatch(updateGame({ data: { actions }, undoType }));
    } else {
      dispatch(addGameActions({ data: { actions }, undoType }));
    }
  };

export const removeGameActionsAtCurrentTick =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();
    const tick = selectCurrentTimelineTick(project);
    const game = selectGame(project);
    if (!game.actions.length) return;
    dispatch(removeGameActionsAtTick({ data: { tick } }));
  };

export const promptUserForGameCommand = (): Thunk => (dispatch, getProject) =>
  promptUserForString({
    title: "Add Instruction to Game",
    description: "Enter a key and a value (e.g. Q 5 or M 0)",
    callback: (string) => {
      const [key, value] = string.split(" ");
      if (!key || !value) return;
      const tick = selectCurrentTimelineTick(getProject());
      dispatch(addGameActions({ data: { actions: [{ key, value, tick }] } }));
    },
  })();

export const evaluateGameRank = (): Thunk<GameRank> => (_, getProject) => {
  const project = getProject();
  const bpm = selectTransportBPM(project);
  const game = selectGame(project);
  const leniency = Math.round(secondsToTicks(game.leniency / 1000, bpm));

  const poseMap = selectPoseMap(project);
  const poseClipMap = selectPoseClipMap(project);
  const poseClipTickMap = selectPoseClipTickMap(project);
  const chainMap = selectScaleTrackChainIdsMap(project);

  const total = game.actions.length;
  let correct = 0;

  game.actions.forEach((action) => {
    if (!action) return;
    const { tick, key, value } = action;
    for (let i = tick - leniency; i <= tick + leniency; i++) {
      if (i < 0) continue; // Skip negative ticks
      const clipIds = poseClipTickMap[i];
      if (!clipIds?.length) continue;
      const current = correct;
      for (const clipId of clipIds) {
        const clip = poseClipMap[clipId];
        if (!clip) continue;
        const pose = poseMap[clip.poseId];
        if (!pose?.vector) continue;
        if (key === "q") {
          const chain = chainMap[clip.trackId];
          if (!chain) continue;
          const trackId = chain.at(0);
          if (!trackId) continue;
          if (pose.vector[trackId] === value) {
            correct++;
            break;
          }
        } else if (key === "w") {
          const chain = chainMap[clip.trackId];
          if (!chain) continue;
          const trackId = chain.at(1);
          if (!trackId) continue;
          if (pose.vector[trackId] === value) {
            correct++;
            break;
          }
        } else if (key === "e") {
          const chain = chainMap[clip.trackId];
          if (!chain) continue;
          const trackId = chain.at(2);
          if (!trackId) continue;
          if (pose.vector[trackId] === value) {
            correct++;
            break;
          }
        } else if (key === "r") {
          if (pose.vector.chordal === value) {
            correct++;
            break;
          }
        } else if (key === "t") {
          if (pose.vector.chromatic === value) {
            correct++;
            break;
          }
        } else if (key === "y") {
          if (pose.vector.octave === value) {
            correct++;
            break;
          }
        }
      }
      // If we found a match, no need to check further ticks
      if (correct > current) {
        return;
      }
    }
  });
  const score = correct / total;
  return (
    game.ranks.findLast((rank) => score >= rank.percent) ?? defaultGameRanks[0]
  );
};

export const deleteGamePoses = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const hasGame = selectHasGame(project);
  if (!hasGame) return;
  const undoType = createUndoType("clearGame", nanoid());
  dispatch(updateTimelineTick({ data: null, undoType }));
  const game = selectGame(project);
  if (!game.trackId) return;
  if (!game.actions.length) return;
  const clipMap = selectPoseClipMap(project);
  const clipTickMap = selectPoseClipTickMap(project);
  const chainMap = selectScaleTrackChainIdsMap(project);

  for (const action of game.actions) {
    const { tick, key, value } = action;
    let found = false;
    for (let i = tick - game.leniency; i <= tick + game.leniency; i++) {
      if (i < 0) continue; // Skip negative ticks
      const clipIds = clipTickMap[i];
      if (!clipIds?.length) continue;
      for (const clipId of clipIds) {
        const clip = clipMap[clipId];
        if (!clip || clip.trackId !== game.trackId) continue;
        const pose = selectPoseById(project, clip.poseId);
        const trackId = clip.trackId;
        if (!pose?.vector) continue;
        const chain = chainMap[trackId];
        if (!chain) continue;
        const valueMap: Record<string, number | undefined> = {
          q: chain.at(0) ? pose.vector[chain[0]] : undefined,
          w: chain.at(1) ? pose.vector[chain[1]] : undefined,
          e: chain.at(2) ? pose.vector[chain[2]] : undefined,
          r: pose.vector.chordal,
          t: pose.vector.chromatic,
          y: pose.vector.octave,
        };
        if (valueMap[key] === value) {
          dispatch(removePoseClip({ data: clipId, undoType }));
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }
};
