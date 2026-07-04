import React, { useEffect, useRef, useState } from "react";
import { User, Bot, Volume2, VolumeX, AlertTriangle, Info } from "lucide-react";
import { Message, Language } from "../types";

interface ChatListProps {
  messages: Message[];
  isLoading: boolean;
  selectedLanguage: Language | null;
}

export default function ChatList({ messages, isLoading, selectedLanguage }: ChatListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      // Clean up speech synthesis on unmount
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom of list
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSpeak = (msgId: string, text: string) => {
    if (!synthRef.current) return;

    // If currently speaking this message, stop it
    if (activeSpeechId === msgId) {
      synthRef.current.cancel();
      setActiveSpeechId(null);
      return;
    }

    // Stop any existing playback
    synthRef.current.cancel();

    // Clean formatting markers like ** or disclaimer lines before reading aloud
    let cleanText = text
      .replace(/\*\*/g, "")
      .replace(/Disclaimer:.*$/i, "")
      .replace(/Please confirm with your local agriculture officer.*$/i, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Set voice language
    if (selectedLanguage) {
      utterance.lang = selectedLanguage.speechLang;
    } else {
      // General fallbacks based on quick heuristics or English-India
      utterance.lang = "hi-IN";
    }

    utterance.onend = () => {
      setActiveSpeechId(null);
    };

    utterance.onerror = () => {
      setActiveSpeechId(null);
    };

    setActiveSpeechId(msgId);
    synthRef.current.speak(utterance);
  };

  // Safe inline formatter for bold text (**text**) and lists
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let isInsideList = false;
    let listType: "bullet" | "number" | null = null;

    const renderInlineBold = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-[#1A1A1A] bg-[#F8F7F2] px-1 py-0.5 rounded border border-[#E5E2D9]/40">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        if (listType === "bullet") {
          elements.push(
            <ul key={`ul-${key}`} className="space-y-2 my-3 list-none pl-1">
              {listItems}
            </ul>
          );
        } else if (listType === "number") {
          elements.push(
            <ol key={`ol-${key}`} className="space-y-2 my-3 list-none pl-1">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        isInsideList = false;
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Check if it is a disclaimer line
      const isDisclaimer = 
        trimmed.toLowerCase().includes("disclaimer") || 
        trimmed.toLowerCase().includes("please confirm with your local agriculture officer") ||
        trimmed.toLowerCase().includes("verify with local agricultural");

      // Handle empty line
      if (trimmed === "") {
        flushList(index);
        elements.push(<div key={`space-${index}`} className="h-2" />);
        return;
      }

      // Handle Bullet Points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!isInsideList || listType !== "bullet") {
          flushList(index);
          isInsideList = true;
          listType = "bullet";
        }
        const bulletText = trimmed.substring(2);
        listItems.push(
          <li key={`li-${index}`} className="text-gray-800 text-sm sm:text-base leading-relaxed pl-1 flex items-start">
            <span className="text-[#2D5A27] font-bold mr-2">🌿</span>
            <span>{renderInlineBold(bulletText)}</span>
          </li>
        );
        return;
      }

      // Handle Numbered Lists
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        if (!isInsideList || listType !== "number") {
          flushList(index);
          isInsideList = true;
          listType = "number";
        }
        const numText = numMatch[2];
        listItems.push(
          <li key={`li-${index}`} className="text-gray-800 text-sm sm:text-base leading-relaxed pl-1 flex items-start">
            <span className="text-[#2D5A27] font-bold mr-2 serif">{numMatch[1]}.</span>
            <span>{renderInlineBold(numText)}</span>
          </li>
        );
        return;
      }

      // If we are here, it's a normal paragraph
      flushList(index);

      if (isDisclaimer) {
        elements.push(
          <div
            key={`disclaimer-${index}`}
            className="mt-4 p-3.5 bg-[#FAF9F6] border-l-4 border-amber-600 rounded-r-lg text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs font-medium"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{trimmed}</span>
          </div>
        );
      } else {
        elements.push(
          <p key={`p-${index}`} className="text-gray-800 text-sm sm:text-base leading-relaxed my-1.5 serif">
            {renderInlineBold(trimmed)}
          </p>
        );
      }
    });

    flushList(lines.length);
    return elements;
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto custom-scrollbar bg-[#FAF9F6] px-4 py-6 space-y-6 max-w-4xl mx-auto w-full scroll-smooth"
      style={{ minHeight: "200px" }}
    >
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-[88%] sm:max-w-[82%] ${
              isUser ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                isUser
                  ? "bg-amber-600 text-white"
                  : "bg-gradient-to-br from-[#2D5A27] to-[#4D7C47] text-white"
              }`}
            >
              {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Bubble Container */}
            <div className="space-y-1 w-full">
              {/* Sender & Timestamp */}
              <div
                className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-gray-500 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <span>{isUser ? "Farmer" : "Agricultural Advisor (AI)"}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Speech Bubble */}
              <div
                className={`p-5 rounded-2xl shadow-xs ${
                  isUser
                    ? "bg-[#2D5A27] text-white rounded-tr-none shadow-md"
                    : "bg-white border border-[#E5E2D9] shadow-[0_4px_12px_rgba(0,0,0,0.03)] text-[#1A1A1A] rounded-tl-none"
                }`}
              >
                {/* Uploaded Image Preview in user message */}
                {isUser && msg.image && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-white/20 bg-black/10 max-w-xs">
                    <img
                      src={msg.image}
                      alt="Uploaded farm issue"
                      className="w-full h-auto object-cover max-h-56"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Message Body */}
                <div className="space-y-1.5 break-words">
                  {isUser ? (
                    <p className="text-sm sm:text-base font-medium leading-relaxed">
                      {msg.text}
                    </p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}
                </div>

                {/* Text-To-Speech Speaker Trigger */}
                {!isUser && (
                  <div className="mt-4 pt-3 border-t border-[#F2F0E8] flex justify-end">
                    <button
                      onClick={() => handleSpeak(msg.id, msg.text)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeSpeechId === msg.id
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-[#F8F7F2] hover:bg-[#E5E2D9] text-[#2D5A27] border border-[#DEDACF]"
                      } cursor-pointer active:scale-95`}
                      title={activeSpeechId === msg.id ? "Stop voice" : "Read advice aloud"}
                    >
                      {activeSpeechId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                          <span>Stop Speaking</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen (सुनें / கேட்க)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Generating Loader */}
      {isLoading && (
        <div className="flex gap-4 max-w-[80%] mr-auto items-start">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#4D7C47] text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
            <Bot className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-gray-500">
              <span>Kisan Sahayak is thinking...</span>
            </div>
            <div className="bg-white border border-[#E5E2D9] p-5 rounded-2xl rounded-tl-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 bg-[#2D5A27] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2.5 h-2.5 bg-[#2D5A27] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2.5 h-2.5 bg-[#2D5A27] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-gray-500 font-semibold animate-pulse">Formulating expert farming advice...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
