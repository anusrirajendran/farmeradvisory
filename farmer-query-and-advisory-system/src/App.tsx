import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatList from "./components/ChatList";
import InputArea from "./components/InputArea";
import { Message, Language } from "./types";
import { Sprout, Info, AlertTriangle, X } from "lucide-react";

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kisan_seva_chat_history");
      try {
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kisan_seva_selected_lang");
      try {
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputTriggerRef = useRef<((text: string) => void) | null>(null);

  // Sync messages with local session storage
  useEffect(() => {
    localStorage.setItem("kisan_seva_chat_history", JSON.stringify(messages));
  }, [messages]);

  // Sync selected language with local storage
  useEffect(() => {
    if (selectedLanguage) {
      localStorage.setItem("kisan_seva_selected_lang", JSON.stringify(selectedLanguage));
    } else {
      localStorage.removeItem("kisan_seva_selected_lang");
    }
  }, [selectedLanguage]);

  // Reset chat / New Query
  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear this conversation and start fresh?")) {
      setMessages([]);
      setErrorMessage(null);
    }
  };

  // Set selected question to Input Area text input
  const handleSelectQuestion = (question: string) => {
    if (inputTriggerRef.current) {
      inputTriggerRef.current(question);
    }
  };

  const handlePromptImageUpload = () => {
    // Notify farmer of leaf diagnosis flow
    alert("Please tap the camera/upload icon 📸 next to the message box at the bottom of the screen to attach a photo, then write your question and send.");
  };

  // Handle Send Message
  const handleSendMessage = async (text: string, imageBase64?: string) => {
    const textToSend = text.trim();
    if (!textToSend && !imageBase64) return;

    // Build the user message
    const userMsg: Message = {
      id: "msg_user_" + Date.now(),
      role: "user",
      text: textToSend || "Identify this crop issue and suggest solutions.",
      image: imageBase64,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Store preceding history before adding the new message
    const precedingHistory = [...messages];

    // Append new message to local state
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: precedingHistory,
          languageName: selectedLanguage ? selectedLanguage.name : undefined,
          image: imageBase64,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || "Advisory API failed");
      }

      const aiMsg: Message = {
        id: "msg_ai_" + (Date.now() + 1),
        role: "model",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Advisory System Error:", err);
      const errText = err.message || "Unable to connect to the advisor. Please check your network and try again.";
      setErrorMessage(errText);

      // Append error message as a model text so they can see the failure inline
      const errorMsg: Message = {
        id: "msg_err_" + Date.now(),
        role: "model",
        text: `⚠️ **System Connection Error**\n\n${errText}\n\n*If you are the developer, please ensure process.env.GEMINI_API_KEY is configured correctly under Settings > Secrets.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7F2] text-[#1A1A1A] font-sans selection:bg-[#2D5A27]/10">
      
      {/* Header Bar */}
      <Header
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onReset={handleReset}
        hasMessages={messages.length > 0}
      />

      {/* Main Container / Content Area */}
      <main className="flex-1 flex flex-col w-full relative bg-[#F8F7F2]">
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 text-red-800 text-xs sm:text-sm py-2.5 px-4 sticky top-[64px] z-30 shadow-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="flex-1 leading-normal">{errorMessage}</span>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-red-400 hover:text-red-600 p-1 font-bold shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center py-4 bg-[#F8F7F2]">
            <WelcomeScreen
              onSelectQuestion={handleSelectQuestion}
              onPromptImageUpload={handlePromptImageUpload}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-[#FAF9F6]">
            <ChatList
              messages={messages}
              isLoading={isLoading}
              selectedLanguage={selectedLanguage}
            />
          </div>
        )}
      </main>

      {/* Input Area (Text, Mic, Photo uploads) */}
      <InputArea
        onSendMessage={handleSendMessage}
        selectedLanguage={selectedLanguage}
        disabled={isLoading}
        onSetInputRef={(triggerFn) => {
          inputTriggerRef.current = triggerFn;
        }}
      />
    </div>
  );
}
