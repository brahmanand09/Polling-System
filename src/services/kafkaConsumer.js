import { Kafka } from "kafkajs";
import { castVote, fetchLeaderboard } from "../models/pollModel.js";
import { broadcastUpdate, broadcastLeaderboard } from "./websocketService.js";
import { db } from "../config/dbConfig.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const kafka = new Kafka({
  clientId: "polling-system",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "poll-consumer-group" });

export const consumeVotes = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "votes", fromBeginning: false });

  console.log("Kafka Consumer connected and listening for votes...");
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const { vote } = JSON.parse(message.value.toString());
        console.log("Received vote:", vote);

        // Validate and cast the vote with both pollOptionId and pollId
        const updatedOption = await castVote(vote.pollOptionId, vote.pollId);

        // Fetch the latest poll results
        const pollResults = await fetchPollResults(vote.pollId);
        console.log(`[${topic}] part: ${partition}`, message.value.toString());

        // Broadcast updated poll results to WebSocket clients

        console.log("Vote processed successfully:", updatedOption);
        const leaderboard = await fetchLeaderboard();
        console.log(pollResults);
        broadcastUpdate(vote.pollId, pollResults);
        broadcastLeaderboard(leaderboard);
      } catch (error) {
        console.error("Error processing vote:", error);
      }
    },
  });
};

// Helper function to fetch updated poll results
const fetchPollResults = async (pollId) => {
  try {
    const result = await db.query(
      `
      SELECT option_text, votes_count 
      FROM poll_options 
      WHERE poll_id = $1 
      ORDER BY votes_count DESC
      `,
      [pollId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching poll results:", error);
    throw error;
  }
};

export default consumer;
