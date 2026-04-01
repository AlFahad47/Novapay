"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Lock, Mail, Shield, Unlock, X } from "lucide-react";
import { signIn } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "@/lib/brandAlert";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import T from "@/components/T";
import { AUTH_MODAL_EVENT, AuthView } from "./authModalEvents";

type ActiveField = "none" | "text" | "password";

function strengthLabel(strength: number) {
  if (strength <= 1) return "Weak";
  if (strength === 2) return "Fair";
  if (strength === 3) return "Good";
  return "Strong";
}

function calculateStrength(pass: string) {
  let score = 0;
  if (!pass) return 0;
  if (pass.length > 5) score += 1;
  if (pass.length > 7) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return Math.min(4, score);
}

const AuthModal: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthView>("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>("none");

  const queryView = searchParams.get("auth");
  const routeAuthView: AuthView | null =
    queryView === "login" || queryView === "register" || queryView === "forgot"
      ? queryView
      : null;

  const registerStrength = useMemo(
    () => calculateStrength(registerPassword),
    [registerPassword],
  );

  const removeAuthQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("auth")) return;
    params.delete("auth");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    removeAuthQuery();
  }, [removeAuthQuery]);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ view?: AuthView }>;
      setView(
        customEvent.detail?.view === "register" || customEvent.detail?.view === "forgot"
          ? customEvent.detail.view
          : "login",
      );
      setIsOpen(true);
    };

    window.addEventListener(AUTH_MODAL_EVENT, handleOpen as EventListener);
    return () => {
      window.removeEventListener(AUTH_MODAL_EVENT, handleOpen as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!(isOpen || Boolean(routeAuthView))) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen, routeAuthView]);

  useEffect(() => {
    if (!(isOpen || Boolean(routeAuthView))) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeModal, isOpen, routeAuthView]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading("Signing in...");

    const result = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });

    toast.dismiss(toastId);

    if (!result?.ok || result?.error) {
      const isFraud = result?.error === "FRAUD_BLOCKED";

      if (isFraud) {
        Swal.fire({
          title: "ACCOUNT RESTRICTED",
          text: "Our security systems have flagged this account for suspicious activity. Access has been suspended to protect your assets.",
          icon: "error",
          background: "#0F172A",
          color: "#F8FAFC",
          confirmButtonColor: "#2C64FF",
          confirmButtonText: "Contact for Support",
          showCancelButton: true,
          cancelButtonText: "Close",
          backdrop: `rgba(5, 11, 20, 0.8) blur(8px)`,
          customClass: {
            popup: "rounded-[1.5rem] border border-red-500/30",
            title: "font-black tracking-widest text-red-500",
          },
        }).then((swalResult) => {
          if (swalResult.isConfirmed) {
            closeModal();
            router.push("/chat/support");
          }
        });
      } else {
        toast.custom((t) => (
          <div
            className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-[#0F172A]/95 backdrop-blur-xl border border-red-500/30 shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)] rounded-[1.2rem] pointer-events-auto overflow-hidden relative p-4 flex items-center gap-5`}
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/50 z-10">
              <Lock className="text-red-400" size={22} />
            </div>
            <div className="flex-1 z-10">
              <p className="text-[1em] font-black text-red-400 tracking-widest uppercase">
                <T>Access Denied</T>
              </p>
              <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">
                <T>Invalid security credentials.</T>
              </p>
            </div>
          </div>
        ));
      }
      return;
    }

    toast.custom((t) => (
      <div
        className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-[#0F172A]/95 backdrop-blur-xl border border-[#4DA1FF]/40 shadow-[0_0_40px_-10px_rgba(44,100,255,0.3)] rounded-[1.2rem] pointer-events-auto overflow-hidden relative p-4 flex items-center gap-5`}
      >
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#2C64FF] border border-[#4DA1FF]/50 z-10">
          <div className="absolute inset-0 bg-[#4DA1FF] animate-ping opacity-20 rounded-full"></div>
          <Unlock className="text-white" size={22} />
        </div>
        <div className="flex-1 z-10">
          <p className="text-[1em] font-black text-[#4DA1FF] tracking-widest uppercase">
            <T>Access Granted</T>
          </p>
          <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">
            <T>Identity confirmed. Routing...</T>
          </p>
        </div>
      </div>
    ));

    const userRes = await fetch(`/api/user/update?email=${loginEmail}`);
    const userData = await userRes.json();

    closeModal();

    setTimeout(() => {
      if (userData?.role?.toLowerCase() === "admin") {
        router.push("/adminDashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    }, 800);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerName || !registerEmail || !registerPassword) {
      toast.error("Please fill in all fields!");
      return;
    }

    const toastId = toast.loading("Creating account...");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await res.json();
      toast.dismiss(toastId);

      if (!res.ok) {
        toast.error(data.message || "Could not create account!");
        return;
      }

      toast.success("Account created successfully.");

      const signInResult = await signIn("credentials", {
        email: registerEmail,
        password: registerPassword,
        redirect: false,
      });

      closeModal();

      if (signInResult?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error("Account created, please login to continue.");
        setView("login");
        setIsOpen(true);
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Server connection failed!");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Could not send reset code.");
        return;
      }

      toast.success(data.message || "Reset code sent.");

      if (data.resetToken) {
        toast.success(`Reset Code: ${data.resetToken}`, { duration: 10000 });
      }

      closeModal();
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(forgotEmail)}`);
      }, 500);
    } catch {
      toast.error("A server error occurred!");
    } finally {
      setForgotLoading(false);
    }
  };

  const isModalOpen = isOpen || Boolean(routeAuthView);
  const currentView = routeAuthView ?? view;

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close auth modal"
        onClick={closeModal}
        className="absolute inset-0 z-0 bg-linear-to-br from-[#02050b]/80 via-[#0b1220]/70 to-[#1f2937]/70 backdrop-blur-md"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-b from-[#ffffff] to-[#f2f7ff] p-6 text-slate-900 shadow-[0_30px_100px_rgba(2,6,23,0.45)] animate-in fade-in zoom-in-95 duration-300 dark:border-slate-700/70 dark:from-[#0b1220] dark:to-[#0f172a] dark:text-slate-100">
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[#7aa2ff]/25 blur-3xl dark:bg-[#3b82f6]/20" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-[#22d3ee]/20 blur-3xl dark:bg-[#38bdf8]/10" />

        <button
          type="button"
          onClick={closeModal}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="relative mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#5f86ff] to-[#2C64FF] shadow-[0_8px_22px_rgba(44,100,255,0.45)] ring-1 ring-white/60 dark:ring-blue-300/20">
            <Shield className="text-white" size={26} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {currentView === "login" ? (
              <T>Welcome back</T>
            ) : currentView === "register" ? (
              <T>Create Account</T>
            ) : (
              <T>Forgot your password?</T>
            )}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {currentView === "login" ? (
              <T>Please enter your details to sign in.</T>
            ) : currentView === "register" ? (
              <T>Join NovaPay with your email and password.</T>
            ) : (
              <T>Enter your email and we will send a reset code.</T>
            )}
          </p>
        </div>

        {currentView !== "forgot" ? (
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800/70">
            <button
              type="button"
              onClick={() => setView("login")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                currentView === "login"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <T>Sign In</T>
            </button>
            <button
              type="button"
              onClick={() => setView("register")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                currentView === "register"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <T>Sign Up</T>
            </button>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <button
              type="button"
              onClick={() => setView("login")}
              className="text-sm font-semibold text-slate-700 underline underline-offset-4 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <T>Back to Sign In</T>
            </button>
          </div>
        )}

        {currentView === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span className="inline-flex items-center gap-2">
                <FcGoogle size={18} /> <T>Continue with Google</T>
              </span>
            </button>

            <input
              type="email"
              value={loginEmail}
              onFocus={() => setActiveField("text")}
              onBlur={() => setActiveField("none")}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2C64FF] focus:ring-2 focus:ring-[#2C64FF]/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-400"
              required
            />

            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                value={loginPassword}
                onFocus={() => setActiveField("password")}
                onBlur={() => setActiveField("none")}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2C64FF] focus:ring-2 focus:ring-[#2C64FF]/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
                <T>Remember me</T>
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(loginEmail);
                  setView("forgot");
                }}
                className="font-semibold text-slate-800 hover:underline dark:text-slate-100"
              >
                <T>Forgot password?</T>
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-linear-to-r from-[#111827] to-[#020617] py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(15,23,42,0.35)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.45)]"
            >
              <T>Sign In</T>
            </button>
          </form>
        ) : currentView === "register" ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span className="inline-flex items-center gap-2">
                <FcGoogle size={18} /> <T>Continue with Google</T>
              </span>
            </button>

            <input
              type="text"
              value={registerName}
              onFocus={() => setActiveField("text")}
              onBlur={() => setActiveField("none")}
              onChange={(e) => setRegisterName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2C64FF] focus:ring-2 focus:ring-[#2C64FF]/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-400"
              required
            />
            <input
              type="email"
              value={registerEmail}
              onFocus={() => setActiveField("text")}
              onBlur={() => setActiveField("none")}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2C64FF] focus:ring-2 focus:ring-[#2C64FF]/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-400"
              required
            />
            <div className="relative">
              <input
                type={showRegisterPassword ? "text" : "password"}
                value={registerPassword}
                onFocus={() => setActiveField("password")}
                onBlur={() => setActiveField("none")}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2C64FF] focus:ring-2 focus:ring-[#2C64FF]/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
              >
                {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {activeField === "password" && registerPassword.length > 0 && (
              <div className="space-y-1.5">
                <div className="grid grid-cols-4 gap-1">
                  <div className={`h-1.5 rounded-full ${registerStrength >= 1 ? "bg-red-400" : "bg-slate-200"}`}></div>
                  <div className={`h-1.5 rounded-full ${registerStrength >= 2 ? "bg-yellow-400" : "bg-slate-200"}`}></div>
                  <div className={`h-1.5 rounded-full ${registerStrength >= 3 ? "bg-green-500" : "bg-slate-200"}`}></div>
                  <div className={`h-1.5 rounded-full ${registerStrength >= 4 ? "bg-emerald-600" : "bg-slate-200"}`}></div>
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <T>{strengthLabel(registerStrength)}</T>
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-linear-to-r from-[#2c64ff] via-[#3b82f6] to-[#4d84ff] py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(44,100,255,0.35)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(44,100,255,0.5)]"
            >
              <T>Create account</T>
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-300 bg-white/90 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2C64FF] focus:ring-2 focus:ring-[#2C64FF]/20 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full rounded-xl bg-linear-to-r from-[#2c64ff] via-[#3b82f6] to-[#4d84ff] py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(44,100,255,0.35)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(44,100,255,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {forgotLoading ? <T>Sending...</T> : <T>Send Reset Code</T>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

