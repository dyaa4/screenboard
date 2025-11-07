import { AuthenticatedSocket } from "./types"
import { AuthService } from "./auth.service"
import { TokenExpiredError } from "jsonwebtoken"
import logger from "../../../utils/logger"

export class SocketMiddleware {
    constructor(private authService: AuthService) { }

    public async authenticate(
        socket: AuthenticatedSocket,
        next: (err?: Error) => void
    ): Promise<void> {
        const token = socket.handshake.auth.token
        const dashboardId = socket.handshake.query.dashboardId

        if (!token) {
            logger.warn("SocketIO connection attempt without token",
                { socketId: socket.id }, 'SocketMiddleware')
            return next(new Error("Authentication error: No token provided"))
        }

        if (!dashboardId) {
            logger.warn("SocketIO connection attempt without dashboard ID",
                { socketId: socket.id }, 'SocketMiddleware')
            return next(new Error("Authentication error: No dashboard ID provided"))
        }

        try {
            const decoded = await this.authService.verifyToken(token)
            const userId = decoded.sub

            if (!userId) {
                logger.warn("No user ID found in decoded SocketIO token",
                    { socketId: socket.id, dashboardId }, 'SocketMiddleware')
                return next(new Error("Authentication error: No user ID in token"))
            }

            socket.user = {
                id: userId,
                dashboardId: dashboardId as string,
            }

            next()
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                logger.info("Token expired, disconnecting socket")
            } else {
                logger.error("Authentication error:", error as Error)
            }
            socket.emit("auth_error", "Authentication failed. Please log in again.")
            socket.disconnect(true)
        }
    }
}
