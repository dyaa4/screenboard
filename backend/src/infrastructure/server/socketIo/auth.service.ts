import jwt from "jsonwebtoken"
import jwksClient, { JwksClient } from "jwks-rsa"
import { config } from "../../../config/config"
import logger from "../../../utils/logger"

export class AuthService {
    private client: JwksClient

    constructor() {
        this.client = jwksClient({
            jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`,
        })
    }

    private getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
        this.client.getSigningKey(header.kid, (err, key) => {
            if (err) {
                console.error("Error getting signing key:", err)
                return callback(err)
            }
            callback(null, key?.getPublicKey())
        })
    }

    public async verifyToken(token: string): Promise<jwt.JwtPayload> {
        return new Promise((resolve, reject) => {
            const options: jwt.VerifyOptions = {
                algorithms: ["RS256"],
                complete: false,
            }

            jwt.verify(token, this.getKey.bind(this), options, (err, decoded) => {
                if (err) {
                    if (err instanceof jwt.TokenExpiredError) {
                        logger.info("Token expired at", err.expiredAt)

                    } else {
                        logger.error("Token verification failed:", err)
                    }

                    return reject(err)
                }

                if (decoded && typeof decoded === "object" && "sub" in decoded) {
                    if (!decoded.sub) {
                        console.warn("No sub (user ID) found in decoded token")
                        return reject(new Error("Invalid token: No user ID"))
                    }
                    resolve(decoded as jwt.JwtPayload)
                } else {
                    reject(new Error("Invalid token structure"))
                }
            })
        })
    }
}
