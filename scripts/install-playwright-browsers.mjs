#!/usr/bin/env node
/**
 * Reliable Playwright browser installer.
 *
 * `playwright install` can hang during zip extraction on some macOS setups.
 * This script downloads browser archives with fetch and extracts them with unzip.
 */
import { execFileSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const browsersJsonPath = join(repoRoot, 'node_modules', 'playwright-core', 'browsers.json');
const browsersJson = JSON.parse(readFileSync(browsersJsonPath, 'utf8'));

const platform = process.platform;
const arch = process.arch;

const PLATFORM = {
  'darwin-arm64': 'mac-arm64',
  'darwin-x64': 'mac',
  'linux-x64': 'linux',
  'linux-arm64': 'linux-arm64',
  'win32-x64': 'win64',
}[`${platform}-${arch}`];

if (!PLATFORM) {
  console.error(`Unsupported platform: ${platform}-${arch}`);
  process.exit(1);
}

function defaultCacheDir() {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
    return process.env.PLAYWRIGHT_BROWSERS_PATH;
  }

  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (platform === 'darwin') {
    return join(home, 'Library', 'Caches', 'ms-playwright');
  }
  if (platform === 'win32') {
    return join(home, 'AppData', 'Local', 'ms-playwright');
  }
  return join(home, '.cache', 'ms-playwright');
}

const cacheDir = defaultCacheDir();

const requested = process.argv.slice(2);
const browserNames =
  requested.length > 0
    ? requested
    : ['chromium', 'chromium-headless-shell'];

const browserByName = Object.fromEntries(browsersJson.browsers.map((browser) => [browser.name, browser]));

const DOWNLOAD_HOST = process.env.PLAYWRIGHT_DOWNLOAD_HOST || 'https://cdn.playwright.dev';

function browserFolderName(name, revision) {
  if (name === 'chromium') return `chromium-${revision}`;
  if (name === 'chromium-headless-shell') return `chromium_headless_shell-${revision}`;
  return `${name}-${revision}`;
}

function archiveFileName(name) {
  if (name === 'chromium') return `chromium-${PLATFORM}.zip`;
  if (name === 'chromium-headless-shell') return `chromium-headless-shell-${PLATFORM}.zip`;
  throw new Error(`Unsupported browser for manual install: ${name}`);
}

function isInstalled(folderPath) {
  return (
    existsSync(join(folderPath, 'INSTALLATION_COMPLETE')) &&
    existsSync(join(folderPath, 'DEPENDENCIES_VALIDATED'))
  );
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  await pipeline(response.body, createWriteStream(destination));
}

function extractZip(zipPath, destination) {
  mkdirSync(destination, { recursive: true });
  execFileSync('unzip', ['-q', zipPath, '-d', destination], { stdio: 'inherit' });
}

function normalizeExtractedLayout(folderPath, browserName) {
  if (browserName === 'chromium') {
    const legacyPath = join(folderPath, 'chrome-mac');
    const armPath = join(folderPath, 'chrome-mac-arm64');
    if (existsSync(legacyPath) && !existsSync(armPath)) {
      execFileSync('mv', [legacyPath, armPath]);
    }
  }
}

async function installBrowser(browserName) {
  const browser = browserByName[browserName];
  if (!browser) {
    throw new Error(`Unknown browser: ${browserName}`);
  }

  const folderName = browserFolderName(browserName, browser.revision);
  const folderPath = join(cacheDir, folderName);

  if (isInstalled(folderPath)) {
    console.log(`✓ ${browserName} already installed (${folderName})`);
    return;
  }

  const archiveName = archiveFileName(browserName);
  const url = `${DOWNLOAD_HOST}/dbazure/download/playwright/builds/${browserName}/${browser.revision}/${archiveName}`;

  console.log(`→ Installing ${browserName} (${browser.revision}) from ${url}`);

  const tempDir = mkdtempSync(join(tmpdir(), 'playwright-install-'));
  const zipPath = join(tempDir, archiveName);

  try {
    rmSync(folderPath, { recursive: true, force: true });
    await download(url, zipPath);
    extractZip(zipPath, folderPath);
    normalizeExtractedLayout(folderPath, browserName);
    writeFileSync(join(folderPath, 'INSTALLATION_COMPLETE'), '');
    writeFileSync(join(folderPath, 'DEPENDENCIES_VALIDATED'), '');
    console.log(`✓ Installed ${browserName} to ${folderPath}`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  if (process.env.CI === 'true' || platform !== 'darwin') {
    console.log(
      'Custom Playwright installer is for macOS local dev only. Use: pnpm exec playwright install chromium'
    );
    process.exit(0);
  }

  mkdirSync(cacheDir, { recursive: true });

  for (const browserName of browserNames) {
    await installBrowser(browserName);
  }

  console.log('Playwright browsers ready.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
