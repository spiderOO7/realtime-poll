import { PollDocument, PollModel, PollOption, PollStatus } from "../models/poll";

export class PollRepository {
  async create(question: string, options: PollOption[], duration: number, startTime: Date) {
    return PollModel.create({ question, options, duration, startTime, status: "active" });
  }

  async findActive() {
    return PollModel.findOne({ status: "active" }).exec();
  }

  async findById(id: string) {
    return PollModel.findById(id).exec();
  }

  async markStatus(id: string, status: PollStatus) {
    return PollModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async closeActive() {
    return PollModel.findOneAndUpdate({ status: "active" }, { status: "closed" }, { new: true }).exec();
  }

  async incrementOptionVote(pollId: string, optionId: string) {
    return PollModel.findOneAndUpdate(
      { _id: pollId, "options.id": optionId },
      { $inc: { "options.$.votes": 1 } },
      { new: true }
    ).exec();
  }

  async listHistory(limit = 50) {
    return PollModel.find({ status: "closed" }).sort({ createdAt: -1 }).limit(limit).exec();
  }
}