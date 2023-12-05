import { ReactNode } from "react";

interface DocsSectionProps {
  question?: ReactNode;
  answer?: ReactNode;
}

export function DocsSection(props: DocsSectionProps) {
  const { question, answer } = props;
  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-lg font-bold space-y-4">{question}</h3>
      <div className="text-slate-400 space-y-4">{answer}</div>
    </div>
  );
}
