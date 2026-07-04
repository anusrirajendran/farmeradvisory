import React from "react";
import { Sprout, RotateCcw, Globe } from "lucide-react";
import { Language } from "../types";
import { SUPPORTED_LANGUAGES } from "../constants";

interface HeaderProps {
  selectedLanguage: Language | null;
  onLanguageChange: (lang: Language | null) => void;
  onReset: () => void;
  hasMessages: boolean;
}

export default function Header({
  selectedLanguage,
  onLanguageChange,
  onReset,
  hasMessages,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-br from-[#2D5A27] to-[#4D7C47] text-white shadow-md sticky top-0 z-50 py-3.5 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Title / Logo */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shadow-inner">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight leading-tight text-white serif">
              Kisan Sahayak AI
            </h1>
            <p className="text-white/80 text-[10px] sm:text-xs tracking-wider uppercase font-semibold">
              AI Agriculture Advisor
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 w-auto">
            <Globe className="w-4 h-4 text-emerald-200 shrink-0" />
            <select
              value={selectedLanguage?.code || "auto"}
              onChange={(e) => {
                const code = e.target.value;
                if (code === "auto") {
                  onLanguageChange(null);
                } else {
                  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
                  if (lang) onLanguageChange(lang);
                }
              }}
              className="bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="auto" className="bg-[#2D5A27] text-white">
                🌐 Auto-detect (Language)
              </option>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="bg-[#2D5A27] text-white font-medium"
                >
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Reset / Clear Button */}
          <button
            onClick={onReset}
            disabled={!hasMessages}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all duration-200 ${
              hasMessages
                ? "bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer shadow-sm active:scale-95"
                : "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
            }`}
            title="Reset conversation and start fresh"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Query</span>
          </button>
        </div>
      </div>
    </header>
  );
}
