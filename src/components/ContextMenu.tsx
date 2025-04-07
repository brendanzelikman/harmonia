import { useHotkeys } from "react-hotkeys-hook";
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export interface ContextMenuOption {
  label: ReactNode;
  onClick: (e: any) => void;
  disabled?: boolean;
  divideEnd?: boolean;
}

export function ContextMenu(props: {
  options: ContextMenuOption[];
  targetId: string;
  className?: string;
}) {
  const { targetId } = props;
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const contextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contextMenuEventHandler = (event: any) => {
      const targetElement = document.getElementById(targetId);
      if (targetElement && targetElement.contains(event.target)) {
        event.preventDefault();
        setVisible(true);
        setPos({ x: event.clientX, y: event.clientY - 58 });
        return;
      }
      if (contextRef.current && !contextRef.current.contains(event.target)) {
        setVisible(false);
      }
    };
    const offClickHandler = (event: any) => {
      if (contextRef.current && !contextRef.current.contains(event.target)) {
        setVisible(false);
      }
    };

    document.addEventListener("contextmenu", contextMenuEventHandler);
    document.addEventListener("click", offClickHandler);

    return () => {
      document.removeEventListener("contextmenu", contextMenuEventHandler);
      document.removeEventListener("click", offClickHandler);
    };
  }, [targetId]);

  useHotkeys("esc", () => setVisible(false), { enableOnFormTags: true });

  useLayoutEffect(() => {
    const node = contextRef.current;
    if (!node) return;
    if (pos.x + node.offsetWidth > window.innerWidth) {
      setPos({ ...pos, x: pos.x - node.offsetWidth });
    }
    if (pos.y + node.offsetHeight > window.innerHeight) {
      setPos({ ...pos, y: pos.y - node.offsetHeight });
    }
  }, [pos]);

  const renderOption = useCallback(
    (option: ContextMenuOption, index: number) => {
      return (
        <li
          className={`px-3 py-1 ${
            typeof option.label === "string"
              ? `${
                  option.disabled
                    ? "text-slate-500 cursor-default"
                    : "text-slate-200 cursor-pointer hover:bg-slate-700"
                }`
              : null
          } ${option.divideEnd ? "mb-1 border-b border-b-slate-500" : ""}`}
          key={
            typeof option.label === "string"
              ? `${option.label}-${index}`
              : `option-${index}`
          }
          onClick={option.disabled ? () => null : option.onClick}
        >
          {option.label}
        </li>
      );
    },
    []
  );

  return (
    <div
      ref={contextRef}
      className={`absolute flex flex-col items-center bg-slate-900/80 border border-slate-50/50 py-2 rounded-lg shadow-2xl z-[100] font-light ${
        props.className ?? ""
      } backdrop-blur-lg text-sm`}
      onClick={() => setVisible(false)}
      style={{
        left: pos.x,
        top: pos.y,
        opacity: visible ? 1 : 0,
        transform: `scale(${visible ? 1 : 0.8})`,
        transition: "opacity 100ms ease-in-out, transform 100ms ease-in-out",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      <ul>{props.options.map(renderOption)}</ul>
    </div>
  );
}
