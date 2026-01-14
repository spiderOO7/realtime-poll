import { VoteModel } from "../models/vote";

export class VoteRepository {
  async create(pollId: string, studentId: string, studentName: string, optionId: string) {
    return VoteModel.create({ pollId, studentId, studentName, optionId });
  }

  async findByPollAndStudent(pollId: string, studentId: string) {
    return VoteModel.findOne({ pollId, studentId }).exec();
  }

  async countVotes(pollId: string) {
    return VoteModel.countDocuments({ pollId }).exec();
  }
}