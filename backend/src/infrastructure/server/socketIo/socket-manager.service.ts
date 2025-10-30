import { Server as SocketIOServer } from "socket.io"
import { AuthenticatedSocket } from "./types"


export class SocketManager {
    private static instance: SocketManager
    private userSockets: Map<string, AuthenticatedSocket[]>
    private io: SocketIOServer

    private constructor(io: SocketIOServer) {
        this.io = io
        this.userSockets = new Map()
    }

    public static initialize(io: SocketIOServer): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager(io)
        }
        return SocketManager.instance
    }

    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            throw new Error('SocketManager must be initialized with IO server first')
        }
        return SocketManager.instance
    }

    public addSocket(socket: AuthenticatedSocket): void {
        if (!socket.user?.id) return

        if (!this.userSockets.has(socket.user.id)) {
            this.userSockets.set(socket.user.id, [])
        }
        this.userSockets.get(socket.user.id)?.push(socket)
    }

    public removeSocket(socket: AuthenticatedSocket): void {
        if (!socket.user?.id) return

        const sockets = this.userSockets.get(socket.user.id)
        if (sockets) {
            const index = sockets.indexOf(socket)
            if (index !== -1) {
                sockets.splice(index, 1)
            }
            if (sockets.length === 0) {
                this.userSockets.delete(socket.user.id)
            }
        }
    }

    public emitToUserDashboard(
        userIdDashboardId: string,
        event: string,
        data: any
    ): void {
        const [userId, dashboardId] = userIdDashboardId.split("-")

        this.io.sockets.sockets.forEach((socket: any) => {
            const socketUserId = socket.user?.id.split("|")[1]
            const socketDashboardId = socket.user?.dashboardId

            if (socketUserId === userId && socketDashboardId === dashboardId) {
                socket.emit(event, data)
            }
        })
    }
}

// Export the function that uses the singleton instance
export const emitToUserDashboard = (
    userIdDashboardId: string,
    event: string,
    data: any
): void => {
    SocketManager.getInstance().emitToUserDashboard(userIdDashboardId, event, data)
}