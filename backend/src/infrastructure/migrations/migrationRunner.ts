import dotenv from 'dotenv';
import path from 'path';
import connectDB from '../database/mongoose';
import { RemoveMaxEventsFromWidgetsMigration } from './removeMaxEventsFromWidgets';

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

/**
 * Migration runner script
 * Run with: npm run migrate:removeMaxEvents
 */
async function runMigration() {
    try {
        // Connect to database
        console.log('Connecting to database...');
        await connectDB();

        // Run migration
        const migration = new RemoveMaxEventsFromWidgetsMigration();
        await migration.up();

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

async function rollbackMigration() {
    try {
        // Connect to database
        console.log('Connecting to database...');
        await connectDB();

        // Run rollback
        const migration = new RemoveMaxEventsFromWidgetsMigration();
        await migration.down();

        console.log('Rollback completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Rollback failed:', error);
        process.exit(1);
    }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'up') {
    runMigration();
} else if (command === 'down') {
    rollbackMigration();
} else {
    console.log('Usage: npm run migrate:removeMaxEvents up|down');
    console.log('  up   - Run the migration (remove maxEvents)');
    console.log('  down - Rollback the migration (add maxEvents back)');
    process.exit(1);
}