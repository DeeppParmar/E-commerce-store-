import { Router } from "express";
import { checkAuth } from "../middleware/checkAuth";
import * as BidController from "../controllers/bids";

export const bidsRouter = Router();

bidsRouter.post("/bids", checkAuth, BidController.placeBid);
