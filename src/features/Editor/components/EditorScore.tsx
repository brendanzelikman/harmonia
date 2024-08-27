import classNames from "classnames";

interface ScoreProps extends React.HTMLProps<HTMLDivElement> {
  score: JSX.Element;
  border?: string;
}

export const EditorScore: React.FC<ScoreProps> = (props) => {
  const { score, border, ...divProps } = props;
  return (
    <div
      {...divProps}
      className={classNames(
        divProps.className,
        border ?? "border-[4px]",
        `bg-white relative flex w-[875px] max-h-96 shrink-0 overflow-auto transition-all items-center shadow-xl rounded-lg`
      )}
    >
      {props.score}
    </div>
  );
};
