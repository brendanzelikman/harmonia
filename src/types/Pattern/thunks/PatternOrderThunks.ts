import { Payload } from "lib/redux";
import { reverse, shuffle } from "lodash";
import { mod } from "utils/math";
import { updatePattern } from "../PatternSlice";
import { PatternId, PatternStream } from "../PatternTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { selectPatternById } from "../PatternSelectors";

/** Phase a pattern by a certain number of steps. */
export const phasePattern =
  ({ data }: Payload<{ id: PatternId; phase: number }>): Thunk =>
  (dispatch, getProject) => {
    const { id, phase } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const length = pattern.stream.length;
    const stream: PatternStream = [];
    for (let i = 0; i < length; i++) {
      const index = mod(i + phase, length);
      stream.push(pattern.stream[index]);
    }

    dispatch(updatePattern({ data: { id, stream } }));
  };

/** Reverse the stream of a pattern. */
export const reversePattern =
  ({ data }: Payload<{ id: PatternId }>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const { id } = data;
    const pattern = selectPatternById(project, id);
    if (!pattern) return;
    dispatch(
      updatePattern({ data: { id, stream: reverse([...pattern.stream]) } })
    );
  };

/** Shuffle the stream of a pattern. */
export const shufflePatternStream =
  ({ data }: Payload<{ id: PatternId }>): Thunk =>
  (dispatch, getProject) => {
    const { id } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;
    dispatch(
      updatePattern({ data: { id, stream: shuffle([...pattern.stream]) } })
    );
  };
