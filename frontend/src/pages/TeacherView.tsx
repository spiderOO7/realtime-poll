import { useState, useMemo, useEffect } from "react";
import { PollOptions } from "../components/PollOptions";
import { PollTimer } from "../components/PollTimer";
import { useSocket } from "../hooks/useSocket";

interface TeacherViewProps {
  pollState: any;
  remaining: number;
}

export const TeacherView = ({ pollState, remaining }: TeacherViewProps) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["Yes", "No"]);
  const [duration, setDuration] = useState(60);
  const [showHistory, setShowHistory] = useState(false);

  const disableCreate = useMemo(
    () => pollState.activePoll !== null || pollState.loading,
    [pollState.activePoll, pollState.loading]
  );

  const handleAddOption = () => setOptions((prev) => [...prev, ""]);

  const handleOptionChange = (value: string, index: number) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const startPoll = async () => {
    const cleanOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!question.trim() || cleanOptions.length < 2) return;
    await pollState.createPoll({
      question: question.trim(),
      options: cleanOptions,
      duration,
    });
  };

  const toggleHistory = () => {
     if (!showHistory) {
         pollState.fetchHistory();
     }
     setShowHistory(!showHistory);
  };

  if (showHistory) {
      return (
        <div className="page-shell" style={{ alignItems: "flex-start" }}>
            <div className="container" style={{maxWidth: 800}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24}}>
                    <div className="title">View <strong>Poll History</strong></div>
                    <button className="button" style={{height: 40, padding: "0 20px"}} onClick={() => setShowHistory(false)}>
                        Back to Dashboard
                    </button>
                </div>
                
                <div style={{display: "flex", flexDirection: "column", gap: 32}}>
                    {pollState.history.map((poll: any, idx: number) => (
                        <div key={poll.id}>
                            <div style={{fontWeight: 700, marginBottom: 12}}>Question {idx + 1}</div>
                            <div className="option-card">
                                <div className="option-header" style={{background: "#666", display: "flex", justifyContent: "space-between"}}>
                                    <span>{poll.question}</span>
                                </div>
                                <div className="option-body">
                                    <PollOptions 
                                        poll={poll}
                                        selected={null}
                                        disabled
                                        showResults
                                        onSelect={() => {}}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {pollState.history.length === 0 && <div className="muted">No history available.</div>}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="page-shell" style={{ alignItems: "flex-start" }}>
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        
        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <button 
                className="button"
                onClick={toggleHistory}
                style={{
                    padding: "8px 16px",
                    fontSize: 13,
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                View Poll History
            </button>
        </div>

        <div className="grid">
          <div className="card">
            <div className="pill">Intervue Poll</div>
            <div className="title" style={{ fontSize: 22, marginTop: 12 }}>
              Let’s Get Started
            </div>
            {pollState.error && (
              <div className="alert" style={{ marginTop: 12 }}>
                {pollState.error}
              </div>
            )}
            <div style={{ marginTop: 24 }}>
              <div className="label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>Enter your question</span>
                <select
                  className="select"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  style={{ width: 140 }}
                >
                  {[60, 50, 40, 30, 20, 10].map((d) => (
                    <option key={d} value={d}>
                      {d} seconds
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="textarea"
                placeholder="Type your question here"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                style={{ background: "#f5f5f5", border: "none" }}
              />
            </div>
            <div style={{ marginTop: 24 }}>
              <div className="label" style={{ color: "var(--text)", fontWeight: 600 }}>
                Edit Options
              </div>
              <div className="list">
                {options.map((opt, idx) => (
                  <div key={idx} className="option-row" style={{ background: "#f5f5f5", border: "none" }}>
                    <div className="inline" style={{ gap: 10, flex: 1 }}>
                      <div className="option-index">{idx + 1}</div>
                      <input
                        className="input"
                        value={opt}
                        onChange={(e) => handleOptionChange(e.target.value, idx)}
                        placeholder={`Option ${idx + 1}`}
                        style={{ background: "transparent", border: "none", padding: 0 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="button secondary"
                style={{ marginTop: 12, width: "100%", borderStyle: "dashed", borderColor: "var(--accent)", color: "var(--accent)" }}
                onClick={handleAddOption}
              >
                + Add More option
              </button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid var(--border)",
                gap: 12
              }}
            >
              {!pollState.activePoll && (
              <button
                className="button"
                disabled={disableCreate}
                onClick={startPoll}
                style={{ width: 160 }}
              >
                {pollState.loading ? "Starting..." : "Ask Question"}
              </button>
              )}
              {pollState.activePoll && (
                  remaining > 0 ? (
                      <button className="button secondary" onClick={pollState.endPoll} style={{borderColor: "#ef4444", color: "#ef4444"}}>
                          End Poll
                      </button>
                  ) : (
                      <button className="button" onClick={() => {
                          pollState.resetPoll();
                          setQuestion("");
                          setOptions(["Yes", "No"]);
                      }} style={{background: "var(--accent)"}}>
                          New Poll
                      </button>
                  )
              )}
            </div>
          </div>
          <div className="card">
            <div className="header" style={{ marginBottom: 16 }}>
              <div className="title" style={{ fontSize: 18 }}>Live Results</div>
              {pollState.activePoll && (
                <div className="timer">
                  <PollTimer remaining={remaining} />
                </div>
              )}
            </div>
            {pollState.activePoll ? (
              <div className="option-card">
                <div className="option-header" style={{ background: "#333", padding: 16 }}>
                  {pollState.activePoll.question}
                </div>
                <div className="option-body" style={{ padding: 0 }}>
                  <PollOptions
                    poll={pollState.activePoll}
                    selected={null}
                    disabled
                    showResults
                    onSelect={() => {}}
                  />
                </div>
              </div>
            ) : (
              <div className="waiting">
                <div className="spinner" style={{ borderColor: "#e0e0e0", borderTopColor: "var(--accent)" }} />
                <div className="subtitle" style={{ marginTop: 16 }}>
                  Ask a new question to see live results..
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
