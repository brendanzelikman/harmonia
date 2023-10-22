import { Listbox, Transition } from "@headlessui/react";
import {
  selectPatterns,
  selectCustomPatterns,
  selectSelectedPattern,
  selectEditor,
} from "redux/selectors";
import { Pattern, PatternId } from "types/Pattern";
import { BsCheck } from "react-icons/bs";
import { useCallback, useEffect } from "react";
import {
  PresetPatternGroupList,
  PresetPatternGroupMap,
} from "presets/patterns";
import { blurOnMouseUp } from "utils";
import {
  useProjectDispatch,
  useProjectSelector,
  useProjectDeepSelector,
} from "redux/hooks";
import { isEditorOn } from "types/Editor";
import { updateMediaDraft } from "redux/Timeline";

export function NavbarPatternListbox() {
  const dispatch = useProjectDispatch();
  const editor = useProjectSelector(selectEditor);
  const patterns = useProjectDeepSelector(selectPatterns);
  const customPatterns = useProjectDeepSelector(selectCustomPatterns);
  const selectedPattern = useProjectSelector(selectSelectedPattern);
  const onPatternEditor = isEditorOn(editor, "patterns");
  const setSelectedPattern = (patternId: PatternId) => {
    dispatch(updateMediaDraft({ clip: { patternId } }));
  };

  // Set the selected pattern to the first pattern in the list.
  useEffect(() => {
    if (!selectedPattern) {
      setSelectedPattern(patterns[0]?.id);
    }
  }, [selectedPattern, patterns]);

  // Compile the pattern groups with the custom patterns
  const PatternGroups: Record<string, Pattern[]> = {
    ...PresetPatternGroupMap,
    "Custom Patterns": customPatterns,
  };

  /**
   * Render a pattern in the listbox.
   */
  const renderPattern = useCallback(
    (pattern: Pattern) => {
      const isPatternSelected = selectedPattern?.id === pattern.id;
      const patternFont = isPatternSelected ? "font-semibold" : "font-normal";
      const patternColor = (active: boolean) => {
        if (isPatternSelected && !active) return "text-emerald-500";
        return "text-white";
      };
      return (
        <Listbox.Option
          key={pattern.id}
          className={({ active }) =>
            `${
              active ? "bg-emerald-500 text-white" : ""
            } text-white cursor-default select-none font-light relative py-1.5 pl-4 pr-8`
          }
          value={pattern.id}
        >
          {({ active }) => (
            <div className={patternColor(active)}>
              <span className={`block truncate ${patternFont}`}>
                {pattern.name}
              </span>
              {isPatternSelected ? (
                <span
                  className={`absolute inset-y-0 right-0 flex items-center pr-2 text-xl`}
                >
                  <BsCheck />
                </span>
              ) : null}
            </div>
          )}
        </Listbox.Option>
      );
    },
    [selectedPattern]
  );

  /**
   * Render a pattern category in the listbox.
   */
  const renderPatternCategory = useCallback(
    (category: string) => {
      const newCategoryPatterns = [
        "Basic Chords",
        "Basic Melodies",
        "Straight Durations",
        "Simple Rhythms",
      ];

      // Get the category style
      const isPadded = newCategoryPatterns.includes(category);
      const categoryPadding = isPadded ? "pt-0.5" : "pt-0";
      const categoryClass = `${categoryPadding} group relative h-full bg-slate-300/50`;

      // Get the label style
      const isCategorySelected =
        selectedPattern && isPatternInCategory(selectedPattern, category);
      const labelColor = isCategorySelected ? "text-emerald-400" : "text-white";
      const labelClass = `px-3 py-1.5 text-sm font-light backdrop-blur bg-slate-800 ${labelColor} group-hover:bg-emerald-600 group-hover:text-white`;

      // Get the options style
      const optionsClass = `font-nunito bg-slate-800 border border-white/50 rounded top-0 right-0 translate-x-[100%] absolute hidden group-hover:block`;

      return (
        <div key={category} className={categoryClass}>
          <div className={labelClass}>{category}</div>
          <div className={optionsClass}>
            <div className="h-full flex flex-col">
              {PatternGroups[category].map((pattern) => renderPattern(pattern))}
            </div>
          </div>
        </div>
      );
    },
    [selectedPattern]
  );

  /**
   * Checks if a pattern is in a given category.
   */
  const isPatternInCategory = (pattern: Pattern, category: string) => {
    return PatternGroups[category].some((m) => m.id === pattern.id);
  };

  /**
   * The selected pattern is displayed in the listbox button.
   */
  const SelectedPatternName = () => {
    const opacity = !selectedPattern?.id ? "opacity-75" : "opacity-100";
    const name = !selectedPattern?.id ? "No Pattern" : selectedPattern.name;
    const nameClass = `block w-full truncate px-1.5 text-[14px] text-gray-200 font-light whitespace-nowrap ${opacity}`;
    return <span className={nameClass}>{name}</span>;
  };

  /**
   * Clicking on the Pattern Listbox button toggles the dropdown menu.
   */
  const PatternListboxButton = () => (
    <Listbox.Button
      className="select-none relative w-full h-10 items-center flex cursor-pointer rounded-md bg-gray-900 text-white text-left shadow-md focus:outline-none"
      onMouseUp={blurOnMouseUp}
    >
      <SelectedPatternName />
      {/* <PatternEditorButton /> */}
    </Listbox.Button>
  );

  /**
   * The Pattern Dropdown Menu shows all custom and preset patterns.
   */
  const PatternDropdownMenu = (props: { open: boolean }) => (
    <Transition
      show={props.open}
      appear
      enter="transition-all ease-out duration-75"
      enterFrom="transform opacity-0 scale-90"
      enterTo="transform opacity-100 scale-100"
      leave="transition-all ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-90"
    >
      <Listbox.Options className="font-nunito absolute z-10 w-full py-1 bg-slate-800 border border-white/50 text-base rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        {PresetPatternGroupList.map(renderPatternCategory)}
      </Listbox.Options>
    </Transition>
  );

  /**
   * The Pattern Listbox is a dropdown menu that allows the user to select a pattern.
   */
  const PatternListbox = () => {
    return (
      <Listbox value={selectedPattern?.id ?? ""} onChange={setSelectedPattern}>
        {({ open }) => (
          <div className="relative">
            <PatternListboxButton />
            {PatternDropdownMenu({ open })}
          </div>
        )}
      </Listbox>
    );
  };

  /**
   * The Pattern Label is a small label for the Pattern Listbox.
   */
  const PatternLabel = () => (
    <span
      className={`absolute text-xs text-emerald-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-1 left-1`}
    >
      Selected Pattern
    </span>
  );

  // Assemble the classname
  const borderClass = onPatternEditor
    ? "border-green-400 ring-1 ring-green-400"
    : "border-slate-400/80";

  const className = `w-40 z-[80] relative flex flex-col rounded-md select-none border rounded-b-md ${borderClass}`;

  // Return the component
  return (
    <div className={className}>
      <PatternLabel />
      {PatternListbox()}
    </div>
  );
}
