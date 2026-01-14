import { Router } from "express";
import { PollController } from "../controllers/pollController";
import { asyncHandler } from "../utils/asyncHandler";

export const buildPollRoutes = (controller: PollController) => {
  const router = Router();
  router.post("/polls", asyncHandler(controller.createPoll));
  router.get("/polls/active", asyncHandler(controller.getActive));
  router.post("/polls/vote", asyncHandler(controller.vote));
  router.get("/polls/history", asyncHandler(controller.history));
  router.post("/polls/end", asyncHandler(controller.end));
  return router;
};