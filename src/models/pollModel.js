import { db } from "../config/dbConfig.js";

export const createPoll = async (question, options) => {
  try {
    const pollResult = await db.query(
      "INSERT INTO polls (question) VALUES ($1) RETURNING *",
      [question]
    );

    const pollId = pollResult.rows[0].id;
    const optionPromises = options.map((option) =>
      db.query(
        "INSERT INTO poll_options (poll_id, option_text) VALUES ($1, $2)",
        [pollId, option]
      )
    );
    await Promise.all(optionPromises);
    return pollResult.rows[0];
  } catch (error) {
    throw error;
  }
};
// Function to cast a vote
export const castVote = async (pollOptionId, pollId) => {
  try {
    // Validate that the pollOptionId belongs to the pollId
    console.log(pollOptionId, pollId);
    const validationResult = await db.query(
      "SELECT * FROM poll_options WHERE id = $1 AND poll_id = $2",
      [pollOptionId, pollId]
    );

    if (validationResult.rows.length === 0) {
      throw new Error("Poll option does not belong to the specified poll.");
    }

    // Increment the vote count
    const result = await db.query(
      "UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = $1 RETURNING *",
      [pollOptionId]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error in castVote:", error);
    throw error;
  }
};

// Function to fetch poll results
export const getPollResults = async (pollId) => {
  try {
    const result = await db.query(
      "SELECT id,option_text, votes_count FROM poll_options WHERE poll_id = $1 ORDER BY votes_count DESC",
      [pollId]
    );

    return result.rows;
  } catch (error) {
    console.error("Error in getPollResults:", error);
    throw error;
  }
};
export const fetchLeaderboard = async () => {
  try {
    const result = await db.query(
      `
      SELECT p.id AS poll_id, po.option_text, po.votes_count
      FROM poll_options po
      JOIN polls p ON po.poll_id = p.id
      ORDER BY po.votes_count DESC
      LIMIT 10;
      `
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};
