import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
  sub: string;
  role: "ADMIN" | "USER";
}

export const signToken = (p: TokenPayload) =>
  jwt.sign(p, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] });

export const verifyToken = (t: string) => jwt.verify(t, env.JWT_SECRET) as TokenPayload & jwt.JwtPayload;
