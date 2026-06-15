import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Code2,
  Zap,
  Quote,
  Palette,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlanCard } from "@/components/plan-card";
import { ChatMockup } from "@/components/marketing/chat-mockup";
import { getCurrentUser } from "@/lib/auth/session";
import { PLAN_ORDER, PLANS } from "@/lib/plans";
import { APP_NAME } from "@/lib/constants";

const FEATURES = [
  {
    icon: FileText,
    title: "Grounded in your content",
    body: "Every answer comes from the docs you upload — with the source cited. No made-up nonsense, no generic AI slop.",
  },
  {
    icon: Code2,
    title: "Embeddable in one line",
    body: "Drop a single script tag on your site. A polished chat bubble appears, themed to your brand.",
  },
  {
    icon: Zap,
    title: "Live in minutes",
    body: "Paste text, add a URL, or upload a PDF. Your assistant is ready the moment ingestion finishes.",
  },
  {
    icon: Quote,
    title: "Cited, trustworthy answers",
    body: "Customers see exactly which document an answer came from, so they can trust — and verify — it.",
  },
  {
    icon: Palette,
    title: "Your brand, not ours",
    body: "Set the welcome message, tone and accent color. Remove the badge on paid plans.",
  },
  {
    icon: ShieldCheck,
    title: "Answers only what it knows",
    body: "Ask something off-topic and it says so instead of guessing — exactly how good support behaves.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Add your knowledge",
    body: "Upload PDFs, paste FAQs, or point it at a help-center URL.",
  },
  {
    n: "2",
    title: "Make it yours",
    body: "Set the greeting, custom instructions and brand color.",
  },
  {
    n: "3",
    title: "Embed & go live",
    body: "Copy one snippet onto your site. Customers get instant answers.",
  },
];

const FAQS = [
  {
    q: "How does it know the answers?",
    a: "It reads the content you give it and retrieves the most relevant passages for each question, so answers stay grounded in your own material.",
  },
  {
    q: "Do I need to write any code?",
    a: "Only for the website widget — and that's a single line you paste once. Everything else is point-and-click.",
  },
  {
    q: "What can I upload?",
    a: "PDF, Markdown and plain-text files today, plus pasted text and public URLs.",
  },
  {
    q: "Can I use my own AI model?",
    a: "Yes — add an Anthropic or OpenAI key and answers come from that model. Without a key, it runs in a grounded preview mode.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <Link href="#features" className="hover:text-foreground">Features</Link>
            <Link href="#how" className="hover:text-foreground">How it works</Link>
            <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button render={<Link href="/dashboard" />}>Dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" render={<Link href="/login" />}>
                  Sign in
                </Button>
                <Button render={<Link href="/signup" />}>Start free</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <Zap className="size-3.5 text-primary" /> Support that ships with your docs
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                Your docs, answering customers in seconds.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground text-pretty">
                {APP_NAME} turns your help center, FAQs and guides into a support
                agent that answers customers 24/7 — inside your app and as a widget
                on your site. Set it up before lunch.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" render={<Link href="/signup" />}>
                  Start free <ArrowRight className="size-4" />
                </Button>
                <Button size="lg" variant="outline" render={<Link href="#how" />}>
                  See how it works
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                No credit card required. Free plan forever.
              </p>
            </div>
            <div className="lg:pl-8">
              <ChatMockup />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t bg-muted/20 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything you need to deflect support tickets
              </h2>
              <p className="mt-3 text-muted-foreground">
                Built for founders who&apos;d rather ship than answer the same
                question fifty times.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title} className="p-6">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">Live in three steps</h2>
              <p className="mt-3 text-muted-foreground">
                From a folder of docs to a working support agent on your site.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="mx-auto grid size-11 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                    {s.n}
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t bg-muted/20 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Simple pricing that scales with you
              </h2>
              <p className="mt-3 text-muted-foreground">
                Start free. Upgrade when your customers keep you busy.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
              {PLAN_ORDER.map((id) => (
                <PlanCard
                  key={id}
                  plan={PLANS[id]}
                  cta={
                    <Button
                      variant={PLANS[id].highlighted ? "default" : "outline"}
                      className="w-full"
                      render={<Link href="/signup" />}
                    >
                      {PLANS[id].priceMonthly === 0
                        ? "Start free"
                        : `Choose ${PLANS[id].name}`}
                    </Button>
                  }
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Questions, answered
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="flex items-start gap-2 font-medium">
                    <Check className="mt-1 size-4 shrink-0 text-primary" />
                    {f.q}
                  </h3>
                  <p className="mt-2 pl-6 text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="mx-auto max-w-4xl px-4 py-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              Give your customers answers, not a ticket queue.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Spin up your first chatbot in minutes — free, no card required.
            </p>
            <div className="mt-8">
              <Button size="lg" render={<Link href="/signup" />}>
                Start free <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <Logo href={null} />
          <p>© 2026 {APP_NAME}. A demo product.</p>
          <div className="flex gap-4">
            <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
