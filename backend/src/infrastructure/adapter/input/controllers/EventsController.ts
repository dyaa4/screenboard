import { EventsService } from "../../../../application/services/EventsService"
import { Request, Response } from "express"

export class EventsController {
    constructor(private eventsService: EventsService) { }

    async fetchICalEvents(req: Request, res: Response): Promise<void> {
        const { url } = req.query

        if (!url || typeof url !== 'string') {
            res.status(400).json({
                error: 'Missing or invalid iCal URL',
                message: 'Please provide a valid iCal feed URL',
            })
            return
        }

        try {
            // Log request info for debugging
            const authHeader = req.headers.authorization
            console.log('[iCal Events] Request received:', {
                url,
                hasAuth: !!authHeader,
                authType: authHeader?.split(' ')[0],
            })

            const events = await this.eventsService.fetchICalEvents(url)
            res.json(events)
        } catch (error: any) {
            console.error('Error fetching iCal events:', error)

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
