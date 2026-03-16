"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ConsentScreen from "@/components/ConsentScreen";
import TextSection from "@/components/TextSection";
import MetricsPanel from "@/components/MetricsPanel";
import CompletionScreen from "@/components/CompletionScreen";
import { useReadingTracker, ReadingSession } from "@/hooks/useReadingTracker";

const SECTIONS = [
  {
    id: "section-1",
    title: "The Foundations of Attention",
    body: `Attention is the cognitive process of selectively concentrating on one aspect of the environment while ignoring other things. William James, the pioneering psychologist, described it in 1890 as "the taking possession of the mind, in clear and vivid form, of one out of what seem several simultaneously possible objects or trains of thought." Modern neuroscience has expanded upon this definition dramatically. We now understand that attention is not a single process but a family of related mechanisms, each serving distinct purposes and relying on overlapping but distinguishable brain circuits. The frontoparietal network, in particular, plays a crucial role in directing and sustaining attention, acting almost like an orchestra conductor for our perceptual experience.`,
  },
  {
    id: "section-2",
    title: "Reading in the Digital Age",
    body: `The way humans read has transformed profoundly over the past two decades. Researchers at the Nielsen Norman Group documented what they called the "F-pattern" of web reading — users tend to scan the first lines of content horizontally, then move down the left side, reading only the beginnings of subsequent lines. This scanning behaviour contrasts sharply with deep, linear reading of printed text. Maryanne Wolf, cognitive neuroscientist and author of Reader Come Home, argues that the brain's reading circuit — which is not innate but painstakingly built through education — is being reshaped by digital media. The concern is not merely that we read less, but that we are losing the cognitive infrastructure required for the kind of slow, empathic, analytical reading that literature demands.`,
  },
  {
    id: "section-3",
    title: "Measuring Engagement",
    body: `Traditional measures of reading comprehension — multiple choice tests, recall tasks, summary writing — capture something about what was understood but little about how reading unfolded. Eye-tracking studies have revealed that skilled readers make frequent regressions, jumping back in the text to re-read ambiguous or surprising content. Pupillometry research shows that cognitive load during reading causes measurable dilation of the pupil. Even mouse cursor movements on screens have been used as a proxy for visual attention, correlating reasonably well with where participants are directing their gaze. The emergence of passive, continuous measurement holds the promise of studying reading in ecologically valid settings without interrupting the very process being examined.`,
  },
  {
    id: "section-4",
    title: "Experimental Ethics & Consent",
    body: `Any study collecting behavioural data from participants must navigate a careful ethical landscape. Informed consent is not merely a procedural box to check — it reflects a fundamental respect for participant autonomy. Participants must understand what data is being collected, how it will be stored, who will have access to it, and how long it will be retained. In experiments involving reading and attention, there is sometimes a tension between full disclosure and experimental validity: if participants know precisely what is being measured, they may alter their behaviour in ways that confound the results. Partial disclosure with full debriefing is one accepted approach, but institutional review boards vary in their interpretation of when such designs are permissible.`,
  },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);
const SECTION_TITLES = Object.fromEntries(SECTIONS.map((s) => [s.id, s.title]));

type Stage = "consent" | "experiment" | "complete";

export default function ExperimentPage() {
  const [stage, setStage] = useState<Stage>("consent");
  const [participantId, setParticipantId] = useState("");
  const [showMetrics, setShowMetrics] = useState(true);
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [finalSession, setFinalSession] = useState<ReadingSession | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const { getSnapshot, reset } = useReadingTracker(SECTION_IDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (stage !== "experiment") return;
    intervalRef.current = setInterval(() => setSession(getSnapshot()), 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [stage, getSnapshot]);

  function handleConsent(pid: string) {
    setParticipantId(pid);
    reset();
    setStage("experiment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const handleFinish = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const snap = getSnapshot();
    const payload = { ...snap, participantId };
    setFinalSession(payload);
    setSubmitStatus("saving");
    setStage("complete");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSubmitStatus(res.ok ? "saved" : "error");
    } catch {
      setSubmitStatus("error");
    }
  }, [getSnapshot, participantId]);

  function handleRestart() {
    reset();
    setSession(null);
    setFinalSession(null);
    setSubmitStatus("idle");
    setParticipantId("");
    setStage("consent");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (stage === "consent") return <ConsentScreen onConsent={handleConsent} />;

  if (stage === "complete" && finalSession) {
    return (
      <CompletionScreen
        session={finalSession}
        participantId={participantId}
        submitStatus={submitStatus}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="page-root">
      <header className="top-bar">
        <div className="top-bar-inner">
          <div className="top-bar-left">
            <span className="logo-mark">RE</span>
            <span className="site-name">Reading Experiment</span>
          </div>
          <div className="top-bar-actions">
            <span className="pid-badge">ID: {participantId}</span>
            <button className="btn btn-ghost" onClick={() => setShowMetrics((v) => !v)}>
              {showMetrics ? "Hide" : "Show"} metrics
            </button>
            <button className="btn btn-primary" onClick={handleFinish}>
              Finish →
            </button>
          </div>
        </div>
      </header>

      <main className="main-layout">
        <div className="reading-column">
          <div className="reading-intro">
            <p className="intro-eyebrow">Participant task</p>
            <h1 className="intro-heading">Please read each passage carefully.</h1>
            <p className="intro-sub">
              Scroll through the text at your own pace. There is no time limit.
              Click <strong>Finish</strong> when you are done.
            </p>
          </div>

          <div className="sections-list">
            {SECTIONS.map((s, i) => (
              <TextSection key={s.id} id={s.id} title={s.title} body={s.body} index={i} />
            ))}
          </div>

          <div className="reading-end">
            <div className="end-badge">End of passages</div>
            <button className="btn btn-primary" onClick={handleFinish} style={{ marginTop: "1.25rem" }}>
              I have finished reading →
            </button>
          </div>
        </div>

        {showMetrics && (
          <aside className="metrics-sidebar">
            <MetricsPanel session={session} sectionTitles={SECTION_TITLES} />
          </aside>
        )}
      </main>
    </div>
  );
}
