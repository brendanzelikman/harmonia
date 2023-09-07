import { Listbox, Transition } from "@headlessui/react";
import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, AppThunk, RootState } from "redux/store";
import {
  selectRoot,
  selectPatterns,
  selectCustomPatterns,
  selectSelectedPattern,
  selectEditor,
  selectTimeline,
} from "redux/selectors";
import { setSelectedPattern } from "redux/slices/root";
import Patterns, { Pattern, PatternId } from "types/pattern";
import { BsCheck, BsPencil } from "react-icons/bs";
import { useCallback, useEffect } from "react";
import { createPattern } from "redux/slices/patterns";
import { hideEditor, showEditor } from "redux/slices/editor";
import { clearTimelineState } from "redux/slices/timeline";
import {
  PresetPatternGroupList,
  PresetPatternGroupMap,
} from "types/presets/patterns";

const mapStateToProps = (state: RootState) => {
  const editor = selectEditor(state);
  const patterns = selectPatterns(state);
  const selectedPattern = selectSelectedPattern(state);
  const customPatterns = selectCustomPatterns(state);
  return {
    onPatternsEditor: editor.show && editor.id === "patterns",
    patterns,
    selectedPattern,
    customPatterns,
  };
};

const onPatternsClick = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const editor = selectEditor(state);
  const timeline = selectTimeline(state);
  if (editor.id === "patterns") {
    dispatch(hideEditor());
  } else {
    dispatch(showEditor({ id: "patterns" }));
  }
  if (timeline.state !== "idle") {
    dispatch(clearTimelineState());
  }
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setSelectedPattern: (patternId: PatternId) =>
      dispatch(setSelectedPattern(patternId)),
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
          } cursor-default select-none font-light relative py-1.5 pl-4 pr-8`
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
    if (!props.selectedPattern) {
      const firstPattern = props.patterns?.[0];
      if (firstPattern) {
        props.setSelectedPattern(firstPattern.id);
      }
      return;
    }
    props.setSelectedPattern(props.selectedPattern.id);
  }, [props.selectedPattern, props.patterns]);

  const PatternGroups: Record<string, Pattern[]> = {
    ...PresetPatternGroupMap,
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
        value={props.selectedPattern?.id ?? ""}
        onChange={props.setSelectedPattern}
      >
        {({ open }) => (
          <div className={`relative`}>
            <Listbox.Button className="select-none relative w-full h-10 items-center flex cursor-pointer rounded-md bg-gray-900 text-white text-left shadow-md focus:outline-none">
              <span
                className={`block w-full truncate px-1.5 text-[14px] text-gray-200 font-light ${
                  !props.selectedPattern?.id ? "opacity-75" : "opacity-100"
                }`}
              >
                {props.selectedPattern?.name}
              </span>

              <div
                id="pattern-button"
                className="flex px-1 h-full justify-center items-center border-l border-l-slate-400"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (props.selectedPattern?.id) props.onPatternsClick();
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
              <Listbox.Options className="font-nunito absolute z-10 w-full py-1 bg-slate-900 border border-white/50 text-base rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {PresetPatternGroupList.map((category) => (
                  <div
                    key={category}
                    className={`group relative h-full bg-slate-300/50 ${
                      [
                        "Basic Chords",
                        "Basic Melodies",
                        "Basic Durations",
                        "Simple Rhythms",
                      ].includes(category)
                        ? "pt-0.5"
                        : ""
                    }`}
                  >
                    <div
                      className={`px-3 py-1.5 text-sm font-light text-white bg-slate-900/90 backdrop-blur ${
                        props.selectedPattern &&
                        isPatternInCategory(props.selectedPattern, category)
                          ? "text-emerald-500"
                          : "bg-slate-800"
                      } group-hover:bg-emerald-600 group-hover:text-white`}
                    >
                      {category}
                    </div>
                    <div className="font-nunito bg-slate-800 border border-white/50 rounded z-50 top-0 right-0 translate-x-[100%] absolute hidden group-hover:block">
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
