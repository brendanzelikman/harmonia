import { useCallback, useRef } from "react";
import { DiaryCoverPage, DiaryPageBinding } from "./DiaryPage";
import { cancelEvent } from "utils/html";
import { useHotkeysInDiary } from "lib/react-hotkeys-hook";
import { BsDownload, BsTrash } from "react-icons/bs";
import { ContentPage } from "./ContentPage";
import { m } from "framer-motion";
import { use, useProjectDispatch } from "types/hooks";
import { setDiaryPage, clearDiary } from "types/Meta/MetaSlice";
import classNames from "classnames";
import { NAV_HEIGHT } from "utils/constants";
import Background from "assets/images/landing-background.png";
import { useDiary } from "types/Diary/DiaryTypes";
import {
  selectProjectDiary,
  selectProjectName,
} from "types/Meta/MetaSelectors";
import { FlipBook } from "lib/react-pageflip";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";

const DIARY_WIDTH = window.innerWidth / 2 - NAV_HEIGHT - 100;
const DIARY_HEIGHT = window.innerHeight - NAV_HEIGHT - 100;

export function Diary() {
  const dispatch = useProjectDispatch();
  const projectName = use(selectProjectName);

  const diary = use(selectProjectDiary);
  const diaryState = useDiary();
  const showingDiary = diaryState.isOpen;

  // Create a ref to the FlipBook component
  const ref = useRef<any>(null);

  // Set the content of a page in the diary
  const setPageContent = useCallback((page: number, text: string) => {
    dispatch(setDiaryPage({ page, text }));
  }, []);

  // Diary hotkeys to flip the pages around

  useHotkeysInDiary("left", () => ref.current?.pageFlip?.().flipPrev(), []);
  useHotkeysInDiary("right", () => ref.current?.pageFlip?.().flipNext(), []);
  useHotkeysInDiary("shift+left", () => ref.current?.pageFlip?.().flip(0), []);
  useHotkeysInDiary(
    "shift+right",
    () => ref.current?.pageFlip?.().flip(diary.length - 1),
    [diary]
  );

  // A button to export the diary to a text file
  const ExportDiaryButton = useCallback(
    () => (
      <button
        className="flex h-8 ml-auto mr-3"
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

  // A button to clear the diary
  const ClearDiaryButton = useCallback(() => {
    const canDelete = diary.find((page) => page.length);
    return (
      <div className="relative group/tooltip">
        {canDelete ? (
          <NavbarHoverTooltip
            className="border-slate-500/50 -mt-6 whitespace-nowrap rounded-lg cursor-pointer text-slate-400 hover:text-red-500 hover:font-bold"
            onClick={() => {
              dispatch(clearDiary());
            }}
          >
            Click Here to Confirm
          </NavbarHoverTooltip>
        ) : null}
        <div
          className={classNames(
            `flex h-8`,
            canDelete ? "opacity-100" : "opacity-50"
          )}
        >
          <BsTrash />
        </div>
      </div>
    );
  }, [diary]);

  const CoverPage = () => (
    <DiaryCoverPage>
      <div className="size-full bg-slate-50/90 bflex flex-col p-4 opacity-100 overflow-scroll">
        <div className="flex items-center justify-center">
          <ExportDiaryButton />
          {ClearDiaryButton()}
        </div>
        <>
          <h1 className="pb-2 text-3xl font-bold text-center">
            ~ Project Diary ~
          </h1>
          <h4 className="pb-4 text-slate-600 font-semibold text-center">
            {projectName}
          </h4>
          <hr className="invert pt-4" />
          <ul className="flex-1 w-full p-4 overflow-scroll text-blue-600 rounded">
            {diary.map((page, i) => {
              const content = page.length ? page : "Empty Page";
              const title = content.split("\n")[0];
              return (
                <div
                  key={`content-${i}}`}
                  className="cursor-pointer flex font-light h-8 active:text-blue-700 w-full whitespace-nowrap"
                  onClick={() => ref.current?.pageFlip?.().flip(i + 1)}
                >
                  <span className="flex-auto overflow-clip text-ellipsis mr-2">
                    {title}
                  </span>
                  <span className="flex-shrink-0 w-4 ml-auto text-end">
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </ul>
        </>
      </div>
    </DiaryCoverPage>
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
      cancelEvent(e);
      setPageContent(index, e.currentTarget.value);
    },
    []
  );

  if (!showingDiary) return null;
  return (
    <div className="absolute inset-0 animate-in fade-in flex flex-col total-center">
      {/* <img
        src={Background}
        className="absolute inset-0 opacity-50 h-screen object-cover landing-background"
      /> */}

      <div className="relative translate-y-[65px] z-[50] -translate-x-[calc(50%-150px)]">
        <m.div
          initial={{ translateY: 100, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ width: DIARY_WIDTH, height: DIARY_HEIGHT }}
        >
          <DiaryPageBinding />
          <FlipBook ref={ref} width={DIARY_WIDTH} height={DIARY_HEIGHT}>
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
