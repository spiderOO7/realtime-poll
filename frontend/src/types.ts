export type PollStatus = "active" | "closed";

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  duration: number;
  startTime: string;
  status: PollStatus;
};

export type ActivePollPayload = {
  poll: Poll | null;
  remaining: number;
  studentVote?: { optionId: string } | null;
  serverTime: number;
};