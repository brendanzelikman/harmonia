import { DataGridHandle } from "react-data-grid";
import * as Constants from "appConstants";
import { Row } from "..";
import { useEffect } from "react";

interface BackgroundProps {
  rows: Row[];
  timeline?: DataGridHandle;
  background?: React.RefObject<HTMLDivElement>;
}

// Timeline background so that the tracks can be scrolled
export default function DataGridBackground(props: BackgroundProps) {
  const { rows, timeline, background } = props;

  const trackRows = rows.filter((row) => !!row.trackId);
  const clearRows = rows.filter((row) => !row.trackId);

  const headerHeight = Constants.HEADER_HEIGHT;
  const trackRowHeight = Constants.CELL_HEIGHT * trackRows.length;
  const clearRowHeight = Constants.CELL_HEIGHT * clearRows.length;
  const backgroundHeight = headerHeight + trackRowHeight + clearRowHeight;

  useEffect(() => {
    if (!background?.current) return;
    if (!timeline) {
      background.current.style.top = `0px`;
    } else if (timeline.element) {
      background.current.style.top = `-${timeline.element.scrollTop}px`;
    }
  }, [timeline]);

  return (
    <>
      <div
        className="rdg-time-background absolute w-full bg-black top-0"
        style={{ height: headerHeight }}
      ></div>
      <div
        className="-z-20 absolute w-full flex flex-col bg-gradient-to-t from-[#083a8a] via-[#2c4087] to-[#514f7e]"
        ref={background}
        style={{ height: backgroundHeight }}
      >
        <div className="absolute w-full h-full">
          <div
            className="w-full bg-slate-500/80 shadow-xl"
            style={{ height: trackRowHeight, marginTop: headerHeight }}
          ></div>
          <div className="w-full " style={{ height: clearRowHeight }}></div>
        </div>
      </div>
    </>
  );
}
