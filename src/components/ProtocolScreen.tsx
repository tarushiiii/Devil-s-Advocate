import React, { useState, useEffect } from "react";
import { Protocol } from "../types";
import { soundFx } from "../lib/audio";
import { ArrowRight, X, Timer, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

interface ProtocolScreenProps {
  onSelectProtocol: (protocol: Protocol, personaKey: string) => void;
}

export const ProtocolScreen: React.FC<ProtocolScreenProps> = ({ onSelectProtocol }) => {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string>("cfo");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const personas = [
    {
      id: "cfo",
      name: "Arjun Varma",
      title: "CFO",
      tagline: "Runs unit economics in ₹ Crores. Doesn't blink.",
    },
    {
      id: "competitor",
      name: "Rhea Sen",
      title: "Rival Founder & CEO",
      tagline: "Predatory instinct. Hunts unhedged margins in Bengaluru & NCR.",
    },
    {
      id: "board",
      name: "Vikramaditya Singhania",
      title: "Managing Director",
      tagline: "Dalal Street veteran. Zero tolerance for vanity metrics.",
    },
  ];

  const handleStart = (protocol: Protocol) => {
    soundFx.playGavel();
    setSelectedProtocol(protocol);
    setIsLoading(true);
  };

  useEffect(() => {
    if (!isLoading || !selectedProtocol) return;

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < 3) {
          soundFx.playKeyClick();
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onSelectProtocol(selectedProtocol, selectedPersona);
          }, 600);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isLoading, selectedProtocol, selectedPersona, onSelectProtocol]);

  const handleSkip = () => {
    if (selectedProtocol) {
      soundFx.playGavel();
      onSelectProtocol(selectedProtocol, selectedPersona);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0B0D] px-6 py-12">
        <div className="flex flex-col items-center gap-10 w-full max-w-md text-center">
          {/* Abstract Loading Indicator */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 border border-white/20 rotate-45 animate-[spin_6s_linear_infinite]" />
            <div className="absolute inset-2 border border-[#ffb3b1]/40 -rotate-45 animate-[spin_4s_linear_infinite_reverse]" />
            <div className="w-12 h-0.5 bg-[#e9c349] animate-pulse" />
          </div>

          <div className="flex flex-col items-center gap-4">
            <h3 className="font-display font-semibold text-2xl text-[#e2e2e2]">
              Assembling the panel...
            </h3>
            <div className="font-mono-ui text-xs text-[#e4bdbc]/70 uppercase tracking-[0.2em] space-y-2">
              <p className={loadingStep >= 1 ? "text-[#e9c349]" : "opacity-40"}>
                {loadingStep >= 1 ? "✓ " : "• "}Compiling counter-arguments
              </p>
              <p className={loadingStep >= 2 ? "text-[#e9c349]" : "opacity-40"}>
                {loadingStep >= 2 ? "✓ " : "• "}Loading historical precedents
              </p>
              <p className={loadingStep >= 3 ? "text-[#ffb3b1]" : "opacity-40"}>
                {loadingStep >= 3 ? "✓ " : "• "}Calibrating adversarial tone
              </p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="mt-6 font-label-caps text-xs text-[#e4bdbc]/70 hover:text-white uppercase tracking-widest bg-[#1e2020] border border-white/10 px-6 py-3 transition-colors cursor-pointer"
          >
            Skip Sequence
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col min-h-screen pb-28">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6 mb-8">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-[#e2e2e2] uppercase tracking-wide">
          Establish Protocol
        </h1>
        <p className="font-sans text-sm text-[#e4bdbc]/70 max-w-lg leading-relaxed">
          Select the desired level of adversity for this session. The panel will adjust its
          interrogation parameters accordingly.
        </p>
      </div>

      {/* Adversary Panel Persona Selection */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="font-label-caps text-[11px] text-[#e4bdbc] tracking-widest uppercase flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#e9c349]" /> SELECT CHIEF EXAMINER
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {personas.map((p) => {
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  soundFx.playKeyClick();
                  setSelectedPersona(p.id);
                }}
                className={`text-left p-4 border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1e2020] border-[#e9c349] text-white"
                    : "bg-[#121414] border-white/10 text-[#e2e2e2]/70 hover:border-white/30"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-display font-bold text-sm text-[#e2e2e2]">
                    {p.name}
                  </span>
                  <span className="font-mono-ui text-[10px] text-[#e9c349] uppercase">
                    {p.title}
                  </span>
                </div>
                <p className="font-sans text-xs text-[#e4bdbc]/60 line-clamp-2">
                  {p.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Protocol Cards */}
      <div className="flex flex-col gap-6">
        {/* Protocol 01: Polite */}
        <button
          type="button"
          onClick={() => handleStart("polite")}
          className="group flex flex-col w-full text-left bg-[#1e2020] border border-white/10 hover:bg-[#282a2b] hover:border-white/25 transition-colors duration-200 relative overflow-hidden cursor-pointer"
        >
          <div className="flex flex-col p-6 sm:p-8 gap-4 relative z-10">
            <div className="flex justify-between items-center w-full">
              <span className="font-mono-ui text-xs text-[#e4bdbc]/80 uppercase tracking-widest">
                Protocol 01
              </span>
              <ArrowRight className="w-5 h-5 text-[#e4bdbc]/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#e2e2e2]">
              Polite
            </h2>

            <div className="h-px w-full bg-white/10 my-1" />

            <p className="font-sans text-sm text-[#e4bdbc]/80 leading-relaxed max-w-xl">
              Professional, data-seeking pushback. The panel will allow you to complete your
              thoughts before systematically dismantling them with surgical precision.
            </p>
          </div>
        </button>

        {/* Protocol 02: Brutal */}
        <button
          type="button"
          onClick={() => handleStart("brutal")}
          className="group flex flex-col w-full text-left bg-[#0c0f0f] border border-[#5b403f] hover:border-[#ffb3b1] relative overflow-hidden transition-all duration-300 cursor-pointer"
        >
          {/* Top accent border */}
          <div className="h-1 w-full bg-[#c0152f]/40 group-hover:bg-[#ffb3b1] transition-colors duration-300 absolute top-0 left-0" />

          <div className="flex flex-col p-6 sm:p-8 gap-4 relative z-10">
            <div className="flex justify-between items-center w-full">
              <span className="font-mono-ui text-xs text-[#ffb3b1] uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#ffb3b1]" /> Protocol 02
              </span>
              <ArrowRight className="w-5 h-5 text-[#ffb3b1] group-hover:translate-x-1 transition-transform" />
            </div>

            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#e2e2e2] flex items-center gap-3">
              Brutal
            </h2>

            <div className="h-px w-full bg-[#5b403f]/50 my-1" />

            <ul className="flex flex-col gap-2.5 mt-1">
              <li className="flex items-center gap-3">
                <X className="w-4 h-4 text-[#ffb3b1] flex-shrink-0" />
                <span className="font-sans text-sm text-[#e4bdbc]">Constant interruptions</span>
              </li>
              <li className="flex items-center gap-3">
                <X className="w-4 h-4 text-[#ffb3b1] flex-shrink-0" />
                <span className="font-sans text-sm text-[#e4bdbc]">
                  Mocks vague or weak answers immediately
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Timer className="w-4 h-4 text-[#e9c349] flex-shrink-0" />
                <span className="font-sans text-sm text-[#e4bdbc]">
                  Strictly timed responses (60s limit per probe)
                </span>
              </li>
            </ul>
          </div>
        </button>
      </div>
    </div>
  );
};
