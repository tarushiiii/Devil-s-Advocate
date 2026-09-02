import React, { useState, useEffect, useRef } from "react";
import { DecisionCase, Protocol, TranscriptEntry } from "../types";
import { soundFx } from "../lib/audio";
import { Send, Loader2, FastForward, AlertTriangle } from "lucide-react";

interface InterrogationScreenProps {
  decisionCase: DecisionCase;
  protocol: Protocol;
  personaKey: string;
  onFinishInterrogation: (transcript: TranscriptEntry[]) => void;
}

export const InterrogationScreen: React.FC<InterrogationScreenProps> = ({
  decisionCase,
  protocol,
  personaKey,
  onFinishInterrogation,
}) => {
  const [showIntro, setShowIntro] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(protocol === "brutal" ? 60 : 120);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTypewriterText, setActiveTypewriterText] = useState("");

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const isBrutal = protocol === "brutal";

  // Examiner metadata
  const personaMap: Record<string, { role: string; name: string; desc: string; prefix: string }> = {
    cfo: {
      role: "THE CFO",
      name: "ARJUN VARMA",
      desc: "Chief Financial Officer\nScrutinizes unit economics & working capital cycles.",
      prefix: "VARMA, A. (CFO)",
    },
    competitor: {
      role: "RIVAL FOUNDER & CEO",
      name: "RHEA SEN",
      desc: "Hostile Competitor\nExploiting pricing and channel vulnerabilities.",
      prefix: "SEN, R. (RIVAL)",
    },
    board: {
      role: "MANAGING DIRECTOR",
      name: "VIKRAMADITYA SINGHANIA",
      desc: "Board of Directors\nDemands governance & hard downside protection.",
      prefix: "SINGHANIA, V. (DIRECTOR)",
    },
  };

  const persona = personaMap[personaKey] || personaMap.cfo;

  // Initial intro splash timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      startOpening();
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, activeTypewriterText]);

  // Turn Countdown Timer
  useEffect(() => {
    if (showIntro || isTyping || isLoadingAi) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showIntro, isTyping, isLoadingAi]);

  const handleTimeExpired = () => {
    soundFx.playAlert();
    const timeoutEntry: TranscriptEntry = {
      id: `sys-${Date.now()}`,
      speaker: "SYSTEM NOTICE",
      speakerType: "system",
      content: "[TIME EXPIRED: DEFENDANT FAILED TO ENTER TIMELY DEFENSE]",
      timestamp: new Date().toLocaleTimeString(),
    };

    setTranscript((prev) => [...prev, timeoutEntry]);

    // Prompt adversary rebuke
    submitDefense("[DEFENDANT TIMED OUT]");
  };

  // Start Opening Statement
  const startOpening = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/interrogate/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: decisionCase.decision,
          objective: decisionCase.objective,
          stakeholders: decisionCase.stakeholders,
          stakes: decisionCase.stakes,
          protocol,
          personaKey,
        }),
      });
      const data = await res.json();
      runTypewriter(data.openingStatement || "Explain your justification for this proposal.", data.speaker || persona.prefix);
    } catch {
      const fallback = isBrutal
        ? `I've reviewed your proposal to "${decisionCase.decision}". Explain how you reconcile this with our threshold for churn, or admit this is an unhedged gamble.`
        : `Let us examine your proposal to "${decisionCase.decision}". How do you intend to measure immediate stakeholder pushback versus long-term yield?`;
      runTypewriter(fallback, persona.prefix);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Smooth Typewriter helper
  const runTypewriter = (text: string, speakerName: string) => {
    setIsTyping(true);
    setActiveTypewriterText("");
    let i = 0;
    const speed = 24;

    const interval = setInterval(() => {
      if (i < text.length) {
        setActiveTypewriterText((prev) => prev + text.charAt(i));
        if (i % 3 === 0) soundFx.playKeyClick();
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setTranscript((prev) => [
          ...prev,
          {
            id: `adv-${Date.now()}`,
            speaker: speakerName,
            speakerType: "adversary",
            content: text,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setActiveTypewriterText("");
        setSecondsLeft(isBrutal ? 60 : 120);
      }
    }, speed);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentInput.trim() || isTyping || isLoadingAi) return;

    const val = currentInput.trim();
    setCurrentInput("");
    submitDefense(val);
  };

  const submitDefense = async (defenseText: string) => {
    soundFx.playGavel();

    const userEntry: TranscriptEntry = {
      id: `usr-${Date.now()}`,
      speaker: "DEFENDANT (YOU)",
      speakerType: "defendant",
      content: defenseText,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedTranscript = [...transcript, userEntry];
    setTranscript(updatedTranscript);

    // If already at round 3 or user finished
    if (turnCount >= 3) {
      setTimeout(() => {
        onFinishInterrogation(updatedTranscript);
      }, 1000);
      return;
    }

    setIsLoadingAi(true);

    try {
      const res = await fetch("/api/interrogate/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseDetails: decisionCase,
          transcript: updatedTranscript,
          userResponse: defenseText,
          turnCount,
          protocol,
          personaKey,
        }),
      });

      const data = await res.json();
      setIsLoadingAi(false);
      setTurnCount((prev) => prev + 1);

      runTypewriter(data.response, data.speaker || persona.prefix);

      if (data.isFinal || turnCount >= 2) {
        // Will conclude after next round
      }
    } catch {
      setIsLoadingAi(false);
      setTurnCount((prev) => prev + 1);
      const fallback =
        isBrutal
          ? `Vague. You're hiding behind adjectives because the unit economics don't hold up. What is your verified contingency?`
          : `That addresses part of the premise, but fails to account for downstream resistance. How will you safeguard against margin compression?`;
      runTypewriter(fallback, persona.prefix);
    }
  };

  const handleProceedToVerdict = () => {
    soundFx.playGavel();
    onFinishInterrogation(transcript);
  };

  // Full Screen Intro Splash
  if (showIntro) {
    return (
      <div
        onClick={() => setShowIntro(false)}
        className="fixed inset-0 z-50 bg-[#0B0B0D] flex flex-col items-center justify-center px-6 cursor-pointer"
      >
        <div className="max-w-md w-full flex flex-col items-center text-center animate-fade-in">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#e2e2e2] tracking-tighter">
            {persona.role}
          </h1>
          <h2 className="font-display font-semibold text-xl sm:text-2xl text-[#e9c349] mt-2 mb-6 tracking-wide">
            {persona.name}
          </h2>
          <div className="w-12 h-px bg-[#e4bdbc]/40 mb-6" />
          <p className="font-mono-ui text-xs sm:text-sm text-[#e4bdbc]/70 uppercase tracking-widest leading-relaxed whitespace-pre-line">
            {persona.desc}
          </p>
          <span className="font-mono-ui text-[10px] text-white/30 uppercase mt-8 tracking-widest">
            CLICK ANYWHERE TO BEGIN IMMEDIATELY
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-8 flex flex-col min-h-screen pb-28">
      {/* Top Bar: Timer & Status */}
      <div className="flex items-center justify-between py-3.5 px-4 bg-[#1a1c1c] border border-white/10 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 bg-[#ffb4ab] rounded-full animate-pulse shadow-[0_0_8px_#ffb4ab]" />
          <span className="font-label-caps text-xs text-[#ffb4ab] tracking-widest uppercase">
            RECORDING
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-[10px] text-[#e4bdbc]/60 tracking-wider">
              {isBrutal ? "BRUTAL MODE" : "POLITE MODE"}
            </span>
            <span className="font-mono-ui text-[11px] text-[#e9c349]">
              ROUND {Math.min(turnCount, 3)}/3
            </span>
          </div>

          <span
            className={`font-mono-ui text-lg sm:text-xl font-bold tracking-widest ${
              secondsLeft <= 15 ? "text-[#ffb4ab] animate-pulse" : "text-[#e2e2e2]"
            }`}
          >
            {Math.floor(secondsLeft / 60)}:
            {(secondsLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Deposition Metadata Header */}
      <div className="flex flex-col gap-1 text-[#e4bdbc]/70 font-mono-ui text-[11px] sm:text-xs mb-6 px-1">
        <span>DEPOSITION ID: {decisionCase.depositionId || "#884-VANCE-Q2"}</span>
        <span>TIMESTAMP: {decisionCase.timestamp || "05:57:21 EST"}</span>
        <span className="truncate">SUBJECT: {decisionCase.decision.toUpperCase()}</span>
        <div className="w-full h-px bg-white/10 mt-2" />
      </div>

      {/* Transcript Log Container */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-1 min-h-[300px]">
        {transcript.map((entry) => {
          const isAdv = entry.speakerType === "adversary";
          const isSys = entry.speakerType === "system";

          if (isSys) {
            return (
              <div
                key={entry.id}
                className="py-2 px-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] font-mono-ui text-xs flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{entry.content}</span>
              </div>
            );
          }

          return (
            <div key={entry.id} className="flex flex-col gap-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span
                  className={`font-label-caps text-xs tracking-widest ${
                    isAdv ? "text-[#e9c349]" : "text-[#ffb3b1]"
                  }`}
                >
                  {entry.speaker}
                </span>
                <span className="font-mono-ui text-[10px] text-white/30">
                  {entry.timestamp}
                </span>
              </div>
              <p
                className={`font-mono-ui text-sm sm:text-base leading-relaxed p-3.5 border ${
                  isAdv
                    ? "bg-[#1e2020] border-white/10 text-[#e2e2e2]"
                    : "bg-[#121414] border-white/5 text-[#e4bdbc]"
                }`}
              >
                {entry.content}
              </p>
            </div>
          );
        })}

        {/* Active Typewriter Stream */}
        {isTyping && (
          <div className="flex flex-col gap-1.5 animate-fade-in">
            <span className="font-label-caps text-xs text-[#e9c349] tracking-widest">
              {persona.prefix}
            </span>
            <p className="font-mono-ui text-sm sm:text-base text-[#e2e2e2] leading-relaxed p-3.5 bg-[#1e2020] border border-white/10">
              {activeTypewriterText}
              <span className="inline-block w-2 h-4 bg-[#e9c349] ml-1 animate-pulse" />
            </p>
          </div>
        )}

        {isLoadingAi && !isTyping && (
          <div className="flex items-center gap-3 text-[#e4bdbc]/60 font-mono-ui text-xs py-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#e9c349]" />
            <span>EXAMINER IS EVALUATING ARGUMENT CONGRUENCE...</span>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* Input / Statement Area */}
      <div className="mt-auto bg-[#0c0f0f] border border-white/10 p-4 md:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-caps text-[11px] text-[#ffb3b1] tracking-widest">
            DEFENDANT (YOU) — STATEMENT FOR THE RECORD
          </span>
          {transcript.length >= 2 && (
            <button
              type="button"
              onClick={handleProceedToVerdict}
              className="text-[10px] font-mono-ui text-[#e9c349] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FastForward className="w-3 h-3" />
              <span>Conclude &amp; View Verdict</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            rows={3}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            disabled={isTyping || isLoadingAi}
            placeholder={
              isTyping
                ? "Listen carefully to the examiner..."
                : "Enter your concrete defense with verifiable metrics and trade-offs..."
            }
            className="w-full bg-[#1e2020] text-[#e2e2e2] font-mono-ui text-xs sm:text-sm p-3.5 placeholder-[#e4bdbc]/30 focus:outline-none focus:ring-1 focus:ring-[#e9c349] border border-white/10 resize-none rounded-none disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <div className="flex items-center justify-between pt-1">
            <span className="font-mono-ui text-[10px] text-white/30 hidden sm:inline">
              Press [Enter] to submit statement
            </span>

            <button
              type="submit"
              disabled={!currentInput.trim() || isTyping || isLoadingAi}
              className="bg-[#c0152f] text-white hover:bg-[#ffb3b1] hover:text-[#680012] disabled:opacity-40 font-label-caps text-xs px-6 py-3 tracking-widest transition-colors flex items-center gap-2 cursor-pointer ml-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SUBMIT STATEMENT</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
