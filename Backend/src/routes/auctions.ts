import { Router } from "express";
import { checkAuth } from "../middleware/checkAuth";
import * as AuctionController from "../controllers/auctions";

export const auctionsRouter = Router();

auctionsRouter.post("/auctions", checkAuth, AuctionController.createAuction);
auctionsRouter.get("/auctions", AuctionController.getAuctions);
auctionsRouter.get("/auctions/:id", AuctionController.getAuctionById);
