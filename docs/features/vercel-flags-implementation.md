# Vercel Flags Implementation Guide

## 🚩 Overview

This document provides comprehensive documentation for the Vercel Flags feature flag system implementation in the ChatLima project. The system allows for controlled rollout of new features, A/B testing, and gradual feature releases.

## 📦 Package Information

- **Package**: `flags` (v4.0.1)
- **Migration**: Migrated from deprecated `@vercel/flags` package
- **Purpose**: Feature flag management and controlled rollouts

## 🏗️ Architecture

### File Structure
```
lib/
├── utils/
│   └── feature-flags.ts      # Flag definitions and utilities
├── hooks/
│   └── use-feature-flag.ts   # React hooks for feature flags
components/
├── project-overview-v2.tsx   # Enhanced component (flag-controlled)
└── project-overview.tsx      # Original component with flag integration
```

### Key Components

#### 1. Flag Configuration ([lib/utils/feature-flags.ts](mdc:chatlima/lib/utils/feature-flags.ts))

```typescript
import { createFlag } from 'flags/next';

export const projectOverviewV2Flag = createFlag({
  key: 'project-overview-v2',
  description: 'Enable the enhanced Project Overview V2 component',
  variants: [
    { value: true, name: 'Enabled' },
    { value: false, name: 'Disabled' }
  ],
  defaultVariant: false
});

// Helper function to check flag status
export async function isProjectOverviewV2Enabled() {
  const flag = await projectOverviewV2Flag.get();
  return flag.value === true;
}
```

#### 2. React Hook ([lib/hooks/use-feature-flag.ts](mdc:chatlima/lib/hooks/use-feature-flag.ts))

```typescript
import { useState, useEffect } from 'react';
import { projectOverviewV2Flag } from '../utils/feature-flags';

// Generic hook for any feature flag
export function useFeatureFlag<T>(flag: any) {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkFlag() {
      try {
        const flagResult = await flag.get();
        setIsEnabled(flagResult.value as T);
      } catch (error) {
        console.error('Error checking feature flag:', error);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkFlag();
  }, [flag]);

  return { isEnabled, isLoading };
}

// Specific hook for Project Overview V2
export function useProjectOverviewV2() {
  return useFeatureFlag<boolean>(projectOverviewV2Flag);
}
```

#### 3. Component Integration ([components/project-overview.tsx](mdc:chatlima/components/project-overview.tsx))

```typescript
import { useProjectOverviewV2 } from '@/lib/hooks/use-feature-flag';
import ProjectOverviewV2 from './project-overview-v2';

export default function ProjectOverview() {
  const { isEnabled, isLoading } = useProjectOverviewV2();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isEnabled ? <ProjectOverviewV2 /> : <OriginalProjectOverview />;
}
```

## 🔧 Setup and Configuration

### 1. Environment Variables

Add to your `.env.local`:
```bash
FLAGS_SECRET="your-flags-secret-here"
```

### 2. Package Installation
```bash
pnpm add flags
```

### 3. Vercel Experimentation Provider Setup

**Vercel now uses Marketplace Providers for feature flags:**

1. Go to your Vercel project dashboard
2. Navigate to "Experimentation" 
3. Choose a provider (recommended: **Statsig**)
4. Click "Create" to set up the integration
5. Follow the provider-specific setup wizard

**After Provider Setup:**
- Add provider API keys to your environment variables
- Configure feature flags in the provider's dashboard
- Test integration with your existing code

## 🎯 Usage Examples

### Basic Flag Checking
```typescript
import { projectOverviewV2Flag } from '@/lib/utils/feature-flags';

async function checkFeature() {
  const flag = await projectOverviewV2Flag.get();
  if (flag.value) {
    // Feature is enabled
  }
}
```

### React Component Integration
```typescript
import { useFeatureFlag } from '@/lib/hooks/use-feature-flag';
import { projectOverviewV2Flag } from '@/lib/utils/feature-flags';

function MyComponent() {
  const { isEnabled, isLoading } = useFeatureFlag(projectOverviewV2Flag);

  if (isLoading) return <div>Loading...</div>;
  
  return isEnabled ? <EnhancedComponent /> : <OriginalComponent />;
}
```

### Server-Side Usage
```typescript
import { projectOverviewV2Flag } from '@/lib/utils/feature-flags';

export async function GET() {
  const flag = await projectOverviewV2Flag.get();
  
  if (flag.value) {
    // Return enhanced response
  } else {
    // Return original response
  }
}
```

## 🚀 Best Practices

### 1. Flag Naming Convention
- Use kebab-case for flag keys
- Be descriptive: `feature-name-purpose`
- Include context: `auth-new-flow`, `ui-redesign-header`

### 2. Default Values
- Always set conservative default values (usually `false`)
- This ensures features are disabled if the flag service is unavailable

### 3. Error Handling
- Handle flag checking errors gracefully
- Fall back to default behavior when flags can't be resolved

### 4. Testing
- Test both enabled and disabled states
- Verify loading states work correctly
- Test error scenarios

### 5. Cleanup
- Remove flag checks once features are fully rolled out
- Delete flags from Vercel dashboard when no longer needed

## 🧪 Testing Strategies

### Development Testing
```typescript
// Mock flag values for testing
jest.mock('@/lib/utils/feature-flags', () => ({
  projectOverviewV2Flag: {
    get: jest.fn().mockResolvedValue({ value: true })
  }
}));
```

### E2E Testing
```typescript
// Cypress example
cy.intercept('GET', '/api/flags*', {
  body: { flags: { 'project-overview-v2': { value: true } } }
});
```

### Manual Testing
1. Set flag values in Vercel dashboard
2. Test both enabled and disabled states
3. Verify loading and error states

## 🔄 Migration Guide

### From @vercel/flags to flags package

**Before (deprecated):**
```typescript
import { getFlag } from '@vercel/flags';
```

**After (current):**
```typescript
import { createFlag } from 'flags/next';
```

### API Changes
- `getFlag()` → `createFlag().get()`
- Different configuration structure
- Improved TypeScript support

## 📋 Monitoring and Analytics

### Recommended Metrics
- Flag resolution success rate
- Flag evaluation latency
- User exposure by variant
- Conversion rates by flag state

### Logging
```typescript
import { projectOverviewV2Flag } from '@/lib/utils/feature-flags';

async function checkFlagWithLogging() {
  try {
    const flag = await projectOverviewV2Flag.get();
    console.log('Flag resolved:', flag);
    return flag.value;
  } catch (error) {
    console.error('Flag resolution failed:', error);
    return false; // Fallback to default
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Flag not resolving**
   - Check FLAGS_SECRET environment variable
   - Verify Vercel project linkage
   - Check network connectivity

2. **Type errors**
   - Ensure proper TypeScript types for flag values
   - Use the generic `useFeatureFlag<T>` hook correctly

3. **Performance issues**
   - Implement proper loading states
   - Consider caching flag values when appropriate

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('flags:debug', 'true');
```

## 📚 References

- [Vercel Flags Documentation](https://vercel.com/docs/storage/flags)
- [Flags Package on npm](https://www.npmjs.com/package/flags)
- [Feature Flag Best Practices](https://featureflags.io/best-practices/)

## 🎯 Next Steps

1. **Add more flags** for upcoming features
2. **Implement A/B testing** with proper analytics
3. **Create flag management UI** for internal teams
4. **Set up monitoring** for flag performance
5. **Establish cleanup process** for deprecated flags

---

*Last updated: ${new Date().toLocaleDateString()}*