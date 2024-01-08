// Create a custom interface for the Electron API
interface ElectronAPI {
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: (...args: any[]) => void) => void;
  dirname: string;
  openExternal: (url: string) => void;
}

// Attach the custom interface to the `window` object
interface Window {
  electronAPI: ElectronAPI;
}
