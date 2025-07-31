import { createCookie } from "@remix-run/node";

export const authTokenCookie = createCookie("auth_token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 6, // 6 heures
});

export const userCookie = createCookie("user_data", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax", 
  path: "/",
  maxAge: 60 * 60 * 6, // 6 heures
});

// Helpers pour gérer les cookies
export async function createUserSession(token: string, userData: any, redirectTo: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": [
        await authTokenCookie.serialize(token),
        await userCookie.serialize(JSON.stringify(userData)),
      ].join(", "),
    },
  });
}

export async function getUserSession(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const [token, userDataString] = await Promise.all([
    authTokenCookie.parse(cookieHeader),
    userCookie.parse(cookieHeader),
  ]);

  if (!token || !userDataString) {
    return null;
  }

  try {
    const userData = JSON.parse(userDataString);
    return { token, user: userData };
  } catch {
    return null;
  }
}

export async function destroyUserSession(redirectTo: string = "/") {
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": [
        await authTokenCookie.serialize("", { maxAge: 0 }),
        await userCookie.serialize("", { maxAge: 0 }),
      ].join(", "),
    },
  });
}