import classNames from "classnames";
import { blurOnEnter } from "utils/html";

export interface EditorNumericFieldProps
  extends React.HTMLProps<HTMLInputElement> {
  leadingText?: string;
}

export const EditorNumericField: React.FC<EditorNumericFieldProps> = (
  props
) => {
  const { leadingText, ...input } = props;
  const isZero = input.value === "0";
  return (
    <input
      {...input}
      className={classNames(
        props.className,
        "h-[26px] text-center rounded bg-transparent text-xs px-1 border border-slate-500 focus:ring-0 focus:border-teal-500/80 focus:outline-none",
        {
          "text-slate-400": isZero,
          "text-white": !isZero,
        }
      )}
      value={`${leadingText}${props.value ?? 0}`}
      type="string"
      onKeyDown={blurOnEnter}
    />
  );
};
