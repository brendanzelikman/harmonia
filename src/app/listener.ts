import { store } from "app/store";
import { setProject } from "app/store";
import dayjs from "dayjs";
import { mergeBaseProjects } from "types/Project/ProjectMergers";
import { timestampProject } from "types/Project/ProjectTypes";
let socket: WebSocket | null = null;
const CLIENT_ID = Math.random().toString(36).substring(2);
let lastSent: string = "";
let ignoreUpdates = false;

export const isLocal = () => {
  const isLocalHost = window.location.hostname === "localhost";
  const isLocalIp = window.location.hostname.startsWith("192.168.");
  return isLocalHost || isLocalIp;
};

export const enableLANCollab = (host: string, port = 8080) => {
  if (!isLocal()) return;

  if (socket) {
    socket.close();
  }
  socket = new WebSocket(`ws://${host}:${port}`);

  socket.onopen = () => {
    console.log("🧠 LAN collaboration enabled.");
    sendRequestSync();
  };

  socket.onmessage = async (event) => {
    try {
      const message = await parseWebSocketMessage(event);
      if (message.id === CLIENT_ID) return; // Ignore own messages
      handleMessage(message);
    } catch (e) {
      console.error("❌ Error processing message", e);
    }
  };

  // Watch for local state changes
  store.subscribe(() => {
    if (ignoreUpdates) {
      return;
    }

    const currentProject = timestampProject(store.getState());
    const json = JSON.stringify(currentProject);

    if (json !== lastSent && socket?.readyState === WebSocket.OPEN) {
      lastSent = json;
      socket?.send(
        JSON.stringify({ id: CLIENT_ID, json, type: "syncProject" })
      );
    }
  });
};

// Helper function to send requestSync message
const sendRequestSync = () => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ id: CLIENT_ID, type: "requestSync" }));
  }
};

// Helper function to parse WebSocket message
const parseWebSocketMessage = async (event: MessageEvent) => {
  const text = await event.data.text();
  return JSON.parse(text);
};

// Handle the different types of messages from the peer
const handleMessage = (message: {
  id: string;
  type: string;
  json?: string;
  lastUpdated?: string;
}) => {
  switch (message.type) {
    case "requestSync":
      handleRequestSync();
      break;

    case "syncProject":
      handleSyncProject(message);
      break;

    default:
      console.warn("❓ Unknown message type:", message.type);
  }
};

// Handle 'requestSync' message from peer
const handleRequestSync = () => {
  const current = store.getState();
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        id: CLIENT_ID,
        type: "syncProject",
        json: JSON.stringify(current),
      })
    );
  }
};

// Handle 'syncProject' message from peer
const handleSyncProject = async (message: { json: string } & any) => {
  if (!message.json) return;

  console.log("📥 Sync/update received from peer.");

  const lastUpdated = message.lastUpdated;

  const currentProject = timestampProject(store.getState());
  const currentLastUpdated = currentProject.present.meta.lastUpdated;

  if (dayjs(lastUpdated).isAfter(currentLastUpdated)) {
    ignoreUpdates = true;
    // Merge the current timeline with the incoming project
    const project = JSON.parse(message.json);
    project.present.timeline = currentProject.present.timeline;
    await setProject(project);
    ignoreUpdates = false;
  }
};
