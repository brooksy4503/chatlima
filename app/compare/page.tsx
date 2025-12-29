import { getAllPrebuiltComparisonSlugs } from '@/lib/models/model-priority';
import Link from 'next/link';
import { GitCompare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  return getAllPrebuiltComparisonSlugs().map(slug => ({ slug }));
}

export const dynamic = 'force-static';

export async function generateMetadata() {
  return {
    title: 'Compare AI Models - ChatLima',
    description: 'Compare AI models side-by-side to find the best model for your needs. Features, pricing, and capabilities comparison.',
    openGraph: {
      title: 'Compare AI Models - ChatLima',
      description: 'Compare AI models side-by-side to find the best model for your needs.',
      type: 'website',
      siteName: 'ChatLima',
    },
  };
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
          <div className="bg-primary/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <GitCompare className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Compare AI Models
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Compare models side-by-side to make informed decisions about which AI model is right for you
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Popular Comparisons
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { model1: 'GPT-5 Pro', model2: 'Claude 4', slug: 'openai-gpt-5-pro-vs-anthropic-claude-3-5-sonnet' },
              { model1: 'GPT-5 Pro', model2: 'Gemini 3', slug: 'openai-gpt-5-pro-vs-google-gemini-3-flash-preview' },
              { model1: 'Claude 4', model2: 'Gemini 3', slug: 'anthropic-claude-3-5-sonnet-vs-google-gemini-3-flash-preview' },
              { model1: 'GPT-5 Chat', model2: 'Claude 3.5', slug: 'openai-gpt-5-chat-vs-anthropic-claude-3-5-sonnet' },
              { model1: 'Devstral', model2: 'Olmo 3.1', slug: 'mistralai-devstral-2512-vs-allenai-olmo-3-1-32b-think-free' },
              { model1: 'MiMo V2', model2: 'Olmo 3.1', slug: 'openrouter-xiaomi-mimo-v2-flash-free-vs-allenai-olmo-3-1-32b-think-free' },
              { model1: 'GPT-5 Pro', model2: 'Gemini 2.5', slug: 'openai-gpt-5-pro-vs-openrouter-gemini-2-5-flash' },
            ].map(comp => (
              <Link
                key={comp.slug}
                href={`/compare/${comp.slug}`}
                className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {comp.model1}
                    </h3>
                    <span className="text-muted-foreground">vs</span>
                    <h3 className="text-lg font-semibold text-foreground">
                      {comp.model2}
                    </h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Compare features, pricing, and capabilities
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/models">
            <Button variant="outline" size="lg">
              Browse All Models
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
