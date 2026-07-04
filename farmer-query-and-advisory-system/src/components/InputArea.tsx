import React, { useRef, useState, useEffect } from "react";
import { Mic, MicOff, Camera, Send, X, AlertCircle } from "lucide-react";
import { Language } from "../types";

interface InputAreaProps {
  onSendMessage: (text: string, imageBase64?: string) => void;
  selectedLanguage: Language | null;
  disabled: boolean;
  onSetInputRef?: (triggerFn: (text: string) => void) => void;
}

export default function InputArea({
  onSendMessage,
  selectedLanguage,
  disabled,
  onSetInputRef,
}: InputAreaProps) {
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Expose an input setter function to the parent (so tapping questions sets this input)
  useEffect(() => {
    if (onSetInputRef) {
      onSetInputRef((text: string) => {
        setInputText(text);
      });
    }
  }, [onSetInputRef]);

  // Set up Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInputText((prev) => (prev ? prev + " " + transcript : transcript));
      }
    };

    rec.onerror = (event: any) => {
      console.error("Speech Recognition Error", event);
      if (event.error === "not-allowed") {
        setSpeechError("Microphone access denied. Please allow microphone permissions.");
      } else if (event.error === "no-speech") {
        setSpeechError("No speech detected. Please speak clearly into your mic.");
      } else {
        setSpeechError(`Voice input error: ${event.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, []);

  // Update speech language whenever selected language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage?.speechLang || "hi-IN";
    }
  }, [selectedLanguage]);

  const toggleVoiceInput = () => {
    if (!speechSupported || disabled) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition", err);
        setIsListening(false);
      }
    }
  };

  const handleImageClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 4MB for faster network transit)
    if (file.size > 4 * 1024 * 1024) {
      alert("Image is too large. Please select a photo smaller than 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    if (disabled) return;
    const textToSend = inputText.trim();
    if (!textToSend && !selectedImage) return;

    onSendMessage(textToSend, selectedImage || undefined);
    setInputText("");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Stop listening if it's currently on
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-[#E5E2D9] p-4 sm:p-5 shadow-lg sticky bottom-0 z-40 w-full">
      <div className="max-w-4xl mx-auto space-y-3">
        
        {/* Error Indicator for Speech Recognition */}
        {speechError && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">{speechError}</span>
            <button 
              onClick={() => setSpeechError(null)}
              className="ml-auto text-red-400 hover:text-red-600 font-bold px-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Thumbnail Image Attachment Preview */}
        {selectedImage && (
          <div className="relative inline-block bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl p-2 pr-9 animate-fade-in">
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#E5E2D9]">
              <img
                src={selectedImage}
                alt="Upload preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={removeImage}
              className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-[10px] text-[#2D5A27] font-bold mt-1 text-center uppercase tracking-wide">
              Photo Attached
            </p>
          </div>
        )}

        {/* Interactive Bar */}
        <div className="flex items-end gap-3">
          {/* Camera / Upload Button */}
          <button
            type="button"
            onClick={handleImageClick}
            disabled={disabled}
            className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 ${
              selectedImage
                ? "bg-emerald-50 border-[#2D5A27] text-[#2D5A27]"
                : "bg-gray-100 border-[#E5E2D9] text-gray-600 hover:bg-gray-200 hover:text-[#2D5A27]"
            }`}
            title="Take photo of crop or pest"
          >
            <Camera className="w-6 h-6" />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Textarea Input Box */}
          <div className="flex-1 relative bg-[#F8F7F2] border border-[#E5E2D9] focus-within:border-[#2D5A27] focus-within:ring-2 focus-within:ring-[#2D5A27]/10 rounded-2xl overflow-hidden transition-all min-h-[56px]">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={
                isListening
                  ? "Listening... Speak clearly (सुन रहा हूँ... बोलें)"
                  : selectedImage
                  ? "Describe the issue in this photo..."
                  : "Type your question here... (सवाल यहाँ लिखें)"
              }
              className="w-full pl-5 pr-12 py-4 text-sm sm:text-base bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none max-h-32 min-h-[54px] leading-relaxed"
              style={{ height: "auto" }}
            />
            
            {/* Submit Send Button inside Input Box */}
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || (!inputText.trim() && !selectedImage)}
              className={`absolute right-4 bottom-3 transition-colors ${
                inputText.trim() || selectedImage
                  ? "text-[#2D5A27] hover:text-[#4D7C47] cursor-pointer active:scale-95"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              title="Send query"
            >
              <Send className="w-7 h-7" />
            </button>
          </div>

          {/* Voice Input (Microphone) Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={disabled}
              className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 ${
                isListening
                  ? "bg-red-500 border-red-600 text-white animate-pulse"
                  : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
              }`}
              title="Speak question (बोलकर सवाल पूछें)"
            >
              <Mic className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Small Multilingual Guidance Label */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] gap-1 px-1 pt-1">
          <span>Hindi, Tamil, Marathi, Telugu, Kannada are supported.</span>
          <span>Powered by Gemini AI • Real-time Agricultural Support</span>
        </div>

      </div>
    </div>
  );
}
