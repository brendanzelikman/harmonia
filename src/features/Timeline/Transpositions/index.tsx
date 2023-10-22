import TimelineTransposition from "./Transposition";
import { createPortal } from "react-dom";
import { TranspositionId } from "types/Transposition";
import { selectTranspositionIds } from "redux/Transposition";
import { useProjectDeepSelector } from "redux/hooks";
import { TimelinePortalElement } from "..";

export function TimelineTranspositions(props: TimelinePortalElement) {
  const transpositionIds = useProjectDeepSelector(selectTranspositionIds);
  const { element } = props.timeline;
  if (!element || !transpositionIds.length) return null;

  const renderTransposition = (id: TranspositionId) => (
    <TimelineTransposition id={id} key={id} />
  );

  return createPortal(transpositionIds.map(renderTransposition), element);
}
