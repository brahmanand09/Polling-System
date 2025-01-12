class WebSocketClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.callbacks = {};

    // Set up a promise to resolve when the WebSocket is open
    this.readyStatePromise = new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve("WebSocket connected");
      this.ws.onerror = (error) => reject("WebSocket connection error:", error);
    });
  }

  // Method to subscribe to a poll
  async subscribeToPoll(pollId) {
    try {
      // Wait until the WebSocket is open
      await this.readyStatePromise;

      // Send the subscription message to the WebSocket server
      this.ws.send(JSON.stringify({ action: "subscribe", pollId }));
      console.log(`Subscribed to poll ID: ${pollId}`);
    } catch (error) {
      console.error("Error in WebSocket subscription:", error);
    }
  }

  // Method to register event listeners
  on(eventType, callback) {
    this.callbacks[eventType] = callback;
  }

  // Method to listen for incoming messages
  listen() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message received:", data);

      // Trigger the appropriate callback
      console.log(data.type);
      if (data.type && this.callbacks[data.type]) {
        this.callbacks[data.type](data);
      }
    };

    this.ws.onerror = (error) => console.error("WebSocket error:", error);
    this.ws.onclose = () => console.log("WebSocket connection closed");
  }
}

export default WebSocketClient;
