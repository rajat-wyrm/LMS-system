import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, Sparkles } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ResetPassword = () => {
  const { id, token } = useParams<{ id: string; token: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      const response = await axios.put(`${API_URL}/auth/reset-password/${id}/${token}`, {
        password: form.password,
      });
      setStatus("success");
      setMessage(response.data.message || "Password has been reset successfully.");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.response?.data?.error || "Invalid or expired token. Please try again.");
    }
  };

  if (!id || !token) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md glass-card p-8 text-center text-destructive">
          Invalid password reset link. Please request a new one.
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Secure Access
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
            Create <span className="text-gradient">New Password</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Please enter your new password below.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 shadow-[0_0_60px_hsl(16_100%_60%/0.08)]">
          {status === "success" ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Password Reset Complete!</h3>
              <p className="text-muted-foreground text-sm">
                Your password has been changed successfully. You will be redirected to the login page momentarily.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="btn-primary w-full justify-center py-3 text-sm font-semibold mt-4"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {status === "error" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  <span>⚠️</span> {message}
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-muted/40 border border-border rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-muted/40 border border-border rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading" || !form.password || !form.confirmPassword}
                className="w-full btn-primary justify-center py-3.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed mt-4"
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Resetting…
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
