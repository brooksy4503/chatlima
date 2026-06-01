import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  FileText,
  Gauge,
  Globe2,
  KeyRound,
  MessageSquare,
  Search,
  Server,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const title = "ChatLima - AI Chat With 300+ Models, Web Search, Files, and MCP Tools";
const description =
  "ChatLima brings 300+ AI models, web search, file uploads, MCP tools, presets, and transparent credit-based pricing into one chat app.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "https://www.chatlima.com/",
    siteName: "ChatLima",
    images: [
      {
        url: "https://www.chatlima.com/opengraph-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://www.chatlima.com/twitter-image.png"],
  },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ChatLima",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  description,
  url: "https://www.chatlima.com/",
  offers: [
    {
      "@type": "Offer",
      name: "Monthly Plan",
      price: "9",
      priceCurrency: "USD",
      url: "https://www.chatlima.com/upgrade",
    },
    {
      "@type": "Offer",
      name: "Yearly Plan",
      price: "90",
      priceCurrency: "USD",
      url: "https://www.chatlima.com/upgrade",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is ChatLima?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChatLima is a multi-model AI chat app with 300+ models, web search, file uploads, presets, and MCP tool integrations.",
      },
    },
    {
      "@type": "Question",
      name: "How does ChatLima pricing work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChatLima offers monthly and yearly subscriptions with credit-based usage. Model credit costs are shown per model, and users can also bring their own provider API key.",
      },
    },
  ],
};

const modelProviders = ["OpenRouter", "Requesty", "OpenAI", "Anthropic", "Groq", "XAI"];

const featureGroups = [
  {
    icon: Brain,
    title: "Model choice without app switching",
    description:
      "Use 300+ models across major providers, then compare and favorite the ones that fit each task.",
  },
  {
    icon: Search,
    title: "Fresh answers when search matters",
    description:
      "Enable web search on supported models for current research, planning, and source-aware exploration.",
  },
  {
    icon: FileText,
    title: "Files, images, presets, and projects",
    description:
      "Bring documents, images, reusable instructions, and project context into the same chat workflow.",
  },
  {
    icon: Server,
    title: "MCP tools for power users",
    description:
      "Connect MCP servers with OAuth support so ChatLima can work with external tools and data sources.",
  },
];

const facts = [
  { value: "300+", label: "AI models" },
  { value: "1-30", label: "credits per message by model tier" },
  { value: "$9", label: "monthly plan" },
  { value: "$90", label: "yearly plan" },
];

export default function MarketingHomePage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold" aria-label="ChatLima home">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6" priority />
            </span>
            <span>ChatLima</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/models" className="hover:text-foreground">
              Models
            </Link>
            <Link href="/compare" className="hover:text-foreground">
              Compare
            </Link>
            <Link href="/faq" className="hover:text-foreground">
              FAQ
            </Link>
            <Link href="/upgrade" className="hover:text-foreground">
              Pricing
            </Link>
          </div>
          <Button asChild size="sm">
            <Link href="/chat">
              Open Chat
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Multi-model AI chat for paid, everyday use
          </div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            One AI chat app for 300+ models, tools, and transparent credits.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            ChatLima combines model switching, web search, files, presets, MCP tools,
            and credit-aware pricing so you can choose the right AI model without
            juggling separate apps.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/chat">
                Start Chatting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/upgrade">View Pricing</Link>
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-md border border-border bg-card p-3">
                <div className="text-2xl font-semibold">{fact.value}</div>
                <div className="mt-1 text-xs leading-5 text-muted-foreground">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">ChatLima workspace</div>
            </div>
            <div className="grid min-h-[460px] grid-cols-[150px_1fr] sm:grid-cols-[210px_1fr]">
              <aside className="border-r border-border bg-muted/30 p-3">
                <div className="mb-3 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                  New Chat
                </div>
                <div className="space-y-2">
                  {["Model comparison", "Research brief", "Code review"].map((item) => (
                    <div key={item} className="rounded-md border border-border bg-background px-3 py-2 text-xs">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
                  <div className="mb-2 font-medium text-foreground">Credits</div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-2/3 rounded-full bg-primary" />
                  </div>
                  <div className="mt-2">Model costs visible before you send.</div>
                </div>
              </aside>
              <div className="flex flex-col bg-background">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold">Claude Sonnet 4.5</div>
                    <div className="text-xs text-muted-foreground">Reasoning, files, web search</div>
                  </div>
                  <div className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                    5 credits
                  </div>
                </div>
                <div className="flex-1 space-y-4 p-4">
                  <div className="max-w-[84%] rounded-md bg-muted p-3 text-sm">
                    Compare three models for a product strategy memo and include current sources.
                  </div>
                  <div className="ml-auto max-w-[88%] rounded-md border border-border bg-card p-3 text-sm shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
                      <Globe2 className="h-3.5 w-3.5" />
                      Web search enabled
                    </div>
                    I&apos;ll use a reasoning model for synthesis, a fast model for alternatives,
                    and a lower-credit model for draft expansion.
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {modelProviders.slice(0, 3).map((provider) => (
                      <div key={provider} className="rounded-md border border-border bg-card p-3 text-xs">
                        <div className="font-medium">{provider}</div>
                        <div className="mt-1 text-muted-foreground">Available in catalog</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border p-4">
                  <div className="rounded-md border border-input bg-card px-3 py-3 text-sm text-muted-foreground">
                    Send a message...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-6 lg:px-8">
          {modelProviders.map((provider) => (
            <div key={provider} className="rounded-md border border-border bg-card px-4 py-3 text-center text-sm font-medium">
              {provider}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">
            Built for people who actually compare and use AI models.
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            ChatLima turns model variety into a practical workflow: pick the model,
            see the credit tier, add context, and keep the conversation moving.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureGroups.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <feature.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">
              Transparent credits, flexible access.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Both subscriptions include the full model catalog while credits remain.
              Each model shows its cost tier, and BYOK access is available when you
              want to use your own provider key.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Monthly plan: $9/month with about 1,000 credits per month.",
                "Yearly plan: $90/year with a high annual usage allowance.",
                "Model picker shows per-message credit cost from economy to frontier models.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <Check className="mt-1 h-5 w-5 flex-none text-primary" />
                  <p className="leading-7 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-lg border border-border bg-background p-6">
              <WalletCards className="h-7 w-7 text-primary" />
              <h3 className="mt-5 text-xl font-semibold">Monthly</h3>
              <p className="mt-2 text-3xl font-bold">$9</p>
              <p className="mt-2 text-sm text-muted-foreground">Billed monthly</p>
              <Button asChild className="mt-6 w-full">
                <Link href="/upgrade">Choose Monthly</Link>
              </Button>
            </article>
            <article className="rounded-lg border-2 border-primary bg-background p-6">
              <Gauge className="h-7 w-7 text-primary" />
              <h3 className="mt-5 text-xl font-semibold">Yearly</h3>
              <p className="mt-2 text-3xl font-bold">$90</p>
              <p className="mt-2 text-sm text-muted-foreground">Save about 17%</p>
              <Button asChild className="mt-6 w-full">
                <Link href="/upgrade">Choose Yearly</Link>
              </Button>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">
              Explore before you subscribe.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              The model catalog, comparison pages, and FAQ give potential users a clear
              view of what ChatLima supports before checkout.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/models", icon: MessageSquare, title: "Model catalog" },
              { href: "/compare", icon: Brain, title: "Compare models" },
              { href: "/faq", icon: KeyRound, title: "Billing FAQ" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted/40"
              >
                <item.icon className="h-6 w-6 text-primary" />
                <div className="mt-4 font-semibold">{item.title}</div>
                <div className="mt-4 inline-flex items-center text-sm text-primary">
                  Open
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={20} height={20} />
            <span>ChatLima</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/chat" className="hover:text-foreground">
              Open Chat
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
