#!/usr/bin/env tsx

/**
 * Anonymous User Cleanup CLI Script
 * 
 * Phase 2 implementation of the anonymous user cleanup plan.
 * Provides command-line interface for cleaning up inactive anonymous users.
 * 
 * Usage:
 *   # Preview mode (dry run)
 *   pnpm exec tsx scripts/cleanup-anonymous-users.ts --preview --days=30
 * 
 *   # Interactive confirmation
 *   pnpm exec tsx scripts/cleanup-anonymous-users.ts --interactive
 * 
 *   # Automated execution (requires --confirm flag for safety)
 *   pnpm exec tsx scripts/cleanup-anonymous-users.ts --days=45 --batch-size=50 --confirm
 * 
 *   # Help
 *   pnpm exec tsx scripts/cleanup-anonymous-users.ts --help
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables BEFORE importing database modules
config({ path: path.join(process.cwd(), '.env.local') });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.error('   Make sure .env.local exists and contains DATABASE_URL');
    process.exit(1);
}

import { UserCleanupService, CleanupResult, CleanupPreview } from '../lib/services/userCleanupService';
import { createInterface } from 'readline/promises';

interface CliOptions {
    preview: boolean;
    interactive: boolean;
    days: number;
    batchSize: number;
    confirm: boolean;
    help: boolean;
    verbose: boolean;
}

class CleanupLogger {
    private verbose: boolean;
    private logPrefix: string;

    constructor(verbose: boolean = false) {
        this.verbose = verbose;
        this.logPrefix = `[CLEANUP-${new Date().toISOString()}]`;
    }

    info(message: string, data?: any) {
        console.log(`${this.logPrefix} ℹ️  ${message}`);
        if (this.verbose && data) {
            console.log('   ', JSON.stringify(data, null, 2));
        }
    }

    success(message: string, data?: any) {
        console.log(`${this.logPrefix} ✅ ${message}`);
        if (this.verbose && data) {
            console.log('   ', JSON.stringify(data, null, 2));
        }
    }

    warning(message: string, data?: any) {
        console.log(`${this.logPrefix} ⚠️  ${message}`);
        if (this.verbose && data) {
            console.log('   ', JSON.stringify(data, null, 2));
        }
    }

    error(message: string, error?: any) {
        console.error(`${this.logPrefix} ❌ ${message}`);
        if (error) {
            console.error('   ', error instanceof Error ? error.message : error);
            if (this.verbose && error instanceof Error && error.stack) {
                console.error('   Stack:', error.stack);
            }
        }
    }

    debug(message: string, data?: any) {
        if (this.verbose) {
            console.log(`${this.logPrefix} 🔍 ${message}`);
            if (data) {
                console.log('   ', JSON.stringify(data, null, 2));
            }
        }
    }
}

function parseArguments(): CliOptions {
    const args = process.argv.slice(2);
    const options: CliOptions = {
        preview: false,
        interactive: false,
        days: 45,
        batchSize: 50,
        confirm: false,
        help: false,
        verbose: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        switch (arg) {
            case '--preview':
            case '-p':
                options.preview = true;
                break;

            case '--interactive':
            case '-i':
                options.interactive = true;
                break;

            case '--confirm':
            case '-c':
                options.confirm = true;
                break;

            case '--help':
            case '-h':
                options.help = true;
                break;

            case '--verbose':
            case '-v':
                options.verbose = true;
                break;

            default:
                if (arg.startsWith('--days=')) {
                    const days = parseInt(arg.split('=')[1]);
                    if (isNaN(days) || days < 7 || days > 365) {
                        throw new Error('Invalid days value. Must be between 7 and 365.');
                    }
                    options.days = days;
                } else if (arg.startsWith('--batch-size=')) {
                    const batchSize = parseInt(arg.split('=')[1]);
                    if (isNaN(batchSize) || batchSize < 1 || batchSize > 100) {
                        throw new Error('Invalid batch-size value. Must be between 1 and 100.');
                    }
                    options.batchSize = batchSize;
                } else {
                    throw new Error(`Unknown argument: ${arg}`);
                }
                break;
        }
    }

    return options;
}

function showHelp() {
    console.log(`
Anonymous User Cleanup CLI Script

DESCRIPTION:
  Clean up inactive anonymous users from the ChatLima database.
  This script provides multiple modes of operation for safety and flexibility.

USAGE:
  pnpm exec tsx scripts/cleanup-anonymous-users.ts [OPTIONS]

OPTIONS:
  --preview, -p              Preview mode (dry run). Shows what would be deleted.
  --interactive, -i          Interactive mode with confirmation prompts.
  --days=N                   Inactivity threshold in days (7-365, default: 45).
  --batch-size=N             Number of users to process per batch (1-100, default: 50).
  --confirm, -c              Required for non-interactive execution.
  --verbose, -v              Enable verbose logging with detailed output.
  --help, -h                 Show this help message.

EXAMPLES:
  # Preview what would be deleted (safe, read-only)
  pnpm exec tsx scripts/cleanup-anonymous-users.ts --preview

  # Preview with custom threshold
  pnpm exec tsx scripts/cleanup-anonymous-users.ts --preview --days=30

  # Interactive mode with prompts
  pnpm exec tsx scripts/cleanup-anonymous-users.ts --interactive

  # Automated execution (requires --confirm for safety)
  pnpm exec tsx scripts/cleanup-anonymous-users.ts --days=45 --batch-size=25 --confirm

  # Verbose logging
  pnpm exec tsx scripts/cleanup-anonymous-users.ts --preview --verbose

SAFETY NOTES:
  - Users newer than 7 days are never deleted
  - Preview mode is always safe (no data changes)
  - Interactive mode provides multiple confirmation prompts
  - Automated mode requires explicit --confirm flag
  - All operations are logged with execution details

For more information, see: docs/anonymous-user-cleanup-plan.md
`);
}

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
}

function formatDate(date: Date | null): string {
    if (!date) return 'Never';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

async function showPreview(preview: CleanupPreview, logger: CleanupLogger) {
    logger.info('📊 Cleanup Preview Results');
    console.log('');
    console.log(`  Total Anonymous Users:     ${preview.totalAnonymousUsers.toLocaleString()}`);
    console.log(`  Active Users:              ${preview.activeUsers.toLocaleString()}`);
    console.log(`  Candidates for Deletion:   ${preview.candidatesForDeletion.toLocaleString()}`);
    console.log(`  Inactivity Threshold:      ${preview.thresholdDays} days`);
    console.log(`  Minimum Age Protection:    ${preview.minimumAgeDays} days`);
    console.log('');

    if (preview.candidatesForDeletion === 0) {
        logger.success('No users meet the deletion criteria. Database is clean!');
        return;
    }

    const storageReduction = Math.round((preview.candidatesForDeletion / preview.totalAnonymousUsers) * 100);
    logger.info(`Estimated storage reduction: ~${storageReduction}% of anonymous user data`);
    console.log('');

    if (preview.candidates.length > 0) {
        logger.info('📋 Sample of users that would be deleted:');
        console.log('');
        console.log('  User ID'.padEnd(30) + 'Last Activity'.padEnd(15) + 'Days Inactive');
        console.log('  ' + '-'.repeat(65));

        const sampleSize = Math.min(10, preview.candidates.length);
        for (let i = 0; i < sampleSize; i++) {
            const user = preview.candidates[i];
            const lastActivity = Math.max(
                user.lastChatActivity?.getTime() || 0,
                user.lastSessionActivity?.getTime() || 0,
                user.lastTokenUsage?.getTime() || 0
            );
            const lastActivityDate = lastActivity > 0 ? new Date(lastActivity) : null;

            console.log(
                `  ${user.userId.substring(0, 28).padEnd(30)}` +
                `${formatDate(lastActivityDate).padEnd(15)}` +
                `${user.daysSinceLastActivity} days`
            );
        }

        if (preview.candidates.length > sampleSize) {
            console.log(`  ... and ${preview.candidates.length - sampleSize} more users`);
        }
    }
}

async function confirmInteractive(options: CliOptions, preview: CleanupPreview): Promise<boolean> {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    try {
        console.log('');
        console.log('⚠️  INTERACTIVE CONFIRMATION ⚠️');
        console.log('');
        console.log(`You are about to delete ${preview.candidatesForDeletion} inactive anonymous users.`);
        console.log(`Threshold: ${options.days} days of inactivity`);
        console.log(`Batch size: ${options.batchSize} users`);
        console.log('');
        console.log('This action cannot be undone!');
        console.log('');

        const confirm1 = await rl.question('Are you sure you want to proceed? (yes/no): ');
        if (confirm1.toLowerCase() !== 'yes') {
            console.log('Operation cancelled.');
            return false;
        }

        const confirm2 = await rl.question('Type "DELETE_ANONYMOUS_USERS" to confirm: ');
        if (confirm2 !== 'DELETE_ANONYMOUS_USERS') {
            console.log('Confirmation failed. Operation cancelled.');
            return false;
        }

        const confirm3 = await rl.question(`This will delete ${preview.candidatesForDeletion} users. Continue? (yes/no): `);
        if (confirm3.toLowerCase() !== 'yes') {
            console.log('Operation cancelled.');
            return false;
        }

        return true;
    } finally {
        rl.close();
    }
}

async function executeCleanup(options: CliOptions, logger: CleanupLogger): Promise<void> {
    try {
        logger.info('🚀 Starting anonymous user cleanup execution');
        logger.debug('Execution parameters', {
            thresholdDays: options.days,
            batchSize: options.batchSize,
            dryRun: options.preview
        });

        const startTime = Date.now();

        // Execute the cleanup
        const result: CleanupResult = await UserCleanupService.executeCleanup(
            options.days,
            options.batchSize,
            options.preview
        );

        const duration = Date.now() - startTime;

        // Log results
        logger.info('📊 Cleanup Execution Results');
        console.log('');
        console.log(`  Execution Time:    ${formatDuration(result.executionTimeMs)}`);
        console.log(`  Users Processed:   ${result.usersDeleted.toLocaleString()}`);
        console.log(`  Success:           ${result.success ? '✅ Yes' : '❌ No'}`);
        console.log(`  Threshold Days:    ${result.thresholdDays}`);
        console.log(`  Batch Size:        ${result.batchSize}`);
        console.log(`  Mode:              ${options.preview ? 'DRY RUN (Preview)' : 'LIVE EXECUTION'}`);
        console.log('');

        if (result.errors.length > 0) {
            logger.warning(`Encountered ${result.errors.length} errors during execution:`);
            result.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
            console.log('');
        }

        if (result.success) {
            if (options.preview) {
                logger.success(`Preview completed: ${result.usersDeleted} users would be deleted`);
            } else {
                logger.success(`Cleanup completed successfully: ${result.usersDeleted} users deleted`);
                logger.info('Database optimization recommendations:');
                console.log('  - Consider running VACUUM ANALYZE on the database');
                console.log('  - Monitor query performance improvements');
                console.log('  - Update statistics for query planner optimization');
            }
        } else {
            logger.error('Cleanup execution failed');
            if (result.errors.length === 0) {
                logger.error('Unknown error occurred during cleanup');
            }
        }

        logger.debug('Detailed execution result', result);

    } catch (error) {
        logger.error('Fatal error during cleanup execution', error);
        throw error;
    }
}

async function main() {
    let options: CliOptions;
    // Initialize with default logger first, will be replaced with configured logger
    let logger: CleanupLogger = new CleanupLogger(false);

    try {
        options = parseArguments();
        logger = new CleanupLogger(options.verbose);

        if (options.help) {
            showHelp();
            return;
        }

        logger.info('🧹 Anonymous User Cleanup CLI Tool');
        logger.debug('Parsed options', options);

        // Get preview first (always safe)
        logger.info('📊 Analyzing anonymous users...');
        const preview = await UserCleanupService.previewCleanup(options.days);

        await showPreview(preview, logger);

        // Handle different execution modes
        if (options.preview) {
            logger.success('Preview mode completed. No data was modified.');
            return;
        }

        if (preview.candidatesForDeletion === 0) {
            logger.success('No cleanup needed. Exiting.');
            return;
        }

        // Interactive mode
        if (options.interactive) {
            const confirmed = await confirmInteractive(options, preview);
            if (!confirmed) {
                logger.info('Operation cancelled by user.');
                return;
            }
        }
        // Non-interactive mode requires explicit confirmation
        else if (!options.confirm) {
            logger.error('Automated execution requires --confirm flag for safety.');
            logger.info('Add --confirm to your command or use --interactive for prompts.');
            process.exit(1);
        }

        // Execute cleanup
        await executeCleanup(options, logger);

    } catch (error) {
        if (logger) {
            logger.error('Script execution failed', error);
        } else {
            console.error('❌ Fatal error:', error instanceof Error ? error.message : error);
        }
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Received interrupt signal. Exiting safely...');
    process.exit(130);
});

process.on('SIGTERM', () => {
    console.log('\n\n⚠️  Received termination signal. Exiting safely...');
    process.exit(143);
});

// Run the script
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Unhandled error:', error);
        process.exit(1);
    });
}
