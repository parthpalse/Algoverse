import jwt from "jsonwebtoken";

const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES = "7d";

export function signAccessToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign(payload, secret, { expiresIn: ACCESS_EXPIRES });
}

export function verifyAccessToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.verify(token, secret);
}

export function signRefreshToken(payload) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not set");
  return jwt.sign(payload, secret, { expiresIn: REFRESH_EXPIRES });
}

export function verifyRefreshToken(token) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not set");
  return jwt.verify(token, secret);
}
