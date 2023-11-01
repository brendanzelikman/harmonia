import classNames from "classnames";
import { blurOnEnter } from "utils/html";

interface HeaderProps extends React.HTMLProps<HTMLDivElement> {
  title?: string;
  color?: string;
  subtitle?: string;
  editable?: boolean;
  setTitle?: (title: string) => void;
}

export const EditorHeader: React.FC<HeaderProps> = (props) => {
  const { title, color, subtitle, editable, setTitle, ...divProps } = props;

  /** The title is placed over the strip and can be editable. */
  const Title = (
    <input
      className={classNames(
        `w-full bg-transparent text-3xl font-semibold ring-0 border-0 p-0 focus:border outline-none rounded focus:bg-slate-800/30`,
        {
          "cursor-pointer select-all": !!editable,
          "select-none": !editable,
        }
      )}
      value={title}
      onChange={(e) => setTitle?.(e.target.value)}
      disabled={!editable}
      onKeyDown={blurOnEnter}
    />
  );

  /** The strip is a colored line. */
  const Strip = (
    <span
      className={classNames(
        color,
        `w-full h-0.5 my-1.5 animate-[animate-gradient_3s_ease_infinite]`
      )}
    />
  );

  /** The subtitle is placed under the strip. */
  const Subtitle = !!subtitle && (
    <span className="text-xl font-light text-slate-300">{subtitle}</span>
  );

  /** The header consists of the title, strip, and subtitle. */
  return (
    <div
      {...divProps}
      className={classNames(
        props.className,
        `flex flex-col h-24 mb-2 justify-center font-semibold`
      )}
    >
      {Title}
      {Strip}
      {Subtitle}
    </div>
  );
};
