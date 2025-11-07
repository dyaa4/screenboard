import { EventsService } from "../../../../application/services/EventsService"
import { Request, Response } from "express"
import logger from "../../../../utils/logger"

export class EventsController {
    constructor(private eventsService: EventsService) { }

    async fetchICalEvents(req: Request, res: Response): Promise<void> {
        const timer = logger.startTimer('Fetch iCal Events');

        try {
            const { url } = req.query

            logger.info('iCal events fetch request', {
                url: typeof url === 'string' ? url.substring(0, 100) + '...' : url,
                userId: req.auth?.payload?.sub
            }, 'EventsController');

            if (!url || typeof url !== 'string') {
                logger.warn('iCal fetch missing or invalid URL', { urlType: typeof url }, 'EventsController');
                res.status(400).json({
                    error: 'Missing or invalid iCal URL',
                    message: 'Please provide a valid iCal feed URL',
                })
                return
            }

            logger.apiCall('External', 'iCal Feed', 'GET');
            const events = await this.eventsService.fetchICalEvents(url);

            logger.success('iCal events fetched successfully', {
                eventCount: events.length,
                url: url.substring(0, 50) + '...'
            }, 'EventsController');

            res.json(events);
            timer();
        } catch (error: any) {
            logger.error('iCal events fetch failed', error, 'EventsController');

            // Handle specific errors
            if (error.message?.includes('Invalid URL')) {
                res.status(400).json({
                    error: 'Invalid URL format',
                    message: error.message,
                })
                return
            }

            if (error.message?.includes('URL not found')) {
                res.status(404).json({
                    error: 'URL not found',
                    message: error.message,
                })
                return
            }

            if (error.message?.includes('Connection refused')) {
                res.status(503).json({
                    error: 'Connection refused',
                    message: error.message,
                })
                return
            }

            if (error.message?.includes('timeout')) {
                res.status(504).json({
                    error: 'Request timeout',
                    message: error.message,
                })
                return
            }

            res.status(500).json({
                error: 'Failed to fetch iCal feed',
                message: error.message || 'An unexpected error occurred',
            })
        }
    }
}
