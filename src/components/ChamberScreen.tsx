import React, { useEffect, useState } from "react";
import { soundFx } from "../lib/audio";

interface ChamberScreenProps {
  onEnter: () => void;
}

export const ChamberScreen: React.FC<ChamberScreenProps> = ({ onEnter }) => {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const fullLine1 = "Your decision is made.";
  const fullLine2 = "Now defend it.";

  useEffect(() => {
    let currentIdx = 0;
    const interval1 = setInterval(() => {
      if (currentIdx < fullLine1.length) {
        setLine1(fullLine1.slice(0, currentIdx + 1));
        soundFx.playKeyClick();
        currentIdx++;
      } else {
        clearInterval(interval1);
        setTimeout(() => {
          let currentIdx2 = 0;
          const interval2 = setInterval(() => {
            if (currentIdx2 < fullLine2.length) {
              setLine2(fullLine2.slice(0, currentIdx2 + 1));
              soundFx.playKeyClick();
              currentIdx2++;
            } else {
              clearInterval(interval2);
              setTimeout(() => setShowSubtitle(true), 300);
              setTimeout(() => setShowButton(true), 700);
            }
          }, 45);
        }, 300);
      }
    }, 45);

    return () => {
      clearInterval(interval1);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-hidden bg-[#0B0B0D] px-6 py-12 select-none">
      {/* Top spacer */}
      <div className="w-full" />

      {/* Main Hero Container */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-lg mx-auto text-center my-auto">
        {/* Top Flag Icon */}
        <div className="mb-10 relative w-full flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-transparent z-10 pointer-events-none" />
          <svg
            className="w-16 h-16 text-[#ffb3b1] opacity-80 drop-shadow-[0_0_15px_rgba(255,179,177,0.15)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* Headline with Typewriter */}
        <h1
          className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#e2e2e2] mb-6 tracking-tight leading-tight w-full min-h-[110px]"
          id="headline"
        >
          <span className="block">{line1}</span>
          <span className="block mt-2 text-[#ffb3b1]/90">{line2}</span>
        </h1>

        {/* Subtitle */}
        <p
          className={`font-sans text-sm sm:text-base text-[#e4bdbc]/70 mb-12 max-w-sm mx-auto transition-opacity duration-700 ${
            showSubtitle ? "opacity-100" : "opacity-0 translate-y-2"
          }`}
        >
          A three-stage stress test for business decisions.
        </p>

        {/* Enter Room Button */}
        <div
          className={`w-full flex justify-center transition-all duration-700 ${
            showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            onClick={() => {
              soundFx.playGavel();
              onEnter();
            }}
            className="relative group overflow-hidden bg-[#1e2020] border border-[#5b403f] px-8 py-4 w-full max-w-xs transition-colors duration-300 hover:bg-[#ffb3b1] hover:border-[#ffb3b1] focus:outline-none focus:ring-1 focus:ring-[#ffb3b1] cursor-pointer"
          >
            <span className="relative z-10 font-label-caps text-xs text-[#e2e2e2] group-hover:text-[#680012] tracking-[0.2em] uppercase transition-colors duration-300 font-semibold">
              Enter the room
            </span>
            <div className="absolute inset-0 bg-[#ffb3b1] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="w-full max-w-4xl p-4 flex justify-between items-end z-10 opacity-40 font-mono-ui text-[10px] text-[#e2e2e2] uppercase tracking-[0.2em]">
        <span>INT. BOARDROOM CHAMBER — BKC, MUMBAI</span>
        <span>SYS. V 2.4.1 (IST)</span>
      </div>
    </div>
  );
};
