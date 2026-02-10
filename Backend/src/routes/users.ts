import { Router } from "express";
import { checkAuth } from "../middleware/checkAuth";
import * as UserController from "../controllers/users";

export const usersRouter = Router();

usersRouter.get("/users/me", checkAuth, UserController.getMe);
usersRouter.get("/users/bids", checkAuth, UserController.getMyBids);
usersRouter.get("/users/wins", checkAuth, UserController.getMyWins);
usersRouter.get("/users/auctions", checkAuth, UserController.getMyAuctions);
