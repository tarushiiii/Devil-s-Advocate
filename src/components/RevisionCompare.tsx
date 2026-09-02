import React, { useState, useEffect } from "react";
import { Protocol, VerdictReport } from "../types";
import { soundFx } from "../lib/audio";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  FileText,
  UserCheck,
  Scale,
} from "lucide-react";

interface RevisionCompareProps {
  previousAttempt: {
    decision: string;
    protocol: Protocol;
    personaKey: string;
  };
  previousVerdict: VerdictReport;
  currentVerdict: VerdictReport;
  currentProtocol: Protocol;
  currentPersonaKey: string;
  onComplete: () => void;
}

const personaNames: Record<string, string> = {
  cfo: "CFO",
  competitor: "Rival CEO",
  board: "Managing Director",
};

export const RevisionCompare: React.FC<RevisionCompareProps> = ({
  previousAttempt,
  previousVerdict,
  currentVerdict,
  currentProtocol,
  currentPersonaKey,
  onComplete,
}) => {
  const [animatedDelta, setAnimatedDelta] = useState(0);
  const delta = currentVerdict.score - previousVerdict.score;

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = delta / steps;

    const timer = setInterval(() => {
      start += increment;
      if (Math.abs(start) >= Math.abs(delta)) {
        setAnimatedDelta(delta);
        soundFx.playGavel();
        clearInterval(timer);
      } else {
        setAnimatedDelta(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [delta]);

  const getDeltaColor = (d: number) => {
    if (d > 0) return "text-[#e9c349]";
    if (d < 0) return "text-[#ffb4ab]";
    return "text-[#e4bdbc]/60";
  };

  const getDeltaIcon = (d: number) => {
    if (d > 0) return <ArrowUpRight className="w-4 h-4" />;
    if (d < 0) return <ArrowDownRight className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getBarColor = (current: number, previous: number, max: number) => {
    const currentPct = (current / max) * 100;
    const previousPct = (previous / max) * 100;
    if (currentPct > previousPct) return "bg-[#e9c349]";
    if (currentPct < previousPct) return "bg-[#ffb4ab]";
    return "bg-[#e4bdbc]/50";
  };

  const scoreCategories = [
    {
      key: "specificity" as const,
      label: "SPECIFICITY",
      icon: "◎",
    },
    {
      key: "consistency" as const,
      label: "CONSISTENCY",
      icon: "⟡",
    },
    {
      key: "falsifiability" as const,
      label: "FALSIFIABILITY",
      icon: "⊘",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col min-h-screen pb-28">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 mb-8">
        <span className="font-label-caps text-xs text-[#e9c349] tracking-[0.25em] block mb-2">
          REVISION COMPARISON
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#e2e2e2] tracking-tight mb-3">
          Did the defense hold?
        </h1>
        <p className="font-sans text-sm text-[#e4bdbc]/70 max-w-2xl leading-relaxed">
          Comparing your original decision against the revised submission across
          specificity, consistency, and falsifiability.
        </p>
      </div>

      {/* Score Delta Hero */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-10 mb-10">
        <div className="flex flex-col">
          <span className="font-label-caps text-[10px] text-[#e4bdbc]/50 tracking-widest mb-1">
            ATTEMPT 1
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-4xl sm:text-5xl text-[#ffb4ab]">
              {previousVerdict.score}
            </span>
            <span className="font-mono-ui text-sm text-[#e4bdbc]/50">/100</span>
          </div>
          <span className="font-mono-ui text-[10px] text-[#e4bdbc]/40 uppercase mt-1 tracking-wider">
            {previousVerdict.status}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <Scale className="w-5 h-5 text-[#e4bdbc]/40 mb-2" />
          <div className={`flex items-center gap-1.5 font-mono-ui text-2xl font-bold ${getDeltaColor(delta)}`}>
            {getDeltaIcon(delta)}
            <span>
              {animatedDelta >= 0 ? "+" : ""}
              {animatedDelta}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="font-label-caps text-[10px] text-[#e4bdbc]/50 tracking-widest mb-1">
            ATTEMPT 2
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-4xl sm:text-5xl text-[#e9c349]">
              {currentVerdict.score}
            </span>
            <span className="font-mono-ui text-sm text-[#e4bdbc]/50">/100</span>
          </div>
          <span className="font-mono-ui text-[10px] text-[#e4bdbc]/40 uppercase mt-1 tracking-wider">
            {currentVerdict.status}
          </span>
        </div>
      </div>

      {/* Decision Change Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="bg-[#1e2020] border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-label-caps text-[10px] text-[#ffb4ab] tracking-widest">
              ATTEMPT 1 — ORIGINAL
            </span>
          </div>
          <p className="font-sans text-sm text-[#e2e2e2] leading-relaxed mb-2">
            {previousAttempt.decision}
          </p>
          <div className="flex items-center gap-3 mt-3 text-[10px] font-mono-ui text-[#e4bdbc]/50 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" /> {previousAttempt.protocol.toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3" />{" "}
              {personaNames[previousAttempt.personaKey] || previousAttempt.personaKey}
            </span>
          </div>
        </div>

        <div className="bg-[#1e2020] border border-[#e9c349]/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-label-caps text-[10px] text-[#e9c349] tracking-widest">
              ATTEMPT 2 — REVISED
            </span>
          </div>
          <p className="font-sans text-sm text-[#e2e2e2] leading-relaxed mb-2">
            {currentVerdict.diagnosis.slice(0, 0) || previousAttempt.decision}
          </p>
          <div className="flex items-center gap-3 mt-3 text-[10px] font-mono-ui text-[#e4bdbc]/50 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" /> {currentProtocol.toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3" />{" "}
              {personaNames[currentPersonaKey] || currentPersonaKey}
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mb-10">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-[#e2e2e2] mb-6 border-b border-white/10 pb-3 uppercase tracking-wide">
          Category Breakdown
        </h2>

        <div className="space-y-6">
          {scoreCategories.map((cat) => {
            const prev = previousVerdict.scores[cat.key];
            const curr = currentVerdict.scores[cat.key];
            const prevPct = (prev.score / prev.max) * 100;
            const currPct = (curr.score / curr.max) * 100;
            const catDelta = curr.score - prev.score;

            return (
              <div key={cat.key} className="bg-[#121414] border border-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="font-mono-ui text-sm text-[#e2e2e2] tracking-wider uppercase">
                      {cat.label}
                    </span>
                  </div>
                  <span
                    className={`font-mono-ui text-sm font-bold flex items-center gap-1 ${getDeltaColor(catDelta)}`}
                  >
                    {getDeltaIcon(catDelta)}
                    {catDelta >= 0 ? "+" : ""}
                    {catDelta}
                  </span>
                </div>

                {/* Bars */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono-ui text-[10px] text-[#ffb4ab]/60 w-16 text-right shrink-0">
                      V1: {prev.score}/{prev.max}
                    </span>
                    <div className="flex-1 h-2.5 bg-[#1e2020] overflow-hidden">
                      <div
                        className="h-full bg-[#ffb4ab]/40 transition-all duration-700"
                        style={{ width: `${prevPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-ui text-[10px] text-[#e9c349]/60 w-16 text-right shrink-0">
                      V2: {curr.score}/{curr.max}
                    </span>
                    <div className="flex-1 h-2.5 bg-[#1e2020] overflow-hidden">
                      <div
                        className={`h-full ${getBarColor(curr.score, prev.score, prev.max)} transition-all duration-700`}
                        style={{ width: `${currPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Critiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/5">
                  <div className="text-xs font-sans text-[#e4bdbc]/60 leading-relaxed">
                    <span className="font-mono-ui text-[10px] text-[#ffb4ab]/50 uppercase tracking-wider block mb-1">
                      V1 Critique
                    </span>
                    {prev.critique}
                  </div>
                  <div className="text-xs font-sans text-[#e2e2e2]/80 leading-relaxed">
                    <span className="font-mono-ui text-[10px] text-[#e9c349]/50 uppercase tracking-wider block mb-1">
                      V2 Critique
                    </span>
                    {curr.critique}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-auto pt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            soundFx.playGavel();
            onComplete();
          }}
          className="group bg-[#c0152f] text-white hover:bg-[#ffb3b1] hover:text-[#680012] font-label-caps text-xs tracking-widest px-8 py-4 uppercase transition-all flex items-center gap-3 cursor-pointer"
        >
          <span>VIEW FULL VERDICT</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
