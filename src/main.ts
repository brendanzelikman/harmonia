import { app, ipcMain, BrowserWindow, protocol } from "electron";
import dgram from "dgram";
import path from "path";
import url from "url";
import Squirrel from "electron-squirrel-startup";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (Squirrel) {
  app.quit();
}

let mainWindow: BrowserWindow;

// Create the main window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
    title: "Harmonia",
    show: false,
    backgroundColor: "#2e2c29",
    icon: "/logo",
  });

  // Load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(
          __dirname,
          `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
        ),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  // Maximize the main window
  mainWindow.maximize();
  mainWindow.show();

  return mainWindow;
};

app.dock.setIcon(path.join(__dirname, "logo.png"));
app.setName("Harmonia");
app.name = "Harmonia";

// Register the app protocol
protocol.registerSchemesAsPrivileged([
  {
    scheme: "harmonia",
    privileges: { secure: true, standard: true, supportFetchAPI: true },
  },
]);

app.setAsDefaultProtocolClient("harmonia");
app.on("open-url", (e, url) => {
  const slicedUrl = url.slice(`harmonia://`.length);
  if (mainWindow) {
    mainWindow.webContents.send("magic-link", slicedUrl);
  }
});

// Create the main window when Electron is ready
app.on("ready", () => {
  createWindow();
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Recreate the main window if it is closed and the app is activated
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

interface UdpMessageProps {
  message: string;
  port: number;
}

// Send a UDP message to the given port
ipcMain.on("send-udp-message", (e: any, args: UdpMessageProps[]) => {
  const socket = dgram.createSocket("udp4");
  for (const arg of args) {
    const { message, port } = arg;
    const buffer = Buffer.from(message);
    socket.send(buffer, port, "localhost", (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
});
