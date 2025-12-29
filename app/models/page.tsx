"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { fetchAllModels } from '@/lib/models/fetch-models';
import { modelIdToSlug } from '@/lib/models/slug-utils';
import { getModelsByCategory } from '@/lib/models/model-priority';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ModelsGrid } from '@/components/models-listing/models-grid';
import { ModelsFilter } from '@/components/models-listing/models-filter';

export default function ModelsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        const response = await fetchAllModels({ environment: {} });
        setModels(response.models);
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setLoading(false);
      }
    }

    loadModels();
  }, []);

  const categories = useMemo(() => {
    if (models.length === 0) {
      return {
        premium: [],
        free: [],
        vision: [],
        coding: [],
        reasoning: []
      };
    }
    return getModelsByCategory(models);
  }, [models]);

  const filteredModels = useMemo(() => {
    let filtered = models;

    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'free':
          filtered = models.filter((m: any) => m.id.endsWith(':free'));
          break;
        case 'premium':
          filtered = models.filter((m: any) => m.premium);
          break;
        case 'vision':
          filtered = models.filter((m: any) => m.vision);
          break;
        case 'coding':
          filtered = models.filter((m: any) =>
            m.capabilities.some((c: string) =>
              c.toLowerCase().includes('coding') || c.toLowerCase().includes('code')
            )
          );
          break;
        case 'reasoning':
          filtered = models.filter((m: any) =>
            m.capabilities.some((c: string) =>
              c.toLowerCase().includes('reasoning') || c.toLowerCase().includes('thinking')
            )
          );
          break;
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((m: any) =>
        m.name.toLowerCase().includes(term) ||
        m.provider.toLowerCase().includes(term) ||
        m.capabilities.some((c: string) => c.toLowerCase().includes(term)) ||
        (m.description && m.description.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [models, searchTerm, activeFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Explore AI Models
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover and compare the latest AI models. Find the perfect model for your use case.
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border/50 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search models by name, provider, or capability..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <ModelsFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground">
              Found {filteredModels.length} {filteredModels.length === 1 ? 'model' : 'models'} matching "{searchTerm}"
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <div className="mb-12">
              <ModelsGrid
                title="Featured Premium Models"
                models={categories.premium.slice(0, 6)}
                showBadges={true}
              />
              <ModelsGrid
                title="Featured Free Models"
                models={categories.free.slice(0, 6)}
                showBadges={true}
              />
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold text-foreground">
                  All Models ({filteredModels.length})
                </h2>
                <Link href="/compare">
                  <Button variant="outline">
                    Compare Models
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {filteredModels.length === 0 ? (
                <div className="text-center py-12">
                  <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No models found matching your criteria
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setActiveFilter('all');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <ModelsGrid
                  models={filteredModels}
                  showBadges={false}
                />
              )}
            </div>
          </>
        )}

        <div className="mt-16 pt-12 border-t border-border/40">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
              Why Use ChatLima?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-lg p-6 mb-4">
                  <Search className="h-8 w-8 text-primary mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Access 100+ Models
                </h3>
                <p className="text-muted-foreground text-sm">
                  Explore and compare the latest AI models from OpenRouter and Requesty
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-lg p-6 mb-4">
                  <Filter className="h-8 w-8 text-primary mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Easy Comparison
                </h3>
                <p className="text-muted-foreground text-sm">
                  Compare models side-by-side to find the best fit for your needs
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-lg p-6 mb-4">
                  <ArrowRight className="h-8 w-8 text-primary mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Start Chatting
                </h3>
                <p className="text-muted-foreground text-sm">
                  Begin conversations instantly with free models or upgrade for premium access
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
