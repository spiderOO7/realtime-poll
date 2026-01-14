type Props = { remaining: number };

const format = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export const PollTimer = ({ remaining }: Props) => (
  <div className="timer">{format(remaining)}</div>
);