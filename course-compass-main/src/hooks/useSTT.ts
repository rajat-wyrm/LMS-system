
import { useCallback, useEffect, useRef, useState } from "react";

interface STTOptions {
  lang?: string;
  onFinalTranscript?: (text: string) => void;
}

interface SpeechResult {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechEvent {
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
}

interface SpeechErrorEvent {
  error: string;
}

interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
}

export function useSTT({
  lang = "en-US",
  onFinalTranscript,
}: STTOptions = {}) {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef<Recognition | null>(null);
  const callbackRef = useRef(onFinalTranscript);

  useEffect(() => {
    callbackRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  const speechWindow =
    typeof window !== "undefined"
      ? (window as SpeechWindow)
      : null;

  const isSupported = Boolean(
    speechWindow?.SpeechRecognition ||
    speechWindow?.webkitSpeechRecognition
  );

  const startListening = useCallback(() => {
    if (!speechWindow || !isSupported) {
      setError("Speech recognition is not supported. Please type instead.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const SpeechRecognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const spokenText = result[0].transcript;

          if (result.isFinal) {
            finalText += spokenText;
          } else {
            interimText += spokenText;
          }
        }

        if (finalText.trim()) {
          const cleanText = finalText.trim();
          setTranscript((previous) =>
            `${previous}${previous ? " " : ""}${cleanText}`
          );
          callbackRef.current?.(cleanText);
        }

        setInterimTranscript(interimText);
      };

      recognition.onerror = (event) => {
        const errors: Record<string, string> = {
          "not-allowed": "Microphone permission denied. Please allow microphone access.",
          "service-not-allowed": "Speech recognition service is unavailable.",
          "audio-capture": "No microphone detected.",
          "no-speech": "No speech detected. Please try again.",
          network: "Network error. Please check your connection.",
        };

        setError(
          errors[event.error] ||
          "Speech recognition failed. Please try again."
        );
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
      setError("");
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      setError("Unable to start microphone. Please try again.");
    }
  }, [lang, speechWindow, isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  };
}
