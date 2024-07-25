// hooks/useSpeechToText.ts

import { useEffect, useState } from "react";

const useSpeechToText = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [listening, setListening] = useState<boolean>(false);

  useEffect(() => {
    let recognition: SpeechRecognition | null = null;

    if (listening) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interimTranscript);
        if (finalTranscript) {
          setTranscript(finalTranscript);
          setInterimTranscript("");
        }
      };

      recognition.start();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [listening]);

  return { transcript, interimTranscript, listening, setListening };
};

export default useSpeechToText;
