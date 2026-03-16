"use client";

import { useState } from "react";

interface ConsentScreenProps {
  onConsent: (participantId: string) => void;
}

export default function ConsentScreen({ onConsent }: ConsentScreenProps) {
  const [participantId, setParticipantId] = useState("");
  const [checked, setChecked] = useState({
    understand: false,
    voluntary: false,
    data: false,
  });
  const [error, setError] = useState("");

  const allChecked = Object.values(checked).every(Boolean);
  const canProceed = allChecked && participantId.trim().length >= 2;

  function handleSubmit() {
    if (!participantId.trim()) {
      setError("Please enter your participant ID before continuing.");
      return;
    }
    if (participantId.trim().length < 2) {
      setError("Participant ID must be at least 2 characters.");
      return;
    }
    if (!allChecked) {
      setError("Please confirm all statements before continuing.");
      return;
    }
    setError("");
    onConsent(participantId.trim());
  }

  return (
    <div className="consent-root">
      <div className="consent-card">
        {/* Header */}
        <div className="consent-header">
          <span className="logo-mark">RE</span>
          <p className="consent-eyebrow">Reading Experiment</p>
        </div>

        <h1 className="consent-title">Participant Information & Consent</h1>

        <div className="consent-body">
          <section className="consent-section">
            <h2 className="consent-section-title">About this study</h2>
            <p>
              This study investigates how people read and engage with text on
              screen. You will be asked to read a series of short passages at
              your own pace. The study takes approximately <strong>5–10 minutes</strong>.
            </p>
          </section>

          <section className="consent-section">
            <h2 className="consent-section-title">What data is collected</h2>
            <ul className="consent-list">
              <li>How long you spend viewing each passage</li>
              <li>How far you scroll through each passage</li>
              <li>Mouse cursor movement patterns over the text</li>
              <li>How many times you revisit each section</li>
            </ul>
            <p className="consent-note">
              No personally identifying information is collected. Your responses
              are stored anonymously and linked only to the participant ID you
              provide below.
            </p>
          </section>

          <section className="consent-section">
            <h2 className="consent-section-title">Your rights</h2>
            <p>
              Participation is entirely voluntary. You may withdraw at any time
              without consequence by closing this browser tab. Data collected
              before withdrawal will be deleted upon request.
            </p>
          </section>

          {/* Participant ID */}
          <section className="consent-section">
            <h2 className="consent-section-title">Participant ID</h2>
            <p className="consent-note" style={{ marginBottom: "0.75rem" }}>
              Enter the ID provided by the researcher, or create your own
              anonymous identifier (e.g. your initials + a number).
            </p>
            <input
              className="pid-input"
              type="text"
              placeholder="e.g. AB42"
              value={participantId}
              onChange={(e) => {
                setParticipantId(e.target.value);
                setError("");
              }}
              maxLength={32}
              autoComplete="off"
            />
          </section>

          {/* Checkboxes */}
          <section className="consent-section">
            <h2 className="consent-section-title">Please confirm</h2>
            <div className="consent-checks">
              {(
                [
                  ["understand", "I have read and understood the information above."],
                  ["voluntary", "I understand that participation is voluntary and I may withdraw at any time."],
                  ["data", "I agree to my anonymised data being collected and used for research purposes."],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="consent-check-label">
                  <input
                    type="checkbox"
                    className="consent-checkbox"
                    checked={checked[key]}
                    onChange={(e) =>
                      setChecked((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          {error && <p className="consent-error">{error}</p>}

          <button
            className={`btn btn-primary consent-btn ${!canProceed ? "btn-disabled" : ""}`}
            onClick={handleSubmit}
          >
            I consent — begin the experiment →
          </button>
        </div>
      </div>
    </div>
  );
}
