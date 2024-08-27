import classNames from "classnames";

export const EditorBody: React.FC<React.HTMLProps<HTMLDivElement>> = (
  props
) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        `p-2 flex w-full h-full overflow-scroll outline-none`
      )}
    >
      {props.children}
    </div>
  );
};
