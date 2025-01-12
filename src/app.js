import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pollRoutes from "./routes/pollRoutes.js";
import { setupKafka } from "./config/kafkaConfig.js";
import { createTables } from "./config/dbConfig.js";
import { consumeVotes } from "./services/kafkaConsumer.js";
import path from "path";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Routes
app.use("/api", pollRoutes);
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// Start the server
const startServer = async () => {
  try {
    await setupKafka(); 
    await createTables(); 
    await consumeVotes();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

startServer();
