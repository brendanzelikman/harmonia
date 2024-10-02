import { Dialog } from "@headlessui/react";
import { ReactNode, useState } from "react";
import { createRoot } from "react-dom/client";
import { blurOnEnter } from "utils/html";
import Logo from "assets/images/logo.png";

interface PromptModalProps {
  isOpen: boolean;
  title: ReactNode;
  description: ReactNode | ReactNode[];
  onSubmit: (input: string) => void;
  onCancel: () => void;
}

const PromptModal = (props: PromptModalProps) => {
  const { isOpen, title, description, onSubmit, onCancel } = props;
  const [input, setInput] = useState("");

  const descriptionNodes = Array.isArray(description) ? (
    description.map((node, index) => (
      <p key={index} className="mt-2 text-sm text-slate-300">
        {node}
      </p>
    ))
  ) : (
    <p className="mt-2 text-sm text-slate-300">{description}</p>
  );

  return (
    <Dialog className="relative z-[999]" open={isOpen} onClose={onCancel}>
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center font-nunito">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-500 p-6 text-left align-middle shadow-xl transition-all animate-in fade-in duration-300">
            <Dialog.Title
              as="h3"
              className="flex gap-2 items-center text-xl font-bold text-slate-100"
            >
              <img src={Logo} className="h-12" />
              {title}
            </Dialog.Title>
            {descriptionNodes}
            <div className="mt-6 flex gap-3 items-center">
              <input
                type="text"
                className="rounded bg-transparent mr-3 text-white"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={blurOnEnter}
              />
              <button
                onClick={() => onSubmit(input)}
                className="inline-flex justify-center rounded-md border border-transparent bg-sky-600 text-slate-950 px-4 py-2 text-sm font-medium hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Submit
              </button>
              <button
                className="inline-flex justify-center rounded-md border border-transparent bg-slate-400 text-slate-950 px-4 py-2 text-sm font-medium hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export const promptModal = (
  title: ReactNode,
  description: ReactNode | ReactNode[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const modalRoot = createRoot(root);

    const cleanup = () => {
      modalRoot.unmount();
      document.body.removeChild(root);
    };

    const onSubmit = (input: string) => {
      cleanup();
      resolve(input);
    };

    const onCancel = () => {
      cleanup();
      reject();
    };

    modalRoot.render(
      <PromptModal
        isOpen={true}
        title={title}
        description={description}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  });
};
