import * as jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: string;
}

export function verifyAdminToken(request: NextRequest): AdminTokenPayload | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function requireAdmin(request: NextRequest): AdminTokenPayload {
  const admin = verifyAdminToken(request);
  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }
  return admin;
}
