import { cancelEvent } from "utils/event";
import { DiaryPage } from "./DiaryPage";
import classNames from "classnames";

type ContentPageProps = {
  page: string;
  index: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => void;
};

export const DiaryContentPage = (props: ContentPageProps) => {
  const { page, index, onChange } = props;

  const correctTargetFocus = (e: EventTarget & HTMLTextAreaElement) => {
    const { selectionStart, selectionEnd } = e;
    setTimeout(() => {
      e.focus();
      e.setSelectionRange(selectionStart, selectionEnd);
    }, 1);
  };

  const Textbox = (
    <textarea
      id={`textarea-${index}`}
      className={classNames(
        "italic bg-slate-50/90 text-slate-950 resize-none size-full border-0 focus:border-0 focus:ring-0 rounded"
      )}
      placeholder="Click to edit..."
      value={page}
      onChange={(e) => {
        onChange(e, index);
        correctTargetFocus(e.target);
      }}
    />
  );

  return (
    <DiaryPage key={`page-${index}`} index={index}>
      <div
        className={
          "relative size-full backdrop-blur-sm p-8 flex flex-col gap-4"
        }
        onClick={cancelEvent}
      >
        <h2 className="text-center text-slate-50 select-none my-3">
          ~ Project Diary: Page {index + 1} ~
        </h2>
        {Textbox}
      </div>
    </DiaryPage>
  );
};
