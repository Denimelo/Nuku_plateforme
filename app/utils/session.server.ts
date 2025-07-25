import { createCookie } from "@remix-run/node";

export const authTokenCookie = createCookie("auth_token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 6, // 6 heures
});
