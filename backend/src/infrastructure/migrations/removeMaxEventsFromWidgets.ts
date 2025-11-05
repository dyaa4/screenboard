import mongoose from 'mongoose';

/**
 * Migration: Remove maxEvents property from all widget settings
 * This migration removes the deprecated maxEvents field from EventWidget settings
 */
export class RemoveMaxEventsFromWidgetsMigration {

    constructor() {
        // Ensure mongoose is connected before running migration
    }

    async up(): Promise<void> {
        console.log('Starting migration: Remove maxEvents from widgets...');

        try {
            // Ensure connection exists
            if (mongoose.connection.readyState !== 1) {
                throw new Error('MongoDB not connected. Please ensure the database connection is established.');
            }

            // Find all widgets that have maxEvents in their settings
            const widgetsCollection = mongoose.connection.db?.collection('widgets');

            if (!widgetsCollection) {
                throw new Error('Unable to access widgets collection');
            }

            const widgetsWithMaxEvents = await widgetsCollection.find({
                'settings.maxEvents': { $exists: true }
            }).toArray();

            console.log(`Found ${widgetsWithMaxEvents.length} widgets with maxEvents property`);

            if (widgetsWithMaxEvents.length > 0) {
                // Remove maxEvents from all widgets
                const result = await widgetsCollection.updateMany(
                    { 'settings.maxEvents': { $exists: true } },
                    { $unset: { 'settings.maxEvents': '' } }
                );

                console.log(`Successfully removed maxEvents from ${result.modifiedCount} widgets`);
            } else {
                console.log('No widgets found with maxEvents property');
            }

        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        console.log('Rollback migration: Add maxEvents back to widgets...');

        try {
            // Ensure connection exists
            if (mongoose.connection.readyState !== 1) {
                throw new Error('MongoDB not connected. Please ensure the database connection is established.');
            }

            // Find all EVENT type widgets and add maxEvents: 10 back
            const widgetsCollection = mongoose.connection.db?.collection('widgets');

            if (!widgetsCollection) {
                throw new Error('Unable to access widgets collection');
            }

            const eventWidgets = await widgetsCollection.find({
                type: 'EVENTS',
                'settings.maxEvents': { $exists: false }
            }).toArray();

            console.log(`Found ${eventWidgets.length} EVENT widgets without maxEvents`);

            if (eventWidgets.length > 0) {
                // Add maxEvents: 10 back to all EVENT widgets
                const result = await widgetsCollection.updateMany(
                    {
                        type: 'EVENTS',
                        'settings.maxEvents': { $exists: false }
                    },
                    { $set: { 'settings.maxEvents': 10 } }
                );

                console.log(`Successfully added maxEvents back to ${result.modifiedCount} widgets`);
            } else {
                console.log('No EVENT widgets found without maxEvents property');
            }

        } catch (error) {
            console.error('Rollback migration failed:', error);
            throw error;
        }
    }
}