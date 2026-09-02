import React, { useState, useEffect } from "react";
import { DecisionCase, TranscriptEntry, VerdictReport } from "../types";
import { soundFx } from "../lib/audio";
import { Fingerprint, AlertTriangle, Download, RotateCcw, Plus, Loader2 } from "lucide-react";

interface VerdictScreenProps {
  decisionCase: DecisionCase;
  transcript: TranscriptEntry[];
  verdictData: VerdictReport | null;
  onReopenInterrogation: () => void;
  onNewCase: () => void;
  onExport: () => void;
}

export const VerdictScreen: React.FC<VerdictScreenProps> = ({
  decisionCase,
  transcript,
  verdictData,
  onReopenInterrogation,
  onNewCase,
  onExport,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  const finalScore = verdictData?.score ?? 0;

  // Animated score counter ticker
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const steps = 40;
    const stepTime = duration / steps;
    const increment = finalScore / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= finalScore) {
        setAnimatedScore(finalScore);
        soundFx.playGavel();
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
        if (Math.floor(start) % 4 === 0) soundFx.playKeyClick();
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [finalScore]);

  if (!verdictData) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0B0D] px-6 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#ffb3b1] mb-4" />
        <h2 className="font-display font-semibold text-2xl text-[#e2e2e2] mb-2">
          Synthesizing Pre-Mortem Verdict...
        </h2>
        <p className="font-mono-ui text-xs text-[#e4bdbc]/70 uppercase tracking-widest">
          Evaluating specific metrics, internal logic, and failure vectors
        </p>
      </div>
    );
  }

  const { status, diagnosis, scores, preMortem } = verdictData;

  const getScoreColor = (sc: number) => {
    if (sc >= 80) return "text-[#e9c349]";
    if (sc >= 65) return "text-[#ffb3b1]";
    return "text-[#ffb4ab]";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col min-h-screen pb-28">
      {/* Top Verdict Header */}
      <div className="border-b border-white/10 pb-8 mb-10">
        <div className="mb-3">
          <span className="font-label-caps text-xs text-[#e9c349] tracking-[0.25em]">
            FINAL VERDICT
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-4 sm:gap-6 mb-6">
          <h1 className="font-display font-bold text-6xl sm:text-7xl text-[#ffb4ab] tracking-tight leading-none">
            {animatedScore}
            <span className="text-[#e4bdbc]/60 font-display text-2xl sm:text-3xl ml-1 font-normal">
              /100
            </span>
          </h1>

          <div className="pb-2">
            <span className="bg-[#93000a] text-[#ffdad6] px-3 py-1.5 font-mono-ui text-xs sm:text-sm uppercase tracking-wider font-semibold border border-[#ffb4ab]/30 inline-block">
              {status}
            </span>
          </div>
        </div>

        <p className="font-sans text-sm sm:text-base text-[#e4bdbc]/90 max-w-2xl leading-relaxed">
          {diagnosis}
        </p>
      </div>

      {/* Structural Breakdown */}
      <div className="mb-12">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-[#e2e2e2] mb-6 border-b border-white/10 pb-3 uppercase tracking-wide">
          Structural Breakdown
        </h2>

        <div className="flex flex-col divide-y divide-white/10">
          {/* Specificity */}
          <div className="py-5 group">
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="font-mono-ui text-sm sm:text-base text-[#e2e2e2] tracking-wider uppercase">
                Specificity
              </h3>
              <span className={`font-mono-ui text-sm sm:text-base font-bold ${getScoreColor((scores.specificity.score / scores.specificity.max) * 100)}`}>
                {scores.specificity.score}/{scores.specificity.max}
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#e4bdbc]/80 leading-relaxed">
              {scores.specificity.critique}
            </p>
          </div>

          {/* Consistency */}
          <div className="py-5 group">
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="font-mono-ui text-sm sm:text-base text-[#e2e2e2] tracking-wider uppercase">
                Consistency
              </h3>
              <span className={`font-mono-ui text-sm sm:text-base font-bold ${getScoreColor((scores.consistency.score / scores.consistency.max) * 100)}`}>
                {scores.consistency.score}/{scores.consistency.max}
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#e4bdbc]/80 leading-relaxed">
              {scores.consistency.critique}
            </p>
          </div>

          {/* Falsifiability */}
          <div className="py-5 group">
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="font-mono-ui text-sm sm:text-base text-[#e2e2e2] tracking-wider uppercase">
                Falsifiability
              </h3>
              <span className={`font-mono-ui text-sm sm:text-base font-bold ${getScoreColor((scores.falsifiability.score / scores.falsifiability.max) * 100)}`}>
                {scores.falsifiability.score}/{scores.falsifiability.max}
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#e4bdbc]/80 leading-relaxed">
              {scores.falsifiability.critique}
            </p>
          </div>
        </div>
      </div>

      {/* Confidential Memorandum: Pre-Mortem Brief */}
      <div className="bg-[#1e2020] border border-white/15 p-6 sm:p-8 mb-10 relative overflow-hidden">
        {/* Fingerprint watermark */}
        <div className="absolute top-4 right-4 text-white/10 pointer-events-none">
          <Fingerprint className="w-20 h-20" />
        </div>

        <div className="mb-8 relative z-10">
          <span className="font-label-caps text-xs text-[#e9c349] tracking-widest block mb-1">
            CONFIDENTIAL MEMORANDUM
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#e2e2e2] tracking-tight">
            PRE-MORTEM BRIEF
          </h2>
        </div>

        <div className="space-y-8 relative z-10">
          {/* How This Fails */}
          <div>
            <h3 className="font-mono-ui text-xs text-[#e4bdbc]/70 mb-4 uppercase tracking-widest">
              HOW THIS FAILS
            </h3>
            <ul className="space-y-3.5 font-sans text-sm sm:text-base text-[#e2e2e2]">
              {preMortem.howThisFails.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3.5">
                  <span className="text-[#ffb4ab] font-mono-ui font-bold text-xs sm:text-sm pt-0.5">
                    {item.number || `0${idx + 1}`}.
                  </span>
                  <span className="leading-relaxed">{item.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The Number That Would Have Warned You */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="font-mono-ui text-xs text-[#e4bdbc]/70 mb-3 uppercase tracking-widest">
              THE NUMBER THAT WOULD HAVE WARNED YOU
            </h3>
            <div className="bg-[#0B0B0D] p-4 border border-white/10 font-mono-ui text-sm sm:text-base text-[#e2e2e2] flex items-center justify-between">
              <span className="font-bold tracking-wide text-[#ffdad8]">
                {preMortem.warningMetric}
              </span>
              <AlertTriangle className="w-4 h-4 text-[#e9c349] flex-shrink-0" />
            </div>
            <p className="mt-2 text-xs text-[#e4bdbc]/60 italic font-sans">
              {preMortem.warningSubtext || "Track this, don't just say it."}
            </p>
          </div>

          {/* What You Did Not Address */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="font-mono-ui text-xs text-[#e4bdbc]/70 mb-3 uppercase tracking-widest">
              WHAT YOU DID NOT ADDRESS
            </h3>
            <p className="font-sans text-sm sm:text-base text-[#e2e2e2] bg-[#93000a]/20 p-4 border-l-2 border-[#ffb4ab] leading-relaxed">
              {preMortem.unaddressedBlindspot}
            </p>
          </div>
        </div>

        {/* Concluding Quote */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="font-display italic text-lg sm:text-xl text-[#e2e2e2]">
            "{preMortem.concludingDictum || "This decision has not yet earned its confidence."}"
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-4">
        <button
          type="button"
          onClick={() => {
            soundFx.playGavel();
            onReopenInterrogation();
          }}
          className="flex-1 bg-[#c0152f] text-white hover:bg-[#ffb3b1] hover:text-[#680012] font-label-caps text-xs tracking-widest py-4 px-6 uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Re-open Cross-Examination</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playGavel();
            onExport();
          }}
          className="flex-1 bg-transparent border border-white/20 text-[#e2e2e2] hover:bg-white/5 font-label-caps text-xs tracking-widest py-4 px-6 uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Brief (PDF / Text)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playKeyClick();
            onNewCase();
          }}
          className="bg-[#1e2020] border border-white/10 text-[#e4bdbc] hover:text-white font-label-caps text-xs tracking-widest py-4 px-4 uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          title="Start fresh with a new decision case"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Case</span>
        </button>
      </div>
    </div>
  );
};
