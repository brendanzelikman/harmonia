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
  viewEditor,
} from "redux/slices/root";
import Patterns, { Pattern, PatternId } from "types/patterns";
import { BsCheck, BsChevronUp, BsPencil } from "react-icons/bs";
import { Fragment, useCallback, useEffect } from "react";

const mapStateToProps = (state: RootState) => {
  const { showEditor, editorState, activePatternId } = selectRoot(state);
  const patterns = selectPatterns(state);
  const activePattern = activePatternId
    ? patterns.find((pattern) => pattern.id === activePatternId)
    : undefined;
  const customPatterns = selectCustomPatterns(state);
  return {
    onPatternsEditor: showEditor && editorState === "patterns",
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
    dispatch(viewEditor({ id: "patterns" }));
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
      className={`w-40 h-full flex flex-col border rounded-md ${
        props.onPatternsEditor ? "border-slate-50" : "border-slate-400/80"
      } select-none`}
    >
      <Listbox
        value={props.activePattern?.id ?? ""}
        onChange={props.setPatternId}
      >
        <div className="relative">
          <Listbox.Button className="relative w-full h-full cursor-default rounded-md bg-gray-900 text-white p-2 py-2.5 text-left shadow-md focus:outline-none">
            <span
              className={`block truncate mr-4 ${
                !props.activePattern?.id ? "opacity-75" : "opacity-100"
              }`}
            >
              {props.activePattern?.name}
            </span>
            {props.activePattern?.id ? (
              <span
                className={`absolute inset-y-0 right-0 top-0 flex justify-center items-center px-1 ${
                  props.onPatternsEditor
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-600 text-emerald-200"
                } rounded-r cursor-pointer`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (props.activePattern?.id) props.onPatternsClick();
                }}
              >
                <BsPencil className="text-xl" />
              </span>
            ) : (
              <span className="absolute inset-y-0 right-0 top-0 flex justify-center items-center px-1 bg-slate-500 rounded-r cursor-pointer">
                <BsChevronUp className="text-xl text-slate-200" />
              </span>
            )}
          </Listbox.Button>
          <Listbox.Options
            style={{ animation: "fade-in 0.2s" }}
            className="transition-opacity absolute z-10 w-full py-1 border border-white/50 text-base bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            {Patterns.PresetCategories.map((category) => (
              <div
                key={category}
                className={`group relative w-full h-full bg-slate-300/50 ${
                  ["Basic Durations", "Custom Patterns"].includes(category)
                    ? "pt-0.5"
                    : ""
                }`}
              >
                <div
                  className={`px-4 py-2 text-sm font-medium text-white bg-slate-800 ${
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
        </div>
      </Listbox>
    </div>
  );
}
