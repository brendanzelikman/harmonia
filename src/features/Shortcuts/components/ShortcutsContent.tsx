import { ReactNode } from "react";

interface ShortcutContentProps {
  className?: string;
  shortcuts: ReactNode[];
}

export const ShortcutContent = ({
  className,
  shortcuts,
}: ShortcutContentProps) => {
  const filteredShortcuts = shortcuts.filter(Boolean) as ReactNode[];
  return (
    <div className="flex w-max flex-col justify-center items-center p-8 px-4 bg-slate-700/50 rounded border border-slate-500/50">
      <ul className={className}>
        {filteredShortcuts.map((shortcut, index) => (
          <li key={index}>{shortcut}</li>
        ))}
      </ul>
    </div>
  );
};
