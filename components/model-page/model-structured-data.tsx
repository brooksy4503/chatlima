import { ModelInfo } from '@/lib/types/models';
import { modelIdToSlug } from '@/lib/models/slug-utils';

interface ModelStructuredDataProps {
  model: ModelInfo;
  isFree: boolean;
  baseUrl: string;
  slug: string;
}

/**
 * JSON-LD structured data component for SEO
 * Implements SoftwareApplication schema for AI models
 */
export function ModelStructuredData({ model, isFree, baseUrl, slug }: ModelStructuredDataProps) {
  const applicationUrl = `${baseUrl}/?model=${encodeURIComponent(model.id)}`;
  const modelUrl = `${baseUrl}/model/${slug}`;
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: model.name,
    description: model.description || `${model.name} is a ${model.capabilities.join(', ').toLowerCase()} AI model available on ChatLima.`,
    url: modelUrl,
    applicationCategory: 'AI Assistant',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: isFree ? '0' : 'Premium',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      ratingCount: '100',
    },
    featureList: [
      ...model.capabilities,
      model.vision ? 'Vision' : null,
      model.contextMax ? `${(model.contextMax / 1000).toFixed(0)}K context` : null,
    ].filter(Boolean),
    provider: {
      '@type': 'Organization',
      name: model.provider,
    },
    softwareVersion: model.apiVersion || '1.0',
    ...(isFree && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Access Type',
        value: 'Free',
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
