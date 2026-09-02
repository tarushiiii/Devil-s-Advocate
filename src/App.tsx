import React, { useState } from "react";
import { Screen, DecisionCase, Protocol, TranscriptEntry, VerdictReport } from "./types";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { ChamberScreen } from "./components/ChamberScreen";
import { CaseIntakeScreen } from "./components/CaseIntakeScreen";
import { ProtocolScreen } from "./components/ProtocolScreen";
import { InterrogationScreen } from "./components/InterrogationScreen";
import { VerdictScreen } from "./components/VerdictScreen";
import { RevisionCompare } from "./components/RevisionCompare";
import { ExportModal } from "./components/ExportModal";
import { soundFx } from "./lib/audio";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("chamber");
  const [decisionCase, setDecisionCase] = useState<DecisionCase | null>(null);
  const [protocol, setProtocol] = useState<Protocol>("brutal");
  const [personaKey, setPersonaKey] = useState<string>("cfo");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [verdictData, setVerdictData] = useState<VerdictReport | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [compareData, setCompareData] = useState<{
    previous: VerdictReport;
    current: VerdictReport;
    previousAttempt: { decision: string; protocol: Protocol; personaKey: string };
  } | null>(null);

  const handleToggleSound = () => {
    const newState = soundFx.toggleMute();
    setIsSoundOn(newState);
  };

  const handleRestart = () => {
    soundFx.playGavel();
    setCurrentScreen("chamber");
    setDecisionCase(null);
    setTranscript([]);
    setVerdictData(null);
    setIsRevisionMode(false);
    setCompareData(null);
  };

  const handleEnterChamber = () => {
    setCurrentScreen("case");
  };

  const handleSubmitCase = (newCase: DecisionCase) => {
    // Preserve attempts when revising
    const existingAttempts = decisionCase?.attempts || [];
    setDecisionCase({ ...newCase, attempts: existingAttempts });
    setCurrentScreen("protocol");
  };

  const handleSelectProtocol = (selectedProtocol: Protocol, selectedPersona: string) => {
    setProtocol(selectedProtocol);
    setPersonaKey(selectedPersona);
    setTranscript([]);
    setCurrentScreen("cross");
  };

  const handleFinishInterrogation = async (finalTranscript: TranscriptEntry[]) => {
    setTranscript(finalTranscript);
    setCurrentScreen("verdict");

    // Fetch synthesized verdict from backend
    try {
      const res = await fetch("/api/verdict/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseDetails: decisionCase,
          transcript: finalTranscript,
          protocol,
        }),
      });
      const data = await res.json();
      setVerdictData(data);

      // If revision mode, save this attempt and prepare compare
      if (isRevisionMode && decisionCase?.attempts && decisionCase.attempts.length > 0) {
        const previousAttempt = decisionCase.attempts[decisionCase.attempts.length - 1];
        setCompareData({
          previous: previousAttempt.verdict,
          current: data,
          previousAttempt: {
            decision: previousAttempt.decision,
            protocol: previousAttempt.protocol,
            personaKey: previousAttempt.personaKey,
          },
        });
        setCurrentScreen("compare");
      }
    } catch {
      // Fallback verdict
      const fallbackVerdict: VerdictReport = {
        score: 64,
        status: "STRUCTURALLY EXPOSED",
        diagnosis:
          "The decision logic presented lacks necessary structural integrity. Critical blindspots identified in execution strategy and regional market realities.",
        scores: {
          specificity: {
            score: 18,
            max: 40,
            critique:
              "User failed to name a specific reversal metric for the proposed shift. No actionable threshold defined for rollback.",
          },
          consistency: {
            score: 22,
            max: 30,
            critique:
              "Answer to Competitor regarding 'moat' contradicts the Customer service promise. Strategy relies on mutually exclusive priorities.",
          },
          falsifiability: {
            score: 24,
            max: 30,
            critique:
              "Clear exit condition provided, though lacks timeline. The premise can be tested, but the evaluation window is ambiguous.",
          },
        },
        preMortem: {
          howThisFails: [
            {
              number: "01",
              title: "Platform commission & channel renegotiation compressing core margins.",
            },
            {
              number: "02",
              title: "Regional trust gap requiring disproportionate physical presence & sampling.",
            },
            {
              number: "03",
              title: "Festival-season demand cliff post-campaign resulting in inventory bloat.",
            },
          ],
          warningMetric: "90-DAY REPEAT RATE < 20%",
          warningSubtext: "Track this, don't just say it.",
          unaddressedBlindspot:
            "Dark-store stock-out rates during peak weeks and the cascading impact on customer retention vs acquisition costs.",
          concludingDictum: "This decision has not yet earned its confidence.",
        },
      };
      setVerdictData(fallbackVerdict);

      if (isRevisionMode && decisionCase?.attempts && decisionCase.attempts.length > 0) {
        const previousAttempt = decisionCase.attempts[decisionCase.attempts.length - 1];
        setCompareData({
          previous: previousAttempt.verdict,
          current: fallbackVerdict,
          previousAttempt: {
            decision: previousAttempt.decision,
            protocol: previousAttempt.protocol,
            personaKey: previousAttempt.personaKey,
          },
        });
        setCurrentScreen("compare");
      }
    }
  };

  const handleReopenInterrogation = () => {
    setCurrentScreen("cross");
  };

  const handleNewCase = () => {
    setCurrentScreen("case");
    setIsRevisionMode(false);
    setCompareData(null);
  };

  const handleStartRevision = () => {
    if (!decisionCase || !verdictData) return;

    // Save the current attempt to the case's attempt history
    const attemptId = (decisionCase.attempts?.length || 0) + 1;
    const now = new Date();
    const timestamp =
      now.toTimeString().split(" ")[0] +
      " " +
      (Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

    const newAttempt = {
      id: attemptId,
      decision: decisionCase.decision,
      objective: decisionCase.objective,
      stakeholders: decisionCase.stakeholders,
      stakes: decisionCase.stakes,
      protocol,
      personaKey,
      transcript,
      verdict: verdictData,
      timestamp,
    };

    setDecisionCase((prev) => ({
      ...prev!,
      attempts: [...(prev?.attempts || []), newAttempt],
    }));

    setIsRevisionMode(true);
    setCurrentScreen("case");
    soundFx.playGavel();
  };

  const handleViewPreviousAttempt = (attemptIndex: number) => {
    const attempt = decisionCase?.attempts?.[attemptIndex];
    if (!attempt) return;

    setProtocol(attempt.protocol);
    setPersonaKey(attempt.personaKey);
    setTranscript(attempt.transcript);
    setVerdictData(attempt.verdict);
    setCompareData(null);
    setIsRevisionMode(false);
    setCurrentScreen("verdict");
    soundFx.playKeyClick();
  };

  const handleCompareComplete = () => {
    setCompareData(null);
    setCurrentScreen("verdict");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#e2e2e2] flex flex-col relative font-sans">
      {/* Film Grain Noise Texture */}
      <div className="noise-overlay" />

      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onRestart={handleRestart}
        isSoundOn={isSoundOn}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${currentScreen !== "chamber" ? "pt-14 md:pt-16" : ""}`}>
        {currentScreen === "chamber" && <ChamberScreen onEnter={handleEnterChamber} />}

        {currentScreen === "case" && (
          <CaseIntakeScreen
            initialCase={decisionCase}
            onSubmitCase={handleSubmitCase}
            isRevision={isRevisionMode}
          />
        )}

        {currentScreen === "protocol" && (
          <ProtocolScreen onSelectProtocol={handleSelectProtocol} />
        )}

        {currentScreen === "cross" && decisionCase && (
          <InterrogationScreen
            decisionCase={decisionCase}
            protocol={protocol}
            personaKey={personaKey}
            onFinishInterrogation={handleFinishInterrogation}
          />
        )}

        {currentScreen === "compare" && compareData && (
          <RevisionCompare
            previousAttempt={compareData.previousAttempt}
            previousVerdict={compareData.previous}
            currentVerdict={compareData.current}
            currentProtocol={protocol}
            currentPersonaKey={personaKey}
            onComplete={handleCompareComplete}
          />
        )}

        {currentScreen === "verdict" && decisionCase && (
          <VerdictScreen
            decisionCase={decisionCase}
            transcript={transcript}
            verdictData={verdictData}
            onReopenInterrogation={handleReopenInterrogation}
            onNewCase={handleNewCase}
            onExport={() => setIsExportOpen(true)}
            onStartRevision={handleStartRevision}
            onViewAttempt={handleViewPreviousAttempt}
            attemptCount={(decisionCase.attempts?.length || 0) + (verdictData ? 1 : 0)}
          />
        )}
      </main>

      {/* Bottom Sticky Tab Navigation */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        hasCase={!!decisionCase}
        hasInterrogated={transcript.length > 0}
        hasVerdict={!!verdictData}
      />

      {/* Export Modal */}
      {isExportOpen && decisionCase && verdictData && (
        <ExportModal
          decisionCase={decisionCase}
          transcript={transcript}
          verdict={verdictData}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
