import { MarketingShell } from '@/components/marketing-shell';

export const metadata = {
  title: 'FAQ — Credits, Models, Plans & BYOK',
  description:
    'ChatLima FAQ: how credits and plans work, which AI models you can use, BYOK, MCP tools, web search, and getting started free.',
};

export default function FAQPage() {
  return (
    <MarketingShell>
      <div className="w-full flex-1 overflow-y-auto">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-card border border-border rounded-lg shadow-sm p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>

            <p className="text-muted-foreground mb-8 italic">
              Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  What is ChatLima?
                </h2>
                <p className="text-card-foreground leading-relaxed">
                  ChatLima is a multi-model AI chat app with 300+ models from providers such as OpenRouter,
                  Requesty, OpenAI, Anthropic, Groq, and X AI. It includes presets, projects, file and image
                  uploads, web search, native URL fetching, and Model Context Protocol (MCP) tool integrations—
                  all in one interface. Subscribers do not need separate provider accounts; ChatLima handles routing
                  and billing through Polar.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  What&apos;s the difference between monthly and yearly plans?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Both paid plans include the same full model catalog (credit cost shown per model), web search on supported
                  OpenRouter models, and MCP server support. Choose monthly for flexibility or yearly for lower
                  total cost over 12 months. See the{' '}
                  <a href="/upgrade" className="text-primary hover:text-primary/80 underline">
                    upgrade page
                  </a>{' '}
                  for current pricing.
                </p>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      Monthly Plan ($9/month)
                    </h3>
                    <ul className="space-y-2 text-card-foreground">
                      <li>✓ About 1,000 credits per month on your Polar usage meter</li>
                      <li>✓ Full model catalog while credits remain (1–30 credits per message by model tier)</li>
                      <li>✓ Web search on eligible OpenRouter models</li>
                      <li>✓ MCP tools and presets</li>
                    </ul>
                    <p className="text-card-foreground mt-3 italic">
                      Best for: Power users and professionals who want frontier models and flexible monthly billing.
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      Yearly Plan ($90/year)
                    </h3>
                    <ul className="space-y-2 text-card-foreground">
                      <li>✓ ~12,000 credits per year on the same meter as monthly</li>
                      <li>✓ Same full catalog as monthly (per-message credit cost applies by model)</li>
                      <li>✓ Web search on eligible OpenRouter models</li>
                      <li>✓ MCP tools and presets</li>
                      <li>✓ Save about 17% compared to paying monthly for a full year</li>
                    </ul>
                    <p className="text-card-foreground mt-3 italic">
                      Best for: Regular users who want full access at the best annual price.
                    </p>
                  </div>
                </div>
                <p className="text-card-foreground leading-relaxed mt-4">
                  You can only have one active subscription at a time. Switching plans replaces the previous
                  subscription after checkout.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  How do credits work?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Monthly subscribers use a credit balance tied to Polar usage. Each chat message consumes
                  credits based on the model&apos;s pricing tier—not a flat “one message = one credit” for every
                  model. The model picker shows the credit cost per message so you can choose accordingly.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <ul className="space-y-2 text-card-foreground">
                    <li>• <strong>Economy</strong> (1 credit): everyday chat and lighter workloads</li>
                    <li>• <strong>Standard</strong> (2 credits): mid-tier frontier models</li>
                    <li>• <strong>Pro</strong> (5 credits): high-capability models</li>
                    <li>• <strong>Frontier</strong> (15 credits): very high-cost models</li>
                    <li>• <strong>Ultra</strong> (30 credits): top-tier reasoning models</li>
                  </ul>
                </div>
                <p className="text-card-foreground leading-relaxed mt-4">
                  The model picker shows each model&apos;s credit cost (e.g. <strong>1c</strong>, <strong>2c</strong>).
                  Both monthly and yearly plans use the same catalog; cost depends on the model you choose, not
                  your plan type. BYOK bypasses ChatLima credits for that provider.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  How do I choose a model?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Once you have a subscription or BYOK set up, open the model picker in chat. Every model shows
                  how many credits it uses per message (for example <strong>1c</strong> or <strong>5c</strong>).
                  Pick the model that fits your task—everyday questions often work well at 1 credit; complex
                  analysis or coding may use more.
                </p>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Browse the full catalog on the{' '}
                  <a href="/models" className="text-primary hover:text-primary/80 underline">
                    models page
                  </a>{' '}
                  or filter by &quot;Low cost&quot; or &quot;Higher cost&quot; to compare options.
                </p>
                <p className="text-card-foreground leading-relaxed">
                  If you run low on credits, switch to a lower-cost model, add a provider API key in Settings,
                  or review your plan on the{' '}
                  <a href="/upgrade" className="text-primary hover:text-primary/80 underline">
                    upgrade page
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  How does web search work?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  For supported OpenRouter models, turn on the globe toggle in the composer to enable web search.
                  ChatLima uses OpenRouter&apos;s agentic web search tools so the model can search and cite sources
                  during the reply. You must be signed in; the model must support web search.
                </p>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Web search costs <strong>5 credits per search invocation</strong> (billed from actual tool usage
                  during the response). If you use your own OpenRouter API key, web search is billed to your
                  OpenRouter account instead of ChatLima credits.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  What are MCP tools?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  MCP (Model Context Protocol) lets the AI call external tools you configure—databases, APIs,
                  automation platforms, custom scripts, and more. ChatLima supports SSE, stdio, and HTTP streamable
                  transports, plus OAuth 2.1 for servers that require sign-in.
                </p>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Common use cases:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <ul className="space-y-2 text-card-foreground">
                    <li>• Third-party integrations (e.g. Composio, Zapier-style workflows)</li>
                    <li>• Custom HTTP or stdio servers you run locally or in the cloud</li>
                    <li>• Authenticated remote MCP servers via OAuth</li>
                    <li>• Extending chat with domain-specific actions beyond plain text</li>
                  </ul>
                </div>
                <p className="text-card-foreground leading-relaxed mt-4">
                  Add and test servers under <strong>Settings → MCP Servers</strong> in the sidebar. MCP is
                  available to subscribers and to users who connect their own API keys (BYOK).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Can I try ChatLima without subscribing?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  To chat on ChatLima you need either an active subscription (monthly or yearly) or your own
                  provider API keys (BYOK). Sign in with Google, choose a plan on the{' '}
                  <a href="/upgrade" className="text-primary hover:text-primary/80 underline">
                    upgrade page
                  </a>
                  , or add keys under Settings → API Keys.
                </p>
                <p className="text-card-foreground leading-relaxed">
                  With BYOK, usage is billed by your provider and ChatLima credit limits do not apply for that
                  provider&apos;s models. See the BYOK section below for setup steps.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Do I need an OpenRouter account?
                </h2>
                <p className="text-card-foreground leading-relaxed">
                  No, not for a paid ChatLima subscription. We route requests and manage usage through our provider
                  integrations. You only need your own OpenRouter (or other provider) account if you choose BYOK for
                  direct billing and full model access from that provider.
                </p>
                <p className="text-card-foreground leading-relaxed mt-4">
                  ChatLima adds presets, projects, MCP, file uploads, web search, provider health checks, and a
                  unified chat experience you would not get from using a provider dashboard alone.
                </p>
              </section>

              <section id="byok-api-keys">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  How do I use my own API keys (BYOK)?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Bring Your Own Key lets you connect your own provider accounts. Supported providers in Settings:
                  OpenAI, Anthropic, Groq, X AI, OpenRouter, and Requesty.
                </p>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <h3 className="text-xl font-medium text-foreground mb-3">
                    Benefits of BYOK
                  </h3>
                  <ul className="space-y-2 text-card-foreground">
                    <li>• Billed directly by the provider you configure</li>
                    <li>• Access to models your provider account can use</li>
                    <li>• Bypasses ChatLima credit limits for that provider&apos;s models</li>
                    <li>• OpenRouter BYOK also bypasses ChatLima web search credit charges</li>
                  </ul>
                </div>
                <p className="text-card-foreground leading-relaxed mb-4">
                  <strong>How to configure BYOK:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-3 text-card-foreground ml-4">
                  <li>
                    Create an API key with your provider (e.g.{' '}
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">
                      OpenRouter Keys
                    </a>
                    , OpenAI, Anthropic, etc.).
                  </li>
                  <li>
                    In ChatLima, open <strong>Settings</strong> from the sidebar and go to the <strong>API Keys</strong> tab.
                  </li>
                  <li>Paste the key for each provider you want to use and save.</li>
                  <li>
                    The model list refreshes to reflect models available through your keys. Select a model from
                    that provider to route requests with your key.
                  </li>
                </ol>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h3 className="text-xl font-medium text-foreground mb-3">
                    Privacy notes
                  </h3>
                  <ul className="space-y-2 text-card-foreground">
                    <li>• Keys are stored in your browser&apos;s local storage, not on ChatLima servers</li>
                    <li>• You can remove or replace keys anytime from Settings</li>
                    <li>• Removing keys returns you to subscription-based access (if you have a plan)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Can I switch plans?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Yes. You can move between monthly and yearly at any time:
                </p>
                <ul className="list-disc list-inside space-y-2 text-card-foreground ml-4">
                  <li>Only one subscription is active at a time—the new plan replaces the old one after checkout</li>
                  <li>Changes take effect once Polar confirms your new subscription</li>
                </ul>
                <p className="text-card-foreground leading-relaxed mt-4">
                  Visit the{' '}
                  <a href="/upgrade" className="text-primary hover:text-primary/80 underline">
                    upgrade page
                  </a>{' '}
                  to choose a plan or manage billing.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  What happens if I cancel?
                </h2>
                <p className="text-card-foreground leading-relaxed">
                  You can cancel anytime with no penalty. Access continues until the end of the current billing
                  period. After that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-card-foreground ml-4 mt-4">
                  <li>You will not be charged for the next cycle</li>
                  <li>Chat history and account data are preserved</li>
                  <li>You can resubscribe or use BYOK later</li>
                </ul>
                <p className="text-card-foreground leading-relaxed mt-4">
                  Cancel from the subscription portal linked on the upgrade page, or contact support below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  How do I manage my subscription?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  From the{' '}
                  <a href="/upgrade" className="text-primary hover:text-primary/80 underline">
                    upgrade page
                  </a>
                  , use <strong>Manage Subscription</strong> (or &quot;Manage your subscription&quot; at the bottom) to open
                  the Polar customer portal. There you can view your plan, update payment methods, see billing
                  history, and cancel or change your subscription.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Still have questions?
                </h2>
                <div className="bg-muted p-6 rounded-lg">
                  <p className="text-card-foreground mb-4">
                    We&apos;re here to help:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Email:</span>
                      <a href="mailto:getchatlima@gmail.com" className="text-primary hover:text-primary/80">
                        getchatlima@gmail.com
                      </a>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Website:</span>
                      <a href="https://chatlima.com" className="text-primary hover:text-primary/80">
                        https://chatlima.com
                      </a>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      </div>
    </MarketingShell>
  );
}
