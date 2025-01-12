import { Router } from "express";
import {
  createPollHandler,
  voteHandler,
  fetchPollResultsHandler,
  leaderboardHandler,
} from "../controllers/pollController.js";

const router = Router();
router.get("/leaderboard", leaderboardHandler); 
router.post("/polls", createPollHandler);
router.post("/polls/:pollId/vote", voteHandler);
router.get("/polls/:pollId", fetchPollResultsHandler);

export default router;
