import { Poll } from "../types";

type Props = {
  poll: Poll;
  selected: string | null;
  disabled: boolean;
  showResults: boolean;
  onSelect: (id: string) => void;
};

const percent = (count: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
};

export const PollOptions = ({ poll, selected, disabled, showResults, onSelect }: Props) => {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  return (
    <div className="list">
      {poll.options.map((option) => {
        const value = showResults ? percent(option.votes, totalVotes) : 0;
        const isSelected = selected === option.id;
        return (
          <button
            key={option.id}
            className={`option-row ${isSelected ? "active" : ""}`}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          >
            <div className="inline" style={{ gap: 10, flex: 1, justifyContent: "flex-start" }}>
              <span className={`option-radio ${isSelected ? "active" : ""}`} />
              <div style={{ fontWeight: 600 }}>{option.text}</div>
            </div>
            <div className="option-meta">
              {showResults && (
                <div className="progress">
                  <div className="progress-inner" style={{ width: `${value}%` }} />
                </div>
              )}
              {showResults && <div>{value}%</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
};