import { Transition } from "@headlessui/react";

interface TransitionProps extends React.HTMLProps<HTMLDivElement> {
  show: boolean;
  children?: React.ReactNode;
  duration?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  asType?: React.ElementType;
}

export const EasyTransition: React.FC<TransitionProps> = (props) => {
  const { duration, scale, asType, ...restProps } = props;
  const durationClass = `duration-${duration ?? 300}`;
  const scaleClass = `scale-${scale ?? 100}`;

  return (
    <Transition
      {...restProps}
      as="div"
      appear
      enter={`transition-all ease-in-out `}
      enterFrom={`opacity-0 ${scaleClass}`}
      enterTo="opacity-100 scale-100"
      leave={`transition-all ease-in-out `}
      leaveFrom="opacity-100 scale-100"
      leaveTo={`opacity-0 ${scaleClass}`}
      style={{ transitionDuration: `${props.duration ?? 300}` }}
    >
      {props.children}
    </Transition>
  );
};
