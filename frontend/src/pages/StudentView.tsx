import { useEffect, useState } from "react";
import { PollOptions } from "../components/PollOptions";
import { PollTimer } from "../components/PollTimer";
import { useSocket } from "../hooks/useSocket";
import { useNavigate } from "react-router-dom";

interface StudentViewProps {
  pollState: any;
  sessionId: string;
  name: string;
  setName: (name: string) => void;
  remaining: number;
}

export const StudentView = ({
  pollState,
  sessionId,
  name,
  setName,
  remaining,
}: StudentViewProps) => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [tempName, setTempName] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useEffect(() => {
    if (remaining <= 1 && selectedOption && !pollState.studentVote) {
      pollState.vote(selectedOption);
    }
  }, [remaining, selectedOption, pollState.studentVote]);

  useEffect(() => {
    if (name) {
      socket.emit("student:join", { id: sessionId, name });
    }
    const onKicked = () => {
       setName("");
       navigate("/kicked");
    };
    socket.on("student:kicked", onKicked);
    return () => {
       socket.off("student:kicked", onKicked);
    };
  }, [name, sessionId, socket]);

  useEffect(() => {
    setSelectedOption(null);
    setSelectionError(null);
  }, [pollState.activePoll?.id]);

  const handleSubmit = () => {
    if (remaining <= 0) return;
    if (!selectedOption) {
      setSelectionError("Please select an option before submitting.");
      return;
    }
    setSelectionError(null);
    pollState.vote(selectedOption);
  };

  if (!name) {
    return (
      <div className="page-shell">
        <div className="centered-card" style={{ maxWidth: 480 }}>
          <div className="hero" style={{ margin: "0 auto 24px" }}>
            <div className="pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Intervue Poll
            </div>
            <h1 style={{ fontSize: 24, marginTop: 12 }}>Let’s Get Started</h1>
            <p style={{ marginTop: 8 }}>
              If you're a student, you'll be able to <b>submit your answers</b>,
              participate in live polls, and see how your responses compare with
              your classmates
            </p>
          </div>
          <div style={{ textAlign: "left" }}>
            <div className="label">Enter your Name</div>
            <input
              className="input"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="John Doe"
              style={{ fontWeight: 500 }}
              onKeyDown={(e) => e.key === 'Enter' && tempName.trim() && setName(tempName.trim())}
            />
            <button
              className="button"
              style={{ width: "100%", marginTop: 24 }}
              disabled={!tempName.trim()}
              onClick={() => setName(tempName.trim())}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ alignItems: "flex-start" }}>
      <div
        className="container"
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        <div
          className="header"
          style={{
            alignItems: "center",
            paddingBottom: 16,
            borderBottom: "1px solid var(--border)",
            marginBottom: 16,
          }}
        >
          <div className="inline" style={{ gap: 12 }}>
            <div className="pill">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Intervue Poll
            </div>
            <div className="subtitle" style={{ fontSize: 13 }}>
              Session ID: {sessionId.slice(0, 8)}
            </div>
          </div>
          <div className="pill-badge" style={{ borderRadius: 20 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4ade80",
              }}
            ></span>
            {name}
          </div>
        </div>

        {pollState.error && (
          <div className="alert" style={{ marginBottom: 16 }}>
            {pollState.error}
          </div>
        )}

        {pollState.activePoll ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div className="title" style={{ fontSize: 18 }}>
                Question
              </div>
              <div className="timer">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <PollTimer remaining={remaining} />
              </div>
            </div>

            <div className="option-card">
              <div
                className="option-header"
                style={{
                  background: "var(--dark)",
                  fontSize: 16,
                  padding: "16px",
                }}
              >
                {pollState.activePoll.question}
              </div>
              <div className="option-body">
                <PollOptions
                  poll={pollState.activePoll}
                  selected={pollState.studentVote || selectedOption}
                  disabled={!!pollState.studentVote || remaining === 0}
                  showResults={Boolean(remaining === 0)}
                  onSelect={(id) => {
                    if (!pollState.studentVote && remaining > 0) {
                      setSelectionError(null);
                      setSelectedOption(id);
                    }
                  }}
                />
              </div>
            </div>
            {!pollState.studentVote && remaining === 0 && (
              <div
                className="muted"
                style={{ marginTop: 12, textAlign: "center" }}
              >
                Time is up. Showing results.
              </div>
            )}
            
            {!pollState.studentVote && remaining > 0 && (
               <button 
                  className="button" 
                  style={{marginTop: 16, width: "100%"}}
                  onClick={handleSubmit}
                >
                  Submit Vote
               </button>
            )}

            {selectionError && (
              <div className="alert" style={{ marginTop: 12 }}>
                {selectionError}
              </div>
            )}

            {pollState.studentVote && (
              <div style={{ marginTop: 16, textAlign: "right" }}>
                <button
                  className="button"
                  style={{ opacity: 0.7, cursor: "default" }}
                >
                  Submitted
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="waiting">
            <div className="spinner" />
            <div
              className="subtitle"
              style={{ fontSize: 16, fontWeight: 500, marginTop: 16 }}
            >
              Wait for the teacher to ask questions..
            </div>
          </div>
        )}

        <div className="card">
          <div className="header">
            <div className="title" style={{ fontSize: 18 }}>
              Poll History
            </div>
            <button
              className="button secondary"
              style={{ padding: "8px 16px", fontSize: 13 }}
              onClick={pollState.fetchHistory}
            >
              Refresh
            </button>
          </div>
          <div
            className="list"
            style={{ marginTop: 14, maxHeight: 420, overflowY: "auto" }}
          >
            {pollState.history.map((poll: any) => {
              const total = poll.options.reduce(
                (s: number, o: any) => s + o.votes,
                0
              );
              return (
                <div key={poll.id} className="history-card">
                  <div
                    className="inline"
                    style={{
                      justifyContent: "space-between",
                      width: "100%",
                      marginBottom: 12,
                    }}
                  >
                    <div className="title" style={{ fontSize: 15 }}>
                      {poll.question}
                    </div>
                    <div className="subtitle" style={{ fontSize: 12 }}>
                      {total} votes
                    </div>
                  </div>
                  <div className="option-body" style={{ padding: 0, gap: 8 }}>
                    {poll.options.map((opt: any) => {
                      const pct =
                        total === 0
                          ? 0
                          : Math.round((opt.votes / total) * 100);
                      return (
                        <div
                          key={opt.id}
                          className="option-row"
                          style={{
                            cursor: "default",
                            padding: "8px 10px",
                            background: "transparent",
                            border: "none",
                          }}
                        >
                          <div className="inline" style={{ gap: 10 }}>
                            <span
                              className="option-radio"
                              style={{ width: 14, height: 14, borderWidth: 1.5 }}
                            />
                            <div style={{ fontSize: 14 }}>{opt.text}</div>
                          </div>
                          <div className="option-meta">
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--text)",
                              }}
                            >
                              {pct}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {pollState.history.length === 0 && (
              <div
                className="muted"
                style={{ textAlign: "center", padding: 20 }}
              >
                No past polls.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
