import { Navbar } from "features/Navbar/Navbar";
import Calculator from "features/Calculator/Calculator";
import { useRedirects } from "hooks/useRedirects";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { useAppValue } from "hooks/useRedux";
import { useTitle } from "hooks/useTitle";

export function CalculatorPage() {
  const name = useAppValue(selectProjectName);
  const text = name.length ? name : "Calculator";
  useTitle(`${text} | Harmonia`);
  useRedirects();
  return (
    <div className="size-full relative pt-nav">
      <Navbar />
      <Calculator />
    </div>
  );
}
