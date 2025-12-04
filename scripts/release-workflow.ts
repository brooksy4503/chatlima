#!/usr/bin/env tsx
/**
 * Feature Release Workflow Automation Script
 * 
 * This script automates the release process for ChatLima:
 * 1. Pre-release checks (tests, branch status)
 * 2. Merge feature branch
 * 3. Version increment
 * 4. Push changes and tags
 * 5. Cleanup feature branch
 * 
 * Usage:
 *   pnpm release:workflow --branch feature/my-feature --version patch
 *   pnpm release:workflow --branch feature/my-feature --version minor
 *   pnpm release:workflow --branch feature/my-feature --version major
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_REPO = 'brooksy4503/chatlima';

interface ReleaseOptions {
  branch: string;
  version: 'patch' | 'minor' | 'major';
  skipTests?: boolean;
  skipBuild?: boolean;
  dryRun?: boolean;
}

function execCommand(command: string, options: { dryRun?: boolean } = {}): string {
  if (options.dryRun) {
    console.log(`[DRY RUN] Would execute: ${command}`);
    return '';
  }
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch (error: any) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function getCurrentVersion(): string {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
  );
  return packageJson.version;
}

function getCurrentBranch(): string {
  return execCommand('git rev-parse --abbrev-ref HEAD');
}

function checkWorkingDirectoryClean(dryRun?: boolean): void {
  const status = execCommand('git status --porcelain', { dryRun });
  if (status && !dryRun) {
    throw new Error(
      'Working directory is not clean. Please commit or stash your changes before releasing.'
    );
  }
}

function runPreReleaseChecks(options: ReleaseOptions): void {
  console.log('🔍 Running pre-release checks...\n');

  // Check working directory
  console.log('  ✓ Checking working directory...');
  checkWorkingDirectoryClean(options.dryRun);

  // Check current branch
  const currentBranch = getCurrentBranch();
  if (currentBranch !== 'main' && !options.dryRun) {
    console.log(`  ⚠️  Currently on branch: ${currentBranch}`);
    console.log('  → Will switch to main branch');
  }

  // Check if feature branch exists
  console.log(`  ✓ Checking if branch '${options.branch}' exists...`);
  try {
    execCommand(`git show-ref --verify --quiet refs/heads/${options.branch}`, { dryRun: options.dryRun });
  } catch {
    try {
      execCommand(`git show-ref --verify --quiet refs/remotes/origin/${options.branch}`, { dryRun: options.dryRun });
      console.log(`  → Branch exists on remote`);
    } catch {
      throw new Error(`Branch '${options.branch}' not found locally or remotely`);
    }
  }

  // Run tests
  if (!options.skipTests) {
    console.log('  ✓ Running tests...');
    try {
      execCommand('pnpm test:unit', { dryRun: options.dryRun });
      console.log('  ✓ Tests passed');
    } catch (error: any) {
      throw new Error(`Tests failed: ${error.message}`);
    }
  } else {
    console.log('  ⚠️  Skipping tests (--skip-tests flag)');
  }

  // Build check
  if (!options.skipBuild) {
    console.log('  ✓ Building project...');
    try {
      execCommand('pnpm build', { dryRun: options.dryRun });
      console.log('  ✓ Build successful');
    } catch (error: any) {
      throw new Error(`Build failed: ${error.message}`);
    }
  } else {
    console.log('  ⚠️  Skipping build (--skip-build flag)');
  }

  console.log('\n✅ Pre-release checks passed!\n');
}

function mergeFeatureBranch(options: ReleaseOptions): void {
  console.log('🔄 Merging feature branch...\n');

  const currentBranch = getCurrentBranch();

  // Switch to main if not already there
  if (currentBranch !== 'main' && !options.dryRun) {
    console.log('  → Switching to main branch...');
    execCommand('git checkout main');
  }

  // Pull latest changes
  console.log('  → Pulling latest changes from main...');
  execCommand('git pull origin main', { dryRun: options.dryRun });

  // Merge feature branch
  console.log(`  → Merging '${options.branch}' into main...`);
  try {
    execCommand(`git merge ${options.branch} --no-ff -m "Merge ${options.branch} into main"`, { dryRun: options.dryRun });
    console.log('  ✓ Merge successful');
  } catch (error: any) {
    throw new Error(`Merge failed: ${error.message}\nPlease resolve conflicts manually and try again.`);
  }

  console.log('');
}

function incrementVersion(options: ReleaseOptions): string {
  console.log('📦 Incrementing version...\n');

  const currentVersion = getCurrentVersion();
  console.log(`  Current version: ${currentVersion}`);

  // Calculate new version
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  let newVersion: string;

  switch (options.version) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }

  console.log(`  New version: ${newVersion}`);

  if (!options.dryRun) {
    // Use npm version to update package.json and create tag
    console.log(`  → Running 'npm version ${options.version}'...`);
    execCommand(`npm version ${options.version} -m "chore: bump version to %s"`);
    console.log('  ✓ Version updated and tag created');
  } else {
    console.log(`  [DRY RUN] Would run: npm version ${options.version}`);
  }

  console.log('');
  return newVersion;
}

function pushChanges(options: ReleaseOptions): void {
  console.log('📤 Pushing changes to remote...\n');

  if (!options.dryRun) {
    console.log('  → Pushing commits and tags...');
    execCommand('git push origin main --tags');
    console.log('  ✓ Changes pushed successfully');
  } else {
    console.log('  [DRY RUN] Would push: git push origin main --tags');
  }

  console.log('');
}

function cleanupFeatureBranch(options: ReleaseOptions): void {
  console.log('🧹 Cleaning up feature branch...\n');

  // Delete local branch
  try {
    console.log(`  → Deleting local branch '${options.branch}'...`);
    execCommand(`git branch -d ${options.branch}`, { dryRun: options.dryRun });
    console.log('  ✓ Local branch deleted');
  } catch (error: any) {
    console.log(`  ⚠️  Could not delete local branch: ${error.message}`);
    console.log('  → Branch may have already been deleted or has unmerged changes');
  }

  // Delete remote branch
  try {
    console.log(`  → Deleting remote branch '${options.branch}'...`);
    execCommand(`git push origin --delete ${options.branch}`, { dryRun: options.dryRun });
    console.log('  ✓ Remote branch deleted');
  } catch (error: any) {
    console.log(`  ⚠️  Could not delete remote branch: ${error.message}`);
    console.log('  → Branch may have already been deleted');
  }

  console.log('');
}

function printSummary(newVersion: string, options: ReleaseOptions): void {
  console.log('🎉 Release workflow completed!\n');
  console.log('📋 Summary:');
  console.log(`  • Version: ${newVersion}`);
  console.log(`  • Feature branch: ${options.branch}`);
  console.log(`  • Tag created: v${newVersion}`);
  console.log(`  • Changes pushed to: origin/main`);
  console.log('');
  console.log('📝 Next steps:');
  console.log('  1. Generate release notes:');
  console.log(`     pnpm release:notes --version ${newVersion} --feature "Your Feature Name"`);
  console.log('  2. Create GitHub release:');
  console.log(`     https://github.com/${GITHUB_REPO}/releases/new`);
  console.log(`     Tag: v${newVersion}`);
  console.log('  3. Monitor deployment:');
  console.log('     Check Vercel dashboard for automatic deployment');
  console.log('');
}

// Parse command line arguments
function parseArgs(): ReleaseOptions {
  const args = process.argv.slice(2);
  const options: Partial<ReleaseOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--branch':
      case '-b':
        options.branch = args[++i];
        break;
      case '--version':
      case '-v':
        const version = args[++i];
        if (!['patch', 'minor', 'major'].includes(version)) {
          throw new Error('Version must be one of: patch, minor, major');
        }
        options.version = version as 'patch' | 'minor' | 'major';
        break;
      case '--skip-tests':
        options.skipTests = true;
        break;
      case '--skip-build':
        options.skipBuild = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Feature Release Workflow Automation

Usage:
  pnpm release:workflow --branch <branch-name> --version <patch|minor|major> [options]

Options:
  --branch, -b <name>        Feature branch to merge (required)
  --version, -v <type>       Version bump type: patch, minor, or major (required)
  --skip-tests               Skip running tests before release
  --skip-build               Skip building project before release
  --dry-run                  Show what would be done without executing
  --help, -h                 Show this help message

Examples:
  pnpm release:workflow --branch feature/new-feature --version minor
  pnpm release:workflow --branch feature/bugfix --version patch --skip-tests
  pnpm release:workflow --branch feature/major-change --version major --dry-run
`);
        process.exit(0);
        break;
    }
  }

  if (!options.branch) {
    throw new Error('--branch is required. Use --help for usage information.');
  }

  if (!options.version) {
    throw new Error('--version is required. Use --help for usage information.');
  }

  return options as ReleaseOptions;
}

// Main execution
let options: ReleaseOptions;
try {
  options = parseArgs();
} catch (error: any) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}

try {
  console.log('🚀 Starting release workflow...\n');
  console.log(`Branch: ${options.branch}`);
  console.log(`Version bump: ${options.version}`);
  console.log(`Dry run: ${options.dryRun ? 'Yes' : 'No'}\n`);

  // Run workflow steps
  runPreReleaseChecks(options);
  mergeFeatureBranch(options);
  const newVersion = incrementVersion(options);
  pushChanges(options);
  cleanupFeatureBranch(options);
  printSummary(newVersion, options);

  console.log('✅ Release workflow completed successfully!');
} catch (error: any) {
  console.error(`\n❌ Release workflow failed: ${error.message}`);
  console.error('\nPlease resolve the issue and try again.');
  process.exit(1);
}
