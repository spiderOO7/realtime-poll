import mongoose, { Document, Schema } from "mongoose";

export interface VoteDocument extends Document {
  pollId: mongoose.Types.ObjectId;
  studentId: string;
  studentName: string;
  optionId: string;
  createdAt: Date;
}

const VoteSchema = new Schema<VoteDocument>(
  {
    pollId: { type: Schema.Types.ObjectId, ref: "Poll", required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    optionId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VoteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

export const VoteModel = mongoose.model<VoteDocument>("Vote", VoteSchema);