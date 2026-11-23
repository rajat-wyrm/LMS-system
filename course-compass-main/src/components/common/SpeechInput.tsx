import { useState } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSTT } from "@/hooks/useSTT";

export interface SpeechInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  lang?: string;
  rows?: number;
}

/** Text input with an optional speech-to-text microphone button. */
export function SpeechInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your message or use the microphone...",
  disabled = false,
  lang = "en-US",
  rows = 3,
}: SpeechInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const text = value ?? internalValue;

  const updateText = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const { isSupported, isListening, interimTranscript, error, startListening, stopListening } = useSTT({
    lang,
    onFinalTranscript: (spokenText) => {
      const separator = text.trim() ? " " : "";
      updateText(`${text}${separator}${spokenText}`);
    },
  });

  const submit = () => {
    if (text.trim()) onSubmit?.(text.trim());
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-end gap-2">
        <Textarea
          value={text}
          onChange={(event) => updateText(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          aria-label="Message"
          className="min-h-[88px] resize-y"
        />
        <div className="flex shrink-0 flex-col gap-2">
          <Button
            type="button"
            size="icon"
            variant={isListening ? "destructive" : "outline"}
            disabled={disabled || (!isSupported && !isListening)}
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? "Stop speech recognition" : "Start speech recognition"}
            title={isListening ? "Stop listening" : isSupported ? "Speak your message" : "Speech recognition is not supported"}
          >
            {isListening ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
          </Button>
          {onSubmit && (
            <Button type="button" size="icon" onClick={submit} disabled={disabled || !text.trim()} aria-label="Send message">
              <Send aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
      {isListening && <p className="text-sm text-muted-foreground" role="status">Listening… {interimTranscript}</p>}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {!isSupported && <p className="text-xs text-muted-foreground">Voice input is unavailable in this browser. You can still type your message.</p>}
    </div>
  );
}

export default SpeechInput;
