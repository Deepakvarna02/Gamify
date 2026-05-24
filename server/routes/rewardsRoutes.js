import express from "express";
import {
  createBadge,
  listBadges,
  getBadge,
  awardBadge,
} from "../controllers/badgeController.js";

const router = express.Router();

// Public: list and get
router.get("/badges", listBadges);
router.get("/badges/:id", getBadge);

// Admin: create badge
router.post("/badges", async (req, res, next) => {
  try {
    // very small auth guard: require Admin role or permission
    const user = req.user || {};
    const canCreate = user.role === "Admin" || user.permissions?.canManageUsers;
    if (!canCreate) return res.status(403).json({ message: "Forbidden" });
    return createBadge(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Award a badge to a user (admin)
router.post("/badges/:id/award", async (req, res, next) => {
  try {
    const user = req.user || {};
    const canAward = user.role === "Admin" || user.permissions?.canManageUsers;
    if (!canAward) return res.status(403).json({ message: "Forbidden" });
    return awardBadge(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;
