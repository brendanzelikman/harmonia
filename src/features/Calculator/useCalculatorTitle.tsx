import { useAppValue } from "hooks/useRedux";
import { useTitle } from "hooks/useTitle";
import { selectProjectName } from "types/Meta/MetaSelectors";

/** Set the page title based on the project name */
export const useCalculatorTitle = () => {
  const name = useAppValue(selectProjectName);
  const text = name.length ? name : "Calculator";
  useTitle(`${text} | Harmonia`);
};
