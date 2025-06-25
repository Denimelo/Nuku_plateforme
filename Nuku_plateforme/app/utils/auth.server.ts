import { redirect } from "@remix-run/node";
import { authTokenCookie } from "./session.server";

export async function requireUser(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await authTokenCookie.parse(cookieHeader);

  if (!token) {
    throw redirect("/login");
  }

  const response = await fetch("http://127.0.0.1:8000/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw redirect("/login");
  }

  const user = await response.json();
  return user;
}
