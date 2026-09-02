import React, { useState } from "react";
import { DecisionCase, TranscriptEntry, VerdictReport } from "../types";
import { soundFx } from "../lib/audio";
import { X, Copy, Check, Printer, FileText, Fingerprint } from "lucide-react";

interface ExportModalProps {
  decisionCase: DecisionCase;
  transcript: TranscriptEntry[];
  verdict: VerdictReport;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  decisionCase,
  transcript,
  verdict,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const getMarkdownBrief = () => {
    return `# DEVIL'S ADVOCATE — CONFIDENTIAL PRE-MORTEM BRIEF
DEPOSITION ID: ${decisionCase.depositionId || "#884-VANCE"}
TIMESTAMP: ${decisionCase.timestamp || new Date().toLocaleString()}
SUBJECT: ${decisionCase.decision}

---

## 1. CASE DETAILS
- **Decision:** ${decisionCase.decision}
- **Objective:** ${decisionCase.objective}
- **Stakeholders:** ${decisionCase.stakeholders}
- **Stakes/Parameters:** ${decisionCase.stakes || "N/A"}

---

## 2. FINAL VERDICT: ${verdict.score}/100 [${verdict.status}]
${verdict.diagnosis}

### Structural Breakdown:
- **Specificity:** ${verdict.scores.specificity.score}/${verdict.scores.specificity.max}
  ${verdict.scores.specificity.critique}
- **Consistency:** ${verdict.scores.consistency.score}/${verdict.scores.consistency.max}
  ${verdict.scores.consistency.critique}
- **Falsifiability:** ${verdict.scores.falsifiability.score}/${verdict.scores.falsifiability.max}
  ${verdict.scores.falsifiability.critique}

---

## 3. HOW THIS FAILS
${verdict.preMortem.howThisFails.map((f, i) => `${i + 1}. ${f.title}`).join("\n")}

### The Number That Would Have Warned You:
**${verdict.preMortem.warningMetric}**
*${verdict.preMortem.warningSubtext}*

### Unaddressed Blindspot:
> ${verdict.preMortem.unaddressedBlindspot}

---

*"${verdict.preMortem.concludingDictum}"*
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getMarkdownBrief());
    soundFx.playKeyClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    soundFx.playGavel();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121414] border border-white/20 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#e9c349]" />
            <span className="font-label-caps text-xs text-[#e2e2e2] tracking-widest uppercase">
              CONFIDENTIAL PRE-MORTEM BRIEF
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#e4bdbc]/70 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Printable Document Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 font-mono-ui text-xs sm:text-sm text-[#e2e2e2] bg-[#0c0f0f]">
          <div className="flex justify-between items-start border-b border-white/10 pb-4">
            <div>
              <p className="text-[#e9c349] font-bold text-base font-display">
                DEVIL'S ADVOCATE
              </p>
              <p className="text-[11px] text-[#e4bdbc]/60 uppercase">
                EXECUTIVE DEPOSITION &amp; PRE-MORTEM RECORD
              </p>
            </div>
            <Fingerprint className="w-10 h-10 text-white/20" />
          </div>

          <div className="space-y-1 text-xs text-[#e4bdbc]/80 bg-[#1e2020] p-4 border border-white/10">
            <p>
              <span className="text-white/40">DEPOSITION ID:</span>{" "}
              {decisionCase.depositionId || "#884-VANCE"}
            </p>
            <p>
              <span className="text-white/40">TIMESTAMP:</span>{" "}
              {decisionCase.timestamp || "CURRENT SESSION"}
            </p>
            <p>
              <span className="text-white/40">DECISION:</span> {decisionCase.decision}
            </p>
            <p>
              <span className="text-white/40">OBJECTIVE:</span> {decisionCase.objective}
            </p>
          </div>

          <div className="border border-[#ffb4ab]/30 bg-[#93000a]/10 p-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-display text-xl text-[#ffb4ab] font-bold">
                SCORE: {verdict.score}/100
              </span>
              <span className="font-mono-ui text-xs text-[#ffdad6] bg-[#93000a] px-2 py-0.5 uppercase">
                {verdict.status}
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#e2e2e2] leading-relaxed">
              {verdict.diagnosis}
            </p>
          </div>

          <div>
            <h4 className="font-label-caps text-[11px] text-[#e9c349] tracking-widest mb-2 uppercase">
              How This Fails
            </h4>
            <ul className="space-y-2 font-sans text-xs sm:text-sm text-[#e2e2e2]">
              {verdict.preMortem.howThisFails.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#ffb4ab] font-mono-ui font-bold">0{i + 1}.</span>
                  <span>{f.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#1e2020] p-3 border border-white/10">
            <span className="text-[10px] text-[#e4bdbc]/60 uppercase block mb-1">
              Warning Threshold:
            </span>
            <span className="text-[#ffdad8] font-bold text-sm font-mono-ui">
              {verdict.preMortem.warningMetric}
            </span>
          </div>

          <div className="border-l-2 border-[#ffb4ab] pl-3 py-1 font-sans text-xs text-[#e4bdbc]">
            <span className="text-[10px] uppercase font-mono-ui text-white/40 block mb-1">
              Unaddressed Blindspot:
            </span>
            {verdict.preMortem.unaddressedBlindspot}
          </div>

          <div className="text-center pt-2 font-display italic text-sm text-[#e2e2e2]">
            "{verdict.preMortem.concludingDictum}"
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#121414]">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 bg-[#1e2020] hover:bg-[#282a2b] border border-white/10 text-[#e2e2e2] px-4 py-2.5 font-label-caps text-xs tracking-wider transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#e9c349]" />
                <span className="text-[#e9c349]">COPIED TO CLIPBOARD</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY MARKDOWN BRIEF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#c0152f] hover:bg-[#ffb3b1] hover:text-[#680012] text-white px-5 py-2.5 font-label-caps text-xs tracking-wider transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
