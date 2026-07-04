import React, { useState } from "react";
import { 
  Sprout, Bug, Layers, CloudSun, FileText, TrendingUp, HelpCircle, ChevronRight, ChevronDown, Camera
} from "lucide-react";
import { AdvisoryCategory } from "../types";
import { ADVISORY_CATEGORIES } from "../constants";

const IconMap: Record<string, React.ComponentType<any>> = {
  Sprout,
  Bug,
  Layers,
  CloudSun,
  FileText,
  TrendingUp,
};

interface WelcomeScreenProps {
  onSelectQuestion: (question: string) => void;
  onPromptImageUpload: () => void;
}

export default function WelcomeScreen({ onSelectQuestion, onPromptImageUpload }: WelcomeScreenProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setActiveCategoryId(activeCategoryId === id ? null : id);
  };

  return (
    <div className="py-6 px-4 max-w-4xl mx-auto space-y-6">
      {/* Friendly Farmer Greeting Card */}
      <div className="bg-white border border-[#E5E2D9] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center gap-5">
        <div className="w-14 h-14 bg-gradient-to-br from-[#2D5A27] to-[#4D7C47] rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
          <Sprout className="w-7 h-7 text-white" />
        </div>
        <div className="space-y-1.5 text-center md:text-left">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#2D5A27] serif">
            Welcome, Farmer Friend!
          </h2>
          <p className="text-gray-700 text-sm sm:text-base max-w-2xl leading-relaxed">
            I am your digital farming companion, <strong className="font-semibold text-[#2D5A27]">Kisan Sahayak</strong>. Ask me any question in your local language about crops, sowing schedules, diseases, soil health, or government subsidies.
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-1">
            <span className="inline-flex items-center gap-1 bg-[#FAF9F6] border border-[#E5E2D9] text-[#2D5A27] font-semibold text-xs px-3 py-1.2 rounded-full shadow-2xs">
              🌾 Multilingual Support
            </span>
            <span className="inline-flex items-center gap-1 bg-[#FAF9F6] border border-[#E5E2D9] text-[#2D5A27] font-semibold text-xs px-3 py-1.2 rounded-full shadow-2xs">
              🎙️ Voice Typing
            </span>
            <span className="inline-flex items-center gap-1 bg-[#FAF9F6] border border-[#E5E2D9] text-[#2D5A27] font-semibold text-xs px-3 py-1.2 rounded-full shadow-2xs">
              📸 Leaf Photo Diagnosis
            </span>
          </div>
        </div>
      </div>

      {/* Categories Section Title */}
      <div className="space-y-1">
        <h3 className="font-display font-bold text-lg text-[#1A1A1A] serif flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#2D5A27]" />
          What would you like to ask today?
        </h3>
        <p className="text-xs text-gray-500">Tap any advisory category below to see popular questions or ask your own question below.</p>
      </div>

      {/* Advisory Categories Bento-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ADVISORY_CATEGORIES.map((category) => {
          const IconComponent = IconMap[category.iconName] || HelpCircle;
          const isExpanded = activeCategoryId === category.id;

          return (
            <div
              key={category.id}
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                isExpanded
                  ? "bg-white border-[#2D5A27] shadow-md ring-1 ring-[#2D5A27]/10"
                  : "bg-white border-[#DEDACF] hover:border-[#2D5A27] hover:shadow-xs cursor-pointer active:scale-[0.98]"
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              {/* Card Header */}
              <div className="p-4 flex items-start gap-3 justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg shrink-0 transition-colors duration-200 ${
                    isExpanded ? "bg-[#2D5A27] text-white" : "bg-[#F8F7F2] text-[#2D5A27]"
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                      {category.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="text-gray-400 self-center shrink-0">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-[#2D5A27] font-bold" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Area: Sample Questions */}
              {isExpanded && (
                <div 
                  className="bg-[#FAF9F6] border-t border-[#E5E2D9] p-4 space-y-2.5 animate-fade-in"
                  onClick={(e) => e.stopPropagation()} // Prevent collapse when tapping questions
                >
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Select a question to get an instant answer:
                  </p>
                  {category.sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectQuestion(q)}
                      className="w-full text-left bg-white hover:bg-[#F8F7F2] hover:border-[#2D5A27] active:bg-[#E5E2D9] border border-[#DEDACF] p-3 rounded-lg text-xs sm:text-sm text-gray-700 font-medium transition-all duration-150 flex items-start gap-2 shadow-2xs group cursor-pointer"
                    >
                      <span className="text-[#2D5A27] font-bold shrink-0">👉</span>
                      <span className="group-hover:text-[#2D5A27] leading-relaxed">{q}</span>
                    </button>
                  ))}

                  {category.id === "pest" && (
                    <div className="pt-1.5">
                      <button
                        onClick={onPromptImageUpload}
                        className="w-full flex items-center justify-center gap-2 bg-[#2D5A27] hover:bg-[#4D7C47] active:bg-[#1B3E17] text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        Upload Leaf/Pest Photo & Ask AI
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Safety Notice Card */}
      <div className="bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl p-4 flex gap-3 items-start">
        <span className="text-lg shrink-0">⚠️</span>
        <div className="space-y-0.5">
          <h5 className="font-semibold text-soil-brown-800 text-xs sm:text-sm">
            Advisory Notice
          </h5>
          <p className="text-gray-600 text-xs leading-relaxed">
            All AI responses are general advisory guidelines. Always verify chemical quantities, dosages, and schemes with your local block agriculture office, Krishi Vigyan Kendra (KVK), or state agriculture officers before applying.
          </p>
        </div>
      </div>
    </div>
  );
}
