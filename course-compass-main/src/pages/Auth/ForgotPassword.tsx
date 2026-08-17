import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Sparkles } from "lucide-react";
import axios from "axios";

// Assuming standard API config, matching Login.tsx
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setStatus("success");
      setMessage(response.data.message || "Reset link sent to your email.");
      if (response.data.resetLink) {
        setResetLink(response.data.resetLink); // For testing purposes
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.response?.data?.error || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Account Recovery
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
            Forgot <span className="text-gradient">Password?</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 shadow-[0_0_60px_hsl(16_100%_60%/0.08)]">
          {status === "success" ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Check your email</h3>
              <p className="text-muted-foreground text-sm">
                {message}
              </p>
              
              {/* TESTING PURPOSES ONLY - Show the link if returned from backend */}
              {resetLink && (
                <div className="p-4 bg-muted/40 rounded-lg border border-border mt-4 text-left break-all">
                  <p className="text-xs text-muted-foreground mb-2">Testing mode: Link generated</p>
                  <a href={resetLink} className="text-primary text-sm hover:underline font-medium">
                    {resetLink}
                  </a>
                </div>
              )}

              <Link
                to="/login"
                className="btn-primary w-full justify-center py-3 text-sm font-semibold mt-6"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {status === "error" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  <span>⚠️</span> {message}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="text-sm font-medium text-foreground/80">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="you@example.com"
                    className="w-full bg-muted/40 border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full btn-primary justify-center py-3.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending link…
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
