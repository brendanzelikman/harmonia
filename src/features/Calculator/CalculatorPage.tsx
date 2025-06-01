import Calculator from "features/Calculator/Calculator";
import { useRedirects } from "hooks/useRedirects";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { useAppValue } from "hooks/useRedux";
import { useTitle } from "hooks/useTitle";
import { useHotkeys } from "hooks/useHotkeys";
import { hotkeyMap } from "lib/hotkeys";
import { useTransport } from "hooks/useTransport";

export function CalculatorPage() {
  useRedirects();
  useTransport();
  useHotkeys(hotkeyMap);

  // Set the page title based on the project name
  const name = useAppValue(selectProjectName);
  const text = name.length ? name : "Calculator";
  useTitle(`${text} | Harmonia`);

  return (
    <div className="size-full relative pt-nav">
      <Calculator />
    </div>
  );
}
