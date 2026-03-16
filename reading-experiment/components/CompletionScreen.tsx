"use client";

import { ReadingSession } from "@/hooks/useReadingTracker";

interface CompletionScreenProps {
  session: ReadingSession;
  participantId: string;
  submitStatus: "idle" | "saving" | "saved" | "error";
  onRestart: () => void;
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = Math.round((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

export default function CompletionScreen({
  session,
  participantId,
  submitStatus,
  onRestart,
}: CompletionScreenProps) {
  const sections = Object.values(session.sections);
  const totalTime = sections.reduce((s, m) => s + m.totalTimeMs, 0);
  const avgDepth =
    sections.length > 0
      ? sections.reduce((s, m) => s + m.maxScrollDepth, 0) / sections.length
      : 0;

  function handleDownload() {
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${session.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="completion-root">
      <div className="completion-card">
        <div className="completion-icon">✓</div>

        <h1 className="completion-title">Thank you for participating</h1>
        <p className="completion-sub">
          Your responses have been recorded. You may now close this tab.
        </p>

        {/* Save status */}
        <div className={`save-badge save-badge--${submitStatus}`}>
          {submitStatus === "saving" && "⏳ Saving your data…"}
          {submitStatus === "saved" && "✓ Data saved successfully"}
          {submitStatus === "error" && "⚠ Save failed — please screenshot this page"}
          {submitStatus === "idle" && "Preparing…"}
        </div>

        {/* Summary stats */}
        <div className="completion-stats">
          <div className="stat-item">
            <span className="stat-value">{formatMs(totalTime)}</span>
            <span className="stat-label">Total reading time</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{Math.round(avgDepth * 100)}%</span>
            <span className="stat-label">Avg scroll depth</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{session.totalMouseMovements.toLocaleString()}</span>
            <span className="stat-label">Mouse events</span>
          </div>
        </div>

        {/* Per-section summary */}
        <div className="completion-sections">
          <h2 className="completion-sections-title">Section breakdown</h2>
          <table className="section-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Time</th>
                <th>Depth</th>
                <th>Visits</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((m) => (
                <tr key={m.sectionId}>
                  <td className="td-section">{m.sectionId}</td>
                  <td>{formatMs(m.totalTimeMs)}</td>
                  <td>{Math.round(m.maxScrollDepth * 100)}%</td>
                  <td>{m.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="completion-actions">
          <button className="btn btn-ghost" onClick={handleDownload}>
            Download JSON
          </button>
          <button className="btn btn-ghost" onClick={onRestart}>
            Start new session
          </button>
        </div>

        <p className="completion-pid">
          Participant ID: <strong>{participantId}</strong> · Session:{" "}
          <code>{session.sessionId}</code>
        </p>
      </div>
    </div>
  );
}
