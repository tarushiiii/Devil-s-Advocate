import React from "react";
import { Screen } from "../types";
import { Gavel, FileText, Mic, CheckSquare } from "lucide-react";

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hasCase: boolean;
  hasInterrogated: boolean;
  hasVerdict: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  hasCase,
  hasInterrogated,
  hasVerdict,
}) => {
  if (currentScreen === "chamber" || currentScreen === "loading") {
    return null;
  }

  const navItems = [
    {
      id: "chamber" as Screen,
      label: "CHAMBER",
      icon: Gavel,
      enabled: true,
    },
    {
      id: "case" as Screen,
      label: "CASE",
      icon: FileText,
      enabled: true,
    },
    {
      id: "cross" as Screen,
      label: "CROSS",
      icon: Mic,
      enabled: hasCase,
    },
    {
      id: "verdict" as Screen,
      label: "VERDICT",
      icon: CheckSquare,
      enabled: hasVerdict || hasInterrogated,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-40 bg-[#0B0B0D]/90 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const isDisabled = !item.enabled;

          return (
            <button
              key={item.id}
              disabled={isDisabled}
              onClick={() => !isDisabled && onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-3 ${
                isActive
                  ? "text-[#ffb3b1]"
                  : isDisabled
                  ? "text-neutral-700 cursor-not-allowed"
                  : "text-[#e4bdbc]/70 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-label-caps text-[10px] tracking-tighter">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-[1px] left-2 right-2 h-[2px] bg-[#ffb3b1]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
