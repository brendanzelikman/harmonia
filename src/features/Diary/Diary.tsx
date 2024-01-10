import { FlipBook } from "components/FlipBook";
import { useCallback, useRef, useState } from "react";
import { DiaryCoverPage, DiaryPageBinding } from "./DiaryPage";
import { cancelEvent } from "utils/html";
import { useHotkeyScope } from "hooks";
import { useScopedHotkeys } from "lib/react-hotkeys-hook";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { clearDiary, setDiaryPage } from "redux/Diary";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/Tooltip";
import { BsDownload, BsTrash } from "react-icons/bs";
import { toggleDiary } from "redux/Timeline";
import { ContentPage } from "./ContentPage";
import { selectProjectName } from "redux/Metadata";
import { m } from "framer-motion";

const useHotkeys = useScopedHotkeys("diary");

export function Diary() {
  const dispatch = useProjectDispatch();
  const projectName = useProjectSelector(selectProjectName);
  const diary = useProjectSelector((project) => project.diary);
  const showingDiary = useProjectSelector((_) => !!_.timeline.showingDiary);
  const [clearingDiary, setClearingDiary] = useState(false);
  useHotkeyScope("diary", showingDiary);

  const ref = useRef<any>(null);
  const setPageContent = useCallback((page: number, text: string) => {
    dispatch(setDiaryPage({ page, text }));
  }, []);

  const flip = useCallback(
    (page: number) => ref.current?.pageFlip?.().flip(page),
    []
  );

  useHotkeys("left", () => ref.current?.pageFlip?.().flipPrev(), []);
  useHotkeys("right", () => ref.current?.pageFlip?.().flipNext(), []);
  useHotkeys("shift+left", () => flip(0), [flip]);
  useHotkeys("shift+right", () => flip(diary.length - 1), [diary, flip]);
  useHotkeys("esc", () => dispatch(toggleDiary()), []);

  const ExportDiaryButton = useCallback(
    () => (
      <button
        className="flex text-md h-8 ml-auto mr-3"
        onClick={() => {
          const blob = new Blob([JSON.stringify(diary)], {
            type: "text/plain;charset=utf-8",
          });

          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "diary.txt";
          a.click();
        }}
      >
        <BsDownload />
      </button>
    ),
    [diary]
  );

  const ClearDiaryButton = useCallback(
    () => (
      <TooltipProvider>
        <Tooltip open={clearingDiary}>
          <TooltipTrigger
            className="flex text-md h-8"
            onClick={() => setClearingDiary(!clearingDiary)}
          >
            <BsTrash />
          </TooltipTrigger>
          <TooltipContent
            className="bg-slate-950 border border-slate-500/50 rounded -translate-y-1 cursor-pointer p-2 text-red-400"
            onClick={() => {
              dispatch(clearDiary());
              setClearingDiary(false);
            }}
          >
            Are you sure?
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    [clearingDiary]
  );

  const CoverPage = useCallback(
    () => (
      <DiaryCoverPage>
        <div className="size-full bg-slate-50/90 backdrop-blur-sm flex flex-col p-4 opacity-100">
          <div className="flex items-center justify-center">
            <ExportDiaryButton />
            {ClearDiaryButton()}
          </div>
          <h1 className="pb-2 text-3xl font-bold text-center">
            ~ Project Diary ~
          </h1>
          <h4 className="pb-4 text-md text-slate-600 font-semibold text-center">
            {projectName}
          </h4>
          <hr className="invert pt-4" />
          <ul className="flex-1 w-full p-4 overflow-scroll text-blue-600 rounded">
            {diary.map((page, i) => {
              const content = page.length ? page : "Empty Page";
              return (
                <div
                  key={`content-${i}}`}
                  className="cursor-pointer flex text-md font-light h-8 active:text-blue-700 w-full whitespace-nowrap"
                  onClick={() => flip(i + 1)}
                >
                  <span className="flex-auto overflow-clip text-ellipsis mr-2">
                    {content}
                  </span>
                  <span className="flex-shrink-0 w-4 ml-auto text-end">
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </ul>
        </div>
      </DiaryCoverPage>
    ),
    [
      clearingDiary,
      diary,
      projectName,
      flip,
      ExportDiaryButton,
      ClearDiaryButton,
    ]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
      cancelEvent(e.nativeEvent);
      setPageContent(index, e.currentTarget.value);
    },
    []
  );

  const width = 400;
  const height = 600;

  if (!showingDiary) return null;
  return (
    <div className="absolute inset-0 flex flex-col total-center z-50 bg-slate-950/80 backdrop-blur-lg">
      <div className="relative -translate-x-1/2">
        <m.div
          initial={{ translateY: 100, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ width, height }}
        >
          <DiaryPageBinding />
          <FlipBook ref={ref} width={width} height={height}>
            {CoverPage()}
            {diary.map((page, index) =>
              ContentPage({
                page,
                index,
                onChange,
              })
            )}
          </FlipBook>
        </m.div>
      </div>
    </div>
  );
}
