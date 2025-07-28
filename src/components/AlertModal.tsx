import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ReactNode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { dispatchCustomEvent } from "utils/event";
import Logo from "assets/images/logo.png";
import { useEvent } from "hooks/useEvent";
import classNames from "classnames";

export interface AlertModalProps {
  isOpen?: boolean;
  title?: ReactNode;
  description?: ReactNode | ReactNode[];
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  autoselect?: boolean;
  backgroundColor?: string;
  padding?: string;
  defaultValue?: string;
  textarea?: boolean;
  large?: boolean;
}

export const promptLineBreak = new Array(64).fill(`-`).join("");

const AlertModal = (props: AlertModalProps) => {
  const { isOpen, title, description } = props;
  const onSubmit = props.onSubmit ?? (() => null);
  const onCancel = props.onCancel ?? (() => null);

  // Close the modal if another is opened
  useEvent("cleanupModal", onCancel);

  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (props.autoselect) {
      ref.current?.focus();
    }
  }, []);

  const descriptionNodes = Array.isArray(description) ? (
    description.map((node, index) => (
      <div key={index} className="mt-2 text-sm text-slate-300">
        {node}
      </div>
    ))
  ) : (
    <p className="mt-2 text-sm text-slate-300">{description}</p>
  );

  return (
    <Dialog className="relative z-[999]" open={isOpen} onClose={onCancel}>
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full w-full items-center justify-center p-4 text-lg text-center">
          <DialogPanel
            className={classNames(
              props.backgroundColor ?? "bg-[#0b0f1a]",
              props.padding,
              props.large ? "max-w-xl" : "max-w-md",
              "w-full transform overflow-hidden rounded-2xl border border-slate-500 p-6 text-left align-middle shadow-xl transition-all animate-in fade-in duration-200 zoom-in-50"
            )}
          >
            <DialogTitle
              as="h3"
              className="flex gap-2 items-center text-xl font-bold text-slate-100"
            >
              <img src={Logo} className="h-12" />
              {title}
            </DialogTitle>
            {descriptionNodes}
            <div className="mt-6 flex gap-3 items-center">
              <button
                ref={ref}
                onClick={() => onSubmit()}
                className="inline-flex ml-auto justify-center rounded-md border border-transparent bg-sky-600 text-slate-950 px-4 py-2 text-sm font-medium hover:bg-sky-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-300"
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              >
                Next
              </button>
              <button
                className="inline-flex mr-5 justify-center rounded-md border border-transparent bg-slate-400 text-slate-950 px-4 py-2 text-sm font-medium hover:bg-slate-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-300"
                onClick={onCancel}
                onKeyDown={(e) => e.key === "Enter" && onCancel()}
              >
                Skip
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export const alertModal = (props: AlertModalProps): Promise<boolean> => {
  dispatchCustomEvent("cleanupModal");
  return new Promise((resolve) => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const modalRoot = createRoot(root);

    const cleanup = () => {
      modalRoot.unmount();
      document.body.removeChild(root);
    };

    const onSubmit = () => {
      props.onSubmit?.();
      props.onCancel?.();
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      props.onCancel?.();
      cleanup();
      resolve(false);
    };

    props.onFocus?.();

    modalRoot.render(
      <AlertModal
        {...props}
        autoselect={true}
        isOpen={true}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  });
};
