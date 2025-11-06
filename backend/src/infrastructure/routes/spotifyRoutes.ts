import { SpotifyAdapter } from "../adapter/output/SpotifyAdapter";
import { SpotifyController } from "../adapter/input/controllers/SpotifyController";
import { SpotifyService } from "../../application/services/SpotifyService";
import express from "express";
import { getTokenRepository } from "../config/TokenDependencyConfig";

const router = express.Router();

const spotifyAdapter = new SpotifyAdapter();
const tokenRepository = getTokenRepository();
const spotifyService = new SpotifyService(spotifyAdapter, tokenRepository);
const spotifyController = new SpotifyController(spotifyService);

router.get("/auth/spotify/callback", (req, res) => spotifyController.handleCallback(req, res));
router.get("/auth/spotify/login", (req, res) => spotifyController.initiateLogin(req, res));
router.get("/auth/spotify/loginStatus", (req, res) => spotifyController.getLogginStatus(req, res));
router.get("/auth/spotify/logout", (req, res) => spotifyController.logout(req, res));
router.get("/auth/spotify/accessToken", (req, res) => spotifyController.getAccessToken(req, res));

router.post("/spotify/setActiveDevice", (req, res) => spotifyController.setActiveDevice(req, res));

export default router;
