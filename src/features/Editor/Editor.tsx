import { useDeep } from "types/hooks";
import { InstrumentEditor } from "./InstrumentEditor/InstrumentEditor";
import { selectIsEditingTracks } from "types/Timeline/TimelineSelectors";

export function Editor() {
  const isOpen = useDeep(selectIsEditingTracks);
  if (!isOpen) return null;
  return (
    <div
      data-visible={isOpen}
      className="w-[calc(100%-300px)] top-0 right-0 h-full z-[91] absolute bg-gradient-to-t from-[#09203f] to-[#33454b] font-nunito transition-all data-[visible=true]:visible data-[visible=true]:animate-in data-[visible=true]:fade-in data-[visible=false]:invisible data-[visible=false]:animate-out data-[visible=false]:fade-out data-[visible=false]:pointer-events-none"
    >
      <InstrumentEditor />
    </div>
  );
}
