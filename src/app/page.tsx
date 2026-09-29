import Link from "next/link";
import type { ReactNode } from "react";
import { downloads } from "@/config/downloads";
import { QrCode } from "@/components/landing/QrCode";
import { AgentDownloadButton } from "@/components/landing/AgentDownloadButton";
import { HeroArt } from "@/components/landing/HeroArt";
import {
  DownloadIcon,
  FolderIcon,
  KeyIcon,
  LinkIcon,
  LockIcon,
  MonitorIcon,
  PointerIcon,
  ShieldIcon,
  WifiIcon,
} from "@/components/landing/icons";

// ---------------------------------------------------------------- building blocks

function Section({ id, eyebrow, title, intro, children }: { id?: string; eyebrow: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 px-4 sm:px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3ee6ab]">{eyebrow}</p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-balance max-w-2xl">{title}</h2>
        {intro && <p className="mt-4 max-w-2xl text-[#9aa3b2] text-lg leading-relaxed text-pretty">{intro}</p>}
        <div className="mt-10 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#232833] bg-[#12151b] p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a2233] text-[#8fb0f5]">{icon}</div>
      <h3 className="mt-4 font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#9aa3b2]">{children}</p>
    </div>
  );
}

function ComingSoon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#2c323d] px-5 py-3 text-sm font-semibold text-[#6b7280] cursor-not-allowed select-none">
      {children}
    </span>
  );
}

// ---------------------------------------------------------------- page

const steps = [
  {
    title: "Install the agent on your PC",
    body: "Download Home Relay Agent for Windows or Mac and run it. It sits quietly in the background.",
  },
  {
    title: "Create your account",
    body: "Open the phone app (or this website) and sign up with your email and a password.",
  },
  {
    title: "Link with a 6-digit code",
    body: "The agent shows a code on your PC. Type it into the app once — your PC is now linked for good.",
  },
];

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "Does my computer need to stay on?",
    a: "Yes. Your PC needs to be switched on, awake, and connected to the internet with the agent running. If it’s asleep or off, it shows as “Offline” in the app.",
  },
  {
    q: "Can I use it when I’m away from home?",
    a: "Yes — that’s the point. Your phone and PC find each other through our server from any network, then connect directly to each other.",
  },
  {
    q: "Do you see or store my screen or files?",
    a: "No. The server only helps your phone and PC find each other. The video, your mouse and keyboard input, and file transfers go straight between your devices over an encrypted connection and are never stored.",
  },
  {
    q: "What do I need to allow on a Mac?",
    a: (
      <>
        macOS asks for two permissions the first time: <b className="text-[#d7dbe3]">Screen Recording</b> (so the app can show your screen) and{" "}
        <b className="text-[#d7dbe3]">Accessibility</b> (so it can move the mouse and type). You’ll find both in System Settings → Privacy &amp; Security.
      </>
    ),
  },
  ...(downloads.agentUnsigned
    ? [
        {
          q: "Windows says “Windows protected your PC”. Is that normal?",
          a: "For now, yes. The installer isn’t signed with a publisher certificate yet, so Windows warns about every new app like this. Click “More info”, then “Run anyway”. On a Mac, right-click the app and choose “Open” the first time.",
        },
      ]
    : []),
  {
    q: "Can I link more than one PC?",
    a: "Yes. Install the agent on each computer and link each one with its own code. They all show up in your list.",
  },
  {
    q: "How do I remove a PC or a phone?",
    a: "Unlink the PC from your list in the app (on the phone, long-press it). To sign a phone or browser out, use “Sign out” — it stops working immediately, even if someone copied it.",
  },
];

export default function HomePage() {
  const android = downloads.android;
  const ios = downloads.ios;

  return (
    <div className="flex-1 bg-[#0c0d10] text-[#f2f4f8]">
      {/* ------------------------------------------------------------ header */}
      <header className="sticky top-0 z-20 border-b border-[#1a1e26] bg-[#0c0d10]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f6fed] text-white">
              <MonitorIcon width={18} height={18} />
            </span>
            Home Relay
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-[#9aa3b2]">
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#security" className="hover:text-white">Security</a>
            <a href="#download" className="hover:text-white">Download</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <Link href="/devices" className="btn-secondary !py-2 !px-4">
            Open web app
          </Link>
        </div>
      </header>

      <main>
        {/* ---------------------------------------------------------- hero */}
        <section className="px-4 sm:px-6 pt-14 sm:pt-20 pb-10">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#1f4a3a] bg-[#0f2019] px-3 py-1 text-xs font-medium text-[#3ee6ab]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3ee6ab]" /> Windows · Mac · Android · iPhone · Web
              </p>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-balance">
                Your home PC, <span className="text-[#8fb0f5]">right in your pocket.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#9aa3b2] text-pretty">
                See your computer’s screen live, control the mouse and keyboard, and grab any file — from your phone or any
                browser, wherever you are. Set up in two minutes, no router settings.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <AgentDownloadButton />
                <a href="#download" className="btn-secondary">Get the phone app</a>
              </div>
              <p className="mt-4 text-sm text-[#6b7280]">
                Already set up?{" "}
                <Link href="/devices" className="text-[#8fb0f5] hover:text-[#b5ccfa]">
                  Sign in to the web app →
                </Link>
              </p>
            </div>
            <div className="mx-auto w-full max-w-lg">
              <HeroArt />
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- how it works */}
        <Section id="how" eyebrow="How it works" title="Three steps, then just tap your PC" intro="Home Relay has two parts: a small agent that runs on your computer, and an app on your phone (or this website) that you use to reach it.">
          <ol className="grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="relative rounded-2xl border border-[#232833] bg-[#12151b] p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f6fed] text-sm font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 font-semibold text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9aa3b2]">{step.body}</p>
              </li>
            ))}
          </ol>

          {/* the link code, shown the way the agent shows it */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-[#232833] bg-gradient-to-r from-[#12151b] to-[#101a2b] p-6">
            <div className="shrink-0 rounded-xl border border-[#262b35] bg-[#0c0d10] px-6 py-4 text-center">
              <div className="text-xs text-[#8a93a3]">Your link code</div>
              <div className="mt-1 whitespace-nowrap font-mono text-3xl font-semibold tracking-[0.2em]">482 915</div>
            </div>
            <p className="text-sm leading-relaxed text-[#9aa3b2] text-center sm:text-left">
              This is what the agent shows on your PC. Codes work once and expire after 10 minutes, so there’s no password to
              remember for your computer and nothing for anyone else to guess.
            </p>
          </div>
        </Section>

        {/* ------------------------------------------------------ features */}
        <Section id="features" eyebrow="What you can do" title="Everything you’d do sitting at your desk">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card icon={<MonitorIcon />} title="See your screen live">
              Your PC’s screen streams to your phone in real time, sharp enough to read.
            </Card>
            <Card icon={<PointerIcon />} title="Take control">
              Tap to click, drag to move the mouse, scroll, and type on your computer’s keyboard.
            </Card>
            <Card icon={<FolderIcon />} title="Grab any file">
              Browse your folders and drives and download what you need straight to your phone.
            </Card>
            <Card icon={<WifiIcon />} title="See your home network">
              Check which devices are connected to your home Wi-Fi, from anywhere.
            </Card>
          </div>
        </Section>

        {/* ------------------------------------------------------ security */}
        <Section id="security" eyebrow="Security" title="Private by design" intro="Remote control is powerful, so Home Relay is built so that only you can reach your computer.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card icon={<LockIcon />} title="Only your PCs">
              Your account sees only the computers you linked. Nobody else can find or connect to them.
            </Card>
            <Card icon={<KeyIcon />} title="A key per device">
              Every PC, phone and browser gets its own secret key. Your password is never stored — only a secure hash of it.
            </Card>
            <Card icon={<LinkIcon />} title="Direct & encrypted">
              Your screen, input and files travel directly between your devices over an encrypted connection and are never saved.
            </Card>
            <Card icon={<ShieldIcon />} title="Lost your phone?">
              Sign it out or unlink a PC from any device and it stops working instantly. Password guessing is blocked too.
            </Card>
          </div>
        </Section>

        {/* ------------------------------------------------------ download */}
        <Section id="download" eyebrow="Download" title="Get Home Relay" intro="Install the agent on the computer you want to reach, and the app on the phone you’ll use to reach it.">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* desktop */}
            <div className="rounded-2xl border border-[#232833] bg-[#12151b] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a2233] text-[#8fb0f5]"><MonitorIcon /></div>
                <div>
                  <h3 className="font-semibold text-lg">For your computer</h3>
                  <p className="text-sm text-[#8a93a3]">Home Relay Agent · version {downloads.agentVersion}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                {([
                  ["Windows", downloads.windows],
                  ["Mac", downloads.mac],
                ] as const).map(([name, item]) => (
                  <div key={name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#232833] bg-[#0f1217] p-4">
                    <div>
                      <div className="font-semibold">{name}</div>
                      <div className="text-xs text-[#6b7280] mt-0.5">{item.fileLabel}</div>
                    </div>
                    {item.url ? (
                      <a href={item.url} className="btn-primary shrink-0" download>
                        <DownloadIcon /> Download for {name}
                      </a>
                    ) : (
                      <ComingSoon>Coming soon</ComingSoon>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-[#8a93a3]">
                After installing, the agent shows a 6-digit code. Keep it open, then link it from the app.
                {downloads.agentUnsigned && " Windows or macOS may warn about an unknown publisher the first time — see the FAQ below."}
              </p>

              <div className="mt-5 rounded-xl border border-[#232833] bg-[#0f1217] p-4 text-sm leading-relaxed text-[#9aa3b2]">
                <div className="font-semibold text-[#d7dbe3]">On a Mac?</div>
                The first time, macOS asks you to allow <b className="text-[#d7dbe3]">Screen Recording</b> and{" "}
                <b className="text-[#d7dbe3]">Accessibility</b> for Home Relay Agent in System Settings → Privacy &amp; Security.
                Without them your phone would see a black screen and couldn’t move the mouse.
              </div>
            </div>

            {/* phone */}
            <div className="rounded-2xl border border-[#232833] bg-[#12151b] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a2233] text-[#8fb0f5]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">For your phone</h3>
                  <p className="text-sm text-[#8a93a3]">Scan with your phone’s camera</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col items-center rounded-xl border border-[#232833] bg-[#0f1217] p-5 text-center">
                  <QrCode value={android.url} label="QR code linking to Home Relay on Google Play" />
                  <div className="mt-4 font-semibold">Android</div>
                  {android.published ? (
                    <a href={android.url} target="_blank" rel="noopener noreferrer" className="mt-3 btn-primary w-full">
                      Get it on Google Play
                    </a>
                  ) : (
                    <>
                      <div className="mt-1 text-xs text-[#6b7280]">Google Play · coming soon</div>
                      <div className="mt-3 text-xs text-[#6b7280]">This code will open the app once it’s live.</div>
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center rounded-xl border border-[#232833] bg-[#0f1217] p-5 text-center">
                  {ios.url ? (
                    <QrCode value={ios.url} label="QR code linking to Home Relay on the App Store" />
                  ) : (
                    <div className="flex h-[168px] w-[168px] items-center justify-center rounded-xl border border-dashed border-[#2c323d] text-sm text-[#6b7280]">
                      Coming soon
                    </div>
                  )}
                  <div className="mt-4 font-semibold">iPhone</div>
                  {ios.url ? (
                    <a href={ios.url} target="_blank" rel="noopener noreferrer" className="mt-3 btn-primary w-full">
                      Download on the App Store
                    </a>
                  ) : (
                    <div className="mt-1 text-xs text-[#6b7280]">App Store · coming soon</div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#1f2a44] bg-[#0f1624] p-4">
                <p className="text-sm text-[#b7bec9]">No app yet? Use Home Relay in any browser, on any device.</p>
                <Link href="/devices" className="btn-secondary shrink-0 !py-2">Open web app</Link>
              </div>
            </div>
          </div>
        </Section>

        {/* ----------------------------------------------------------- FAQ */}
        <Section id="faq" eyebrow="FAQ" title="Questions people ask">
          <div className="grid gap-3 max-w-3xl">
            {faqs.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-[#232833] bg-[#12151b] px-5 py-4 open:bg-[#141821]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-[#6b7280] transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#9aa3b2]">{item.a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------- final CTA */}
        <section className="px-4 sm:px-6 pb-24">
          <div className="mx-auto max-w-6xl rounded-3xl border border-[#1f2a44] bg-gradient-to-br from-[#12203d] to-[#0f1217] px-6 py-12 sm:px-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">Ready to reach your PC from anywhere?</h2>
            <p className="mx-auto mt-4 max-w-xl text-[#9aa3b2]">Install the agent, link it with a code, and your computer is one tap away.</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <AgentDownloadButton />
              <Link href="/devices" className="btn-secondary">Create an account</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1a1e26] px-4 sm:px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#6b7280]">
          <span>© {new Date().getFullYear()} Home Relay</span>
          <div className="flex gap-6">
            <a href="#download" className="hover:text-[#b7bec9]">Download</a>
            <a href="#faq" className="hover:text-[#b7bec9]">Help</a>
            <Link href="/devices" className="hover:text-[#b7bec9]">Web app</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
