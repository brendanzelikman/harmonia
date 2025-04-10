/** Get the files of an event */
export const getEventFiles = (event: Event) => {
  return (event.target as HTMLInputElement)?.files ?? [];
};

/** Get the first file of an event. */
export const getEventFile = (event: Event) => {
  return (event.target as HTMLInputElement)?.files?.[0];
};

/** Download the given blob using an optional file name. */
export const downloadBlob = (blob: Blob, fileName?: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName ?? "file";
  a.click();
  URL.revokeObjectURL(url);
};
