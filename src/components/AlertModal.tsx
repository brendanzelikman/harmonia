import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import Logo from "assets/images/logo.png";

interface AlertModalProps {
  isOpen: boolean;
  title: ReactNode;
  description: ReactNode;
  onClose: () => void;
}

const AlertModal = (props: AlertModalProps) => {
  const { isOpen, title, description, onClose } = props;

  return (
    <Dialog className="relative z-10" open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center font-nunito">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-500 p-6 text-left align-middle shadow-xl transition-all animate-in fade-in duration-300">
            <DialogTitle
              as="h3"
              className="flex gap-2 items-center text-xl font-bold text-slate-100"
            >
              <img src={Logo} className="h-12" />
              {title}
            </DialogTitle>
            <p className="mt-2 text-sm text-slate-300">{description}</p>
            <div className="mt-4 flex gap-3 items-center">
              <button
                className="inline-flex justify-center rounded-md border border-transparent bg-slate-400 text-slate-950 px-8 py-1 text-sm font-medium hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export const alertModal = (
  title: ReactNode,
  description: ReactNode
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const modalRoot = createRoot(root);

    const cleanup = () => {
      modalRoot.unmount();
      document.body.removeChild(root);
    };

    const onClose = () => {
      cleanup();
      resolve();
    };

    modalRoot.render(
      <AlertModal
        isOpen={true}
        title={title}
        description={description}
        onClose={onClose}
      />
    );
  });
};
