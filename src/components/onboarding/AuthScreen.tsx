import React, { useState } from "react";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  KeyRound,
  ArrowLeft,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Inbox
} from "lucide-react";
import { setAuthToken } from "../../services/apiClient";

interface AuthScreenProps {
  initialMode?: "signin" | "signup";
  onAuthenticated: (details: {
    fullName: string;
    email: string;
    currentWeek?: number;
    trimester?: number;
    eddDate?: string;
    isExistingUser?: boolean;
  }) => void;
  onBackToWelcome: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = "signup",
  onAuthenticated,
  onBackToWelcome,
}) => {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot_password">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Recovery Flow State
  const [recoveryStep, setRecoveryStep] = useState<"request_code" | "reset_password">("request_code");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    if (mode === "signup") {
      if (!fullName.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!cleanEmail || !cleanEmail.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match. Please re-enter.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: cleanEmail,
            password: password
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.error || "Unable to create account. Please try again.");
          setIsLoading(false);
          return;
        }

        setAuthToken(data.token || null);
        setSuccessMsg("Account created securely! Redirecting to journey selection...");
        setTimeout(() => {
          onAuthenticated({
            fullName: data.user?.name || fullName.trim(),
            email: data.user?.email || cleanEmail,
            currentWeek: data.user?.currentWeek || 24,
            trimester: data.user?.trimester || 2,
            eddDate: data.user?.eddDate || "2026-11-20",
            isExistingUser: false,
          });
        }, 600);
      } catch (err: any) {
        setErrorMsg("Network error connecting to authentication server. Please retry.");
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "signin") {
      // Sign In mode
      if (!cleanEmail || !cleanEmail.includes("@")) {
        setErrorMsg("Please enter your registered email address.");
        return;
      }
      if (!password) {
        setErrorMsg("Please enter your password.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password: password
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.error || "Invalid email or password. Access denied.");
          setIsLoading(false);
          return;
        }

        setAuthToken(data.token || null);
        setSuccessMsg("Credentials verified! Taking you straight to Dashboard... 🌸");
        setTimeout(() => {
          onAuthenticated({
            fullName: data.user?.name || "Mom",
            email: data.user?.email || cleanEmail,
            currentWeek: data.user?.currentWeek,
            trimester: data.user?.trimester,
            eddDate: data.user?.eddDate,
            isExistingUser: true,
          });
        }, 500);
      } catch (err: any) {
        setErrorMsg("Network error verifying credentials. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 1. Request Password Recovery Code
  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = recoveryEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter your registered email address to receive the recovery code.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || "Unable to find an account with this email.");
        setIsLoading(false);
        return;
      }

      setResetToken(data.resetToken);
      setPreviewCode(data.previewCode);
      setRecoveryStep("reset_password");
      setSuccessMsg(data.message || "Recovery code sent successfully!");
    } catch (err: any) {
      setErrorMsg("Failed to connect to recovery service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Code Verification & New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!recoveryCode.trim() || recoveryCode.trim().length !== 6) {
      setErrorMsg("Please enter the full 6-digit recovery code sent to your email.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg("The new passwords do not match. Please retype carefully.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          code: recoveryCode.trim(),
          email: recoveryEmail.trim().toLowerCase(),
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || "Unable to reset password. Please verify the code.");
        setIsLoading(false);
        return;
      }

      // Password successfully updated!
      setSuccessMsg("🌸 Password successfully updated! Taking you to Sign In with your new credentials...");
      setEmail(recoveryEmail.trim().toLowerCase());
      setPassword(newPassword);

      setTimeout(() => {
        setMode("signin");
        setRecoveryStep("request_code");
        setRecoveryCode("");
        setResetToken("");
        setPreviewCode(null);
        setNewPassword("");
        setConfirmNewPassword("");
        setErrorMsg(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg("Network error saving new password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemoAccount = () => {
    setEmail("sarah@bloomnest.com");
    setPassword("password123");
    setMode("signin");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF7F9] to-[#F5E6EC] dark:from-[#120E18] dark:via-[#1A1424] dark:to-[#22172A] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/90 dark:bg-[#1A1523]/90 backdrop-blur-xl p-8 rounded-[32px] border border-rose-100 dark:border-rose-900/40 shadow-2xl shadow-rose-200/50 dark:shadow-none space-y-6"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={mode === "forgot_password" ? () => { setMode("signin"); setErrorMsg(null); setSuccessMsg(null); } : onBackToWelcome}
            className="text-xs font-bold text-gray-500 hover:text-rose-600 dark:text-rose-300 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{mode === "forgot_password" ? "Back to Sign In" : "Welcome"}</span>
          </button>
          <div className="flex items-center gap-1 text-xs font-bold text-rose-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Authentication</span>
          </div>
        </div>

        {/* Tab Switcher (Visible when not in password recovery) */}
        {mode !== "forgot_password" && (
          <div className="p-1 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/30 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                mode === "signup"
                  ? "bg-white dark:bg-rose-900/80 text-rose-600 dark:text-rose-100 shadow-sm"
                  : "text-gray-500 dark:text-rose-300 hover:text-rose-600"
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                mode === "signin"
                  ? "bg-white dark:bg-rose-900/80 text-rose-600 dark:text-rose-100 shadow-sm"
                  : "text-gray-500 dark:text-rose-300 hover:text-rose-600"
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100">
            {mode === "signup"
              ? "Create your BloomNest account"
              : mode === "signin"
              ? "Welcome back to BloomNest"
              : recoveryStep === "request_code"
              ? "Reset Your Password"
              : "Enter Recovery Code"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-rose-300">
            {mode === "signup"
              ? "Each email is strictly registered to a single account with encrypted credentials."
              : mode === "signin"
              ? "Strict verification: email and password must match to enter."
              : recoveryStep === "request_code"
              ? "We'll send a secure 6-digit recovery code to your registered email to verify ownership."
              : `Enter the 6-digit code sent to ${recoveryEmail} and choose your new password.`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2"
          >
            <span className="text-base leading-none">⚠️</span>
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* ================= MODE 1 & 2: SIGN UP / SIGN IN ================= */}
        {mode !== "forgot_password" && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === "signup" && (
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 dark:text-rose-300">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    required={mode === "signup"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maya Jenkins"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 font-semibold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-bold text-gray-700 dark:text-rose-300">Email Address (Unique ID)</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. maya@bloomnest.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 font-semibold focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-gray-700 dark:text-rose-300">Password</label>
                {mode === "signin" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryEmail(email || "");
                        setRecoveryStep("request_code");
                        setMode("forgot_password");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                    <span className="text-gray-300 dark:text-rose-800">•</span>
                    <button
                      type="button"
                      onClick={handleUseDemoAccount}
                      className="text-[11px] font-bold text-gray-500 dark:text-rose-300 hover:text-rose-500 hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Demo</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 font-semibold focus:outline-none focus:border-rose-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-rose-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 dark:text-rose-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 font-semibold focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Secure Credentials...</span>
                </>
              ) : (
                <>
                  <span>{mode === "signup" ? "Create Account & Continue" : "Verify & Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= MODE 3: FORGOT PASSWORD FLOW ================= */}
        {mode === "forgot_password" && (
          <div className="space-y-4 text-xs">
            {recoveryStep === "request_code" ? (
              // Step 3A: Request Code via Email
              <form onSubmit={handleRequestRecovery} className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                    <Inbox className="w-4 h-4" />
                    <span>Secure Email Verification</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-rose-300/80 leading-relaxed">
                    We will send a 6-digit one-time recovery code to your inbox. This code expires in 15 minutes.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-gray-700 dark:text-rose-300">Registered Email Address</label>
                    <button
                      type="button"
                      onClick={() => setRecoveryEmail("sarah@bloomnest.com")}
                      className="text-[11px] font-bold text-rose-500 hover:underline"
                    >
                      Use Sarah's Demo Email
                    </button>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="e.g. sarah@bloomnest.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 font-semibold focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Secure Email...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Step 3B: Verify 6-digit Code & Enter New Password
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Instant Test Preview Notification Banner */}
                {previewCode && (
                  <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-900/50 text-pink-900 dark:text-pink-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-pink-600" />
                        <span>Simulated Inbox Code</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setRecoveryCode(previewCode)}
                        className="text-[11px] bg-white dark:bg-pink-900 px-2 py-0.5 rounded-lg border border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-200 hover:bg-pink-100 font-bold"
                      >
                        Auto-Fill Code
                      </button>
                    </div>
                    <div className="text-[11px] text-pink-700 dark:text-pink-300 flex items-center gap-2">
                      <span>Code:</span>
                      <code className="px-2 py-0.5 rounded bg-white dark:bg-black/40 font-mono font-bold tracking-widest text-pink-600 dark:text-pink-300">
                        {previewCode}
                      </code>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-gray-700 dark:text-rose-300">6-Digit Recovery Code</label>
                    <button
                      type="button"
                      onClick={() => setRecoveryStep("request_code")}
                      className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Change Email</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 849201"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 font-mono tracking-widest font-bold focus:outline-none focus:border-rose-400 text-center text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 dark:text-rose-300">New Password (Min 6 chars)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 font-semibold focus:outline-none focus:border-rose-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-rose-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 dark:text-rose-300">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 font-semibold focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password & Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-rose-500 font-bold hover:underline"
              >
                ← Remember your password? Return to Sign In
              </button>
            </div>
          </div>
        )}

        {/* Bottom Toggle between Sign In / Sign Up */}
        {mode !== "forgot_password" && (
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-gray-500 dark:text-rose-300 hover:text-rose-600"
            >
              {mode === "signup" ? (
                <span>Already have an account? <strong className="text-rose-500 underline">Sign In</strong></span>
              ) : (
                <span>Don't have an account? <strong className="text-rose-500 underline">Create Account</strong></span>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

