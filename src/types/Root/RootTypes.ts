/**
 * The `Root` interface contains general, high-level info about the project.
 * @property `projectName` - The name of the project.
 * @property `showingShortcuts` - Whether the shortcuts modal is showing.
 * @property `tour` - The current tour state.
 */

interface RootTour {
  show: boolean;
  step: number;
  id: string;
}

export interface Root {
  projectName: string;
  showingShortcuts: boolean;
  tour: RootTour;
}

export const defaultRoot: Root = {
  projectName: "New Project",
  showingShortcuts: false,
  tour: {
    show: false,
    step: 0,
    id: "",
  },
};

/**
 * Checks if a given object is of type `Root`.
 * @param obj The object to check.
 * @returns True if the object is a `Root`, otherwise false.
 */
export const isRoot = (obj: unknown): obj is Root => {
  const candidate = obj as Root;
  return (
    candidate?.projectName !== undefined &&
    candidate?.tour !== undefined &&
    candidate?.showingShortcuts !== undefined
  );
};
