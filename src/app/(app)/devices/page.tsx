"use client";

import Link from "next/link";
import { useState } from "react";
import { useRelay } from "@/lib/relayContext";
import { api } from "@/lib/api";

function LinkPcForm({ onDone }: { onDone: () => void }) {
  const { auth, refreshDevices } = useRelay();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linked, setLinked] = useState<string | null>(null);

  const digits = code.replace(/\D/g, "").slice(0, 6);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth || digits.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const { pc } = await api.linkPc(auth.serverUrl, auth.sessionToken, digits);
      setLinked(pc.name);
      setCode("");
      // Give the agent a moment to pick up its credentials and connect.
      setTimeout(refreshDevices, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't link that PC.");
    } finally {
      setBusy(false);
    }
  };

  if (linked) {
    return (
      <div className="rounded-2xl bg-[#12261f] border border-[#1f4a3a] p-4 mb-6 text-sm">
        <p className="font-semibold">“{linked}” is linked to your account.</p>
        <p className="text-[#b7bec9] mt-1">It will show up as online in a few seconds.</p>
        <button onClick={onDone} className="mt-3 text-[#8fb0f5] hover:text-[#b5ccfa]">Done</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-[#171b22] border border-[#262b35] p-4 mb-6 flex flex-col gap-3">
      <div>
        <p className="font-semibold">Link a PC</p>
        <p className="text-sm text-[#8a93a3] mt-1">
          Open Home Relay Agent on the PC. It shows a 6-digit code. Type it here within 10 minutes.
        </p>
      </div>
      <input
        autoFocus
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123 456"
        value={digits.length > 3 ? `${digits.slice(0, 3)} ${digits.slice(3)}` : digits}
        onChange={(e) => setCode(e.target.value)}
        className="rounded-lg bg-[#0f1217] border border-[#262b35] px-3 py-3 outline-none focus:border-[#5b8def] text-2xl tracking-[0.3em] text-center font-mono"
      />
      {error && <p className="text-sm text-[#f28b82]">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy || digits.length !== 6}
          className="flex-1 rounded-lg bg-[#2f6fed] hover:bg-[#4b82f0] disabled:opacity-50 transition-colors py-2.5 font-semibold text-sm"
        >
          {busy ? "Linking…" : "Link PC"}
        </button>
        <button type="button" onClick={onDone} className="px-4 rounded-lg border border-[#262b35] text-sm text-[#b7bec9] hover:border-[#3a4150]">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function DevicesPage() {
  const { auth, devices, connect, signOut, refreshDevices } = useRelay();
  const [linking, setLinking] = useState(false);

  const unlink = async (id: string, name: string) => {
    if (!auth) return;
    // Plain confirm() is fine here: this page is used directly by a person.
    if (!window.confirm(`Unlink “${name}”? It will need a new code to be linked again.`)) return;
    await api.unlinkPc(auth.serverUrl, auth.sessionToken, id).catch(() => {});
    refreshDevices();
  };

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 max-w-2xl w-full mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Your PCs</h1>
          <p className="text-sm text-[#8a93a3] mt-1 truncate">Signed in as {auth?.email}</p>
        </div>
        <div className="flex items-center gap-3 pt-1 shrink-0">
          {!linking && (
            <button onClick={() => setLinking(true)} className="text-sm font-semibold text-[#8fb0f5] hover:text-[#b5ccfa]">
              + Link a PC
            </button>
          )}
          <button onClick={() => void signOut()} className="text-xs text-[#6b7280] hover:text-[#b7bec9]">
            Sign out
          </button>
        </div>
      </div>

      {linking && <LinkPcForm onDone={() => setLinking(false)} />}

      {devices.length === 0 ? (
        !linking && (
          <div className="mt-12 text-center text-sm text-[#8a93a3] leading-relaxed">
            <p>No PCs linked yet.</p>
            <p className="mt-1">Install Home Relay Agent on your PC, then press “Link a PC” and enter the code it shows.</p>
            <button
              onClick={() => setLinking(true)}
              className="mt-5 rounded-lg bg-[#2f6fed] hover:bg-[#4b82f0] transition-colors px-5 py-2.5 font-semibold text-sm text-white"
            >
              Link a PC
            </button>
          </div>
        )
      ) : (
        <ul className="flex flex-col gap-3">
          {devices.map((pc) => (
            <li key={pc.id} className="relative">
              <Link
                href={`/remote/${pc.id}`}
                onClick={(e) => {
                  if (!pc.online) return e.preventDefault();
                  connect(pc.id);
                }}
                aria-disabled={!pc.online}
                className={`block rounded-2xl bg-[#171b22] border border-[#262b35] p-4 transition-colors ${
                  pc.online ? "hover:border-[#3a4150]" : "opacity-70 cursor-default"
                }`}
              >
                <div className="flex items-center justify-between gap-3 pr-16">
                  <span className="font-semibold truncate">{pc.name}</span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      pc.online ? "bg-[#123227] text-[#d7dbe3]" : "bg-[#262b35] text-[#d7dbe3]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pc.online ? "#3ee6ab" : "#6b7280" }} />
                    {pc.online ? "Online" : "Offline"}
                  </span>
                </div>
                <p className="text-sm text-[#b7bec9] mt-2">
                  {pc.lanDevices.length} device{pc.lanDevices.length === 1 ? "" : "s"} on its network
                </p>
                <p className="text-xs text-[#6b7280] mt-0.5">Last seen {new Date(pc.lastSeen).toLocaleString()}</p>
              </Link>
              <button
                onClick={() => void unlink(pc.id, pc.name)}
                className="absolute top-4 right-4 text-xs text-[#6b7280] hover:text-[#f28b82]"
              >
                Unlink
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
