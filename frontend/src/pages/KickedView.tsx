export const KickedView = () => {
  return (
    <div className="page-shell">
      <div className="waiting" style={{ padding: 0, gap: 24 }}>
        <div className="pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          Intervue Poll
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px" }}>
            You’ve been Kicked out !
          </h1>
          <p
            style={{
              color: "var(--muted)",
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Looks like the teacher had removed you from the poll system .Please Try
            again sometime.
          </p>
        </div>
      </div>
    </div>
  );
};
