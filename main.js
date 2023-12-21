import { app, BrowserWindow, Menu, webContents } from "electron";

function createWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    title: "Harmonia",
    show: false,
    backgroundColor: "#2e2c29",
    icon: "./src/assets/images/logo",
  });
  win.maximize();
  win.show();
  win.loadURL("http://localhost:3000/harmonia/");
}

const dockMenu = Menu.buildFromTemplate([
  {
    label: "Open New Project",
    click: () => {
      webContents.getAllWebContents().forEach((webContents) => {
        if (webContents.getURL().includes("localhost")) {
          webContents.send("open-new-project");
        }
      });
    },
  },
]);

app
  .whenReady()
  .then(() => {
    if (process.platform === "darwin") {
      app.dock.setMenu(dockMenu);
    }
  })
  .then(createWindow);

app.dock.setIcon("./src/assets/images/logo.png");
app.setName("Harmonia");
app.name = "Harmonia";

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
