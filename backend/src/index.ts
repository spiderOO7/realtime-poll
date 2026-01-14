import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { config } from "./config/env";
import { PollController } from "./controllers/PollController";
import { errorHandler } from "./middlewares/errorHandler";
import { PollRepository } from "./repositories/pollRepository";
import { VoteRepository } from "./repositories/voteRepository";
import { buildPollRoutes } from "./routes/pollRoutes";
import { registerPollSocket } from "./sockets/pollSocket";
import { PollService } from "./services/PollService";

const app = express();
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.clientOrigin } });

const pollRepo = new PollRepository();
const voteRepo = new VoteRepository();
const pollService = new PollService(pollRepo, voteRepo);
const pollController = new PollController(pollService);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", buildPollRoutes(pollController));
app.use(errorHandler);

registerPollSocket(io, pollService);

mongoose
  .connect(config.mongoUri)
  .then(() => {
    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to Mongo", err);
    process.exit(1);
  });