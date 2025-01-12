import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map();

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    try {
      const { action, pollId } = JSON.parse(message);
      if (action === "subscribe" && pollId) {
        clients.set(ws, pollId);
        console.log(`Client subscribed to poll ID: ${pollId}`);
      }
    } catch (err) {
      console.error("Error parsing WebSocket message:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });
});

// Broadcast updates to relevant clients
export const broadcastUpdate = (pollId, results) => {
  console.log("Broadcasting poll update:", { pollId, results });
  clients.forEach((subscribedPollId, client) => {
    console.log(
      `Client subscribed to poll ID: ${subscribedPollId}, Poll ID to broadcast: ${pollId}`
    );
    const message = { type: "pollUpdate", pollId, results };
    if (subscribedPollId == pollId) {
      console.log(`Client readyState: ${client.readyState}`);
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(message));
        console.log(
          `Poll update sent to client subscribed to poll ID: ${pollId}`
        );
      } else {
        console.warn("Client is not in OPEN state; skipping broadcast.");
      }
    }
  });
};

export const broadcastLeaderboard = (leaderboard) => {
  clients.forEach((_, client) => {
    if (client.readyState === client.OPEN) {
      console.log("broadcastLeaderboard called");
      client.send(JSON.stringify({ type: "leaderboard", leaderboard }));
    }
  });
};

console.log("WebSocket server running on ws://localhost:8080");
