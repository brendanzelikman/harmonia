// --------------------------------------------------------
// Order Effects
// --------------------------------------------------------

import { useAppDispatch } from "hooks/useRedux";
import {
  PoseClipBaseEffect,
  addTransformation,
  BasePoseClipEffectProps,
} from "./PoseClipStore";
import {
  getCategoryTransformations,
  Transformation,
  TRANSFORMATION_CATEGORIES,
  TransformationArgs,
  TransformationCategory,
  TRANSFORMATIONS,
} from "types/Pattern/PatternTransformers";
import { isBoolean, startCase } from "lodash";
import { Switch } from "@headlessui/react";
import { useMemo, useState } from "react";
import {
  removePoseBlockTransformation,
  swapPoseBlockTransformation,
  updatePose,
  updatePoseBlock,
  updatePoseBlockTransformation,
} from "types/Pose/PoseSlice";
import {
  BsArrowLeft,
  BsArrowRight,
  BsPlusCircle,
  BsTrash,
} from "react-icons/bs";
import classNames from "classnames";
import { sanitize } from "utils/math";
import { blurOnEnter } from "utils/event";
import { PoseBlock, PoseTransformation } from "types/Pose/PoseTypes";
import {
  PoseClipDropdownContainer,
  PoseClipDropdownEffectProps,
  PoseClipDropdownItem,
} from "./PoseClipDropdown";
import { isNumber, isString } from "types/utils";
import { promptUserForString } from "lib/prompts/html";
import { promptLineBreak } from "components/PromptModal";

export interface PoseClipEffectsProps extends PoseClipDropdownEffectProps {
  block: PoseBlock | undefined;
}
export const PoseClipEffects = (props: PoseClipEffectsProps) => {
  const dispatch = useAppDispatch();
  const { block, vector, ...effectProps } = props;
  const [view, setView] = useState<"effects" | "scripts" | "store">("effects");
  const [category, setCategory] = useState<TransformationCategory>("order");
  const operations =
    (block && "operations" in block ? block?.operations : props.operations) ??
    [];
  const scripts = block && "scripts" in block ? block.scripts ?? [] : [];
  const operationCount = operations.length;
  return (
    <div className="flex gap-2 total-center">
      <PoseClipBaseEffect border="border border-fuchsia-400">
        <PoseClipDropdownContainer>
          <PoseClipDropdownItem
            active={view === "effects"}
            onClick={() => setView("effects")}
          >
            Operations
          </PoseClipDropdownItem>
          <PoseClipDropdownItem
            active={view === "store"}
            onClick={() => setView("store")}
          >
            Add Effect
          </PoseClipDropdownItem>
          <PoseClipDropdownItem
            className="active:text-fuchsia-400"
            onClick={() => {
              dispatch(
                updatePose({
                  id: props.clip.poseId,
                  operations: [...operations, { id: "script", args: "" }],
                })
              );
              setView("effects");
            }}
          >
            Add Script
          </PoseClipDropdownItem>
          <PoseClipDropdownItem
            className="active:text-fuchsia-400"
            onClick={() => {
              setView("effects");
              block
                ? dispatch(
                    updatePoseBlock({
                      id: props.clip.poseId,
                      index: 0,
                      block: { ...props.block, operations: [] },
                    })
                  )
                : dispatch(
                    updatePose({
                      id: props.clip.poseId,
                      operations: undefined,
                    })
                  );
            }}
          >
            Clear All
          </PoseClipDropdownItem>
        </PoseClipDropdownContainer>
      </PoseClipBaseEffect>
      {view === "effects" && (
        <>
          {operations.length ? (
            operations.map((operation, field) => (
              <PoseClipEffect
                {...effectProps}
                key={`${operation.id}-${field}`}
                index={field}
                id={operation.id}
                transformation={TRANSFORMATIONS[operation.id]}
                field={field}
                givenArgs={operation.args}
                operationCount={operationCount}
                setView={setView}
                operations={operations}
                onBase={block === undefined}
              />
            ))
          ) : (
            <PoseClipBaseEffect
              className="h-full opacity-50 total-center bg-slate-900"
              border="border-fuchsia-400"
            >
              No Effects
            </PoseClipBaseEffect>
          )}
        </>
      )}
      {view === "scripts" && (
        <>
          {scripts.length ? (
            scripts.map((script, i) => (
              <PoseClipBaseEffect>
                <div>Script</div>
                {script}
              </PoseClipBaseEffect>
            ))
          ) : (
            <PoseClipBaseEffect
              className="h-full opacity-50 total-center bg-slate-900"
              border="border-fuchsia-400"
            >
              No Scripts
            </PoseClipBaseEffect>
          )}
        </>
      )}

      {view === "store" && (
        <div className="flex gap-2 items-center">
          <PoseClipBaseEffect border="border border-fuchsia-400">
            <PoseClipDropdownContainer>
              {TRANSFORMATION_CATEGORIES.map((c) => (
                <PoseClipDropdownItem
                  key={c}
                  active={c === category}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </PoseClipDropdownItem>
              ))}
            </PoseClipDropdownContainer>
          </PoseClipBaseEffect>
          {getCategoryTransformations(category).map((transformation) => (
            <PoseClipEffect
              {...effectProps}
              key={`${category}-${transformation.id}`}
              id={transformation.id}
              index={0}
              transformation={transformation}
              givenArgs={transformation.defaultValue}
              addButton
              operations={operations}
              onBase={block === undefined}
              operationCount={operationCount}
              setView={setView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export type PoseClipEffectProps<T extends Transformation> =
  React.HTMLAttributes<HTMLDivElement> & {
    onBase?: boolean;
    operations?: PoseTransformation[];
    operationCount: number;
    transformation: (typeof TRANSFORMATIONS)[T];
    setView: (view: "effects" | "store") => void;
  } & BasePoseClipEffectProps<T> &
    (
      | {
          addButton: boolean;
        }
      | { field: number }
    );

export const PoseClipEffect = <T extends Transformation>({
  id,
  transformation,
  givenArgs,
  clip,
  index,
  operationCount,
  onBase,
  operations,
  ...rest
}: PoseClipEffectProps<T>) => {
  const dispatch = useAppDispatch();
  const hasIndex = "field" in rest;
  const inStore = "addButton" in rest && rest.addButton;

  const [internalArgs, setInternalArgs] =
    useState<TransformationArgs<T>>(givenArgs);
  const displayedArgs = inStore ? internalArgs : givenArgs;

  const updateTransformation = (args: TransformationArgs<T>) => {
    args = isString(args)
      ? args.replace("window", "").replace("location", "").replace("reload", "")
      : args;
    if (inStore) setInternalArgs(args);
    else if (!onBase && hasIndex) {
      const { field: transformationIndex } = rest;
      dispatch(
        updatePoseBlockTransformation({
          id: clip.poseId,
          index,
          transformationIndex,
          transformation: { args },
        })
      );
    } else {
      dispatch(
        updatePose({
          id: clip.poseId,
          operations: (operations ?? []).map((operation, field) =>
            field === index ? { id, args } : operation
          ),
        })
      );
    }
  };

  const isArgsNumber = isNumber(displayedArgs);
  const isArgsString = isString(displayedArgs);
  const isScriptValid = useMemo(() => {
    if (id !== "script") return false;
    let args = displayedArgs
      .replace("window", "")
      .replace("location", "")
      .replace("reload", "");
    try {
      const fn = new Function("note", "index", args);
      const res = fn(0, 0);
      return isNumber(res);
    } catch {
      return false;
    }
  }, [displayedArgs]);

  return (
    <PoseClipBaseEffect className={"flex-col gap-1 justify-evenly"}>
      <div className="capitalize">{startCase(id)}</div>
      {id === "script" ? (
        <div
          data-valid={isScriptValid}
          className={`border cursor-pointer hover:opacity-85 px-2 rounded data-[valid=true]:border-emerald-400 data-[valid=false]:border-rose-400`}
          onClick={promptUserForString({
            title: "Script",
            textarea: true,
            large: true,
            description: [
              `Please write a script that returns a number.`,
              promptLineBreak,
              `You can use the following variables:`,
              `- \`note\` (the MIDI number of the note)`,
              `- \`index\` (the index within the stream)`,
              promptLineBreak,
              `Current Script:`,
              promptLineBreak,
              <code>{`(note, index) => {`}</code>,
              <span className="ml-2">
                <code>
                  {displayedArgs ? displayedArgs : "[code will go here]"}
                </code>
              </span>,
              <code>{`}`}</code>,
            ],
            defaultValue: displayedArgs,
            onSubmit: (input) => updateTransformation(input),
          })}
        >
          Click to Edit
        </div>
      ) : isArgsNumber || isArgsString ? (
        <input
          type={isArgsNumber ? "number" : "text"}
          className={classNames(
            "w-24 text-center rounded-lg border-none bg-white/5 h-5 text-sm/6 text-white placeholder:text-slate-500",
            "focus:outline-none focus:outline-2 focus:-outline-offset-2 focus:-outline-white/25"
          )}
          placeholder={transformation.placeholder}
          value={String(displayedArgs).replace(/^0/, "")}
          onKeyDown={blurOnEnter}
          onChange={(e) =>
            updateTransformation(
              isArgsNumber
                ? sanitize(e.currentTarget.valueAsNumber)
                : e.currentTarget.value
            )
          }
        />
      ) : isBoolean(displayedArgs) ? (
        <Switch
          checked={displayedArgs}
          onChange={updateTransformation}
          className="group relative flex h-5 w-14 cursor-pointer rounded-full bg-white/10 p-1 outline-white data-[checked=true]:bg-white/10"
        >
          <span
            data-checked={displayedArgs}
            aria-hidden="true"
            className="pointer-events-none inline-block size-3 translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out data-[checked=true]:translate-x-9 data-[checked=true]:bg-emerald-300"
          />
        </Switch>
      ) : null}
      {!inStore && hasIndex && (
        <div className="flex size-full px-1 gap-4 items-center">
          <span className="mr-auto rounded-full size-5 text-fuchsia-300 total-center flex border border-white/10">
            {isString(rest.field) ? "S" : rest.field + 1}
          </span>
          {operationCount > 1 && (
            <>
              <BsArrowLeft
                className={
                  rest.field === 0
                    ? "opacity-25"
                    : "cursor-pointer active:opacity-75"
                }
                onClick={() => {
                  dispatch(
                    swapPoseBlockTransformation({
                      id: clip.poseId,
                      index,
                      transformationIndex: rest.field,
                      newIndex: rest.field - 1,
                      depths: rest.depths,
                      updateBase: onBase,
                    })
                  );
                }}
              />
              <BsArrowRight
                className={
                  rest.field === operationCount - 1
                    ? "opacity-25"
                    : "cursor-pointer active:opacity-75"
                }
                onClick={() => {
                  dispatch(
                    swapPoseBlockTransformation({
                      id: clip.poseId,
                      index,
                      transformationIndex: rest.field,
                      newIndex: rest.field + 1,
                      depths: rest.depths,
                      updateBase: onBase,
                    })
                  );
                }}
              />
            </>
          )}
          <BsTrash
            className="ml-auto cursor-pointer active:opacity-75"
            onClick={() => {
              dispatch(
                removePoseBlockTransformation({
                  id: clip.poseId,
                  index,
                  transformationIndex: rest.field,
                  depths: rest.depths,
                  updateBase: onBase,
                })
              );
            }}
          />
        </div>
      )}
      {inStore && (
        <button
          onClick={() => {
            dispatch(
              addTransformation({
                id,
                clip,
                index,
                depths: rest.depths,
                givenArgs: displayedArgs,
                updateBase: onBase,
              })
            );
            rest.setView("effects");
          }}
          className="mt-auto mb-1 text-lg text-emerald-500 rounded-lg active:opacity-75"
        >
          <BsPlusCircle />
        </button>
      )}
    </PoseClipBaseEffect>
  );
};
