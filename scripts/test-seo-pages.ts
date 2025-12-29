#!/usr/bin/env tsx

/**
 * Test script to verify programmatic SEO pages exist
 * 
 * Usage:
 *   # Test on local dev server (default)
 *   pnpm tsx scripts/test-seo-pages.ts
 * 
 *   # Test on staging
 *   BASE_URL=https://preview.chatlima.com pnpm tsx scripts/test-seo-pages.ts
 * 
 *   # Test specific number of models (default: 20 for quick test)
 *   MAX_MODELS=50 pnpm tsx scripts/test-seo-pages.ts
 * 
 *   # Test all top 100 models
 *   MAX_MODELS=100 pnpm tsx scripts/test-seo-pages.ts
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const MAX_MODELS = parseInt(process.env.MAX_MODELS || '20', 10);
const MAX_COMPARISONS = parseInt(process.env.MAX_COMPARISONS || '10', 10);
const CONCURRENT_REQUESTS = parseInt(process.env.CONCURRENT_REQUESTS || '5', 10);
const TIMEOUT_MS = 30000; // 30 seconds

interface TestResult {
  url: string;
  status: number;
  exists: boolean;
  error?: string;
  responseTime?: number;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  errors: number;
  results: TestResult[];
}

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function fetchWithTimeout(url: string, timeout: number = TIMEOUT_MS): Promise<TestResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'ChatLima-SEO-Test-Script/1.0',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    const status = response.status;

    return {
      url,
      status,
      exists: status === 200,
      responseTime,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (error.name === 'AbortError') {
      return {
        url,
        status: 0,
        exists: false,
        error: 'Request timeout',
        responseTime,
      };
    }

    return {
      url,
      status: 0,
      exists: false,
      error: error.message || 'Unknown error',
      responseTime,
    };
  }
}

async function testPage(url: string): Promise<TestResult> {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  return fetchWithTimeout(fullUrl);
}

async function testPagesConcurrently(urls: string[]): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  // Process in batches to avoid overwhelming the server
  for (let i = 0; i < urls.length; i += CONCURRENT_REQUESTS) {
    const batch = urls.slice(i, i + CONCURRENT_REQUESTS);
    const batchResults = await Promise.all(batch.map(testPage));
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + CONCURRENT_REQUESTS < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

function printSummary(summary: TestSummary, title: string) {
  log(`\n${title}`, 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total: ${summary.total}`, 'blue');
  log(`✅ Passed: ${summary.passed}`, 'green');
  log(`❌ Failed: ${summary.failed}`, 'red');
  log(`⚠️  Errors: ${summary.errors}`, 'yellow');
  
  if (summary.failed > 0 || summary.errors > 0) {
    log('\nFailed/Error URLs:', 'red');
    summary.results
      .filter(r => !r.exists)
      .forEach(r => {
        log(`  ${r.url}`, 'red');
        if (r.error) {
          log(`    Error: ${r.error}`, 'yellow');
        } else {
          log(`    Status: ${r.status}`, 'yellow');
        }
      });
  }
}

async function testStaticPages(): Promise<TestSummary> {
  log('\n📄 Testing Static Pages...', 'blue');
  
  const staticPages = [
    '/',
    '/models',
    '/compare',
  ];
  
  const results = await testPagesConcurrently(staticPages);
  
  const summary: TestSummary = {
    total: results.length,
    passed: results.filter(r => r.exists).length,
    failed: results.filter(r => !r.exists && r.status !== 0).length,
    errors: results.filter(r => r.status === 0).length,
    results,
  };
  
  return summary;
}

async function testModelPages(): Promise<TestSummary> {
  log('\n🤖 Testing Model Pages...', 'blue');
  
  try {
    // Fetch models from API
    const modelsUrl = `${BASE_URL}/api/models?display=true`;
    log(`Fetching models from: ${modelsUrl}`, 'cyan');
    
    const modelsResponse = await fetch(modelsUrl, {
      headers: {
        'User-Agent': 'ChatLima-SEO-Test-Script/1.0',
      },
    });
    
    if (!modelsResponse.ok) {
      throw new Error(`Failed to fetch models: ${modelsResponse.status} ${modelsResponse.statusText}`);
    }
    
    const modelsData = await modelsResponse.json();
    const models = modelsData.models || [];
    
    log(`Found ${models.length} total models`, 'cyan');
    
    // Get top models for pre-rendering
    const { getTopModelsForPreRender } = await import('@/lib/models/model-priority');
    const { modelIdToSlug } = await import('@/lib/models/slug-utils');
    
    const topModels = getTopModelsForPreRender(models, MAX_MODELS);
    log(`Testing top ${topModels.length} models (limited to ${MAX_MODELS})`, 'cyan');
    
    // Generate model page URLs
    const modelUrls = topModels.map(model => {
      const slug = modelIdToSlug(model.id);
      return `/model/${slug}`;
    });
    
    // Test pages
    const results = await testPagesConcurrently(modelUrls);
    
    // Add model info to results for better error reporting
    const resultsWithInfo = results.map((result, index) => {
      const model = topModels[index];
      if (!result.exists && model) {
        return {
          ...result,
          error: result.error || `Model: ${model.id} (${model.name})`,
        };
      }
      return result;
    });
    
    const summary: TestSummary = {
      total: resultsWithInfo.length,
      passed: resultsWithInfo.filter(r => r.exists).length,
      failed: resultsWithInfo.filter(r => !r.exists && r.status !== 0).length,
      errors: resultsWithInfo.filter(r => r.status === 0).length,
      results: resultsWithInfo,
    };
    
    return summary;
  } catch (error: any) {
    log(`Error testing model pages: ${error.message}`, 'red');
    return {
      total: 0,
      passed: 0,
      failed: 0,
      errors: 1,
      results: [{
        url: 'N/A',
        status: 0,
        exists: false,
        error: error.message,
      }],
    };
  }
}

async function testComparisonPages(): Promise<TestSummary> {
  log('\n⚖️  Testing Comparison Pages...', 'blue');
  
  try {
    const { getAllPrebuiltComparisonSlugs } = await import('@/lib/models/model-priority');
    const comparisonSlugs = getAllPrebuiltComparisonSlugs();
    
    log(`Found ${comparisonSlugs.length} prebuilt comparisons`, 'cyan');
    
    // Limit to MAX_COMPARISONS for testing
    const slugsToTest = comparisonSlugs.slice(0, MAX_COMPARISONS);
    log(`Testing ${slugsToTest.length} comparisons (limited to ${MAX_COMPARISONS})`, 'cyan');
    
    const comparisonUrls = slugsToTest.map(slug => `/compare/${slug}`);
    const results = await testPagesConcurrently(comparisonUrls);
    
    const summary: TestSummary = {
      total: results.length,
      passed: results.filter(r => r.exists).length,
      failed: results.filter(r => !r.exists && r.status !== 0).length,
      errors: results.filter(r => r.status === 0).length,
      results,
    };
    
    return summary;
  } catch (error: any) {
    log(`Error testing comparison pages: ${error.message}`, 'red');
    return {
      total: 0,
      passed: 0,
      failed: 0,
      errors: 1,
      results: [{
        url: 'N/A',
        status: 0,
        exists: false,
        error: error.message,
      }],
    };
  }
}

async function testSitemap(): Promise<TestSummary> {
  log('\n🗺️  Testing Sitemap...', 'blue');
  
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  log(`Testing sitemap: ${sitemapUrl}`, 'cyan');
  log('Note: Sitemap only works in production (chatlima.com domain)', 'yellow');
  
  const result = await testPage(sitemapUrl);
  
  if (result.exists) {
    try {
      const response = await fetch(sitemapUrl);
      const xml = await response.text();
      
      // Count URLs in sitemap
      const urlMatches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
      log(`Found ${urlMatches.length} URLs in sitemap`, 'green');
      
      // Check for key pages
      const hasModels = xml.includes('/models');
      const hasCompare = xml.includes('/compare');
      const hasModelPages = xml.includes('/model/');
      const hasComparisonPages = xml.includes('/compare/');
      
      log(`  ✓ /models: ${hasModels ? '✅' : '❌'}`, hasModels ? 'green' : 'red');
      log(`  ✓ /compare: ${hasCompare ? '✅' : '❌'}`, hasCompare ? 'green' : 'red');
      log(`  ✓ Model pages: ${hasModelPages ? '✅' : '❌'}`, hasModelPages ? 'green' : 'red');
      log(`  ✓ Comparison pages: ${hasComparisonPages ? '✅' : '❌'}`, hasComparisonPages ? 'green' : 'red');
    } catch (error: any) {
      log(`Error parsing sitemap: ${error.message}`, 'yellow');
    }
  }
  
  return {
    total: 1,
    passed: result.exists ? 1 : 0,
    failed: result.exists ? 0 : 1,
    errors: result.status === 0 ? 1 : 0,
    results: [result],
  };
}

async function testRobotsTxt(): Promise<TestSummary> {
  log('\n🤖 Testing robots.txt...', 'blue');
  
  const robotsUrl = `${BASE_URL}/robots.txt`;
  const result = await testPage(robotsUrl);
  
  if (result.exists) {
    try {
      const response = await fetch(robotsUrl);
      const text = await response.text();
      
      const hasSitemap = text.includes('Sitemap:') || text.includes('sitemap');
      log(`  ✓ Sitemap reference: ${hasSitemap ? '✅' : '❌'}`, hasSitemap ? 'green' : 'yellow');
    } catch (error: any) {
      log(`Error parsing robots.txt: ${error.message}`, 'yellow');
    }
  }
  
  return {
    total: 1,
    passed: result.exists ? 1 : 0,
    failed: result.exists ? 0 : 1,
    errors: result.status === 0 ? 1 : 0,
    results: [result],
  };
}

async function main() {
  log('\n🚀 ChatLima SEO Pages Test', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Max Models: ${MAX_MODELS}`, 'blue');
  log(`Max Comparisons: ${MAX_COMPARISONS}`, 'blue');
  log(`Concurrent Requests: ${CONCURRENT_REQUESTS}`, 'blue');
  
  const startTime = Date.now();
  
  try {
    // Test static pages
    const staticSummary = await testStaticPages();
    printSummary(staticSummary, 'Static Pages Summary');
    
    // Test model pages
    const modelSummary = await testModelPages();
    printSummary(modelSummary, 'Model Pages Summary');
    
    // Test comparison pages
    const comparisonSummary = await testComparisonPages();
    printSummary(comparisonSummary, 'Comparison Pages Summary');
    
    // Test sitemap
    const sitemapSummary = await testSitemap();
    printSummary(sitemapSummary, 'Sitemap Summary');
    
    // Test robots.txt
    const robotsSummary = await testRobotsTxt();
    printSummary(robotsSummary, 'Robots.txt Summary');
    
    // Overall summary
    const totalSummary: TestSummary = {
      total: staticSummary.total + modelSummary.total + comparisonSummary.total + sitemapSummary.total + robotsSummary.total,
      passed: staticSummary.passed + modelSummary.passed + comparisonSummary.passed + sitemapSummary.passed + robotsSummary.passed,
      failed: staticSummary.failed + modelSummary.failed + comparisonSummary.failed + sitemapSummary.failed + robotsSummary.failed,
      errors: staticSummary.errors + modelSummary.errors + comparisonSummary.errors + sitemapSummary.errors + robotsSummary.errors,
      results: [],
    };
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 Overall Summary', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Total Tests: ${totalSummary.total}`, 'blue');
    log(`✅ Passed: ${totalSummary.passed} (${((totalSummary.passed / totalSummary.total) * 100).toFixed(1)}%)`, 'green');
    log(`❌ Failed: ${totalSummary.failed}`, 'red');
    log(`⚠️  Errors: ${totalSummary.errors}`, 'yellow');
    log(`⏱️  Duration: ${duration}s`, 'blue');
    
    if (totalSummary.failed === 0 && totalSummary.errors === 0) {
      log('\n🎉 All tests passed!', 'green');
      process.exit(0);
    } else {
      log('\n⚠️  Some tests failed. Check the output above for details.', 'yellow');
      process.exit(1);
    }
  } catch (error: any) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
