import { Listbox, Transition } from "@headlessui/react";
import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, AppThunk, RootState } from "redux/store";
import {
  selectRoot,
  selectPatterns,
  selectCustomPatterns,
} from "redux/selectors";
import {
  clearTimelineState,
  hideEditor,
  setActivePattern,
  showEditor,
} from "redux/slices/root";
import Patterns, { Pattern, PatternId } from "types/patterns";
import { BsCheck, BsPencil } from "react-icons/bs";
import { useCallback, useEffect } from "react";
import { createPattern } from "redux/slices/patterns";

const mapStateToProps = (state: RootState) => {
  const { showingEditor, editorState, activePatternId } = selectRoot(state);
  const patterns = selectPatterns(state);
  const activePattern = activePatternId
    ? patterns.find((pattern) => pattern.id === activePatternId)
    : undefined;
  const customPatterns = selectCustomPatterns(state);
  return {
    onPatternsEditor: showingEditor && editorState === "patterns",
    patterns,
    activePattern,
    customPatterns,
  };
};

const onPatternsClick = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const { editorState, timelineState } = selectRoot(state);
  if (editorState === "patterns") {
    dispatch(hideEditor());
  } else {
    dispatch(showEditor({ id: "patterns" }));
  }
  if (timelineState !== "idle") {
    dispatch(clearTimelineState());
  }
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setPatternId: (patternId: PatternId) =>
      dispatch(setActivePattern(patternId)),
    onPatternsClick: () => {
      dispatch(onPatternsClick());
    },
    createNewPattern: () => {
      return dispatch(createPattern());
    },
  };
};

export const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = ConnectedProps<typeof connector>;

export default connector(PatternListbox);

function PatternListbox(props: Props) {
  const renderPattern = useCallback((pattern: Pattern) => {
    return (
      <Listbox.Option
        key={pattern.id}
        className={({ active }) =>
          `${
            active ? "text-white-800 bg-emerald-500" : "text-white-900"
          } cursor-default select-none font-light relative py-2 pl-4 pr-8`
        }
        value={pattern.id}
      >
        {({ selected, active }) => (
          <>
            <div className="flex items-center space-x-3">
              <span
                className={`${
                  selected ? "font-semibold" : "font-normal"
                } block truncate`}
              >
                {pattern.name}
              </span>
            </div>
            {selected ? (
              <span
                className={`${
                  active ? "text-white" : "text-emerald-600"
                } absolute inset-y-0 right-0 flex items-center pr-2`}
              >
                <BsCheck className="text-xl" />
              </span>
            ) : null}
          </>
        )}
      </Listbox.Option>
    );
  }, []);

  useEffect(() => {
    if (!props.activePattern) {
      const firstPattern = props.patterns?.[0];
      if (firstPattern) {
        props.setPatternId(firstPattern.id);
      }
      return;
    }
    props.setPatternId(props.activePattern.id);
  }, [props.activePattern, props.patterns]);

  const PatternGroups: Record<string, Pattern[]> = {
    ...Patterns.PresetGroups,
    "Custom Patterns": props.customPatterns,
  };

  const isPatternInCategory = (pattern: Pattern, category: string) => {
    return PatternGroups[category].some((m) => m.id === pattern.id);
  };

  return (
    <div
      className={`w-[10.5rem] relative flex flex-col rounded-md select-none border rounded-b-md ${
        props.onPatternsEditor
          ? "border-slate-50 ring-1 ring-slate-50/80"
          : "border-slate-400/80"
      }`}
    >
      <label
        className={`absolute text-xs text-emerald-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-1 left-1`}
      >
        Selected Pattern
      </label>
      <Listbox
        value={props.activePattern?.id ?? ""}
        onChange={props.setPatternId}
      >
        {({ open }) => (
          <div className={`relative`}>
            <Listbox.Button className="select-none relative w-full h-10 items-center flex cursor-pointer rounded-md bg-gray-900 text-white text-left shadow-md focus:outline-none">
              <span
                className={`block w-full truncate px-1.5 text-[14px] text-gray-200 font-thin ${
                  !props.activePattern?.id ? "opacity-75" : "opacity-100"
                }`}
              >
                {props.activePattern?.name}
              </span>

              <div
                id="pattern-button"
                className="flex px-1 h-full justify-center items-center border-l border-l-slate-400"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (props.activePattern?.id) props.onPatternsClick();
                }}
              >
                <BsPencil
                  className={`${
                    props.onPatternsEditor
                      ? "text-emerald-400 animate-pulse"
                      : "text-white"
                  }`}
                />
              </div>
            </Listbox.Button>
            <Transition
              show={open}
              enter="transition ease-out duration-75"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Listbox.Options className="absolute z-10 w-full py-1 border border-white/50 text-base bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {Patterns.PresetCategories.map((category) => (
                  <div
                    key={category}
                    className={`group relative h-full bg-slate-300/50 ${
                      [
                        "Basic Durations",
                        "Basic Patterns",
                        "Custom Patterns",
                      ].includes(category)
                        ? "pt-0.5"
                        : ""
                    }`}
                  >
                    <div
                      className={`px-3 py-2 text-sm font-medium text-white bg-slate-800 ${
                        props.activePattern &&
                        isPatternInCategory(props.activePattern, category)
                          ? "text-emerald-500"
                          : "bg-slate-800"
                      } group-hover:bg-emerald-600 group-hover:text-white`}
                    >
                      {category}
                    </div>
                    <div className="bg-slate-800 border border-white/50 rounded z-50 top-0 right-0 translate-x-[100%] absolute hidden group-hover:block">
                      <div className="h-full flex flex-col">
                        {PatternGroups[category].map((pattern) =>
                          renderPattern(pattern)
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
}
