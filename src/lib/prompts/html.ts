import { promptModal, PromptModalProps } from "components/PromptModal";
import { addToggleCloseListener } from "hooks/useToggle";
import { ReactNode } from "react";

// ------------------------------------------------------------
// User Prompts
// ------------------------------------------------------------

/** Prompts the user then applies a callback for the numerical result. */
export const promptUserForString =
  (
    props: PromptModalProps & {
      callback: (input: string) => unknown;
    }
  ) =>
  async () => {
    const { callback, ...rest } = props;
    const input = await promptModal({ ...rest });
    callback(input);
  };

/** Prompts the user then applies a callback for the numerical result. */
export const promptUserForNumber =
  (
    title: ReactNode,
    description: ReactNode,
    callback: (input: number) => unknown
  ) =>
  async () => {
    const input = await promptModal({ title, description });
    const sanitizedInput = parseInt(input ?? "");
    if (!isNaN(sanitizedInput)) await callback(sanitizedInput);
  };

/** Read an audio file from the user and call the callback with the event. */
export const promptUserForFile = (
  accept = "*",
  onChange: (e: Event) => void
) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = onChange;
  document.body.appendChild(input);
  input.click();
  input.remove();
};

/** Record the user's microphone into an audio file */
export const promptUserForMicrophone = async (toggleKey: string) => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  return new Promise<File>((resolve) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    // When the recording stops, resolve with the audio file
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/*" });
      const file = new File([blob], "recording.wav", { type: "audio/*" });
      resolve(file);
    };

    // Start recording and close the stream when signaled
    recorder.start();
    addToggleCloseListener(toggleKey, () => {
      recorder.stop();
      stream.getTracks().forEach((t) => t.stop());
    });
  });
};
