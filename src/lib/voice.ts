import { supabase } from "./supabase";

type VoiceStateListener = (speaking: boolean) => void;
const listeners: Set<VoiceStateListener> = new Set();

let currentAudio: HTMLAudioElement | null = null;

export const subscribeToVoiceState = (listener: VoiceStateListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setSpeaking = (speaking: boolean) => {
  listeners.forEach(l => l(speaking));
};

export const stopSpeech = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  setSpeaking(false);
};

export const speak = async (text: string) => {
  try {
    stopSpeech();
    setSpeaking(true);

    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: { text },
    });

    if (error) {
      throw new Error(error.message || "Failed to call TTS service via Supabase");
    }

    if (!data || !data.audioContent) {
      throw new Error("No audio content received from TTS service");
    }

    const audioContent = data.audioContent;
    
    currentAudio = new Audio(`data:audio/mp3;base64,${audioContent}`);
    
    currentAudio.onended = () => {
      setSpeaking(false);
      currentAudio = null;
    };

    currentAudio.onerror = () => {
      setSpeaking(false);
      currentAudio = null;
    };

    await currentAudio.play();
  } catch (error) {
    console.error("Cloud TTS error:", error);
    setSpeaking(false);
    
    // Fallback to Web Speech if Cloud/Supabase fails
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // ENFORCE ENGLISH FALLBACK
      
      // Try to find a better English voice if available
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;

      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }
};
