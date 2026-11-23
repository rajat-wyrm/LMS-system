import { useCallback, useEffect, useState } from "react";
import { BookOpen, Bot, Loader2, MessageCircle, RefreshCw, UserRound } from "lucide-react";
import { SpeechInput } from "@/components/common/SpeechInput";
import { Button } from "@/components/ui/button";

const API_BASE = (import.meta.env.VITE_TUTOR_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

type Notebook = { id: string; title: string; description?: string | null };
type Chat = { id: string; title: string };
type Message = { id?: string; role: "user" | "assistant"; content: string };
type AskResponse = { answer: string; sources: Array<{ source?: string; page?: number; [key: string]: unknown }> };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch { /* response was not JSON */ }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export default function Tutor() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notebookId, setNotebookId] = useState("");
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<AskResponse["sources"]>([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadNotebooks = useCallback(async () => {
    setLoadingNotebooks(true);
    setError("");
    try {
      const data = await api<Notebook[]>("/notebooks");
      setNotebooks(data);
      setNotebookId((current) => data.some((item) => item.id === current) ? current : data[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load learning notebooks.");
    } finally {
      setLoadingNotebooks(false);
    }
  }, []);

  useEffect(() => { void loadNotebooks(); }, [loadNotebooks]);

  useEffect(() => {
    let cancelled = false;
    async function openChat() {
      setChatId("");
      setMessages([]);
      setSources([]);
      if (!notebookId) return;
      setError("");
      try {
        const chat = await api<Chat>(`/notebooks/${encodeURIComponent(notebookId)}/chats`, {
          method: "POST", body: JSON.stringify({ title: "Tutor chat" }),
        });
        if (cancelled) return;
        setChatId(chat.id);
        const history = await api<Message[]>(`/chats/${encodeURIComponent(chat.id)}/messages`);
        if (!cancelled) setMessages(history);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not open the tutor chat.");
      }
    }
    void openChat();
    return () => { cancelled = true; };
  }, [notebookId]);

  const sendQuestion = async (question: string) => {
    if (!chatId || sending || !question.trim()) return;
    const cleanQuestion = question.trim();
    setSending(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content: cleanQuestion }]);
    setSources([]);
    try {
      const result = await api<AskResponse>(`/chats/${encodeURIComponent(chatId)}/ask`, {
        method: "POST", body: JSON.stringify({ question: cleanQuestion }),
      });
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
      setSources(result.sources || []);
    } catch (err) {
      setMessages((current) => current.slice(0, -1));
      setError(err instanceof Error ? err.message : "The tutor could not answer. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary"><Bot className="h-4 w-4" /> UptoSkills AI</p>
          <h1 className="text-3xl font-bold tracking-tight">AI Tutor</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Ask questions about your learning materials. Type your question or use the microphone.</p>
        </div>
        <Button variant="outline" onClick={() => void loadNotebooks()} disabled={loadingNotebooks}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loadingNotebooks ? "animate-spin" : ""}`} /> Refresh notebooks
        </Button>
      </div>

      <div className="mb-5 rounded-xl border border-border bg-card p-4">
        <label htmlFor="tutor-notebook" className="mb-2 flex items-center gap-2 text-sm font-medium"><BookOpen className="h-4 w-4" /> Choose course material</label>
        <select id="tutor-notebook" value={notebookId} onChange={(event) => setNotebookId(event.target.value)} disabled={loadingNotebooks || notebooks.length === 0} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
          {notebooks.length === 0 && <option value="">{loadingNotebooks ? "Loading notebooks…" : "No notebooks available"}</option>}
          {notebooks.map((notebook) => <option key={notebook.id} value={notebook.id}>{notebook.title}</option>)}
        </select>
        {!loadingNotebooks && notebooks.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Create a notebook and upload course documents in the AI learning API before asking questions.</p>}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Bot className="h-5 w-5" /></div><div><h2 className="font-semibold">Course Tutor</h2><p className="text-xs text-muted-foreground">Answers are based on the selected notebook's documents</p></div></div>
        <div className="min-h-[300px] max-h-[520px] space-y-4 overflow-y-auto p-5" aria-live="polite">
          {messages.length === 0 && <div className="mx-auto flex max-w-md flex-col items-center py-14 text-center"><MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" /><h3 className="font-semibold">What would you like to learn?</h3><p className="mt-1 text-sm text-muted-foreground">Choose a notebook, then ask a question about its uploaded material.</p></div>}
          {messages.map((message, index) => <div key={`${message.id || message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`flex max-w-[85%] gap-2 rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{message.role === "assistant" ? <Bot className="mt-0.5 h-4 w-4 shrink-0" /> : <UserRound className="mt-0.5 h-4 w-4 shrink-0" />}<p className="whitespace-pre-wrap">{message.content}</p></div></div>)}
          {sending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Tutor is thinking…</div>}
        </div>
        {sources.length > 0 && <div className="border-t border-border px-5 py-3"><p className="mb-1 text-xs font-semibold text-muted-foreground">Sources</p><ul className="list-inside list-disc text-xs text-muted-foreground">{sources.map((source, index) => <li key={index}>{String(source.source || source.filename || source.name || `Source ${index + 1}`)}{source.page ? ` · page ${source.page}` : ""}</li>)}</ul></div>}
        <div className="border-t border-border p-4 sm:p-5"><SpeechInput key={chatId || "no-chat"} onSubmit={sendQuestion} disabled={sending} placeholder={chatId ? "Ask your course tutor…" : "Select an available notebook to start…"} /><p className="mt-2 text-xs text-muted-foreground">Voice input requires a supported browser and microphone permission. You can always type instead.</p></div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
    </section>
  );
}
