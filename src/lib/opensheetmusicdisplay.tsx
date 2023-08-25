import { useEffect, useRef, useState } from "react";
import {
  IOSMDOptions,
  OpenSheetMusicDisplay as OSMD,
} from "opensheetmusicdisplay";

interface OSMDProps {
  id: string;
  xml: string;
  noteCount: number;
  className?: string;
  noteClassName?: string;
  options?: IOSMDOptions;
}

interface OSMDReturn {
  score: JSX.Element;
  osmd?: OSMD;
  cursor: {
    index: number;
    setIndex: (index: number) => void;
    hidden: boolean;
    show: () => void;
    hide: () => void;
    next: () => void;
    prev: () => void;
  };
}

export default function useOSMD({
  id,
  xml,
  noteCount,
  className,
  noteClassName,

  options,
}: OSMDProps): OSMDReturn {
  const ref = useRef<HTMLDivElement>(null);
  const [osmd, setOSMD] = useState<OSMD>();

  const osmdOptions: IOSMDOptions = {
    autoResize: true,
    drawTitle: false,
    drawSubtitle: false,
    drawPartNames: false,
    drawMeasureNumbers: false,
    drawTimeSignatures: false,
    ...options,
  };

  const [cursorIndex, setCursorIndex] = useState(0);
  const [showingCursor, setShowingCursor] = useState(false);
  const showCursor = () => {
    if (!showingCursor && osmd?.cursor && noteCount > 0) {
      osmd.cursor.show();
      setShowingCursor(true);
    }
  };
  const hideCursor = () => {
    if (showingCursor && osmd?.cursor) {
      osmd.cursor.hide();
      setShowingCursor(false);
    }
  };
  const nextCursor = () => {
    if (noteCount && cursorIndex === noteCount - 1) return;
    if (osmd?.cursor) {
      osmd.cursor.next();
      setCursorIndex((index) =>
        noteCount ? Math.min(noteCount, index + 1) : index + 1
      );
    }
  };
  const prevCursor = () => {
    if (cursorIndex === 0) return;
    if (osmd?.cursor) {
      osmd.cursor.previous();
      setCursorIndex((index) => Math.max(0, index - 1));
    }
  };

  useEffect(() => {
    if (!ref.current) return;

    let score: OSMD;
    const marginX = 3;
    const marginY = 2;
    const zoom = 1.1;

    const doesScoreExist = !!osmd;
    const doesCanvasExist = !!document.getElementById("osmdCanvasPage1");

    if (doesScoreExist && doesCanvasExist) {
      score = osmd;
    } else {
      score = new OSMD(ref.current, osmdOptions);

      score.EngravingRules.LastSystemMaxScalingFactor = 2.5;
      score.EngravingRules.PageLeftMargin = marginX;
      score.EngravingRules.PageRightMargin = marginX;
      score.EngravingRules.PageTopMargin = marginY;
      score.EngravingRules.PageBottomMargin = marginY;
      setOSMD(score);
    }

    score
      .load(xml)
      .then(() => {
        score.zoom = zoom;
        score.render();
      })
      .finally(() => {
        setTimeout(() => {
          if (showingCursor && osmd?.cursor) {
            // Set the style of the cursor
            osmd.cursor.cursorElement.style.height = `${Math.round(
              120 * zoom
            )}px`;
            osmd.cursor.cursorElement.style.backgroundColor = "turquoise";
            osmd.cursor.cursorElement.style.opacity = "0.5";

            // Keep showing the cursor if there are notes
            if (noteCount > 0) {
              osmd.cursor.show();
              setShowingCursor(true);
            } else {
              osmd.cursor.hide();
              setShowingCursor(false);
            }
            // Clamp the cursor index if it's out of bounds
            if (cursorIndex > noteCount) {
              setCursorIndex(noteCount - 1);
            } else {
              // Otherwise, move the cursor to the correct index
              if (cursorIndex > 0) {
                for (let i = 0; i < cursorIndex; i++) {
                  score.cursor.next();
                }
              }
            }
          }
          // Add a click listener to each note
          const notes = document.querySelectorAll(`.vf-stavenote`);
          const length = notes.length / 2;

          const sortedNotes = [...notes];
          sortedNotes.forEach((note, index) => {
            note.classList.add("cursor-pointer");
            note.addEventListener("click", () => {
              // Show the cursor
              setShowingCursor(true);
              // Update the cursor index
              const i = index % length;
              setCursorIndex(i);
              if (i === cursorIndex) return;
              // Move the actual cursor based on the offset
              const offset = Math.abs(i - cursorIndex);
              if (i < cursorIndex) {
                for (let j = 0; j < offset; j++) {
                  if (i < cursorIndex) {
                    score.cursor.previous();
                  } else {
                    score.cursor.next();
                  }
                }
              }
            });
          });
        }, 10);
      });
  }, [id, xml, noteClassName, noteCount, cursorIndex, showingCursor]);

  return {
    score: <div ref={ref} id={id} className={className}></div>,
    osmd,
    cursor: {
      index: cursorIndex,
      setIndex: setCursorIndex,
      hidden: !showingCursor,
      show: showCursor,
      hide: hideCursor,
      next: nextCursor,
      prev: prevCursor,
    },
  };
}
