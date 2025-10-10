import { useEffect, useState, useRef } from "react";
import { Mic, LoaderCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { AudioToTextProps } from '@/types/journal';

export default function AudioToText({ onTranscription }: AudioToTextProps) {
  const { user, isSignedIn } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        // Start silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 2000);
      };

      recognition.onresult = (event: any) => {
        // Reset silence timer on new speech
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
          }
        }, 3000);

        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        
        if (finalTranscript) {
          onTranscription(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setIsRecording(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [onTranscription, isRecording]);

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
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      } catch (error) {
        console.error("Error stopping recognition:", error);
        setIsRecording(false);
      }
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
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