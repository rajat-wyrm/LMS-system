import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { notificationApi, type NotificationCategory } from "@/api/notification.api";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES: NotificationCategory[] = [
  "ANNOUNCEMENT",
  "SYSTEM",
  "COURSE",
  "ASSIGNMENT",
  "QUIZ",
  "PAYMENT",
  "MESSAGE",
];

const ROLES = ["user", "instructor", "admin"] as const;

/**
 * Drop this into the admin dashboard (e.g. a "Notifications" tab) to send a
 * broadcast to every user, or only to selected roles.
 */
export const AdminBroadcastForm = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<NotificationCategory>("ANNOUNCEMENT");
  const [link, setLink] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleRole = (role: string) =>
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({ title: "Title and message are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await notificationApi.broadcast({
        title: title.trim(),
        message: message.trim(),
        category,
        link: link.trim() || undefined,
        roles: roles.length ? roles : undefined,
      });
      toast({ title: "Broadcast sent ✅", description: res.data.message });
      setTitle("");
      setMessage("");
      setLink("");
      setRoles([]);
    } catch (err: any) {
      toast({
        title: "Broadcast failed",
        description: err?.response?.data?.error || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 border border-border/50">
      <h2 className="font-display font-semibold text-lg">Broadcast Notification</h2>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Platform maintenance tonight"
          className="w-full bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="We'll be down for 10 minutes at 11pm UTC."
          className="w-full bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NotificationCategory)}
            className="w-full bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Link (optional)</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/announcements/123"
            className="w-full bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Audience (leave empty for everyone)
        </label>
        <div className="flex gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                roles.includes(role)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Send Broadcast
      </button>
    </form>
  );
};

export default AdminBroadcastForm;
