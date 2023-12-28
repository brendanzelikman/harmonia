import isElectron from "is-electron";
import { PluginData } from "./PluginTypes";

/** Send the plugin data to the port if on desktop  */
export const sendPluginData = (data: PluginData) => {
  if (!isElectron()) return;
  const port = data.port;
  const dataString = JSON.stringify(data);
  const EOF = "\n";
  const message = `${dataString}${EOF}`;
  const packet = { message, port };
  console.log(`Sending message to port ${port}`);
  window.electronAPI.send("send-udp-message", packet);
};
