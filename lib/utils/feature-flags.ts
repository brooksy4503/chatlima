import { flag } from 'flags/next';

// Project Overview feature flag - controlled by Vercel Edge Config + Statsig
export const projectOverviewV2Flag = flag<boolean>({
  key: 'project-overview-v2',
  description: 'Enable the new Project Overview component with enhanced features',
  decide() {
    // Fallback for when Edge Config isn't available (e.g., local development)
    // In production, Vercel Edge Config will override this with Statsig values
    return false; // Default to disabled for safety
  },
});

// Helper function to check if a feature is enabled
export const isFeatureEnabled = async (flagInstance: ReturnType<typeof flag<boolean>>) => {
  try {
    const result = await flagInstance();
    return result === true;
  } catch (error) {
    console.error('Error checking feature flag:', error);
    return false; // Default to disabled on error
  }
};

// Export individual flag checkers for easier usage
export const isProjectOverviewV2Enabled = () => isFeatureEnabled(projectOverviewV2Flag);

// Statsig-specific configuration
export const STATSIG_CONFIG = {
  clientKey: process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY,
  serverKey: process.env.STATSIG_SERVER_API_KEY,
  configKey: process.env.EXPERIMENTATION_CONFIG_ITEM_KEY,
};