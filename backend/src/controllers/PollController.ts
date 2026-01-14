import { Request, Response } from "express";
import { PollService } from "../services/PollService";

export class PollController {
  constructor(private pollService: PollService) {}

  createPoll = async (req: Request, res: Response) => {
    const { question, options, duration } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "Invalid payload" });
    }
    const poll = await this.pollService.createPoll(question, options, duration || 60);
    return res.status(201).json({ poll });
  };

  getActive = async (req: Request, res: Response) => {
    const studentId = req.query.studentId as string | undefined;
    const result = await this.pollService.getActivePoll(studentId);
    if (!result) {
      return res.json({ poll: null, remaining: 0, serverTime: Date.now() });
    }
    return res.json({ poll: result.poll, remaining: result.remaining, studentVote: result.studentVote, serverTime: Date.now() });
  };

  vote = async (req: Request, res: Response) => {
    const { pollId, studentId, studentName, optionId } = req.body;
    if (!pollId || !studentId || !studentName || !optionId) {
      return res.status(400).json({ message: "Invalid payload" });
    }
    const updated = await this.pollService.submitVote(pollId, studentId, studentName, optionId);
    return res.json({ poll: updated });
  };

  history = async (_req: Request, res: Response) => {
    const polls = await this.pollService.getHistory();
    return res.json({ polls });
  };

  end = async (_req: Request, res: Response) => {
    const closed = await this.pollService.endActivePoll();
    return res.json({ poll: closed });
  };
}