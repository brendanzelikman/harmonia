import classNames from "classnames";

export const EditorContent: React.FC<React.HTMLProps<HTMLDivElement>> = (
  props
) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        `w-full min-h-0 h-full px-6 flex flex-col`
      )}
    >
      {props.children}
    </div>
  );
};
