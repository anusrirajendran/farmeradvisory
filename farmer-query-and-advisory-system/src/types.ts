export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 URL for rendering the uploaded image
  timestamp: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  speechLang: string; // Code for speech-to-text / text-to-speech API
}

export interface AdvisoryCategory {
  id: string;
  title: string;
  iconName: string;
  description: string;
  sampleQuestions: string[];
}
