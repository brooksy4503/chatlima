#!/usr/bin/env tsx
/**
 * Release Notes Generator
 * 
 * Generates comprehensive release notes following the ChatLima release notes template.
 * 
 * Usage:
 *   pnpm release:notes --version 0.35.0 --feature "New Feature Name"
 *   pnpm release:notes --version 0.35.0 --feature "New Feature" --interactive
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const GITHUB_REPO = 'brooksy4503/chatlima';
const RELEASES_DIR = join(process.cwd(), 'releases');

interface ReleaseNotesOptions {
  version: string;
  feature: string;
  interactive?: boolean;
  previousVersion?: string;
}

function getCurrentVersion(): string {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
  );
  return packageJson.version;
}

function getPreviousVersion(currentVersion: string): string {
  // Get all release note files
  const releases = execSync('ls releases/RELEASE_NOTES_v*.md', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .map(file => {
      const match = file.match(/RELEASE_NOTES_v(.+)\.md/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a!.split('.').map(Number);
      const [bMajor, bMinor, bPatch] = b!.split('.').map(Number);
      if (aMajor !== bMajor) return bMajor - aMajor;
      if (aMinor !== bMinor) return bMinor - aMinor;
      return bPatch - aPatch;
    });

  // Find the version just before current
  const currentIndex = releases.indexOf(currentVersion);
  if (currentIndex > 0) {
    return releases[currentIndex - 1]!;
  }

  // Fallback: calculate previous version
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  if (patch > 0) {
    return `${major}.${minor}.${patch - 1}`;
  } else if (minor > 0) {
    return `${major}.${minor - 1}.0`;
  } else {
    return `${major - 1}.0.0`;
  }
}

function getGitChanges(previousVersion: string, currentVersion: string): {
  commits: string[];
  filesChanged: string[];
  stats: { insertions: number; deletions: number };
} {
  try {
    const commits = execSync(
      `git log v${previousVersion}..v${currentVersion} --oneline --no-merges`,
      { encoding: 'utf-8' }
    )
      .trim()
      .split('\n')
      .filter(Boolean);

    const diffStat = execSync(
      `git diff --stat v${previousVersion}..v${currentVersion}`,
      { encoding: 'utf-8' }
    );

    // Parse diff stat
    const lines = diffStat.trim().split('\n');
    const filesChanged: string[] = [];
    let totalInsertions = 0;
    let totalDeletions = 0;

    for (const line of lines) {
      if (line.includes('|')) {
        const match = line.match(/^(.+?)\s+\|\s+(\d+)\s+([+-]+)$/);
        if (match) {
          filesChanged.push(match[1].trim());
          const changes = match[3];
          const insertions = (changes.match(/\+/g) || []).length;
          const deletions = (changes.match(/-/g) || []).length;
          totalInsertions += parseInt(match[2]) || 0;
          totalDeletions += deletions;
        }
      }
    }

    return {
      commits,
      filesChanged: Array.from(new Set(filesChanged)),
      stats: {
        insertions: totalInsertions,
        deletions: totalDeletions,
      },
    };
  } catch (error) {
    return {
      commits: [],
      filesChanged: [],
      stats: { insertions: 0, deletions: 0 },
    };
  }
}

function generateReleaseNotes(options: ReleaseNotesOptions): string {
  const previousVersion = options.previousVersion || getPreviousVersion(options.version);
  const changes = getGitChanges(previousVersion, options.version);

  const template = `# 🚀 ChatLima v${options.version} - ${options.feature}

## 🎯 What's New

<!-- Describe major features added, user-facing improvements, and new capabilities -->

## 🔧 Technical Implementation

<!-- Detail technical changes, new routes, APIs, or components, performance improvements -->

## 🛡️ Security & Privacy

<!-- Highlight security enhancements, privacy protections, security-related changes -->

## 📈 Benefits

### For Users
<!-- Explain user benefits, UX improvements -->

### For Platform Operators
<!-- Note business value, operational improvements -->

### For Developers
<!-- Note developer experience improvements, code quality -->

## 🔄 Migration Notes

### No Breaking Changes
This release maintains **full backward compatibility**. All existing functionality remains intact.

### User-Facing Changes
<!-- List any user-visible changes -->

### For Developers
<!-- Note API changes, database migrations, environment variables, dependency updates -->

## 🚀 Deployment

### Standard Deployment Process
This release follows the standard deployment workflow:

\`\`\`bash
# Completed:
# 1. Version bumped to ${options.version}
# 2. Git tag created (v${options.version})
# 3. Tags pushed to remote
\`\`\`

### Automatic Deployment
With GitHub integration enabled, pushing to main automatically triggers production deployment via Vercel.

### Environment Considerations
- ✅ No new environment variables needed
- ✅ No database migrations needed
- ✅ No dependency updates required
- ✅ Backward compatible with all previous versions

### Pre-Deployment Checklist
- [ ] Build verification completed
- [ ] Code quality checks passed
- [ ] Tests passing
- [ ] Feature thoroughly tested

## 📊 Changes Summary

### Files Modified
<!-- List modified files -->

### Files Added
<!-- List new files -->

### Files Refactored
<!-- List refactored files -->

### Commits Included
${changes.commits.length > 0 ? changes.commits.map(c => `- \`${c.split(' ')[0]}\` - ${c.substring(c.indexOf(' ') + 1)}`).join('\n') : '<!-- No commits found -->'}

### Statistics
- **${changes.filesChanged.length} files changed**
- **${changes.stats.insertions} insertions**, ${changes.stats.deletions} deletions
- Net change: ${changes.stats.insertions - changes.stats.deletions > 0 ? '+' : ''}${changes.stats.insertions - changes.stats.deletions} lines
- **Enhancement**: ${options.feature}

---

**Full Changelog**: [v${previousVersion}...v${options.version}](https://github.com/${GITHUB_REPO}/compare/v${previousVersion}...v${options.version})

## 🎉 What's Next

<!-- Optional: Describe future enhancements or planned features -->
`;

  return template;
}

function saveReleaseNotes(version: string, content: string): string {
  // Ensure releases directory exists
  if (!existsSync(RELEASES_DIR)) {
    execSync(`mkdir -p ${RELEASES_DIR}`);
  }

  const filename = `RELEASE_NOTES_v${version}.md`;
  const filepath = join(RELEASES_DIR, filename);

  writeFileSync(filepath, content, 'utf-8');
  return filepath;
}

function parseArgs(): ReleaseNotesOptions {
  const args = process.argv.slice(2);
  const options: Partial<ReleaseNotesOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--version':
      case '-v':
        options.version = args[++i];
        break;
      case '--feature':
      case '-f':
        options.feature = args[++i];
        break;
      case '--previous-version':
      case '-p':
        options.previousVersion = args[++i];
        break;
      case '--interactive':
      case '-i':
        options.interactive = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Release Notes Generator

Usage:
  pnpm release:notes --version <version> --feature <feature-name> [options]

Options:
  --version, -v <version>        Version number (e.g., 0.35.0) (required)
  --feature, -f <name>           Feature name for the release (required)
  --previous-version, -p <ver>   Previous version (auto-detected if not provided)
  --interactive, -i              Open in editor after generation
  --help, -h                     Show this help message

Examples:
  pnpm release:notes --version 0.35.0 --feature "New Feature"
  pnpm release:notes --version 0.35.0 --feature "Bug Fixes" --previous-version 0.34.1
`);
        process.exit(0);
        break;
    }
  }

  if (!options.version) {
    // Try to get from package.json
    try {
      options.version = getCurrentVersion();
      console.log(`Using current version from package.json: ${options.version}`);
    } catch {
      throw new Error('--version is required. Use --help for usage information.');
    }
  }

  if (!options.feature) {
    throw new Error('--feature is required. Use --help for usage information.');
  }

  return options as ReleaseNotesOptions;
}

// Main execution
try {
  const options = parseArgs();

  console.log('📝 Generating release notes...\n');
  console.log(`Version: ${options.version}`);
  console.log(`Feature: ${options.feature}\n`);

  const content = generateReleaseNotes(options);
  const filepath = saveReleaseNotes(options.version, content);

  console.log(`✅ Release notes generated: ${filepath}\n`);
  console.log('📋 Next steps:');
  console.log('  1. Edit the release notes file to fill in the details');
  console.log('  2. Review and customize the content');
  console.log('  3. Create GitHub release using the notes');
  console.log(`     https://github.com/${GITHUB_REPO}/releases/new`);
  console.log('');

  if (options.interactive) {
    const editor = process.env.EDITOR || 'code';
    execSync(`${editor} ${filepath}`, { stdio: 'inherit' });
  }
} catch (error: any) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
