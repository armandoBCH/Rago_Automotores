

import { supabase } from './supabaseClient';
import { AnalyticsEventInsert } from '../types';

/**
 * Tracks an analytics event and sends it to Supabase.
 * This is a "fire-and-forget" function, meaning it won't block
 * the UI thread. Errors are logged to the console without being
 * thrown, to avoid crashing the user experience for an analytics event.
 *
 * @param eventType - A descriptive name for the event (e.g., 'view_vehicle').
 * @param vehicleId - The ID of the vehicle related to the event, if any.
 */
export const trackEvent = (eventType: string, vehicleId?: number): void => {
    // Explicitly construct the object to avoid potential issues with object spreading
    // and type inference, and to correctly handle vehicleId if it is 0.
    const eventData: AnalyticsEventInsert = {
        event_type: eventType,
    };
    if (vehicleId !== undefined) {
        eventData.vehicle_id = vehicleId;
    }

    supabase
        .from('analytics_events')
        .insert([eventData])
        .then(({ error }) => {
            if (error) {
                console.error('Analytics Error:', error);
            }
        });
};