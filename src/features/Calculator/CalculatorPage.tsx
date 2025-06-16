import Calculator from "features/Calculator/Calculator";
import { useCalculatorAliases } from "features/Calculator/useCalculatorAliases";
import { useHotkeys } from "hooks/useHotkeys";
import { hotkeyMap } from "lib/hotkeys";
import { useTransport } from "hooks/useTransport";
import { useCalculatorTitle } from "./useCalculatorTitle";

export function CalculatorPage() {
  useCalculatorTitle();
  useCalculatorAliases();
  useTransport();
  useHotkeys(hotkeyMap);
  return <Calculator />;
}
