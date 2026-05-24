import Badge from "../models/Badge.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createBadge = async (req, res, next) => {
  try {
    const { name, slug, description, iconUrl, type, criteria } = req.body;
    const badge = await Badge.create({
      name,
      slug,
      description,
      iconUrl,
      type,
      criteria,
      createdBy: req.user?.id || null,
    });
    res.status(201).json(badge);
  } catch (err) {
    next(err);
  }
};

export const listBadges = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // DB not connected — return empty list so UI can function in degraded mode
      return res.json([]);
    }
    const badges = await Badge.find({}).sort({ createdAt: -1 }).lean();
    res.json(badges);
  } catch (err) {
    next(err);
  }
};

export const getBadge = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database unavailable" });
    }
    const badge = await Badge.findById(req.params.id).lean();
    if (!badge) return res.status(404).json({ message: "Badge not found" });
    res.json(badge);
  } catch (err) {
    next(err);
  }
};

export const awardBadge = async (req, res, next) => {
  try {
    const badgeId = req.params.id;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database unavailable" });
    }

    const badge = await Badge.findById(badgeId).lean();
    if (!badge) return res.status(404).json({ message: "Badge not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // store badge by slug to keep simple and resilient to badge renames
    if (!user.badges) user.badges = [];
    if (!user.badges.includes(badge.slug)) {
      user.badges.push(badge.slug);
      await user.save();
    }

    // Optionally: return updated user
    return res.json({ message: "Badge awarded", badge: badge.slug, userId: user.id });
  } catch (err) {
    next(err);
  }
};
