import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Check,
  CircleDollarSign,
  Code2,
  Compass,
  FileText,
  Gauge,
  Globe2,
  Image as ImageIcon,
  KeyRound,
  Layers3,
  MessageSquare,
  MousePointerClick,
  PlugZap,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { HOMEPAGE_SEO } from "@/lib/seo/page-metadata";

const { title, description } = HOMEPAGE_SEO;
const schemaDescription =
  "ChatLima is a multi-model AI chat app for GPT, Claude, Gemini, DeepSeek and 300+ models with web search, files, MCP tools, and transparent credits.";

export const metadata: Metadata = {
  title: { absolute: title },
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
  description: schemaDescription,
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

const faqItems = [
  {
    question: "Why use ChatLima instead of ChatGPT?",
    answer:
      "ChatGPT is great for many tasks. ChatLima is for people who want options: multiple model families, web search, files, image understanding, MCP tools, presets, and transparent credit tiers in one workspace.",
  },
  {
    question: "Which AI models can I use?",
    answer:
      "ChatLima supports a broad catalog through OpenRouter, Requesty, OpenAI, Anthropic, Groq, and xAI, including GPT, Claude, Gemini, Grok, DeepSeek, Llama, Mistral, Qwen, and more.",
  },
  {
    question: "How does pricing work?",
    answer:
      "ChatLima has monthly and yearly subscriptions with credit-based usage. Models show their tier before you send, from Economy and Standard through Pro, Frontier, and Ultra.",
  },
  {
    question: "Can I bring my own API key?",
    answer:
      "Yes. Where supported, BYOK lets eligible provider usage bill directly to your provider account instead of consuming ChatLima credits for that provider.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const modelFamilies = ["GPT", "Claude", "Gemini", "Grok", "DeepSeek", "Llama", "Mistral", "Qwen"];

const proofPoints = [
  { value: "300+", label: "AI models" },
  { value: "1-30", label: "credits by model tier" },
  { value: "$9", label: "monthly plan" },
  { value: "BYOK", label: "where supported" },
];

const painPoints = [
  "You ask the same prompt in different tools just to compare answers.",
  "You never know which model is best for writing, coding, research, or reasoning.",
  "Subscriptions, model limits, browser tabs, files, and sources pile up fast.",
];

const features = [
  {
    icon: Layers3,
    title: "300+ models in one place",
    description:
      "Choose the right model for writing, coding, reasoning, research, vision, or creative work without jumping between AI apps.",
  },
  {
    icon: Search,
    title: "Web search when facts matter",
    description:
      "Use current web context for research, planning, and source-aware answers instead of stale guesses.",
  },
  {
    icon: FileText,
    title: "Files, images, and context",
    description:
      "Bring documents, screenshots, photos, diagrams, and reusable project context into the same chat.",
  },
  {
    icon: PlugZap,
    title: "MCP tools and services",
    description:
      "Connect supported MCP servers and external tools so ChatLima can work with more than plain text.",
  },
  {
    icon: Workflow,
    title: "Saved presets for repeat work",
    description:
      "Keep your favorite model, tool, and instruction setups ready for recurring research, writing, coding, and planning workflows.",
  },
  {
    icon: CircleDollarSign,
    title: "Transparent credit tiers",
    description:
      "See model credit costs before sending, from Economy and Standard through Pro, Frontier, and Ultra tiers.",
  },
  {
    icon: KeyRound,
    title: "Flexible access with BYOK",
    description:
      "Use ChatLima credits or, where supported, route eligible usage through your own provider key.",
  },
  {
    icon: Gauge,
    title: "Built for daily AI work",
    description:
      "Compare outputs, keep context together, and move from a rough question to a useful answer without a messy tab stack.",
  },
];

const useCases = [
  {
    icon: Compass,
    audience: "Indie hackers",
    text: "Research competitors, validate ideas, write landing pages, and plan launches.",
  },
  {
    icon: Code2,
    audience: "Developers",
    text: "Debug code, compare implementation ideas, explain errors, and generate snippets.",
  },
  {
    icon: FileText,
    audience: "Students and researchers",
    text: "Summarize sources, explain concepts, draft outlines, and search for current context.",
  },
  {
    icon: Sparkles,
    audience: "Creators",
    text: "Brainstorm hooks, write scripts, rewrite content, and fact-check claims in one flow.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Ask once",
    description: "Start with a prompt, file, screenshot, research question, coding problem, or idea.",
  },
  {
    step: "02",
    title: "Choose the right model or tool",
    description: "Switch model families, enable web search, connect MCP tools, add context, or use a saved preset.",
  },
  {
    step: "03",
    title: "Turn the answer into action",
    description: "Refine the result, continue the thread, save the useful setup, or move to the next task.",
  },
];

export default function MarketingHomePage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="relative">
        <div className="absolute left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
        <div className="absolute right-0 top-48 h-80 w-80 rounded-full bg-accent/25 blur-[120px]" />
        <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm">
              <Zap className="h-4 w-4 text-primary" />
              Multi-model AI chat for people who use AI every day
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
              ChatLima — use the best AI model for every task.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              One multi-model AI chat for GPT, Claude, Gemini, DeepSeek and hundreds more — with web search, MCP tools, files, image input, presets, BYOK where supported, and transparent credit tiers.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/chat">
                  Start chatting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/models">Browse models</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {["300+ models", "Web search", "MCP tools", "Files and images", "Qualified BYOK"].map((item) => (
                <div key={item} className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/25 via-transparent to-accent/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border bg-muted/35 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-destructive/80" />
                  <span className="h-3 w-3 rounded-full bg-accent" />
                  <span className="h-3 w-3 rounded-full bg-primary/80" />
                </div>
                <div className="text-xs font-medium text-muted-foreground">ChatLima workspace</div>
              </div>
              <div className="grid min-h-[500px] grid-cols-[126px_1fr] sm:grid-cols-[190px_1fr]">
                <aside className="border-r border-border bg-muted/25 p-3">
                  <div className="mb-3 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                    New chat
                  </div>
                  <div className="space-y-2">
                    {["Launch research", "Code review", "Writing pass"].map((item) => (
                      <div key={item} className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                    <div className="mb-2 font-medium text-foreground">Credits</div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 w-2/3 rounded-full bg-primary" />
                    </div>
                    <div className="mt-2">Model tiers visible before you send.</div>
                  </div>
                </aside>
                <div className="flex flex-col bg-background">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Launch research preset</div>
                      <div className="text-xs text-muted-foreground">Web search, files, MCP tools</div>
                    </div>
                    <div className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                      Pro tier
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 p-4">
                    <div className="rounded-xl border border-border bg-card p-3 text-xs shadow-sm">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">Selected model</span>
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">Active</span>
                      </div>
                      <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                        <div className="font-semibold text-foreground">Claude Sonnet 4.5</div>
                        <div className="mt-1 text-muted-foreground">Reasoning, strategy, files • Pro tier</div>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {[
                          { name: "GPT-5.2", detail: "structured drafting" },
                          { name: "Gemini 3.1", detail: "long context" },
                        ].map((model) => (
                          <div key={model.name} className="rounded-lg border border-border bg-background p-2 text-muted-foreground">
                            <div className="font-medium text-foreground">Switch to {model.name}</div>
                            <div className="mt-0.5">{model.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="max-w-[88%] rounded-xl border border-border bg-card p-3 text-sm text-foreground">
                      Plan the best launch strategy for my indie app. Search the web and give me a practical plan.
                    </div>
                    <div className="ml-auto max-w-[92%] rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-foreground shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
                        <Globe2 className="h-3.5 w-3.5" />
                        Web search enabled on the selected model
                      </div>
                      I&apos;ll use Claude for synthesis, search for current market context, then outline the highest-leverage launch path.
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3 text-sm text-foreground">
                      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Answer ready
                      </div>
                      Start with one narrow audience, ship a comparison page, capture emails, then run 10 direct outreach conversations before paid ads.
                    </div>
                  </div>
                  <div className="border-t border-border p-4">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-3 text-sm text-muted-foreground">
                      <span>Ask anything...</span>
                      <MousePointerClick className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-8 sm:grid-cols-2 sm:px-6 md:grid-cols-4 lg:grid-cols-8 lg:px-8">
          {modelFamilies.map((provider) => (
            <div key={provider} className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-medium text-foreground shadow-sm">
              {provider}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofPoints.map((point) => (
            <div key={point.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-3xl font-semibold text-primary">{point.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{point.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-medium uppercase text-primary">The problem</p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
              You should not need five tabs to get one great answer.
            </h2>
          </div>
          <div className="grid gap-3">
            {painPoints.map((point) => (
              <div key={point} className="rounded-2xl border border-border bg-card p-5 text-lg leading-8 text-foreground shadow-sm">
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase text-primary">Why ChatLima</p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
              Not another chatbot. A workspace for models, tools, and context.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Single-model chat is fine for casual questions. ChatLima is built for practical AI workflows where model choice, current context, MCP tools, files, and repeatable setups matter.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">Single-model chat apps</h3>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>One main model family</li>
                <li>Hard to compare answers</li>
                <li>Search and tools tied to one provider</li>
                <li>More copy-paste between apps</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/40 bg-primary/10 p-6 shadow-xl shadow-primary/10">
              <h3 className="text-lg font-semibold text-foreground">ChatLima</h3>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-foreground">
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-none text-primary" />Multiple model families</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-none text-primary" />Web search, files, images, and MCP tools</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-none text-primary" />Saved presets for repeat workflows</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-none text-primary" />Transparent credit tiers and BYOK where supported</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase text-primary">Capabilities</p>
          <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
            Built around the jobs people actually bring to AI.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            ChatLima turns model variety into a practical workflow: pick the model, add context, see the credit tier, enable the tools you need, and keep the conversation moving.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <feature.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-5 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-sm font-medium uppercase text-primary">Use cases</p>
              <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
                One place for the messy middle of AI work.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {useCases.map((item) => (
                <article key={item.audience} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <item.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{item.audience}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase text-primary">How it works</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">
            From question to answer in one flow.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {workflowSteps.map((item) => (
            <article key={item.step} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="font-mono text-sm text-primary">{item.step}</div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase text-primary">Pricing</p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
              Transparent credit tiers, flexible access.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Both subscriptions include the full model catalog while credits remain. Each model shows its tier before you send, and supported BYOK paths can route eligible usage to your own key.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                "Monthly plan: $9/month with about 1,000 credits per month.",
                "Yearly plan: $90/year with a high annual usage allowance.",
                "Web search, image generation, and higher-cost model tiers use credits only when selected.",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <Check className="mt-1 h-5 w-5 flex-none text-primary" />
                  <p className="leading-7 text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Gauge className="h-7 w-7 text-primary" />
              <h3 className="mt-5 text-xl font-semibold">Monthly</h3>
              <p className="mt-2 text-4xl font-semibold">$9</p>
              <p className="mt-2 text-sm text-muted-foreground">Billed monthly</p>
              <Button asChild className="mt-6 w-full">
                <Link href="/upgrade">Choose Monthly</Link>
              </Button>
            </article>
            <article className="rounded-2xl border border-primary/40 bg-primary/10 p-6 shadow-xl shadow-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
              <h3 className="mt-5 text-xl font-semibold">Yearly</h3>
              <p className="mt-2 text-4xl font-semibold">$90</p>
              <p className="mt-2 text-sm text-muted-foreground">Save about 17%</p>
              <Button asChild className="mt-6 w-full">
                <Link href="/upgrade">Choose Yearly</Link>
              </Button>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-medium uppercase text-primary">Trust</p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
              Clear enough to try. Flexible enough to grow with you.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              ChatLima keeps pricing, model choice, privacy pages, and provider options easy to inspect before you commit.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { href: "/models", icon: MessageSquare, title: "Browse the model catalog", text: "See supported models and capabilities." },
              { href: "/compare", icon: Brain, title: "Compare model options", text: "Explore model differences before choosing." },
              { href: "/privacy", icon: ShieldCheck, title: "Read the privacy policy", text: "Review data handling before you sign in." },
              { href: "/faq", icon: ImageIcon, title: "Check billing and usage FAQ", text: "Understand credits, tools, and access." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted/50"
              >
                <item.icon className="h-6 w-6 text-primary" />
                <div className="mt-4 font-semibold text-foreground">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                <div className="mt-4 inline-flex items-center text-sm text-primary">
                  Open
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase text-primary">FAQ</p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
              Questions people ask before switching.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">{item.question}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[130px]" />
        <div className="relative mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8 text-center shadow-2xl sm:p-12">
          <h2 className="text-4xl font-semibold sm:text-5xl">
            Ready to stop switching between AI apps?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Use multiple models, web search, MCP tools, files, and presets from one ChatLima workspace.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/chat">
                Start chatting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/upgrade">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

    </MarketingShell>
  );
}
