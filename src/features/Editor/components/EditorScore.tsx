import classNames from "classnames";

interface ScoreProps extends React.HTMLProps<HTMLDivElement> {
  score: JSX.Element;
}

export const EditorScore: React.FC<ScoreProps> = (props) => {
  const { score, ...divProps } = props;
  return (
    <div
      {...divProps}
      className={classNames(
        divProps.className,
        `bg-white relative w-full flex items-center h-auto min-h-[200px] overflow-auto border-2 shadow-xl rounded-lg`
      )}
    >
      {props.score}
    </div>
  );
};
