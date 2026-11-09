import { useState, type FormEvent } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import CelebrityAvatar from "./CelebrityAvatar";
import { tutorApi } from "@/api/tutor.api";

interface TutorMessage {
  role: "user" | "assistant";
  text: string;
  citations?: string[];
}

export default function AITutorDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      text: "Hi! I am your AI Tutor. Ask me anything about this lesson.",
      citations: ["Lesson Content"],
    },
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = message.trim();

    if (!question || isLoading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text: question },
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await tutorApi.askQuestion(question);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: response.answer,
          citations: response.citations,
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "Sorry, I couldn't answer that. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b p-4">
            <CelebrityAvatar />

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Tutor"
              className="rounded-md p-2 hover:bg-muted"
            >
              <X size={20} />
            </button>
          </div>

          <div
            className="flex-1 space-y-4 overflow-y-auto p-4"
            aria-live="polite"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[90%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.text}</p>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 border-t border-border/50 pt-2">
                    <p className="mb-1 text-xs font-semibold">Sources</p>
                    {msg.citations.map((citation, citationIndex) => (
                      <p
                        key={citationIndex}
                        className="text-xs opacity-80"
                      >
                        • {citation}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                Your tutor is thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask your tutor..."
              aria-label="Ask your tutor"
              className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              aria-label="Send message"
              className="rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Tutor"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle size={26} />
        </button>
      )}
    </div>
  );
}