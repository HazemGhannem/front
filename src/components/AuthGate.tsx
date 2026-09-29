"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRelay } from "@/lib/relayContext";
import { api } from "@/lib/api";
import { DEFAULT_SERVER_URL, loadAuth, normalizeServerUrl } from "@/lib/authStorage";

const inputClass =
  "rounded-lg bg-[#171b22] border border-[#262b35] px-3 py-2.5 outline-none focus:border-[#5b8def] w-full";

/**
 * Sign-in / create-account screen shown until this browser has a session.
 * Signing in gives this browser its own revocable session token; the
 * password itself is never stored.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { auth, signIn } = useRelay();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => loadAuth()?.serverUrl ?? DEFAULT_SERVER_URL);
  const [showServer, setShowServer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (auth === undefined) return null; // first render, before localStorage is read
  if (auth) return <>{children}</>;

  const isRegister = mode === "register";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (isRegister && password.length < 8) return setError("Use at least 8 characters for your password.");
    setBusy(true);
    const server = normalizeServerUrl(serverUrl);
    try {
      const result = isRegister
        ? await api.register(server, email.trim(), password)
        : await api.login(server, email.trim(), password);
      // This component stays mounted while signed in, so reset the form now;
      // otherwise after "Sign out" it would reappear stuck on "Please wait…"
      // with the old password still filled in.
      setPassword("");
      setShowPassword(false);
      signIn({ serverUrl: server, sessionToken: result.token, email: result.user.email });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <form className="w-full max-w-sm flex flex-col gap-4" onSubmit={submit}>
        <Link href="/" className="text-sm text-[#6b7280] hover:text-[#b7bec9] self-start">
          ← Home Relay
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{isRegister ? "Create your account" : "Sign in"}</h1>
          <p className="text-sm text-[#8a93a3] mt-1">
            {isRegister ? "One account for all your PCs, from any browser or phone." : "Welcome back to Home Relay."}
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[#b7bec9]">Email</span>
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[#b7bec9]">Password</span>
          <div className="relative">
            <input
              className={`${inputClass} pr-16`}
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={isRegister ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#8a93a3] hover:text-[#d7dbe3] px-2 py-1"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {isRegister && <span className="text-xs text-[#6b7280]">At least 8 characters. A short phrase is easy to remember and hard to guess.</span>}
        </label>

        {showServer ? (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-[#b7bec9]">Server</span>
            <input
              className={inputClass}
              placeholder="https://relay.example.com"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
            />
          </label>
        ) : null}

        {error && <p className="text-sm text-[#f28b82] bg-[#2a1717] border border-[#4a2323] rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[#2f6fed] hover:bg-[#4b82f0] disabled:opacity-60 transition-colors py-2.5 font-semibold text-sm"
        >
          {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setMode(isRegister ? "signin" : "register");
              setError(null);
            }}
            className="text-[#8fb0f5] hover:text-[#b5ccfa]"
          >
            {isRegister ? "I already have an account" : "Create an account"}
          </button>
          <button type="button" onClick={() => setShowServer((v) => !v)} className="text-xs text-[#6b7280] hover:text-[#b7bec9]">
            {showServer ? "Hide server" : "Server settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
