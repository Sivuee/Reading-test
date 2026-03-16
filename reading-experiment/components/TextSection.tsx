"use client";

import { useRef, useEffect, useState } from "react";

interface TextSectionProps {
  id: string;
  title: string;
  body: string;
  index: number;
}

export default function TextSection({ id, title, body, index }: TextSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      data-section-id={id}
      className={`section-card ${inView ? "in-view" : ""}`}
      style={{ "--idx": index } as React.CSSProperties}
    >
      <div className="section-number">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="section-content">
        <h2 className="section-title">{title}</h2>
        <div className="section-divider" />
        <p className="section-body">{body}</p>
      </div>
    </section>
  );
}
