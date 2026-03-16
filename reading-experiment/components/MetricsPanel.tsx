"use client";

import { ReadingSession, SectionMetrics } from "@/hooks/useReadingTracker";

interface MetricsPanelProps {
  session: ReadingSession | null;
  sectionTitles: Record<string, string>;
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%` }}
      />
      <span className="progress-label">{pct}%</span>
    </div>
  );
}

function SectionCard({ metrics, title }: { metrics: SectionMetrics; title: string }) {
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-section-title">{title}</span>
        <span className="metric-visits">
          {metrics.visits} {metrics.visits === 1 ? "visit" : "visits"}
        </span>
      </div>

      <div className="metric-row">
        <span className="metric-label">Time on section</span>
        <span className="metric-value accent">{formatMs(metrics.totalTimeMs)}</span>
      </div>

      <div className="metric-row">
        <span className="metric-label">Scroll depth</span>
      </div>
      <ProgressBar value={metrics.maxScrollDepth} />

      <div className="metric-row" style={{ marginTop: "0.5rem" }}>
        <span className="metric-label">Mouse movements</span>
        <span className="metric-value">{metrics.mouseMovements.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function MetricsPanel({ session, sectionTitles }: MetricsPanelProps) {
  if (!session) return null;

  const sections = Object.values(session.sections);
  const totalTime = sections.reduce((s, m) => s + m.totalTimeMs, 0);

  return (
    <div className="metrics-panel">
      <div className="metrics-header">
        <h3 className="metrics-title">📊 Live Metrics</h3>
        <div className="metrics-global">
          <span>Session: <strong>{formatMs(Date.now() - session.startedAt)}</strong></span>
          <span>Total read time: <strong>{formatMs(totalTime)}</strong></span>
          <span>Total mouse events: <strong>{session.totalMouseMovements.toLocaleString()}</strong></span>
        </div>
      </div>

      <div className="metrics-grid">
        {sections.map((m) => (
          <SectionCard
            key={m.sectionId}
            metrics={m}
            title={sectionTitles[m.sectionId] ?? m.sectionId}
          />
        ))}
      </div>
    </div>
  );
}
