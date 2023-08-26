import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface ContextMenuOption {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  divideEnd?: boolean;
}

export default function ContextMenu(props: {
  targetId: string;
  options: ContextMenuOption[];
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
        setPos({ x: event.clientX, y: event.clientY });
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

  const renderOption = useCallback((option: ContextMenuOption) => {
    return (
      <li
        className={`px-3 py-1 ${
          option.disabled
            ? "text-slate-500 cursor-default"
            : "text-slate-200 cursor-pointer hover:bg-slate-700"
        } ${option.divideEnd ? "mb-1 border-b border-b-slate-500" : ""}`}
        key={option.label}
        onClick={option.disabled ? () => null : option.onClick}
      >
        {option.label}
      </li>
    );
  }, []);

  return (
    <div
      ref={contextRef}
      className={`bg-slate-900/80 border border-slate-50/50 py-2 rounded-lg drop-shadow-2xl z-[100] font-nunito font-light ${
        visible ? "block" : "hidden"
      } absolute flex flex-col items-center backdrop-blur-lg`}
      style={{
        left: pos.x,
        top: pos.y,
        marginTop: `-50px`,
      }}
      onClick={() => setVisible(false)}
    >
      <ul>{props.options.map(renderOption)}</ul>
    </div>
  );
}
