import { Transition } from "@headlessui/react";

interface TransitionProps {
  show: boolean;
  children?: React.ReactNode;
  duration?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export function EasyTransition(props: TransitionProps) {
  const duration = `duration-${props.duration || 300}`;
  const scale = `scale-${props.scale || 100}`;

  return (
    <Transition
      show={!!props.show}
      appear
      enter={`transition-all ease-in-out ${duration}`}
      enterFrom={`opacity-0 ${scale}`}
      enterTo="opacity-100 scale-100"
      leave={`transition-all ease-in-out ${duration}`}
      leaveFrom="opacity-100 scale-100"
      leaveTo={`opacity-0 ${scale}`}
      className={props.className}
      style={props.style}
    >
      {props.children}
    </Transition>
  );
}
