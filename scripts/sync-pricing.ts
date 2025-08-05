#!/usr/bin/env tsx

import dotenv from 'dotenv';

// Load environment variables BEFORE importing database
const envResult = dotenv.config({ path: '.env.local' });
console.log('Loaded .env.local:', !!envResult.parsed);
dotenv.config({ path: '.env' });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
}
console.log('✅ DATABASE_URL loaded');

// Now import the service after environment is loaded
import { PricingSyncService } from '../lib/services/pricingSync';

async function main() {
    console.log('🔄 Starting pricing data sync...');

    try {
        const result = await PricingSyncService.syncPricingData();

        if (result.success) {
            console.log('✅ Pricing sync completed successfully!');
            console.log(`📊 Processed ${result.modelsProcessed} models`);
            console.log(`➕ Added ${result.newPricingEntries} new pricing entries`);
            console.log(`🔄 Updated ${result.updatedPricingEntries} pricing entries`);

            if (result.errors.length > 0) {
                console.log('⚠️  Some errors occurred:');
                result.errors.forEach(error => console.log(`   - ${error}`));
            }
        } else {
            console.log('❌ Pricing sync failed!');
            console.log('Errors:');
            result.errors.forEach(error => console.log(`   - ${error}`));
        }
    } catch (error) {
        console.error('💥 Unexpected error during pricing sync:', error);
        process.exit(1);
    }
}

main(); 