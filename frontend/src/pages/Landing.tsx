import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="page-shell">
      <div className="centered-card">
        <div className="hero">
          <div className="pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Intervue Poll
          </div>
          <h1 style={{ fontSize: 36, marginTop: 16, fontWeight: 400 }}>
            Welcome to the <span style={{ fontWeight: 700 }}>Live Polling System</span>
          </h1>
          <p style={{ maxWidth: 560, margin: "8px auto 0" }}>
            Please select the role that best describes you to begin using the
            live polling system
          </p>
        </div>
        <div className="persona-grid">
          <div className="persona-card" onClick={() => navigate("/student")}>
            <div className="title" style={{ fontSize: 18 }}>
              I’m a Student
            </div>
            <div className="subtitle" style={{ maxWidth: 440 }}>
              Join and participate in live polls.
            </div>
          </div>
          <div className="persona-card" onClick={() => navigate("/teacher")}>
            <div className="title" style={{ fontSize: 18 }}>
              I’m a Teacher
            </div>
            <div className="subtitle" style={{ maxWidth: 440 }}>
              Submit answers and view live poll results in real-time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
