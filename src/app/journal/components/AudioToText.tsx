import { useEffect, useState, useRef } from "react";
import { Mic, LoaderCircle } from "lucide-react";
import { AudioToTextProps } from '@/types/journal';
import { supabase } from '@/lib/supabase';

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition: new () => SpeechRecognition;
}

export default function AudioToText({ onTranscription }: AudioToTextProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const readUser = async () => {
      const { data } = await supabase.auth.getUser();
      setIsSignedIn(!!data.user);
    };

    readUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
    });

    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as WindowWithSpeechRecognition).webkitSpeechRecognition();
      // continuous: keep listening until explicitly stopped (not just first phrase)
      recognition.continuous = true;
      // interimResults: emit ongoing transcription predictions before speech ends
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        
        // Process speech recognition results starting from the last processed index
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          // Only add results marked as final (not interim predictions)
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        
        // Call callback only when we have final transcription
        if (finalTranscript) {
          onTranscription(finalTranscript);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      recognition.onerror = (_event: SpeechRecognitionErrorEvent) => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onTranscription]);

  const handleClick = () => {
    if (!isSignedIn) {
      alert("Please sign in to use speech input.");
      return;
    }

    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        setIsRecording(false);
      }
    } else {
      try {
        recognitionRef.current.start();
      } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        // Silent error handling
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-lg transition-colors ${
        isRecording 
          ? 'bg-purple-100 text-purple-600 hover:bg-purple-500/50 hover:text-white' 
          : 'bg-gray-100 text-gray-600 hover:bg-purple-500/50 hover:text-white'
      }`}
      title={isRecording ? "Stop recording" : "Start voice input"}
    >
      {isRecording ? (
        <LoaderCircle className="animate-spin w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}