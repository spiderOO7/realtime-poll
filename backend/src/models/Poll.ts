import mongoose, { Document, Schema } from "mongoose";

export type PollStatus = "active" | "closed";

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollDocument extends Document {
  question: string;
  options: PollOption[];
  duration: number;
  startTime: Date;
  status: PollStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<PollOption>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    votes: { type: Number, default: 0 },
  },
  { _id: false }
);

const PollSchema = new Schema<PollDocument>(
  {
    question: { type: String, required: true },
    options: { type: [OptionSchema], required: true },
    duration: { type: Number, required: true },
    startTime: { type: Date, required: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  { timestamps: true }
);

export const PollModel = mongoose.model<PollDocument>("Poll", PollSchema);