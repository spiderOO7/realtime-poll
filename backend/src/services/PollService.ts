import { v4 as uuid } from "uuid";
import { PollDocument, PollOption } from "../models/poll";
import { PollRepository } from "../repositories/pollRepository";
import { VoteRepository } from "../repositories/voteRepository";
import { remainingSeconds } from "../utils/time";

export class PollService {
  constructor(private pollRepo: PollRepository, private voteRepo: VoteRepository) {}

  async createPoll(question: string, optionTexts: string[], duration: number) {
    const active = await this.pollRepo.findActive();
    if (active) {
       const expired = remainingSeconds(active.startTime, active.duration) === 0;
       if (expired) {
          await this.pollRepo.markStatus(active.id, "closed");
       } else {
          throw new Error("An active poll already exists");
       }
    }
    const boundedDuration = Math.min(Math.max(duration, 10), 60);
    const options: PollOption[] = optionTexts.map((text) => ({ id: uuid(), text, votes: 0 }));
    const startTime = new Date();
    const poll = await this.pollRepo.create(question, options, boundedDuration, startTime);
    return poll;
  }

  async getActivePoll(studentId?: string) {
    const active = await this.pollRepo.findActive();
    if (!active) return null;
    const expired = remainingSeconds(active.startTime, active.duration) === 0;
    if (expired) {
      await this.pollRepo.markStatus(active.id, "closed");
      return null;
    }
    let studentVote = null;
    if (studentId) {
      studentVote = await this.voteRepo.findByPollAndStudent(active.id, studentId);
    }
    return { poll: active, remaining: remainingSeconds(active.startTime, active.duration), studentVote };
  }

  async submitVote(pollId: string, studentId: string, studentName: string, optionId: string) {
    const poll = await this.pollRepo.findById(pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }
    if (poll.status !== "active") {
      throw new Error("Poll is closed");
    }
    const timeLeft = remainingSeconds(poll.startTime, poll.duration);
    if (timeLeft === 0) {
      await this.pollRepo.markStatus(poll.id, "closed");
      throw new Error("Poll expired");
    }
    const optionExists = poll.options.some((opt) => opt.id === optionId);
    if (!optionExists) {
      throw new Error("Invalid option");
    }
    try {
      await this.voteRepo.create(pollId, studentId, studentName, optionId);
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new Error("Duplicate vote");
      }
      throw err;
    }
    const updated = await this.pollRepo.incrementOptionVote(pollId, optionId);
    return updated as PollDocument;
  }

  async getHistory() {
    return this.pollRepo.listHistory();
  }

  async endActivePoll() {
    const active = await this.pollRepo.findActive();
    if (!active) {
      throw new Error("No active poll to end");
    }
    return this.pollRepo.closeActive();
  }
}