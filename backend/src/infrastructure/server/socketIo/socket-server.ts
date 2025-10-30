import { Server as HttpServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { AuthService } from "./auth.service"
import { SocketManager } from "./socket-manager.service"
import { SocketMiddleware } from "./socket.middleware"
import { AuthenticatedSocket } from "./types"

export class SocketServer {
    private io: SocketIOServer
    private socketManager: SocketManager
    private authService: AuthService
    private middleware: SocketMiddleware

    constructor(httpServer: HttpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
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
        console.log(
            "SocketIO: Client connected:",
            socket.id + " " + socket.user?.id
        )

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
            console.error("Socket error:", error)
        })
    }

    private handleCommunication(
        socket: AuthenticatedSocket,
        message: string
    ): void {
        try {
            console.log("Message received:", message)

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
            console.error("Error processing communication:", error)
            socket.emit("error", "An error occurred while processing your message")
        }
    }


    private handleRefreshDashboard(socket: AuthenticatedSocket, data: any): void {
        try {
            console.log("Refresh Dashboard event received:", data)

            // Beispiel: emit an alle Dashboards dieses Users
            const userIdWithoutAuth0 = socket.user?.id.replace("auth0|", "")
            const userIdDashboardId = `${userIdWithoutAuth0}-${data.dashboardId}`

            this.socketManager.emitToUserDashboard(
                userIdDashboardId,
                "refresh-dashboard",
                data
            )
        } catch (error) {
            console.error("Error processing refresh-dashboard:", error)
            socket.emit("error", "An error occurred while processing your refresh-dashboard event")
        }
    }

    private handleDisconnect(socket: AuthenticatedSocket): void {
        try {
            console.log(
                "SocketIO: Client disconnected:",
                socket.id + " " + socket.user?.id
            )
            this.socketManager.removeSocket(socket)
        } catch (error) {
            console.error("Error during disconnect:", error)
        }
    }
}