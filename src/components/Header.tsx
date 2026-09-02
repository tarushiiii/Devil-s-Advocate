import React from "react";
import { Screen } from "../types";
import { RotateCcw, Volume2, VolumeX, User } from "lucide-react";

interface HeaderProps {
  currentScreen: Screen;
  onRestart: () => void;
  isSoundOn: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onRestart,
  isSoundOn,
  onToggleSound,
}) => {
  if (currentScreen === "chamber") {
    return null;
  }

  const getTitle = () => {
    switch (currentScreen) {
      case "cross":
        return "INTERROGATION";
      case "verdict":
        return "RESULTS";
      default:
        return "DEVIL'S ADVOCATE";
    }
  };

  const isResultsOrCross = currentScreen === "cross" || currentScreen === "verdict";

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0B0B0D]/85 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-4xl mx-auto h-14 md:h-16 px-4 md:px-8 flex items-center justify-between">
        <span
          className={`${
            isResultsOrCross
              ? "font-display text-xl tracking-tight uppercase"
              : "font-label-caps text-xs tracking-[0.25em] text-[#e4bdbc]"
          }`}
        >
          {getTitle()}
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="p-1.5 text-[#e4bdbc]/70 hover:text-white transition-colors"
            title={isSoundOn ? "Mute audio cues" : "Unmute audio cues"}
          >
            {isSoundOn ? (
              <Volume2 className="w-4 h-4 text-[#e9c349]" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-40" />
            )}
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="font-label-caps text-xs tracking-widest text-[#e9c349] hover:opacity-75 transition-opacity px-2 py-1 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESTART</span>
          </button>

          {isResultsOrCross && (
            <div className="w-7 h-7 rounded-full bg-[#c0152f] flex items-center justify-center text-white ml-1">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
