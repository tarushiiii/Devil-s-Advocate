import React, { useState } from "react";
import { DecisionCase } from "../types";
import { SAMPLE_CASES } from "../lib/sampleCases";
import { soundFx } from "../lib/audio";
import { ArrowRight, Sparkles, Loader2, Pencil } from "lucide-react";

interface CaseIntakeScreenProps {
  initialCase?: DecisionCase | null;
  onSubmitCase: (decisionCase: DecisionCase) => void;
  isRevision?: boolean;
}

export const CaseIntakeScreen: React.FC<CaseIntakeScreenProps> = ({
  initialCase,
  onSubmitCase,
  isRevision = false,
}) => {
  const [decision, setDecision] = useState(initialCase?.decision || "");
  const [objective, setObjective] = useState(initialCase?.objective || "");
  const [stakeholders, setStakeholders] = useState(initialCase?.stakeholders || "");
  const [stakes, setStakes] = useState(initialCase?.stakes || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreload = (sample: typeof SAMPLE_CASES[0]) => {
    soundFx.playKeyClick();
    setDecision(sample.decision);
    setObjective(sample.objective);
    setStakeholders(sample.stakeholders);
    setStakes(sample.stakes || "");
    setErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!decision.trim()) {
      errs.decision = "No decision, no defense.";
    }
    if (!objective.trim()) {
      errs.objective = "Justification required.";
    }
    if (!stakeholders.trim()) {
      errs.stakeholders = "Identify affected parties.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      soundFx.playAlert();
      return;
    }

    soundFx.playGavel();
    setIsSubmitting(true);

    const depositionId = isRevision
      ? `#${Math.floor(100 + Math.random() * 900)}-${decision
          .split(" ")[0]
          .toUpperCase()
          .replace(/[^A-Z]/g, "CASE")}-R${Math.floor(Math.random() * 9) + 1}`
      : `#${Math.floor(100 + Math.random() * 900)}-${decision
          .split(" ")[0]
          .toUpperCase()
          .replace(/[^A-Z]/g, "CASE")}-Q${Math.floor(Math.random() * 4) + 1}`;

    const now = new Date();
    const timestamp =
      now.toTimeString().split(" ")[0] +
      " " +
      (Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

    setTimeout(() => {
      onSubmitCase({
        decision: decision.trim(),
        objective: objective.trim(),
        stakeholders: stakeholders.trim(),
        stakes: stakes.trim(),
        depositionId,
        timestamp,
      });
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col min-h-screen pb-28">
      {/* Revision Banner */}
      {isRevision && (
        <div className="bg-[#93000a]/30 border border-[#ffb4ab]/30 p-4 mb-6 flex items-center gap-3 animate-fade-in">
          <Pencil className="w-4 h-4 text-[#ffb4ab] flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-label-caps text-[11px] text-[#ffb4ab] tracking-widest">
              REVISION MODE
            </span>
            <span className="font-sans text-xs text-[#e4bdbc]/70 mt-0.5">
              Edit any field below, then re-submit for another adversarial review. Your previous
              attempt will be saved for comparison.
            </span>
          </div>
        </div>
      )}

      {/* Hero / Header Area */}
      <div className="py-6 md:py-8 border-b border-white/10 mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#e2e2e2] tracking-tight leading-none mb-3">
          {isRevision ? "Revise your case." : "State your case."}
        </h1>
        <p className="text-[#e4bdbc]/70 font-mono-ui text-xs sm:text-sm uppercase tracking-widest max-w-2xl">
          {isRevision
            ? "Strengthen your position. Address the feedback from your prior attempt."
            : "Enter the details of your proposed decision for adversarial review."}
        </p>

        {/* Quick presets - only show when not in revision mode */}
        {!isRevision && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="font-label-caps text-[10px] text-[#e4bdbc]/50 tracking-wider flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-[#e9c349]" /> PRESET CASES:
            </span>
            {SAMPLE_CASES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePreload(sample)}
                className="text-[11px] font-mono-ui bg-[#1e2020] hover:bg-[#282a2b] border border-white/10 text-[#e2e2e2] px-2.5 py-1 transition-colors rounded-none"
              >
                {sample.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-10" id="decision-intake-form">
        {/* Field 1: The Decision */}
        <div className="flex flex-col relative group">
          <label
            className="font-label-caps text-xs text-[#e4bdbc] mb-2 uppercase tracking-widest"
            htmlFor="decision"
          >
            01. The Decision
          </label>
          <input
            id="decision"
            type="text"
            value={decision}
            onChange={(e) => {
              setDecision(e.target.value);
              if (errors.decision) setErrors((prev) => ({ ...prev, decision: "" }));
            }}
            placeholder="e.g., Raising prices 20% in Q2"
            className={`w-full bg-transparent border-b py-3 font-display text-lg sm:text-xl text-[#e2e2e2] focus:outline-none transition-colors placeholder:text-white/20 rounded-none appearance-none ${
              errors.decision
                ? "border-[#ffb4ab]"
                : "border-white/20 focus:border-[#e9c349]"
            }`}
          />
          {errors.decision && (
            <span className="text-[#ffb4ab] font-mono-ui text-xs mt-1.5 animate-pulse">
              {errors.decision}
            </span>
          )}
        </div>

        {/* Field 2: The Objective */}
        <div className="flex flex-col relative group">
          <label
            className="font-label-caps text-xs text-[#e4bdbc] mb-2 uppercase tracking-widest"
            htmlFor="objective"
          >
            02. The Objective
          </label>
          <textarea
            id="objective"
            rows={3}
            value={objective}
            onChange={(e) => {
              setObjective(e.target.value);
              if (errors.objective) setErrors((prev) => ({ ...prev, objective: "" }));
            }}
            placeholder="Why are you making it? What is the strategic rationale?"
            className={`w-full bg-transparent border-b py-3 font-sans text-sm sm:text-base text-[#e2e2e2] focus:outline-none transition-colors placeholder:text-white/20 resize-none rounded-none appearance-none ${
              errors.objective
                ? "border-[#ffb4ab]"
                : "border-white/20 focus:border-[#e9c349]"
            }`}
          />
          {errors.objective && (
            <span className="text-[#ffb4ab] font-mono-ui text-xs mt-1.5 animate-pulse">
              {errors.objective}
            </span>
          )}
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-8">
          {/* Field 3: Stakeholders */}
          <div className="flex flex-col relative group">
            <label
              className="font-label-caps text-xs text-[#e4bdbc] mb-2 uppercase tracking-widest"
              htmlFor="stakeholders"
            >
              03. Stakeholders
            </label>
            <input
              id="stakeholders"
              type="text"
              value={stakeholders}
              onChange={(e) => {
                setStakeholders(e.target.value);
                if (errors.stakeholders) setErrors((prev) => ({ ...prev, stakeholders: "" }));
              }}
              placeholder="Who does this affect?"
              className={`w-full bg-transparent border-b py-3 font-sans text-sm sm:text-base text-[#e2e2e2] focus:outline-none transition-colors placeholder:text-white/20 rounded-none appearance-none ${
                errors.stakeholders
                  ? "border-[#ffb4ab]"
                  : "border-white/20 focus:border-[#e9c349]"
              }`}
            />
            {errors.stakeholders && (
              <span className="text-[#ffb4ab] font-mono-ui text-xs mt-1.5 animate-pulse">
                {errors.stakeholders}
              </span>
            )}
          </div>

          {/* Field 4: The Stakes */}
          <div className="flex flex-col relative group">
            <label
              className="font-label-caps text-xs text-[#e4bdbc] mb-2 uppercase tracking-widest flex items-center justify-between"
              htmlFor="stakes"
            >
              <span>04. The Stakes</span>
              <span className="text-[10px] text-white/40 tracking-widest">OPTIONAL</span>
            </label>
            <input
              id="stakes"
              type="text"
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
              placeholder="Numbers or risks involved (e.g. $12M ARR, 15% churn limit)"
              className="w-full bg-transparent border-b border-white/20 focus:border-[#e9c349] py-3 font-sans text-sm sm:text-base text-[#e2e2e2] focus:outline-none transition-colors placeholder:text-white/20 rounded-none appearance-none"
            />
          </div>
        </div>

        {/* Submit Area */}
        <div className="pt-8 flex justify-end">
          <button
            id="submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="group relative overflow-hidden bg-[#ffb3b1] text-[#680012] px-8 py-4 font-label-caps text-xs uppercase tracking-widest flex items-center justify-center min-w-[240px] border border-[#ffb3b1] hover:bg-[#0B0B0D] hover:text-[#ffb3b1] transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center gap-3 font-semibold">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRevision ? "Processing Revision" : "Processing Case"}</span>
                </>
              ) : (
                <>
                  <span>{isRevision ? "Submit Revision" : "Continue to Difficulty"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
