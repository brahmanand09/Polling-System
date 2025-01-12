import { createPoll, getPollResults } from "../models/pollModel.js";
import { sendVoteToKafka } from "../services/kafkaProducer.js";
import { db } from "../config/dbConfig.js";

export const createPollHandler = async (req, res) => {
  const { question, options } = req.body;
  if (!question || !options || !Array.isArray(options)) {
    return res.status(400).send("Invalid request data");
  }

  try {
    const poll = await createPoll(question, options);
    res.status(201).json({ message: "Poll created successfully", poll });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Handles vote submission
export const voteHandler = async (req, res) => {
  const { pollId } = req.params;
  const { pollOptionId } = req.body;

  if (!pollId || !pollOptionId) {
    return res.status(400).send("Poll ID and Poll Option ID are required.");
  }

  try {
    // Validate poll option
    const pollOption = await db.query(
      "SELECT * FROM poll_options WHERE id = $1 AND poll_id = $2",
      [pollOptionId, pollId]
    );

    if (pollOption.rows.length === 0) {
      return res.status(404).send("Poll or Poll Option not found.");
    }

    // Send vote to Kafka
    await sendVoteToKafka({ pollId, pollOptionId });
    res.status(200).json({ message: "Vote submitted successfully." });
  } catch (error) {
    console.error("Error in voteHandler:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handles fetching poll results
export const fetchPollResultsHandler = async (req, res) => {
  const { pollId } = req.params;

  if (!pollId) {
    return res.status(400).send("Poll ID is required.");
  }

  try {
    const results = await getPollResults(pollId);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in fetchPollResultsHandler:", error);
    res.status(500).send("Internal Server Error");
  }
};



export const leaderboardHandler = async (req, res) => {
  try {
    const leaderboard = await db.query(
      `
      SELECT p.id AS poll_id, po.option_text, po.votes_count
      FROM poll_options po
      JOIN polls p ON po.poll_id = p.id
      ORDER BY po.votes_count DESC
      LIMIT 10;
      `
    );

    res.status(200).json(leaderboard.rows);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).send("Internal Server Error");
  }
};
