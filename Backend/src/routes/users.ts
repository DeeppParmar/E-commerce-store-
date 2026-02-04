import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { User } from "../models/User";
import { HttpError } from "../utils/httpError";

export const usersRouter = Router();

usersRouter.get("/users/me", requireAuth, async (req, res, next) => {
  try {
    const id = req.user?.id;
    if (!id) throw new HttpError(401, "Unauthorized");

    const user = await User.findById(id);
    if (!user) throw new HttpError(404, "User not found");

    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});
