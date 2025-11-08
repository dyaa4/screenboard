import { Server as HttpServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { AuthService } from "./auth.service"
import { SocketManager } from "./socket-manager.service"
import { SocketMiddleware } from "./socket.middleware"
import { AuthenticatedSocket } from "./types"
import logger from "../../../utils/logger"

export class SocketServer {
    private io: SocketIOServer
    private socketManager: SocketManager
    private authService: AuthService
    private middleware: SocketMiddleware

    constructor(httpServer: HttpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: (origin, callback) => {
                    const allowedOrigins = [
                        'https://screen-board.com',
                        'https://www.screen-board.com',
                        'http://localhost:5000',
                        'http://localhost:3000',
                        'http://localhost:5173',
                    ]; if (!origin || allowedOrigins.includes(origin)) {
                        callback(null, true);
                    } else if (origin && (origin.includes('.replit.dev') || origin.includes('.repl.co') || origin.includes('.replit.app'))) {
                        callback(null, true);
                    } else {
                        callback(null, false);
                    }
                },
                methods: ["GET", "POST"],
                credentials: true,
            },
        })

        this.authService = new AuthService()
        this.socketManager = SocketManager.initialize(this.io)
        this.middleware = new SocketMiddleware(this.authService)

        this.initialize()
    }

    private initialize(): void {
        this.io.use((socket: AuthenticatedSocket, next) =>
            this.middleware.authenticate(socket, next)
        )

        this.io.on("connection", (socket: AuthenticatedSocket) => {
            this.handleConnection(socket)
        })
    }

    private handleConnection(socket: AuthenticatedSocket): void {
        logger.info('SocketIO client connected', {
            socketId: socket.id,
            userId: socket.user?.id,
            dashboardId: socket.user?.dashboardId
        }, 'SocketServer');

        this.socketManager.addSocket(socket)

        socket.on("communication", (message: string) => {
            this.handleCommunication(socket, message)
        })

        socket.on("refresh-dashboard", (data: any) => {
            this.handleRefreshDashboard(socket, data)
        })

        socket.on("disconnect", () => {
            this.handleDisconnect(socket)
        })

        socket.on("error", (error: Error) => {
            logger.error("SocketIO client error", error, 'SocketServer')
        })
    }

    private handleCommunication(
        socket: AuthenticatedSocket,
        message: string
    ): void {
        try {
            logger.debug('SocketIO communication message received', {
                socketId: socket.id,
                userId: socket.user?.id,
                messageLength: message.length
            }, 'SocketServer');

            if (socket.user?.id && socket.user?.dashboardId && socket.user?.dashboardId === "all") {
                // Send only to sockets belonging to this user
                const currentUserId = socket.user.id.replace("auth0|", "")

                this.io.sockets.sockets.forEach((clientSocket: any) => {
                    const socketUserId = clientSocket.user?.id?.split("|")[1]

                    // Only emit to sockets belonging to the current user
                    if (socketUserId === currentUserId) {
                        clientSocket.emit("communication-response", message)
                    }
                })
            } else if (socket.user?.id && socket.user?.dashboardId && socket.user?.dashboardId !== "all") {
                // Handle specific dashboard communication
                const userIdWithoutAuth0 = socket.user.id.replace("auth0|", "")
                const userIdDashboardId = `${userIdWithoutAuth0}-${socket.user.dashboardId}`
                this.socketManager.emitToUserDashboard(
                    userIdDashboardId,
                    "communication-response",
                    message
                )
            }
        } catch (error) {
            logger.error("Error processing SocketIO communication", error as Error, 'SocketServer')
            socket.emit("error", "An error occurred while processing your message")
        }
    }


    private handleRefreshDashboard(socket: AuthenticatedSocket, data: any): void {
        try {
            logger.debug('SocketIO refresh dashboard event received', {
                socketId: socket.id,
                userId: socket.user?.id,
                dashboardId: data?.dashboardId
            }, 'SocketServer');

            // Beispiel: emit an alle Dashboards dieses Users
            const userIdWithoutAuth0 = socket.user?.id.replace("auth0|", "")
            const userIdDashboardId = `${userIdWithoutAuth0}-${data.dashboardId}`

            this.socketManager.emitToUserDashboard(
                userIdDashboardId,
                "refresh-dashboard",
                data
            )
        } catch (error) {
            logger.error("Error processing refresh-dashboard event", error as Error, 'SocketServer')
            socket.emit("error", "An error occurred while processing your refresh-dashboard event")
        }
    }

    private handleDisconnect(socket: AuthenticatedSocket): void {
        try {
            logger.info('SocketIO client disconnected', {
                socketId: socket.id,
                userId: socket.user?.id,
                dashboardId: socket.user?.dashboardId
            }, 'SocketServer');
            this.socketManager.removeSocket(socket)
        } catch (error) {
            logger.error("Error during SocketIO disconnect", error as Error, 'SocketServer')
        }
    }
}