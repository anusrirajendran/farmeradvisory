import { Language, AdvisoryCategory } from "./types";

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", speechLang: "en-IN" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", speechLang: "hi-IN" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", speechLang: "ta-IN" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", speechLang: "te-IN" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", speechLang: "kn-IN" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", speechLang: "mr-IN" }
];

export const ADVISORY_CATEGORIES: AdvisoryCategory[] = [
  {
    id: "crop",
    title: "Crop Advisory",
    iconName: "Sprout",
    description: "Sowing times, seed selection & harvest tips",
    sampleQuestions: [
      "Which crop is profitable to sow in Maharashtra in July?",
      "When is the best time to sow groundnut in Tamil Nadu?",
      "Suggest high-yielding paddy seed varieties for lowlands."
    ]
  },
  {
    id: "pest",
    title: "Pest & Disease Help",
    iconName: "Bug",
    description: "Upload a photo to diagnose diseased leaves or pests",
    sampleQuestions: [
      "My tomato leaves have yellow spots and are curling. What should I do?",
      "Suggest organic pesticide for cotton aphid control.",
      "How do I prevent root rot in green gram?"
    ]
  },
  {
    id: "soil",
    title: "Soil Health Tips",
    iconName: "Layers",
    description: "Fertilizer dosage, organic manure & soil testing",
    sampleQuestions: [
      "How can I increase organic carbon in sandy clay soil?",
      "What is the recommended NPK ratio for sugarcane?",
      "How often should I test my soil and where?"
    ]
  },
  {
    id: "weather",
    title: "Weather Guidance",
    iconName: "CloudSun",
    description: "Monsoon tips, frost advisory & seasonal guidance",
    sampleQuestions: [
      "What precautions should I take for rainfed maize during heavy monsoon?",
      "How does humidity affect cotton flowering?",
      "Suggest action plan for sudden dry spells in soy bean cultivation."
    ]
  },
  {
    id: "schemes",
    title: "Government Schemes",
    iconName: "FileText",
    description: "Subsidies, PM-KISAN, crop insurance & local grants",
    sampleQuestions: [
      "Is there a subsidy for installing drip irrigation?",
      "How do I apply for the PM-KISAN Samman Nidhi scheme?",
      "What documents are required for PM Fasal Bima Yojana (crop insurance)?"
    ]
  },
  {
    id: "market",
    title: "Market Price Queries",
    iconName: "TrendingUp",
    description: "Seasonal pricing tips, local mandi and eNAM portal info",
    sampleQuestions: [
      "Where can I check the current mandi price for onions?",
      "Which month gets the highest market price for turmeric?",
      "How do I register my crop on the eNAM portal for direct selling?"
    ]
  }
];
