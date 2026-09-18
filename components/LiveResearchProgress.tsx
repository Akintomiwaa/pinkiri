"use client";
import { useEffect, useState } from 'react';
import { LoaderCircle, CheckCircle2, Sparkles, Terminal, Activity, Globe, Users, Search, FileText } from 'lucide-react';

interface Props {
  url: string;
  region: string;
  competitor?: string;
}

const STEPS = [
  {
    id: 'scrape',
    icon: Globe,
    title: 'Reading & Analyzing Landing Page',
    detail: 'Parsing core value propositions, feature sets, target segments, and pricing models...'
  },
  {
    id: 'competitors',
    icon: Users,
    title: 'Discovering & Benchmarking Competitors',
    detail: 'Evaluating rival positioning, winning features, formats, and customer complaints...'
  },
  {
    id: 'social',
    icon: Search,
    title: 'Scanning Social Media (X, TikTok, IG, Forums)',
    detail: 'Gathering authentic user posts, creator reels, complaints, and card decline discussions...'
  },
  {
    id: 'painpoints',
    icon: Sparkles,
    title: 'Synthesizing Customer Psychological Triggers',
    detail: 'Categorizing friction points, severity levels, and emotional blockers...'
  },
  {
    id: 'strategy',
    icon: FileText,
    title: 'Crafting CMO Strategy & Campaign Drafts',
    detail: 'Generating 8 tactical priorities, 3 production-ready drafts, and 7-day content plan...'
  }
];

const LOG_MESSAGES = [
  'Initializing Jina AI Reader for domain content extraction...',
  'Analyzing product jobs-to-be-done and ICP (Ideal Customer Profile)...',
  'Executing multi-market search for official competing products...',
  'Found verified competitors in regional corridor...',
  'Extracting competitor messaging hooks and user sentiment...',
  'Querying live discussions on X (Twitter) for customer friction...',
  'Scanning TikTok and Instagram for creator video testimonials...',
  'Indexing developer & community forum threads...',
  'Mapping high-severity friction points to competitor vulnerabilities...',
  'Gemini synthesis engine formulating 8 core strategic priorities...',
  'Writing viral X thread, scene-by-scene TikTok script, and objection copy...',
  'Generating 7-day multi-channel calendar with .ICS sync readiness...',
  'Finalizing evidence citations and grounded workspace report...'
];

export default function LiveResearchProgress({ url, region, competitor }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [logs, setLogs] = useState<string[]>([LOG_MESSAGES[0]]);
  const domain = url ? new URL(url.startsWith('http') ? url : 'https://' + url).hostname.replace(/^www\./, '') : 'website';

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Step progression simulation (smoothly moves through phases over ~35-45s)
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 7000);
    return () => clearInterval(stepInterval);
  }, []);

  // Log streaming simulation
  useEffect(() => {
    let logIndex = 1;
    const logInterval = setInterval(() => {
      if (logIndex < LOG_MESSAGES.length) {
        const nextMsg = LOG_MESSAGES[logIndex];
        setLogs(prev => [...prev.slice(-5), nextMsg]);
        logIndex++;
      }
    }, 3200);
    return () => clearInterval(logInterval);
  }, []);

  const progressPct = Math.min(95, Math.round(15 + (elapsed * 2.1)));

  return (
    <div className="cw-live-progress-container">
      {/* Header Banner */}
      <div className="cw-live-progress-header">
        <div className="cw-live-orb">
          <LoaderCircle size={22} className="spin cw-spin-accent" />
        </div>
        <div>
          <h2>Building your Marketing Intelligence Workspace</h2>
          <p>
            Analyzing <strong>{domain}</strong> · Market: <strong>{region || 'Global'}</strong>
            {competitor ? ` · Benchmarking: ${competitor}` : ''}
          </p>
        </div>
        <div className="cw-elapsed-badge">
          <Activity size={13} className="cw-pulse-icon" />
          <span>{elapsed}s elapsed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="cw-progress-bar-wrap">
        <div className="cw-progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Grid: 2 Columns (Steps Checklist on left, Live Agent Terminal on right) */}
      <div className="cw-live-grid">
        {/* Step Checklist */}
        <div className="cw-steps-list">
          {STEPS.map((step, idx) => {
            const isDone = idx < activeStep;
            const isCurrent = idx === activeStep;
            const isPending = idx > activeStep;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`cw-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="cw-step-icon-wrap">
                  {isDone ? (
                    <CheckCircle2 size={16} className="cw-step-done-icon" />
                  ) : isCurrent ? (
                    <LoaderCircle size={16} className="spin cw-step-current-icon" />
                  ) : (
                    <Icon size={14} className="cw-step-pending-icon" />
                  )}
                </div>
                <div className="cw-step-text">
                  <h4>{step.title}</h4>
                  <p>{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Thought Stream / Terminal */}
        <div className="cw-terminal-box">
          <div className="cw-terminal-top">
            <div className="cw-terminal-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <span className="cw-terminal-title">
              <Terminal size={12} /> AI CMO Intelligence Stream
            </span>
            <span className="cw-terminal-live-tag">LIVE</span>
          </div>

          <div className="cw-terminal-body">
            {logs.map((log, i) => (
              <div key={i} className="cw-terminal-line">
                <span className="cw-term-prompt">&gt;</span>
                <span className="cw-term-msg">{log}</span>
              </div>
            ))}
            <div className="cw-terminal-cursor">
              <span className="cw-term-prompt">&gt;</span>
              <span className="cw-cursor-blink">█</span>
            </div>
          </div>

          <div className="cw-terminal-foot">
            <span>Powered by Jina AI Reader, Social Search & Gemini</span>
          </div>
        </div>
      </div>
    </div>
  );
}
