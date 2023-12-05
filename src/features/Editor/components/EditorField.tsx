import classNames from "classnames";
import { blurOnEnter } from "utils/html";

export interface EditorNumericFieldProps
  extends React.HTMLProps<HTMLInputElement> {
  leadingText?: string;
}

export const EditorNumericField: React.FC<EditorNumericFieldProps> = (
  props
) => {
  const { leadingText, placeholder, ...input } = props;
  const isPlaceholder = placeholder && input.value === placeholder;
  return (
    <input
      {...input}
      draggable={false}
      className={classNames(
        "min-h-[26px] text-center rounded text-xs px-1 border focus:ring-0 focus:outline-none",
        {
          "text-slate-300": isPlaceholder,
          "text-white": !isPlaceholder,
        },
        props.className
      )}
      value={`${leadingText ?? ""}${isPlaceholder ? placeholder : props.value}`}
      type="string"
      onKeyDown={blurOnEnter}
    />
  );
};
