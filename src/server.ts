import * as WebSocket from "ws";

export const sendMessageToPlugin = (message: string) => {
  const wss = new WebSocket.Server({ port: 9001 });
  console.log(message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};
