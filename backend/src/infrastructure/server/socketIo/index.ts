import { Server as HttpServer } from "http"
import { SocketServer } from "./socket-server"

export const setupSocketIO = (httpServer: HttpServer): void => {
    new SocketServer(httpServer)
}



export { emitToUserDashboard } from "./socket-manager.service"