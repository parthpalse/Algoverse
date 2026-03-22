import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { RefreshToken, hashRefreshToken } from "../models/RefreshToken.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: REFRESH_MS,
    path: "/",
  };
}

function accessPayload(user) {
  return { sub: user._id.toString(), email: user.email };
}

export async function register(req, res) {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName || "",
    });
    const accessToken = signAccessToken(accessPayload(user));
    const refreshRaw = signRefreshToken({ sub: user._id.toString(), jti: cryptoRandom() });
    const expiresAt = new Date(Date.now() + REFRESH_MS);
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashRefreshToken(refreshRaw),
      expiresAt,
    });
    res.cookie(REFRESH_COOKIE, refreshRaw, cookieOptions());
    res.status(201).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
      },
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Registration failed" });
  }
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const accessToken = signAccessToken(accessPayload(user));
    const refreshRaw = signRefreshToken({ sub: user._id.toString(), jti: cryptoRandom() });
    const expiresAt = new Date(Date.now() + REFRESH_MS);
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashRefreshToken(refreshRaw),
      expiresAt,
    });
    res.cookie(REFRESH_COOKIE, refreshRaw, cookieOptions());
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
      },
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Login failed" });
  }
}

export async function refresh(req, res) {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) {
      return res.status(401).json({ message: "No refresh token" });
    }
    let decoded;
    try {
      decoded = verifyRefreshToken(raw);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const tokenHash = hashRefreshToken(raw);
    const doc = await RefreshToken.findOne({ tokenHash });
    if (!doc || doc.expiresAt < new Date()) {
      return res.status(401).json({ message: "Refresh token revoked or expired" });
    }
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    await RefreshToken.deleteOne({ _id: doc._id });
    const accessToken = signAccessToken(accessPayload(user));
    const refreshRaw = signRefreshToken({ sub: user._id.toString(), jti: cryptoRandom() });
    const expiresAt = new Date(Date.now() + REFRESH_MS);
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashRefreshToken(refreshRaw),
      expiresAt,
    });
    res.cookie(REFRESH_COOKIE, refreshRaw, cookieOptions());
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
      },
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Refresh failed" });
  }
}

export async function logout(req, res) {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (raw) {
      const tokenHash = hashRefreshToken(raw);
      await RefreshToken.deleteOne({ tokenHash });
    }
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(), maxAge: 0 });
    res.json({ ok: true });
  } catch {
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
    res.json({ ok: true });
  }
}
