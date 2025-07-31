import { redirect } from "@remix-run/node";
import { authTokenCookie } from "./session.server";

const API_BASE_URL = "https://nuku-api.onrender.com/api/v1";

export async function requireUser(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await authTokenCookie.parse(cookieHeader);

  if (!token) {
    throw redirect("/login");
  }

  try {
    // Essayer de récupérer les données complètes de l'utilisateur
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Si le token n'est pas valide, on nettoie le cookie
      throw redirect("/login", {
        headers: {
          "Set-Cookie": await authTokenCookie.serialize("", { maxAge: 0 }),
        },
      });
    }

    const userData = await response.json();
    
    // Si l'endpoint /auth/me retourne les données complètes, on les utilise
    // Sinon, on utilise les données du cookie comme fallback
    const user = userData.user_id ? userData : JSON.parse(await userCookie.parse(cookieHeader) || "{}");
    
    return { user, token };
  } catch (error) {
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await authTokenCookie.serialize("", { maxAge: 0 }),
      },
    });
  }
}

export async function requireAdmin(request: Request) {
  const { user } = await requireUser(request);
  
  if (user.user_type !== "admin") {
    throw redirect("/dashboard");
  }
  
  return user;
}

export async function requireExpert(request: Request) {
  const { user } = await requireUser(request);
  
  if (user.user_type !== "expert") {
    throw redirect("/dashboard");
  }
  
  return user;
}

export async function requireEntrepreneur(request: Request) {
  const { user } = await requireUser(request);
  
  if (user.user_type !== "entrepreneur") {
    throw redirect("/dashboard");
  }
  
  return user;
}

export async function getUserFromRequest(request: Request) {
  try {
    return await requireUser(request);
  } catch {
    return null;
  }
}

export async function logout(request: Request) {
  return redirect("/", {
    headers: {
      "Set-Cookie": await authTokenCookie.serialize("", { maxAge: 0 }),
    },
  });
}